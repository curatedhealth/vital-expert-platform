// Global setup for Jest test suite
// This file runs once before all tests

const { execSync } = require('child_process');

module.exports = async () => {
  console.log('🏥 VITAL Path Healthcare AI - Test Suite Setup');
  console.log('Setting up global test environment...');

  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_APP_ENV = 'test';

  // Healthcare compliance test settings
  process.env.TEST_HIPAA_MODE = 'enabled';
  process.env.TEST_PHI_PROTECTION = 'strict';
  process.env.TEST_MEDICAL_VALIDATION = 'enabled';

  // Mock external services for testing
  process.env.MOCK_OPENAI_API = 'true';
  process.env.MOCK_SUPABASE = 'true';
  process.env.MOCK_MEDICAL_APIS = 'true';

  // Test database setup
  console.log('Setting up test database environment...');

  // Initialize test utilities
  global.testStartTime = Date.now();

  console.log('✅ Global test setup completed');
  console.log('📊 Healthcare compliance testing: ENABLED');
  console.log('🔒 PHI protection mode: STRICT');
  console.log('🧪 Medical validation testing: ENABLED');
  console.log('');
};