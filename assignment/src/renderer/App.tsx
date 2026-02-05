import React, { useState, useEffect, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { format } from 'date-fns';

// Types
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

export const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);

  // Load initial chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        const chats = await window.electronAPI.getChats(50, 0);
        setChats(chats);
        if (chats.length > 0 && !selectedChat) {
          setSelectedChat(chats[0].id);
        }
      } catch (error) {
        console.error('Failed to load chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [selectedChat]);

  // Load messages for the selected chat
  useEffect(() => {
    if (!selectedChat) return;

    const loadMessages = async () => {
      try {
        const messages = await window.electronAPI.getMessages(selectedChat, 50);
        setMessages(messages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [selectedChat]);

  // Set up WebSocket listeners
  useEffect(() => {
    const cleanupMessageListener = window.electronAPI.onWebSocketMessage((message) => {
      if (message.type === 'new_message') {
        const newMessage = message.payload;
        setMessages(prev => [newMessage, ...prev]);
        
        // Update the chat's last message and unread count
        setChats(prev => prev.map(chat => {
          if (chat.id === newMessage.chatId) {
            return {
              ...chat,
              lastMessageAt: newMessage.ts,
              unreadCount: selectedChat === newMessage.chatId ? 0 : chat.unreadCount + 1
            };
          }
          return chat;
        }));
      }
    });

    const cleanupConnectionListener = window.electronAPI.onConnectionStatusChange((connected) => {
      setIsConnected(connected);
    });

    return () => {
      cleanupMessageListener();
      cleanupConnectionListener();
    };
  }, [selectedChat]);

  // Handle search
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await window.electronAPI.searchMessages(searchQuery, 50);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [searchQuery]);

  // Render a single chat item in the list
  const ChatItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const chat = chats[index];
    return (
      <div 
        style={style} 
        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
          selectedChat === chat.id ? 'bg-blue-50' : ''
        }`}
        onClick={() => setSelectedChat(chat.id)}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{chat.title}</h3>
          <span className="text-sm text-gray-500">
            {format(new Date(chat.lastMessageAt), 'HH:mm')}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">
          {messages.find(m => m.chatId === chat.id)?.body || 'No messages yet'}
        </p>
        {chat.unreadCount > 0 && (
          <span className="absolute right-2 top-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {chat.unreadCount}
          </span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">Secure Messenger</h1>
          <div className="mt-2 relative">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={chats.length}
                itemSize={80}
                width={width}
              >
                {ChatItem}
              </List>
            )}
          </AutoSizer>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={() => window.electronAPI.simulateConnectionDrop()}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
            title="Simulate connection drop"
          >
            Test
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                {chats.find(c => c.id === selectedChat)?.title || 'Chat'}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="mb-4">
                    <div className="flex items-center mb-1">
                      <span className="font-medium">{message.sender}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {format(new Date(message.ts), 'HH:mm')}
                      </span>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg inline-block">
                      {message.body}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
