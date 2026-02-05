import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Declare the electronAPI on the window object
declare global {
  interface Window {
    electronAPI: {
      getChats: (limit: number, offset: number) => Promise<any[]>;
      getMessages: (chatId: string, limit: number, beforeTimestamp?: number) => Promise<any[]>;
      searchMessages: (query: string, limit: number) => Promise<any[]>;
      onWebSocketMessage: (callback: (message: any) => void) => () => void;
      onConnectionStatusChange: (callback: (isConnected: boolean) => void) => () => void;
      simulateConnectionDrop: () => void;
      getAppVersion: () => Promise<string>;
    };
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
