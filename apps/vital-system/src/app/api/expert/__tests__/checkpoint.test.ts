/**
 * VITAL Platform - Checkpoint API Route Tests
 * 
 * Phase 5: Testing & Quality Assurance
 * 
 * Tests for the HITL checkpoint management API routes.
 */

import { NextRequest } from 'next/server';

// =============================================================================
// MOCKS
// =============================================================================

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock('@/lib/auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: { id: 'user-123', email: 'test@example.com' },
  }),
  authOptions: {},
}));

jest.mock('@/lib/tenant', () => ({
  getTenantId: jest.fn().mockReturnValue('tenant-123'),
}));

import { POST, GET, DELETE } from '../mode3/checkpoint/[id]/route';

function createRequest(
  method: string,
  body?: object,
  params?: { id: string }
): NextRequest {
  const url = `http://localhost:3000/api/expert/mode3/checkpoint/${params?.id || 'checkpoint-001'}`;
  
  return new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// =============================================================================
// TEST SUITE
// =============================================================================

describe('Checkpoint API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AI_ENGINE_URL = 'http://localhost:8000';
  });

  // ===========================================================================
  // POST - Approve/Reject/Modify Tests
  // ===========================================================================

  describe('POST - Checkpoint Actions', () => {
    describe('Approve Action', () => {
      it('should approve checkpoint successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, status: 'approved' }),
        });

        const request = createRequest(
          'POST',
          { action: 'approve' },
          { id: 'checkpoint-001' }
        );

        const response = await POST(request, { params: Promise.resolve({ id: 'checkpoint-001' }) });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
      });

      it('should include selected option in approval', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

        const request = createRequest(
          'POST',
          { action: 'approve', selected_option: 'option_a' },
          { id: 'checkpoint-001' }
        );

        await POST(request, { params: Promise.resolve({ id: 'checkpoint-001' }) });

        const fetchCall = mockFetch.mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(body.selected_option).toBe('option_a');
      });

      it('should forward to backend with correct URL', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

        const request = createRequest(
          'POST',
          { action: 'approve' },
          { id: 'checkpoint-001' }
        );

        await POST(request, { params: Promise.resolve({ id: 'checkpoint-001' }) });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/checkpoint/checkpoint-001'),
          expect.any(Object)
        );
      });
    });

    describe('Reject Action', () => {
      it('should reject checkpoint with reason', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, status: 'rejected' }),
        });

        const request = createRequest(
          'POST',
          { action: 'reject', reason: 'Not ready for production' },
          { id: 'checkpoint-001' }
        );

        const response = await POST(request, { params: Promise.resolve({ id: 'checkpoint-001' }) });

        expect(response.status).toBe(200);
        
        const fetchCall = mockFetch.mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(body.action).toBe('reject');
        expect(body.reason).toBe('Not ready for production');
      });

      it('should reject without reason', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

        const request = createRequest(
          'POST',
          { action: 'reject' },
          { id: 'checkpoint-001' }
        );

        const response = await POST(request, { params: Promise.resolve({ id: 'checkpoint-001' }) });

        expect(response.status).toBe(200);
      });
    });

    describe('Modify Action', () => {
      it('should modify checkpoint with feedback', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, status: 'modified' }),
        });

        const request = createRequest(
          'POST',
          {
            action: 'modify',
            feedback: 'Please add more detail',
            modifications: { include_safety: true, expand_analysis: true },
          },
          { id: 'checkpoint-001' }
        );

        const response = await POST(request, { params: Promise.resolve({ id: 'checkpoint-001' }) });

        expect(response.status).toBe(200);
        
        const fetchCall = mockFetch.mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(body.feedback).toBe('Please add more detail');
        expect(body.modifications.include_safety).toBe(true);
      });
    });

    describe('Validation', () => {
      it('should reject invalid action', async () => {
        const request = createRequest(
          'POST',
          { action: 'invalid_action' },
          { id: 'checkpoint-001' }
        );

        const response = await POST(request, { params: Promise.resolve({ id: 'checkpoint-001' }) });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toContain('action');
      });

      it('should reject missing action', async () => {
        const request = createRequest('POST', {}, { id: 'checkpoint-001' });

        const response = await POST(request, { params: Promise.resolve({ id: 'checkpoint-001' }) });

        expect(response.status).toBe(400);
      });
    });

    describe('Authentication', () => {
      it('should include user ID in audit trail', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

        const request = createRequest(
          'POST',
          { action: 'approve' },
          { id: 'checkpoint-001' }
        );

        await POST(request, { params: Promise.resolve({ id: 'checkpoint-001' }) });

        const fetchCall = mockFetch.mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(body.user_id).toBeDefined();
      });

      it('should include tenant ID in request', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

        const request = createRequest(
          'POST',
          { action: 'approve' },
          { id: 'checkpoint-001' }
        );

        await POST(request, { params: Promise.resolve({ id: 'checkpoint-001' }) });

        const fetchCall = mockFetch.mock.calls[0];
        expect(fetchCall[1].headers['x-tenant-id']).toBeDefined();
      });
    });

    describe('Error Handling', () => {
      it('should handle backend errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Internal error' }),
        });

        const request = createRequest(
          'POST',
          { action: 'approve' },
          { id: 'checkpoint-001' }
        );

        const response = await POST(request, { params: Promise.resolve({ id: 'checkpoint-001' }) });

        expect(response.status).toBe(500);
      });

      it('should handle checkpoint not found', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ error: 'Checkpoint not found' }),
        });

        const request = createRequest(
          'POST',
          { action: 'approve' },
          { id: 'nonexistent' }
        );

        const response = await POST(request, { params: Promise.resolve({ id: 'nonexistent' }) });

        expect(response.status).toBe(404);
      });

      it('should handle checkpoint expired', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 410,
          json: () => Promise.resolve({ error: 'Checkpoint expired' }),
        });

        const request = createRequest(
          'POST',
          { action: 'approve' },
          { id: 'expired-checkpoint' }
        );

        const response = await POST(request, { params: Promise.resolve({ id: 'expired-checkpoint' }) });

        expect(response.status).toBe(410);
      });
    });
  });

  // ===========================================================================
  // GET - Checkpoint Status Tests
  // ===========================================================================

  describe('GET - Checkpoint Status', () => {
    it('should return checkpoint status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'checkpoint-001',
            type: 'plan_approval',
            status: 'pending',
            title: 'Review Research Plan',
            description: 'Please review the proposed research plan',
            options: [
              { label: 'Approve', value: 'approve' },
              { label: 'Modify', value: 'modify' },
              { label: 'Reject', value: 'reject' },
            ],
            timeout_seconds: 300,
            time_remaining: 245,
            created_at: '2024-01-15T10:30:00Z',
          }),
      });

      const request = createRequest('GET', undefined, { id: 'checkpoint-001' });

      const response = await GET(request, { params: Promise.resolve({ id: 'checkpoint-001' }) });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.id).toBe('checkpoint-001');
      expect(body.status).toBe('pending');
      expect(body.time_remaining).toBe(245);
    });

    it('should return already-resolved checkpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'checkpoint-001',
            status: 'approved',
            resolved_at: '2024-01-15T10:35:00Z',
            resolved_by: 'user-123',
          }),
      });

      const request = createRequest('GET', undefined, { id: 'checkpoint-001' });

      const response = await GET(request, { params: Promise.resolve({ id: 'checkpoint-001' }) });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.status).toBe('approved');
      expect(body.resolved_by).toBe('user-123');
    });

    it('should handle checkpoint not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Checkpoint not found' }),
      });

      const request = createRequest('GET', undefined, { id: 'nonexistent' });

      const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) });

      expect(response.status).toBe(404);
    });
  });

  // ===========================================================================
  // DELETE - Cancel Checkpoint Tests
  // ===========================================================================

  describe('DELETE - Cancel Checkpoint', () => {
    it('should cancel checkpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'cancelled' }),
      });

      const request = createRequest('DELETE', undefined, { id: 'checkpoint-001' });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'checkpoint-001' }) });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.status).toBe('cancelled');
    });

    it('should handle already-resolved checkpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () =>
          Promise.resolve({ error: 'Checkpoint already resolved' }),
      });

      const request = createRequest('DELETE', undefined, { id: 'resolved-checkpoint' });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'resolved-checkpoint' }) });

      expect(response.status).toBe(409);
    });
  });
});
