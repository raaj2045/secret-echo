const { errorHandler } = require('../../middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Spy on console.error to prevent actual logging during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should handle general errors with a 500 status code', () => {
    // Setup
    const err = new Error('Server error');
    
    // Execute
    errorHandler(err, req, res, next);
    
    // Assert
    expect(console.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Server error'
    });
  });

  it('should use default error message when error.message is undefined', () => {
    // Setup - create an error without a message property
    const err = {};
    
    // Execute
    errorHandler(err, req, res, next);
    
    // Assert
    expect(console.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Server Error'
    });
  });

  it('should handle errors with custom status codes', () => {
    // Setup
    const err = new Error('Custom error');
    err.statusCode = 400;
    
    // Execute
    errorHandler(err, req, res, next);
    
    // Assert
    expect(console.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Custom error'
    });
  });

  it('should handle CastError (Mongoose bad ObjectId)', () => {
    // Setup
    const err = new Error('Cast error');
    err.name = 'CastError';
    
    // Execute
    errorHandler(err, req, res, next);
    
    // Assert
    expect(console.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Resource not found'
    });
  });

  it('should handle duplicate key errors (code 11000)', () => {
    // Setup
    const err = new Error('Duplicate key');
    err.code = 11000;
    
    // Execute
    errorHandler(err, req, res, next);
    
    // Assert
    expect(console.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Duplicate field value entered'
    });
  });

  it('should handle Mongoose validation errors', () => {
    // Setup
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.errors = {
      field1: { message: 'Field1 is required' },
      field2: { message: 'Field2 is invalid' }
    };
    
    // Execute
    errorHandler(err, req, res, next);
    
    // Assert
    expect(console.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: ['Field1 is required', 'Field2 is invalid']
    });
  });
}); 