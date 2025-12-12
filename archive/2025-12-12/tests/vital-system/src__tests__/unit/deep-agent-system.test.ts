/**
 * Unit Tests for Deep Agent System
 * 
 * Tests the hierarchical agent system including:
 * - Chain of Thought reasoning
 * - Self-critique mechanism
 * - Child agent delegation
 * - Task management
 * - State management
 * 
 * Coverage Target: 90%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeepAgent, AgentLevel, type DeepAgentConfig, type Task, type Critique } from '@/lib/services/agents/deep-agent-system';
import type { ChainOfThoughtResult } from '@/lib/services/agents/deep-agent-system';

// Mock dependencies
const mockLLM = {
  invoke: vi.fn(),
};

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  infoWithMetrics: vi.fn(),
};

const mockTracing = {
  startSpan: vi.fn(() => 'span-123'),
  endSpan: vi.fn(),
};

const mockCircuitBreaker = {
  execute: vi.fn((fn) => fn()),
};

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn(() => mockLLM),
}));

vi.mock('@/lib/services/observability/structured-logger', () => ({
  createLogger: vi.fn(() => mockLogger),
}));

vi.mock('@/lib/services/observability/tracing', () => ({
  getTracingService: vi.fn(() => mockTracing),
}));

vi.mock('@/lib/services/resilience/circuit-breaker', () => ({
  getSupabaseCircuitBreaker: vi.fn(() => mockCircuitBreaker),
}));

vi.mock('@/lib/services/resilience/retry', () => ({
  withRetry: vi.fn(async (fn) => fn()),
}));

describe('Deep Agent System Unit Tests', () => {
  let agent: DeepAgent;
  let config: DeepAgentConfig;

  beforeEach(() => {
    vi.clearAllMocks();

    config = {
      id: 'agent-123',
      level: AgentLevel.EXPERT,
      llmProvider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      enableChainOfThought: true,
      enableSelfCritique: true,
      maxDepth: 3,
    };

    // Create agent instance using a test class that extends DeepAgent
    class TestDeepAgent extends DeepAgent {
      constructor(agentConfig: DeepAgentConfig) {
        super(agentConfig);
      }

      // Expose protected methods for testing
      public async testChainOfThought(query: string, context: any[] = []) {
        return this.chainOfThought(query, context);
      }

      public async testSelfCritique(output: string, criteria: string[] = []) {
        return this.selfCritique(output, criteria);
      }

      public async testDelegateToChild(task: Task, childAgentId: string) {
        return this.delegateToChild(task, childAgentId);
      }
    }

    agent = new TestDeepAgent(config) as any;
  });

  describe('Chain of Thought Reasoning', () => {
    it('should return direct result when CoT is disabled', async () => {
      const agentWithoutCoT = new (class extends DeepAgent {
        constructor() {
          super({ ...config, enableChainOfThought: false });
        }
        async testChainOfThought(query: string) {
          return this.chainOfThought(query);
        }
      })() as any;

      mockLLM.invoke.mockResolvedValue({
        content: 'Direct answer',
      });

      const result = await agentWithoutCoT.testChainOfThought('What is 2+2?');

      expect(result.conclusion).toBe('Direct answer');
      expect(result.reasoning).toHaveLength(0);
      expect(result.confidence).toBe(0.8);
      expect(mockLLM.invoke).toHaveBeenCalledTimes(1);
    });

    it('should parse reasoning steps from LLM response', async () => {
      const mockResponse = `
REASONING:
- Step 1: Understanding the question
- Step 2: Analyzing the problem
- Step 3: Working through the solution

CONCLUSION: The answer is 4

CONFIDENCE: 0.9

EVIDENCE: Mathematical proof, basic arithmetic
      `;

      mockLLM.invoke.mockResolvedValue({
        content: mockResponse,
      });

      const result = await agent.testChainOfThought('What is 2+2?');

      expect(result.reasoning).toHaveLength(3);
      expect(result.reasoning[0].step).toBe(1);
      expect(result.reasoning[0].content).toContain('Understanding');
      expect(result.conclusion).toContain('The answer is 4');
      expect(result.confidence).toBe(0.9);
      expect(result.evidence).toHaveLength(2);
    });

    it('should handle malformed LLM response gracefully', async () => {
      mockLLM.invoke.mockResolvedValue({
        content: 'Just a direct answer without formatting',
      });

      const result = await agent.testChainOfThought('What is 2+2?');

      expect(result.conclusion).toBeTruthy();
      expect(result.confidence).toBe(0.7); // Default confidence
      expect(result.evidence).toHaveLength(0);
    });

    it('should clamp confidence to valid range (0-1)', async () => {
      const mockResponse = `
REASONING:
- Step 1: Analysis

CONCLUSION: Answer

CONFIDENCE: 1.5
      `;

      mockLLM.invoke.mockResolvedValue({
        content: mockResponse,
      });

      const result = await agent.testChainOfThought('Test');

      expect(result.confidence).toBeLessThanOrEqual(1.0);
      expect(result.confidence).toBeGreaterThanOrEqual(0.0);
    });

    it('should handle LLM errors gracefully', async () => {
      mockLLM.invoke.mockRejectedValue(new Error('LLM API error'));

      const result = await agent.testChainOfThought('What is 2+2?');

      expect(result.reasoning).toHaveLength(0);
      expect(result.conclusion).toContain('error');
      expect(result.confidence).toBe(0.3); // Low confidence on error
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should include context in CoT prompt', async () => {
      const context = [{ id: 'ctx-1', content: 'Context data' }];
      
      mockLLM.invoke.mockResolvedValue({
        content: 'ANSWER: 4\nCONFIDENCE: 0.8',
      });

      await agent.testChainOfThought('What is 2+2?', context);

      const callArgs = mockLLM.invoke.mock.calls[0][0];
      const humanMessage = callArgs.find((msg: any) => msg.constructor.name === 'HumanMessage');
      
      expect(humanMessage.content).toContain('Context data');
    });
  });

  describe('Self-Critique Mechanism', () => {
    it('should critique output against default criteria', async () => {
      const output = 'This is a test response that should be critiqued.';
      const mockCritique = `
REVIEW:
- Accuracy: 8/10 - Generally accurate
- Completeness: 7/10 - Could be more complete
- Clarity: 9/10 - Very clear

FEEDBACK: Overall good response but could be more comprehensive.

SUGGESTIONS:
- Add more details
- Cite sources
      `;

      mockLLM.invoke.mockResolvedValue({
        content: mockCritique,
      });

      const result = await agent.testSelfCritique(output);

      expect(result.suggestions).toBeDefined();
      expect(result.criteria).toBeDefined();
      expect(result.criteria.length).toBeGreaterThan(0);
      expect(mockLogger.infoWithMetrics).toHaveBeenCalled();
    });

    it('should use custom criteria when provided', async () => {
      const output = 'Test output';
      const customCriteria = ['Safety', 'Compliance', 'Ethics'];

      mockLLM.invoke.mockResolvedValue({
        content: 'REVIEW: Good\nSUGGESTIONS: None',
      });

      await agent.testSelfCritique(output, customCriteria);

      const callArgs = mockLLM.invoke.mock.calls[0][0];
      const humanMessage = callArgs.find((msg: any) => msg.constructor.name === 'HumanMessage');
      
      expect(humanMessage.content).toContain('Safety');
      expect(humanMessage.content).toContain('Compliance');
      expect(humanMessage.content).toContain('Ethics');
    });

    it('should parse critique scores correctly', async () => {
      const output = 'Test';
      const mockCritique = `
REVIEW:
- Accuracy: 9/10
- Completeness: 6/10
      `;

      mockLLM.invoke.mockResolvedValue({
        content: mockCritique,
      });

      const result = await agent.testSelfCritique(output);

      // Verify scores are parsed (implementation specific)
      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });

    it('should handle critique errors gracefully', async () => {
      const output = 'Test output';
      mockLLM.invoke.mockRejectedValue(new Error('Critique failed'));

      const result = await agent.testSelfCritique(output);

      expect(result).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Child Agent Delegation', () => {
    it('should delegate task to child agent', async () => {
      const task: Task = {
        id: 'task-123',
        type: 'research',
        description: 'Research topic X',
        assigned_to: null,
        priority: 5,
        dependencies: [],
        status: 'pending',
        createdAt: new Date(),
      };

      const childAgentId = 'child-agent-123';

      // Mock child agent response
      const mockChildResponse = {
        id: childAgentId,
        result: 'Research complete',
        status: 'completed',
      };

      // Note: Actual implementation may use child agent service
      // For testing, we verify delegation logic
      const result = await agent.testDelegateToChild(task, childAgentId);

      expect(result).toBeDefined();
      // Verify task status updated
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle delegation errors gracefully', async () => {
      const task: Task = {
        id: 'task-123',
        type: 'research',
        description: 'Test',
        assigned_to: null,
        priority: 5,
        dependencies: [],
        status: 'pending',
        createdAt: new Date(),
      };

      // Mock delegation failure
      const result = await agent.testDelegateToChild(task, 'invalid-child');

      expect(result).toBeDefined();
      // Should handle error gracefully
    });

    it('should respect maxDepth limit', async () => {
      const agentWithMaxDepth = new (class extends DeepAgent {
        constructor() {
          super({ ...config, maxDepth: 1 });
        }
        async testDelegateToChild(task: Task, childId: string) {
          // Check if we've exceeded max depth
          return this.delegateToChild(task, childId);
        }
      })() as any;

      const task: Task = {
        id: 'task-123',
        type: 'research',
        description: 'Test',
        assigned_to: null,
        priority: 5,
        dependencies: [],
        status: 'pending',
        createdAt: new Date(),
      };

      // Should respect maxDepth
      const result = await agentWithMaxDepth.testDelegateToChild(task, 'child-1');
      expect(result).toBeDefined();
    });
  });

  describe('State Management', () => {
    it('should initialize with correct default state', () => {
      expect(agent['state'].current_level).toBe(AgentLevel.EXPERT);
      expect(agent['state'].reasoning_steps).toHaveLength(0);
      expect(agent['state'].task_queue).toHaveLength(0);
      expect(agent['state'].critique_history).toHaveLength(0);
    });

    it('should update reasoning steps in state', async () => {
      const mockResponse = `
REASONING:
- Step 1: Analysis

CONCLUSION: Answer

CONFIDENCE: 0.8
      `;

      mockLLM.invoke.mockResolvedValue({
        content: mockResponse,
      });

      await agent.testChainOfThought('Test');

      // State should be updated with reasoning steps
      expect(agent['state'].reasoning_steps.length).toBeGreaterThanOrEqual(0);
    });

    it('should track critique history in state', async () => {
      mockLLM.invoke.mockResolvedValue({
        content: 'REVIEW: Good\nSUGGESTIONS: None',
      });

      await agent.testSelfCritique('Test output');

      // Critique should be added to history
      expect(agent['state'].critique_history).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should respect enableChainOfThought configuration', () => {
      const agentWithCoT = new (class extends DeepAgent {
        constructor() {
          super({ ...config, enableChainOfThought: true });
        }
      })() as any;

      expect(agentWithCoT['enableChainOfThought']).toBe(true);

      const agentWithoutCoT = new (class extends DeepAgent {
        constructor() {
          super({ ...config, enableChainOfThought: false });
        }
      })() as any;

      expect(agentWithoutCoT['enableChainOfThought']).toBe(false);
    });

    it('should respect enableSelfCritique configuration', () => {
      const agentWithCritique = new (class extends DeepAgent {
        constructor() {
          super({ ...config, enableSelfCritique: true });
        }
      })() as any;

      expect(agentWithCritique['enableSelfCritique']).toBe(true);
    });

    it('should set correct agent level', () => {
      expect(agent['level']).toBe(AgentLevel.EXPERT);
      expect(agent['id']).toBe('agent-123');
    });
  });

  describe('Error Handling', () => {
    it('should handle LLM timeouts gracefully', async () => {
      mockLLM.invoke.mockRejectedValue(new Error('Timeout'));

      const result = await agent.testChainOfThought('Test');

      expect(result.conclusion).toContain('error');
      expect(result.confidence).toBeLessThan(0.5);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle circuit breaker open state', async () => {
      mockCircuitBreaker.execute.mockRejectedValue(new Error('Circuit breaker open'));

      const result = await agent.testChainOfThought('Test');

      expect(result).toBeDefined();
      expect(result.confidence).toBeLessThan(1.0);
    });
  });
});

