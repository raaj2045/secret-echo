"use client";

import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

// Create a socket instance with authentication
const createSocket = (token) => {
  if (!token) return null;
  
  console.log('Creating socket connection to:', SOCKET_URL);
  
  return io(SOCKET_URL, {
    auth: { token },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling']
  });
};

// Initialize socket connection
export const initializeSocket = (token, onNewMessage, onTyping) => {
  const socket = createSocket(token);
  
  if (!socket) {
    console.error('Failed to create socket - no token provided');
    return null;
  }
  
  // Connect to socket server
  socket.connect();
  
  // Register connection event listeners
  socket.on("connect", () => {
    console.log("Socket connected successfully with ID:", socket.id);
  });
  
  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });
  
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });
  
  // Consolidated reconnection events
  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`Socket reconnection attempt: ${attemptNumber}`);
  });
  
  socket.on("reconnect", (attemptNumber) => {
    console.log(`Socket reconnected after ${attemptNumber} attempts`);
  });
  
  socket.on("reconnect_failed", () => {
    console.error("Socket reconnection failed after maximum attempts");
  });
  
  // Handle new messages
  if (onNewMessage) {
    socket.on("new_message", (message) => {
      if (!message) {
        console.error("Received empty message from socket");
        return;
      }
      
      console.log("Received new message via socket:", {
        id: message?._id?.substring(0, 8),
        from: message?.sender?.username || "unknown"
      });
      
      try {
        onNewMessage(message);
      } catch (error) {
        console.error("Error handling new message:", error);
      }
    });
  }
  
  // Handle typing status
  if (onTyping) {
    socket.on("user_typing", (data) => {
      if (data && data.isAI) {
        console.log("Received AI typing status:", data.isTyping ? "typing" : "stopped typing");
        try {
          onTyping(data);
        } catch (error) {
          console.error("Error handling typing status:", error);
        }
      }
    });
  }
  
  // Return socket instance and cleanup function
  return {
    socket,
    disconnect: () => {
      console.log("Disconnecting socket");
      socket.off("new_message");
      socket.off("user_typing");
      socket.disconnect();
    },
    sendMessage: (content) => {
      console.log("Sending message via socket");
      socket.emit("send_message", { content });
    }
  };
}; 