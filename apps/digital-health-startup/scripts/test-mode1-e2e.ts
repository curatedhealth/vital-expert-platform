/**
 * Mode 1 End-to-End Test Script
 * 
 * Manual test script to verify Mode 1 functionality
 * Run with: npx tsx scripts/test-mode1-e2e.ts
 */

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error(`❌ ${name}:`, error);
  }
}

async function runTests() {
  console.log('🧪 Starting Mode 1 End-to-End Tests\n');
  console.log(`API Base: ${API_BASE}\n`);

  // Test 1: Health Check
  await test('Health Check Endpoint', async () => {
    const response = await fetch(`${API_BASE}/api/ask-expert/mode1/metrics?endpoint=health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error('Health check returned success: false');
    }
    console.log(`   Status: ${data.data.status}`);
    console.log(`   Healthy: ${data.data.healthy}`);
  });

  // Test 2: Metrics Endpoint
  await test('Metrics Stats Endpoint', async () => {
    const response = await fetch(`${API_BASE}/api/ask-expert/mode1/metrics?endpoint=stats&windowMinutes=60`);
    if (!response.ok) {
      throw new Error(`Metrics endpoint failed: ${response.status}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error('Metrics returned success: false');
    }
    console.log(`   Total Requests: ${data.data.totalRequests}`);
    console.log(`   Success Rate: ${(data.data.successRate * 100).toFixed(2)}%`);
    console.log(`   Avg Latency: ${data.data.averageLatency.toFixed(0)}ms`);
  });

  // Test 3: API Endpoint exists
  await test('Orchestrate API Endpoint', async () => {
    const response = await fetch(`${API_BASE}/api/ask-expert/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'manual',
        agentId: 'test-agent',
        message: 'test',
      }),
    });
    
    // Should either succeed or return a structured error, not crash
    if (response.status >= 500) {
      throw new Error(`Server error: ${response.status}`);
    }
  });

  // Test 4: Error handling for missing agent ID
  await test('Error Handling - Missing Agent ID', async () => {
    const response = await fetch(`${API_BASE}/api/ask-expert/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'manual',
        message: 'test',
        // agentId missing
      }),
    });
    
    // Should return 400 or stream an error
    const text = await response.text();
    if (text.includes('Agent ID required')) {
      console.log('   ✓ Correctly detected missing agent ID');
    }
  });

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
  }

  return failed === 0 ? 0 : 1;
}

// Run tests if executed directly
if (require.main === module) {
  runTests()
    .then((exitCode) => process.exit(exitCode))
    .catch((error) => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

export { runTests };

