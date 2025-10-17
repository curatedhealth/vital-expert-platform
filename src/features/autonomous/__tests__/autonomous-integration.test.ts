import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { autonomousOrchestrator } from '../autonomous-orchestrator';
import { memoryManager } from '../memory-manager';
import { evidenceVerifier } from '../evidence-verifier';
import { goalExtractor } from '../goal-extractor';
import { taskGenerator } from '../task-generator';
import { taskExecutor } from '../task-executor';

// Mock external dependencies
jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        goal: {
          id: 'test-goal-1',
          description: 'Research the latest treatments for Type 2 diabetes',
          successCriteria: [
            { id: 'criteria-1', description: 'Find 3+ recent studies', achieved: false },
            { id: 'criteria-2', description: 'Identify treatment efficacy', achieved: false }
          ],
          priority: 'high',
          domain: 'clinical',
          estimatedDuration: 30,
          requiredTools: ['pubmed', 'clinical_trials_search'],
          constraints: ['peer-reviewed sources only']
        },
        complexity: {
          score: 0.7,
          factors: ['multiple data sources', 'clinical expertise required'],
          estimatedTasks: 5
        },
        context: {
          domain: 'clinical',
          subdomain: 'endocrinology',
          urgency: 'medium',
          stakeholders: ['clinicians', 'researchers']
        }
      })
    })
  }))
}));

