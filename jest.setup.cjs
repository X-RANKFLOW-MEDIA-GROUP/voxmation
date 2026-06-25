// Mock environment variables
process.env.NODE_ENV = 'test';

// Suppress console logs in tests unless explicitly needed
const originalConsole = console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error visible for debugging
  error: originalConsole.error
};

// Global test utilities
global.testUtils = {
  mockDelay: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))
};
