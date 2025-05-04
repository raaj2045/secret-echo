require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const { errorHandler } = require('./middleware/errorHandler');
const { setupSocket } = require('./socket');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if(!origin) return callback(null, true);
    
    // Allow localhost and Vercel domains
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://secret-echo.vercel.app',
      /^https:\/\/secret-echo-.*\.vercel\.app$/
    ];
    
    // Check if the origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if(isAllowed) {
      return callback(null, true);
    }
    
    callback(new Error('CORS not allowed'));
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Error handling middleware
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if(!origin) return callback(null, true);
      
      // Allow localhost and Vercel domains
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://secret-echo.vercel.app',
        /^https:\/\/secret-echo-.*\.vercel\.app$/
      ];
      
      // Check if the origin is allowed
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return allowedOrigin === origin;
      });
      
      if(isAllowed) {
        return callback(null, true);
      }
      
      callback(new Error('CORS not allowed'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io globally available
global.io = io;

setupSocket(io);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secret-echo')
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  }); 