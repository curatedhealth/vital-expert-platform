import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowEngine } from '@/core/services/workflow-engine/workflow-engine.service';
import { Agent } from '@/core/domain/entities/agent.entity';

// Mock the dependencies
vi.mock('@/core/services/agent-orchestrator/agent-orchestrator.service');

describe('WorkflowEngine', () => {
  let workflowEngine: WorkflowEngine;
  let mockAgent: Agent;
  
  beforeEach(() => {
    workflowEngine = new WorkflowEngine();
    
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
      
      // Act
      const events = [];
      for await (const event of workflowEngine.execute(input)) {
        events.push(event);
      }
      
      // Assert
      expect(events).toHaveLength(4); // reasoning, agent_selected, content, complete
      expect(events[0].type).toBe('reasoning');
      expect(events[1].type).toBe('agent_selected');
      expect(events[2].type).toBe('content');
      expect(events[3].type).toBe('complete');
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
      
      // Act
      const events = [];
      for await (const event of workflowEngine.execute(input)) {
        events.push(event);
      }
      
      // Assert
      expect(events).toHaveLength(5); // reasoning, agent_selection, agent_selected, content, complete
      expect(events[0].type).toBe('reasoning');
      expect(events[1].type).toBe('agent_selection');
      expect(events[2].type).toBe('agent_selected');
      expect(events[3].type).toBe('content');
      expect(events[4].type).toBe('complete');
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
      
      // Assert
      expect(events).toHaveLength(2); // reasoning, error
      expect(events[0].type).toBe('reasoning');
      expect(events[1].type).toBe('error');
      expect(events[1].error).toBe('Processing failed');
    });
  });
  
  describe('getState', () => {
    it('should return current workflow state', () => {
      // Act
      const state = workflowEngine.getState();
      
      // Assert
      expect(state).toBeDefined();
      expect(state.status).toBe('idle');
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
      
      // Assert
      const state = workflowEngine.getState();
      expect(state.availableAgents).toEqual(agents);
    });
  });
});
