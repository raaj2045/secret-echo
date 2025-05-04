const messageController = require('../../controllers/messageController');
const Message = require('../../models/Message');
const aiResponder = require('../../utils/aiResponder');

// Mock dependencies
jest.mock('../../models/Message');
jest.mock('../../utils/aiResponder');

describe('Message Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { id: 'mockUserId' },
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Clear all mock calls between tests
    jest.clearAllMocks();
  });

  describe('getMessages', () => {
    it('should return all messages for a user', async () => {
      // Setup
      const mockMessages = [
        { _id: 'message1', content: 'Hello', sender: 'mockUserId' },
        { _id: 'message2', content: 'Hi there', sender: 'mockUserId' }
      ];

      // Mock Message.find to return messages
      Message.find.mockImplementation(() => ({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockMessages)
      }));

      // Execute
      await messageController.getMessages(req, res, next);

      // Assert
      expect(Message.find).toHaveBeenCalledWith({ sender: 'mockUserId' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockMessages
      });
    });

    it('should call next with error on exception', async () => {
      // Setup
      const mockError = new Error('Database error');
      Message.find.mockImplementation(() => {
        throw mockError;
      });

      // Execute
      await messageController.getMessages(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('sendMessage', () => {
    it('should create a new message and trigger AI response', async () => {
      // Setup
      req.body.content = 'Hello AI';
      
      const mockMessage = {
        _id: 'newMessageId',
        sender: 'mockUserId',
        receiver: 'ai',
        content: 'Hello AI'
      };

      const mockPopulatedMessage = {
        ...mockMessage,
        sender: {
          _id: 'mockUserId',
          username: 'testuser',
          avatarColor: '#FF5733'
        }
      };

      // Mock Message.create to return a new message
      Message.create.mockResolvedValue(mockMessage);

      // Mock Message.findById to return a populated message
      Message.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockPopulatedMessage)
      }));

      // Mock AI responder
      aiResponder.generateAIResponse.mockResolvedValue(null);

      // Execute
      await messageController.sendMessage(req, res, next);

      // Assert
      expect(Message.create).toHaveBeenCalledWith({
        sender: 'mockUserId',
        receiver: 'ai',
        content: 'Hello AI'
      });
      expect(Message.findById).toHaveBeenCalledWith('newMessageId');
      expect(aiResponder.generateAIResponse).toHaveBeenCalledWith('mockUserId', 'Hello AI');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPopulatedMessage
      });
    });

    it('should handle database errors when finding the created message', async () => {
      // Setup
      req.body.content = 'Hello AI';
      
      // Mock Message.create to return a new message
      Message.create.mockResolvedValue({ _id: 'newMessageId' });

      // Mock Message.findById to throw an error
      const mockError = new Error('Database error');
      Message.findById.mockImplementation(() => {
        throw mockError;
      });

      // Execute
      await messageController.sendMessage(req, res, next);

      // Assert
      expect(Message.create).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(mockError);
    });

    it('should return 400 if content is empty', async () => {
      // Setup
      req.body.content = '';

      // Execute
      await messageController.sendMessage(req, res, next);

      // Assert
      expect(Message.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Message content cannot be empty'
      });
    });

    it('should return 400 if content is only whitespace', async () => {
      // Setup
      req.body.content = '   ';

      // Execute
      await messageController.sendMessage(req, res, next);

      // Assert
      expect(Message.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Message content cannot be empty'
      });
    });
  });
}); 