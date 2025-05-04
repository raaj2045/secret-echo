const authController = require('../../controllers/authController');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      user: { id: 'mockUserId' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Clear all mock calls between tests
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      // Setup
      const mockUser = {
        _id: 'mockUserId',
        username: 'testuser',
        email: 'test@example.com',
        avatarColor: '#FF5733'
      };

      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock User.findOne to return null (no existing user)
      User.findOne.mockResolvedValue(null);

      // Mock User.create to return a new user
      User.create.mockResolvedValue(mockUser);

      // Mock jwt.sign to return a token
      jwt.sign.mockReturnValue('mockToken');

      // Execute
      await authController.register(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: 'test@example.com' }, { username: 'testuser' }]
      });
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mockToken',
        user: {
          id: 'mockUserId',
          username: 'testuser',
          email: 'test@example.com',
          avatarColor: '#FF5733'
        }
      });
    });

    it('should return 400 if user already exists', async () => {
      // Setup
      req.body = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      };

      // Mock User.findOne to return an existing user
      User.findOne.mockResolvedValue({
        _id: 'existingUserId',
        username: 'existinguser',
        email: 'existing@example.com'
      });

      // Execute
      await authController.register(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User with that email or username already exists'
      });
    });

    it('should call next with error on exception', async () => {
      // Setup
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock User.findOne to throw an error
      const mockError = new Error('Database error');
      User.findOne.mockRejectedValue(mockError);

      // Execute
      await authController.register(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('login', () => {
    it('should verify JWT_SECRET and JWT_EXPIRES_IN configuration', async () => {
      // This test verifies that the auth module's configuration variables are properly used
      const mockUser = {
        _id: 'mockUserId',
        username: 'testuser',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock implementation to check the secret and expiration
      jwt.sign.mockImplementation((payload, secret, options) => {
        expect(secret).toBe('test-secret-key'); // Our test environment value
        expect(options.expiresIn).toBe('1h');   // Our test environment value
        return 'mockToken';
      });

      // Mock dependencies
      User.findOne.mockResolvedValue(mockUser);

      // Execute
      await authController.login(req, res, next);

      // Assert JWT signing was called with the right parameters
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'mockUserId' },
        expect.any(String),
        expect.objectContaining({ expiresIn: expect.any(String) })
      );
    });

    it('should login user and return token if credentials are valid', async () => {
      // Setup
      const mockUser = {
        _id: 'mockUserId',
        username: 'testuser',
        email: 'test@example.com',
        avatarColor: '#FF5733',
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock User.findOne to return a user
      User.findOne.mockResolvedValue(mockUser);

      // Mock jwt.sign to return a token
      jwt.sign.mockReturnValue('mockToken');

      // Execute
      await authController.login(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mockToken',
        user: {
          id: 'mockUserId',
          username: 'testuser',
          email: 'test@example.com',
          avatarColor: '#FF5733'
        }
      });
    });

    it('should handle database errors when comparing passwords', async () => {
      // Setup
      const mockUser = {
        _id: 'mockUserId',
        email: 'test@example.com',
        comparePassword: jest.fn().mockRejectedValue(new Error('Password comparison error'))
      };

      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock User.findOne to return a user
      User.findOne.mockResolvedValue(mockUser);

      // Execute
      await authController.login(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalled();
      expect(mockUser.comparePassword).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should return 401 if user does not exist', async () => {
      // Setup
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Mock User.findOne to return null (no user found)
      User.findOne.mockResolvedValue(null);

      // Execute
      await authController.login(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should return 401 if password is incorrect', async () => {
      // Setup
      const mockUser = {
        _id: 'mockUserId',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Mock User.findOne to return a user
      User.findOne.mockResolvedValue(mockUser);

      // Execute
      await authController.login(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalled();
      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user information', async () => {
      // Setup
      const mockUser = {
        _id: 'mockUserId',
        username: 'testuser',
        email: 'test@example.com',
        avatarColor: '#FF5733'
      };

      // Mock User.findById to return a user
      User.findById.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockUser)
      }));

      // Execute
      await authController.getCurrentUser(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('mockUserId');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: {
          id: 'mockUserId',
          username: 'testuser',
          email: 'test@example.com',
          avatarColor: '#FF5733'
        }
      });
    });

    it('should return 404 if user not found', async () => {
      // Mock User.findById to return null
      User.findById.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(null)
      }));

      // Execute
      await authController.getCurrentUser(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('mockUserId');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });
}); 