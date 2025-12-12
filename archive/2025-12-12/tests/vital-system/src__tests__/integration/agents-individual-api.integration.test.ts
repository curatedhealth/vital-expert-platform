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

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import type { AgentPermissionContext } from '@/middleware/agent-auth';
import { z } from 'zod';

// Define mock Supabase client factory
const createMockSupabase = () => {
  const mockSupabase: any = {
    from: jest.fn(() => mockSupabase),
    select: jest.fn(() => mockSupabase),
    update: jest.fn(() => mockSupabase),
    eq: jest.fn(() => mockSupabase),
    single: jest.fn(),
  };
  return mockSupabase;
};

// Create mock instance for tests
let mockSupabase = createMockSupabase();

// Define mocks BEFORE jest.mock calls (they get hoisted)
const mockAuthContext: AgentPermissionContext = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
  },
  profile: {
    tenant_id: 'tenant-123',
    role: 'member' as const,
  },
};

// Use jest.mock with inline factory functions (avoids hoisting issues)
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => {
    // Return a fresh mock each time
    const mockSupabase: any = {
      from: jest.fn(() => mockSupabase),
      select: jest.fn(() => mockSupabase),
      update: jest.fn(() => mockSupabase),
      eq: jest.fn(() => mockSupabase),
      single: jest.fn(),
    };
    return mockSupabase;
  }),
}));

jest.mock('@/lib/services/observability/structured-logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    infoWithMetrics: jest.fn(),
  })),
}));

jest.mock('@/middleware/agent-auth', () => ({
  withAgentAuth: jest.fn((handler: Function) => {
    return async (request: any, context: any, params: any) => {
      const mockContext = {
        user: { id: 'user-123', email: 'test@example.com' },
        profile: { tenant_id: 'tenant-123', role: 'member' as const },
      };
      return handler(request, mockContext, params);
    };
  }),
}));

jest.mock('@/config/environment', () => ({
  env: {
    getTenantIds: jest.fn(() => ({
      platform: '00000000-0000-0000-0000-000000000001',
    })),
  },
}));

// Mock Pinecone sync
jest.mock('@/lib/services/agents/agent-embedding-service', () => ({
  agentEmbeddingService: {
    generateAgentEmbedding: jest.fn().mockResolvedValue({
      agentId: 'agent-123',
      embedding: [0.1, 0.2, 0.3],
      embeddingType: 'agent',
      text: 'test agent',
    }),
    storeAgentEmbeddingInSupabase: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/lib/services/vectorstore/pinecone-vector-service', () => ({
  pineconeVectorService: {
    syncAgentToPinecone: jest.fn().mockResolvedValue(undefined),
    deleteAgentFromPinecone: jest.fn().mockResolvedValue(undefined),
  },
}));

// Import after mocks are set up
import { GET, PUT, DELETE } from '@/app/api/agents/[id]/route';

describe('Agent Individual API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      jest.spyOn(pineconeVectorService, 'deleteAgentFromPinecone').mockRejectedValue(
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

  describe('PUT /api/agents/[id] - Expertise Level Mapping', () => {
    it('should map TypeScript "senior" to database "advanced"', async () => {
      const currentAgent = {
        id: 'agent-123',
        name: 'test-agent',
        metadata: {},
        created_by: 'user-123',
        tenant_id: 'tenant-123',
      };

      const updatedAgent = {
        ...currentAgent,
        expertise_level: 'advanced', // Should be mapped from 'senior'
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
          expertise_level: 'senior', // TypeScript value
        }),
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await PUT(request, mockAuthContext, { params });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      // Verify the update was called with mapped value
      const updateCall = mockSupabase.update.mock.calls[0][0];
      expect(updateCall.expertise_level).toBe('advanced');
    });

    it('should map TypeScript "entry" to database "beginner"', async () => {
      const currentAgent = {
        id: 'agent-123',
        name: 'test-agent',
        metadata: {},
        created_by: 'user-123',
        tenant_id: 'tenant-123',
      };

      const updatedAgent = {
        ...currentAgent,
        expertise_level: 'beginner',
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
          expertise_level: 'entry',
        }),
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await PUT(request, mockAuthContext, { params });

      expect(response.status).toBe(200);
      const updateCall = mockSupabase.update.mock.calls[0][0];
      expect(updateCall.expertise_level).toBe('beginner');
    });

    it('should map TypeScript "mid" to database "intermediate"', async () => {
      const currentAgent = {
        id: 'agent-123',
        name: 'test-agent',
        metadata: {},
        created_by: 'user-123',
        tenant_id: 'tenant-123',
      };

      const updatedAgent = {
        ...currentAgent,
        expertise_level: 'intermediate',
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
          expertise_level: 'mid',
        }),
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await PUT(request, mockAuthContext, { params });

      expect(response.status).toBe(200);
      const updateCall = mockSupabase.update.mock.calls[0][0];
      expect(updateCall.expertise_level).toBe('intermediate');
    });

    it('should map TypeScript "thought_leader" to database "expert"', async () => {
      const currentAgent = {
        id: 'agent-123',
        name: 'test-agent',
        metadata: {},
        created_by: 'user-123',
        tenant_id: 'tenant-123',
      };

      const updatedAgent = {
        ...currentAgent,
        expertise_level: 'expert',
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
          expertise_level: 'thought_leader',
        }),
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await PUT(request, mockAuthContext, { params });

      expect(response.status).toBe(200);
      const updateCall = mockSupabase.update.mock.calls[0][0];
      expect(updateCall.expertise_level).toBe('expert');
    });

    it('should pass through valid database value "expert" unchanged', async () => {
      const currentAgent = {
        id: 'agent-123',
        name: 'test-agent',
        metadata: {},
        created_by: 'user-123',
        tenant_id: 'tenant-123',
      };

      const updatedAgent = {
        ...currentAgent,
        expertise_level: 'expert',
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
          expertise_level: 'expert',
        }),
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await PUT(request, mockAuthContext, { params });

      expect(response.status).toBe(200);
      const updateCall = mockSupabase.update.mock.calls[0][0];
      expect(updateCall.expertise_level).toBe('expert');
    });

    it('should set unknown expertise_level to null and store original in metadata', async () => {
      const currentAgent = {
        id: 'agent-123',
        name: 'test-agent',
        metadata: {},
        created_by: 'user-123',
        tenant_id: 'tenant-123',
      };

      const updatedAgent = {
        ...currentAgent,
        expertise_level: null,
        metadata: { original_expertise_level: 'unknown_value' },
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
          expertise_level: 'unknown_value',
        }),
      });
      const params = Promise.resolve({ id: 'agent-123' });

      const response = await PUT(request, mockAuthContext, { params });

      expect(response.status).toBe(200);
      const updateCall = mockSupabase.update.mock.calls[0][0];
      expect(updateCall.expertise_level).toBeNull();
      expect(updateCall.metadata.original_expertise_level).toBe('unknown_value');
    });
  });
});

