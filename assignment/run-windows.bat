@echo off
REM Secure Messenger Desktop - Windows Setup and Run Script
REM This script installs all dependencies and runs the Electron application

setlocal enabledelayedexpansion

echo.
echo ========================================
echo  Secure Messenger Desktop
echo  Windows Startup Script
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking for Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed: 
node -v
npm -v
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo Please run this script from the project root directory (assignment folder)
    pause
    exit /b 1
)

echo.
echo ========================================
echo Step 1: Installing Dependencies
echo ========================================
echo.
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed successfully
echo.

REM Optional: Check for Python (needed for some native modules)
python --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Python is not installed. Some dependencies may not build correctly.
    echo If you encounter issues, install Python from https://www.python.org/
    echo.
)

echo.
echo ========================================
echo Step 2: Starting the Application
echo ========================================
echo.
echo Launching Secure Messenger Desktop...
echo.

call npm start

if errorlevel 1 (
    echo [ERROR] Failed to start the application
    echo Please check the error messages above
    pause
    exit /b 1
)

pause
