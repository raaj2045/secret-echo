const Message = require('../models/Message');

// Sample AI responses based on user input patterns
const responses = [
  {
    patterns: ['hello', 'hi', 'hey', 'greetings'],
    replies: [
      'Hello there! How can I help you today?',
      'Hi! Nice to meet you. What can I do for you?',
      'Hey! I\'m here to assist you. What do you need?'
    ]
  },
  {
    patterns: ['how are you', 'how\'s it going'],
    replies: [
      'I\'m doing well, thanks for asking! How about you?',
      'I\'m functioning perfectly! How can I assist you?',
      'All systems operational! What can I help with today?'
    ]
  },
  {
    patterns: ['bye', 'goodbye', 'see you', 'talk later'],
    replies: [
      'Goodbye! Come back anytime you need assistance.',
      'See you later! Have a great day!',
      'Until next time! Take care.'
    ]
  },
  {
    patterns: ['thanks', 'thank you', 'appreciate'],
    replies: [
      'You\'re welcome! Is there anything else you need?',
      'Happy to help! Let me know if you need anything else.',
      'My pleasure! Anything else on your mind?'
    ]
  },
  {
    patterns: ['help', 'assist', 'support'],
    replies: [
      'I\'m here to help! What do you need assistance with?',
      'How can I assist you today? Just let me know!',
      'I\'m your AI assistant. What do you need help with?'
    ]
  }
];

// Default fallback responses when no pattern is matched
const fallbackResponses = [
  'That\'s interesting. Tell me more about that.',
  'I understand. How can I help you with that?',
  'I see. Is there anything specific you\'d like to know?',
  'Hmm, could you elaborate on that?',
  'That\'s something to think about. Is there anything else on your mind?',
  'I\'m still learning about that. Could you tell me more?',
  'Thanks for sharing that with me. What else would you like to discuss?'
];

// Helper functions
const getRandomDelay = () => Math.floor(Math.random() * 2000) + 1000;
const getRandomResponse = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate AI response based on user message
exports.generateAIResponse = async (userId, userMessage) => {
  if (!userId || !userMessage) {
    console.error('Invalid parameters for AI response');
    return null;
  }
  
  try {
    // Convert userId to string for socket room
    const userIdStr = userId.toString();
    
    // Add delay for more realistic response time
    await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
    
    // Generate response text based on user message
    const responseText = generateResponseText(userMessage);
    
    // Create and save AI response message to database
    const aiMessage = await Message.create({
      sender: userId,
      receiver: 'user',
      content: responseText
    });
    
    const populatedMessage = await Message.findById(aiMessage._id)
      .populate('sender', 'username avatarColor');
    
    // Send message via socket
    await sendMessageViaSocket(userIdStr, populatedMessage);
    
    return populatedMessage;
  } catch (error) {
    console.error('Error generating AI response:', error.message);
    return null;
  }
};

// Helper to generate response text based on patterns
function generateResponseText(userMessage) {
  const lowerCaseMessage = userMessage.toLowerCase();
  
  // Find matching pattern
  for (const response of responses) {
    if (response.patterns.some(pattern => lowerCaseMessage.includes(pattern))) {
      return getRandomResponse(response.replies);
    }
  }
  
  // If no pattern matched, use fallback
  return getRandomResponse(fallbackResponses);
}

// Helper to send message via socket
async function sendMessageViaSocket(userIdStr, message) {
  if (!global.io) {
    console.error('Socket.io instance not available');
    return false;
  }
  
  try {
    // Send typing indicator first (AI is typing)
    global.io.to(userIdStr).emit('user_typing', { isTyping: true, isAI: true });
    
    // Short delay before sending the message
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Send message to user's room
    global.io.to(userIdStr).emit('new_message', message);
    
    // Stop typing indicator
    global.io.to(userIdStr).emit('user_typing', { isTyping: false, isAI: true });
    
    return true;
  } catch (error) {
    console.error('Socket error when sending message:', error.message);
    return false;
  }
} 