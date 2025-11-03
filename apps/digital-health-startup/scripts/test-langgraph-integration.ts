#!/usr/bin/env ts-node
/**
 * Test script for LangGraph integration
 * Tests all 4 modes with and without LangGraph
 * 
 * Usage:
 *   npm run test:langgraph
 *   # or
 *   ts-node scripts/test-langgraph-integration.ts
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface TestCase {
  name: string;
  mode: 'manual' | 'automatic' | 'autonomous' | 'multi-expert';
  agentId?: string;
  message: string;
  useLangGraph: boolean;
}

const TEST_CASES: TestCase[] = [
  // Mode 1: Manual Interactive
  {
    name: 'Mode 1 (Standard)',
    mode: 'manual',
    agentId: 'accelerated_approval_strategist',
    message: 'What are the key requirements for accelerated approval?',
    useLangGraph: false
  },
  {
    name: 'Mode 1 (LangGraph)',
    mode: 'manual',
    agentId: 'accelerated_approval_strategist',
    message: 'What are the key requirements for accelerated approval?',
    useLangGraph: true
  },
  
  // Mode 2: Automatic Agent Selection
  {
    name: 'Mode 2 (Standard)',
    mode: 'automatic',
    message: 'How do I navigate FDA regulations for medical devices?',
    useLangGraph: false
  },
  {
    name: 'Mode 2 (LangGraph)',
    mode: 'automatic',
    message: 'How do I navigate FDA regulations for medical devices?',
    useLangGraph: true
  },
  
  // Mode 3: Autonomous-Automatic
  {
    name: 'Mode 3 (Standard)',
    mode: 'autonomous',
    message: 'Create a comprehensive strategy for clinical trial design',
    useLangGraph: false
  },
  {
    name: 'Mode 3 (LangGraph)',
    mode: 'autonomous',
    message: 'Create a comprehensive strategy for clinical trial design',
    useLangGraph: true
  },
  
  // Mode 4: Multi-Expert
  {
    name: 'Mode 4 (Standard)',
    mode: 'multi-expert',
    agentId: 'regulatory_framework_architect',
    message: 'Analyze the regulatory compliance landscape for our product',
    useLangGraph: false
  },
  {
    name: 'Mode 4 (LangGraph)',
    mode: 'multi-expert',
    agentId: 'regulatory_framework_architect',
    message: 'Analyze the regulatory compliance landscape for our product',
    useLangGraph: true
  },
];

async function runTest(testCase: TestCase) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 Testing: ${testCase.name}`);
  console.log(`   Mode: ${testCase.mode}`);
  console.log(`   LangGraph: ${testCase.useLangGraph ? 'ENABLED' : 'DISABLED'}`);
  console.log(`${'='.repeat(80)}\n`);
  
  const startTime = Date.now();
  let chunkCount = 0;
  let workflowSteps: string[] = [];
  let responseContent = '';
  
  try {
    const response = await fetch(`${API_URL}/api/ask-expert/orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: testCase.mode,
        agentId: testCase.agentId,
        message: testCase.message,
        useLangGraph: testCase.useLangGraph,
        enableRAG: true,
        enableTools: false,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    if (!response.body) {
      throw new Error('Response body is null');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'workflow_step') {
              workflowSteps.push(data.step);
              console.log(`  📊 Workflow Step: ${data.step}`);
            } else if (data.type === 'chunk' && data.content) {
              chunkCount++;
              responseContent += data.content;
              process.stdout.write('.');
            } else if (data.type === 'done') {
              console.log('\n  ✅ Done');
            } else if (data.type === 'error') {
              console.error(`  ❌ Error: ${data.message}`);
            }
          } catch (parseError) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }
    
    const duration = Date.now() - startTime;
    
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📊 Results:`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Chunks: ${chunkCount}`);
    console.log(`   Response Length: ${responseContent.length} chars`);
    if (testCase.useLangGraph) {
      console.log(`   Workflow Steps: ${workflowSteps.join(' → ')}`);
    }
    console.log(`   First 200 chars: ${responseContent.substring(0, 200)}...`);
    console.log(`${'─'.repeat(80)}`);
    
    return {
      success: true,
      duration,
      chunkCount,
      responseLength: responseContent.length,
      workflowSteps,
    };
    
  } catch (error) {
    console.error(`\n❌ Test failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log('🚀 LangGraph Integration Test Suite');
  console.log(`API URL: ${API_URL}`);
  console.log(`Test Cases: ${TEST_CASES.length}`);
  
  const results: any[] = [];
  
  for (const testCase of TEST_CASES) {
    const result = await runTest(testCase);
    results.push({
      name: testCase.name,
      mode: testCase.mode,
      useLangGraph: testCase.useLangGraph,
      ...result,
    });
    
    // Wait 2 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 TEST SUMMARY');
  console.log(`${'='.repeat(80)}\n`);
  
  const standardTests = results.filter(r => !r.useLangGraph);
  const langGraphTests = results.filter(r => r.useLangGraph);
  
  console.log('Standard Mode:');
  standardTests.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`  ${status} ${r.name}: ${r.success ? `${r.duration}ms, ${r.chunkCount} chunks` : r.error}`);
  });
  
  console.log('\nLangGraph Mode:');
  langGraphTests.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`  ${status} ${r.name}: ${r.success ? `${r.duration}ms, ${r.chunkCount} chunks, ${r.workflowSteps?.length || 0} steps` : r.error}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Overall: ${successCount}/${totalCount} tests passed (${Math.round(successCount / totalCount * 100)}%)`);
  console.log(`${'='.repeat(80)}\n`);
  
  // Compare performance
  if (standardTests.every(r => r.success) && langGraphTests.every(r => r.success)) {
    console.log('⚖️  Performance Comparison:\n');
    
    for (let i = 0; i < 4; i++) {
      const standard = standardTests[i];
      const langGraph = langGraphTests[i];
      
      const overhead = langGraph.duration - standard.duration;
      const overheadPercent = Math.round((overhead / standard.duration) * 100);
      
      console.log(`Mode ${i + 1}:`);
      console.log(`  Standard: ${standard.duration}ms`);
      console.log(`  LangGraph: ${langGraph.duration}ms`);
      console.log(`  Overhead: ${overhead}ms (+${overheadPercent}%)`);
      console.log(`  Workflow Steps: ${langGraph.workflowSteps.join(' → ')}`);
      console.log();
    }
  }
  
  process.exit(successCount === totalCount ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

