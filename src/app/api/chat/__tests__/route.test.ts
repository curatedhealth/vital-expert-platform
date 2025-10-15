import { NextRequest } from 'next/server';
import { POST } from '../route';
import { ValidationError } from '../middleware';

// Mock the chat store
jest.mock('@/lib/stores/chat-store', () => ({
  useChatStore: {
    getState: () => ({
      setSelectedAgent: jest.fn(),
      addMessage: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn()
    })
  }
}));

// Mock the workflow
jest.mock('@/features/chat/services/ask-expert-graph', () => ({
  streamModeAwareWorkflow: jest.fn()
}));

describe('/api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Message is required');
  });

  it('validates agent selection in manual mode', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test message',
        interactionMode: 'manual'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Agent selection required in manual mode');
  });

  it('validates agent structure in manual mode', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test message',
        interactionMode: 'manual',
        agent: { name: 'Test Agent' } // Missing required fields
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Agent missing required field: id');
  });

  it('validates message length', async () => {
    const longMessage = 'a'.repeat(4001);
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: longMessage,
        interactionMode: 'automatic'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Message too long');
  });

  it('handles valid manual mode request', async () => {
    const mockWorkflow = require('@/features/chat/services/ask-expert-graph').streamModeAwareWorkflow;
    mockWorkflow.mockResolvedValue({
      answer: 'Test response',
      sources: [],
      metadata: {}
    });

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test message',
        interactionMode: 'manual',
        agent: {
          id: 'test-agent',
          name: 'Test Agent',
          system_prompt: 'You are a test agent'
        }
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('handles workflow errors with recovery', async () => {
    const mockWorkflow = require('@/features/chat/services/ask-expert-graph').streamModeAwareWorkflow;
    mockWorkflow.mockRejectedValue(new Error('Workflow failed'));

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test message',
        interactionMode: 'automatic'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
    expect(data.recoveryUsed).toBe(true);
    expect(data.fallbackAgent).toBeDefined();
  });
});
