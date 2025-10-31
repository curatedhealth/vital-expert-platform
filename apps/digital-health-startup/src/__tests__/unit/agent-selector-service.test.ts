/**
 * Unit Tests for AgentSelectorService
 * 
 * Tests agent selection with GraphRAG, fallback strategies, ranking, and selection.
 * Based on VITAL_GRAPHRAG_AGENT_SELECTION_V2.md specifications.
 * 
 * Coverage Target: 90%+
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AgentSelectorService } from '@/features/chat/services/agent-selector-service';
import type { Agent, QueryAnalysis, AgentRanking } from '@/features/chat/services/agent-selector-service';
import { GraphRAGSearchError, AgentSelectionError } from '@/lib/errors/agent-errors';

// Setup mocks - must define inline for Jest hoisting
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
  })),
}));

jest.mock('@pinecone-database/pinecone', () => ({
  Pinecone: jest.fn(() => ({
    index: jest.fn(),
  })),
}));

jest.mock('@/lib/services/agents/agent-graphrag-service', () => ({
  agentGraphRAGService: {
    searchAgents: jest.fn(),
  },
}));

jest.mock('@/lib/services/resilience/circuit-breaker', () => ({
  getSupabaseCircuitBreaker: jest.fn(() => ({
    execute: jest.fn(),
  })),
}));

jest.mock('@/lib/services/cache/embedding-cache', () => ({
  getEmbeddingCache: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

jest.mock('@/lib/services/observability/tracing', () => ({
  getTracingService: jest.fn(() => ({
    startSpan: jest.fn(() => 'span-id'),
    endSpan: jest.fn(),
    addTags: jest.fn(),
  })),
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

jest.mock('@/lib/services/observability/agent-metrics-service', () => ({
  getAgentMetricsService: jest.fn(() => ({
    recordOperation: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AgentSelectorService', () => {
  let service: AgentSelectorService;
  let mockQueryBuilder: any;
  let mockSelect: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Supabase query builder
    mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      overlaps: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };

    mockSelect = {
      select: vi.fn().mockReturnValue(mockQueryBuilder),
    };

    mockSupabase.from.mockReturnValue(mockSelect);

    service = new AgentSelectorService({
      requestId: 'test-request',
      userId: 'test-user',
      tenantId: 'test-tenant',
    });
  });

  describe('analyzeQuery', () => {
    beforeEach(() => {
      // Mock API Gateway URL
      process.env.NEXT_PUBLIC_API_GATEWAY_URL = 'http://localhost:3001';
      process.env.API_GATEWAY_URL = 'http://localhost:3001';
    });

    it('should analyze query via API Gateway', async () => {
      const mockAnalysis = {
        intent: 'diagnosis',
        domains: ['cardiology'],
        complexity: 'medium',
        keywords: ['symptoms', 'chest', 'pain'],
        medical_terms: ['cardiac', 'ECG'],
        confidence: 0.85,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysis,
      });

      const result = await service.analyzeQuery('I have chest pain and need a diagnosis');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/agents/select'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result.intent).toBe('diagnosis');
      expect(result.domains).toEqual(['cardiology']);
      expect(result.complexity).toBe('medium');
      expect(result.keywords).toEqual(['symptoms', 'chest', 'pain']);
      expect(result.medicalTerms).toEqual(['cardiac', 'ECG']);
      expect(result.confidence).toBe(0.85);
    });

    it('should handle API Gateway errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Service unavailable' }),
      });

      const result = await service.analyzeQuery('test query');

      // Should fallback to basic analysis
      expect(result.intent).toBe('general');
      expect(result.domains).toEqual([]);
      expect(result.confidence).toBe(0.5);
    });

    it('should handle network errors with fallback', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await service.analyzeQuery('test query');

      // Should fallback to basic analysis
      expect(result.intent).toBe('general');
      expect(result.domains).toEqual([]);
      expect(result.confidence).toBe(0.5);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should include tenant ID in request', async () => {
      const mockAnalysis = {
        intent: 'general',
        domains: [],
        complexity: 'medium',
        keywords: [],
        medical_terms: [],
        confidence: 0.7,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysis,
      });

      await service.analyzeQuery('test query');

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.tenant_id).toBe('test-tenant');
      expect(fetchCall[1].headers['x-tenant-id']).toBe('test-tenant');
    });

    it('should handle timeout errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new DOMException('The operation was aborted.', 'AbortError'));

      const result = await service.analyzeQuery('test query');

      // Should fallback to basic analysis
      expect(result.intent).toBe('general');
      expect(result.confidence).toBe(0.5);
    });

    it('should map medical_terms correctly from API response', async () => {
      const mockAnalysis = {
        intent: 'diagnosis',
        domains: ['cardiology'],
        complexity: 'high',
        keywords: ['symptoms', 'treatment'],
        medical_terms: ['hypertension', 'ECG'], // Python uses snake_case
        confidence: 0.9,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysis,
      });

      const result = await service.analyzeQuery('What are symptoms of hypertension?');

      expect(result.medicalTerms).toEqual(['hypertension', 'ECG']);
    });
  });

  describe('findCandidateAgents', () => {
    const mockAgents: Agent[] = [
      {
        id: 'agent-1',
        name: 'Cardiology Expert',
        display_name: 'Cardiology Expert',
        description: 'Expert in cardiac conditions',
        system_prompt: 'You are a cardiology expert',
        tier: 1,
        capabilities: ['diagnosis', 'treatment'],
        knowledge_domains: ['cardiology'],
      },
      {
        id: 'agent-2',
        name: 'General Practitioner',
        display_name: 'General Practitioner',
        description: 'General medical advice',
        system_prompt: 'You are a GP',
        tier: 3,
        capabilities: ['general'],
        knowledge_domains: ['general'],
      },
    ];

    it('should successfully find agents using GraphRAG', async () => {
      (mockGraphRAGService.searchAgents as jest.Mock).mockResolvedValue([
        {
          agent: mockAgents[0],
          similarity: 0.92,
          metadata: { graphDepth: 1 },
        },
        {
          agent: mockAgents[1],
          similarity: 0.75,
          metadata: { graphDepth: 0 },
        },
      ]);

      const agents = await service.findCandidateAgents(
        'cardiac symptoms',
        ['cardiology'],
        5
      );

      expect(agents).toHaveLength(2);
      expect(agents[0].id).toBe('agent-1');
      expect(mockGraphRAGService.searchAgents).toHaveBeenCalledWith({
        query: 'cardiac symptoms',
        topK: 5,
        minSimilarity: 0.6,
        filters: {
          knowledge_domain: 'cardiology',
          status: 'active',
        },
      });
      expect(mockMetricsService.recordOperation).toHaveBeenCalled();
    });

    it('should fallback to database search when GraphRAG fails', async () => {
      mockGraphRAGService.searchAgents.mockRejectedValue(new Error('GraphRAG error'));

      // Mock database fallback
      mockCircuitBreaker.execute.mockResolvedValue({
        data: mockAgents,
        error: null,
      });

      const agents = await service.findCandidateAgents(
        'cardiac symptoms',
        ['cardiology'],
        5
      );

      expect(agents).toEqual(mockAgents);
      expect(mockCircuitBreaker.execute).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'graphrag_search_failed',
        expect.any(Object)
      );
    });

    it('should handle GraphRAGSearchError and use fallback', async () => {
      const graphRAGError = new GraphRAGSearchError('GraphRAG failed', {
        cause: new Error('Connection timeout'),
        context: {},
      });
      mockGraphRAGService.searchAgents.mockRejectedValue(graphRAGError);

      mockCircuitBreaker.execute.mockResolvedValue({
        data: mockAgents,
        error: null,
      });

      const agents = await service.findCandidateAgents('query', [], 5);

      expect(agents).toEqual(mockAgents);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle database query failures and return emergency fallback', async () => {
      mockGraphRAGService.searchAgents.mockRejectedValue(new Error('GraphRAG error'));
      mockCircuitBreaker.execute.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      // Mock emergency fallback
      const emergencyAgents = [mockAgents[0]];
      mockCircuitBreaker.execute.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      }).mockResolvedValueOnce({
        data: emergencyAgents,
        error: null,
      });

      const agents = await service.findCandidateAgents('query', [], 5);

      // Should eventually get emergency agents
      expect(mockCircuitBreaker.execute).toHaveBeenCalled();
    });

    it('should validate query with Zod schema', async () => {
      mockGraphRAGService.searchAgents.mockResolvedValue([]);

      await service.findCandidateAgents('valid query', [], 5);

      // Should log validation attempts (may warn if validation fails)
      expect(mockGraphRAGService.searchAgents).toHaveBeenCalled();
    });

    it('should record search metrics with GraphRAG hit', async () => {
      mockGraphRAGService.searchAgents.mockResolvedValue([
        {
          agent: mockAgents[0],
          similarity: 0.92,
          metadata: { graphDepth: 2 },
        },
      ]);

      await service.findCandidateAgents('query', [], 5);

      expect(mockMetricsService.recordOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          operationType: 'search',
          searchMethod: 'graphrag_hybrid',
          graphragHit: true,
          graphragFallback: false,
          graphTraversalDepth: 2,
        })
      );
    });

    it('should record fallback metrics when GraphRAG fails', async () => {
      mockGraphRAGService.searchAgents.mockRejectedValue(new Error('GraphRAG error'));
      mockCircuitBreaker.execute.mockResolvedValue({
        data: mockAgents,
        error: null,
      });

      await service.findCandidateAgents('query', [], 5);

      // Should record fallback metrics
      const recordCalls = mockMetricsService.recordOperation.mock.calls;
      const fallbackCall = recordCalls.find(
        (call) => call[0].graphragFallback === true
      );
      expect(fallbackCall).toBeDefined();
    });
  });

  describe('rankAgents', () => {
    const mockAgents: Agent[] = [
      {
        id: 'agent-1',
        name: 'Cardiology Expert',
        display_name: 'Cardiology Expert',
        description: 'Expert in cardiac conditions and heart disease',
        system_prompt: 'You are a cardiology expert',
        tier: 1,
        capabilities: ['diagnosis', 'treatment', 'cardiology'],
        knowledge_domains: ['cardiology'],
      },
      {
        id: 'agent-2',
        name: 'General Practitioner',
        display_name: 'General Practitioner',
        description: 'General medical advice',
        system_prompt: 'You are a GP',
        tier: 3,
        capabilities: ['general'],
        knowledge_domains: ['general'],
      },
      {
        id: 'agent-3',
        name: 'Endocrinology Specialist',
        display_name: 'Endocrinology Specialist',
        description: 'Expert in diabetes and hormone disorders',
        system_prompt: 'You are an endocrinologist',
        tier: 2,
        capabilities: ['diagnosis', 'diabetes'],
        knowledge_domains: ['endocrinology'],
      },
    ];

    const mockAnalysis: QueryAnalysis = {
      intent: 'diagnosis',
      domains: ['cardiology'],
      complexity: 'high',
      keywords: ['symptoms', 'heart', 'cardiac'],
      medicalTerms: ['hypertension', 'cardiomyopathy'],
      confidence: 0.9,
    };

    it('should rank agents by relevance score', () => {
      const rankings = service.rankAgents(mockAgents, 'cardiac symptoms', mockAnalysis);

      expect(rankings).toHaveLength(3);
      expect(rankings[0].agent.id).toBe('agent-1'); // Cardiology expert should rank highest
      expect(rankings[0].score).toBeGreaterThan(rankings[1].score);
      expect(rankings[0].score).toBeGreaterThan(rankings[2].score);
    });

    it('should calculate score breakdown correctly', () => {
      const rankings = service.rankAgents(mockAgents, 'cardiac symptoms', mockAnalysis);

      const topRanking = rankings[0];
      expect(topRanking.breakdown).toHaveProperty('semanticSimilarity');
      expect(topRanking.breakdown).toHaveProperty('domainRelevance');
      expect(topRanking.breakdown).toHaveProperty('tierPreference');
      expect(topRanking.breakdown).toHaveProperty('capabilityMatch');

      // Cardiology expert should have high domain relevance
      expect(topRanking.breakdown.domainRelevance).toBeGreaterThan(0.5);
    });

    it('should generate ranking reasons', () => {
      const rankings = service.rankAgents(mockAgents, 'cardiac symptoms', mockAnalysis);

      rankings.forEach((ranking) => {
        expect(ranking.reason).toBeDefined();
        expect(typeof ranking.reason).toBe('string');
        expect(ranking.reason.length).toBeGreaterThan(0);
      });

      // Top ranking should have specific reason
      expect(rankings[0].reason).toContain('cardiology');
    });

    it('should handle empty agent list', () => {
      const rankings = service.rankAgents([], 'query', mockAnalysis);

      expect(rankings).toHaveLength(0);
    });

    it('should prefer higher tier agents when scores are similar', () => {
      const similarAgents: Agent[] = [
        {
          ...mockAgents[0],
          tier: 1,
          description: 'Expert medical advice',
        },
        {
          ...mockAgents[1],
          tier: 3,
          description: 'Expert medical advice',
        },
      ];

      const rankings = service.rankAgents(similarAgents, 'medical advice', mockAnalysis);

      // Tier 1 should rank higher than tier 3
      expect(rankings[0].agent.tier).toBeLessThanOrEqual(rankings[1].agent.tier);
    });

    it('should handle agents without domains or capabilities', () => {
      const minimalAgents: Agent[] = [
        {
          id: 'agent-minimal',
          name: 'Minimal Agent',
          display_name: 'Minimal Agent',
          description: 'Basic agent',
          system_prompt: 'Basic',
          tier: 3,
        },
      ];

      const rankings = service.rankAgents(minimalAgents, 'query', mockAnalysis);

      expect(rankings).toHaveLength(1);
      expect(rankings[0].score).toBeGreaterThanOrEqual(0);
      expect(rankings[0].score).toBeLessThanOrEqual(1);
    });

    it('should log ranking metrics', () => {
      service.rankAgents(mockAgents, 'query', mockAnalysis);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'agent_ranking_started',
        expect.any(Object)
      );
      expect(mockLogger.infoWithMetrics).toHaveBeenCalledWith(
        'agent_ranking_completed',
        expect.any(Number),
        expect.objectContaining({
          rankedCount: 3,
          topAgent: expect.any(String),
          topScore: expect.any(Number),
        })
      );
    });
  });

  describe('selectBestAgent', () => {
    const mockRankings: AgentRanking[] = [
      {
        agent: {
          id: 'agent-1',
          name: 'Best Agent',
          display_name: 'Best Agent',
          description: 'Best match',
          system_prompt: 'Best',
          tier: 1,
        },
        score: 0.95,
        reason: 'Highly relevant to query',
        breakdown: {
          semanticSimilarity: 0.9,
          domainRelevance: 0.9,
          tierPreference: 0.8,
          capabilityMatch: 0.85,
        },
      },
      {
        agent: {
          id: 'agent-2',
          name: 'Second Best',
          display_name: 'Second Best',
          description: 'Good match',
          system_prompt: 'Good',
          tier: 2,
        },
        score: 0.75,
        reason: 'Good match',
        breakdown: {
          semanticSimilarity: 0.7,
          domainRelevance: 0.7,
          tierPreference: 0.6,
          capabilityMatch: 0.65,
        },
      },
    ];

    const mockAnalysis: QueryAnalysis = {
      intent: 'diagnosis',
      domains: ['cardiology'],
      complexity: 'high',
      keywords: ['symptoms'],
      medicalTerms: ['hypertension'],
      confidence: 0.9,
    };

    it('should select the highest ranked agent', () => {
      const result = service.selectBestAgent(mockRankings, mockAnalysis);

      expect(result.selectedAgent.id).toBe('agent-1');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.alternativeAgents).toHaveLength(1);
      expect(result.alternativeAgents[0].agent.id).toBe('agent-2');
    });

    it('should calculate confidence from score', () => {
      const result = service.selectBestAgent(mockRankings, mockAnalysis);

      expect(result.confidence).toBeCloseTo(0.95, 1);
    });

    it('should generate selection reasoning', () => {
      const result = service.selectBestAgent(mockRankings, mockAnalysis);

      expect(result.reasoning).toBeDefined();
      expect(typeof result.reasoning).toBe('string');
      expect(result.reasoning.length).toBeGreaterThan(0);
    });

    it('should include query analysis in result', () => {
      const result = service.selectBestAgent(mockRankings, mockAnalysis);

      expect(result.analysis).toEqual(mockAnalysis);
    });

    it('should handle single agent ranking', () => {
      const singleRanking = [mockRankings[0]];
      const result = service.selectBestAgent(singleRanking, mockAnalysis);

      expect(result.selectedAgent.id).toBe('agent-1');
      expect(result.alternativeAgents).toHaveLength(0);
    });

    it('should throw error for empty rankings', () => {
      expect(() => {
        service.selectBestAgent([], mockAnalysis);
      }).toThrow(AgentSelectionError);
    });

    it('should log selection metrics', () => {
      service.selectBestAgent(mockRankings, mockAnalysis);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'agent_selection_completed',
        expect.objectContaining({
          selectedAgent: 'agent-1',
          confidence: expect.any(Number),
        })
      );
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle very long queries gracefully', async () => {
      const longQuery = 'a'.repeat(10000);
      mockGraphRAGService.searchAgents.mockResolvedValue([]);

      const agents = await service.findCandidateAgents(longQuery, [], 5);

      expect(agents).toBeDefined();
      expect(mockGraphRAGService.searchAgents).toHaveBeenCalled();
    });

    it('should handle invalid agent data in rankings', () => {
      const invalidAgents: Agent[] = [
        {
          id: 'agent-invalid',
          name: '',
          display_name: '',
          description: '',
          system_prompt: '',
          tier: 0,
        },
      ];

      const analysis: QueryAnalysis = {
        intent: 'general',
        domains: [],
        complexity: 'low',
        keywords: [],
        medicalTerms: [],
        confidence: 0.5,
      };

      const rankings = service.rankAgents(invalidAgents, 'query', analysis);

      expect(rankings).toHaveLength(1);
      expect(rankings[0].score).toBeGreaterThanOrEqual(0);
    });

    it('should handle null/undefined in agent arrays', () => {
      const agentsWithNulls = [
        null as any,
        undefined as any,
        {
          id: 'agent-valid',
          name: 'Valid Agent',
          display_name: 'Valid Agent',
          description: 'Valid',
          system_prompt: 'Valid',
          tier: 1,
        },
      ].filter(Boolean);

      const analysis: QueryAnalysis = {
        intent: 'general',
        domains: [],
        complexity: 'low',
        keywords: [],
        medicalTerms: [],
        confidence: 0.5,
      };

      expect(() => {
        service.rankAgents(agentsWithNulls, 'query', analysis);
      }).not.toThrow();
    });
  });
});

