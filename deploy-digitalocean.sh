#!/bin/bash

# Astro-BSM Portal DigitalOcean Deployment Script
# This script sets up and deploys the Astro-BSM Portal on a DigitalOcean droplet

set -e

echo "🚀 Starting Astro-BSM Portal deployment..."

# Configuration
APP_NAME="astro-bsm-portal"
APP_DIR="/var/www/$APP_NAME"
DB_NAME="astro_bsm_portal"
DB_USER="postgres"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_status "Installing essential packages..."
sudo apt install -y curl wget git build-essential software-properties-common

# Install Node.js
print_status "Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
print_status "Node.js version: $node_version"
print_status "npm version: $npm_version"

# Install PostgreSQL
print_status "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

print_status "Configuring PostgreSQL..."
# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';"

# Create application database
sudo -u postgres createdb $DB_NAME 2>/dev/null || print_warning "Database $DB_NAME already exists"

# Install PM2 for process management
print_status "Installing PM2..."
sudo npm install -g pm2

# Create application directory
print_status "Setting up application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone repository
print_status "Cloning repository..."
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR
    git pull origin main
else
    git clone https://github.com/yourusername/astro-bsm-portal.git $APP_DIR
    cd $APP_DIR
fi

# Install dependencies
print_status "Installing application dependencies..."
npm install

cd server
npm install
cd ..

# Setup environment variables
print_status "Setting up environment configuration..."
if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    
    # Prompt for database password
    read -s -p "Enter PostgreSQL password for user '$DB_USER': " DB_PASSWORD
    echo
    
    # Update .env file
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" server/.env
    sed -i "s/NODE_ENV=development/NODE_ENV=production/" server/.env
    sed -i "s|FRONTEND_URL=http://localhost:3000|FRONTEND_URL=https://yourdomain.com|" server/.env
    
    print_status "Environment file created. Please review and update server/.env as needed."
fi

# Setup database schema
print_status "Setting up database schema..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f server/database/schema.sql

# Build frontend
print_status "Building frontend application..."
npm run build

# Setup nginx (optional)
read -p "Do you want to install and configure Nginx? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Installing and configuring Nginx..."
    sudo apt install -y nginx
    
    # Create nginx configuration
    sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Frontend
    location / {
        root $APP_DIR/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx configuration
    sudo nginx -t
    
    # Start nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    print_status "Nginx configured. Don't forget to update server_name in /etc/nginx/sites-available/$APP_NAME"
fi

# Setup SSL with Let's Encrypt (optional)
read -p "Do you want to install SSL certificate with Let's Encrypt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your domain name: " DOMAIN_NAME
    
    print_status "Installing Certbot..."
    sudo apt install -y certbot python3-certbot-nginx
    
    print_status "Obtaining SSL certificate..."
    sudo certbot --nginx -d $DOMAIN_NAME
    
    # Setup auto-renewal
    sudo systemctl enable certbot.timer
fi

# Start application with PM2
print_status "Starting application with PM2..."
cd $APP_DIR
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start server/index.js --name $APP_NAME

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup | tail -1 | sudo bash

# Setup firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create systemd service for automatic startup (alternative to PM2)
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/$APP_NAME.service > /dev/null <<EOF
[Unit]
Description=Astro-BSM Portal Node.js Application
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Enable service
sudo systemctl daemon-reload
sudo systemctl enable $APP_NAME.service

print_status "Creating update script..."
cat > $APP_DIR/update.sh << 'EOF'
#!/bin/bash
cd /var/www/astro-bsm-portal
git pull origin main
npm install
cd server && npm install && cd ..
npm run build
pm2 restart astro-bsm-portal
echo "Application updated successfully!"
EOF

chmod +x $APP_DIR/update.sh

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/$APP_NAME > /dev/null <<EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reload $APP_NAME
    endscript
}
EOF

# Create backup script
print_status "Creating backup script..."
cat > $APP_DIR/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/astro-bsm-portal"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U postgres astro_bsm_portal > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /var/www astro-bsm-portal --exclude=node_modules --exclude=.git

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x $APP_DIR/backup.sh

# Setup daily backup cron job
(crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/backup.sh") | crontab -

print_status "Deployment completed successfully! 🎉"
echo
echo "📋 Deployment Summary:"
echo "  • Application directory: $APP_DIR"
echo "  • Database: $DB_NAME"
echo "  • PM2 process: $APP_NAME"
echo "  • Frontend URL: http://$(curl -s ifconfig.me)"
echo "  • API URL: http://$(curl -s ifconfig.me):3001"
echo
echo "🔧 Next Steps:"
echo "  1. Update server/.env with your configuration"
echo "  2. Update Nginx server_name if using custom domain"
echo "  3. Configure DNS to point to this server"
echo "  4. Test the application"
echo
echo "📚 Useful Commands:"
echo "  • Update app: $APP_DIR/update.sh"
echo "  • Backup: $APP_DIR/backup.sh"
echo "  • View logs: pm2 logs $APP_NAME"
echo "  • Restart app: pm2 restart $APP_NAME"
echo "  • Check status: pm2 status"

print_status "Deployment script completed!"
