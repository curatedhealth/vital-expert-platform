/**
 * Session Manager Tests
 * 
 * Tests session CRUD operations, querying, and status management
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SessionManager } from '../services/session-manager';
import type { CreateSessionParams, UpdateSessionStatsParams } from '../types/session.types';

// Mock Supabase
const mockSupabaseClient = {
  from: jest.fn(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock query chain
    mockQuery = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
    };

    mockSupabaseClient.from.mockReturnValue(mockQuery);

    sessionManager = new SessionManager('https://test.supabase.co', 'test-key');
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      const mockSession = {
        id: 'session-1',
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        agent_id: 'agent-1',
        mode: 'mode_1_interactive_manual',
        status: 'active',
        metadata: {},
        total_messages: 0,
        total_tokens: 0,
        total_cost: 0,
        created_at: '2025-01-30T00:00:00Z',
        updated_at: '2025-01-30T00:00:00Z',
        ended_at: null,
      };

      mockQuery.single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const params: CreateSessionParams = {
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        agent_id: 'agent-1',
      };

      const result = await sessionManager.createSession(params);

      expect(result.id).toBe('session-1');
      expect(result.tenant_id).toBe('tenant-1');
      expect(result.user_id).toBe('user-1');
      expect(result.agent_id).toBe('agent-1');
      expect(result.status).toBe('active');
      expect(result.mode).toBe('mode_1_interactive_manual');
      expect(mockQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant_id: 'tenant-1',
          user_id: 'user-1',
          agent_id: 'agent-1',
          status: 'active',
          total_messages: 0,
          total_tokens: 0,
          total_cost: 0,
        })
      );
    });

    it('should include metadata when provided', async () => {
      const mockSession = {
        id: 'session-1',
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        agent_id: 'agent-1',
        metadata: { key: 'value' },
        status: 'active',
        total_messages: 0,
        total_tokens: 0,
        total_cost: 0,
        created_at: '2025-01-30T00:00:00Z',
        updated_at: '2025-01-30T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const params: CreateSessionParams = {
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        agent_id: 'agent-1',
        metadata: { key: 'value' },
      };

      await sessionManager.createSession(params);

      expect(mockQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { key: 'value' },
        })
      );
    });

    it('should throw error on creation failure', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: '23505' },
      });

      const params: CreateSessionParams = {
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        agent_id: 'agent-1',
      };

      await expect(sessionManager.createSession(params)).rejects.toThrow(
        'Failed to create session'
      );
    });
  });

  describe('getSession', () => {
    it('should retrieve session by ID', async () => {
      const mockSession = {
        id: 'session-1',
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        agent_id: 'agent-1',
        status: 'active',
        metadata: {},
        total_messages: 5,
        total_tokens: 1000,
        total_cost: 0.01,
        created_at: '2025-01-30T00:00:00Z',
        updated_at: '2025-01-30T00:00:00Z',
        ended_at: null,
      };

      mockQuery.single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const result = await sessionManager.getSession('session-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('session-1');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'session-1');
    });

    it('should return null for non-existent session', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      const result = await sessionManager.getSession('non-existent');

      expect(result).toBeNull();
    });

    it('should throw error on query failure', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Query error', code: '23503' },
      });

      await expect(sessionManager.getSession('session-1')).rejects.toThrow(
        'Failed to get session'
      );
    });
  });

  describe('getActiveSession', () => {
    it('should retrieve active session for user and agent', async () => {
      const mockSession = {
        id: 'session-1',
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        agent_id: 'agent-1',
        mode: 'mode_1_interactive_manual',
        status: 'active',
        metadata: {},
        total_messages: 0,
        total_tokens: 0,
        total_cost: 0,
        created_at: '2025-01-30T00:00:00Z',
        updated_at: '2025-01-30T00:00:00Z',
        ended_at: null,
      };

      // Create a query chain for this test
      const queryChain: any = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [mockSession],
          error: null,
        }),
      };

      mockQuery.select.mockReturnValue(queryChain);

      const result = await sessionManager.getActiveSession('user-1', 'agent-1');

      expect(result).not.toBeNull();
      expect(result?.user_id).toBe('user-1');
      expect(result?.agent_id).toBe('agent-1');
      expect(result?.status).toBe('active');
      expect(queryChain.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(queryChain.eq).toHaveBeenCalledWith('agent_id', 'agent-1');
      expect(queryChain.eq).toHaveBeenCalledWith('status', 'active');
      expect(queryChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should filter by tenant when provided', async () => {
      // When tenantId is provided, query is reassigned, so we need a chain that supports eq after limit
      const queryChain: any = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn(),
      };

      // The limit call needs to return a promise, but if tenantId is provided, 
      // query is reassigned, so limit needs to also support eq
      const limitResult = {
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
      
      queryChain.limit.mockReturnValue(limitResult);
      mockQuery.select.mockReturnValue(queryChain);

      await sessionManager.getActiveSession('user-1', 'agent-1', 'tenant-1');

      // Should have called eq for tenant_id via the reassignment
      expect(limitResult.eq).toHaveBeenCalledWith('tenant_id', 'tenant-1');
    });

    it('should return null when no active session found', async () => {
      mockQuery.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await sessionManager.getActiveSession('user-1', 'agent-1');

      expect(result).toBeNull();
    });
  });

  describe('updateSessionStats', () => {
    it('should update session statistics', async () => {
      const mockUpdated = {
        id: 'session-1',
        total_messages: 10,
        total_tokens: 2000,
        total_cost: 0.02,
        updated_at: '2025-01-30T01:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockUpdated,
        error: null,
      });

      const params: UpdateSessionStatsParams = {
        message_count: 5,
        tokens: 1000,
        cost: 0.01,
      };

      const result = await sessionManager.updateSessionStats('session-1', params);

      expect(result.total_messages).toBe(10);
      expect(result.total_tokens).toBe(2000);
      expect(result.total_cost).toBe(0.02);
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'session-1');
      expect(mockQuery.update).toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const mockUpdated = {
        id: 'session-1',
        total_messages: 5,
        updated_at: '2025-01-30T01:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockUpdated,
        error: null,
      });

      await sessionManager.updateSessionStats('session-1', {
        message_count: 5,
      });

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          total_messages: 5,
        })
      );
    });
  });

  describe('endSession', () => {
    it('should end a session', async () => {
      mockQuery.eq.mockResolvedValue({
        data: { id: 'session-1' },
        error: null,
      });

      await sessionManager.endSession('session-1');

      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'session-1');
      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ended',
        })
      );
    });

    it('should set ended_at timestamp', async () => {
      mockQuery.eq.mockResolvedValue({
        data: {},
        error: null,
      });

      await sessionManager.endSession('session-1');

      const updateCall = mockQuery.update.mock.calls[0][0];
      expect(updateCall.status).toBe('ended');
      expect(updateCall.ended_at).toBeDefined();
    });
  });

  describe('pauseSession', () => {
    it('should pause a session', async () => {
      mockQuery.eq.mockResolvedValue({
        data: {},
        error: null,
      });

      await sessionManager.pauseSession('session-1');

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'paused',
        })
      );
    });
  });

  describe('resumeSession', () => {
    it('should resume a paused session', async () => {
      mockQuery.eq.mockResolvedValue({
        data: {},
        error: null,
      });

      await sessionManager.resumeSession('session-1');

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active',
        })
      );
    });
  });

  describe('expireIdleSessions', () => {
    it('should expire sessions older than threshold', async () => {
      // expireIdleSessions() doesn't take parameters - uses fixed 30 minutes
      const expireQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [{ id: 'session-1' }, { id: 'session-2' }],
          error: null,
        }),
      };

      mockQuery.update.mockReturnValue(expireQuery);

      const result = await sessionManager.expireIdleSessions();

      expect(result).toBe(2);
      expect(mockQuery.update).toHaveBeenCalled();
    });

    it('should handle no idle sessions', async () => {
      const expireQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      mockQuery.update.mockReturnValue(expireQuery);

      const result = await sessionManager.expireIdleSessions();

      expect(result).toBe(0);
    });

    it('should return 0 on error', async () => {
      const expireQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Error' },
        }),
      };

      mockQuery.update.mockReturnValue(expireQuery);

      const result = await sessionManager.expireIdleSessions();

      expect(result).toBe(0);
    });
  });

  describe('querySessions', () => {
    it('should query sessions with filters', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          tenant_id: 'tenant-1',
          user_id: 'user-1',
          agent_id: 'agent-1',
          status: 'active',
          mode: 'mode_1_interactive_manual',
          metadata: {},
          total_messages: 0,
          total_tokens: 0,
          total_cost: 0,
          created_at: '2025-01-30T00:00:00Z',
          updated_at: '2025-01-30T00:00:00Z',
          ended_at: null,
        },
      ];

      // Create a query chain that supports reassignment
      const queryChain: any = {
        select: jest.fn(),
        eq: jest.fn(),
        order: jest.fn(),
        limit: jest.fn(),
        range: jest.fn(),
      };

      // Make all methods return the chain for reassignment
      queryChain.select.mockReturnValue(queryChain);
      queryChain.eq.mockReturnValue(queryChain);
      queryChain.order.mockReturnValue(queryChain);
      queryChain.limit.mockResolvedValue({
        data: mockSessions,
        error: null,
      });
      queryChain.range.mockResolvedValue({
        data: mockSessions,
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue(queryChain);

      const result = await sessionManager.querySessions({
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        limit: 10,
      });

      expect(result.length).toBe(1);
      expect(queryChain.eq).toHaveBeenCalled();
    });

    it('should handle empty results', async () => {
      const queryChain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      queryChain.eq.mockReturnValue(queryChain);
      queryChain.order.mockReturnValue(queryChain);

      mockSupabaseClient.from.mockReturnValue(queryChain);

      const result = await sessionManager.querySessions({});

      expect(result).toEqual([]);
    });

    it('should support status filter', async () => {
      const queryChain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      queryChain.eq.mockReturnValue(queryChain);
      queryChain.order.mockReturnValue(queryChain);

      mockSupabaseClient.from.mockReturnValue(queryChain);

      await sessionManager.querySessions({
        status: 'active',
      });

      expect(queryChain.eq).toHaveBeenCalled();
    });

    it('should support offset and limit', async () => {
      const queryChain: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      queryChain.eq.mockReturnValue(queryChain);
      queryChain.order.mockReturnValue(queryChain);
      queryChain.limit.mockReturnValue(queryChain);

      mockSupabaseClient.from.mockReturnValue(queryChain);

      await sessionManager.querySessions({
        limit: 20,
        offset: 10,
      });

      expect(queryChain.range).toHaveBeenCalled();
    });
  });

  describe('mapToSession', () => {
    it('should map database record correctly', async () => {
      const mockData = {
        id: 'session-1',
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        agent_id: 'agent-1',
        mode: 'mode_1_interactive_manual',
        status: 'active',
        metadata: { key: 'value' },
        total_messages: 5,
        total_tokens: 1000,
        total_cost: 0.01,
        created_at: '2025-01-30T00:00:00Z',
        updated_at: '2025-01-30T01:00:00Z',
        ended_at: null,
      };

      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await sessionManager.getSession('session-1');

      expect(result?.id).toBe(mockData.id);
      expect(result?.tenant_id).toBe(mockData.tenant_id);
      expect(result?.user_id).toBe(mockData.user_id);
      expect(result?.agent_id).toBe(mockData.agent_id);
      expect(result?.status).toBe(mockData.status);
      expect(result?.metadata).toEqual(mockData.metadata);
      expect(result?.total_messages).toBe(mockData.total_messages);
      expect(result?.total_tokens).toBe(mockData.total_tokens);
      expect(result?.total_cost).toBe(mockData.total_cost);
    });

    it('should handle default values', async () => {
      const mockData = {
        id: 'session-1',
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        agent_id: 'agent-1',
        created_at: '2025-01-30T00:00:00Z',
        updated_at: '2025-01-30T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await sessionManager.getSession('session-1');

      expect(result?.mode).toBe('mode_1_interactive_manual');
      expect(result?.status).toBe('active');
      expect(result?.metadata).toEqual({});
      expect(result?.total_messages).toBe(0);
      expect(result?.total_tokens).toBe(0);
      expect(result?.total_cost).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null metadata', async () => {
      const mockData = {
        id: 'session-1',
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        agent_id: 'agent-1',
        metadata: null,
        status: 'active',
        total_messages: 0,
        total_tokens: 0,
        total_cost: 0,
        created_at: '2025-01-30T00:00:00Z',
        updated_at: '2025-01-30T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await sessionManager.getSession('session-1');

      expect(result?.metadata).toEqual({});
    });

    it('should handle very large metadata', async () => {
      const largeMetadata = {
        key1: 'value1',
        key2: Array(1000).fill('x').join(''),
        key3: { nested: { deeply: { nested: 'value' } } },
      };

      const params: CreateSessionParams = {
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        agent_id: 'agent-1',
        metadata: largeMetadata,
      };

      const mockSession = {
        id: 'session-1',
        ...params,
        mode: 'mode_1_interactive_manual',
        status: 'active',
        total_messages: 0,
        total_tokens: 0,
        total_cost: 0,
        created_at: '2025-01-30T00:00:00Z',
        updated_at: '2025-01-30T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const result = await sessionManager.createSession(params);

      expect(result.metadata).toEqual(largeMetadata);
    });
  });
});

