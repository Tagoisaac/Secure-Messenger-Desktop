import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Define the API that will be exposed to the renderer process
const api = {
  // Database methods
  getChats: (limit: number = 50, offset: number = 0) => 
    ipcRenderer.invoke('get-chats', { limit, offset }),
    
  getMessages: (chatId: string, limit: number = 50, beforeTimestamp?: number) => 
    ipcRenderer.invoke('get-messages', { chatId, limit, beforeTimestamp }),
    
  searchMessages: (query: string, limit: number = 50) => 
    ipcRenderer.invoke('search-messages', { query, limit }),
    
  // WebSocket connection
  onWebSocketMessage: (callback: (message: any) => void) => {
    const listener = (_event: IpcRendererEvent, message: any) => callback(message);
    ipcRenderer.on('websocket-message', listener);
    
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('websocket-message', listener);
    };
  },
  
  // Connection status
  onConnectionStatusChange: (callback: (isConnected: boolean) => void) => {
    const listener = (_event: IpcRendererEvent, isConnected: boolean) => callback(isConnected);
    ipcRenderer.on('connection-status', listener);
    
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('connection-status', listener);
    };
  },
  
  // Simulate connection drop (for testing)
  simulateConnectionDrop: () => 
    ipcRenderer.send('simulate-connection-drop'),
    
  // App version
  getAppVersion: (): Promise<string> => 
    ipcRenderer.invoke('get-app-version')
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', api);

export type ElectronAPI = typeof api;
