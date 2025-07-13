# Astro-BSM Portal

A comprehensive web-based platform for wound care business management, built with React, Node.js, and PostgreSQL. The platform features customer order management, notification systems, online and offline capabilities, and responsive design.

## 🚀 Features

### Core Features
- **Customer Order Management**: Complete order placement and tracking system
- **Real-time Notifications**: Instant notifications for new orders and updates
- **Online/Offline Capabilities**: Works seamlessly online and offline with data synchronization
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Admin Dashboard**: Comprehensive management interface for orders, customers, and products

### Technical Features
- **Progressive Web App (PWA)**: Installable on devices with offline support
- **IndexedDB Storage**: Local data storage for offline functionality
- **Service Worker**: Background synchronization and caching
- **Real-time Data Sync**: Automatic synchronization when connection is restored
- **PostgreSQL Database**: Robust and scalable database solution

## 🎨 Design

The platform uses a professional color scheme:
- **Primary Green**: #2d5a27
- **Golden Yellow**: #ffd700
- **Pure White**: #ffffff
- **Alert Red**: #dc3545

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI library with hooks
- **React Router**: Client-side routing
- **Vite**: Fast build tool and development server
- **Dexie**: IndexedDB wrapper for offline storage
- **Lucide React**: Modern icon library
- **React Toastify**: Toast notifications

### Backend
- **Node.js**: Server runtime
- **Express**: Web application framework
- **PostgreSQL**: Primary database
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### DevOps & Deployment
- **Git**: Version control
- **GitHub**: Repository hosting
- **DigitalOcean**: Cloud hosting platform
- **GitHub Actions**: CI/CD pipeline

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager
- Git

## 🚀 Installation & Setup

### Quick Setup (Recommended)

We've provided helper scripts for easy setup:

**Windows (PowerShell)**:
```powershell
.\setup.ps1
```

**Windows (Command Prompt)**:
```cmd
setup.bat
```

**Manual Setup**:
```bash
node verify-setup.js  # Check project structure
npm install           # Install dependencies
```

### Manual Installation

### 1. Clone or Download the Repository

If you received this as a zip file, extract it to your desired location.
If you have a Git repository:

```bash
git clone https://github.com/yourusername/astro-bsm-portal.git
cd astro-bsm-portal
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend and backend)
npm install
```

### 3. Database Setup

1. **Install PostgreSQL** (if not already installed):
   - Download from: https://www.postgresql.org/download/
   - Install with default settings
   - Remember your password for the 'postgres' user

2. **Create Database**:
   ```sql
   CREATE DATABASE astro_bsm_portal;
   ```

3. **Run Database Schema**:
   ```bash
   psql -U postgres -d astro_bsm_portal -f server/database/schema.sql
   ```

4. **Configure Environment Variables**:
   - Edit `server/.env` with your database credentials
   - Default values should work for local development
   - Change `DB_PASSWORD` to match your PostgreSQL password

### 4. Start the Application

#### Option 1: Start Everything Together
```bash
npm run dev:full
```

#### Option 2: Start Services Separately

**Terminal 1 - Backend Server**:
```bash
npm run server
```

**Terminal 2 - Frontend Development Server**:
```bash
npm run dev
```

#### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3000/admin-dashboard

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run build` | Build frontend for production |
| `npm run server` | Start backend server |
| `npm run dev:full` | Start both frontend and backend |
| `npm run preview` | Preview production build |
| `node verify-setup.js` | Verify project setup |

## 📱 Progressive Web App (PWA)

This application is a fully functional PWA that can be installed on devices:

1. **Desktop**: Look for the install icon in your browser's address bar
2. **Mobile**: Use your browser's "Add to Home Screen" option
3. **Offline Support**: The app works offline and syncs when reconnected

## 📱 Usage Guide

### For Customers

1. **Place Orders**:
   - Navigate to "Place Order"
   - Select products and quantities
   - Enter customer information
   - Choose delivery method
   - Review and submit order

2. **Track Orders**:
   - Go to "My Orders"
   - Enter email address
   - View order history and status

### For Administrators

1. **Access Admin Dashboard**:
   - Navigate to "Admin Dashboard"
   - View overview statistics
   - Manage orders, customers, and notifications

2. **Order Management**:
   - View all orders
   - Update order status
   - Filter and search orders

3. **Customer Management**:
   - View customer information
   - Track customer order history

## 🔧 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `GET /api/customers/email/:email` - Get customer by email
- `POST /api/customers` - Create/update customer

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/customer/:customerId` - Get orders by customer
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order

### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `GET /api/notifications/unread-count` - Get unread count

## 🌐 Deployment

### GitHub Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Setup GitHub Actions** (optional):
   - Configure workflows in `.github/workflows/`
   - Set up environment secrets

### DigitalOcean Deployment

1. **Create Droplet**:
   - Ubuntu 20.04 LTS
   - Install Node.js and PostgreSQL

2. **Deploy Application**:
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/astro-bsm-portal.git
   cd astro-bsm-portal
   
   # Install dependencies
   npm install
   cd server && npm install && cd ..
   
   # Setup database
   sudo -u postgres psql -c "CREATE DATABASE astro_bsm_portal;"
   sudo -u postgres psql -d astro_bsm_portal -f server/database/schema.sql
   
   # Configure environment
   cp server/.env.example server/.env
   # Edit server/.env with production values
   
   # Build and start
   npm run build
   npm run server
   ```

3. **Setup Process Manager** (PM2):
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name "astro-bsm-portal"
   pm2 startup
   pm2 save
   ```

## 🔒 Security Features

- Environment variable configuration
- CORS protection
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- Rate limiting capabilities
- Secure password hashing (ready for authentication)

## 📊 Database Schema

### Tables
- **customers**: Customer information and contact details
- **products**: Product catalog with pricing and categories
- **orders**: Order records with JSON product details
- **notifications**: System and order notifications

### Key Features
- Foreign key constraints
- Indexes for performance optimization
- Automatic timestamp updates
- JSON storage for flexible product data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@astro-bsm.com
- Phone: +1 (555) 123-4567
- Address: 123 Healthcare Ave, Medical City, MC 12345

## 🙏 Acknowledgments

- React Team for the amazing framework
- PostgreSQL Community for the robust database
- All contributors and healthcare professionals who inspired this project

---

Built with ❤️ for healthcare professionals by the Astro-BSM team.
