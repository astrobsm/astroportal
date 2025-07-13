# Astro-BSM Portal Troubleshooting Script

Write-Host ""
Write-Host "🔧 Astro-BSM Portal Troubleshooting" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Function to check if a command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Function to check if a port is in use
function Test-PortInUse {
    param($port)
    try {
        $listener = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()
        return $listener | Where-Object { $_.Port -eq $port }
    } catch {
        return $false
    }
}

Write-Host "🔍 System Diagnostics" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow

# Check Node.js
if (Test-CommandExists "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js: Not installed" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Cyan
}

# Check npm
if (Test-CommandExists "npm") {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm: Not installed" -ForegroundColor Red
}

# Check PostgreSQL
if (Test-CommandExists "psql") {
    try {
        $psqlVersion = psql --version
        Write-Host "✅ PostgreSQL: $psqlVersion" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  PostgreSQL: Installed but not responding" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ PostgreSQL: Not installed or not in PATH" -ForegroundColor Red
    Write-Host "   Run: .\install-postgresql.ps1" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📁 Project Structure" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow

# Check key files
$keyFiles = @(
    "package.json",
    "vite.config.js",
    "src/main.jsx",
    "src/App.jsx",
    "server/index.js",
    "server/.env"
)

foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

# Check node_modules
if (Test-Path "node_modules") {
    $packageCount = (Get-ChildItem "node_modules" -Directory).Count
    Write-Host "✅ node_modules ($packageCount packages)" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules (run: npm install)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🌐 Network Ports" -ForegroundColor Yellow
Write-Host "================" -ForegroundColor Yellow

# Check if ports are available
$frontendPort = 3000
$backendPort = 3001

if (Test-PortInUse $frontendPort) {
    Write-Host "⚠️  Port $frontendPort: In use (frontend may be running)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Port $frontendPort: Available" -ForegroundColor Green
}

if (Test-PortInUse $backendPort) {
    Write-Host "⚠️  Port $backendPort: In use (backend may be running)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Port $backendPort: Available" -ForegroundColor Green
}

Write-Host ""
Write-Host "🗄️  Database Connection" -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Yellow

if (Test-CommandExists "psql" -and (Test-Path "server/.env")) {
    # Try to read database config from .env
    $envContent = Get-Content "server/.env" -Raw
    $dbUser = ($envContent | Select-String "DB_USER=(.*)").Matches.Groups[1].Value
    $dbName = ($envContent | Select-String "DB_NAME=(.*)").Matches.Groups[1].Value
    
    if ($dbUser -and $dbName) {
        Write-Host "Testing database connection..." -ForegroundColor Cyan
        # Note: This would require password, so we'll just check if we can reach postgres
        try {
            $testResult = psql -U $dbUser -h localhost -c "SELECT 1;" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Database connection successful" -ForegroundColor Green
            } else {
                Write-Host "❌ Database connection failed" -ForegroundColor Red
                Write-Host "   Check username, password, and database exists" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "❌ Database connection test failed" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️  Cannot test database (PostgreSQL or .env missing)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Quick Fixes" -ForegroundColor Yellow
Write-Host "==============" -ForegroundColor Yellow

Write-Host "Common solutions:" -ForegroundColor Cyan
Write-Host "1. Install missing dependencies: npm install" -ForegroundColor Gray
Write-Host "2. Install PostgreSQL: .\install-postgresql.ps1" -ForegroundColor Gray
Write-Host "3. Restart PostgreSQL service: net start postgresql-x64-14" -ForegroundColor Gray
Write-Host "4. Check firewall: Allow ports 3000 and 3001" -ForegroundColor Gray
Write-Host "5. Full reset: rm -rf node_modules && npm install" -ForegroundColor Gray

Write-Host ""
Write-Host "📞 Getting Help" -ForegroundColor Yellow
Write-Host "===============" -ForegroundColor Yellow

Write-Host "If problems persist:" -ForegroundColor Cyan
Write-Host "1. Check the README.md for detailed instructions" -ForegroundColor Gray
Write-Host "2. Run setup with verbose output: .\setup.ps1 -Verbose" -ForegroundColor Gray
Write-Host "3. Check server logs in the terminal" -ForegroundColor Gray
Write-Host "4. Verify your system meets the prerequisites" -ForegroundColor Gray

Write-Host ""
Read-Host "Press Enter to continue"
