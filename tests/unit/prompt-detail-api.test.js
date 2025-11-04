/**
 * Unit Tests: Prompt Detail API
 * Tests the /api/prompt-detail endpoint
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Test prompt ID (from health_economics_modeler agent)
const TEST_PROMPT_ID = '30e0d61d-00e7-4618-880a-50ce752b9307'; // analyze-best-practice-guide

class TestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  async test(testName, testFn) {
    try {
      await testFn();
      this.passed++;
      console.log(`  ✅ ${testName}`);
      return true;
    } catch (error) {
      this.failed++;
      console.log(`  ❌ ${testName}`);
      console.log(`     Error: ${error.message}`);
      return false;
    }
  }

  summary() {
    const total = this.passed + this.failed;
    console.log(`\n📊 ${this.name} Summary:`);
    console.log(`   Total: ${total} | Passed: ${this.passed} | Failed: ${this.failed}`);
    console.log(`   Success Rate: ${((this.passed / total) * 100).toFixed(1)}%\n`);
    return this.failed === 0;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertGreaterThan(actual, minimum, message) {
  if (actual <= minimum) {
    throw new Error(message || `Expected ${actual} to be greater than ${minimum}`);
  }
}

async function runPromptDetailAPITests() {
  const suite = new TestSuite('Prompt Detail API Tests');

  console.log(`\n🧪 Running ${suite.name}...\n`);

  // Test 1: POST request with valid prompt ID
  await suite.test('POST: Returns 200 OK for valid prompt ID', async () => {
    const response = await fetch(`${API_URL}/api/prompt-detail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptId: TEST_PROMPT_ID }),
    });

    assertEqual(response.status, 200, 'Status should be 200');
    assert(response.ok, 'Response should be ok');
  });

  // Test 2: GET request with valid prompt ID
  await suite.test('GET: Returns 200 OK for valid prompt ID', async () => {
    const response = await fetch(
      `${API_URL}/api/prompt-detail?promptId=${TEST_PROMPT_ID}`,
      { method: 'GET' }
    );

    assertEqual(response.status, 200, 'Status should be 200');
    assert(response.ok, 'Response should be ok');
  });

  // Test 3: Response structure
  await suite.test('Response has correct structure', async () => {
    const response = await fetch(`${API_URL}/api/prompt-detail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptId: TEST_PROMPT_ID }),
    });

    const data = await response.json();
    
    assert(data.prompt, 'Response should have prompt object');
    assert(data.prompt.id, 'Prompt should have id');
    assert(data.prompt.name, 'Prompt should have name');
    assert(data.prompt.user_prompt, 'Prompt should have user_prompt');
  });

  // Test 4: User prompt has substantial content
  await suite.test('User prompt has substantial content', async () => {
    const response = await fetch(`${API_URL}/api/prompt-detail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptId: TEST_PROMPT_ID }),
    });

    const data = await response.json();
    assertGreaterThan(
      data.prompt.user_prompt.length,
      100,
      'User prompt should have substantial content (>100 chars)'
    );
  });

  // Test 5: Includes all required fields
  await suite.test('Includes all required prompt fields', async () => {
    const response = await fetch(`${API_URL}/api/prompt-detail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptId: TEST_PROMPT_ID }),
    });

    const data = await response.json();
    const prompt = data.prompt;

    assert(prompt.id, 'Should have id');
    assert(prompt.name, 'Should have name');
    assert(prompt.display_name, 'Should have display_name');
    assert(prompt.user_prompt, 'Should have user_prompt');
    assert(prompt.domain, 'Should have domain');
    assert(prompt.complexity_level, 'Should have complexity_level');
  });

  // Test 6: Missing prompt ID returns 400
  await suite.test('Returns 400 for missing promptId', async () => {
    const response = await fetch(`${API_URL}/api/prompt-detail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assertEqual(response.status, 400, 'Should return 400 for missing promptId');
  });

  // Test 7: Invalid prompt ID returns 404
  await suite.test('Returns 404 for invalid prompt ID', async () => {
    const response = await fetch(`${API_URL}/api/prompt-detail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptId: '00000000-0000-0000-0000-000000000000' }),
    });

    // Should return 404 or 500 depending on implementation
    assert(
      response.status === 404 || response.status === 500,
      'Should return 404 or 500 for invalid ID'
    );
  });

  // Test 8: Tags array exists
  await suite.test('Tags array exists', async () => {
    const response = await fetch(`${API_URL}/api/prompt-detail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptId: TEST_PROMPT_ID }),
    });

    const data = await response.json();
    assert(Array.isArray(data.prompt.tags), 'Tags should be an array');
  });

  // Test 9: Metadata object exists
  await suite.test('Metadata object exists', async () => {
    const response = await fetch(`${API_URL}/api/prompt-detail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptId: TEST_PROMPT_ID }),
    });

    const data = await response.json();
    assert(typeof data.prompt.metadata === 'object', 'Metadata should be an object');
  });

  return suite.summary();
}

// Run tests if executed directly
if (require.main === module) {
  runPromptDetailAPITests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite error:', error);
      process.exit(1);
    });
}

module.exports = { runPromptDetailAPITests };

