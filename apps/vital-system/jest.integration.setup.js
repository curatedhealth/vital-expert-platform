/**
 * Jest Integration Test Setup
 *
 * Setup for integration tests that require database/external services
 */

// Setup environment variables for integration tests
process.env.NODE_ENV = 'test';

// Use test database (if available)
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379';

// Longer timeout for integration tests
jest.setTimeout(30000); // 30 seconds

// Setup and teardown hooks
beforeAll(async () => {
  // Initialize test database connection
  // Run migrations if needed
  console.log('Integration tests: Setting up test environment...');
});

afterAll(async () => {
  // Close database connections
  // Clean up test data
  console.log('Integration tests: Cleaning up test environment...');
});

// Clear test data between tests
afterEach(async () => {
  // Optional: Clear test data after each test
});
