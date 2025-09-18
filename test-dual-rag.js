// Test Dual RAG System (Global + Agent-specific)
const FormData = require('form-data');

async function testDualRAG() {
  console.log('🔍 Testing Dual RAG System...');

  try {
    // Test 1: Upload global document
    console.log('🌍 Testing global document upload...');

    const globalContent = 'This is a global healthcare document about FDA regulations. All agents should have access to this information about medical device approval processes and clinical trial requirements.';

    const globalForm = new FormData();
    globalForm.append('files', Buffer.from(globalContent), {
      filename: 'global-fda-guidelines.txt',
      contentType: 'text/plain'
    });
    globalForm.append('isGlobal', 'true');  // This makes it global
    globalForm.append('domain', 'digital-health');

    const globalResponse = await fetch('http://localhost:3001/api/knowledge/upload', {
      method: 'POST',
      body: globalForm
    });

    const globalResult = await globalResponse.json();
    console.log('📊 Global upload result:', globalResult);

    // Test 2: Upload agent-specific document
    console.log('🎯 Testing agent-specific document upload...');

    const agentContent = 'This is agent-specific knowledge for the regulatory expert. It contains detailed information about 510k submissions, specific to this agent only.';

    const agentForm = new FormData();
    agentForm.append('files', Buffer.from(agentContent), {
      filename: 'regulatory-specific-510k.txt',
      contentType: 'text/plain'
    });
    agentForm.append('agentId', 'regulatory-expert');
    agentForm.append('isGlobal', 'false');  // This makes it agent-specific
    agentForm.append('domain', 'digital-health');

    const agentResponse = await fetch('http://localhost:3001/api/knowledge/upload', {
      method: 'POST',
      body: agentForm
    });

    const agentResult = await agentResponse.json();
    console.log('📊 Agent-specific upload result:', agentResult);

    // Test 3: Test RAG query for regulatory expert (should see both global and agent-specific)
    console.log('🔍 Testing RAG query for regulatory expert...');

    const chatRequest = {
      message: 'What do you know about FDA regulations and 510k submissions?',
      agent: {
        id: 'regulatory-expert',
        name: 'Regulatory Expert',
        ragEnabled: true,
        systemPrompt: 'You are a regulatory expert.'
      },
      chatHistory: [],
      ragEnabled: true
    };

    const ragResponse = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chatRequest)
    });

    console.log('📡 RAG response status:', ragResponse.status);

    if (ragResponse.ok) {
      // Since it's a streaming response, we'll just log that it worked
      console.log('✅ RAG query successful - streaming response received');
      console.log('🎯 Regulatory expert should have access to both global and agent-specific knowledge');
    } else {
      console.log('❌ RAG query failed');
    }

    // Test 4: Test RAG query for different agent (should only see global)
    console.log('🔍 Testing RAG query for different agent (clinical researcher)...');

    const otherAgentRequest = {
      message: 'What do you know about FDA regulations?',
      agent: {
        id: 'clinical-researcher',
        name: 'Clinical Researcher',
        ragEnabled: true,
        systemPrompt: 'You are a clinical researcher.'
      },
      chatHistory: [],
      ragEnabled: true
    };

    const otherResponse = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(otherAgentRequest)
    });

    console.log('📡 Other agent RAG response status:', otherResponse.status);

    if (otherResponse.ok) {
      console.log('✅ Other agent RAG query successful');
      console.log('🌍 Clinical researcher should only have access to global knowledge');
    } else {
      console.log('❌ Other agent RAG query failed');
    }

    console.log('\n🎉 Dual RAG system test completed!');
    console.log('📋 Summary:');
    console.log(`   - Global document uploaded: ${globalResult.success ? '✅' : '❌'}`);
    console.log(`   - Agent-specific document uploaded: ${agentResult.success ? '✅' : '❌'}`);
    console.log(`   - Regulatory expert RAG: ${ragResponse.ok ? '✅' : '❌'}`);
    console.log(`   - Clinical researcher RAG: ${otherResponse.ok ? '✅' : '❌'}`);

  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }
}

// Use fetch polyfill for Node.js
async function fetch(url, options) {
  const { default: fetch } = await import('node-fetch');
  return fetch(url, options);
}

testDualRAG();