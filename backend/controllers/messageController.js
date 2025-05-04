const Message = require('../models/Message');
const { generateAIResponse } = require('../utils/aiResponder');

// Get all messages for a user
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ sender: req.user.id })
      .sort({ createdAt: 1 })
      .populate('sender', 'username avatarColor');

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// Send a new message
exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty'
      });
    }

    // Create user message
    const message = await Message.create({
      sender: req.user.id,
      receiver: 'ai',
      content
    });

    const populatedMessage = await Message.findById(message._id).populate('sender', 'username avatarColor');

    // Generate AI response (async without waiting)
    generateAIResponse(req.user.id, content);

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    next(error);
  }
}; 