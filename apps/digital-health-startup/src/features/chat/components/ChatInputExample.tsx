'use client';

/**
 * Example implementation of the enhanced ChatInput component
 *
 * This demonstrates how to use all the new features:
 * - Model selection (OpenAI, Gemini, Hugging Face)
 * - RAG sources selection
 * - Tools selection
 */

import { useState } from 'react';
import { ChatInput, type AIModel } from './chat-input';
import { Card } from '@vital/ui';

export function ChatInputExample() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>();
  const [selectedRags, setSelectedRags] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Example: Pre-select some RAGs for medical context
  const handlePreselectMedical = () => {
    setSelectedRags([
      'medical-literature',
      'fda-guidelines',
      'clinical-trials'
    ]);
  };

  // Example: Pre-select tools for drug research
  const handlePreselectDrugTools = () => {
    setSelectedTools([
      'pubmed-search',
      'drug-interactions',
      'clinical-calculator'
    ]);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsLoading(true);

    try {
      console.log('📤 Sending message with configuration:');
      console.log('Message:', message);
      console.log('Model:', selectedModel?.name);
      console.log('RAG Sources:', selectedRags);
      console.log('Tools:', selectedTools);

      // Simulate API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          modelId: selectedModel?.id || 'gpt-4',
          ragSources: selectedRags,
          tools: selectedTools,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Response:', data);
        setMessage(''); // Clear input on success
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    setIsLoading(false);
    console.log('⏹️ Stopped generation');
  };

  return (
    <div className="space-y-4 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-xl font-bold mb-2">Enhanced Chat Input Demo</h2>
        <p className="text-sm text-gray-600 mb-4">
          Try selecting different models, RAG sources, and tools to customize your AI experience.
        </p>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handlePreselectMedical}
            className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 rounded-lg font-medium"
          >
            📚 Pre-select Medical RAGs
          </button>
          <button
            onClick={handlePreselectDrugTools}
            className="px-3 py-1.5 text-xs bg-green-100 hover:bg-green-200 rounded-lg font-medium"
          >
            🔧 Pre-select Drug Tools
          </button>
          <button
            onClick={() => {
              setSelectedRags([]);
              setSelectedTools([]);
            }}
            className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
          >
            🔄 Clear All
          </button>
        </div>
      </Card>

      {/* Current Configuration Display */}
      <Card className="p-4 bg-white">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Current Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="font-medium text-gray-600">Model:</span>
            <div className="mt-1 text-gray-900">
              {selectedModel?.name || 'GPT-4 (default)'}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-600">RAG Sources:</span>
            <div className="mt-1 text-blue-700">
              {selectedRags.length > 0 ? `${selectedRags.length} selected` : 'None'}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-600">Tools:</span>
            <div className="mt-1 text-green-700">
              {selectedTools.length > 0 ? `${selectedTools.length} selected` : 'None'}
            </div>
          </div>
        </div>

        {/* Detailed selections */}
        {(selectedRags.length > 0 || selectedTools.length > 0) && (
          <div className="mt-3 pt-3 border-t text-xs space-y-2">
            {selectedRags.length > 0 && (
              <div>
                <span className="font-medium text-blue-600">RAGs: </span>
                <span className="text-gray-600">{selectedRags.join(', ')}</span>
              </div>
            )}
            {selectedTools.length > 0 && (
              <div>
                <span className="font-medium text-green-600">Tools: </span>
                <span className="text-gray-600">{selectedTools.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Chat Input Component */}
      <Card className="p-0 overflow-hidden">
        <ChatInput
          value={message}
          onChange={setMessage}
          onSend={handleSend}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          isLoading={isLoading}
          selectedAgent={null}

          // Model selection
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}

          // RAG selection
          selectedRags={selectedRags}
          onRagsChange={setSelectedRags}

          // Tools selection
          selectedTools={selectedTools}
          onToolsChange={setSelectedTools}

          // Optional features
          enableVoice={true}
          onStop={handleStop}
        />
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-gray-50">
        <h3 className="text-sm font-semibold mb-2">💡 Tips</h3>
        <ul className="text-xs space-y-1 text-gray-600">
          <li>• Click <strong>RAGs (X)</strong> to select knowledge sources</li>
          <li>• Click <strong>Tools (X)</strong> to select available tools</li>
          <li>• Click the model name to change AI provider</li>
          <li>• Press <kbd className="px-1 py-0.5 bg-white border rounded">Enter</kbd> to send</li>
          <li>• Press <kbd className="px-1 py-0.5 bg-white border rounded">Shift</kbd> + <kbd className="px-1 py-0.5 bg-white border rounded">Enter</kbd> for new line</li>
          <li>• Use the quick action buttons above for preset configurations</li>
        </ul>
      </Card>
    </div>
  );
}
