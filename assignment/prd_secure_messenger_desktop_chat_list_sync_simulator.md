# Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** Secure Messenger Desktop – Chat List + Sync Simulator  
**Platform:** Electron (Desktop) with React + TypeScript  
**Purpose:**  
Build a desktop application that simulates a secure messenger client with emphasis on:
- Efficient local data storage and access using SQLite
- Near real-time message synchronization using WebSockets
- High UI performance with large datasets
- Clean, modular architecture and strong security hygiene boundaries

This PRD translates the assignment into clear execution steps suitable for later implementation in an IDE.

---

## 2. Goals & Success Criteria

### Goals
- Demonstrate strong desktop application architecture using Electron + React + TypeScript
- Efficiently manage large datasets (200 chats, 20,000+ messages)
- Simulate real-time sync behavior with resilient connection handling
- Ensure security-conscious design without implementing real encryption

### Success Criteria
- App runs on macOS, Windows, and Linux
- No full-table loads into memory
- UI remains responsive with large lists
- WebSocket reconnects reliably after drops
- Clear separation of concerns (DB, sync, UI, security)

---

## 3. Scope

### In Scope
- Local SQLite database
- Chat list and message view UI
- WebSocket sync simulator
- Connection health monitoring
- Security service boundaries

### Out of Scope
- Real end-to-end encryption
- User authentication
- Cloud backend integration

---

## 4. High-Level Architecture

### Application Layers
1. **Electron Main Process**
   - App lifecycle
   - SQLite access layer
   - WebSocket server (simulator)

2. **Electron Renderer (React App)**
   - UI components
   - State management
   - WebSocket client

3. **Shared/Core Modules**
   - Database access layer
   - Sync service
   - Security service

---

## 5. Functional Requirements & Execution Steps

### A. Project Setup

**Execution Steps**
1. Initialize Git repository
2. Scaffold Electron + React + TypeScript project
   - Use Vite / CRA / Electron Forge (document choice)
3. Configure project structure:
   - `main/` – Electron main process
   - `renderer/` – React UI
   - `shared/` – DB, services, types
4. Configure build scripts for dev and production

---

### B. Local Database (SQLite)

#### Data Model
- `chats(id, title, lastMessageAt, unreadCount)`
- `messages(id, chatId, ts, sender, body)`

#### Execution Steps
1. Choose SQLite library (e.g., better-sqlite3)
2. Implement DB initialization module
3. Create schema and indexes:
   - Index on `chats.lastMessageAt`
   - Index on `messages.chatId, ts`
4. Implement seed logic:
   - Generate 200 chats
   - Generate 20,000+ messages distributed across chats
5. Implement query functions:
   - Fetch paginated chats (sorted by lastMessageAt)
   - Fetch last 50 messages for a chat
   - Fetch older messages (pagination)
   - Search messages by substring (limit 50)

---

### C. WebSocket Sync Simulator

#### Behavior
- Emits a new message every 1–3 seconds for a random chat

#### Execution Steps
1. Implement WebSocket server in Electron main process
2. Define message event schema:
   ```json
   { chatId, messageId, ts, sender, body }
   ```
3. Implement random message generator
4. Emit events at random intervals
5. Implement WebSocket client in renderer
6. On message received:
   - Write message to SQLite
   - Update chat metadata (lastMessageAt, unreadCount)
   - Trigger UI refresh

---

### D. Connection Health Management

#### Features
- Connection status indicator
- Heartbeat/ping
- Exponential backoff reconnect
- Manual connection drop simulation

#### Execution Steps
1. Define connection state machine:
   - Connected
   - Reconnecting
   - Offline
2. Implement heartbeat every ~10 seconds
3. Detect connection failure
4. Implement exponential backoff reconnect logic
5. Add "Simulate connection drop" button (server-side close)
6. Verify automatic recovery

---

### E. UI & Performance

#### Layout
- Left panel: Chat list
- Right panel: Message view

#### Execution Steps
1. Set up React state management (Redux Toolkit or alternative)
2. Implement Chat List component
   - Virtualize using `react-window` or equivalent
   - Display unread count
3. Implement Message View component
   - Load last 50 messages
   - "Load older messages" pagination
   - Optional virtualization
4. Implement chat selection logic
   - Mark chat as read on open
5. Ensure minimal re-renders and memoization

---

### F. Security Hygiene

#### Requirements
- No sensitive message data in logs
- Clear encryption boundary

#### Execution Steps
1. Create `SecurityService` module
   - `encrypt(data)` placeholder
   - `decrypt(data)` placeholder
2. Route all message persistence through SecurityService
3. Disable or sanitize logging
4. Document security approach in README

---

## 6. Non-Functional Requirements

- Performance: UI must remain responsive with large datasets
- Reliability: WebSocket auto-recovery required
- Portability: Must run on macOS, Windows, Linux
- Maintainability: Clear module boundaries

---

## 7. Deliverables

1. GitHub repository containing:
   - Source code
   - README.md
2. README must include:
   - Setup & run instructions
   - Architecture overview
   - Trade-offs & future improvements
3. Optional screenshot or GIF

---

## 8. Future Improvements (Post Time-Box)

- Full message list virtualization
- Cross-chat search
- Unit tests for DB queries and reducers
- Real encryption implementation
- Background sync optimization

---

## 9. Acceptance Checklist

- [ ] SQLite seeded with required data
- [ ] Paginated queries implemented
- [ ] WebSocket sync functioning
- [ ] Connection recovery verified
- [ ] Virtualized chat list
- [ ] Security boundaries documented

---

**End of PRD**