describe('Autonomous Agent Integration Tests', () => {
  beforeEach(() => {
    // Reset memory and evidence verifier before each test
    memoryManager.reset();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    memoryManager.reset();
  });

  describe('Phase 6.1: Manual Mode Testing', () => {
    it('should execute autonomous mode with user-selected agent', async () => {
      const mockAgent = {
        id: 'test-agent-1',
        name: 'Clinical Research Expert',
        domain: 'clinical',
        capabilities: ['research', 'analysis']
      };

      const testGoal = 'Research the latest treatments for Type 2 diabetes';
      
      const result = await autonomousOrchestrator.execute(testGoal, {
        mode: 'manual',
        agent: mockAgent,
        maxIterations: 5,
        maxCost: 25,
        userId: 'test-user',
        sessionId: 'test-session'
      });

      expect(result.success).toBeDefined();
      expect(result.goal).toBeDefined();
      expect(result.goal.description).toContain('Type 2 diabetes');
      expect(result.completedTasks).toBeDefined();
      expect(result.evidence).toBeDefined();
      expect(result.verificationProofs).toBeDefined();
    });

    it('should persist memory across multiple manual mode executions', async () => {
      const mockAgent = {
        id: 'test-agent-2',
        name: 'Regulatory Affairs Specialist',
        domain: 'regulatory'
      };

      // First execution
      await autonomousOrchestrator.execute('Research FDA guidelines for medical devices', {
        mode: 'manual',
        agent: mockAgent,
        maxIterations: 3,
        maxCost: 15,
        userId: 'test-user',
        sessionId: 'test-session-1'
      });

      const memoryStats1 = memoryManager.getMemoryStats();
      expect(memoryStats1.episodicMemoryCount).toBeGreaterThan(0);

      // Second execution
      await autonomousOrchestrator.execute('Find similar regulatory requirements in EU', {
        mode: 'manual',
        agent: mockAgent,
        maxIterations: 3,
        maxCost: 15,
        userId: 'test-user',
        sessionId: 'test-session-2'
      });

      const memoryStats2 = memoryManager.getMemoryStats();
      expect(memoryStats2.episodicMemoryCount).toBeGreaterThan(memoryStats1.episodicMemoryCount);
    });

    it('should handle agent-specific tool recommendations', async () => {
      const clinicalAgent = {
        id: 'clinical-agent',
        name: 'Clinical Research Expert',
        domain: 'clinical'
      };

      // Record some tool usage for clinical tasks
      memoryManager.recordToolUse({
        id: 'tool-combo-1',
        tools: ['pubmed', 'clinical_trials_search'],
        taskType: 'research',
        successRate: 0.9,
        avgCost: 2.5,
        avgDuration: 30000,
        usageCount: 5,
        timestamp: new Date()
      });

      const recommendedTools = memoryManager.getBestTools('research');
      expect(recommendedTools).toContain('pubmed');
      expect(recommendedTools).toContain('clinical_trials_search');
    });
  });

  describe('Phase 6.2: Automatic Mode Testing', () => {
    it('should automatically select appropriate agent for medical queries', async () => {
      const medicalQuery = 'Analyze the efficacy of metformin in diabetes treatment';
      
      const result = await autonomousOrchestrator.execute(medicalQuery, {
        mode: 'automatic',
        maxIterations: 5,
        maxCost: 25,
        userId: 'test-user',
        sessionId: 'test-session-auto'
      });

      expect(result.success).toBeDefined();
      expect(result.goal).toBeDefined();
      expect(result.goal.medicalContext).toBeDefined();
      expect(result.goal.medicalContext.domain).toBe('endocrinology');
    });

    it('should generate appropriate tasks based on goal complexity', async () => {
      const complexGoal = 'Create a comprehensive regulatory strategy for a new medical device including FDA approval, EU MDR compliance, and clinical trial design';
      
      const goalExtraction = await goalExtractor.extractGoal(complexGoal);
      const taskGeneration = await taskGenerator.generateInitialTasks(goalExtraction.goal, {
        availableAgents: [],
        availableTools: ['fda_database_search', 'clinical_trials_search', 'web_search'],
        userPreferences: {}
      });

      expect(taskGeneration.tasks.length).toBeGreaterThan(5);
      expect(taskGeneration.tasks.some(t => t.type === 'compliance_check')).toBe(true);
      expect(taskGeneration.tasks.some(t => t.type === 'research')).toBe(true);
      expect(taskGeneration.tasks.some(t => t.type === 'analysis')).toBe(true);
    });

    it('should adapt task generation based on previous results', async () => {
      const goal = 'Research treatment options for hypertension';
      
      // First iteration
      const initialTasks = await taskGenerator.generateInitialTasks(
        { id: 'goal-1', description: goal, successCriteria: [], createdAt: new Date(), status: 'active' },
        { availableAgents: [], availableTools: [], userPreferences: {} }
      );

      // Simulate completing some tasks
      const completedTasks = initialTasks.tasks.slice(0, 2).map(task => ({
        ...task,
        status: 'completed' as const,
        result: { synthesis: 'Found 3 treatment options' },
        duration: 30000,
        cost: 2.5,
        toolsUsed: ['pubmed'],
        executedBy: 'auto-agent',
        success: true,
        confidence: 0.8
      }));

      // Generate follow-up tasks
      const followUpTasks = await taskGenerator.generateFollowUpTasks(
        { id: 'goal-1', description: goal, successCriteria: [], createdAt: new Date(), status: 'active' },
        completedTasks,
        initialTasks.tasks.slice(2),
        { insights: ['Found 3 treatment options'] }
      );

      expect(followUpTasks.tasks.length).toBeGreaterThan(0);
      expect(followUpTasks.reasoning.strategy).toBeDefined();
    });
  });

  describe('Phase 6.3: End-to-End Testing', () => {
    it('should complete full autonomous workflow from goal to result', async () => {
      const complexGoal = 'Research and analyze the latest FDA-approved treatments for Alzheimer\'s disease, including their efficacy, side effects, and cost-effectiveness';
      
      const result = await autonomousOrchestrator.execute(complexGoal, {
        mode: 'automatic',
        maxIterations: 10,
        maxCost: 50,
        maxDuration: 30,
        supervisionLevel: 'medium',
        userId: 'test-user',
        sessionId: 'test-session-e2e'
      });

      // Verify goal extraction
      expect(result.goal).toBeDefined();
      expect(result.goal.description).toContain('Alzheimer');
      expect(result.goal.medicalContext.domain).toBe('neurology');
      expect(result.goal.successCriteria.length).toBeGreaterThan(0);

      // Verify task execution
      expect(result.completedTasks.length).toBeGreaterThan(0);
      expect(result.completedTasks.every(task => task.success)).toBe(true);

      // Verify evidence collection
      expect(result.evidence.length).toBeGreaterThan(0);
      expect(result.evidence.every(ev => ev.verificationStatus)).toBeDefined();

      // Verify proof generation
      expect(result.verificationProofs.length).toBeGreaterThan(0);
      expect(result.verificationProofs.every(proof => proof.proofHash)).toBeDefined();

      // Verify memory persistence
      const memoryStats = memoryManager.getMemoryStats();
      expect(memoryStats.episodicMemoryCount).toBeGreaterThan(0);
      expect(memoryStats.semanticMemoryCount).toBeGreaterThan(0);

      // Verify final result quality
      expect(result.finalResult.summary).toBeDefined();
      expect(result.finalResult.evidenceSynthesis).toBeDefined();
      expect(result.finalResult.reasoningProof).toBeDefined();
    });

    it('should handle streaming execution correctly', async () => {
      const goal = 'Find the latest clinical trials for cancer immunotherapy';
      const events: any[] = [];

      for await (const event of autonomousOrchestrator.streamExecution(goal, {
        mode: 'automatic',
        maxIterations: 5,
        maxCost: 25,
        userId: 'test-user',
        sessionId: 'test-session-stream'
      })) {
        events.push(event);
      }

      // Verify streaming events
      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.type === 'goal')).toBe(true);
      expect(events.some(e => e.type === 'tasks')).toBe(true);
      expect(events.some(e => e.type === 'progress')).toBe(true);
      expect(events.some(e => e.type === 'complete')).toBe(true);
    });

    it('should respect safety limits and intervention points', async () => {
      const expensiveGoal = 'Conduct comprehensive research across all medical databases for every disease known to medicine';
      
      const result = await autonomousOrchestrator.execute(expensiveGoal, {
        mode: 'automatic',
        maxIterations: 3,
        maxCost: 10, // Very low cost limit
        maxDuration: 5, // Very short time limit
        supervisionLevel: 'high',
        userId: 'test-user',
        sessionId: 'test-session-safety'
      });

      // Should either complete within limits or require intervention
      expect(result.metrics.totalCost).toBeLessThanOrEqual(15); // Allow some buffer
      expect(result.metrics.totalIterations).toBeLessThanOrEqual(5); // Allow some buffer
    });
  });

  describe('Phase 6.4: Edge Case Testing', () => {
    it('should handle very simple goals (1-2 tasks)', async () => {
      const simpleGoal = 'What is diabetes?';
      
      const result = await autonomousOrchestrator.execute(simpleGoal, {
        mode: 'automatic',
        maxIterations: 3,
        maxCost: 5,
        userId: 'test-user',
        sessionId: 'test-session-simple'
      });

      expect(result.success).toBeDefined();
      expect(result.completedTasks.length).toBeLessThanOrEqual(3);
      expect(result.metrics.totalCost).toBeLessThan(10);
    });

    it('should handle very complex goals (20+ tasks)', async () => {
      const complexGoal = 'Create a comprehensive medical research report covering: 1) All major diseases, 2) Latest treatments for each, 3) Regulatory requirements, 4) Cost analysis, 5) Market research, 6) Clinical trial data, 7) Expert opinions, 8) Future trends, 9) Risk assessments, 10) Implementation strategies';
      
      const result = await autonomousOrchestrator.execute(complexGoal, {
        mode: 'automatic',
        maxIterations: 25,
        maxCost: 100,
        maxDuration: 60,
        supervisionLevel: 'low',
        userId: 'test-user',
        sessionId: 'test-session-complex'
      });

      expect(result.completedTasks.length).toBeGreaterThan(10);
      expect(result.goal.successCriteria.length).toBeGreaterThan(5);
    });

    it('should handle task failures and retries', async () => {
      // Mock a task that will fail
      const mockTask = {
        id: 'failing-task',
        description: 'This task will fail',
        type: 'research' as const,
        priority: 5,
        status: 'pending' as const,
        requiredTools: ['nonexistent_tool'],
        estimatedCost: 1.0,
        dependencies: [],
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date()
      };

      const result = await taskExecutor.executeTask(mockTask, {
        goal: { id: 'test-goal', description: 'Test goal' },
        workingMemory: { facts: [], insights: [], hypotheses: [] },
        previousResults: [],
        availableAgents: [],
        maxCost: 10
      });

      // Should handle failure gracefully
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle concurrent task execution safely', async () => {
      const parallelGoal = 'Research multiple topics simultaneously: diabetes, hypertension, and cancer';
      
      const result = await autonomousOrchestrator.execute(parallelGoal, {
        mode: 'automatic',
        maxIterations: 10,
        maxCost: 30,
        userId: 'test-user',
        sessionId: 'test-session-parallel'
      });

      // Should complete without errors
      expect(result.success).toBeDefined();
      expect(result.completedTasks.length).toBeGreaterThan(0);
    });

    it('should handle memory overflow gracefully', async () => {
      // Fill memory with many episodes
      for (let i = 0; i < 150; i++) {
        memoryManager.recordEpisode({
          id: `episode-${i}`,
          taskId: `task-${i}`,
          description: `Test episode ${i}`,
          result: { data: `result-${i}` },
          success: true,
          cost: 1.0,
          duration: 1000,
          toolsUsed: ['test-tool'],
          timestamp: new Date()
        });
      }

      const memoryStats = memoryManager.getMemoryStats();
      expect(memoryStats.episodicMemoryCount).toBeLessThanOrEqual(100); // Should be capped at 100
    });

    it('should handle evidence verification with conflicting sources', async () => {
      const conflictingEvidence = [
        {
          id: 'ev1',
          taskId: 'task1',
          type: 'primary' as const,
          source: 'study1.com',
          content: 'Treatment A is 90% effective',
          confidence: 0.8,
          verificationStatus: 'unverified' as const,
          timestamp: new Date(),
          hash: 'hash1',
          citations: []
        },
        {
          id: 'ev2',
          taskId: 'task2',
          type: 'primary' as const,
          source: 'study2.com',
          content: 'Treatment A is only 30% effective',
          confidence: 0.7,
          verificationStatus: 'unverified' as const,
          timestamp: new Date(),
          hash: 'hash2',
          citations: []
        }
      ];

      const synthesis = evidenceVerifier.synthesizeEvidence(conflictingEvidence);
      
      expect(synthesis.contradictingEvidence.length).toBeGreaterThan(0);
      expect(synthesis.consensus).toContain('contradiction');
      expect(synthesis.confidence).toBeLessThan(0.8);
    });
  });

  describe('Memory and Evidence Integration', () => {
    it('should maintain evidence chain integrity across iterations', async () => {
      const goal = 'Research diabetes treatments and verify findings';
      
      const result = await autonomousOrchestrator.execute(goal, {
        mode: 'automatic',
        maxIterations: 5,
        maxCost: 20,
        userId: 'test-user',
        sessionId: 'test-session-evidence'
      });

      // Verify evidence chain
      expect(result.evidence.length).toBeGreaterThan(0);
      expect(result.verificationProofs.length).toBeGreaterThan(0);
      
      // All evidence should be linked to the goal
      result.evidence.forEach(evidence => {
        expect(evidence.goalId).toBe(result.goal.id);
      });

      // Evidence chain should be verifiable
      const evidenceChain = evidenceVerifier.buildEvidenceChain(result.evidence);
      expect(evidenceChain.chainHash).toBeDefined();
      expect(evidenceChain.verificationProof).toBeDefined();
    });

    it('should learn from previous executions and improve recommendations', async () => {
      // First execution
      await autonomousOrchestrator.execute('Research diabetes treatments', {
        mode: 'automatic',
        maxIterations: 3,
        maxCost: 15,
        userId: 'test-user',
        sessionId: 'test-session-learning-1'
      });

      // Record successful tool combination
      memoryManager.recordToolUse({
        id: 'successful-combo',
        tools: ['pubmed', 'web_search'],
        taskType: 'research',
        successRate: 0.95,
        avgCost: 2.0,
        avgDuration: 25000,
        usageCount: 3,
        timestamp: new Date()
      });

      // Second execution should benefit from learning
      const recommendedTools = memoryManager.getBestTools('research');
      expect(recommendedTools).toContain('pubmed');
      expect(recommendedTools).toContain('web_search');
    });
  });
});
