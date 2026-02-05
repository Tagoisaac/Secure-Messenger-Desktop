import { WebSocket, WebSocketServer } from 'ws';
import { Database } from './database';

type WebSocketMessage = {
  type: 'new_message' | 'connection_status';
  payload: any;
};

export class WebSocketServerWrapper {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private messageInterval: NodeJS.Timeout;
  private isConnected: boolean = true;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // Start with 1 second
  private maxReconnectDelay: number = 30000; // Max 30 seconds

  constructor(private db: Database, private port: number = 8080) {}

  start() {
    this.wss = new WebSocketServer({ port: this.port });
    
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      this.sendConnectionStatus(true);
      
      ws.on('message', (message: string) => {
        try {
          const parsed: WebSocketMessage = JSON.parse(message);
          this.handleMessage(ws, parsed);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        if (this.clients.size === 0) {
          this.stopMessageGenerator();
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    this.wss.on('close', () => {
      this.handleConnectionClose();
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
      this.handleConnectionError();
    });

    console.log(`WebSocket server started on port ${this.port}`);
    this.startMessageGenerator();
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'connection_status':
        ws.send(JSON.stringify({
          type: 'connection_status',
          payload: { isConnected: this.isConnected }
        }));
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private startMessageGenerator() {
    // Clear any existing interval
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }

    // Generate a new message every 1-3 seconds
    this.messageInterval = setInterval(() => {
      if (this.clients.size > 0) {
        this.generateRandomMessage();
      }
    }, 1000 + Math.random() * 2000); // 1-3 seconds
  }

  private stopMessageGenerator() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
      this.messageInterval = null;
    }
  }

  private async generateRandomMessage() {
    try {
      // Get a random chat
      const chats = this.db.getChats(1, Math.floor(Math.random() * 200));
      if (chats.length === 0) return;
      
      const chat = chats[0];
      const senders = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
      
      const newMessage = {
        id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        chatId: chat.id,
        ts: Date.now(),
        sender: senders[Math.floor(Math.random() * senders.length)],
        body: `New message at ${new Date().toISOString()}`
      };

      // In a real app, we would insert this into the database
      // For this simulator, we'll just broadcast it to clients
      this.broadcast({
        type: 'new_message',
        payload: newMessage
      });
    } catch (error) {
      console.error('Error generating random message:', error);
    }
  }

  private broadcast(message: WebSocketMessage) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  private sendConnectionStatus(isConnected: boolean) {
    this.isConnected = isConnected;
    this.broadcast({
      type: 'connection_status',
      payload: { isConnected }
    });
  }

  private handleConnectionClose() {
    console.log('WebSocket connection closed');
    this.sendConnectionStatus(false);
    this.attemptReconnect();
  }

  private handleConnectionError() {
    console.error('WebSocket connection error');
    this.sendConnectionStatus(false);
    this.attemptReconnect();
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      console.log('Reconnecting WebSocket server...');
      this.start();
    }, delay);
  }

  stop() {
    this.stopMessageGenerator();
    this.clients.forEach(client => client.close());
    this.clients.clear();
    
    if (this.wss) {
      this.wss.close(() => {
        console.log('WebSocket server stopped');
      });
    }
  }
}
