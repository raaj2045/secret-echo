const { generateAIResponse } = require('../../utils/aiResponder');
const Message = require('../../models/Message');

// Mock dependencies
jest.mock('../../models/Message');

describe('AI Responder', () => {
  // Create a mock for global.io before each test
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock global.io for socket testing
    global.io = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn()
    };
    
    // Mock the Message.create function
    const mockMessage = {
      _id: 'mockMessageId',
      sender: 'mockUserId',
      receiver: 'user',
      content: 'Mock AI response',
      toObject: jest.fn().mockReturnValue({
        _id: 'mockMessageId',
        sender: 'mockUserId',
        receiver: 'user',
        content: 'Mock AI response'
      })
    };
    
    Message.create.mockResolvedValue(mockMessage);
    
    // Mock the Message.findById function
    Message.findById.mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue({
        ...mockMessage,
        sender: {
          _id: 'mockUserId',
          username: 'testuser',
          avatarColor: '#FF5733'
        },
        toObject: mockMessage.toObject
      })
    }));
    
    // Mock setTimeout to execute immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());
  });
  
  afterEach(() => {
    // Restore setTimeout
    jest.restoreAllMocks();
    // Clean up global.io mock
    delete global.io;
  });

  it('should generate an AI response and emit it via socket', async () => {
    // Execute
    const result = await generateAIResponse('mockUserId', 'Hello');

    // Assert basic functionality (not testing specific pattern matching)
    expect(Message.create).toHaveBeenCalledWith(expect.objectContaining({
      sender: 'mockUserId',
      receiver: 'user',
      content: expect.any(String)
    }));
    
    expect(Message.findById).toHaveBeenCalledWith('mockMessageId');
    
    // Check socket emission - 3 calls for typing start, message, typing end
    expect(global.io.to).toHaveBeenCalledWith('mockUserId');
    expect(global.io.emit).toHaveBeenCalledTimes(3);
    
    // Check the specific socket events emitted
    // First call should be typing indicator (typing started)
    expect(global.io.emit.mock.calls[0][0]).toBe('user_typing');
    expect(global.io.emit.mock.calls[0][1]).toEqual({ isTyping: true, isAI: true });
    
    // Second call should be the message
    expect(global.io.emit.mock.calls[1][0]).toBe('new_message');
    
    // Third call should be typing indicator (typing ended)
    expect(global.io.emit.mock.calls[2][0]).toBe('user_typing');
    expect(global.io.emit.mock.calls[2][1]).toEqual({ isTyping: false, isAI: true });
    
    // Verify the populated message is returned
    expect(result).toEqual(expect.objectContaining({
      _id: 'mockMessageId',
      sender: expect.objectContaining({
        _id: 'mockUserId',
        username: 'testuser'
      }),
      content: 'Mock AI response'
    }));
  });

  it('should handle missing global.io gracefully', async () => {
    // Setup - remove global.io to simulate missing socket
    delete global.io;
    
    // Execute
    const result = await generateAIResponse('mockUserId', 'Hello');
    
    // Assert
    expect(Message.create).toHaveBeenCalled();
    expect(Message.findById).toHaveBeenCalled();
    expect(result).toBeTruthy(); // Should still return the message
  });

  it('should handle socket errors gracefully', async () => {
    // Setup - make socket emit throw an error
    global.io.emit.mockImplementation(() => {
      throw new Error('Socket error');
    });
    
    // Execute
    const result = await generateAIResponse('mockUserId', 'Hello');
    
    // Assert
    expect(Message.create).toHaveBeenCalled();
    expect(Message.findById).toHaveBeenCalled();
    expect(result).toBeTruthy(); // Should still return the message despite socket error
  });

  it('should handle database errors when creating message', async () => {
    // Setup - simulate DB error when creating message
    Message.create.mockRejectedValue(new Error('Database error'));
    
    // Execute
    const result = await generateAIResponse('mockUserId', 'Hello');
    
    // Assert
    expect(result).toBeNull();
  });

  it('should handle database errors when finding message', async () => {
    // Setup - simulate DB error when finding message
    Message.findById.mockImplementation(() => {
      throw new Error('Database error');
    });
    
    // Execute
    const result = await generateAIResponse('mockUserId', 'Hello');
    
    // Assert
    expect(Message.create).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should generate an appropriate response based on input', async () => {
    // Test with different inputs to trigger different response patterns
    
    // Test with a greeting
    await generateAIResponse('mockUserId', 'hello there');
    expect(Message.create).toHaveBeenCalledTimes(1);
    
    // Test with a question
    await generateAIResponse('mockUserId', 'how are you?');
    expect(Message.create).toHaveBeenCalledTimes(2);
    
    // Test with a thank you
    await generateAIResponse('mockUserId', 'thank you for your help');
    expect(Message.create).toHaveBeenCalledTimes(3);
    
    // Test with an unknown input (should use fallback)
    await generateAIResponse('mockUserId', 'xyzabcdefg');
    expect(Message.create).toHaveBeenCalledTimes(4);
  });

  // Add test for invalid parameters - missing userId or userMessage
  it('should return null if userId or userMessage is missing', async () => {
    // Test missing userId
    const result1 = await generateAIResponse(null, 'Hello');
    expect(result1).toBeNull();
    
    // Test missing userMessage
    const result2 = await generateAIResponse('mockUserId', null);
    expect(result2).toBeNull();
    
    // Test both missing
    const result3 = await generateAIResponse(null, null);
    expect(result3).toBeNull();
    
    // No database calls should be made in these cases
    expect(Message.create).not.toHaveBeenCalled();
  });
}); 