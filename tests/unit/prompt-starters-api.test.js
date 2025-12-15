/**
 * Unit Tests: Prompt Starters API
 * Tests the /api/prompt-starters endpoint
 */

const TEST_AGENT_IDS = [
  '26391c1f-4414-487b-a8f6-8704881f25ad', // health_economics_modeler - 199 starters
  '1c80e497-0cd9-4802-b143-1bdb519d7de3', // payer_strategy_advisor - 119 starters
];

const API_URL = process.env.API_URL || 'http://localhost:3000';

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

async function runPromptStartersAPITests() {
  const suite = new TestSuite('Prompt Starters API Tests');

  console.log(`\n🧪 Running ${suite.name}...\n`);

  // Test 1: Valid request with agent IDs
  await suite.test('Returns 200 OK for valid request', async () => {
    const response = await fetch(`${API_URL}/api/prompt-starters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentIds: TEST_AGENT_IDS }),
    });

    assertEqual(response.status, 200, 'Status should be 200');
    assert(response.ok, 'Response should be ok');
  });

  // Test 2: Response structure
  await suite.test('Response has correct structure', async () => {
    const response = await fetch(`${API_URL}/api/prompt-starters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentIds: TEST_AGENT_IDS }),
    });

    const data = await response.json();
    
    assert(data.prompts, 'Response should have prompts array');
    assert(Array.isArray(data.prompts), 'Prompts should be an array');
    assert(data.agents, 'Response should have agents array');
    assert(data.domains, 'Response should have domains array');
    assert(typeof data.total === 'number', 'Response should have total count');
  });

  // Test 3: Prompts array not empty
  await suite.test('Returns non-empty prompts array', async () => {
    const response = await fetch(`${API_URL}/api/prompt-starters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentIds: TEST_AGENT_IDS }),
    });

    const data = await response.json();
    assertGreaterThan(data.prompts.length, 0, 'Should return at least 1 prompt');
  });

  // Test 4: Each prompt has required fields
  await suite.test('Each prompt has required fields', async () => {
    const response = await fetch(`${API_URL}/api/prompt-starters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentIds: TEST_AGENT_IDS }),
    });

    const data = await response.json();
    const prompt = data.prompts[0];

    assert(prompt.id, 'Prompt should have id');
    assert(prompt.prompt_id, 'Prompt should have prompt_id');
    assert(prompt.prompt_starter, 'Prompt should have prompt_starter text');
    assert(prompt.display_name, 'Prompt should have display_name');
    assert(prompt.domain, 'Prompt should have domain');
    assert(prompt.complexity_level, 'Prompt should have complexity_level');
  });

  // Test 5: Respects limit of 12 prompts
  await suite.test('Respects 12 prompt limit', async () => {
    const response = await fetch(`${API_URL}/api/prompt-starters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentIds: TEST_AGENT_IDS }),
    });

    const data = await response.json();
    assert(data.prompts.length <= 12, 'Should return max 12 prompts');
  });

  // Test 6: Empty agent IDs returns 400
  await suite.test('Returns 400 for empty agentIds', async () => {
    const response = await fetch(`${API_URL}/api/prompt-starters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentIds: [] }),
    });

    assertEqual(response.status, 400, 'Should return 400 for empty array');
  });

  // Test 7: Missing agentIds returns 400
  await suite.test('Returns 400 for missing agentIds', async () => {
    const response = await fetch(`${API_URL}/api/prompt-starters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assertEqual(response.status, 400, 'Should return 400 for missing agentIds');
  });

  // Test 8: Invalid agent ID returns empty array
  await suite.test('Returns empty array for invalid agent ID', async () => {
    const response = await fetch(`${API_URL}/api/prompt-starters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentIds: ['00000000-0000-0000-0000-000000000000'] }),
    });

    const data = await response.json();
    assertEqual(data.prompts.length, 0, 'Should return empty array for invalid ID');
  });

  // Test 9: Single agent ID works
  await suite.test('Works with single agent ID', async () => {
    const response = await fetch(`${API_URL}/api/prompt-starters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentIds: [TEST_AGENT_IDS[0]] }),
    });

    const data = await response.json();
    assert(response.ok, 'Should work with single agent');
    assertGreaterThan(data.prompts.length, 0, 'Should return prompts');
  });

  // Test 10: Prompts are ordered by position
  await suite.test('Prompts are ordered by position', async () => {
    const response = await fetch(`${API_URL}/api/prompt-starters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentIds: [TEST_AGENT_IDS[0]] }),
    });

    const data = await response.json();
    if (data.prompts.length > 1) {
      const positions = data.prompts.map(p => p.position);
      const sorted = [...positions].sort((a, b) => a - b);
      assert(
        JSON.stringify(positions) === JSON.stringify(sorted),
        'Prompts should be ordered by position'
      );
    }
  });

  return suite.summary();
}

// Run tests if executed directly
if (require.main === module) {
  runPromptStartersAPITests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite error:', error);
      process.exit(1);
    });
}

module.exports = { runPromptStartersAPITests };

