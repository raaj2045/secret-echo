module.exports = {
  // Set the test environment
  testEnvironment: 'node',
  
  // Files to run before tests
  setupFilesAfterEnv: ['./tests/setup.js'],
  
  // Coverage settings
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**'
  ],
  
  // Test matching
  testMatch: ['**/tests/**/*.test.js'],
  
  // Timeouts for slow tests
  testTimeout: 10000,
  
  // Verbose output
  verbose: true
}; 