#!/bin/bash

# Single-Server Deployment Script for Astro BSM Portal
# This script deploys the application as a single full-stack server

set -e

echo "🚀 Starting Astro BSM Portal Single-Server Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.production template..."
    if [ -f ".env.production" ]; then
        cp .env.production .env
        print_warning "Please edit .env file with your actual values before proceeding!"
        exit 1
    else
        print_error ".env.production template not found!"
        exit 1
    fi
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("POSTGRES_PASSWORD" "SESSION_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in .env file"
        exit 1
    fi
done

print_status "Environment variables validated ✓"

# Build the application
print_status "Building the application..."
npm install
npm run build

print_status "Application built successfully ✓"

# Start with Docker Compose
print_status "Starting services with Docker Compose..."

# Stop any existing containers
docker-compose down

# Build and start services
docker-compose up --build -d

print_status "Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Deployment successful!"
    echo ""
    print_status "🌐 Application is running at:"
    print_status "   - Main App: http://localhost:3001"
    print_status "   - API Health: http://localhost:3001/api/health"
    echo ""
    print_status "📊 Service status:"
    docker-compose ps
    echo ""
    print_status "📝 View logs with: docker-compose logs -f"
    print_status "🛑 Stop services with: docker-compose down"
else
    print_error "❌ Deployment failed!"
    print_error "Check logs with: docker-compose logs"
    exit 1
fi

echo ""
print_status "🎉 Deployment completed successfully!"
