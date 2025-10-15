import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AgentOrchestrator } from '@/core/services/agent-orchestrator/agent-orchestrator.service';
import { Agent } from '@/core/domain/entities/agent.entity';
import { IIntentAnalyzer } from '@/core/services/agent-orchestrator/intent-analyzer.interface';
import { IAgentScorer } from '@/core/services/agent-orchestrator/agent-scorer.interface';

// Mock implementations
const mockIntentAnalyzer: jest.Mocked<IIntentAnalyzer> = {
  analyze: jest.fn()
};

const mockAgentScorer: jest.Mocked<IAgentScorer> = {
  scoreAgents: jest.fn()
};

describe('AgentOrchestrator', () => {
  let orchestrator: AgentOrchestrator;
  let mockAgents: Agent[];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create orchestrator with mocked dependencies
    orchestrator = new AgentOrchestrator(mockIntentAnalyzer, mockAgentScorer);

    // Create mock agents
    mockAgents = [
      new Agent(
        'medical-1',
        'cardiology-expert',
        'Cardiology Expert',
        'Expert in heart conditions',
        'You are a cardiology expert.',
        ['medical-knowledge', 'cardiology', 'diagnosis'],
        2,
        ['cardiology', 'cardiac-surgery'],
        'gpt-4',
        0.7,
        4000,
        true,
        new Date(),
        new Date()
      ),
      new Agent(
        'medical-2',
        'neurology-expert',
        'Neurology Expert',
        'Expert in brain and nervous system',
        'You are a neurology expert.',
        ['medical-knowledge', 'neurology', 'diagnosis'],
        2,
        ['neurology', 'neurosurgery'],
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
  });

  describe('selectBestAgent', () => {
    it('should select the highest scoring agent', async () => {
      // Arrange
      const query = 'What are the symptoms of heart disease?';
      const context = { chatHistory: [], userPreferences: {} };

      mockIntentAnalyzer.analyze.mockResolvedValue({
        domain: 'medical',
        requiredCapabilities: ['medical-knowledge', 'cardiology'],
        complexity: 'high',
        urgency: 'medium'
      });

      mockAgentScorer.scoreAgents.mockResolvedValue([
        { agent: mockAgents[0], score: 0.95, reasoning: 'Perfect match for cardiology query' },
        { agent: mockAgents[1], score: 0.3, reasoning: 'Some medical knowledge but not cardiology' },
        { agent: mockAgents[2], score: 0.1, reasoning: 'General knowledge only' }
      ]);

      // Act
      const result = await orchestrator.selectBestAgent(query, mockAgents, context);

      // Assert
      expect(result.selected).toBe(mockAgents[0]);
      expect(result.confidence).toBe(0.95);
      expect(result.reasoning).toBe('Perfect match for cardiology query');
      expect(result.alternatives).toHaveLength(2);
      expect(result.alternatives[0]).toBe(mockAgents[1]);
      expect(result.alternatives[1]).toBe(mockAgents[2]);

      // Verify mocks were called correctly
      expect(mockIntentAnalyzer.analyze).toHaveBeenCalledWith(query);
      expect(mockAgentScorer.scoreAgents).toHaveBeenCalledWith(
        mockAgents,
        expect.objectContaining({
          domain: 'medical',
          requiredCapabilities: ['medical-knowledge', 'cardiology']
        }),
        context
      );
    });

    it('should handle no suitable agents', async () => {
      // Arrange
      const query = 'How to cook pasta?';
      const context = { chatHistory: [], userPreferences: {} };

      mockIntentAnalyzer.analyze.mockResolvedValue({
        domain: 'cooking',
        requiredCapabilities: ['cooking-knowledge'],
        complexity: 'low',
        urgency: 'low'
      });

      mockAgentScorer.scoreAgents.mockResolvedValue([
        { agent: mockAgents[0], score: 0.1, reasoning: 'No cooking knowledge' },
        { agent: mockAgents[1], score: 0.05, reasoning: 'No cooking knowledge' },
        { agent: mockAgents[2], score: 0.2, reasoning: 'Some general knowledge' }
      ]);

      // Act
      const result = await orchestrator.selectBestAgent(query, mockAgents, context);

      // Assert
      expect(result.selected).toBe(mockAgents[2]); // Should still return the best available
      expect(result.confidence).toBe(0.2);
      expect(result.alternatives).toHaveLength(2);
    });

    it('should handle empty agent list', async () => {
      // Arrange
      const query = 'Any query';
      const context = { chatHistory: [], userPreferences: {} };

      mockIntentAnalyzer.analyze.mockResolvedValue({
        domain: 'general',
        requiredCapabilities: ['general-knowledge'],
        complexity: 'low',
        urgency: 'low'
      });

      mockAgentScorer.scoreAgents.mockResolvedValue([]);

      // Act
      const result = await orchestrator.selectBestAgent(query, [], context);

      // Assert
      expect(result.selected).toBeNull();
      expect(result.confidence).toBe(0);
      expect(result.reasoning).toBe('');
      expect(result.alternatives).toEqual([]);
    });

    it('should handle scoring errors gracefully', async () => {
      // Arrange
      const query = 'Test query';
      const context = { chatHistory: [], userPreferences: {} };

      mockIntentAnalyzer.analyze.mockResolvedValue({
        domain: 'general',
        requiredCapabilities: ['general-knowledge'],
        complexity: 'low',
        urgency: 'low'
      });

      mockAgentScorer.scoreAgents.mockRejectedValue(new Error('Scoring failed'));

      // Act & Assert
      await expect(orchestrator.selectBestAgent(query, mockAgents, context))
        .rejects.toThrow('Scoring failed');
    });
  });

  describe('suggestAgents', () => {
    it('should return top N agents based on scores', async () => {
      // Arrange
      const query = 'Medical question';
      const count = 2;

      mockIntentAnalyzer.analyze.mockResolvedValue({
        domain: 'medical',
        requiredCapabilities: ['medical-knowledge'],
        complexity: 'medium',
        urgency: 'medium'
      });

      mockAgentScorer.scoreAgents.mockResolvedValue([
        { agent: mockAgents[0], score: 0.9, reasoning: 'Best medical agent' },
        { agent: mockAgents[1], score: 0.8, reasoning: 'Good medical agent' },
        { agent: mockAgents[2], score: 0.3, reasoning: 'General agent' }
      ]);

      // Act
      const result = await orchestrator.suggestAgents(query, mockAgents, count);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(mockAgents[0]);
      expect(result[1]).toBe(mockAgents[1]);
    });

    it('should return all agents if count exceeds available agents', async () => {
      // Arrange
      const query = 'Test query';
      const count = 10;

      mockIntentAnalyzer.analyze.mockResolvedValue({
        domain: 'general',
        requiredCapabilities: ['general-knowledge'],
        complexity: 'low',
        urgency: 'low'
      });

      mockAgentScorer.scoreAgents.mockResolvedValue([
        { agent: mockAgents[0], score: 0.5, reasoning: 'Agent 1' },
        { agent: mockAgents[1], score: 0.4, reasoning: 'Agent 2' },
        { agent: mockAgents[2], score: 0.3, reasoning: 'Agent 3' }
      ]);

      // Act
      const result = await orchestrator.suggestAgents(query, mockAgents, count);

      // Assert
      expect(result).toHaveLength(3);
      expect(result).toEqual([mockAgents[0], mockAgents[1], mockAgents[2]]);
    });

    it('should use default count of 3 when not specified', async () => {
      // Arrange
      const query = 'Test query';

      mockIntentAnalyzer.analyze.mockResolvedValue({
        domain: 'general',
        requiredCapabilities: ['general-knowledge'],
        complexity: 'low',
        urgency: 'low'
      });

      mockAgentScorer.scoreAgents.mockResolvedValue([
        { agent: mockAgents[0], score: 0.5, reasoning: 'Agent 1' },
        { agent: mockAgents[1], score: 0.4, reasoning: 'Agent 2' },
        { agent: mockAgents[2], score: 0.3, reasoning: 'Agent 3' }
      ]);

      // Act
      const result = await orchestrator.suggestAgents(query, mockAgents);

      // Assert
      expect(result).toHaveLength(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle intent analysis errors', async () => {
      // Arrange
      const query = 'Test query';
      const context = { chatHistory: [], userPreferences: {} };

      mockIntentAnalyzer.analyze.mockRejectedValue(new Error('Intent analysis failed'));

      // Act & Assert
      await expect(orchestrator.selectBestAgent(query, mockAgents, context))
        .rejects.toThrow('Intent analysis failed');
    });

    it('should handle null/undefined inputs gracefully', async () => {
      // Act & Assert
      await expect(orchestrator.selectBestAgent('', null as any, undefined))
        .rejects.toThrow();
    });
  });
});
