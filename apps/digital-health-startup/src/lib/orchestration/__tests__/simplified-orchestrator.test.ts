/**
 * SimplifiedOrchestrator Unit Tests
 *
 * Tests for direct orchestration execution without job queue
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  SimplifiedOrchestrator,
  createSimplifiedOrchestrator,
  OrchestrationTimeoutError,
  type OrchestrationInput,
  type OrchestrationResult
} from '../simplified-orchestrator';

// Mock the LangGraph orchestrator
jest.mock('@/features/chat/services/unified-langgraph-orchestrator', () => ({
  createOrchestrator: jest.fn(() => ({
    invoke: jest.fn(async (input) => ({
      conversationId: 'test-conv-123',
      response: 'Test response for: ' + input.query,
      selectedAgents: [
        { id: 'agent-1', name: 'Test Agent', confidence: 0.95 }
      ],
      sources: [],
      metadata: {
        duration: 1000,
        mode: input.mode,
        tokensUsed: 500
      }
    })),
    stream: jest.fn(async function* (input) {
      yield {
        type: 'progress',
        stage: 'initializing',
        progress: 0,
        message: 'Starting...'
      };
      yield {
        type: 'progress',
        stage: 'execution',
        progress: 50,
        message: 'Processing...'
      };
      yield {
        type: 'result',
        conversationId: 'test-conv-123',
        response: 'Test response',
        selectedAgents: [],
        sources: [],
        metadata: {}
      };
    })
  }))
}));

describe('SimplifiedOrchestrator', () => {
  let orchestrator: SimplifiedOrchestrator;

  beforeEach(() => {
    orchestrator = new SimplifiedOrchestrator();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates orchestrator with default timeout', () => {
      const orch = new SimplifiedOrchestrator();
      expect(orch).toBeInstanceOf(SimplifiedOrchestrator);
    });

    it('creates orchestrator with custom timeout', () => {
      const orch = new SimplifiedOrchestrator(5000);
      expect(orch).toBeInstanceOf(SimplifiedOrchestrator);
    });
  });

  describe('validateInput', () => {
    it('validates correct input', () => {
      const input: OrchestrationInput = {
        query: 'What is diabetes?',
        mode: 'query_automatic'
      };

      expect(() => orchestrator.validateInput(input)).not.toThrow();
    });

    it('rejects missing query', () => {
      const input = {
        mode: 'query_automatic'
      } as OrchestrationInput;

      expect(() => orchestrator.validateInput(input)).toThrow('Query is required');
    });

    it('rejects empty query', () => {
      const input: OrchestrationInput = {
        query: '',
        mode: 'query_automatic'
      };

      expect(() => orchestrator.validateInput(input)).toThrow('Query cannot be empty');
    });

    it('rejects query exceeding max length', () => {
      const input: OrchestrationInput = {
        query: 'a'.repeat(10001),
        mode: 'query_automatic'
      };

      expect(() => orchestrator.validateInput(input)).toThrow('exceeds maximum length');
    });

    it('rejects invalid mode', () => {
      const input = {
        query: 'test',
        mode: 'invalid_mode'
      } as OrchestrationInput;

      expect(() => orchestrator.validateInput(input)).toThrow('Invalid mode');
    });

    it('accepts all valid modes', () => {
      const modes = ['query_automatic', 'query_manual', 'rag_query', 'multi_agent', 'autonomous'];

      modes.forEach(mode => {
        const input: OrchestrationInput = {
          query: 'test',
          mode: mode as OrchestrationInput['mode']
        };

        expect(() => orchestrator.validateInput(input)).not.toThrow();
      });
    });

    it('validates optional sessionId', () => {
      const input: OrchestrationInput = {
        query: 'test',
        mode: 'query_automatic',
        sessionId: '123-456-789'
      };

      expect(() => orchestrator.validateInput(input)).not.toThrow();
    });
  });

  describe('execute', () => {
    const validInput: OrchestrationInput = {
      query: 'What are the symptoms of diabetes?',
      mode: 'query_automatic'
    };
    const userId = 'user-123';
    const tenantId = 'tenant-456';

    it('executes orchestration successfully', async () => {
      const result = await orchestrator.execute(validInput, userId, tenantId);

      expect(result).toHaveProperty('conversationId');
      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('selectedAgents');
      expect(result.selectedAgents).toHaveLength(1);
      expect(result.metadata).toHaveProperty('duration');
      expect(result.metadata.mode).toBe('query_automatic');
    });

    it('includes query in response', async () => {
      const result = await orchestrator.execute(validInput, userId, tenantId);

      expect(result.response).toContain(validInput.query);
    });

    it('adds duration metadata', async () => {
      const result = await orchestrator.execute(validInput, userId, tenantId);

      expect(result.metadata.duration).toBeGreaterThan(0);
      expect(result.metadata.duration).toBeLessThan(10000); // Less than 10s
    });

    it('throws timeout error for long-running tasks', async () => {
      const slowOrchestrator = new SimplifiedOrchestrator(100); // 100ms timeout

      // Mock slow execution
      const { createOrchestrator } = require('@/features/chat/services/unified-langgraph-orchestrator');
      createOrchestrator.mockReturnValueOnce({
        invoke: jest.fn(() => new Promise(resolve => setTimeout(resolve, 200)))
      });

      await expect(
        slowOrchestrator.execute(validInput, userId, tenantId)
      ).rejects.toThrow(OrchestrationTimeoutError);
    });

    it('handles execution errors gracefully', async () => {
      // Mock error
      const { createOrchestrator } = require('@/features/chat/services/unified-langgraph-orchestrator');
      createOrchestrator.mockReturnValueOnce({
        invoke: jest.fn().mockRejectedValue(new Error('Test error'))
      });

      await expect(
        orchestrator.execute(validInput, userId, tenantId)
      ).rejects.toThrow('Orchestration failed');
    });

    it('passes context to orchestrator', async () => {
      const { createOrchestrator } = require('@/features/chat/services/unified-langgraph-orchestrator');
      const mockInvoke = jest.fn().mockResolvedValue({
        conversationId: 'test',
        response: 'test',
        selectedAgents: [],
        metadata: {}
      });

      createOrchestrator.mockReturnValueOnce({
        invoke: mockInvoke
      });

      const inputWithContext: OrchestrationInput = {
        ...validInput,
        context: { testKey: 'testValue' }
      };

      await orchestrator.execute(inputWithContext, userId, tenantId);

      expect(mockInvoke).toHaveBeenCalledWith(
        expect.objectContaining({
          query: validInput.query,
          mode: validInput.mode,
          userId,
          tenantId,
          context: { testKey: 'testValue' }
        })
      );
    });
  });

  describe('executeStream', () => {
    const validInput: OrchestrationInput = {
      query: 'What is diabetes?',
      mode: 'query_automatic'
    };
    const userId = 'user-123';
    const tenantId = 'tenant-456';

    it('streams progress updates', async () => {
      const updates: any[] = [];

      for await (const event of orchestrator.executeStream(validInput, userId, tenantId)) {
        updates.push(event);
      }

      expect(updates.length).toBeGreaterThan(0);

      // First event should be initializing
      expect(updates[0]).toMatchObject({
        stage: 'initializing',
        progress: 0
      });
    });

    it('yields final result', async () => {
      const updates: any[] = [];

      for await (const event of orchestrator.executeStream(validInput, userId, tenantId)) {
        updates.push(event);
      }

      const lastEvent = updates[updates.length - 1];
      expect(lastEvent).toHaveProperty('conversationId');
      expect(lastEvent).toHaveProperty('response');
    });

    it('throws timeout error during streaming', async () => {
      const slowOrchestrator = new SimplifiedOrchestrator(100);

      // Mock slow stream
      const { createOrchestrator } = require('@/features/chat/services/unified-langgraph-orchestrator');
      createOrchestrator.mockReturnValueOnce({
        stream: async function* () {
          await new Promise(resolve => setTimeout(resolve, 200));
          yield { type: 'progress', stage: 'test', progress: 0, message: 'test' };
        }
      });

      const generator = slowOrchestrator.executeStream(validInput, userId, tenantId);

      await expect(generator.next()).rejects.toThrow(OrchestrationTimeoutError);
    });

    it('handles streaming errors', async () => {
      // Mock error
      const { createOrchestrator } = require('@/features/chat/services/unified-langgraph-orchestrator');
      createOrchestrator.mockReturnValueOnce({
        stream: async function* () {
          throw new Error('Stream error');
        }
      });

      const generator = orchestrator.executeStream(validInput, userId, tenantId);

      await expect(generator.next()).rejects.toThrow('Orchestration streaming failed');
    });
  });

  describe('createSimplifiedOrchestrator', () => {
    it('creates orchestrator instance', () => {
      const orch = createSimplifiedOrchestrator();
      expect(orch).toBeInstanceOf(SimplifiedOrchestrator);
    });

    it('creates orchestrator with custom timeout', () => {
      const orch = createSimplifiedOrchestrator(5000);
      expect(orch).toBeInstanceOf(SimplifiedOrchestrator);
    });
  });

  describe('OrchestrationTimeoutError', () => {
    it('creates error with default message', () => {
      const error = new OrchestrationTimeoutError();
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('OrchestrationTimeoutError');
      expect(error.message).toContain('timeout');
    });

    it('creates error with custom message', () => {
      const customMessage = 'Custom timeout message';
      const error = new OrchestrationTimeoutError(customMessage);
      expect(error.message).toBe(customMessage);
    });
  });

  describe('performance', () => {
    it('completes simple query in reasonable time', async () => {
      const validInput: OrchestrationInput = {
        query: 'What is diabetes?',
        mode: 'query_automatic'
      };

      const startTime = Date.now();
      await orchestrator.execute(validInput, 'user-123', 'tenant-456');
      const duration = Date.now() - startTime;

      // Should complete quickly with mocked orchestrator
      expect(duration).toBeLessThan(1000); // Less than 1 second
    });
  });

  describe('edge cases', () => {
    it('handles very long query (within limit)', async () => {
      const input: OrchestrationInput = {
        query: 'a'.repeat(9999),
        mode: 'query_automatic'
      };

      const result = await orchestrator.execute(input, 'user-123', 'tenant-456');
      expect(result).toHaveProperty('conversationId');
    });

    it('handles all orchestration modes', async () => {
      const modes: OrchestrationInput['mode'][] = [
        'query_automatic',
        'query_manual',
        'rag_query',
        'multi_agent',
        'autonomous'
      ];

      for (const mode of modes) {
        const input: OrchestrationInput = {
          query: `Test query for ${mode}`,
          mode
        };

        const result = await orchestrator.execute(input, 'user-123', 'tenant-456');
        expect(result.metadata.mode).toBe(mode);
      }
    });

    it('handles missing optional fields', async () => {
      const minimalInput: OrchestrationInput = {
        query: 'Test',
        mode: 'query_automatic'
      };

      const result = await orchestrator.execute(minimalInput, 'user-123', 'tenant-456');
      expect(result).toHaveProperty('conversationId');
    });
  });
});
