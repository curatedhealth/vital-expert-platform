/**
 * Integration Tests: Full Prompt Starters Flow
 * Tests the complete flow from selecting agents to getting detailed prompts
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

const TEST_AGENT_IDS = [
  '26391c1f-4414-487b-a8f6-8704881f25ad', // health_economics_modeler
];

class TestSuite {
  constructor(name) {
    this.name = name;
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

function assertGreaterThan(actual, minimum, message) {
  if (actual <= minimum) {
    throw new Error(message || `Expected ${actual} to be greater than ${minimum}`);
  }
}

async function runIntegrationTests() {
  const suite = new TestSuite('Integration Tests: Full Flow');

  console.log(`\n🧪 Running ${suite.name}...\n`);

  let promptStarters = null;
  let firstPromptId = null;
  let detailedPrompt = null;

  // Test 1: Fetch prompt starters for agent
  await suite.test('Step 1: Fetch prompt starters for agent', async () => {
    const response = await fetch(`${API_URL}/api/prompt-starters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentIds: TEST_AGENT_IDS }),
    });

    assert(response.ok, 'Should fetch prompt starters successfully');
    const data = await response.json();
    promptStarters = data.prompts;
    
    assertGreaterThan(promptStarters.length, 0, 'Should have at least 1 starter');
    console.log(`     → Found ${promptStarters.length} prompt starters`);
  });

  // Test 2: Extract prompt ID from starter
  await suite.test('Step 2: Extract prompt ID from starter', async () => {
    assert(promptStarters, 'Should have prompt starters from previous step');
    firstPromptId = promptStarters[0].prompt_id;
    
    assert(firstPromptId, 'First prompt should have prompt_id');
    console.log(`     → Extracted prompt ID: ${firstPromptId}`);
  });

  // Test 3: Fetch detailed prompt
  await suite.test('Step 3: Fetch detailed prompt using prompt_id', async () => {
    assert(firstPromptId, 'Should have prompt ID from previous step');
    
    const response = await fetch(`${API_URL}/api/prompt-detail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptId: firstPromptId }),
    });

    assert(response.ok, 'Should fetch detailed prompt successfully');
    const data = await response.json();
    detailedPrompt = data.prompt;
    
    assert(detailedPrompt, 'Should receive detailed prompt');
    assert(detailedPrompt.user_prompt, 'Should have user_prompt');
    console.log(`     → Got detailed prompt (${detailedPrompt.user_prompt.length} chars)`);
  });

  // Test 4: Verify detailed prompt has more content than starter
  await suite.test('Step 4: Detailed prompt has more content than starter', async () => {
    assert(promptStarters && detailedPrompt, 'Should have both starters and detail');
    
    const starter = promptStarters[0];
    const starterLength = starter.prompt_starter.length;
    const detailLength = detailedPrompt.user_prompt.length;
    
    assertGreaterThan(
      detailLength,
      starterLength,
      'Detailed prompt should be longer than starter'
    );
    console.log(`     → Starter: ${starterLength} chars, Detail: ${detailLength} chars`);
  });

  // Test 5: Verify metadata consistency
  await suite.test('Step 5: Verify metadata consistency', async () => {
    assert(promptStarters && detailedPrompt, 'Should have both data sets');
    
    const starter = promptStarters[0];
    
    // Check if domains and complexity match or are compatible
    assert(
      starter.domain && detailedPrompt.domain,
      'Both should have domain information'
    );
    assert(
      starter.complexity_level && detailedPrompt.complexity_level,
      'Both should have complexity level'
    );
    console.log(`     → Domain: ${detailedPrompt.domain}, Complexity: ${detailedPrompt.complexity_level}`);
  });

  // Test 6: Verify IDs match
  await suite.test('Step 6: Verify prompt IDs match', async () => {
    assert(firstPromptId && detailedPrompt, 'Should have both IDs');
    
    assert(
      firstPromptId === detailedPrompt.id,
      'Prompt IDs should match'
    );
    console.log(`     → IDs match: ${firstPromptId === detailedPrompt.id}`);
  });

  // Test 7: Complete flow with multiple agents
  await suite.test('Step 7: Test flow with multiple agents', async () => {
    const multipleAgentIds = [
      '26391c1f-4414-487b-a8f6-8704881f25ad', // health_economics_modeler
      '1c80e497-0cd9-4802-b143-1bdb519d7de3', // payer_strategy_advisor
    ];

    const response = await fetch(`${API_URL}/api/prompt-starters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentIds: multipleAgentIds }),
    });

    const data = await response.json();
    assertGreaterThan(data.prompts.length, 0, 'Should work with multiple agents');
    assertGreaterThan(data.agents.length, 0, 'Should list multiple agents');
    console.log(`     → ${data.prompts.length} starters from ${data.agents.length} agents`);
  });

  // Test 8: Verify all returned prompts have valid prompt_ids
  await suite.test('Step 8: All starters have valid prompt_ids', async () => {
    const response = await fetch(`${API_URL}/api/prompt-starters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentIds: TEST_AGENT_IDS }),
    });

    const data = await response.json();
    const allHavePromptIds = data.prompts.every(p => p.prompt_id);
    
    assert(allHavePromptIds, 'All starters should have prompt_id');
    console.log(`     → All ${data.prompts.length} starters have valid prompt_ids`);
  });

  return suite.summary();
}

// Run tests if executed directly
if (require.main === module) {
  runIntegrationTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite error:', error);
      process.exit(1);
    });
}

module.exports = { runIntegrationTests };

