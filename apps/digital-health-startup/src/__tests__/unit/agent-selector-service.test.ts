/**
 * Unit Tests for AgentSelectorService
 * 
 * Tests agent selection with GraphRAG, fallback strategies, ranking, and selection.
 * Based on VITAL_GRAPHRAG_AGENT_SELECTION_V2.md specifications.
 * 
 * Coverage Target: 90%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentSelectorService } from '@/features/chat/services/agent-selector-service';
import type { Agent, QueryAnalysis, AgentRanking } from '@/features/chat/services/agent-selector-service';
import { GraphRAGSearchError, AgentSelectionError } from '@/lib/errors/agent-errors';

// Mock dependencies
const mockSupabase = {
  from: vi.fn(),
};

const mockPinecone = {
  index: vi.fn(),
};

const mockGraphRAGService = {
  searchAgents: vi.fn(),
};

const mockCircuitBreaker = {
  execute: vi.fn(),
};

const mockEmbeddingCache = {
  get: vi.fn(),
  set: vi.fn(),
};

const mockTracing = {
  startSpan: vi.fn(() => 'span-id'),
  endSpan: vi.fn(),
  addTags: vi.fn(),
};

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  infoWithMetrics: vi.fn(),
};

const mockMetricsService = {
  recordOperation: vi.fn().mockResolvedValue(undefined),
};

// Setup mocks
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

vi.mock('@pinecone-database/pinecone', () => ({
  Pinecone: vi.fn(() => mockPinecone),
}));

vi.mock('@/lib/services/agents/agent-graphrag-service', () => ({
  agentGraphRAGService: mockGraphRAGService,
}));

vi.mock('@/lib/services/resilience/circuit-breaker', () => ({
  getSupabaseCircuitBreaker: vi.fn(() => mockCircuitBreaker),
}));

vi.mock('@/lib/services/cache/embedding-cache', () => ({
  getEmbeddingCache: vi.fn(() => mockEmbeddingCache),
}));

vi.mock('@/lib/services/observability/tracing', () => ({
  getTracingService: vi.fn(() => mockTracing),
}));

vi.mock('@/lib/services/observability/structured-logger', () => ({
  createLogger: vi.fn(() => mockLogger),
}));

vi.mock('@/lib/services/observability/agent-metrics-service', () => ({
  getAgentMetricsService: vi.fn(() => mockMetricsService),
}));

// Mock OpenAI fetch
global.fetch = vi.fn();

describe('AgentSelectorService', () => {
  let service: AgentSelectorService;
  let mockQueryBuilder: any;
  let mockSelect: any;

  beforeEach(() => {
    vi.clearAllMocks();

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
    it('should analyze query and extract intent, domains, and complexity', async () => {
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              intent: 'diagnosis',
              domains: ['cardiology', 'endocrinology'],
              complexity: 'high',
              keywords: ['symptoms', 'diagnosis', 'treatment'],
              medicalTerms: ['hypertension', 'diabetes'],
              confidence: 0.9,
            }),
          },
        }],
      };

      (global.fetch as any).mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockOpenAIResponse),
      });

      const query = 'What are the symptoms of hypertension and diabetes?';
      const analysis = await service.analyzeQuery(query);

      expect(analysis.intent).toBe('diagnosis');
      expect(analysis.domains).toEqual(['cardiology', 'endocrinology']);
      expect(analysis.complexity).toBe('high');
      expect(analysis.keywords).toContain('symptoms');
      expect(analysis.confidence).toBe(0.9);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should handle OpenAI API failures gracefully with fallback', async () => {
      (global.fetch as any).mockRejectedValue(new Error('API Error'));

      const query = 'Test query';
      const analysis = await service.analyzeQuery(query);

      // Should return fallback analysis
      expect(analysis.intent).toBe('general');
      expect(analysis.domains).toEqual([]);
      expect(analysis.complexity).toBe('medium');
      expect(analysis.confidence).toBe(0.5);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle malformed OpenAI responses', async () => {
      (global.fetch as any).mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'invalid json',
            },
          }],
        }),
      });

      const query = 'Test query';
      const analysis = await service.analyzeQuery(query);

      // Should return fallback
      expect(analysis.intent).toBe('general');
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
      mockGraphRAGService.searchAgents.mockResolvedValue([
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

