/**
 * VITAL Platform - Mode 2 Stream API Route Tests
 * 
 * Phase 5: Testing & Quality Assurance
 * 
 * Tests for the Mode 2 BFF streaming API route with Fusion Intelligence.
 */

import { NextRequest } from 'next/server';

// =============================================================================
// MOCKS
// =============================================================================

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock('@/lib/auth', () => ({
  getServerSession: jest.fn(),
  authOptions: {},
}));

jest.mock('@/lib/tenant', () => ({
  getTenantId: jest.fn().mockReturnValue('tenant-123'),
}));

import { POST } from '../mode2/stream/route';

function createRequest(body: object, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost:3000/api/expert/mode2/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

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

describe('Mode 2 Stream API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AI_ENGINE_URL = 'http://localhost:8000';
  });

  // ===========================================================================
  // Request Validation Tests
  // ===========================================================================

  describe('Request Validation', () => {
    it('should reject requests without message', async () => {
      const request = createRequest({});

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should accept valid request without expert_id (auto-select)', async () => {
      const mockStream = createMockSSEStream([
        'event: fusion\ndata: {"selected_experts": [{"id": "auto-001"}]}\n\n',
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Complex healthcare question',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  // ===========================================================================
  // Fusion Intelligence Tests
  // ===========================================================================

  describe('Fusion Intelligence', () => {
    it('should enable fusion by default', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Multi-domain question',
      });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.enable_fusion).toBe(true);
    });

    it('should pass fusion weights when provided', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Question',
        fusion_weights: {
          vector: 0.4,
          graph: 0.35,
          relational: 0.25,
        },
      });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.fusion_weights).toEqual({
        vector: 0.4,
        graph: 0.35,
        relational: 0.25,
      });
    });

    it('should pass max_experts parameter', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Question requiring multiple experts',
        max_experts: 3,
      });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.max_experts).toBe(3);
    });

    it('should pass preferred domains', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Regulatory question',
        preferred_domains: ['regulatory', 'clinical'],
      });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.preferred_domains).toContain('regulatory');
      expect(body.preferred_domains).toContain('clinical');
    });
  });

  // ===========================================================================
  // Expert Override Tests
  // ===========================================================================

  describe('Expert Override', () => {
    it('should allow expert override', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Question',
        override_expert_ids: ['expert-001', 'expert-002'],
      });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.override_expert_ids).toEqual(['expert-001', 'expert-002']);
    });
  });

  // ===========================================================================
  // Streaming Tests
  // ===========================================================================

  describe('Streaming', () => {
    it('should stream fusion events', async () => {
      const mockStream = createMockSSEStream([
        'event: fusion\ndata: {"selected_experts": [{"id": "expert-001", "name": "Dr. Expert", "confidence": 0.92}], "rrf_score": 0.88}\n\n',
        'event: token\ndata: {"content": "Response from experts"}\n\n',
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Test',
      });

      const response = await POST(request);
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

      expect(content).toContain('fusion');
      expect(content).toContain('selected_experts');
    });

    it('should handle multi-expert token streams', async () => {
      const mockStream = createMockSSEStream([
        'event: fusion\ndata: {"selected_experts": [{"id": "expert-001"}, {"id": "expert-002"}]}\n\n',
        'event: token\ndata: {"content": "Expert 1: ", "expert_id": "expert-001"}\n\n',
        'event: token\ndata: {"content": "Expert 2: ", "expert_id": "expert-002"}\n\n',
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Multi-expert question',
      });

      const response = await POST(request);
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

      expect(content).toContain('expert-001');
      expect(content).toContain('expert-002');
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('Error Handling', () => {
    it('should handle fusion failure', async () => {
      const mockStream = createMockSSEStream([
        'event: error\ndata: {"code": "FUSION_FAILED", "message": "No suitable experts"}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        message: 'Obscure question',
      });

      const response = await POST(request);
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

      expect(content).toContain('FUSION_FAILED');
    });

    it('should handle backend unavailable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const request = createRequest({
        message: 'Test',
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
