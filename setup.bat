@echo off
setlocal enabledelayedexpansion

:: Astro-BSM Portal Automated Setup Script
:: This script automates the complete setup process including database configuration

:: Default values
set "DB_PASSWORD=natiss_natiss"
set "DB_USER=postgres"
set "DB_NAME=astro_bsm_portal"
set "SKIP_DATABASE=false"
set "START_SERVICES=false"

:: Parse command line arguments
:parse_args
if "%~1"=="" goto :start_setup
if "%~1"=="--skip-database" set "SKIP_DATABASE=true"
if "%~1"=="--start-services" set "START_SERVICES=true"
if "%~1"=="--db-password" set "DB_PASSWORD=%~2" && shift
if "%~1"=="--db-user" set "DB_USER=%~2" && shift
if "%~1"=="--db-name" set "DB_NAME=%~2" && shift
shift
goto :parse_args

:start_setup
echo.
echo ============================================
echo  Astro-BSM Portal Automated Setup Script
echo ============================================
echo.

:: Check if package.json exists
if not exist package.json (
    echo ERROR: package.json not found. Please run this from the project root directory.
    pause
    exit /b 1
)

:: Check prerequisites
echo Checking prerequisites...

:: Check Node.js
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ERROR: Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check npm
npm --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ERROR: npm not found. Please install Node.js with npm from https://nodejs.org/
    pause
    exit /b 1
)

echo SUCCESS: Node.js and npm are installed
echo.

:: Check PostgreSQL
psql --version >nul 2>&1
if !errorlevel! neq 0 (
    echo WARNING: PostgreSQL not found in PATH. Database setup will be skipped.
    echo Please install PostgreSQL from https://www.postgresql.org/download/
    set "SKIP_DATABASE=true"
) else (
    echo SUCCESS: PostgreSQL is available
)

:: Install npm dependencies
echo Installing npm dependencies...
npm install
if !errorlevel! neq 0 (
    echo ERROR: npm install failed. Please check your npm installation.
    pause
    exit /b 1
)
echo SUCCESS: Dependencies installed successfully!
echo.

:: Database Setup
if "%SKIP_DATABASE%"=="false" (
    echo Setting up PostgreSQL database...
    
    :: Set password environment variable
    set "PGPASSWORD=%DB_PASSWORD%"
    
    :: Test PostgreSQL connection
    echo Testing PostgreSQL connection...
    psql -U %DB_USER% -h localhost -c "SELECT version();" >nul 2>&1
    if !errorlevel! neq 0 (
        echo ERROR: Cannot connect to PostgreSQL. Please check:
        echo   - PostgreSQL is running
        echo   - Username '%DB_USER%' exists
        echo   - Password is correct
        echo   - Use --db-password if different
        set "SKIP_DATABASE=true"
    ) else (
        echo SUCCESS: PostgreSQL connection successful
        
        :: Check if database exists
        psql -U %DB_USER% -h localhost -lqt | findstr /C:"%DB_NAME%" >nul 2>&1
        if !errorlevel! neq 0 (
            echo Creating database '%DB_NAME%'...
            psql -U %DB_USER% -h localhost -c "CREATE DATABASE %DB_NAME%;" >nul 2>&1
            if !errorlevel! equ 0 (
                echo SUCCESS: Database '%DB_NAME%' created successfully
            ) else (
                echo ERROR: Failed to create database
                set "SKIP_DATABASE=true"
            )
        ) else (
            echo SUCCESS: Database '%DB_NAME%' already exists
        )
        
        :: Import schema if database setup was successful
        if "!SKIP_DATABASE!"=="false" (
            echo Importing database schema...
            if exist server\database\schema.sql (
                psql -U %DB_USER% -h localhost -d %DB_NAME% -f server\database\schema.sql >nul 2>&1
                if !errorlevel! equ 0 (
                    echo SUCCESS: Database schema imported successfully
                ) else (
                    echo WARNING: Schema import had issues (may be normal if tables exist)
                )
            ) else (
                echo ERROR: Schema file not found at server\database\schema.sql
            )
        )
    )
    
    :: Clean up password environment variable
    set "PGPASSWORD="
    echo.
)

:: Configure environment variables
echo Configuring environment...
if exist server\.env (
    echo SUCCESS: Environment file already exists
) else (
    if exist server\.env.example (
        copy server\.env.example server\.env >nul
        echo SUCCESS: Created .env from template
    ) else (
        echo ERROR: No .env.example template found
    )
)

:: Run setup verification
echo.
echo Running setup verification...
node verify-setup.js

echo.
echo =======================================
echo  Setup Complete!
echo =======================================

if "%SKIP_DATABASE%"=="true" (
    echo.
    echo WARNING: DATABASE SETUP WAS SKIPPED
    echo To set up the database manually:
    echo 1. Install PostgreSQL from https://www.postgresql.org/download/
    echo 2. Run: psql -U postgres -c "CREATE DATABASE %DB_NAME%;"
    echo 3. Run: psql -U postgres -d %DB_NAME% -f server\database\schema.sql
    echo 4. Update server\.env with your database credentials
)

echo.
echo Available commands:
echo   npm run dev        - Start frontend development server
echo   npm run server     - Start backend server
echo   npm run dev:full   - Start both frontend and backend
echo   npm run build      - Build for production

if "%START_SERVICES%"=="true" (
    echo.
    echo Starting development servers...
    echo Press Ctrl+C to stop the servers
    start "Astro-BSM Portal" cmd /k "npm run dev:full"
    echo SUCCESS: Servers started in new window
    
    echo.
    echo Waiting for servers to start up...
    timeout /t 8 /nobreak >nul
    
    echo Checking if servers are ready...
    for /L %%i in (1,1,10) do (
        curl -s http://localhost:3000 >nul 2>&1
        if !errorlevel! equ 0 (
            echo SUCCESS: Frontend server is ready!
            goto :open_browser
        )
        echo Attempt %%i/10 - waiting for frontend...
        timeout /t 2 /nobreak >nul
    )
    
    :open_browser
    echo Opening application in your default browser...
    start http://localhost:3000
    echo SUCCESS: Application opened at http://localhost:3000
    
    echo.
    echo =======================================
    echo  Success! Your Astro-BSM Portal is now running!
    echo =======================================
    echo  The application should have opened in your browser
    echo  Backend API is available at http://localhost:3001
    echo =======================================
)

echo.
pause
