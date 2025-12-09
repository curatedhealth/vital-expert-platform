/**
 * VITAL Platform - Mode 3 Stream API Route Tests
 * 
 * Phase 5: Testing & Quality Assurance
 * 
 * Tests for the Mode 3 BFF streaming API route with HITL checkpoints.
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

import { POST } from '../mode3/stream/route';

function createRequest(body: object, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost:3000/api/expert/mode3/stream', {
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

describe('Mode 3 Stream API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AI_ENGINE_URL = 'http://localhost:8000';
  });

  // ===========================================================================
  // Request Validation Tests
  // ===========================================================================

  describe('Request Validation', () => {
    it('should reject requests without goal', async () => {
      const request = createRequest({
        expert_id: 'expert-001',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('goal');
    });

    it('should reject requests without expert_id', async () => {
      const request = createRequest({
        goal: 'Research task',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should accept valid request', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'Analyze competitive landscape for Drug X',
        expert_id: 'expert-001',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  // ===========================================================================
  // Mission Configuration Tests
  // ===========================================================================

  describe('Mission Configuration', () => {
    it('should pass max iterations', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'Research task',
        expert_id: 'expert-001',
        max_iterations: 20,
      });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.max_iterations).toBe(20);
    });

    it('should pass confidence threshold', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'High-precision task',
        expert_id: 'expert-001',
        confidence_threshold: 0.95,
      });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.confidence_threshold).toBe(0.95);
    });

    it('should pass RAG and web search options', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'Research with external sources',
        expert_id: 'expert-001',
        enable_rag: true,
        enable_web_search: true,
      });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.enable_rag).toBe(true);
      expect(body.enable_web_search).toBe(true);
    });
  });

  // ===========================================================================
  // HITL Configuration Tests
  // ===========================================================================

  describe('HITL Configuration', () => {
    it('should enable HITL by default', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'Autonomous task',
        expert_id: 'expert-001',
      });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.hitl_enabled).toBe(true);
    });

    it('should pass HITL checkpoint configuration', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'Task with checkpoints',
        expert_id: 'expert-001',
        hitl_checkpoints: ['plan_approval', 'tool_use', 'final_review'],
      });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.hitl_checkpoints).toContain('plan_approval');
      expect(body.hitl_checkpoints).toContain('tool_use');
      expect(body.hitl_checkpoints).toContain('final_review');
    });

    it('should allow disabling HITL', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'Fully autonomous task',
        expert_id: 'expert-001',
        hitl_enabled: false,
      });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.hitl_enabled).toBe(false);
    });
  });

  // ===========================================================================
  // Streaming Progress Tests
  // ===========================================================================

  describe('Streaming Progress', () => {
    it('should stream progress events', async () => {
      const mockStream = createMockSSEStream([
        'event: progress\ndata: {"current_step": 1, "total_steps": 5, "percentage": 20}\n\n',
        'event: progress\ndata: {"current_step": 2, "total_steps": 5, "percentage": 40}\n\n',
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'Multi-step task',
        expert_id: 'expert-001',
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

      expect(content).toContain('progress');
      expect(content).toContain('current_step');
    });

    it('should stream delegation events', async () => {
      const mockStream = createMockSSEStream([
        'event: delegation\ndata: {"id": "del-001", "to_agent": "specialist", "task": "Sub-task", "status": "started"}\n\n',
        'event: delegation\ndata: {"id": "del-001", "status": "completed"}\n\n',
        'event: done\ndata: {"success": true}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'Delegated task',
        expert_id: 'expert-001',
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

      expect(content).toContain('delegation');
      expect(content).toContain('specialist');
    });
  });

  // ===========================================================================
  // Checkpoint Streaming Tests
  // ===========================================================================

  describe('Checkpoint Streaming', () => {
    it('should stream checkpoint events', async () => {
      const mockStream = createMockSSEStream([
        'event: progress\ndata: {"current_step": 1, "total_steps": 3}\n\n',
        'event: checkpoint\ndata: {"id": "ckpt-001", "type": "plan_approval", "title": "Review Plan", "timeout_seconds": 300}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'Task requiring approval',
        expert_id: 'expert-001',
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

      expect(content).toContain('checkpoint');
      expect(content).toContain('plan_approval');
      expect(content).toContain('timeout_seconds');
    });

    it('should include checkpoint options', async () => {
      const mockStream = createMockSSEStream([
        'event: checkpoint\ndata: {"id": "ckpt-001", "type": "decision", "options": [{"label": "Approve", "value": "approve"}, {"label": "Modify", "value": "modify"}, {"label": "Reject", "value": "reject"}]}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'Decision task',
        expert_id: 'expert-001',
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

      expect(content).toContain('Approve');
      expect(content).toContain('Modify');
      expect(content).toContain('Reject');
    });
  });

  // ===========================================================================
  // Mission Completion Tests
  // ===========================================================================

  describe('Mission Completion', () => {
    it('should include artifacts in done event', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true, "artifacts": [{"id": "art-001", "type": "document", "title": "Report"}]}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'Generate report',
        expert_id: 'expert-001',
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

      expect(content).toContain('artifacts');
      expect(content).toContain('Report');
    });

    it('should include metrics in done event', async () => {
      const mockStream = createMockSSEStream([
        'event: done\ndata: {"success": true, "metrics": {"total_tokens": 5000, "duration_ms": 45000, "l4_calls": 12}}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'Tracked task',
        expert_id: 'expert-001',
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

      expect(content).toContain('total_tokens');
      expect(content).toContain('5000');
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('Error Handling', () => {
    it('should handle mission failure', async () => {
      const mockStream = createMockSSEStream([
        'event: error\ndata: {"code": "MISSION_FAILED", "message": "Unable to complete objective"}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'Failing task',
        expert_id: 'expert-001',
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

      expect(content).toContain('MISSION_FAILED');
    });

    it('should handle checkpoint timeout', async () => {
      const mockStream = createMockSSEStream([
        'event: checkpoint\ndata: {"id": "ckpt-001", "type": "approval"}\n\n',
        'event: error\ndata: {"code": "CHECKPOINT_TIMEOUT", "checkpoint_id": "ckpt-001"}\n\n',
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const request = createRequest({
        goal: 'Task with timeout',
        expert_id: 'expert-001',
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

      expect(content).toContain('CHECKPOINT_TIMEOUT');
    });
  });
});
