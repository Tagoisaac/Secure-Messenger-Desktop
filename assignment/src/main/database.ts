import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';

type Chat = {
  id: string;
  title: string;
  lastMessageAt: number;
  unreadCount: number;
};

type Message = {
  id: string;
  chatId: string;
  ts: number;
  sender: string;
  body: string;
};

export class Database {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'secure-messenger.db');
    this.db = null;
  }

  initialize() {
    this.db = new Database(this.dbPath);
    this.setupSchema();
    this.seedData();
  }

  private setupSchema() {
    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');

    // Create chats table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        lastMessageAt INTEGER NOT NULL,
        unreadCount INTEGER DEFAULT 0
      );
    `);

    // Create messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chatId TEXT NOT NULL,
        ts INTEGER NOT NULL,
        sender TEXT NOT NULL,
        body TEXT NOT NULL,
        FOREIGN KEY (chatId) REFERENCES chats (id)
      );
    `);

    // Create indexes
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_chats_last_message_at ON chats(lastMessageAt)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_messages_chat_id_ts ON messages(chatId, ts)');
    this.db.exec('CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(chatId, body, content=messages, content_rowid=id)');
  }

  private seedData() {
    // Check if we already have data
    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM chats');
    const { count } = countStmt.get() as { count: number };

    if (count > 0) {
      return; // Already seeded
    }

    // Generate 200 chats
    const chatTitles = Array.from({ length: 200 }, (_, i) => `Chat ${i + 1}`);
    
    // Generate senders
    const senders = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    
    // Insert chats and messages in a transaction
    const insertChatStmt = this.db.prepare(
      'INSERT INTO chats (id, title, lastMessageAt, unreadCount) VALUES (?, ?, ?, ?)'
    );
    
    const insertMessageStmt = this.db.prepare(
      'INSERT INTO messages (id, chatId, ts, sender, body) VALUES (?, ?, ?, ?, ?)'
    );
    
    const insertFtsStmt = this.db.prepare(
      'INSERT INTO messages_fts (rowid, chatId, body) VALUES (?, ?, ?)'
    );

    const now = Date.now();
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    
    this.db.transaction(() => {
      chatTitles.forEach((title, chatIndex) => {
        // Create chat
        const chatId = `chat_${chatIndex + 1}`;
        const lastMessageAt = now - Math.floor(Math.random() * oneYearMs);
        const unreadCount = Math.floor(Math.random() * 10);
        
        insertChatStmt.run(chatId, title, lastMessageAt, unreadCount);

        // Generate 100-200 messages per chat
        const messageCount = 100 + Math.floor(Math.random() * 101);
        
        for (let i = 0; i < messageCount; i++) {
          const messageId = uuidv4();
          const ts = lastMessageAt - (messageCount - i) * 1000 * 60 * 5; // 5 min between messages
          const sender = senders[Math.floor(Math.random() * senders.length)];
          const body = `Message ${i + 1} in ${title}`;
          
          insertMessageStmt.run(messageId, chatId, ts, sender, body);
          insertFtsStmt.run(messageId, chatId, body);
        }
      });
    })();
  }

  getChats(limit: number = 50, offset: number = 0): Chat[] {
    const stmt = this.db.prepare(`
      SELECT id, title, lastMessageAt, unreadCount 
      FROM chats 
      ORDER BY lastMessageAt DESC 
      LIMIT ? OFFSET ?
    `);
    
    return stmt.all(limit, offset) as Chat[];
  }

  getMessages(chatId: string, limit: number = 50, beforeTimestamp?: number): Message[] {
    let query = `
      SELECT id, chatId, ts, sender, body 
      FROM messages 
      WHERE chatId = ? 
    `;
    
    const params: (string | number)[] = [chatId];
    
    if (beforeTimestamp) {
      query += ' AND ts < ? ';
      params.push(beforeTimestamp);
    }
    
    query += ' ORDER BY ts DESC LIMIT ?';
    params.push(limit);
    
    const stmt = this.db.prepare(query);
    return (stmt.all(...params) as Message[]).reverse(); // Return in chronological order
  }

  searchMessages(query: string, limit: number = 50): Message[] {
    const stmt = this.db.prepare(`
      SELECT m.id, m.chatId, m.ts, m.sender, m.body 
      FROM messages_fts f
      JOIN messages m ON m.id = f.rowid
      WHERE messages_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `);
    
    return stmt.all(`${query}*`, limit) as Message[];
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}
