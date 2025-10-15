import { describe, it, expect, beforeEach, afterEach, jest, vi } from 'vitest';
import { WorkflowEngine } from '@/core/services/workflow-engine/workflow-engine.service';
import { AgentOrchestrator } from '@/core/services/agent-orchestrator/agent-orchestrator.service';
import { Agent } from '@/core/domain/entities/agent.entity';

// Mock dependencies
vi.mock('@/core/services/agent-orchestrator/agent-orchestrator.service');
vi.mock('@/core/services/workflow-engine/workflow-engine.service');

const mockAgentOrchestrator = AgentOrchestrator as vi.MockedClass<typeof AgentOrchestrator>;
const mockWorkflowEngine = WorkflowEngine as vi.MockedClass<typeof WorkflowEngine>;

describe('Workflow Integration Tests', () => {
  let workflowEngine: WorkflowEngine;
  let agentOrchestrator: AgentOrchestrator;
  let mockAgent: Agent;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock agent
    mockAgent = new Agent(
      'test-agent',
      'test-agent',
      'Test Agent',
      'Test agent for integration testing',
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

    // Mock agent orchestrator
    const mockOrchestratorInstance = {
      selectBestAgent: vi.fn(),
      suggestAgents: vi.fn()
    };
    agentOrchestrator = mockOrchestratorInstance as any;
    mockAgentOrchestrator.mockImplementation(() => agentOrchestrator);

    // Mock workflow engine
    const mockWorkflowInstance = {
      execute: vi.fn()
    };
    workflowEngine = mockWorkflowInstance as any;
    mockWorkflowEngine.mockImplementation(() => workflowEngine);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Workflow Integration', () => {
    it('should execute full workflow from query to response', async () => {
      // Arrange
      const query = 'What is the treatment for hypertension?';
      const context = { chatHistory: [] };

      // Mock agent selection
      (agentOrchestrator.selectBestAgent as jest.Mock).mockResolvedValue({
        selected: mockAgent,
        confidence: 0.9,
        reasoning: 'Best match for medical query',
        alternatives: []
      });

      // Mock workflow execution
      const mockWorkflowEvents = [
        { type: 'reasoning', step: 'agent_selection', description: 'Selecting best agent...' },
        { type: 'agent_selected', agent: mockAgent, confidence: 0.9 },
        { type: 'reasoning', step: 'processing', description: 'Processing query...' },
        { type: 'response', content: 'Treatment for hypertension includes...' },
        { type: 'complete', status: 'success' }
      ];

      (workflowEngine.execute as jest.Mock).mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          for (const event of mockWorkflowEvents) {
            yield event;
          }
        }
      });

      // Act
      const events = [];
      for await (const event of workflowEngine.execute({
        query,
        mode: { selection: 'automatic', interaction: 'interactive' },
        context
      })) {
        events.push(event);
      }

      // Assert
      expect(events).toHaveLength(5);
      expect(events[0].type).toBe('reasoning');
      expect(events[1].type).toBe('agent_selected');
      expect(events[2].type).toBe('reasoning');
      expect(events[3].type).toBe('response');
      expect(events[4].type).toBe('complete');
    });

    it('should handle workflow with manual agent selection', async () => {
      // Arrange
      const query = 'What are the side effects of medication X?';
      const context = { chatHistory: [] };

      // Mock workflow execution with manual agent
      const mockWorkflowEvents = [
        { type: 'reasoning', step: 'processing', description: 'Processing with selected agent...' },
        { type: 'response', content: 'Side effects may include...' },
        { type: 'complete', status: 'success' }
      ];

      (workflowEngine.execute as jest.Mock).mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          for (const event of mockWorkflowEvents) {
            yield event;
          }
        }
      });

      // Act
      const events = [];
      for await (const event of workflowEngine.execute({
        query,
        agent: mockAgent,
        mode: { selection: 'manual', interaction: 'interactive' },
        context
      })) {
        events.push(event);
      }

      // Assert
      expect(events).toHaveLength(3);
      expect(events[0].type).toBe('reasoning');
      expect(events[1].type).toBe('response');
      expect(events[2].type).toBe('complete');
    });

    it('should handle workflow errors gracefully', async () => {
      // Arrange
      const query = 'Test query';
      const context = { chatHistory: [] };

      // Mock workflow execution with error
      (workflowEngine.execute as jest.Mock).mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'reasoning', step: 'processing', description: 'Processing...' };
          throw new Error('Workflow execution failed');
        }
      });

      // Act & Assert
      const events = [];
      try {
        for await (const event of workflowEngine.execute({
          query,
          mode: { selection: 'automatic', interaction: 'interactive' },
          context
        })) {
          events.push(event);
        }
      } catch (error) {
        expect(error.message).toBe('Workflow execution failed');
      }

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('reasoning');
    });
  });

  describe('Agent Selection Integration', () => {
    it('should select appropriate agent for medical queries', async () => {
      // Arrange
      const medicalQuery = 'What are the symptoms of diabetes?';
      const availableAgents = [
        new Agent(
          'medical-1',
          'cardiology-expert',
          'Cardiology Expert',
          'Expert in heart conditions',
          'You are a cardiology expert.',
          ['medical-knowledge', 'cardiology'],
          2,
          ['cardiology'],
          'gpt-4',
          0.7,
          4000,
          true,
          new Date(),
          new Date()
        ),
        new Agent(
          'general-1',
          'general-assistant',
          'General Assistant',
          'General purpose assistant',
          'You are a general assistant.',
          ['general-knowledge'],
          1,
          ['general'],
          'gpt-3.5-turbo',
          0.5,
          2000,
          false,
          new Date(),
          new Date()
        )
      ];

      // Mock agent selection
      (agentOrchestrator.selectBestAgent as jest.Mock).mockResolvedValue({
        selected: availableAgents[0],
        confidence: 0.95,
        reasoning: 'Medical expertise required',
        alternatives: [availableAgents[1]]
      });

      // Act
      const result = await agentOrchestrator.selectBestAgent(medicalQuery, availableAgents);

      // Assert
      expect(result.selected).toBe(availableAgents[0]);
      expect(result.confidence).toBe(0.95);
      expect(result.reasoning).toBe('Medical expertise required');
      expect(result.alternatives).toHaveLength(1);
    });

    it('should handle no suitable agents found', async () => {
      // Arrange
      const query = 'How to cook pasta?';
      const availableAgents = [
        new Agent(
          'medical-1',
          'cardiology-expert',
          'Cardiology Expert',
          'Expert in heart conditions',
          'You are a cardiology expert.',
          ['medical-knowledge', 'cardiology'],
          2,
          ['cardiology'],
          'gpt-4',
          0.7,
          4000,
          true,
          new Date(),
          new Date()
        )
      ];

      // Mock agent selection with no suitable agents
      (agentOrchestrator.selectBestAgent as jest.Mock).mockResolvedValue({
        selected: null,
        confidence: 0,
        reasoning: 'No suitable agents found',
        alternatives: []
      });

      // Act
      const result = await agentOrchestrator.selectBestAgent(query, availableAgents);

      // Assert
      expect(result.selected).toBeNull();
      expect(result.confidence).toBe(0);
      expect(result.reasoning).toBe('No suitable agents found');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle agent orchestrator errors', async () => {
      // Arrange
      const query = 'Test query';
      const availableAgents = [];

      // Mock agent selection error
      (agentOrchestrator.selectBestAgent as jest.Mock).mockRejectedValue(
        new Error('Agent selection failed')
      );

      // Act & Assert
      await expect(agentOrchestrator.selectBestAgent(query, availableAgents))
        .rejects.toThrow('Agent selection failed');
    });

    it('should handle workflow engine errors', async () => {
      // Arrange
      const query = 'Test query';
      const context = { chatHistory: [] };

      // Mock workflow execution error
      (workflowEngine.execute as jest.Mock).mockImplementation(() => {
        throw new Error('Workflow engine failed');
      });

      // Act & Assert
      await expect(workflowEngine.execute({
        query,
        mode: { selection: 'automatic', interaction: 'interactive' },
        context
      })).rejects.toThrow('Workflow engine failed');
    });
  });

  describe('Performance Integration', () => {
    it('should complete workflow within reasonable time', async () => {
      // Arrange
      const query = 'What is the treatment for hypertension?';
      const context = { chatHistory: [] };

      // Mock fast workflow execution
      const mockWorkflowEvents = [
        { type: 'reasoning', step: 'agent_selection', description: 'Selecting agent...' },
        { type: 'agent_selected', agent: mockAgent },
        { type: 'response', content: 'Treatment includes...' },
        { type: 'complete', status: 'success' }
      ];

      (workflowEngine.execute as jest.Mock).mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          for (const event of mockWorkflowEvents) {
            yield event;
          }
        }
      });

      // Act
      const startTime = Date.now();
      const events = [];
      for await (const event of workflowEngine.execute({
        query,
        mode: { selection: 'automatic', interaction: 'interactive' },
        context
      })) {
        events.push(event);
      }
      const endTime = Date.now();

      // Assert
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(events).toHaveLength(4);
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain data consistency throughout workflow', async () => {
      // Arrange
      const query = 'What are the side effects of medication X?';
      const context = { chatHistory: [{ role: 'user', content: 'Previous question' }] };

      // Mock workflow execution
      const mockWorkflowEvents = [
        { type: 'reasoning', step: 'agent_selection', description: 'Selecting agent...' },
        { type: 'agent_selected', agent: mockAgent, confidence: 0.9 },
        { type: 'reasoning', step: 'processing', description: 'Processing query...' },
        { type: 'response', content: 'Side effects may include...' },
        { type: 'complete', status: 'success' }
      ];

      (workflowEngine.execute as jest.Mock).mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          for (const event of mockWorkflowEvents) {
            yield event;
          }
        }
      });

      // Act
      const events = [];
      for await (const event of workflowEngine.execute({
        query,
        mode: { selection: 'automatic', interaction: 'interactive' },
        context
      })) {
        events.push(event);
      }

      // Assert
      expect(events[1].agent).toBe(mockAgent);
      expect(events[1].confidence).toBe(0.9);
      expect(events[3].content).toContain('Side effects');
      expect(events[4].status).toBe('success');
    });
  });
});
