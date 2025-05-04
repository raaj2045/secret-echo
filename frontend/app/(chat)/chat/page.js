"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { messageApi } from "../../utils/api";
import { initializeSocket } from "../../utils/socket";
import Message from "../../components/Message";
import { FaPaperPlane, FaSignOutAlt, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import { isSameUser } from "../../utils/helpers";

// Constants
const LOCAL_STORAGE_MESSAGES_KEY = 'secret-echo-messages';

export default function Chat() {
  const { user, isAuthenticated, loading, token, logout } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socketClient, setSocketClient] = useState(null);
  const messagesEndRef = useRef(null);
  const localStorageTimer = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Initialize socket connection
  useEffect(() => {
    if (token) {
      const socket = initializeSocket(
        token,
        handleNewMessage,
        handleTypingStatus
      );
      
      if (socket) {
        setSocketClient(socket);
        
        // Cleanup on unmount
        return () => {
          socket.disconnect();
        };
      }
    }
  }, [token]);

  // Load messages from localStorage on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, loading messages');
      
      // Try to load from localStorage first
      const storedMessages = loadMessagesFromLocalStorage();
      if (storedMessages && storedMessages.length > 0) {
        setMessages(storedMessages);
        console.log('Loaded messages from localStorage:', storedMessages.length);
      }
      
      // Then fetch from API (will completely replace local messages)
      fetchMessages();
    }
  }, [isAuthenticated, user]);

  // Save messages to localStorage when they change - with debounce
  useEffect(() => {
    if (messages.length > 0 && user) {
      // Clear previous timer
      if (localStorageTimer.current) {
        clearTimeout(localStorageTimer.current);
      }
      
      // Debounce localStorage writes to avoid excessive writes
      localStorageTimer.current = setTimeout(() => {
        saveMessagesToLocalStorage(messages);
      }, 1000);
    }
    
    return () => {
      if (localStorageTimer.current) {
        clearTimeout(localStorageTimer.current);
      }
    };
  }, [messages, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages from API - completely replaces local messages
  const fetchMessages = async () => {
    try {
      const fetchedMessages = await messageApi.getMessages();
      
      // Sort by createdAt timestamp
      const sortedMessages = fetchedMessages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      
      setMessages(sortedMessages);
      console.log('Messages fetched from API:', sortedMessages.length);
    } catch (error) {
      toast.error("Failed to load messages");
      console.error('Error fetching messages:', error);
    }
  };

  // Helper to load messages from localStorage
  const loadMessagesFromLocalStorage = () => {
    try {
      const key = `${LOCAL_STORAGE_MESSAGES_KEY}-${user.id}`;
      const storedData = localStorage.getItem(key);
      const messages = storedData ? JSON.parse(storedData) : [];
      
      // Sort by createdAt timestamp
      return messages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    } catch (error) {
      console.error('Failed to load messages from localStorage:', error);
      return [];
    }
  };

  // Helper to save messages to localStorage
  const saveMessagesToLocalStorage = (messagesToSave) => {
    try {
      // Remove optimistic messages before saving
      const permanentMessages = messagesToSave.filter(msg => !msg.isOptimistic);
      
      // Only save if we have messages to save
      if (permanentMessages.length > 0) {
        const key = `${LOCAL_STORAGE_MESSAGES_KEY}-${user.id}`;
        localStorage.setItem(key, JSON.stringify(permanentMessages));
        console.log('Saved messages to localStorage:', permanentMessages.length);
      }
    } catch (error) {
      console.error('Failed to save messages to localStorage:', error);
    }
  };

  // Handler for new messages via socket
  const handleNewMessage = (message) => {
    if (!message) {
      console.error('Received undefined message');
      return;
    }
    
    // Add a message ID if missing to help with deduplication
    const messageWithId = {
      ...message,
      _id: message._id || `generated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    console.log('Processing new message:', {
      id: messageWithId._id?.substring(0, 8),
      from: messageWithId.sender?.username || 'unknown'
    });
    
    // For broadcast messages, only show if they're intended for this user
    if (messageWithId.targetUserId && !isSameUser(messageWithId.targetUserId, user?.id)) {
      console.log('Ignoring message intended for another user');
      return;
    }

    // Force a UI update with the new message
    setMessages(prevMessages => {
      // Check if this message already exists by ID
      const existingIndex = prevMessages.findIndex(msg => msg._id === messageWithId._id);
      
      if (existingIndex >= 0) {
        return prevMessages; // No change needed
      }
      
      // Add new message and sort
      const newMessages = [...prevMessages, messageWithId];
      return newMessages.sort((a, b) => 
        new Date(a.createdAt || Date.now()) - new Date(b.createdAt || Date.now())
      );
    });
    
    // Turn off typing indicator when message is received
    setIsTyping(false);
    
    // Make sure we scroll to bottom
    setTimeout(scrollToBottom, 100);
  };

  // Handler for typing status via socket
  const handleTypingStatus = (data) => {
    // Only update typing status for AI responses
    if (data.isAI) {
      setIsTyping(data.isTyping);
    }
  };

  // Send new message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setIsSending(true);
      
      // Create an optimistic local message first
      const optimisticId = `temp-${Date.now()}`;
      const optimisticMessage = {
        _id: optimisticId,
        content: newMessage.trim(),
        sender: {
          _id: user.id,
          username: user.username,
          avatarColor: user.avatarColor
        },
        receiver: 'ai',
        createdAt: new Date().toISOString(),
        isOptimistic: true  // Flag to identify this as a temporary message
      };
      
      // Add optimistic message to UI immediately
      setMessages(prev => [...prev, optimisticMessage].sort(
        (a, b) => new Date(a.createdAt || Date.now()) - new Date(b.createdAt || Date.now())
      ));
      
      // Clear input
      setNewMessage("");
      
      // Send message to API
      const message = await messageApi.sendMessage(optimisticMessage.content);
      
      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg._id === optimisticId ? message : msg
        ).sort(
          (a, b) => new Date(a.createdAt || Date.now()) - new Date(b.createdAt || Date.now())
        )
      );
      
      // Show AI typing indicator
      setIsTyping(true);
    } catch (error) {
      toast.error("Failed to send message");
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle input change
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-indigo-600 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Secret Echo</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white mr-2"
              style={{ backgroundColor: user?.avatarColor || "#9333EA" }}
            >
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {user?.username}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Logout"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                No messages yet. Start a conversation with AI!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <Message
                key={message._id || `temp-${Date.now()}-${Math.random()}`}
                message={message}
                currentUser={user}
              />
            ))
          )}
          
          {isTyping && (
            <div className="flex items-center mt-2 mb-4">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0" style={{ backgroundColor: "#3B82F6" }}>
                AI
              </div>
              <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
          <div className="flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-l-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-r-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <FaSpinner className="animate-spin h-5 w-5" />
              ) : (
                <FaPaperPlane className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 