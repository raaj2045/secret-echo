const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for message sending
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many messages sent, please try again after 1 minute'
});

// Protect all message routes
router.use(protect);

// Get all messages for user
router.get('/', getMessages);

// Send a new message
router.post('/', messageLimiter, sendMessage);

module.exports = router; 