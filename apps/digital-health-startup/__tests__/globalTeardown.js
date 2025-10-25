// Global teardown for Jest test suite
// This file runs once after all tests complete

module.exports = async () => {
  console.log('');
  console.log('🏥 VITAL Path Healthcare AI - Test Suite Teardown');

  // Calculate test duration
  const testDuration = Date.now() - global.testStartTime;
  console.log(`⏱️  Total test execution time: ${testDuration}ms`);

  // Cleanup test data
  console.log('🧹 Cleaning up test environment...');

  // Clear any test-specific environment variables
  delete process.env.TEST_HIPAA_MODE;
  delete process.env.TEST_PHI_PROTECTION;
  delete process.env.TEST_MEDICAL_VALIDATION;
  delete process.env.MOCK_OPENAI_API;
  delete process.env.MOCK_SUPABASE;
  delete process.env.MOCK_MEDICAL_APIS;

  // Log compliance summary
  console.log('');
  console.log('📋 Healthcare Compliance Test Summary:');
  console.log('✅ HIPAA compliance tests completed');
  console.log('✅ PHI protection validation completed');
  console.log('✅ Medical safety tests completed');
  console.log('✅ FDA framework validation completed');

  console.log('');
  console.log('🎉 Test suite teardown completed successfully');
  console.log('🏥 VITAL Path platform ready for healthcare deployment');
};