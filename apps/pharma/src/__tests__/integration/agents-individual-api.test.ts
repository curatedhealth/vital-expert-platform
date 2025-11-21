/**
 * Integration Tests for Agent Individual API
 * 
 * Tests the individual agent operations:
 * - GET /api/agents/[id] - Fetch single agent
 * - PUT /api/agents/[id] - Update agent
 * - DELETE /api/agents/[id] - Delete agent (soft delete)
 * - Authentication and authorization
 * - Request validation (Zod)
 * - Error handling
 * 
 * Coverage Target: 95%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PUT, DELETE } from '@/app/api/agents/[id]/route';
import type { NextRequest } from 'next/server';
import type { AgentPermissionContext } from '@/middleware/agent-auth';
import { z } from 'zod';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(),
};

const mockCreateClient = vi.fn(async () => mockSupabase);

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  infoWithMetrics: vi.fn(),
};

const mockAuthContext: AgentPermissionContext = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
  },
  profile: {
    id: 'profile-123',
    tenant_id: 'tenant-123',
    role: 'member' as const,
    user_id: 'user-123',
  },
};

const mockWithAgentAuth = vi.fn((handler) => {
  return async (request: NextRequest, context: any, params: any) => {
    return handler(request, mockAuthContext, params);
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}));

vi.mock('@/lib/services/observability/structured-logger', () => ({
  createLogger: vi.fn(() => mockLogger),
}));

vi.mock('@/middleware/agent-auth', () => ({
  withAgentAuth: mockWithAgentAuth,
}));

vi.mock('@/config/environment', () => ({
  env: {
    getTenantIds: vi.fn(() => ({
      platform: '00000000-0000-0000-0000-000000000001',
    })),
  },
}));

// Mock Pinecone sync
vi.mock('@/lib/services/agents/agent-embedding-service', () => ({
  agentEmbeddingService: {
    generateAgentEmbedding: vi.fn().mockResolvedValue({
      agentId: 'agent-123',
      embedding: [0.1, 0.2, 0.3],
      embeddingType: 'agent',
      text: 'test agent',
    }),
    storeAgentEmbeddingInSupabase: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/lib/services/vectorstore/pinecone-vector-service', () => ({
  pineconeVectorService: {
    syncAgentToPinecone: vi.fn().mockResolvedValue(undefined),
    deleteAgentFromPinecone: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Agent Individual API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/agents/[id]', () => {
    it('should fetch single agent by ID', async () => {
      const mockAgent = {
        id: 'agent-123',
        name: 'test-agent',
        description: 'Test agent',
        system_prompt: 'You are a test agent',
        capabilities: ['general'],
        metadata: {},
        tenant_id: 'tenant-123',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockAgent,
        error: null,
      });

      const url = 'http://localhost:3000/api/agents/agent-123';
      const request = new NextRequest(url);
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await GET(request, mockAuthContext, { params });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.agent.id).toBe('agent-123');
      expect(body.agent.name).toBe('test-agent');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'agent-123');
      expect(mockLogger.infoWithMetrics).toHaveBeenCalled();
    });

    it('should return 404 when agent not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Agent not found', code: 'PGRST116' },
      });

      const url = 'http://localhost:3000/api/agents/non-existent';
      const request = new NextRequest(url);
      const params = Promise.resolve({ id: 'non-existent' });

      const response = await GET(request, mockAuthContext, { params });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe('Agent not found');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'PGRST000' },
      });

      const url = 'http://localhost:3000/api/agents/agent-123';
      const request = new NextRequest(url);
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await GET(request, mockAuthContext, { params });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe('Agent not found');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('PUT /api/agents/[id]', () => {
    it('should update agent with valid data', async () => {
      const currentAgent = {
        id: 'agent-123',
        name: 'test-agent',
        description: 'Old description',
        system_prompt: 'Old prompt',
        metadata: {},
        created_by: 'user-123',
        tenant_id: 'tenant-123',
        is_custom: false,
        is_library_agent: false,
      };

      const updatedAgent = {
        ...currentAgent,
        description: 'New description',
        metadata: { display_name: 'Updated Agent' },
        updated_at: '2025-01-02T00:00:00Z',
      };

      // Mock fetch current agent
      mockSupabase.single
        .mockResolvedValueOnce({
          data: currentAgent,
          error: null,
        })
        // Mock update result
        .mockResolvedValueOnce({
          data: updatedAgent,
          error: null,
        });

      const url = 'http://localhost:3000/api/agents/agent-123';
      const request = new NextRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          description: 'New description',
          display_name: 'Updated Agent',
        }),
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await PUT(request, mockAuthContext, { params });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.agent.description).toBe('New description');
      expect(mockSupabase.update).toHaveBeenCalled();
      expect(mockLogger.infoWithMetrics).toHaveBeenCalled();
    });

    it('should merge metadata correctly', async () => {
      const currentAgent = {
        id: 'agent-123',
        name: 'test-agent',
        metadata: { existing: 'value', display_name: 'Old Name' },
        created_by: 'user-123',
        tenant_id: 'tenant-123',
        is_custom: false,
        is_library_agent: false,
      };

      const updatedAgent = {
        ...currentAgent,
        metadata: { existing: 'value', display_name: 'Old Name', new: 'field' },
      };

      mockSupabase.single
        .mockResolvedValueOnce({
          data: currentAgent,
          error: null,
        })
        .mockResolvedValueOnce({
          data: updatedAgent,
          error: null,
        });

      const url = 'http://localhost:3000/api/agents/agent-123';
      const request = new NextRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          metadata: { new: 'field' },
        }),
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await PUT(request, mockAuthContext, { params });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.agent.metadata.existing).toBe('value'); // Should preserve existing
      expect(body.agent.metadata.new).toBe('field'); // Should add new
    });

    it('should validate input with Zod schema', async () => {
      const currentAgent = {
        id: 'agent-123',
        metadata: {},
        created_by: 'user-123',
        tenant_id: 'tenant-123',
        is_custom: false,
        is_library_agent: false,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: currentAgent,
        error: null,
      });

      const url = 'http://localhost:3000/api/agents/agent-123';
      const request = new NextRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          display_name: '', // Invalid: empty string
        }),
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await PUT(request, mockAuthContext, { params });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid input');
      expect(body.details).toBeDefined();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return 404 when agent not found for update', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found', code: 'PGRST116' },
      });

      const url = 'http://localhost:3000/api/agents/non-existent';
      const request = new NextRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          description: 'New description',
        }),
      });
      const params = Promise.resolve({ id: 'non-existent' });

      const response = await PUT(request, mockAuthContext, { params });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe('Agent not found');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle database errors during update', async () => {
      const currentAgent = {
        id: 'agent-123',
        metadata: {},
        created_by: 'user-123',
        tenant_id: 'tenant-123',
        is_custom: false,
        is_library_agent: false,
      };

      mockSupabase.single
        .mockResolvedValueOnce({
          data: currentAgent,
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Update failed', code: '23505' },
        });

      const url = 'http://localhost:3000/api/agents/agent-123';
      const request = new NextRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          description: 'New description',
        }),
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await PUT(request, mockAuthContext, { params });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toContain('Agent name or display name already exists');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should store display_name in metadata, not as direct column', async () => {
      const currentAgent = {
        id: 'agent-123',
        name: 'test-agent',
        metadata: {},
        created_by: 'user-123',
        tenant_id: 'tenant-123',
        is_custom: false,
        is_library_agent: false,
      };

      const updatedAgent = {
        ...currentAgent,
        metadata: { display_name: 'My Display Name' },
      };

      mockSupabase.single
        .mockResolvedValueOnce({
          data: currentAgent,
          error: null,
        })
        .mockResolvedValueOnce({
          data: updatedAgent,
          error: null,
        });

      const url = 'http://localhost:3000/api/agents/agent-123';
      const request = new NextRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          display_name: 'My Display Name',
        }),
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await PUT(request, mockAuthContext, { params });
      const body = await response.json();

      expect(response.status).toBe(200);
      // Verify update call doesn't include display_name as direct column
      const updateCall = mockSupabase.update.mock.calls[0][0];
      expect(updateCall.display_name).toBeUndefined();
      expect(updateCall.metadata.display_name).toBe('My Display Name');
    });
  });

  describe('DELETE /api/agents/[id]', () => {
    it('should soft delete agent (set is_active = false)', async () => {
      const agent = {
        id: 'agent-123',
        name: 'test-agent',
        metadata: {},
        tenant_id: 'tenant-123',
      };

      mockSupabase.single.mockResolvedValue({
        data: agent,
        error: null,
      });

      mockSupabase.update.mockResolvedValue({
        data: null,
        error: null,
      });

      const url = 'http://localhost:3000/api/agents/agent-123';
      const request = new NextRequest(url, {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await DELETE(request, mockAuthContext, { params });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Agent deleted successfully');
      expect(mockSupabase.update).toHaveBeenCalled();
      const updateCall = mockSupabase.update.mock.calls[0][0];
      expect(updateCall.is_active).toBe(false);
      expect(updateCall.deleted_at).toBeDefined();
      expect(mockLogger.infoWithMetrics).toHaveBeenCalled();
    });

    it('should return 404 when agent not found for deletion', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found', code: 'PGRST116' },
      });

      const url = 'http://localhost:3000/api/agents/non-existent';
      const request = new NextRequest(url, {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: 'non-existent' });

      const response = await DELETE(request, mockAuthContext, { params });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe('Agent not found');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle database errors during deletion', async () => {
      const agent = {
        id: 'agent-123',
        name: 'test-agent',
        metadata: {},
        tenant_id: 'tenant-123',
      };

      mockSupabase.single.mockResolvedValue({
        data: agent,
        error: null,
      });

      mockSupabase.update.mockResolvedValue({
        data: null,
        error: {
          message: 'Foreign key violation',
          code: '23503',
          details: 'Agent is referenced by other records',
        },
      });

      const url = 'http://localhost:3000/api/agents/agent-123';
      const request = new NextRequest(url, {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await DELETE(request, mockAuthContext, { params });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toContain('Cannot delete agent: it is referenced');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should delete agent from Pinecone (fire and forget)', async () => {
      const { pineconeVectorService } = await import(
        '@/lib/services/vectorstore/pinecone-vector-service'
      );

      const agent = {
        id: 'agent-123',
        name: 'test-agent',
        metadata: {},
        tenant_id: 'tenant-123',
      };

      mockSupabase.single.mockResolvedValue({
        data: agent,
        error: null,
      });

      mockSupabase.update.mockResolvedValue({
        data: null,
        error: null,
      });

      const url = 'http://localhost:3000/api/agents/agent-123';
      const request = new NextRequest(url, {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await DELETE(request, mockAuthContext, { params });

      expect(response.status).toBe(200);
      // Verify Pinecone deletion was attempted
      expect(pineconeVectorService.deleteAgentFromPinecone).toHaveBeenCalledWith('agent-123');
    });

    it('should handle Pinecone deletion failures gracefully', async () => {
      const { pineconeVectorService } = await import(
        '@/lib/services/vectorstore/pinecone-vector-service'
      );
      vi.spyOn(pineconeVectorService, 'deleteAgentFromPinecone').mockRejectedValue(
        new Error('Pinecone error')
      );

      const agent = {
        id: 'agent-123',
        name: 'test-agent',
        metadata: {},
        tenant_id: 'tenant-123',
      };

      mockSupabase.single.mockResolvedValue({
        data: agent,
        error: null,
      });

      mockSupabase.update.mockResolvedValue({
        data: null,
        error: null,
      });

      const url = 'http://localhost:3000/api/agents/agent-123';
      const request = new NextRequest(url, {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await DELETE(request, mockAuthContext, { params });

      // Should still succeed even if Pinecone deletion fails
      expect(response.status).toBe(200);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});

