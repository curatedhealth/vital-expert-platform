'use client';

import { useState } from 'react';

export default function TestSimplePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testBasicFunction = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing basic function...');
      
      // Test 1: Basic API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello, test message',
          agent: null, // This should trigger automatic orchestration
          chatHistory: []
        })
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Test 2: Read the stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      let fullContent = '';
      let chunkCount = 0;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullContent += chunk;
        chunkCount++;

        console.log(`📦 Chunk ${chunkCount}:`, chunk.substring(0, 100) + '...');
      }

      reader.releaseLock();

      setResult({
        status: response.status,
        chunkCount,
        contentLength: fullContent.length,
        content: fullContent,
        success: true
      });

    } catch (error) {
      console.error('❌ Test error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testDirectOrchestrator = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing orchestrator via API route...');
      
      // Test orchestrator through API route instead of direct import
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'What is AI?',
          chatHistory: [],
          agent: { id: 'orchestrator', name: 'AI Orchestrator' },
          sessionId: 'test-session-direct',
          userId: 'test-user-direct',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      console.log('✅ API call successful, processing stream...');
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get readable stream from API response.');
      }

      let receivedContent = '';
      let reasoningSteps: string[] = [];
      let chunkCount = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        receivedContent += chunk;
        chunkCount++;
        
        console.log(`📦 Chunk ${chunkCount}:`, chunk.substring(0, 100) + '...');
        
        // Parse SSE data
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'reasoning') {
                reasoningSteps.push(data.content);
              }
            } catch (e) {
              // Ignore parsing errors for non-JSON lines
            }
          }
        }
      }
      
      console.log('✅ Stream processing successful');
      console.log('📊 Reasoning steps:', reasoningSteps);
      
      setResult({
        success: true,
        content: receivedContent,
        reasoningSteps: reasoningSteps,
        chunkCount: chunkCount,
        message: 'Orchestrator API test successful'
      });

    } catch (error) {
      console.error('❌ Orchestrator API test error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Simple Test Page
        </h1>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test 1: Basic API Call</h2>
            <p className="text-gray-600 mb-4">
              Test the /api/chat endpoint with automatic orchestration
            </p>
            <button
              onClick={testBasicFunction}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Test API Call'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test 2: Orchestrator via API</h2>
            <p className="text-gray-600 mb-4">
              Test the orchestrator through the API route with explicit orchestrator agent
            </p>
            <button
              onClick={testDirectOrchestrator}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Test Orchestrator API'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Result</h3>
              <div className="space-y-2 text-sm">
                {result.success && <p><strong>Status:</strong> Success</p>}
                {result.status && <p><strong>HTTP Status:</strong> {result.status}</p>}
                {result.chunkCount && <p><strong>Chunks:</strong> {result.chunkCount}</p>}
                {result.contentLength && <p><strong>Content Length:</strong> {result.contentLength}</p>}
                {result.message && <p><strong>Message:</strong> {result.message}</p>}
                {result.reasoningSteps && result.reasoningSteps.length > 0 && (
                  <div>
                    <p><strong>Reasoning Steps:</strong></p>
                    <ul className="list-disc list-inside ml-4">
                      {result.reasoningSteps.map((step: string, index: number) => (
                        <li key={index} className="text-xs">{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {result.content && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Content Preview:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                    {result.content.substring(0, 1000)}...
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
