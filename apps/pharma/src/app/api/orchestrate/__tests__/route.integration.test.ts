/**
 * Orchestration API Route Integration Tests
 *
 * Tests complete request flow through the API route
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

// Mock dependencies
jest.mock('@/lib/orchestration/simplified-orchestrator');
jest.mock('@/lib/db/supabase/client');

describe('POST /api/orchestrate', () => {
  const validHeaders = {
    'content-type': 'application/json',
    'x-user-id': 'test-user-123',
    'x-tenant-id': 'test-tenant-456'
  };

  const validBody = {
    query: 'What are the symptoms of diabetes?',
    mode: 'query_automatic'
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful orchestration
    const { createSimplifiedOrchestrator } = require('@/lib/orchestration/simplified-orchestrator');
    createSimplifiedOrchestrator.mockReturnValue({
      validateInput: jest.fn(),
      execute: jest.fn().mockResolvedValue({
        conversationId: 'conv-123',
        response: 'Diabetes symptoms include...',
        selectedAgents: [
          { id: 'agent-1', name: 'Medical Expert', confidence: 0.95 }
        ],
        sources: [],
        metadata: {
          duration: 2500,
          mode: 'query_automatic',
          tokensUsed: 450
        }
      })
    });
  });

  describe('authentication', () => {
    it('requires x-user-id header', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-tenant-id': 'test-tenant-456'
        },
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('requires x-tenant-id header', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user-id': 'test-user-123'
        },
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Bad Request');
    });

    it('accepts valid authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('input validation', () => {
    it('rejects invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: 'invalid json{'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON');
    });

    it('validates required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify({
          // Missing query
          mode: 'query_automatic'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('validates mode enum', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify({
          query: 'test',
          mode: 'invalid_mode'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('validates query length', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify({
          query: 'a'.repeat(10001), // Exceeds max
          mode: 'query_automatic'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('accepts valid input', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('orchestration execution', () => {
    it('executes orchestration successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('conversationId');
      expect(data).toHaveProperty('response');
      expect(data).toHaveProperty('selectedAgents');
      expect(data.selectedAgents).toHaveLength(1);
    });

    it('calls orchestrator with correct parameters', async () => {
      const { createSimplifiedOrchestrator } = require('@/lib/orchestration/simplified-orchestrator');
      const mockExecute = jest.fn().mockResolvedValue({
        conversationId: 'conv-123',
        response: 'Test response',
        selectedAgents: [],
        metadata: {}
      });

      createSimplifiedOrchestrator.mockReturnValue({
        validateInput: jest.fn(),
        execute: mockExecute
      });

      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify(validBody)
      });

      await POST(request);

      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          query: validBody.query,
          mode: validBody.mode
        }),
        'test-user-123',
        'test-tenant-456'
      );
    });

    it('includes duration in metadata', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.metadata).toHaveProperty('totalDuration');
      expect(data.metadata.totalDuration).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('handles validation errors', async () => {
      const { createSimplifiedOrchestrator } = require('@/lib/orchestration/simplified-orchestrator');
      createSimplifiedOrchestrator.mockReturnValue({
        validateInput: jest.fn().mockImplementation(() => {
          throw new Error('Query is required');
        }),
        execute: jest.fn()
      });

      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain('Query is required');
    });

    it('handles timeout errors', async () => {
      const { createSimplifiedOrchestrator, OrchestrationTimeoutError } = require('@/lib/orchestration/simplified-orchestrator');
      createSimplifiedOrchestrator.mockReturnValue({
        validateInput: jest.fn(),
        execute: jest.fn().mockRejectedValue(
          new OrchestrationTimeoutError('Execution timeout')
        )
      });

      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(504);
      expect(data.error).toBe('Request timeout');
      expect(data.suggestion).toBeTruthy();
    });

    it('handles execution errors', async () => {
      const { createSimplifiedOrchestrator } = require('@/lib/orchestration/simplified-orchestrator');
      createSimplifiedOrchestrator.mockReturnValue({
        validateInput: jest.fn(),
        execute: jest.fn().mockRejectedValue(new Error('Execution failed'))
      });

      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Orchestration failed');
    });

    it('handles unexpected errors', async () => {
      const { createSimplifiedOrchestrator } = require('@/lib/orchestration/simplified-orchestrator');
      createSimplifiedOrchestrator.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('response format', () => {
    it('returns correct content-type', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('includes cache control headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);

      expect(response.headers.get('cache-control')).toBeTruthy();
    });

    it('returns complete orchestration result', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toMatchObject({
        conversationId: expect.any(String),
        response: expect.any(String),
        selectedAgents: expect.any(Array),
        metadata: expect.objectContaining({
          duration: expect.any(Number),
          mode: expect.any(String)
        })
      });
    });
  });

  describe('different modes', () => {
    const modes = ['query_automatic', 'query_manual', 'rag_query', 'multi_agent', 'autonomous'];

    modes.forEach(mode => {
      it(`handles ${mode} mode`, async () => {
        const request = new NextRequest('http://localhost:3000/api/orchestrate', {
          method: 'POST',
          headers: validHeaders,
          body: JSON.stringify({
            query: 'test query',
            mode
          })
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
      });
    });
  });

  describe('optional fields', () => {
    it('accepts optional sessionId', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify({
          ...validBody,
          sessionId: '550e8400-e29b-41d4-a716-446655440000'
        })
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('accepts optional context', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: validHeaders,
        body: JSON.stringify({
          ...validBody,
          context: { foo: 'bar' }
        })
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });
});

describe('GET /api/orchestrate', () => {
  it('returns 405 Method Not Allowed', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(405);
    expect(data.error).toBe('Method not allowed');
    expect(response.headers.get('Allow')).toBe('POST');
  });
});
