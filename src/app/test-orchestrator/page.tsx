'use client';

import { useState } from 'react';
import { AutomaticAgentOrchestrator } from '@/features/chat/services/automatic-orchestrator';

export default function TestOrchestratorPage() {
  const [query, setQuery] = useState('What are the key capabilities of AI Orchestrator?');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testOrchestrator = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing Automatic Agent Orchestrator...');
      console.log('📝 Query:', query);
      
      const orchestrator = new AutomaticAgentOrchestrator();
      
      const startTime = Date.now();
      const result = await orchestrator.chat(query, [], {
        userId: 'test-user',
        conversationId: 'test-session',
        maxCandidates: 5,
        minConfidence: 0.4
      });
      const endTime = Date.now();
      
      console.log('✅ Orchestrator result:', result);
      console.log('⏱️ Execution time:', endTime - startTime, 'ms');
      
      setResult({
        ...result,
        executionTime: endTime - startTime
      });
      
    } catch (error) {
      console.error('❌ Orchestrator test error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testReadableStream = async () => {
    if (!result?.response) {
      console.log('❌ No response to test');
      return;
    }

    try {
      console.log('🧪 Testing ReadableStream response...');
      
      if (result.response instanceof ReadableStream) {
        console.log('✅ Response is a ReadableStream');
        
        const reader = result.response.getReader();
        let fullContent = '';
        let chunkCount = 0;
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          fullContent += chunk;
          chunkCount++;
          
          console.log(`📦 Chunk ${chunkCount}:`, chunk.substring(0, 100) + '...');
        }
        
        reader.releaseLock();
        
        console.log('✅ Stream processing complete:');
        console.log('- Total chunks:', chunkCount);
        console.log('- Content length:', fullContent.length);
        console.log('- Content preview:', fullContent.substring(0, 200) + '...');
        
        setResult(prev => ({
          ...prev,
          streamedContent: fullContent,
          chunkCount
        }));
        
      } else {
        console.log('❌ Response is not a ReadableStream:', typeof result.response);
      }
      
    } catch (error) {
      console.error('❌ Stream test error:', error);
      setError(error instanceof Error ? error.message : 'Stream processing error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Automatic Agent Orchestrator Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Query</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query:
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter your test query..."
              />
            </div>
            <button
              onClick={testOrchestrator}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Test Orchestrator'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Orchestrator Result</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Selected Agent:</strong> {result.selectedAgent?.name}</p>
                <p><strong>Execution Time:</strong> {result.executionTime}ms</p>
                <p><strong>Response Type:</strong> {typeof result.response}</p>
                <p><strong>Is ReadableStream:</strong> {result.response instanceof ReadableStream ? 'Yes' : 'No'}</p>
                <p><strong>Reasoning:</strong> {result.reasoning}</p>
                <p><strong>Ranked Agents:</strong> {result.rankedAgents?.length || 0}</p>
              </div>
            </div>

            {result.response instanceof ReadableStream && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">📡 ReadableStream Test</h3>
                <button
                  onClick={testReadableStream}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
                >
                  Test Stream Processing
                </button>
                {result.streamedContent && (
                  <div className="space-y-2 text-sm">
                    <p><strong>Chunks Processed:</strong> {result.chunkCount}</p>
                    <p><strong>Content Length:</strong> {result.streamedContent.length}</p>
                    <div className="bg-gray-100 p-3 rounded border">
                      <strong>Content Preview:</strong>
                      <pre className="mt-2 whitespace-pre-wrap text-xs">
                        {result.streamedContent.substring(0, 500)}...
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">🔍 Full Result (JSON)</h3>
              <pre className="text-xs overflow-auto max-h-96 bg-white p-3 rounded border">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
