# Digital Ocean Deployment Guide

This guide will help you deploy the Astro-BSM Portal application to Digital Ocean using App Platform or Droplets.

## Prerequisites

- Digital Ocean account
- Domain name (optional but recommended)
- GitHub repository access

## Option 1: Digital Ocean App Platform (Recommended)

### Step 1: Prepare Environment Variables

Create the following environment variables in Digital Ocean App Platform:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://username:password@host:port/database
POSTGRES_HOST=your-db-host
POSTGRES_PORT=5432
POSTGRES_DB=astro_bsm_portal
POSTGRES_USER=your-username
POSTGRES_PASSWORD=your-password
SESSION_SECRET=your-secret-key-here
CORS_ORIGIN=https://your-domain.com
```

### Step 2: Create App Platform Application

1. Log in to Digital Ocean Dashboard
2. Go to "Apps" and click "Create App"
3. Connect your GitHub repository: `https://github.com/astrobsm/astroportal.git`
4. Configure the application:

**Web Service (Frontend):**
- Source: Repository root
- Build Command: `npm run build`
- Run Command: `npm run preview`
- Environment Variables: Add all the variables listed above
- Port: 4173

**Backend Service:**
- Source: `/server`
- Build Command: `npm install`
- Run Command: `npm start`
- Environment Variables: Add all the variables listed above
- Port: 3001

**Database:**
- Type: PostgreSQL
- Plan: Basic ($7/month minimum)
- Create database: `astro_bsm_portal`

### Step 3: Configure Build Settings

Add to your app.yaml (or configure in DO interface):

```yaml
name: astro-bsm-portal
services:
- name: frontend
  source_dir: /
  github:
    repo: astrobsm/astroportal
    branch: main
  run_command: npm run preview
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 4173
  
- name: backend
  source_dir: /server
  github:
    repo: astrobsm/astroportal
    branch: main
  run_command: npm start
  build_command: npm install
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3001

databases:
- name: postgres-db
  engine: PG
  version: "14"
  size: db-s-1vcpu-1gb
```

## Option 2: Digital Ocean Droplet (Manual Setup)

### Step 1: Create Droplet

1. Create Ubuntu 22.04 droplet (minimum $12/month for 2GB RAM)
2. Add SSH key for secure access
3. Connect to droplet via SSH

### Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 3: Setup Database

```bash
# Switch to postgres user
sudo -i -u postgres

# Create database and user
createdb astro_bsm_portal
createuser --interactive --pwprompt astro_user

# Grant privileges
psql
GRANT ALL PRIVILEGES ON DATABASE astro_bsm_portal TO astro_user;
\q
exit
```

### Step 4: Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/astrobsm/astroportal.git
sudo chown -R $USER:$USER astroportal
cd astroportal

# Install dependencies
npm install
cd server && npm install && cd ..

# Build frontend
npm run build

# Setup environment variables
cp .env.production .env
nano .env  # Edit with your production values

# Setup database
cd server
npm run migrate  # Run your database migrations
cd ..
```

### Step 5: Configure PM2

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'astro-backend',
      script: 'server/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'astro-frontend',
      script: 'npm',
      args: 'run preview',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 4173
      }
    }
  ]
}
EOF

# Start applications
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 6: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/astro-bsm
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/astro-bsm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Post-Deployment Steps

### 1. Database Migration

```bash
# Run database migrations
cd /var/www/astroportal/server
npm run migrate

# Import sample data (if needed)
psql -U astro_user -d astro_bsm_portal -f database/add-content-sections.sql
```

### 2. Test Application

- Visit your domain to test frontend
- Test admin login functionality
- Verify database connections
- Test image uploads
- Check API endpoints

### 3. Monitoring Setup

```bash
# Setup log monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# Monitor applications
pm2 monit
pm2 logs
```

### 4. Backup Strategy

```bash
# Database backup script
cat > /home/$USER/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +"%Y%m%d_%H%M%S")
pg_dump -U astro_user astro_bsm_portal > /home/$USER/backups/astro_db_$DATE.sql
find /home/$USER/backups -name "astro_db_*.sql" -mtime +7 -delete
EOF

chmod +x /home/$USER/backup-db.sh

# Setup daily backup cron
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$USER/backup-db.sh") | crontab -
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3001 and 4173 are available
2. **Database connection**: Check PostgreSQL credentials and network access
3. **File permissions**: Ensure proper ownership of application files
4. **Environment variables**: Verify all required env vars are set

### Useful Commands

```bash
# Check application status
pm2 status
pm2 logs astro-backend
pm2 logs astro-frontend

# Restart applications
pm2 restart all

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check database
sudo -u postgres psql astro_bsm_portal
```

## Security Considerations

1. **Firewall**: Configure UFW to only allow necessary ports
2. **Database**: Use strong passwords and limit network access
3. **SSL**: Always use HTTPS in production
4. **Updates**: Regular system and dependency updates
5. **Backups**: Automated daily backups
6. **Monitoring**: Set up monitoring and alerting

## Performance Optimization

1. **Static files**: Serve static files through Nginx
2. **Caching**: Implement Redis for session storage
3. **CDN**: Use Digital Ocean Spaces for file storage
4. **Database**: Optimize PostgreSQL queries and indexes
5. **Monitoring**: Use PM2 monitoring for performance insights