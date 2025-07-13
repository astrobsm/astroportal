# Astro-BSM Portal - One-Click Setup and Launch Script

$Host.UI.RawUI.WindowTitle = "Astro-BSM Portal - One-Click Setup and Launch"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host " 🚀 Astro-BSM Portal - One-Click Setup and Launch" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host " ✓ Install all dependencies" -ForegroundColor Cyan
Write-Host " ✓ Set up the PostgreSQL database (if available)" -ForegroundColor Cyan
Write-Host " ✓ Configure the environment" -ForegroundColor Cyan
Write-Host " ✓ Launch the application" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Continue? (Y/n)"
if ($confirm -eq 'n' -or $confirm -eq 'N') { exit 0 }

Write-Host ""
Write-Host "Starting automated setup..." -ForegroundColor Yellow
Write-Host ""

# Run the full setup with auto-start
try {
    & .\setup.ps1 -StartServices
    
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host " 🎉 Setup Complete!" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "The Astro-BSM Portal is now running and should have opened in your browser!" -ForegroundColor Green
    Write-Host ""
    Write-Host "If the browser didn't open automatically, you can visit:" -ForegroundColor Yellow
    Write-Host "  🌐 http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or you can manually run:" -ForegroundColor Yellow
    Write-Host "  npm run dev:full" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Setup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run setup.ps1 manually to see detailed error messages." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
