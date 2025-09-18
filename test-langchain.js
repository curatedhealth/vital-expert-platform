// Test LangChain setup
import { langchainRAGService } from './src/lib/chat/langchain-service.js';

async function testLangChain() {
  console.log('🔍 Testing LangChain setup...');

  try {
    // Test the setup
    const setupTest = await langchainRAGService.testSetup();

    if (setupTest) {
      console.log('✅ LangChain setup test passed!');

      // Test with a sample text file
      console.log('📄 Testing text file processing...');

      // Create a mock file object
      const mockFile = new File(['This is test content for LangChain processing.'], 'test.txt', {
        type: 'text/plain'
      });

      const result = await langchainRAGService.processDocuments([mockFile], {
        agentId: 'test-agent',
        isGlobal: false,
        domain: 'digital-health'
      });

      console.log('📊 Processing result:', result);

    } else {
      console.log('❌ LangChain setup test failed');
    }

  } catch (error) {
    console.error('🚨 Test error:', error);
  }
}

testLangChain();