import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { WorkflowEngine, WorkflowState } from '@/core/services/workflow-engine/workflow-engine.service';
import { Agent } from '@/core/domain/entities/agent.entity';

describe('WorkflowEngine', () => {
  let workflowEngine: WorkflowEngine;
  let mockAgent: Agent;

  beforeEach(() => {
    workflowEngine = new WorkflowEngine();
    
    mockAgent = new Agent(
      'test-agent',
      'test-agent',
      'Test Agent',
      'Test agent for workflow testing',
      'You are a test agent.',
      ['test-capability'],
      1,
      ['test-domain'],
      'gpt-3.5-turbo',
      0.5,
      2000,
      false,
      new Date(),
      new Date()
    );
  });

  describe('WorkflowState', () => {
    it('should initialize with correct default values', () => {
      const state: WorkflowState = {
        query: 'Test query',
        agent: null,
        mode: {
          selection: 'automatic',
          interaction: 'interactive'
        },
        context: {},
        response: '',
        status: 'pending',
        currentStep: 'initialization',
        requiresInput: false
      };

      expect(state.query).toBe('Test query');
      expect(state.agent).toBeNull();
      expect(state.mode.selection).toBe('automatic');
      expect(state.mode.interaction).toBe('interactive');
      expect(state.context).toEqual({});
      expect(state.response).toBe('');
      expect(state.status).toBe('pending');
      expect(state.currentStep).toBe('initialization');
      expect(state.requiresInput).toBe(false);
    });
  });

  describe('execute', () => {
    it('should execute workflow with automatic agent selection', async () => {
      // Arrange
      const input = {
        query: 'What is the treatment for hypertension?',
        mode: {
          selection: 'automatic' as const,
          interaction: 'interactive' as const
        },
        context: { chatHistory: [] }
      };

      // Mock the selectAgent method
      const selectAgentSpy = jest.spyOn(workflowEngine as any, 'selectAgent')
        .mockImplementation(async function* () {
          yield { type: 'reasoning', step: 'agent_selection', description: 'Selecting best agent...' };
          yield { type: 'agent_selected', agent: mockAgent, confidence: 0.9, reasoning: 'Best match' };
        });

      // Mock the processQuery method
      const processQuerySpy = jest.spyOn(workflowEngine as any, 'processQuery')
        .mockImplementation(async function* () {
          yield { type: 'reasoning', step: 'processing', description: 'Processing query...' };
          yield { type: 'query_processed', result: 'Query processed successfully' };
        });

      // Mock the generateResponse method
      const generateResponseSpy = jest.spyOn(workflowEngine as any, 'generateResponse')
        .mockImplementation(async function* () {
          yield { type: 'reasoning', step: 'generating', description: 'Generating response...' };
          yield { type: 'response_generated', response: 'Treatment for hypertension includes...' };
        });

      // Act
      const events = [];
      for await (const event of workflowEngine.execute(input)) {
        events.push(event);
      }

      // Assert
      expect(events).toHaveLength(6); // 2 from each step
      expect(events[0].type).toBe('reasoning');
      expect(events[1].type).toBe('agent_selected');
      expect(events[2].type).toBe('reasoning');
      expect(events[3].type).toBe('query_processed');
      expect(events[4].type).toBe('reasoning');
      expect(events[5].type).toBe('response_generated');

      // Verify methods were called
      expect(selectAgentSpy).toHaveBeenCalled();
      expect(processQuerySpy).toHaveBeenCalled();
      expect(generateResponseSpy).toHaveBeenCalled();

      // Cleanup
      selectAgentSpy.mockRestore();
      processQuerySpy.mockRestore();
      generateResponseSpy.mockRestore();
    });

    it('should execute workflow with manual agent selection', async () => {
      // Arrange
      const input = {
        query: 'What is the treatment for hypertension?',
        agent: mockAgent,
        mode: {
          selection: 'manual' as const,
          interaction: 'interactive' as const
        },
        context: { chatHistory: [] }
      };

      // Mock the processQuery method
      const processQuerySpy = jest.spyOn(workflowEngine as any, 'processQuery')
        .mockImplementation(async function* () {
          yield { type: 'reasoning', step: 'processing', description: 'Processing query...' };
          yield { type: 'query_processed', result: 'Query processed successfully' };
        });

      // Mock the generateResponse method
      const generateResponseSpy = jest.spyOn(workflowEngine as any, 'generateResponse')
        .mockImplementation(async function* () {
          yield { type: 'reasoning', step: 'generating', description: 'Generating response...' };
          yield { type: 'response_generated', response: 'Treatment for hypertension includes...' };
        });

      // Act
      const events = [];
      for await (const event of workflowEngine.execute(input)) {
        events.push(event);
      }

      // Assert
      expect(events).toHaveLength(4); // 2 from each step (no agent selection)
      expect(events[0].type).toBe('reasoning');
      expect(events[1].type).toBe('query_processed');
      expect(events[2].type).toBe('reasoning');
      expect(events[3].type).toBe('response_generated');

      // Verify methods were called
      expect(processQuerySpy).toHaveBeenCalled();
      expect(generateResponseSpy).toHaveBeenCalled();

      // Cleanup
      processQuerySpy.mockRestore();
      generateResponseSpy.mockRestore();
    });

    it('should handle workflow errors gracefully', async () => {
      // Arrange
      const input = {
        query: 'Test query',
        mode: {
          selection: 'automatic' as const,
          interaction: 'interactive' as const
        },
        context: { chatHistory: [] }
      };

      // Mock selectAgent to throw an error
      const selectAgentSpy = jest.spyOn(workflowEngine as any, 'selectAgent')
        .mockImplementation(async function* () {
          throw new Error('Agent selection failed');
        });

      // Act
      const events = [];
      for await (const event of workflowEngine.execute(input)) {
        events.push(event);
      }

      // Assert
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('error');
      expect(events[0].error).toBe('Agent selection failed');

      // Cleanup
      selectAgentSpy.mockRestore();
    });

    it('should handle user input requirements', async () => {
      // Arrange
      const input = {
        query: 'Test query',
        mode: {
          selection: 'manual' as const,
          interaction: 'interactive' as const
        },
        context: { chatHistory: [] }
      };

      // Mock selectAgent to require user input
      const selectAgentSpy = jest.spyOn(workflowEngine as any, 'selectAgent')
        .mockImplementation(async function* () {
          yield { type: 'reasoning', step: 'agent_selection', description: 'Selecting best agent...' };
          yield { type: 'user_input_required', prompt: 'Please select an agent', options: [mockAgent] };
        });

      // Act
      const events = [];
      for await (const event of workflowEngine.execute(input)) {
        events.push(event);
        if (event.type === 'user_input_required') {
          break; // Stop after user input requirement
        }
      }

      // Assert
      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('reasoning');
      expect(events[1].type).toBe('user_input_required');
      expect(events[1].prompt).toBe('Please select an agent');
      expect(events[1].options).toEqual([mockAgent]);

      // Cleanup
      selectAgentSpy.mockRestore();
    });
  });

  describe('selectAgent', () => {
    it('should handle automatic agent selection', async () => {
      // This would test the private selectAgent method
      // In a real implementation, you might want to make this method public for testing
      // or test it through the public execute method
    });

    it('should handle manual agent selection with user input', async () => {
      // This would test the private selectAgent method for manual mode
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      // Arrange
      const invalidInput = null as any;

      // Act & Assert
      await expect(async () => {
        for await (const event of workflowEngine.execute(invalidInput)) {
          // This should not be reached
        }
      }).rejects.toThrow();
    });

    it('should handle workflow state corruption', async () => {
      // Arrange
      const input = {
        query: 'Test query',
        mode: {
          selection: 'automatic' as const,
          interaction: 'interactive' as const
        },
        context: { chatHistory: [] }
      };

      // Mock a method to corrupt state
      const processQuerySpy = jest.spyOn(workflowEngine as any, 'processQuery')
        .mockImplementation(async function* () {
          // Corrupt the state
          (workflowEngine as any).state = null;
          throw new Error('State corrupted');
        });

      // Act
      const events = [];
      for await (const event of workflowEngine.execute(input)) {
        events.push(event);
      }

      // Assert
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('error');

      // Cleanup
      processQuerySpy.mockRestore();
    });
  });
});
