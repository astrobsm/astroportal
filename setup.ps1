# Astro-BSM Portal Automated Setup Script
# This script automates the complete setup process including database configuration

param(
    [string]$DbPassword = "natiss_natiss",
    [string]$DbUser = "postgres",
    [string]$DbName = "astro_bsm_portal",
    [switch]$SkipDatabase = $false,
    [switch]$StartServices = $false
)

Write-Host "🚀 Astro-BSM Portal Automated Setup Script" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the correct directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

# Function to check if a command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

if (!(Test-CommandExists "node")) {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

if (!(Test-CommandExists "npm")) {
    Write-Host "❌ npm not found. Please install Node.js with npm from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green

# Check PostgreSQL
$psqlExists = Test-CommandExists "psql"
if (!$psqlExists -and !$SkipDatabase) {
    Write-Host "⚠️  PostgreSQL not found in PATH. Database setup will be skipped." -ForegroundColor Yellow
    Write-Host "   Please install PostgreSQL from https://www.postgresql.org/download/" -ForegroundColor Yellow
    $SkipDatabase = $true
}

Write-Host ""
Write-Host "📦 Installing npm dependencies..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    } else {
        throw "npm install failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host "❌ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check your npm installation and try again." -ForegroundColor Yellow
    exit 1
}

# Database Setup
if (!$SkipDatabase) {
    Write-Host ""
    Write-Host "�️  Setting up PostgreSQL database..." -ForegroundColor Yellow
    
    # Test PostgreSQL connection
    Write-Host "Testing PostgreSQL connection..." -ForegroundColor Cyan
    $env:PGPASSWORD = $DbPassword
    
    try {
        $testConnection = psql -U $DbUser -h localhost -c "SELECT version();" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Cannot connect to PostgreSQL. Please check:" -ForegroundColor Red
            Write-Host "   - PostgreSQL is running" -ForegroundColor Yellow
            Write-Host "   - Username '$DbUser' exists" -ForegroundColor Yellow
            Write-Host "   - Password is correct" -ForegroundColor Yellow
            Write-Host "   - Use -DbPassword parameter if different" -ForegroundColor Yellow
            $SkipDatabase = $true
        } else {
            Write-Host "✅ PostgreSQL connection successful" -ForegroundColor Green
            
            # Check if database exists
            $dbExists = psql -U $DbUser -h localhost -lqt | Select-String -Pattern $DbName
            if (!$dbExists) {
                Write-Host "Creating database '$DbName'..." -ForegroundColor Cyan
                $createDb = psql -U $DbUser -h localhost -c "CREATE DATABASE $DbName;" 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Database '$DbName' created successfully" -ForegroundColor Green
                } else {
                    Write-Host "❌ Failed to create database: $createDb" -ForegroundColor Red
                    $SkipDatabase = $true
                }
            } else {
                Write-Host "✅ Database '$DbName' already exists" -ForegroundColor Green
            }
            
            # Import schema if database setup was successful
            if (!$SkipDatabase) {
                Write-Host "Importing database schema..." -ForegroundColor Cyan
                if (Test-Path "server/database/schema.sql") {
                    $importSchema = psql -U $DbUser -h localhost -d $DbName -f "server/database/schema.sql" 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "✅ Database schema imported successfully" -ForegroundColor Green
                    } else {
                        Write-Host "⚠️  Schema import had issues (this may be normal if tables already exist)" -ForegroundColor Yellow
                        Write-Host "$importSchema" -ForegroundColor Gray
                    }
                } else {
                    Write-Host "❌ Schema file not found at server/database/schema.sql" -ForegroundColor Red
                }
            }
        }
    } catch {
        Write-Host "❌ Database setup failed: $($_.Exception.Message)" -ForegroundColor Red
        $SkipDatabase = $true
    } finally {
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    }
}

# Configure environment variables
Write-Host ""
Write-Host "⚙️  Configuring environment..." -ForegroundColor Yellow

