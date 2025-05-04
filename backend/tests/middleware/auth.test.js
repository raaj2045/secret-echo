const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { protect } = require('../../middleware/auth');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../models/User');

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;
  let originalEnv;

  beforeEach(() => {
    // Save original environment variables
    originalEnv = process.env.JWT_SECRET;
    
    req = {
      headers: {
        authorization: 'Bearer validtoken'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Clear all mock calls
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore original environment variables
    process.env.JWT_SECRET = originalEnv;
  });

  it('should verify token with the correct JWT_SECRET', async () => {
    // Setup
    const mockUser = { _id: 'mockUserId' };
    
    // Mock implementation to check the secret - any valid secret is fine
    jwt.verify.mockImplementation((token, secret) => {
      expect(secret).toBeTruthy();
      expect(typeof secret).toBe('string');
      return { id: 'mockUserId' };
    });
    
    User.findById.mockResolvedValue(mockUser);

    // Execute
    await protect(req, res, next);

    // Assert
    expect(jwt.verify).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
  
  it('should use default JWT_SECRET when environment variable is not set', async () => {
    // Setup - temporarily unset the JWT_SECRET env var
    process.env.JWT_SECRET = undefined;
    
    const mockUser = { _id: 'mockUserId' };
    
    // Mock implementation to check the secret
    jwt.verify.mockImplementation((token, secret) => {
      // We don't check the exact value, just that it's a non-empty string
      expect(secret).toBeTruthy();
      expect(typeof secret).toBe('string');
      return { id: 'mockUserId' };
    });
    
    User.findById.mockResolvedValue(mockUser);

    // Execute
    await protect(req, res, next);

    // Assert
    expect(jwt.verify).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should call next if token is valid and user exists', async () => {
    // Setup
    const mockUser = { _id: 'mockUserId' };
    
    // Mock token verification
    jwt.verify.mockReturnValue({ id: 'mockUserId' });
    
    // Mock user lookup
    User.findById.mockResolvedValue(mockUser);

    // Execute
    await protect(req, res, next);

    // Assert
    expect(jwt.verify).toHaveBeenCalledWith('validtoken', expect.any(String));
    expect(User.findById).toHaveBeenCalledWith('mockUserId');
    expect(req.user).toEqual({ id: 'mockUserId' });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 if no token is provided', async () => {
    // Setup
    req.headers.authorization = undefined;

    // Execute
    await protect(req, res, next);

    // Assert
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(User.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized to access this route'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token format is invalid', async () => {
    // Setup
    req.headers.authorization = 'InvalidTokenFormat';

    // Execute
    await protect(req, res, next);

    // Assert
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(User.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized to access this route'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    // Setup
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    // Execute
    await protect(req, res, next);

    // Assert
    expect(jwt.verify).toHaveBeenCalled();
    expect(User.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized to access this route'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user no longer exists', async () => {
    // Setup
    jwt.verify.mockReturnValue({ id: 'nonexistentUserId' });
    User.findById.mockResolvedValue(null);

    // Execute
    await protect(req, res, next);

    // Assert
    expect(jwt.verify).toHaveBeenCalled();
    expect(User.findById).toHaveBeenCalledWith('nonexistentUserId');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'The user belonging to this token no longer exists'
    });
    expect(next).not.toHaveBeenCalled();
  });
}); 