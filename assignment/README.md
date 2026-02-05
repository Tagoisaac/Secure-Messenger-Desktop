# Secure Messenger Desktop

A secure desktop messaging application built with Electron, React, TypeScript, and SQLite. This application demonstrates efficient local data storage, real-time message synchronization via WebSockets, and a responsive UI that handles large datasets effectively.

## Features

- Real time messaging with WebSocket simulation
- Local data storage using SQLite
- Efficient rendering of large chat lists with virtualization
- Cross-platform (Windows, macOS, Linux)
- Automatic reconnection with exponential backoff
- Full-text search across messages
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Git (for cloning the repository)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/secure-messenger-desktop.git
   cd secure-messenger-desktop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Build the application**
   ```bash
   npm run make
   ```
   This will create platform-specific installers in the `out` directory.

## Project Structure

```
├── src/
│   ├── main/           # Electron main process code
│   │   ├── database.ts # SQLite database operations
│   │   ├── index.ts    # Main process entry point
│   │   └── websocket.ts # WebSocket server implementation
│   ├── preload/        # Preload scripts for secure IPC
│   └── renderer/       # React application (UI)
│       ├── App.tsx     # Main application component
│       ├── index.css   # Global styles
│       └── index.tsx   # Renderer entry point
├── vite.main.config.ts    # Vite config for main process
├── vite.renderer.config.ts # Vite config for renderer process
└── vite.preload.config.ts # Vite config for preload scripts
```

## Development

### Available Scripts

- `npm start` - Start the application in development mode
- `npm run make` - Package the application for the current platform
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# WebSocket server port (default: 8080)
WS_PORT=8080

# Database path (default: user data directory)
DB_PATH=./secure-messenger.db
```

## Security Considerations

- **Context Isolation**: Enabled to prevent direct access to Node.js APIs from the renderer process
- **Content Security Policy (CSP)**: Implemented to mitigate XSS attacks
- **Secure IPC**: All IPC communication is type-safe and follows the principle of least privilege
- **No Sensitive Data in Logs**: Sensitive information is not logged

## Performance Optimizations

- **Virtualized Lists**: Using `react-window` for efficient rendering of large lists
- **SQLite Indexing**: Properly indexed database for fast queries
- **WebSocket Optimization**: Message batching and compression (simulated)
- **Code Splitting**: Dynamic imports for better initial load performance

## Testing

To run tests:

```bash
npm test
```




