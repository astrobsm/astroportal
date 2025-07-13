# PostgreSQL Installation Helper for Astro-BSM Portal

Write-Host ""
Write-Host "🗄️  PostgreSQL Installation Helper" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL is already installed
if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-Host "✅ PostgreSQL is already installed!" -ForegroundColor Green
    $version = psql --version
    Write-Host "Version: $version" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now run the main setup script." -ForegroundColor Yellow
    exit 0
}

Write-Host "PostgreSQL is not installed. This script will help you install it." -ForegroundColor Yellow
Write-Host ""

# Check if Chocolatey is available (for automated installation)
$chocoAvailable = Get-Command choco -ErrorAction SilentlyContinue

if ($chocoAvailable) {
    Write-Host "Option 1: Install via Chocolatey (Automated)" -ForegroundColor Cyan
    Write-Host "Option 2: Download and install manually" -ForegroundColor Cyan
    Write-Host ""
    
    $choice = Read-Host "Choose installation method (1/2)"
    
    if ($choice -eq "1") {
        Write-Host ""
        Write-Host "Installing PostgreSQL via Chocolatey..." -ForegroundColor Yellow
        
        try {
            choco install postgresql --params '/Password:natiss_natiss' -y
            
            Write-Host ""
            Write-Host "✅ PostgreSQL installation completed!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Default credentials:" -ForegroundColor Yellow
            Write-Host "  Username: postgres" -ForegroundColor Cyan
            Write-Host "  Password: natiss_natiss" -ForegroundColor Cyan
            Write-Host "  Port: 5432" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Please restart your PowerShell/Command Prompt and run setup.ps1" -ForegroundColor Yellow
            
        } catch {
            Write-Host "❌ Chocolatey installation failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Please try manual installation." -ForegroundColor Yellow
        }
    }
}

if (!$chocoAvailable -or $choice -eq "2") {
    Write-Host ""
    Write-Host "Manual Installation Instructions:" -ForegroundColor Yellow
    Write-Host "=================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Visit: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host "2. Download the PostgreSQL installer" -ForegroundColor Cyan
    Write-Host "3. Run the installer with these settings:" -ForegroundColor Cyan
    Write-Host "   - Username: postgres" -ForegroundColor Gray
    Write-Host "   - Password: natiss_natiss (or remember your own)" -ForegroundColor Gray
    Write-Host "   - Port: 5432" -ForegroundColor Gray
    Write-Host "   - Make sure 'Add to PATH' is checked" -ForegroundColor Gray
    Write-Host "4. After installation, restart your terminal" -ForegroundColor Cyan
    Write-Host "5. Run setup.ps1 from the project directory" -ForegroundColor Cyan
    Write-Host ""
    
    $openBrowser = Read-Host "Open PostgreSQL download page? (Y/n)"
    if ($openBrowser -ne 'n' -and $openBrowser -ne 'N') {
        Start-Process "https://www.postgresql.org/download/windows/"
    }
}

Write-Host ""
Write-Host "After PostgreSQL is installed, you can run:" -ForegroundColor Yellow
Write-Host "  .\setup.ps1                    # Basic setup" -ForegroundColor Cyan
Write-Host "  .\setup.ps1 -StartServices     # Setup and start servers" -ForegroundColor Cyan
Write-Host "  .\start.ps1                    # One-click setup and launch" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to continue"
