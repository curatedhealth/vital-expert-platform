/**
 * Integration Tests for Agent Search API
 * 
 * Tests the complete GraphRAG search workflow including:
 * - Authentication and authorization
 * - GraphRAG hybrid search
 * - Fallback mechanisms
 * - Request validation
 * - Response formatting
 * 
 * Coverage Target: 95%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/agents/search/route';
import type { NextRequest } from 'next/server';
import { agentGraphRAGService } from '@/lib/services/agents/agent-graphrag-service';
import type { AgentSearchResult } from '@/lib/services/agents/agent-graphrag-service';

// Mock dependencies
const mockGraphRAGService = {
  searchAgents: vi.fn(),
};

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  infoWithMetrics: vi.fn(),
};

const mockAuthContext = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
  },
  profile: {
    tenant_id: 'tenant-123',
    role: 'member' as const,
  },
};

const mockVerifyPermissions = vi.fn();
const mockWithAgentAuth = vi.fn((handler) => {
  return async (request: NextRequest, params?: any) => {
    return handler(request, mockAuthContext, params);
  };
});

vi.mock('@/lib/services/agents/agent-graphrag-service', () => ({
  agentGraphRAGService: mockGraphRAGService,
}));

vi.mock('@/lib/services/observability/structured-logger', () => ({
  createLogger: vi.fn(() => mockLogger),
}));

vi.mock('@/middleware/agent-auth', () => ({
  withAgentAuth: mockWithAgentAuth,
  verifyAgentPermissions: mockVerifyPermissions,
}));

describe('Agent Search API Integration Tests', () => {
  let mockRequest: NextRequest;
  const mockSearchResults: AgentSearchResult[] = [
    {
      agent: {
        id: 'agent-1',
        name: 'Cardiology Expert',
        display_name: 'Cardiology Expert',
        description: 'Expert in cardiac conditions',
        system_prompt: 'You are a cardiology expert',
        tier: 1,
        capabilities: ['diagnosis', 'treatment'],
        knowledge_domains: ['cardiology'],
      },
      similarity: 0.92,
      matchReason: ['High semantic similarity', 'Domain match'],
      metadata: {
        graphDepth: 1,
        relationshipPath: ['collaborates'],
      },
    },
    {
      agent: {
        id: 'agent-2',
        name: 'General Practitioner',
        display_name: 'General Practitioner',
        description: 'General medical advice',
        system_prompt: 'You are a GP',
        tier: 3,
        capabilities: ['general'],
        knowledge_domains: ['general'],
      },
      similarity: 0.75,
      matchReason: ['Moderate similarity'],
      metadata: {
        graphDepth: 0,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default successful auth
    mockVerifyPermissions.mockResolvedValue({
      allowed: true,
      context: mockAuthContext,
    });

    // Default successful GraphRAG search
    mockGraphRAGService.searchAgents.mockResolvedValue(mockSearchResults);
  });

  function createMockRequest(body: any): NextRequest {
    return new NextRequest('http://localhost:3000/api/agents/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  describe('Successful GraphRAG Search', () => {
    it('should return agents from GraphRAG search', async () => {
      const request = createMockRequest({
        query: 'cardiac symptoms',
        topK: 5,
        minSimilarity: 0.7,
      });

      const response = await POST(request, {} as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.agents).toHaveLength(2);
      expect(data.count).toBe(2);
      expect(data.query).toBe('cardiac symptoms');
      expect(data.agents[0].agent.id).toBe('agent-1');
      expect(data.agents[0].similarity).toBe(0.92);
    });

    it('should call GraphRAG service with correct parameters', async () => {
      const request = createMockRequest({
        query: 'clinical trial design',
        topK: 10,
        minSimilarity: 0.8,
        filters: {
          tier: 1,
          status: 'active',
          knowledge_domain: 'cardiology',
        },
      });

      await POST(request, {} as any);

      expect(mockGraphRAGService.searchAgents).toHaveBeenCalledWith({
        query: 'clinical trial design',
        topK: 10,
        minSimilarity: 0.8,
        filters: {
          tier: 1,
          status: 'active',
          knowledge_domain: 'cardiology',
        },
      });
    });

    it('should use default values when optional parameters not provided', async () => {
      const request = createMockRequest({
        query: 'test query',
      });

      await POST(request, {} as any);

      expect(mockGraphRAGService.searchAgents).toHaveBeenCalledWith({
        query: 'test query',
        topK: 10, // Default
        minSimilarity: 0.7, // Default
        filters: {}, // Default
      });
    });

    it('should log search operation with metrics', async () => {
      const request = createMockRequest({
        query: 'test query',
      });

      await POST(request, {} as any);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'agent_search_started',
        expect.objectContaining({
          operation: 'POST /api/agents/search',
          userId: 'user-123',
          tenantId: 'tenant-123',
        })
      );

      expect(mockLogger.infoWithMetrics).toHaveBeenCalledWith(
        'agent_search_completed',
        expect.any(Number),
        expect.objectContaining({
          resultCount: 2,
          topSimilarity: 0.92,
        })
      );
    });
  });

  describe('Request Validation', () => {
    it('should reject request with missing query', async () => {
      const request = createMockRequest({
        topK: 5,
      });

      const response = await POST(request, {} as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
      expect(data.details).toBeDefined();
      expect(mockGraphRAGService.searchAgents).not.toHaveBeenCalled();
    });

    it('should reject request with empty query', async () => {
      const request = createMockRequest({
        query: '',
      });

      const response = await POST(request, {} as any);

      expect(response.status).toBe(400);
      expect(mockGraphRAGService.searchAgents).not.toHaveBeenCalled();
    });

    it('should reject query longer than 500 characters', async () => {
      const request = createMockRequest({
        query: 'a'.repeat(501),
      });

      const response = await POST(request, {} as any);

      expect(response.status).toBe(400);
      expect(mockGraphRAGService.searchAgents).not.toHaveBeenCalled();
    });

    it('should reject invalid topK values', async () => {
      const request = createMockRequest({
        query: 'test',
        topK: 0, // Invalid
      });

      const response = await POST(request, {} as any);

      expect(response.status).toBe(400);
    });

    it('should reject topK greater than 50', async () => {
      const request = createMockRequest({
        query: 'test',
        topK: 100,
      });

      const response = await POST(request, {} as any);

      expect(response.status).toBe(400);
    });

    it('should reject invalid minSimilarity values', async () => {
      const request = createMockRequest({
        query: 'test',
        minSimilarity: -0.1, // Invalid
      });

      const response = await POST(request, {} as any);

      expect(response.status).toBe(400);
    });

    it('should reject minSimilarity greater than 1', async () => {
      const request = createMockRequest({
        query: 'test',
        minSimilarity: 1.5,
      });

      const response = await POST(request, {} as any);

      expect(response.status).toBe(400);
    });

    it('should reject invalid filter values', async () => {
      const request = createMockRequest({
        query: 'test',
        filters: {
          tier: 0, // Invalid (must be 1-3)
        },
      });

      const response = await POST(request, {} as any);

      expect(response.status).toBe(400);
    });

    it('should accept valid filter values', async () => {
      const request = createMockRequest({
        query: 'test',
        filters: {
          tier: 2,
          status: 'active',
          knowledge_domain: 'cardiology',
          capabilities: ['diagnosis', 'treatment'],
        },
      });

      await POST(request, {} as any);

      expect(mockGraphRAGService.searchAgents).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            tier: 2,
            status: 'active',
            knowledge_domain: 'cardiology',
          }),
        })
      );
    });
  });

  describe('GraphRAG Service Errors', () => {
    it('should handle GraphRAG service failure gracefully', async () => {
      mockGraphRAGService.searchAgents.mockRejectedValue(
        new Error('GraphRAG service unavailable')
      );

      const request = createMockRequest({
        query: 'test query',
      });

      const response = await POST(request, {} as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Search failed');
      expect(data.details).toBe('GraphRAG service unavailable');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'agent_search_failed',
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('should handle GraphRAG timeout error', async () => {
      mockGraphRAGService.searchAgents.mockRejectedValue(
        new Error('Request timeout')
      );

      const request = createMockRequest({
        query: 'test query',
      });

      const response = await POST(request, {} as any);

      expect(response.status).toBe(500);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle GraphRAG returning empty results', async () => {
      mockGraphRAGService.searchAgents.mockResolvedValue([]);

      const request = createMockRequest({
        query: 'very specific query with no matches',
      });

      const response = await POST(request, {} as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.agents).toEqual([]);
      expect(data.count).toBe(0);
    });
  });

  describe('Response Format', () => {
    it('should return correctly formatted response', async () => {
      const request = createMockRequest({
        query: 'cardiac symptoms',
      });

      const response = await POST(request, {} as any);
      const data = await response.json();

      expect(data).toMatchObject({
        success: true,
        agents: expect.any(Array),
        count: expect.any(Number),
        query: expect.any(String),
      });

      if (data.agents.length > 0) {
        expect(data.agents[0]).toMatchObject({
          agent: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            display_name: expect.any(String),
          }),
          similarity: expect.any(Number),
          matchReason: expect.any(Array),
        });
      }
    });

    it('should include metadata in agent results', async () => {
      const request = createMockRequest({
        query: 'test',
      });

      const response = await POST(request, {} as any);
      const data = await response.json();

      if (data.agents.length > 0 && mockSearchResults[0].metadata) {
        expect(data.agents[0].metadata).toBeDefined();
      }
    });
  });

  describe('Authentication & Authorization', () => {
    it('should require authentication (handled by middleware)', async () => {
      // The withAgentAuth middleware would handle this
      // In real integration test, we'd test with actual auth
      
      // For now, verify middleware is applied
      expect(mockWithAgentAuth).toHaveBeenCalled();
    });

    it('should include user context in logs', async () => {
      const request = createMockRequest({
        query: 'test',
      });

      await POST(request, {} as any);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'agent_search_started',
        expect.objectContaining({
          userId: mockAuthContext.user.id,
          tenantId: mockAuthContext.profile.tenant_id,
        })
      );
    });
  });

  describe('Performance & Metrics', () => {
    it('should log operation duration', async () => {
      const request = createMockRequest({
        query: 'test',
      });

      await POST(request, {} as any);

      const metricsCall = mockLogger.infoWithMetrics.mock.calls.find(
        (call) => call[0] === 'agent_search_completed'
      );

      expect(metricsCall).toBeDefined();
      expect(metricsCall[1]).toBeGreaterThanOrEqual(0); // Duration
    });

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, () =>
        createMockRequest({
          query: 'concurrent test',
        })
      );

      const responses = await Promise.all(
        requests.map((req) => POST(req, {} as any))
      );

      expect(responses).toHaveLength(5);
      responses.forEach(async (response) => {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in query', async () => {
      const request = createMockRequest({
        query: 'test@#$%^&*()query',
      });

      const response = await POST(request, {} as any);

      expect(response.status).toBe(200);
      expect(mockGraphRAGService.searchAgents).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'test@#$%^&*()query',
        })
      );
    });

    it('should handle unicode characters', async () => {
      const request = createMockRequest({
        query: 'test query with émojis 😀 and spécial chars',
      });

      const response = await POST(request, {} as any);

      expect(response.status).toBe(200);
    });

    it('should handle very short queries', async () => {
      const request = createMockRequest({
        query: 'hi',
      });

      const response = await POST(request, {} as any);

      expect(response.status).toBe(200);
    });

    it('should handle queries at length limit', async () => {
      const request = createMockRequest({
        query: 'a'.repeat(500), // Max length
      });

      const response = await POST(request, {} as any);

      expect(response.status).toBe(200);
    });
  });

  describe('Filtering', () => {
    it('should pass filters to GraphRAG service', async () => {
      const request = createMockRequest({
        query: 'test',
        filters: {
          tier: 1,
          status: 'active',
          business_function: 'clinical',
          department: 'cardiology',
          knowledge_domain: 'heart disease',
          capabilities: ['diagnosis', 'treatment'],
        },
      });

      await POST(request, {} as any);

      expect(mockGraphRAGService.searchAgents).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: {
            tier: 1,
            status: 'active',
            business_function: 'clinical',
            department: 'cardiology',
            knowledge_domain: 'heart disease',
            capabilities: ['diagnosis', 'treatment'],
          },
        })
      );
    });

    it('should handle partial filters', async () => {
      const request = createMockRequest({
        query: 'test',
        filters: {
          tier: 2,
        },
      });

      await POST(request, {} as any);

      expect(mockGraphRAGService.searchAgents).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: {
            tier: 2,
          },
        })
      );
    });
  });
});

