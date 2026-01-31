@echo off
REM Quick start script for SafeRaasta SOS Backend (Windows)

echo === SafeRaasta SOS Backend Setup ===
echo.

REM Check if we're in the backend directory
if not exist "package.json" (
    echo Error: Please run this script from the backend directory
    echo Usage: cd backend && quickstart.bat
    exit /b 1
)

REM Check Node.js installation
echo Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js from https://nodejs.org
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% installed
echo.

REM Check .env file
echo Checking environment configuration...
if not exist ".env" (
    echo Error: .env file not found
    echo Creating .env from template...
    copy .env.example .env
    echo [WARNING] Please edit .env file with your Retell API credentials
    exit /b 1
)
echo [OK] Environment file configured
echo.

REM Install dependencies
echo Installing dependencies...
if not exist "node_modules" (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to install dependencies
        exit /b 1
    )
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)
echo.

REM Start server
echo Starting SafeRaasta SOS Backend...
echo Server will run on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
call npm start
