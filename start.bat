@echo off
title Astro-BSM Portal - One-Click Setup and Launch

:: One-click setup and launch script
echo.
echo ================================================================
echo  🚀 Astro-BSM Portal - One-Click Setup and Launch
echo ================================================================
echo.
echo This script will:
echo  ✓ Install all dependencies
echo  ✓ Set up the PostgreSQL database (if available)
echo  ✓ Configure the environment
echo  ✓ Launch the application
echo.

set /p "confirm=Continue? (Y/n): "
if /i "%confirm%"=="n" exit /b 0

echo.
echo Starting automated setup...
echo.

:: Run the full setup with auto-start
call setup.bat --start-services

echo.
echo ================================================================
echo  🎉 Setup Complete!
echo ================================================================
echo.
echo The Astro-BSM Portal is now running and should have opened
echo in your browser automatically!
echo.
echo If the browser didn't open, you can visit:
echo   http://localhost:3000
echo.
echo Or manually run: npm run dev:full
echo.
echo Press any key to exit this window...
pause >nul
