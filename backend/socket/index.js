const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Track users by user ID
const connectedUsers = new Map();

exports.setupSocket = (io) => {
  // Socket middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.user = {
        id: user._id.toString(),
        username: user.username
      };
      next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    
    // Add user to connected users map
    connectedUsers.set(userId, socket.id);
    
    console.log(`User connected: ${socket.user.username} (${userId})`);
    console.log(`Socket ID: ${socket.id}`);
    console.log(`Total connected users: ${connectedUsers.size}`);
    
    // Log all connected users
    console.log('All connected users:', Array.from(connectedUsers.entries()));
    
    // Join room with user's ID for private messages
    socket.join(userId);
    console.log(`User ${userId} joined room: ${userId}`);
    
    // Handle new message from user
    socket.on('send_message', (data) => {
      console.log(`New message from ${socket.user.username}: ${data.content}`);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      console.log(`User disconnected: ${socket.user.username} (${userId})`);
      console.log(`Remaining connected users: ${connectedUsers.size}`);
    });
  });
}; 