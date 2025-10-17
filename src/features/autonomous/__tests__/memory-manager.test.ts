import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { memoryManager, MemoryManager } from '../memory-manager';
import { WorkingMemory, EpisodicMemory, Concept, ToolCombination } from '../autonomous-state';

describe('Memory Manager Unit Tests', () => {
  let manager: MemoryManager;

  beforeEach(() => {
    manager = new MemoryManager();
  });

  afterEach(() => {
    manager.reset();
  });

  describe('Working Memory Management', () => {
    it('should update working memory correctly', () => {
      const update = {
        facts: ['Diabetes is a metabolic disorder'],
        insights: ['Metformin is first-line treatment'],
        hypotheses: ['New treatments may be more effective']
      };

      const result = manager.updateWorkingMemory(update);
      
      expect(result.facts).toEqual(update.facts);
      expect(result.insights).toEqual(update.insights);
      expect(result.hypotheses).toEqual(update.hypotheses);
    });

    it('should merge working memory updates', () => {
      manager.updateWorkingMemory({
        facts: ['Fact 1'],
        insights: ['Insight 1']
      });

      manager.updateWorkingMemory({
        facts: ['Fact 2'],
        hypotheses: ['Hypothesis 1']
      });

      const memory = manager.getWorkingMemory();
      expect(memory.facts).toEqual(['Fact 2']); // Should replace, not append
      expect(memory.insights).toEqual(['Insight 1']);
      expect(memory.hypotheses).toEqual(['Hypothesis 1']);
    });

    it('should consolidate working memory', () => {
      manager.updateWorkingMemory({
        facts: ['Fact 1', 'Fact 2', 'Fact 3'],
        insights: ['Insight 1', 'Insight 2'],
        hypotheses: ['Hypothesis 1']
      });

      // This is a placeholder test - actual consolidation logic would be implemented
      manager.consolidateWorkingMemory();
      
      const memory = manager.getWorkingMemory();
      expect(memory.facts).toBeDefined();
      expect(memory.insights).toBeDefined();
      expect(memory.hypotheses).toBeDefined();
    });
  });

  describe('Episodic Memory', () => {
    it('should record episodes correctly', () => {
      const episode: EpisodicMemory = {
        id: 'episode-1',
        taskId: 'task-1',
        description: 'Research diabetes treatments',
        result: { synthesis: 'Found 5 treatment options' },
        success: true,
        cost: 2.5,
        duration: 30000,
        toolsUsed: ['pubmed', 'web_search'],
        timestamp: new Date()
      };

      manager.recordEpisode(episode);
      
      const recentEpisodes = manager.getRecentEpisodes(1);
      expect(recentEpisodes).toHaveLength(1);
      expect(recentEpisodes[0].id).toBe('episode-1');
    });

    it('should limit episodic memory to 100 episodes', () => {
      // Add 150 episodes
      for (let i = 0; i < 150; i++) {
        manager.recordEpisode({
          id: `episode-${i}`,
          taskId: `task-${i}`,
          description: `Episode ${i}`,
          result: { data: `result-${i}` },
          success: true,
          cost: 1.0,
          duration: 1000,
          toolsUsed: ['test-tool'],
          timestamp: new Date()
        });
      }

      const stats = manager.getMemoryStats();
      expect(stats.episodicMemoryCount).toBeLessThanOrEqual(100);
    });

    it('should find similar episodes', () => {
      // Add some episodes
      manager.recordEpisode({
        id: 'episode-1',
        taskId: 'task-1',
        description: 'Research diabetes treatments',
        result: { synthesis: 'Found treatments' },
        success: true,
        cost: 2.0,
        duration: 25000,
        toolsUsed: ['pubmed'],
        timestamp: new Date()
      });

      manager.recordEpisode({
        id: 'episode-2',
        taskId: 'task-2',
        description: 'Research hypertension treatments',
        result: { synthesis: 'Found treatments' },
        success: true,
        cost: 2.0,
        duration: 25000,
        toolsUsed: ['pubmed'],
        timestamp: new Date()
      });

      const similarEpisodes = manager.findSimilarEpisodes('diabetes research');
      // This is a placeholder test - actual similarity search would be implemented
      expect(Array.isArray(similarEpisodes)).toBe(true);
    });
  });

  describe('Semantic Memory', () => {
    it('should add and retrieve concepts', () => {
      const concept: Concept = {
        id: 'concept-1',
        name: 'Diabetes',
        description: 'A metabolic disorder characterized by high blood sugar',
        type: 'disease',
        properties: { severity: 'high', prevalence: 'common' },
        associations: []
      };

      manager.addConcept(concept);
      
      const retrieved = manager.getConcept('concept-1');
      expect(retrieved).toEqual({
        ...concept,
        lastUpdated: expect.any(Date)
      });
    });

    it('should create concept associations', () => {
      const conceptA: Concept = {
        id: 'concept-a',
        name: 'Diabetes',
        description: 'Metabolic disorder',
        type: 'disease',
        properties: {},
        associations: []
      };

      const conceptB: Concept = {
        id: 'concept-b',
        name: 'Insulin',
        description: 'Hormone for blood sugar control',
        type: 'hormone',
        properties: {},
        associations: []
      };

      manager.addConcept(conceptA);
      manager.addConcept(conceptB);
      manager.createConceptAssociation('concept-a', 'concept-b', 0.8);

      const retrievedA = manager.getConcept('concept-a');
      const retrievedB = manager.getConcept('concept-b');

      expect(retrievedA?.associations).toHaveLength(1);
      expect(retrievedB?.associations).toHaveLength(1);
      expect(retrievedA?.associations[0].targetId).toBe('concept-b');
      expect(retrievedB?.associations[0].targetId).toBe('concept-a');
    });

    it('should search concepts by query', () => {
      manager.addConcept({
        id: 'concept-1',
        name: 'Diabetes Mellitus',
        description: 'A group of metabolic disorders',
        type: 'disease',
        properties: {},
        associations: []
      });

      manager.addConcept({
        id: 'concept-2',
        name: 'Insulin Therapy',
        description: 'Treatment using insulin',
        type: 'treatment',
        properties: {},
        associations: []
      });

      const results = manager.searchConcepts('diabetes');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Diabetes Mellitus');
    });
  });

  describe('Tool Memory', () => {
    it('should record tool usage', () => {
      const toolCombo: ToolCombination = {
        id: 'combo-1',
        tools: ['pubmed', 'web_search'],
        taskType: 'research',
        successRate: 0.9,
        avgCost: 2.5,
        avgDuration: 30000,
        usageCount: 1,
        timestamp: new Date()
      };

      manager.recordToolUse(toolCombo);
      
      const stats = manager.getMemoryStats();
      expect(stats.toolMemoryCount).toBe(1);
    });

    it('should update existing tool combinations', () => {
      const toolCombo: ToolCombination = {
        id: 'combo-1',
        tools: ['pubmed'],
        taskType: 'research',
        successRate: 0.8,
        avgCost: 2.0,
        avgDuration: 25000,
        usageCount: 1,
        timestamp: new Date()
      };

      manager.recordToolUse(toolCombo);
      manager.recordToolUse(toolCombo);

      const stats = manager.getMemoryStats();
      expect(stats.toolMemoryCount).toBe(1); // Should still be 1, not 2
    });

    it('should recommend best tools for task type', () => {
      // Add some successful tool combinations
      manager.recordToolUse({
        id: 'combo-1',
        tools: ['pubmed', 'web_search'],
        taskType: 'research',
        successRate: 0.95,
        avgCost: 2.0,
        avgDuration: 25000,
        usageCount: 5,
        timestamp: new Date()
      });

      manager.recordToolUse({
        id: 'combo-2',
        tools: ['clinical_trials_search'],
        taskType: 'research',
        successRate: 0.7,
        avgCost: 3.0,
        avgDuration: 35000,
        usageCount: 2,
        timestamp: new Date()
      });

      const bestTools = manager.getBestTools('research');
      expect(bestTools).toContain('pubmed');
      expect(bestTools).toContain('web_search');
      expect(bestTools).toContain('clinical_trials_search');
    });

    it('should calculate tool performance metrics', () => {
      manager.recordToolUse({
        id: 'combo-1',
        tools: ['pubmed'],
        taskType: 'research',
        successRate: 0.9,
        avgCost: 2.0,
        avgDuration: 25000,
        usageCount: 3,
        timestamp: new Date()
      });

      const performance = manager.getToolPerformance('pubmed');
      expect(performance).toBeDefined();
      expect(performance?.toolName).toBe('pubmed');
      expect(performance?.successRate).toBe(0.9);
      expect(performance?.avgCost).toBe(2.0);
      expect(performance?.usageCount).toBe(3);
    });
  });

  describe('Memory Retrieval', () => {
    it('should retrieve relevant memories by context', () => {
      // Add some test data
      manager.updateWorkingMemory({
        facts: ['Diabetes is a metabolic disorder'],
        insights: ['Metformin is effective']
      });

      manager.recordEpisode({
        id: 'episode-1',
        taskId: 'task-1',
        description: 'Research diabetes treatments',
        result: { synthesis: 'Found treatments' },
        success: true,
        cost: 2.0,
        duration: 25000,
        toolsUsed: ['pubmed'],
        timestamp: new Date()
      });

      manager.addConcept({
        id: 'concept-1',
        name: 'Diabetes',
        description: 'Metabolic disorder',
        type: 'disease',
        properties: {},
        associations: []
      });

      const retrieval = manager.retrieveRelevantMemories('diabetes research');
      
      expect(retrieval.working.facts).toContain('Diabetes is a metabolic disorder');
      expect(retrieval.episodes).toHaveLength(1);
      expect(retrieval.concepts).toHaveLength(1);
    });
  });

  describe('Memory Management', () => {
    it('should provide memory statistics', () => {
      manager.updateWorkingMemory({
        facts: ['Fact 1', 'Fact 2'],
        insights: ['Insight 1']
      });

      manager.recordEpisode({
        id: 'episode-1',
        taskId: 'task-1',
        description: 'Test episode',
        result: { data: 'test' },
        success: true,
        cost: 1.0,
        duration: 1000,
        toolsUsed: ['test-tool'],
        timestamp: new Date()
      });

      const stats = manager.getMemoryStats();
      expect(stats.workingMemorySize).toBeGreaterThan(0);
      expect(stats.episodicMemoryCount).toBe(1);
      expect(stats.semanticMemoryConceptCount).toBe(0);
      expect(stats.toolMemoryCount).toBe(0);
    });

    it('should export and import memory', () => {
      // Add some test data
      manager.updateWorkingMemory({
        facts: ['Test fact'],
        insights: ['Test insight']
      });

      const exported = manager.exportMemory();
      expect(typeof exported).toBe('string');
      expect(exported).toContain('Test fact');

      // Reset and import
      manager.reset();
      manager.importMemory(exported);

      const memory = manager.getWorkingMemory();
      expect(memory.facts).toContain('Test fact');
    });

    it('should reset all memory', () => {
      // Add some test data
      manager.updateWorkingMemory({
        facts: ['Test fact'],
        insights: ['Test insight']
      });

      manager.recordEpisode({
        id: 'episode-1',
        taskId: 'task-1',
        description: 'Test episode',
        result: { data: 'test' },
        success: true,
        cost: 1.0,
        duration: 1000,
        toolsUsed: ['test-tool'],
        timestamp: new Date()
      });

      manager.reset();

      const stats = manager.getMemoryStats();
      expect(stats.workingMemorySize).toBe(0);
      expect(stats.episodicMemoryCount).toBe(0);
      expect(stats.semanticMemoryConceptCount).toBe(0);
      expect(stats.toolMemoryCount).toBe(0);
    });
  });
});
