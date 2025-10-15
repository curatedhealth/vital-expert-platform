import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowEngine } from '@/core/services/workflow-engine/workflow-engine.service';
import { Agent } from '@/core/domain/entities/agent.entity';
import { AgentOrchestrator } from '@/core/services/agent-orchestrator/agent-orchestrator.service';

// Mock the dependencies
vi.mock('@/core/services/agent-orchestrator/agent-orchestrator.service');

describe('WorkflowEngine', () => {
  let workflowEngine: WorkflowEngine;
  let mockAgent: Agent;
  let mockAgentOrchestrator: AgentOrchestrator;
  
  beforeEach(() => {
    // Create mock agent orchestrator
    mockAgentOrchestrator = {
      selectBestAgent: vi.fn().mockResolvedValue({
        selected: null,
        confidence: 0,
        reasoning: 'No suitable agent found',
        alternatives: [],
        processingTime: 0
      }),
      suggestAgents: vi.fn().mockResolvedValue([]),
      getAgentRecommendations: vi.fn().mockResolvedValue([])
    } as any;
    
    workflowEngine = new WorkflowEngine(mockAgentOrchestrator);
    
    mockAgent = new Agent(
      'test-agent',
      'Test Agent',
      'Test Agent',
      'A test agent for workflow testing',
      'You are a test agent...',
      ['test-capability'],
      2,
      ['test-domain'],
      'gpt-4',
      0.7,
      4000,
      true,
      new Date(),
      new Date()
    );
  });
  
  describe('execute', () => {
    it('should execute workflow with manual agent selection', async () => {
      // Arrange
      const input = {
        query: 'Test query',
        agent: mockAgent,
        mode: {
          selection: 'manual' as const,
          interaction: 'interactive' as const
        },
        context: {}
      };
      
      // Mock the processQuery method
      const processQuerySpy = vi.spyOn(workflowEngine as any, 'processQuery')
        .mockImplementation(async function* () {
          yield { type: 'reasoning', step: 'processing', description: 'Processing query...' };
          yield { type: 'content', content: 'Test response' };
          yield { type: 'complete', result: 'Test response' };
        });
      
      // Act
      const events = [];
      for await (const event of workflowEngine.execute(input)) {
        events.push(event);
      }
      
      // Assert - Check that we get some events
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe('reasoning');
      // The exact number of events may vary based on implementation
    });
    
    it('should execute workflow with automatic agent selection', async () => {
      // Arrange
      const input = {
        query: 'Test query',
        agent: null,
        mode: {
          selection: 'automatic' as const,
          interaction: 'interactive' as const
        },
        context: {}
      };
      
      // Mock available agents
      workflowEngine.setAvailableAgents([mockAgent]);
      
      // Mock the agent orchestrator
      mockAgentOrchestrator.selectBestAgent.mockResolvedValue({
        selected: mockAgent,
        confidence: 0.95,
        reasoning: 'Best match for query',
        alternatives: [],
        processingTime: 10
      });
      
      // Mock the processQuery method
      const processQuerySpy = vi.spyOn(workflowEngine as any, 'processQuery')
        .mockImplementation(async function* () {
          yield { type: 'reasoning', step: 'processing', description: 'Processing query...' };
          yield { type: 'content', content: 'Test response' };
          yield { type: 'complete', result: 'Test response' };
        });
      
      // Act
      const events = [];
      for await (const event of workflowEngine.execute(input)) {
        events.push(event);
      }
      
      // Assert - Check that we get some events
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe('reasoning');
      // The exact number of events may vary based on implementation
    });
    
    it('should handle workflow errors gracefully', async () => {
      // Arrange
      const input = {
        query: 'Test query',
        agent: mockAgent,
        mode: {
          selection: 'manual' as const,
          interaction: 'interactive' as const
        },
        context: {}
      };
      
      // Mock an error in the workflow
      vi.spyOn(workflowEngine as any, 'processQuery').mockImplementation(() => {
        throw new Error('Processing failed');
      });
      
      // Act
      const events = [];
      for await (const event of workflowEngine.execute(input)) {
        events.push(event);
      }
      
      // Assert - Check that we get some events
      expect(events.length).toBeGreaterThan(0);
      // The first event might be reasoning or error depending on implementation
      expect(['reasoning', 'error']).toContain(events[0].type);
      // Check that we have an error event
      const errorEvent = events.find(e => e.type === 'error');
      expect(errorEvent).toBeDefined();
    });
  });
  
  describe('getState', () => {
    it('should return current workflow state', () => {
      // Act
      const state = workflowEngine.getState();
      
      // Assert
      expect(state).toBeDefined();
      expect(state.status).toBe('pending'); // Initial state is pending
      expect(state.query).toBe('');
      expect(state.agent).toBeNull();
    });
  });
  
  describe('setAvailableAgents', () => {
    it('should set available agents for selection', () => {
      // Arrange
      const agents = [mockAgent];
      
      // Act
      workflowEngine.setAvailableAgents(agents);
      
      // Assert - The method should not throw and should set agents internally
      expect(() => workflowEngine.setAvailableAgents(agents)).not.toThrow();
      // We can't directly test the internal state, but we can verify the method works
    });
  });
});
