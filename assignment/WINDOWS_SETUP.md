# Windows Setup Guide - Secure Messenger Desktop

This guide explains how to set up and run the Secure Messenger Desktop application on Windows.

## Quick Start (Recommended)

### Using PowerShell (Recommended - Better error handling)

1. **Open PowerShell** as Administrator
   - Search for "PowerShell" in Start menu
   - Right-click and select "Run as administrator"

2. **Navigate to the project directory**
   ```powershell
   cd path\to\Secure-Messenger-Desktop\assignment
   ```

3. **Run the setup script**
   ```powershell
   .\run-windows.ps1
   ```

   The script will:
   - ✓ Check for Node.js installation
   - ✓ Install all dependencies
   - ✓ Build the project
   - ✓ Launch the application

### Using Batch File (Traditional)

1. **Open Command Prompt (cmd.exe)**
   - Search for "Command Prompt" in Start menu
   - Navigate to the project directory:
   ```cmd
   cd path\to\Secure-Messenger-Desktop\assignment
   ```

2. **Run the batch script**
   ```cmd
   run-windows.bat
   ```

## Prerequisites

Before running the scripts, ensure you have:

- **Node.js 16.x or later** - [Download here](https://nodejs.org/)
  - The installer includes `npm` automatically
  - Make sure "Add to PATH" is selected during installation

- **Git** (optional, only needed if cloning) - [Download here](https://git-scm.com/)

- **Python** (optional, for native module compilation) - [Download here](https://www.python.org/)
  - Required if you get errors about native modules not building

### Check if Prerequisites are Installed

Open Command Prompt and run:
```cmd
node --version
npm --version
```

Both should display version numbers.

## Manual Setup (If Scripts Don't Work)

If the scripts encounter issues, you can set up manually:

1. **Install dependencies**
   ```cmd
   npm install
   ```

2. **Start the application**
   ```cmd
   npm start
   ```

## Available Commands

Once setup is complete, you can use these npm commands:

| Command | Description |
|---------|-------------|
| `npm start` | Start the Electron application |
| `npm run server` | Run just the backend server (for development) |
| `npm run make` | Create a Windows installer |
| `npm run lint` | Check code with ESLint |
| `npm run format` | Format code with Prettier |

## Creating an Installer (Packaging)

To create a distributable Windows installer:

### Using PowerShell
```powershell
.\run-windows.ps1 -Package
```

### Using npm directly
```cmd
npm run make
```

The installer will be created in the `out/make/` directory.

## Troubleshooting

### Issue: Node.js is not recognized

**Solution:**
- Reinstall Node.js from https://nodejs.org/
- Make sure "Add to PATH" is checked during installation
- Restart your terminal after installation

### Issue: `better-sqlite3` compilation errors

**Solution:**
- Install Python from https://www.python.org/
- Install Visual Studio Build Tools:
  - Download from https://visualstudio.microsoft.com/downloads/
  - Select "Desktop development with C++"
  - Restart your terminal

### Issue: Permission denied running PowerShell script

**Solution:**
- Open PowerShell as Administrator
- Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Then try running the script again

### Issue: Port 8080 is already in use

**Solution:**
One of these processes might be using the port:
- Close any other instances of the application
- Or modify the server port in `src/server.ts`

### Issue: Database errors or file access issues

**Solution:**
- Delete the `out` directory: `rmdir /s out`
- Delete `node_modules` and reinstall:
  ```cmd
  rmdir /s /q node_modules
  npm install
  ```
- Try running with Administrator privileges

## Project Structure

```
assignment/
├── src/
│   ├── main/           # Electron main process
│   │   ├── database.ts # SQLite database
│   │   ├── index.ts    # Entry point
│   │   └── websocket.ts # WebSocket server
│   ├── preload/        # Preload scripts
│   └── renderer/       # React UI
├── run-windows.bat     # Batch setup script
├── run-windows.ps1     # PowerShell setup script
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript config
```

## Features

- Real-time messaging with WebSocket
- Local SQLite database
- Efficient virtual list rendering
- Cross-platform (Windows, macOS, Linux)
- TypeScript for type safety
- React UI with Tailwind CSS

## Development

### For Development/Testing
```cmd
npm start
```

### For Building/Packaging
```cmd
npm run make
```

### For Code Quality
```cmd
npm run lint
npm run format
```

## Getting Help

If you encounter issues:

1. Check the error messages in the terminal
2. Ensure Node.js is properly installed and in your PATH
3. Try deleting `node_modules` and running `npm install` again
4. Check the troubleshooting section above
5. Review the main README.md for more information

## Environment Notes

- The application requires Windows 7 SP1 or later
- Electron is bundled and handles all runtime dependencies
- The SQLite database uses better-sqlite3 (requires compilation)
- WebSocket communication is handled by the `ws` library

Good luck! 🚀
