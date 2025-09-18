// Test LangChain setup using direct API calls
const fs = require('fs');
const FormData = require('form-data');
const https = require('https');

async function testLangChainAPI() {
  console.log('🔍 Testing LangChain API...');

  try {
    // Test 1: Test text file upload
    console.log('📄 Testing text file upload...');

    const testText = 'This is a comprehensive test document for LangChain processing. It contains multiple sentences to ensure proper chunking and embedding generation.';

    const form = new FormData();
    form.append('files', Buffer.from(testText), {
      filename: 'test-comprehensive.txt',
      contentType: 'text/plain'
    });
    form.append('agentId', 'test-agent-langchain');
    form.append('isGlobal', 'false');
    form.append('domain', 'digital-health');

    const response = await fetch('http://localhost:3001/api/knowledge/upload', {
      method: 'POST',
      body: form
    });

    const result = await response.json();
    console.log('📊 Upload result:', result);

    if (result.success) {
      console.log('✅ LangChain text processing successful!');
      console.log(`   - Files processed: ${result.totalProcessed}`);
      console.log(`   - Files failed: ${result.totalFailed}`);
    } else {
      console.log('❌ LangChain text processing failed');
    }

  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }
}

// Use fetch polyfill for Node.js
async function fetch(url, options) {
  const { default: fetch } = await import('node-fetch');
  return fetch(url, options);
}

testLangChainAPI();