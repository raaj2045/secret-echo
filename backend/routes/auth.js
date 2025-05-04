const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Register new user
router.post('/register', authLimiter, register);

// Login user
router.post('/login', authLimiter, login);

// Get current user
router.get('/me', protect, getCurrentUser);

module.exports = router; 