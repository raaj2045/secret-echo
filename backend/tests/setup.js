// Setup file for common test configurations

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

// Mock console methods to keep test output clean
global.originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn
};

// Silent logs in test mode (comment these out for debugging tests)
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();

// Cleanup after all tests
afterAll(() => {
  // Restore console methods
  console.log = global.originalConsole.log;
  console.error = global.originalConsole.error;
  console.warn = global.originalConsole.warn;
}); 