if (Test-Path "server/.env") {
    Write-Host "✅ Environment file already exists" -ForegroundColor Green
} else {
    if (Test-Path "server/.env.example") {
        Copy-Item "server/.env.example" "server/.env"
        Write-Host "✅ Created .env from template" -ForegroundColor Green
    } else {
        Write-Host "❌ No .env.example template found" -ForegroundColor Red
    }
}

# Update database password in .env if it was changed
if ($DbPassword -ne "natiss_natiss" -and (Test-Path "server/.env")) {
    Write-Host "Updating database password in .env..." -ForegroundColor Cyan
    $envContent = Get-Content "server/.env" -Raw
    $envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$DbPassword"
    $envContent = $envContent -replace "DB_USER=.*", "DB_USER=$DbUser"
    $envContent = $envContent -replace "DB_NAME=.*", "DB_NAME=$DbName"
    Set-Content "server/.env" $envContent
    Write-Host "✅ Environment variables updated" -ForegroundColor Green
}

Write-Host ""
Write-Host "�🔍 Running setup verification..." -ForegroundColor Yellow
try {
    node verify-setup.js
} catch {
    Write-Host "❌ Setup verification failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green

if ($SkipDatabase) {
    Write-Host ""
    Write-Host "⚠️  DATABASE SETUP WAS SKIPPED" -ForegroundColor Yellow
    Write-Host "To set up the database manually:" -ForegroundColor Yellow
    Write-Host "1. Install PostgreSQL from https://www.postgresql.org/download/" -ForegroundColor Cyan
    Write-Host "2. Run: psql -U postgres -c `"CREATE DATABASE $DbName;`"" -ForegroundColor Cyan
    Write-Host "3. Run: psql -U postgres -d $DbName -f server/database/schema.sql" -ForegroundColor Cyan
    Write-Host "4. Update server/.env with your database credentials" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🚀 Available commands:" -ForegroundColor Yellow
Write-Host "  npm run dev        - Start frontend development server" -ForegroundColor Cyan
Write-Host "  npm run server     - Start backend server" -ForegroundColor Cyan
Write-Host "  npm run dev:full   - Start both frontend and backend" -ForegroundColor Cyan
Write-Host "  npm run build      - Build for production" -ForegroundColor Cyan

if ($StartServices) {
    Write-Host ""
    Write-Host "🔄 Starting development servers..." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop the servers" -ForegroundColor Gray
    
    # Start the servers in a new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev:full"
    Write-Host "✅ Servers started in new window" -ForegroundColor Green
    
    # Wait a moment for servers to start up
    Write-Host "⏳ Waiting for servers to start up..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    
    # Test if the frontend is responding
    $frontendUrl = "http://localhost:3000"
    $maxAttempts = 10
    $attempt = 0
    $serverReady = $false
    
    Write-Host "🔍 Checking if servers are ready..." -ForegroundColor Cyan
    
    while ($attempt -lt $maxAttempts -and !$serverReady) {
        try {
            $response = Invoke-WebRequest -Uri $frontendUrl -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $serverReady = $true
                Write-Host "✅ Frontend server is ready!" -ForegroundColor Green
            }
        } catch {
            # Server not ready yet
            $attempt++
            if ($attempt -lt $maxAttempts) {
                Write-Host "⏳ Attempt $attempt/$maxAttempts - waiting for frontend..." -ForegroundColor Gray
                Start-Sleep -Seconds 2
            }
        }
    }
    
    if ($serverReady) {
        Write-Host "🌐 Opening application in your default browser..." -ForegroundColor Yellow
        Start-Process $frontendUrl
        Write-Host "✅ Application opened at $frontendUrl" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "🎉 Success! Your Astro-BSM Portal is now running!" -ForegroundColor Green
        Write-Host "📱 The application should have opened in your browser" -ForegroundColor Cyan
        Write-Host "🔧 Backend API is available at http://localhost:3001" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  Servers are starting but may need more time" -ForegroundColor Yellow
        Write-Host "🌐 Please visit $frontendUrl manually in a few moments" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "💡 Pro tip: Bookmark $frontendUrl for easy access!" -ForegroundColor Gray
}
