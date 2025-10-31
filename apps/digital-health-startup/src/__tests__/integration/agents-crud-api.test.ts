/**
 * Integration Tests for Agent CRUD API
 * 
 * Tests the complete CRUD workflow including:
 * - GET /api/agents-crud - List agents with tenant filtering
 * - POST /api/agents-crud - Create agent with validation
 * - Authentication and authorization
 * - Tenant isolation and permission checks
 * - Error handling
 * 
 * Coverage Target: 95%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/agents-crud/route';
import type { NextRequest } from 'next/server';
import type { AgentPermissionContext } from '@/middleware/agent-auth';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  or: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
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

const mockAdminSupabase = {
  from: vi.fn(() => mockAdminSupabase),
  select: vi.fn(() => mockAdminSupabase),
  eq: vi.fn(() => mockAdminSupabase),
  single: vi.fn(),
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

const mockAdminAuthContext: AgentPermissionContext = {
  user: {
    id: 'admin-123',
    email: 'admin@example.com',
  },
  profile: {
    id: 'profile-admin',
    tenant_id: 'tenant-123',
    role: 'admin' as const,
    user_id: 'admin-123',
  },
};

const mockWithAgentAuth = vi.fn((handler) => {
  return async (request: NextRequest) => {
    return handler(request, mockAuthContext);
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockAdminSupabase),
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
    getSupabaseConfig: vi.fn(() => ({
      url: 'https://test.supabase.co',
      serviceRoleKey: 'test-service-key',
    })),
  },
}));

// Mock Pinecone sync (fire and forget, should not fail test)
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
  },
}));

describe('Agent CRUD API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/agents-crud', () => {
    it('should return agents list for regular user with tenant filtering', async () => {
      const mockAgents = [
        {
          id: 'agent-1',
          name: 'Agent 1',
          description: 'Test agent 1',
          system_prompt: 'You are a test agent',
          capabilities: ['test'],
          metadata: { avatar: '🤖', display_name: 'Agent 1' },
          tenant_id: 'tenant-123',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'agent-2',
          name: 'Agent 2',
          description: 'Platform agent',
          system_prompt: 'Platform agent',
          capabilities: ['general'],
          metadata: { avatar: '🤖', display_name: 'Agent 2' },
          tenant_id: '00000000-0000-0000-0000-000000000001',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockAgents,
        error: null,
      });

      mockAdminSupabase.single.mockResolvedValue({
        data: { file_url: '/icons/avatar.png', name: 'avatar_0001' },
        error: null,
      });

      const url = 'http://localhost:3000/api/agents-crud';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.agents).toHaveLength(2);
      expect(body.count).toBe(2);
      expect(mockSupabase.or).toHaveBeenCalledWith(
        'tenant_id.eq.tenant-123,tenant_id.eq.00000000-0000-0000-0000-000000000001'
      );
    });

    it('should return all agents for admin with showAll=true', async () => {
      // Use admin context
      mockWithAgentAuth.mockImplementation((handler) => {
        return async (request: NextRequest) => {
          return handler(request, mockAdminAuthContext);
        };
      });

      const mockAgents = [
        {
          id: 'agent-1',
          name: 'Agent 1',
          description: 'Test agent',
          system_prompt: 'Test',
          capabilities: ['test'],
          metadata: {},
          tenant_id: 'tenant-123',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockAgents,
        error: null,
      });

      mockAdminSupabase.single.mockResolvedValue({
        data: { file_url: '/icons/avatar.png', name: 'avatar_0001' },
        error: null,
      });

      const url = 'http://localhost:3000/api/agents-crud?showAll=true';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      // Admin should not use .or() filter
      expect(mockSupabase.or).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed', code: 'PGRST000' },
      });

      const url = 'http://localhost:3000/api/agents-crud';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe('Failed to fetch agents from database');
      expect(body.details).toBe('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should normalize agent avatars from icons table', async () => {
      const mockAgents = [
        {
          id: 'agent-1',
          name: 'Agent 1',
          description: 'Test',
          system_prompt: 'Test',
          capabilities: ['test'],
          metadata: { avatar: 'avatar_0001' },
          tenant_id: 'tenant-123',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockAgents,
        error: null,
      });

      mockAdminSupabase.single.mockResolvedValue({
        data: {
          file_url: 'https://example.com/avatar.png',
          file_path: '/icons/avatar.png',
          name: 'avatar_0001',
        },
        error: null,
      });

      const url = 'http://localhost:3000/api/agents-crud';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.agents[0].avatar).toContain('avatar'); // Should be resolved
    });

    it('should handle empty agent list', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const url = 'http://localhost:3000/api/agents-crud';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.agents).toHaveLength(0);
      expect(body.count).toBe(0);
    });
  });

  describe('POST /api/agents-crud', () => {
    it('should create agent with valid data', async () => {
      const newAgent = {
        id: 'agent-new',
        name: 'new-agent',
        description: 'New agent',
        system_prompt: 'You are a new agent',
        capabilities: ['general'],
        metadata: {},
        tenant_id: 'tenant-123',
        created_by: 'user-123',
        is_custom: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: newAgent,
        error: null,
      });

      const url = 'http://localhost:3000/api/agents-crud';
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          agentData: {
            name: 'new-agent',
            system_prompt: 'You are a new agent',
            description: 'New agent',
            capabilities: ['general'],
          },
          categoryIds: [],
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.agent.id).toBe('agent-new');
      expect(body.agent.name).toBe('new-agent');
      expect(mockSupabase.insert).toHaveBeenCalled();
      expect(mockLogger.infoWithMetrics).toHaveBeenCalled();
    });

    it('should reject agent creation without required fields', async () => {
      const url = 'http://localhost:3000/api/agents-crud';
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          agentData: {
            name: 'incomplete-agent',
            // Missing system_prompt
          },
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toContain('Missing required agent fields');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should link categories when provided', async () => {
      const newAgent = {
        id: 'agent-with-categories',
        name: 'test-agent',
        system_prompt: 'Test',
        tenant_id: 'tenant-123',
        created_by: 'user-123',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: newAgent,
        error: null,
      });

      // Mock category mapping insert
      const mockCategoryInsert = {
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'agent_category_mapping') {
          return mockCategoryInsert;
        }
        return mockSupabase;
      });

      const url = 'http://localhost:3000/api/agents-crud';
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          agentData: {
            name: 'test-agent',
            system_prompt: 'Test',
          },
          categoryIds: ['cat-1', 'cat-2'],
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mockCategoryInsert.insert).toHaveBeenCalled();
    });

    it('should handle database errors during creation', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Duplicate key violation', code: '23505' },
      });

      const url = 'http://localhost:3000/api/agents-crud';
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          agentData: {
            name: 'duplicate-agent',
            system_prompt: 'Test',
          },
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.error).toContain('Duplicate key violation');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should set tenant_id and created_by from context', async () => {
      const newAgent = {
        id: 'agent-owned',
        name: 'owned-agent',
        system_prompt: 'Test',
        tenant_id: 'tenant-123',
        created_by: 'user-123',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: newAgent,
        error: null,
      });

      const url = 'http://localhost:3000/api/agents-crud';
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          agentData: {
            name: 'owned-agent',
            system_prompt: 'Test',
          },
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      // Verify insert was called with tenant_id and created_by
      expect(mockSupabase.insert).toHaveBeenCalled();
      const insertCall = mockSupabase.insert.mock.calls[0][0];
      expect(insertCall.tenant_id).toBe('tenant-123');
      expect(insertCall.created_by).toBe('user-123');
    });

    it('should handle category linking failures gracefully', async () => {
      const newAgent = {
        id: 'agent-cat-fail',
        name: 'test-agent',
        system_prompt: 'Test',
        tenant_id: 'tenant-123',
        created_by: 'user-123',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: newAgent,
        error: null,
      });

      const mockCategoryInsert = {
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Category link failed' },
        }),
      };
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'agent_category_mapping') {
          return mockCategoryInsert;
        }
        return mockSupabase;
      });

      const url = 'http://localhost:3000/api/agents-crud';
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          agentData: {
            name: 'test-agent',
            system_prompt: 'Test',
          },
          categoryIds: ['cat-1'],
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      // Agent should still be created successfully
      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      // Category failure should be logged as warning
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});

