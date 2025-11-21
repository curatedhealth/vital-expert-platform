/**
 * Ask Panel API Integration Tests
 * 
 * Tests for /api/ask-panel/consult endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/ask-panel/consult/route';
import { NextRequest } from 'next/server';

// Mock Multi-Framework Orchestrator
vi.mock('@/lib/orchestration/multi-framework-orchestrator', () => ({
  multiFrameworkOrchestrator: {
    execute: vi.fn(),
    recommendFramework: vi.fn(() => 'autogen')
  },
  Framework: {
    LangGraph: 'langgraph',
    AutoGen: 'autogen',
    CrewAI: 'crewai'
  },
  ExecutionMode: {
    Sequential: 'sequential',
    Conversational: 'conversational',
    Hierarchical: 'hierarchical'
  }
}));

describe('Ask Panel API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/ask-panel/consult', () => {
    it('should accept valid panel consultation request', async () => {
      const mockExecute = vi.mocked(
        (await import('@/lib/orchestration/multi-framework-orchestrator')).multiFrameworkOrchestrator.execute
      );
      
      mockExecute.mockResolvedValueOnce({
        success: true,
        framework: 'autogen',
        outputs: {
          messages: [
            {
              role: 'assistant',
              content: 'Clinical trial recommendation',
              name: 'Clinical Trial Designer',
              agent_id: 'agent1'
            }
          ],
          state: {
            completed: true,
            consensusReached: true,
            recommendation: 'Final recommendation'
          }
        },
        metadata: {
          duration: 5000,
          tokensUsed: 500,
          agentsInvolved: ['agent1'],
          executionPath: ['Clinical Trial Designer']
        }
      });

      const request = new NextRequest('http://localhost:3000/api/ask-panel/consult', {
        method: 'POST',
        body: JSON.stringify({
          question: 'Help me design a clinical trial',
          configuration: {
            selectedAgents: [
              {
                id: 'agent1',
                title: 'Clinical Trial Designer',
                description: 'Expert in trial design',
                category: 'clinical',
                expertise: ['trial-design'],
                rating: 4.8,
                total_consultations: 150
              }
            ],
            mode: 'collaborative',
            framework: 'autogen',
            executionMode: 'conversational',
            userGuidance: 'medium',
            allowDebate: true,
            maxRounds: 10,
            requireConsensus: true
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.experts).toBeDefined();
      expect(Array.isArray(data.experts)).toBe(true);
      expect(data.metadata).toBeDefined();
    });

    it('should reject request without question', async () => {
      const request = new NextRequest('http://localhost:3000/api/ask-panel/consult', {
        method: 'POST',
        body: JSON.stringify({
          configuration: {
            selectedAgents: [],
            mode: 'collaborative'
          }
        })
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });

    it('should reject request without agents', async () => {
      const request = new NextRequest('http://localhost:3000/api/ask-panel/consult', {
        method: 'POST',
        body: JSON.stringify({
          question: 'Test question',
          configuration: {
            selectedAgents: [],
            mode: 'collaborative'
          }
        })
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });

    it('should handle orchestrator errors gracefully', async () => {
      const mockExecute = vi.mocked(
        (await import('@/lib/orchestration/multi-framework-orchestrator')).multiFrameworkOrchestrator.execute
      );
      
      mockExecute.mockResolvedValueOnce({
        success: false,
        framework: 'autogen',
        outputs: {},
        metadata: {
          duration: 1000,
          tokensUsed: 0,
          agentsInvolved: [],
          executionPath: []
        },
        error: 'OpenAI API error'
      });

      const request = new NextRequest('http://localhost:3000/api/ask-panel/consult', {
        method: 'POST',
        body: JSON.stringify({
          question: 'Test question',
          configuration: {
            selectedAgents: [
              {
                id: '1',
                title: 'Test Agent',
                description: 'Test',
                category: 'clinical',
                expertise: [],
                rating: 4.5,
                total_consultations: 100
              }
            ],
            mode: 'collaborative',
            framework: 'autogen',
            executionMode: 'conversational',
            userGuidance: 'medium',
            allowDebate: true,
            maxRounds: 10,
            requireConsensus: false
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should auto-select framework when set to auto', async () => {
      const mockRecommend = vi.mocked(
        (await import('@/lib/orchestration/multi-framework-orchestrator')).multiFrameworkOrchestrator.recommendFramework
      );
      const mockExecute = vi.mocked(
        (await import('@/lib/orchestration/multi-framework-orchestrator')).multiFrameworkOrchestrator.execute
      );

      mockRecommend.mockReturnValueOnce('autogen');
      mockExecute.mockResolvedValueOnce({
        success: true,
        framework: 'autogen',
        outputs: { messages: [] },
        metadata: {
          duration: 1000,
          tokensUsed: 100,
          agentsInvolved: [],
          executionPath: []
        }
      });

      const request = new NextRequest('http://localhost:3000/api/ask-panel/consult', {
        method: 'POST',
        body: JSON.stringify({
          question: 'Test',
          configuration: {
            selectedAgents: [
              {
                id: '1',
                title: 'Test',
                description: 'Test',
                category: 'clinical',
                expertise: [],
                rating: 4.5,
                total_consultations: 100
              }
            ],
            mode: 'collaborative',
            framework: 'auto',
            executionMode: 'conversational',
            userGuidance: 'medium',
            allowDebate: true,
            maxRounds: 10,
            requireConsensus: false
          }
        })
      });

      await POST(request);

      expect(mockRecommend).toHaveBeenCalled();
    });

    it('should include consensus data when required', async () => {
      const mockExecute = vi.mocked(
        (await import('@/lib/orchestration/multi-framework-orchestrator')).multiFrameworkOrchestrator.execute
      );
      
      mockExecute.mockResolvedValueOnce({
        success: true,
        framework: 'autogen',
        outputs: {
          messages: [],
          state: {
            consensusReached: true,
            recommendation: 'Unified recommendation',
            dissenting: ['Agent 1 disagrees on timeline']
          }
        },
        metadata: {
          duration: 5000,
          tokensUsed: 500,
          agentsInvolved: [],
          executionPath: []
        }
      });

      const request = new NextRequest('http://localhost:3000/api/ask-panel/consult', {
        method: 'POST',
        body: JSON.stringify({
          question: 'Test',
          configuration: {
            selectedAgents: [
              {
                id: '1',
                title: 'Test',
                description: 'Test',
                category: 'clinical',
                expertise: [],
                rating: 4.5,
                total_consultations: 100
              }
            ],
            mode: 'collaborative',
            framework: 'autogen',
            executionMode: 'conversational',
            userGuidance: 'medium',
            allowDebate: true,
            maxRounds: 10,
            requireConsensus: true
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.consensus).toBeDefined();
      expect(data.consensus.reached).toBe(true);
      expect(data.consensus.finalRecommendation).toBeDefined();
    });
  });
});

