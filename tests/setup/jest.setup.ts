// Import testing-library matchers
import '@testing-library/jest-dom';

// Mock window.alert
window.alert = jest.fn();

// Add any global mocks or setup needed for tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console.error, warn and log to reduce noise during tests
// Uncomment if needed for cleaner test output
/*
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});
*/

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
}); 