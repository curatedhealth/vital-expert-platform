#!/usr/bin/env npx tsx

/**
 * Test Runner Script for VITAL Path Agent System
 * Executes comprehensive test suite and generates reports
 */

import { AgentSystemTestSuite } from '../src/__tests__/agents/test-agent-system';

async function runTests() {
  console.log('🚀 VITAL Path Digital Health Agent System - Test Suite');
  console.log('====================================================\n');

  const testSuite = new AgentSystemTestSuite();

  try {
    const results = await testSuite.runAllTests();

    console.log('\n📋 Detailed Results:');
    console.log('====================');

    results.results.forEach((result: any) => {
      const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      console.log(`${statusIcon} ${result.test} (${result.duration}ms)`);
      if (result.status === 'FAIL') {
        console.log(`   Error: ${result.message}`);
      }
    });

    console.log('\n🎯 Recommendations:');
    console.log('===================');
    if (results.recommendations.length === 0) {
      console.log('✅ All tests passed! System is ready for deployment.');
    } else {
      results.recommendations.forEach(rec => {
        console.log(`• ${rec}`);
      });
    }

    console.log('\n📈 System Status:');
    console.log('=================');
    if (results.summary.success_rate === 100) {
      console.log('🟢 SYSTEM READY - All tests passed, system is production-ready');
    } else if (results.summary.success_rate >= 80) {
      console.log('🟡 SYSTEM CAUTION - Most tests passed, review failed tests before deployment');
    } else {
      console.log('🔴 SYSTEM NOT READY - Multiple test failures, significant issues need resolution');
    }

    // Exit with appropriate code
    process.exit(results.summary.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Test suite execution failed:', error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runTests };