import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentOrchestrator } from '@/core/services/agent-orchestrator/agent-orchestrator.service';
import { Agent } from '@/core/domain/entities/agent.entity';

// Mock the dependencies
vi.mock('@/core/services/agent-orchestrator/intent-analyzer.interface');
vi.mock('@/core/services/agent-orchestrator/agent-scorer.interface');

describe('AgentOrchestrator', () => {
  let orchestrator: AgentOrchestrator;
  let mockIntentAnalyzer: any;
  let mockAgentScorer: any;
  
  beforeEach(() => {
    mockIntentAnalyzer = {
      analyze: vi.fn()
    };
    
    mockAgentScorer = {
      scoreAgents: vi.fn()
    };
    
    orchestrator = new AgentOrchestrator(
      mockIntentAnalyzer,
      mockAgentScorer
    );
  });
  
  describe('selectBestAgent', () => {
    it('should select the highest scoring agent', async () => {
      // Arrange
      const query = 'What are the symptoms of diabetes?';
      const mockAgents = [
        new Agent(
          '1',
          'Medical Expert',
          'Medical Expert',
          'Expert in medical diagnosis',
          'You are a medical expert...',
          ['medical-knowledge', 'diagnosis'],
          2,
          ['medical', 'health'],
          'gpt-4',
          0.7,
          4000,
          true,
          new Date(),
          new Date()
        ),
        new Agent(
          '2',
          'General Assistant',
          'General Assistant',
          'General purpose assistant',
          'You are a general assistant...',
          ['general-knowledge'],
          1,
          ['general'],
          'gpt-3.5-turbo',
          0.7,
          2000,
          false,
          new Date(),
          new Date()
        )
      ];
      
      mockIntentAnalyzer.analyze.mockResolvedValue({
        domain: 'medical',
        requiredCapabilities: ['medical-knowledge']
      });
      
      mockAgentScorer.scoreAgents.mockResolvedValue([
        { agent: mockAgents[0], score: 0.95, reasoning: 'Medical expertise' },
        { agent: mockAgents[1], score: 0.3, reasoning: 'General knowledge' }
      ]);
      
      // Act
      const result = await orchestrator.selectBestAgent(
        query,
        mockAgents
      );
      
      // Assert
      expect(result.selected).toBe(mockAgents[0]);
      expect(result.confidence).toBe(0.95);
      expect(result.reasoning).toBe('Medical expertise');
      expect(result.alternatives).toHaveLength(1);
      expect(result.alternatives[0]).toBe(mockAgents[1]);
    });
    
    it('should handle no suitable agents', async () => {
      // Arrange
      const query = 'test query';
      const agents: Agent[] = [];
      
      mockIntentAnalyzer.analyze.mockResolvedValue({
        domain: 'general',
        requiredCapabilities: ['general-knowledge']
      });
      
      mockAgentScorer.scoreAgents.mockResolvedValue([]);
      
      // Act
      const result = await orchestrator.selectBestAgent(query, agents);
      
      // Assert
      expect(result.selected).toBeNull();
      expect(result.confidence).toBe(0);
      expect(result.reasoning).toContain('No suitable agents');
      expect(result.alternatives).toHaveLength(0);
    });
    
    it('should handle agent selection errors gracefully', async () => {
      // Arrange
      const query = 'test query';
      const agents = [new Agent(
        '1',
        'Test Agent',
        'Test Agent',
        'Test agent',
        'Test prompt',
        ['test'],
        1,
        ['test'],
        'gpt-3.5-turbo',
        0.7,
        2000,
        false,
        new Date(),
        new Date()
      )];
      
      mockIntentAnalyzer.analyze.mockRejectedValue(new Error('Analysis failed'));
      
      // Act
      const result = await orchestrator.selectBestAgent(query, agents);

      // Assert
      expect(result.selected).toBeNull();
      expect(result.confidence).toBe(0);
      expect(result.reasoning).toContain('Error during agent selection: Analysis failed');
      expect(result.alternatives).toEqual([]);
    });
  });
  
  describe('suggestAgents', () => {
    it('should return top N agents based on scores', async () => {
      // Arrange
      const query = 'medical question';
      const agents = [
        new Agent('1', 'Agent1', 'Agent1', 'Desc1', 'Prompt1', ['medical-knowledge'], 2, ['medical'], 'gpt-4', 0.7, 4000, true, new Date(), new Date()),
        new Agent('2', 'Agent2', 'Agent2', 'Desc2', 'Prompt2', ['medical-knowledge'], 2, ['medical'], 'gpt-4', 0.7, 4000, true, new Date(), new Date()),
        new Agent('3', 'Agent3', 'Agent3', 'Desc3', 'Prompt3', ['medical-knowledge'], 2, ['medical'], 'gpt-4', 0.7, 4000, true, new Date(), new Date())
      ];
      
      mockIntentAnalyzer.analyze.mockResolvedValue({
        domain: 'medical',
        requiredCapabilities: ['medical-knowledge']
      });
      
      mockAgentScorer.scoreAgents.mockResolvedValue([
        { agent: agents[0], score: 0.9, reasoning: 'Best match' },
        { agent: agents[1], score: 0.8, reasoning: 'Good match' },
        { agent: agents[2], score: 0.7, reasoning: 'Decent match' }
      ]);
      
      // Act
      const result = await orchestrator.suggestAgents(query, agents, 2);
      
      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(agents[0]);
      expect(result[1]).toBe(agents[1]);
    });
  });
});
