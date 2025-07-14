# Astro BSM Portal - Single Server Deployment

## Overview

The Astro BSM Portal has been successfully modified to run as a **single full-stack server** where the backend serves both the API and the frontend files. This simplifies deployment and reduces the complexity of running multiple services.

## Architecture Changes

### Before (Multi-Server)
- **Frontend**: Separate Vite dev server (port 5173)
- **Backend**: Express server (port 3001)
- **Deployment**: Required nginx reverse proxy to coordinate both services

### After (Single Server)
- **Backend serves Frontend**: Express server serves built React files from `/dist`
- **All traffic**: Single port 3001 handles both frontend and API requests
- **Simplified routing**: API endpoints at `/api/*`, frontend served for all other routes

## Key Benefits

✅ **Simplified deployment** - Only one server to manage  
✅ **Reduced complexity** - No need for complex nginx routing  
✅ **Better resource usage** - Single Node.js process  
✅ **Easier CORS handling** - Same origin for frontend and API  
✅ **Production ready** - Optimized build with chunking and caching  

## How It Works

1. **Build Process**: `npm run build` creates optimized frontend files in `/dist`
2. **Static Serving**: Express serves React files from `/dist` directory
3. **API Routes**: All `/api/*` requests handled by Express routes
4. **Catch-all Route**: Non-API requests serve the React app (for client-side routing)
5. **Uploads**: Static files served from `/uploads` directory

## Quick Start

### Development Mode
```bash
# Run frontend and backend separately (development)
npm run dev:full
```

### Production Mode (Single Server)
```bash
# Build and run as single server
npm run start
```

### Docker Deployment
```bash
# Using Docker Compose
docker-compose up --build -d

# Or using deployment script
./deploy-single-server.ps1  # Windows
./deploy-single-server.sh   # Linux/Mac
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server only |
| `npm run build` | Build frontend for production |
| `npm run server` | Start backend server only |
| `npm run dev:full` | Start both frontend and backend (dev mode) |
| `npm run start` | **Build frontend + start single server** |
| `npm run build:full` | **Build frontend + start single server** |

## Environment Configuration

### Development
- Uses `http://localhost:3001` for API calls when in dev mode
- Vite proxy handles API requests during development

### Production
- Uses relative `/api` paths since frontend is served from same origin
- Single server handles all requests

## File Structure Changes

### Modified Files
- **`server/index.js`**: Added static file serving and catch-all route
- **`src/services/apiService.js`**: Dynamic API URL based on environment
- **`package.json`**: Added `start` and `build:full` scripts
- **`vite.config.js`**: Optimized build configuration
- **`Dockerfile`**: Simplified single-stage build
- **`docker-compose.yml`**: Single app service instead of separate frontend/backend

### New Files
- **`deploy-single-server.sh`**: Linux/Mac deployment script
- **`deploy-single-server.ps1`**: Windows PowerShell deployment script

## API Endpoints

All API endpoints remain the same but are now served from the single server:

- **Health Check**: `GET /api/health`
- **Products**: `GET /api/products`
- **Orders**: `POST /api/orders`
- **Admin**: `POST /api/admin/login`
- **Uploads**: `GET /uploads/*`
- **Frontend**: `GET /*` (all other routes)

## Deployment Options

### 1. Local Development
```bash
npm run start
```
Visit: http://localhost:3001

### 2. Docker Compose
```bash
docker-compose up --build -d
```
- **App**: http://localhost:3001
- **Database**: PostgreSQL on port 5432
- **Optional Nginx**: http://localhost:80 (with `--profile production`)

### 3. Digital Ocean App Platform
Deploy using the existing `deploy-digitalocean.sh` script with the new configuration.

### 4. Manual Server Deployment
1. Upload code to server
2. Install dependencies: `npm install`
3. Build frontend: `npm run build`
4. Set environment variables
5. Start server: `npm run server`

## Environment Variables

```bash
NODE_ENV=production
POSTGRES_HOST=localhost
POSTGRES_DB=astro_bsm_portal
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
SESSION_SECRET=your-secret-key
PORT=3001
```

## Testing

### API Health Check
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/api/health"

# Curl (Linux/Mac)
curl http://localhost:3001/api/health
```

### Frontend Access
Open browser: http://localhost:3001

## Monitoring

### Service Status
```bash
# Docker logs
docker-compose logs -f

# Direct process (if running without Docker)
npm run server
```

### Health Checks
- **API**: http://localhost:3001/api/health
- **Database**: Connection tested on startup
- **Frontend**: Served at root path `/`

## Troubleshooting

### Common Issues

1. **Frontend shows 404**
   - Ensure `npm run build` was executed
   - Check that `/dist` directory exists

2. **API endpoints not working**
   - Verify server is running on port 3001
   - Check database connection

3. **Database connection issues**
   - Verify PostgreSQL is running
   - Check environment variables

### Logs
```bash
# Docker logs
docker-compose logs app

# Direct logs
Check console output when running npm run server
```

## Migration from Multi-Server

If migrating from the previous multi-server setup:

1. **Stop old services**: `docker-compose down`
2. **Update code**: Pull latest changes
3. **Rebuild**: `npm run build`
4. **Start new setup**: `docker-compose up --build -d`

## Performance

### Build Optimization
- **Code splitting**: Vendor and UI libraries separated
- **Compression**: Gzip compression enabled
- **Caching**: Static assets with cache headers
- **Minification**: Production builds minified

### Server Optimization
- **Connection pooling**: PostgreSQL connection pool
- **Static caching**: Uploads cached for 1 year
- **Health monitoring**: Built-in health checks

---

**🎉 Your Astro BSM Portal is now running as a unified single-server application!**

Access your application at: **http://localhost:3001**
