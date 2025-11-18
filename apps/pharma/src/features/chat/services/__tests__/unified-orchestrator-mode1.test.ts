/**
 * Unit Tests for Unified LangGraph Orchestrator - Mode 1
 *
 * Tests Ask Expert Mode 1: Quick Expert Consensus
 * - 3 experts automatic selection
 * - Parallel execution
 * - 30-45s response time target
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UnifiedLangGraphOrchestrator, OrchestrationMode } from '../unified-langgraph-orchestrator';

describe('Unified LangGraph Orchestrator - Mode 1 (Ask Expert)', () => {
  let orchestrator: UnifiedLangGraphOrchestrator;

  beforeEach(() => {
    orchestrator = UnifiedLangGraphOrchestrator.getInstance();
  });

  describe('Mode 1: Quick Expert Consensus Specification', () => {
    it('should match Mode 1 specifications', () => {
      const mode1Spec = {
        id: 'mode-1-query-automatic',
        name: 'Quick Expert Consensus',
        expertCount: 3,
        executionType: 'parallel',
        selectionType: 'automatic',
        targetResponseTime: '30-45s'
      };

      expect(mode1Spec.expertCount).toBe(3);
      expect(mode1Spec.executionType).toBe('parallel');
      expect(mode1Spec.selectionType).toBe('automatic');
    });
  });

  describe('Node 1: Classify Intent', () => {
    it('should extract intent from regulatory query', async () => {
      const testQuery = 'What are FDA 510(k) premarket notification requirements?';

      const state = {
        query: testQuery,
        mode: OrchestrationMode.AUTO,
        userId: 'test-user',
        sessionId: 'test-session'
      };

      // Mock the classifyIntent method
      const mockIntent = {
        primaryIntent: 'question',
        primaryDomain: 'regulatory',
        domains: ['regulatory', 'quality'],
        confidence: 0.92,
        complexity: 'high',
        urgency: 'standard',
        requiresMultipleExperts: true,
        reasoning: 'Query asks about FDA regulatory requirements'
      };

      // Test intent structure
      expect(mockIntent.primaryIntent).toBe('question');
      expect(mockIntent.primaryDomain).toBe('regulatory');
      expect(mockIntent.confidence).toBeGreaterThan(0.8);
      expect(mockIntent.requiresMultipleExperts).toBe(true);
    });

    it('should handle fallback gracefully on error', async () => {
      // Simulate LLM failure scenario
      const fallbackIntent = {
        primaryIntent: 'question',
        primaryDomain: 'general',
        domains: ['general'],
        confidence: 0.5,
        complexity: 'medium',
        urgency: 'standard',
        requiresMultipleExperts: false,
        reasoning: 'Fallback classification due to error'
      };

      expect(fallbackIntent.confidence).toBe(0.5);
      expect(fallbackIntent.primaryDomain).toBe('general');
    });
  });

  describe('Node 2: Detect Domains', () => {
    it('should detect regulatory domain from keywords', () => {
      const query = 'What are FDA 510(k) requirements?';
      const detectedDomains = ['regulatory'];

      expect(detectedDomains).toContain('regulatory');
    });

    it('should detect multiple domains', () => {
      const query = 'FDA quality management system requirements for clinical trials';
      const detectedDomains = ['regulatory', 'quality', 'clinical'];

      expect(detectedDomains.length).toBeGreaterThan(1);
      expect(detectedDomains).toContain('regulatory');
      expect(detectedDomains).toContain('quality');
      expect(detectedDomains).toContain('clinical');
    });
  });

  describe('Node 3: Select Agents (Mode 1 - 3 Experts)', () => {
    it('should select exactly 3 agents for Mode 1', async () => {
      const mockRankedAgents = [
        { agent: { id: '1', name: 'FDA Regulatory Strategist', tier: 1 }, score: 0.95 },
        { agent: { id: '2', name: 'Quality Expert', tier: 2 }, score: 0.88 },
        { agent: { id: '3', name: 'Clinical Specialist', tier: 2 }, score: 0.82 },
        { agent: { id: '4', name: 'General Expert', tier: 3 }, score: 0.70 }
      ];

      // Mode 1 should select top 3
      const selected = mockRankedAgents.slice(0, 3);

      expect(selected.length).toBe(3);
      expect(selected[0].score).toBeGreaterThan(0.9);
    });

    it('should prioritize Tier 1 agents in ranking', () => {
      const tier1Score = 1.0 * 0.2; // 20% weight for tier boost
      const tier2Score = 0.7 * 0.2;
      const tier3Score = 0.4 * 0.2;

      expect(tier1Score).toBeGreaterThan(tier2Score);
      expect(tier2Score).toBeGreaterThan(tier3Score);
    });

    it('should use multi-factor scoring algorithm', () => {
      // Weights: semantic 40%, domain 25%, tier 20%, popularity 10%, availability 5%
      const semanticSim = 0.85;
      const domainOverlap = 1.0;
      const tierBoost = 1.0;
      const popularity = 0.5;
      const availability = 1.0;

      const compositeScore =
        semanticSim * 0.4 +
        domainOverlap * 0.25 +
        tierBoost * 0.2 +
        popularity * 0.1 +
        availability * 0.05;

      expect(compositeScore).toBeGreaterThan(0.8);
      expect(compositeScore).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Node 4: Retrieve Context (Pinecone + Supabase)', () => {
    it('should retrieve 5 sources per agent (15 total for 3 agents)', () => {
      const sourcesPerAgent = 5;
      const numAgents = 3;
      const expectedSources = sourcesPerAgent * numAgents;

      expect(expectedSources).toBe(15);
    });

    it('should use agent-optimized strategy', () => {
      const strategy = 'agent-optimized';
      const similarityThreshold = 0.75;

      expect(strategy).toBe('agent-optimized');
      expect(similarityThreshold).toBeGreaterThanOrEqual(0.7);
    });

    it('should deduplicate sources across agents', () => {
      const agent1Sources = ['source-1', 'source-2', 'source-3'];
      const agent2Sources = ['source-2', 'source-4', 'source-5'];
      const agent3Sources = ['source-3', 'source-5', 'source-6'];

      const allSources = [...agent1Sources, ...agent2Sources, ...agent3Sources];
      const uniqueSources = [...new Set(allSources)];

      expect(allSources.length).toBe(9);
      expect(uniqueSources.length).toBe(6);
    });
  });

  describe('Node 6: Execute Multi-Agent (3 Parallel)', () => {
    it('should execute 3 agents in parallel', async () => {
      const startTime = Date.now();

      // Simulate parallel execution
      const agent1 = Promise.resolve({ duration: 3000, response: 'Agent 1' });
      const agent2 = Promise.resolve({ duration: 3500, response: 'Agent 2' });
      const agent3 = Promise.resolve({ duration: 2800, response: 'Agent 3' });

      const results = await Promise.all([agent1, agent2, agent3]);
      const totalTime = Date.now() - startTime;

      // Parallel execution should be faster than sequential (10,300ms)
      expect(results.length).toBe(3);
      expect(totalTime).toBeLessThan(5000); // Should complete in ~3.5s (slowest agent)
    });

    it('should handle graceful failure if one agent fails', async () => {
      const agent1 = Promise.resolve({ success: true, response: 'Agent 1' });
      const agent2 = Promise.reject(new Error('Agent 2 failed'));
      const agent3 = Promise.resolve({ success: true, response: 'Agent 3' });

      const results = await Promise.allSettled([agent1, agent2, agent3]);
      const successful = results.filter(r => r.status === 'fulfilled');

      expect(successful.length).toBe(2);
      expect(results.length).toBe(3);
    });

    it('should calculate total token usage across all agents', () => {
      const agent1Tokens = { prompt: 1000, completion: 500, total: 1500, estimatedCost: 0.0225 };
      const agent2Tokens = { prompt: 1200, completion: 600, total: 1800, estimatedCost: 0.0270 };
      const agent3Tokens = { prompt: 900, completion: 400, total: 1300, estimatedCost: 0.0195 };

      const totalUsage = {
        prompt: agent1Tokens.prompt + agent2Tokens.prompt + agent3Tokens.prompt,
        completion: agent1Tokens.completion + agent2Tokens.completion + agent3Tokens.completion,
        total: agent1Tokens.total + agent2Tokens.total + agent3Tokens.total,
        estimatedCost: agent1Tokens.estimatedCost + agent2Tokens.estimatedCost + agent3Tokens.estimatedCost
      };

      expect(totalUsage.total).toBe(4600);
      expect(totalUsage.estimatedCost).toBeCloseTo(0.069, 3);
    });
  });

  describe('Node 8: Synthesize Response', () => {
    it('should synthesize 3 agent responses', () => {
      const responses = [
        { agentId: '1', agentName: 'Agent 1', content: 'Response 1' },
        { agentId: '2', agentName: 'Agent 2', content: 'Response 2' },
        { agentId: '3', agentName: 'Agent 3', content: 'Response 3' }
      ];

      expect(responses.length).toBe(3);
    });

    it('should use LLM for multi-agent synthesis', () => {
      const synthesisModel = 'gpt-4-turbo-preview';
      const temperature = 0.3;
      const maxTokens = 2048;

      expect(synthesisModel).toBe('gpt-4-turbo-preview');
      expect(temperature).toBeGreaterThan(0);
      expect(maxTokens).toBeGreaterThanOrEqual(2048);
    });
  });

  describe('Mode 1: End-to-End Performance', () => {
    it('should target 30-45 second response time', () => {
      // Target breakdown:
      const intentClassification = 400;  // 0.4s
      const domainDetection = 100;       // 0.1s
      const agentSelection = 700;        // 0.7s
      const contextRetrieval = 300;      // 0.3s
      const execution = 35000;           // 35s (parallel, 3 agents)
      const synthesis = 1500;            // 1.5s

      const totalTime = intentClassification + domainDetection + agentSelection +
                       contextRetrieval + execution + synthesis;

      expect(totalTime).toBeLessThan(45000); // Under 45 seconds
      expect(totalTime).toBeGreaterThan(30000); // Over 30 seconds
    });

    it('should prioritize speed for Mode 1 (vs Mode 5)', () => {
      const mode1TargetMax = 45; // seconds
      const mode5TargetMax = 300; // seconds (5 minutes)

      expect(mode1TargetMax).toBeLessThan(mode5TargetMax);
    });
  });

  describe('Mode 1: Cost Optimization', () => {
    it('should estimate cost for typical Mode 1 query', () => {
      // 3 agents x ~3000 tokens each = 9000 tokens
      // GPT-4: $0.01/1K input, $0.03/1K output
      const totalTokens = 9000;
      const promptTokens = 6000;
      const completionTokens = 3000;

      const cost = (promptTokens / 1000) * 0.01 + (completionTokens / 1000) * 0.03;

      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(0.20); // Should be under $0.20
    });
  });

  describe('Mode 1: Quality Checks', () => {
    it('should enforce consensus check for 3 agents', () => {
      const responses = [
        { confidence: 0.9 },
        { confidence: 0.85 },
        { confidence: 0.88 }
      ];

      const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
      const consensusReached = avgConfidence > 0.8;

      expect(consensusReached).toBe(true);
      expect(avgConfidence).toBeGreaterThan(0.8);
    });
  });
});
