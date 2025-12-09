/**
 * VITAL Platform - Mode 1 Stream API Route Tests
 * 
 * Phase 5: Testing & Quality Assurance
 * 
 * Tests for the Mode 1 BFF streaming API route.
 */

import { NextRequest } from 'next/server';

// =============================================================================
// MOCKS
// =============================================================================

// Mock environment variables
const mockEnv = {
  AI_ENGINE_URL: 'http://localhost:8000',
};

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock auth utilities
jest.mock('@/lib/auth', () => ({
  getServerSession: jest.fn(),
  authOptions: {},
}));

jest.mock('@/lib/tenant', () => ({
  getTenantId: jest.fn().mockReturnValue('tenant-123'),
}));

// Import after mocks
import { POST } from '../mode1/stream/route';

// Helper to create NextRequest
function createRequest(body: object, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost:3000/api/expert/mode1/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

// Helper to create mock SSE stream
function createMockSSEStream(events: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream({
    pull(controller) {
      if (index < events.length) {
        controller.enqueue(encoder.encode(events[index]));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

// =============================================================================
// TEST SUITE
// =============================================================================

describe('Mode 1 Stream API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AI_ENGINE_URL = mockEnv.AI_ENGINE_URL;
  });

  // ===========================================================================
  // Request Validation Tests
  // ===========================================================================

  describe('Request Validation', () => {
    it('should reject requests without message', async () => {
      const request = createRequest({
        expert_id: 'expert-001',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('message');
    });

    it('should reject requests without expert_id', async () => {
      const request = createRequest({
        message: 'Test message',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('expert');
    });

    it('should accept valid request', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
        headers: new Headers({ 'Content-Type': 'text/event-stream' }),
      });

      const request = createRequest({
        message: 'What are FDA requirements?',
        expert_id: 'expert-001',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  // ===========================================================================
  // Backend Proxy Tests
  // ===========================================================================

  describe('Backend Proxy', () => {
    it('should forward request to AI Engine', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Test query',
        expert_id: 'expert-001',
        conversation_id: 'conv-123',
      });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/mode1'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.any(String),
        })
      );

      // Verify body content
      const fetchCall = mockFetch.mock.calls[0];
      const bodyParsed = JSON.parse(fetchCall[1].body);
      expect(bodyParsed.message).toBe('Test query');
      expect(bodyParsed.expert_id).toBe('expert-001');
    });

    it('should include tenant ID in backend request', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest(
        { message: 'Test', expert_id: 'expert-001' },
        { 'x-tenant-id': 'custom-tenant' }
      );

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[1].headers['x-tenant-id']).toBeDefined();
    });

    it('should handle backend errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Backend error'),
      });

      const request = createRequest({
        message: 'Test',
        expert_id: 'expert-001',
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = createRequest({
        message: 'Test',
        expert_id: 'expert-001',
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  // ===========================================================================
  // SSE Streaming Tests
  // ===========================================================================

  describe('SSE Streaming', () => {
    it('should return SSE content type', async () => {
      const mockStream = createMockSSEStream([
        'event: token\ndata: {"content": "Hello"}\n\n',
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Test',
        expert_id: 'expert-001',
      });

      const response = await POST(request);

      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('should include cache control headers', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Test',
        expert_id: 'expert-001',
      });

      const response = await POST(request);

      expect(response.headers.get('Cache-Control')).toBe('no-cache');
    });

    it('should stream events from backend', async () => {
      const mockStream = createMockSSEStream([
        'event: token\ndata: {"content": "Hello "}\n\n',
        'event: token\ndata: {"content": "World"}\n\n',
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Test',
        expert_id: 'expert-001',
      });

      const response = await POST(request);

      // Read stream content
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          content += decoder.decode(value);
        }
      }

      expect(content).toContain('Hello');
      expect(content).toContain('World');
    });
  });

  // ===========================================================================
  // Mode-Specific Options Tests
  // ===========================================================================

  describe('Mode 1 Options', () => {
    it('should pass conversation context', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Follow-up question',
        expert_id: 'expert-001',
        conversation_id: 'conv-456',
        context: {
          previous_messages: [
            { role: 'user', content: 'First message' },
            { role: 'assistant', content: 'First response' },
          ],
        },
      });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.conversation_id).toBe('conv-456');
    });

    it('should include RAG options when provided', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Research question',
        expert_id: 'expert-001',
        enable_rag: true,
        rag_domains: ['regulatory', 'clinical'],
      });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.enable_rag).toBe(true);
      expect(body.rag_domains).toContain('regulatory');
    });
  });
});
