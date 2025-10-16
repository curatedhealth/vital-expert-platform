'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const models = [
  {
    id: 'CuratedHealth/meditron7b-lora-chat',
    name: 'CH Med 7b',
    description: 'Medical chat and conversations'
  },
  {
    id: 'CuratedHealth/meditron70b-qlora-1gpu',
    name: 'CH Med 70b',
    description: 'Large-scale medical reasoning'
  },
  {
    id: 'CuratedHealth/base_7b',
    name: 'CH Intern 7b',
    description: 'Medical-optimized base model'
  },
  {
    id: 'CuratedHealth/Qwen3-8B-SFT-20250917123923',
    name: 'CH Q-SFT 8b',
    description: 'Supervised fine-tuned medical model'
  }
];

export default function TestHuggingFacePage() {
  const [selectedModel, setSelectedModel] = useState('');
  const [message, setMessage] = useState('What are the symptoms of diabetes?');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testModel = async () => {
    if (!selectedModel || !message) {
      setError('Please select a model and enter a message');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/test-huggingface', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          message: message
        })
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.response);
      } else {
        setError(data.error || 'Failed to get response');
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hugging Face Models Test</h1>
        <p className="text-gray-600">
          Test your CuratedHealth models integrated with VITAL platform
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Configuration</CardTitle>
            <CardDescription>
              Select a model and enter a test message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a model to test" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-gray-500">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Test Message</label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your test message here..."
              />
            </div>

            <Button 
              onClick={testModel} 
              disabled={loading || !selectedModel || !message}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Model'}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-600">
                <strong>Error:</strong> {error}
              </div>
            </CardContent>
          </Card>
        )}

        {response && (
          <Card>
            <CardHeader>
              <CardTitle>Model Response</CardTitle>
              <CardDescription>
                Response from {models.find(m => m.id === selectedModel)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{response}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>API Key Status: {process.env.NODE_ENV === 'development' ? 'Configured' : 'Check environment variables'}</p>
      </div>
    </div>
  );
}
