# Secure Messenger Desktop - Windows Setup and Run Script (PowerShell)
# This comprehensive script handles all setup, dependencies, and running the Electron app

param(
    [switch]$BuildOnly = $false,
    [switch]$Package = $false
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Status {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[✓] $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[✗] $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

Write-Status "========================================"
Write-Status "  Secure Messenger Desktop"
Write-Status "  Windows Setup & Launch Script"
Write-Status "========================================"
Write-Host ""

# Check if Node.js is installed
Write-Status "Checking prerequisites..."
$nodeVersion = $null
$npmVersion = $null

try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Success "Node.js is installed: $nodeVersion"
    Write-Success "npm is installed: $npmVersion"
} catch {
    Write-Error-Custom "Node.js is not installed or not in PATH"
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Make sure to select 'Add to PATH' during installation"
    pause
    exit 1
}

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Error-Custom "package.json not found!"
    Write-Host "Please run this script from the project root directory (assignment folder)" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Success "All prerequisites met"
Write-Host ""

# Check for Python (optional but helpful)
$pythonExists = $false
try {
    $pythonVersion = python --version 2>&1
    $pythonExists = $true
    Write-Success "Python found: $pythonVersion"
} catch {
    Write-Warning-Custom "Python not found (optional for native modules)"
    Write-Host "          Install from https://www.python.org/ if you have issues" -ForegroundColor Yellow
}

Write-Host ""

# Step 1: Install Dependencies
Write-Status "========================================"
Write-Status "Step 1: Installing Dependencies"
Write-Status "========================================"
Write-Host ""

Write-Host "Running: npm install"
Write-Host ""

& npm install

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Failed to install dependencies"
    pause
    exit 1
}

Write-Success "Dependencies installed successfully"
Write-Host ""

# Step 2: Build
Write-Status "========================================"
Write-Status "Step 2: Building Project"
Write-Status "========================================"
Write-Host ""

# The Vite plugin handles building, but we might want to pre-build
Write-Host "Project is configured with Vite - builds happen automatically on start"
Write-Host ""

# Step 3: Run or Package
if ($Package) {
    Write-Status "========================================"
    Write-Status "Step 3: Creating Installer"
    Write-Status "========================================"
    Write-Host ""
    Write-Host "Running: npm run make"
    Write-Host "This will create a Windows installer in the 'out' directory..."
    Write-Host ""
    
    & npm run make
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to create installer"
        pause
        exit 1
    }
    
    Write-Success "Installer created successfully!"
    Write-Host ""
    Write-Host "Installers are located in: out/make/" -ForegroundColor Cyan
} 
elseif ($BuildOnly) {
    Write-Success "Setup complete!"
    Write-Host ""
    Write-Host "To start the application, run:" -ForegroundColor Cyan
    Write-Host "  npm start" -ForegroundColor Green
    Write-Host ""
    Write-Host "To create an installer, run:" -ForegroundColor Cyan
    Write-Host "  npm run make" -ForegroundColor Green
    Write-Host ""
}
else {
    # Step 3: Start Application
    Write-Status "========================================"
    Write-Status "Step 3: Starting Application"
    Write-Status "========================================"
    Write-Host ""
    Write-Host "Launching Secure Messenger Desktop..." -ForegroundColor Green
    Write-Host ""
    
    & npm start
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to start the application"
        pause
        exit 1
    }
}

Write-Host ""
Write-Success "Done!"
