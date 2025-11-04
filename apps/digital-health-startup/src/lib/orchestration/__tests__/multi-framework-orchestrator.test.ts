/**
 * Multi-Framework Orchestrator Unit Tests
 * 
 * Tests for framework selection and execution routing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  multiFrameworkOrchestrator,
  Framework,
  ExecutionMode 
} from '@/lib/orchestration/multi-framework-orchestrator';

// Mock fetch
global.fetch = vi.fn();

const mockSuccessResponse = {
  success: true,
  framework: Framework.LangGraph,
  outputs: {
    messages: [
      {
        role: 'assistant',
        content: 'Test response',
        name: 'Test Agent'
      }
    ],
    result: 'Test response',
    state: { completed: true }
  },
  metadata: {
    duration: 1000,
    tokensUsed: 100,
    agentsInvolved: ['test-agent'],
    executionPath: ['Test Agent']
  }
};

describe('Multi-Framework Orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockSuccessResponse
    });
  });

  describe('execute', () => {
    it('should execute LangGraph workflow', async () => {
      const request = {
        workflow: {
          framework: Framework.LangGraph,
          mode: ExecutionMode.Sequential,
          agents: [
            {
              id: 'test',
              role: 'Test Agent',
              systemPrompt: 'You are a test agent'
            }
          ]
        },
        input: {
          message: 'Test message'
        }
      };

      const result = await multiFrameworkOrchestrator.execute(request);
      
      expect(result.success).toBe(true);
      expect(result.framework).toBe(Framework.LangGraph);
      expect(fetch).toHaveBeenCalledWith(
        '/api/frameworks/langgraph/execute',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should execute AutoGen workflow', async () => {
      const request = {
        workflow: {
          framework: Framework.AutoGen,
          mode: ExecutionMode.Conversational,
          agents: [
            { id: '1', role: 'Agent 1', systemPrompt: 'Test' },
            { id: '2', role: 'Agent 2', systemPrompt: 'Test' }
          ]
        },
        input: {
          message: 'Test message'
        }
      };

      const result = await multiFrameworkOrchestrator.execute(request);
      
      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        '/api/frameworks/autogen/execute',
        expect.anything()
      );
    });

    it('should execute CrewAI workflow', async () => {
      const request = {
        workflow: {
          framework: Framework.CrewAI,
          mode: ExecutionMode.Hierarchical,
          agents: [
            { id: 'test', role: 'Test Agent', systemPrompt: 'Test', goal: 'Test goal' }
          ]
        },
        input: {
          message: 'Test message'
        }
      };

      const result = await multiFrameworkOrchestrator.execute(request);
      
      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        '/api/frameworks/crewai/execute',
        expect.anything()
      );
    });

    it('should handle execution errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        text: async () => 'Server error'
      });

      const request = {
        workflow: {
          framework: Framework.LangGraph,
          mode: ExecutionMode.Sequential,
          agents: [
            { id: 'test', role: 'Test', systemPrompt: 'Test' }
          ]
        },
        input: { message: 'Test' }
      };

      const result = await multiFrameworkOrchestrator.execute(request);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should track execution duration', async () => {
      const request = {
        workflow: {
          framework: Framework.LangGraph,
          mode: ExecutionMode.Sequential,
          agents: [{ id: 'test', role: 'Test', systemPrompt: 'Test' }]
        },
        input: { message: 'Test' }
      };

      const result = await multiFrameworkOrchestrator.execute(request);
      
      expect(result.metadata.duration).toBeDefined();
      expect(result.metadata.duration).toBeGreaterThan(0);
    });
  });

  describe('recommendFramework', () => {
    it('should recommend AutoGen for multi-agent conversations', () => {
      const framework = multiFrameworkOrchestrator.recommendFramework({
        agentCount: 4,
        needsConversation: true,
        needsState: false,
        needsDelegation: false,
        complexity: 'medium'
      });
      
      expect(framework).toBe(Framework.AutoGen);
    });

    it('should recommend CrewAI for complex delegation', () => {
      const framework = multiFrameworkOrchestrator.recommendFramework({
        agentCount: 5,
        needsConversation: false,
        needsState: false,
        needsDelegation: true,
        complexity: 'high'
      });
      
      expect(framework).toBe(Framework.CrewAI);
    });

    it('should recommend LangGraph for state management', () => {
      const framework = multiFrameworkOrchestrator.recommendFramework({
        agentCount: 2,
        needsConversation: false,
        needsState: true,
        needsDelegation: false,
        complexity: 'medium'
      });
      
      expect(framework).toBe(Framework.LangGraph);
    });

    it('should default to LangGraph for simple cases', () => {
      const framework = multiFrameworkOrchestrator.recommendFramework({
        agentCount: 1,
        needsConversation: false,
        needsState: false,
        needsDelegation: false,
        complexity: 'low'
      });
      
      expect(framework).toBe(Framework.LangGraph);
    });
  });

  describe('generateCode', () => {
    it('should generate code for framework', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: 'print("test")' })
      });

      const request = {
        workflow: {
          framework: Framework.LangGraph,
          mode: ExecutionMode.Sequential,
          agents: [{ id: 'test', role: 'Test', systemPrompt: 'Test' }]
        },
        input: { message: 'Test' }
      };

      const code = await multiFrameworkOrchestrator.generateCode(request);
      
      expect(code).toBeDefined();
      expect(typeof code).toBe('string');
    });
  });
});

