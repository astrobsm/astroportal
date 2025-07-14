# Single-Server Deployment Script for Astro BSM Portal (PowerShell)
# This script deploys the application as a single full-stack server

param(
    [switch]$SkipBuild
)

Write-Host "🚀 Starting Astro BSM Portal Single-Server Deployment..." -ForegroundColor Green

# Function to print colored output
function Write-Info {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

try {
    # Check if .env file exists
    if (-not (Test-Path ".env")) {
        Write-Warning ".env file not found. Creating from .env.production template..."
        if (Test-Path ".env.production") {
            Copy-Item ".env.production" ".env"
            Write-Warning "Please edit .env file with your actual values before proceeding!"
            exit 1
        } else {
            Write-Error ".env.production template not found!"
            exit 1
        }
    }

    Write-Info "Environment file found ✓"

    # Check if Docker is running
    try {
        docker --version | Out-Null
        Write-Info "Docker is available ✓"
    } catch {
        Write-Error "Docker is not running or not installed!"
        exit 1
    }

    # Check if Docker Compose is available
    try {
        docker-compose --version | Out-Null
        Write-Info "Docker Compose is available ✓"
    } catch {
        Write-Error "Docker Compose is not available!"
        exit 1
    }

    if (-not $SkipBuild) {
        # Build the application
        Write-Info "Installing dependencies..."
        npm install

        Write-Info "Building the application..."
        npm run build

        Write-Info "Application built successfully ✓"
    } else {
        Write-Info "Skipping build step..."
    }

    # Start with Docker Compose
    Write-Info "Starting services with Docker Compose..."

    # Stop any existing containers
    docker-compose down

    # Build and start services
    docker-compose up --build -d

    Write-Info "Waiting for services to start..."
    Start-Sleep -Seconds 10

    # Check if services are running
    $services = docker-compose ps
    if ($services -match "Up") {
        Write-Info "✅ Deployment successful!"
        Write-Host ""
        Write-Info "🌐 Application is running at:"
        Write-Info "   - Main App: http://localhost:3001"
        Write-Info "   - API Health: http://localhost:3001/api/health"
        Write-Host ""
        Write-Info "📊 Service status:"
        docker-compose ps
        Write-Host ""
        Write-Info "📝 View logs with: docker-compose logs -f"
        Write-Info "🛑 Stop services with: docker-compose down"
    } else {
        Write-Error "❌ Deployment failed!"
        Write-Error "Check logs with: docker-compose logs"
        exit 1
    }

    Write-Host ""
    Write-Info "🎉 Deployment completed successfully!"

} catch {
    Write-Error "An error occurred during deployment: $($_.Exception.Message)"
    exit 1
}
