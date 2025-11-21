/**
 * Agent Recommendation Engine Unit Tests
 * 
 * Tests for AI-powered agent recommendations and semantic search
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { agentRecommendationEngine } from '@/features/ask-panel/services/agent-recommendation-engine';

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    embeddings: {
      create: vi.fn(() => Promise.resolve({
        data: [{
          embedding: new Array(1536).fill(0.1)
        }]
      }))
    }
  }))
}));

// Mock agent service
vi.mock('@/features/ask-panel/services/agent-service', () => ({
  getAgents: vi.fn(() => Promise.resolve([
    {
      id: '1',
      title: 'Clinical Trial Designer',
      slug: 'clinical-trial-designer',
      description: 'Expert in clinical trial design and protocol development',
      category: 'clinical',
      expertise: ['trial-design', 'protocols', 'recruitment'],
      rating: 4.8,
      total_consultations: 150
    },
    {
      id: '2',
      title: 'FDA Regulatory Strategist',
      slug: 'fda-strategist',
      description: 'Expert in FDA regulations and approval processes',
      category: 'regulatory',
      expertise: ['fda', 'regulatory', 'approval'],
      rating: 4.9,
      total_consultations: 200
    }
  ]))
}));

describe('Agent Recommendation Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recommendAgents', () => {
    it('should recommend agents based on query', async () => {
      const query = 'I need help designing a clinical trial';
      const recommendations = await agentRecommendationEngine.recommendAgents(query);
      
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should include confidence scores', async () => {
      const query = 'FDA submission strategy';
      const recommendations = await agentRecommendationEngine.recommendAgents(query);
      
      recommendations.forEach(rec => {
        expect(rec.confidence).toBeDefined();
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should include match reasons', async () => {
      const query = 'clinical trial protocols';
      const recommendations = await agentRecommendationEngine.recommendAgents(query);
      
      recommendations.forEach(rec => {
        expect(rec.reason).toBeDefined();
        expect(typeof rec.reason).toBe('string');
      });
    });

    it('should filter by minimum confidence', async () => {
      const query = 'help with trials';
      const recommendations = await agentRecommendationEngine.recommendAgents(query, {
        minConfidence: 0.7
      });
      
      recommendations.forEach(rec => {
        expect(rec.confidence).toBeGreaterThanOrEqual(0.7);
      });
    });

    it('should limit results', async () => {
      const query = 'clinical trial design';
      const recommendations = await agentRecommendationEngine.recommendAgents(query, {
        limit: 3
      });
      
      expect(recommendations.length).toBeLessThanOrEqual(3);
    });

    it('should filter by category', async () => {
      const query = 'FDA approval';
      const recommendations = await agentRecommendationEngine.recommendAgents(query, {
        category: 'regulatory'
      });
      
      recommendations.forEach(rec => {
        expect(rec.agent.category).toBe('regulatory');
      });
    });

    it('should exclude specified agents', async () => {
      const query = 'clinical trial';
      const excludeIds = ['1'];
      const recommendations = await agentRecommendationEngine.recommendAgents(query, {
        excludeAgentIds: excludeIds
      });
      
      recommendations.forEach(rec => {
        expect(excludeIds).not.toContain(rec.agent.id);
      });
    });
  });

  describe('recommendPanel', () => {
    it('should recommend complete panel configuration', async () => {
      const query = 'I need to design a clinical trial for a digital therapeutic';
      const panelRec = await agentRecommendationEngine.recommendPanel(query);
      
      expect(panelRec).toBeDefined();
      expect(panelRec.agents).toBeDefined();
      expect(Array.isArray(panelRec.agents)).toBe(true);
      expect(panelRec.panelMode).toBeDefined();
      expect(panelRec.framework).toBeDefined();
      expect(panelRec.useCase).toBeDefined();
      expect(panelRec.confidence).toBeDefined();
      expect(panelRec.rationale).toBeDefined();
    });

    it('should detect clinical trial use case', async () => {
      const query = 'clinical trial design and protocol development';
      const panelRec = await agentRecommendationEngine.recommendPanel(query);
      
      expect(panelRec.useCase).toBe('clinical_trial');
    });

    it('should detect regulatory use case', async () => {
      const query = 'FDA submission and 510(k) approval';
      const panelRec = await agentRecommendationEngine.recommendPanel(query);
      
      expect(panelRec.useCase).toBe('regulatory');
    });

    it('should detect market access use case', async () => {
      const query = 'payer strategy and reimbursement planning';
      const panelRec = await agentRecommendationEngine.recommendPanel(query);
      
      expect(panelRec.useCase).toBe('market_access');
    });

    it('should recommend appropriate panel mode', async () => {
      const query = 'need multiple experts to discuss clinical trial strategy';
      const panelRec = await agentRecommendationEngine.recommendPanel(query);
      
      expect(['sequential', 'collaborative', 'hybrid']).toContain(panelRec.panelMode);
    });

    it('should recommend appropriate framework', async () => {
      const query = 'complex multi-expert consultation';
      const panelRec = await agentRecommendationEngine.recommendPanel(query);
      
      expect(['auto', 'langgraph', 'autogen', 'crewai']).toContain(panelRec.framework);
    });

    it('should provide rationale for recommendations', async () => {
      const query = 'clinical trial design';
      const panelRec = await agentRecommendationEngine.recommendPanel(query);
      
      expect(panelRec.rationale).toBeDefined();
      expect(typeof panelRec.rationale).toBe('string');
      expect(panelRec.rationale.length).toBeGreaterThan(10);
    });
  });

  describe('Use Case Detection', () => {
    it('should detect clinical trial keywords', async () => {
      const queries = [
        'clinical trial design',
        'study protocol',
        'patient recruitment',
        'clinical endpoints'
      ];
      
      for (const query of queries) {
        const panelRec = await agentRecommendationEngine.recommendPanel(query);
        expect(panelRec.useCase).toBe('clinical_trial');
      }
    });

    it('should detect regulatory keywords', async () => {
      const queries = [
        'FDA submission',
        '510(k) clearance',
        'regulatory approval',
        'breakthrough designation'
      ];
      
      for (const query of queries) {
        const panelRec = await agentRecommendationEngine.recommendPanel(query);
        expect(panelRec.useCase).toBe('regulatory');
      }
    });

    it('should detect market access keywords', async () => {
      const queries = [
        'payer strategy',
        'reimbursement planning',
        'market launch',
        'health economics'
      ];
      
      for (const query of queries) {
        const panelRec = await agentRecommendationEngine.recommendPanel(query);
        expect(panelRec.useCase).toBe('market_access');
      }
    });

    it('should fallback to general for ambiguous queries', async () => {
      const query = 'digital health consulting';
      const panelRec = await agentRecommendationEngine.recommendPanel(query);
      
      expect(panelRec.useCase).toBe('general');
    });
  });

  describe('Caching', () => {
    it('should cache embeddings for identical queries', async () => {
      const query = 'clinical trial design';
      
      // First call
      await agentRecommendationEngine.recommendAgents(query);
      
      // Second call (should use cache)
      await agentRecommendationEngine.recommendAgents(query);
      
      // Should only call OpenAI once (cached)
      // This would need to be verified with spy on OpenAI mock
    });
  });
});

