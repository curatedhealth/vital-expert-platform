import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { autonomousOrchestrator } from '../autonomous-orchestrator';
import { memoryManager } from '../memory-manager';
import { evidenceVerifier } from '../evidence-verifier';

// Mock external dependencies with complex scenarios
jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        goal: {
          id: 'complex-goal-1',
          description: 'Analyze potential drug interactions between Warfarin, Metformin, and Lisinopril in elderly patients with diabetes and hypertension',
          successCriteria: [
            { id: 'criteria-1', description: 'Identify all potential interactions', achieved: false },
            { id: 'criteria-2', description: 'Assess clinical significance', achieved: false },
            { id: 'criteria-3', description: 'Provide monitoring recommendations', achieved: false },
            { id: 'criteria-4', description: 'Review contraindications', achieved: false },
            { id: 'criteria-5', description: 'Suggest alternative therapies if needed', achieved: false }
          ],
          priority: 'critical',
          domain: 'clinical',
          estimatedDuration: 60,
          requiredTools: ['pubmed', 'fda_database_search', 'clinical_trials_search', 'web_search'],
          constraints: ['peer-reviewed sources only', 'recent studies', 'clinical guidelines']
        },
        complexity: {
          score: 0.95,
          factors: ['multiple medications', 'elderly population', 'comorbidities', 'drug interactions'],
          estimatedTasks: 12
        },
        context: {
          domain: 'clinical',
          subdomain: 'pharmacology',
          urgency: 'critical',
          stakeholders: ['pharmacists', 'physicians', 'patients']
        }
      })
    })
  }))
}));

// Mock task executor with complex results
jest.mock('../task-executor', () => ({
  taskExecutor: {
    executeTask: jest.fn().mockImplementation(async (task, context) => {
      const mockResults = [
        {
          id: 'task-1',
          type: 'research',
          status: 'completed',
          result: {
            answer: 'Found 15 studies on Warfarin-Metformin interactions',
            sources: ['PubMed Study 1', 'PubMed Study 2', 'Clinical Pharmacology Journal'],
            citations: ['doi:10.1234/warfarin-metformin', 'doi:10.1234/drug-interactions'],
            synthesis: 'Moderate interaction risk with increased bleeding potential'
          },
          evidence: [
            {
              id: 'evidence-1',
              content: 'Warfarin-Metformin interaction increases INR by 15-20%',
              source: 'PubMed Study 1',
              type: 'primary',
              confidence: 0.88
            }
          ]
        },
        {
          id: 'task-2',
          type: 'analysis',
          status: 'completed',
          result: {
            answer: 'Clinical significance analysis completed',
            sources: ['Clinical Guidelines', 'FDA Database'],
            synthesis: 'High risk combination requiring close monitoring'
          }
        }
      ];
      
      const mockResult = mockResults.find(r => r.type === task.type) || mockResults[0];
      
      return {
        success: true,
        taskId: task.id,
        result: mockResult.result,
        evidence: mockResult.evidence || [],
        duration: 2000 + Math.random() * 3000, // 2-5 seconds
        cost: 0.1 + Math.random() * 0.2 // $0.10-$0.30
      };
    })
  }
}));

describe('Complex Autonomous Scenarios', () => {
  beforeEach(() => {
    memoryManager.reset();
    jest.clearAllMocks();
  });

  afterEach(() => {
    memoryManager.reset();
  });

  describe('Multi-Drug Interaction Analysis', () => {
    it('should handle complex drug interaction analysis with multiple medications', async () => {
      const testGoal = 'Analyze potential drug interactions between Warfarin, Metformin, and Lisinopril in elderly patients with diabetes and hypertension';
      
      const result = await autonomousOrchestrator.execute(testGoal, {
        mode: 'automatic',
        maxIterations: 15,
        maxCost: 100,
        supervisionLevel: 'high'
      });

      expect(result.success).toBe(true);
      expect(result.goal).toBeDefined();
      expect(result.goal.description).toContain('drug interactions');
      expect(result.goal.successCriteria.length).toBeGreaterThan(4);
      expect(result.completedTasks.length).toBeGreaterThan(5);
      expect(result.evidence.length).toBeGreaterThan(0);
      
      // Verify evidence quality
      const evidenceSynthesis = evidenceVerifier.synthesizeEvidence(result.evidence);
      expect(evidenceSynthesis.confidence).toBeGreaterThan(0.7);
    });

    it('should maintain evidence chain integrity for complex multi-step analysis', async () => {
      const testGoal = 'Comprehensive drug interaction analysis for polypharmacy patients';
      
      const result = await autonomousOrchestrator.execute(testGoal, {
        mode: 'automatic',
        maxIterations: 12,
        maxCost: 80
      });

      // Verify evidence chain
      expect(result.evidence.length).toBeGreaterThan(0);
      expect(result.verificationProofs.length).toBeGreaterThan(0);
      
      // All evidence should be properly linked
      result.evidence.forEach(evidence => {
        expect(evidence.goalId).toBe(result.goal.id);
        expect(evidence.confidence).toBeGreaterThan(0.5);
      });

      // Verify evidence chain integrity
      const evidenceChain = evidenceVerifier.buildEvidenceChain(result.evidence, result.goal.id);
      expect(evidenceChain.evidences.length).toBe(result.evidence.length);
      expect(evidenceChain.chainHash).toBeDefined();
      expect(evidenceChain.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Regulatory Submission Preparation', () => {
    it('should handle complex regulatory submission for novel medical device', async () => {
      // Update mock for regulatory scenario
      const mockLLM = createComplexScenarioMock('regulatory-submission');
      jest.mocked(require('@langchain/openai').ChatOpenAI).mockImplementation(() => ({
        invoke: jest.fn().mockResolvedValue({
          content: JSON.stringify(mockLLM)
        })
      }));

      const testGoal = 'Prepare comprehensive regulatory submission for novel AI-powered diagnostic device for early cancer detection';
      
      const result = await autonomousOrchestrator.execute(testGoal, {
        mode: 'automatic',
        maxIterations: 25,
        maxCost: 200,
        supervisionLevel: 'high'
      });

      expect(result.success).toBe(true);
      expect(result.goal).toBeDefined();
      expect(result.goal.description).toContain('regulatory submission');
      expect(result.goal.successCriteria.length).toBeGreaterThan(5);
      expect(result.completedTasks.length).toBeGreaterThan(10);
      
      // Verify regulatory-specific evidence
      const regulatoryEvidence = result.evidence.filter(e => 
        e.source?.toLowerCase().includes('fda') || 
        e.source?.toLowerCase().includes('regulatory')
      );
      expect(regulatoryEvidence.length).toBeGreaterThan(0);
    });

    it('should handle international regulatory alignment requirements', async () => {
      const testGoal = 'Analyze regulatory requirements across FDA, EMA, and Health Canada for medical device approval';
      
      const result = await autonomousOrchestrator.execute(testGoal, {
        mode: 'automatic',
        maxIterations: 20,
        maxCost: 150
      });

      expect(result.success).toBe(true);
      expect(result.completedTasks.length).toBeGreaterThan(8);
      
      // Verify multi-jurisdictional evidence
      const internationalEvidence = result.evidence.filter(e => 
        e.source?.toLowerCase().includes('fda') ||
        e.source?.toLowerCase().includes('ema') ||
        e.source?.toLowerCase().includes('health canada')
      );
      expect(internationalEvidence.length).toBeGreaterThan(0);
    });
  });

  describe('Pandemic Response Planning', () => {
    it('should handle complex pandemic response strategy development', async () => {
      // Update mock for pandemic scenario
      const mockLLM = createComplexScenarioMock('pandemic-response');
      jest.mocked(require('@langchain/openai').ChatOpenAI).mockImplementation(() => ({
        invoke: jest.fn().mockResolvedValue({
          content: JSON.stringify(mockLLM)
        })
      }));

      const testGoal = 'Develop comprehensive pandemic response strategy for emerging infectious disease with focus on healthcare system preparedness';
      
      const result = await autonomousOrchestrator.execute(testGoal, {
        mode: 'automatic',
        maxIterations: 20,
        maxCost: 150,
        supervisionLevel: 'high'
      });

      expect(result.success).toBe(true);
      expect(result.goal).toBeDefined();
      expect(result.goal.description).toContain('pandemic response');
      expect(result.goal.successCriteria.length).toBeGreaterThan(4);
      expect(result.completedTasks.length).toBeGreaterThan(8);
      
      // Verify public health evidence
      const publicHealthEvidence = result.evidence.filter(e => 
        e.source?.toLowerCase().includes('who') ||
        e.source?.toLowerCase().includes('cdc') ||
        e.source?.toLowerCase().includes('epidemiology')
      );
      expect(publicHealthEvidence.length).toBeGreaterThan(0);
    });

    it('should handle multi-stakeholder coordination requirements', async () => {
      const testGoal = 'Coordinate international response to emerging infectious disease with focus on resource allocation and communication protocols';
      
      const result = await autonomousOrchestrator.execute(testGoal, {
        mode: 'automatic',
        maxIterations: 18,
        maxCost: 120
      });

      expect(result.success).toBe(true);
      expect(result.completedTasks.length).toBeGreaterThan(6);
      
      // Verify stakeholder-specific evidence
      const stakeholderEvidence = result.evidence.filter(e => 
        e.content?.toLowerCase().includes('stakeholder') ||
        e.content?.toLowerCase().includes('coordination') ||
        e.content?.toLowerCase().includes('communication')
      );
      expect(stakeholderEvidence.length).toBeGreaterThan(0);
    });
  });

  describe('Memory and Learning in Complex Scenarios', () => {
    it('should learn from complex scenarios and improve recommendations', async () => {
      // First complex execution
      await autonomousOrchestrator.execute('Complex drug interaction analysis for elderly patients', {
        mode: 'automatic',
        maxIterations: 10,
        maxCost: 50
      });

      const memoryStats1 = memoryManager.getMemoryStats();
      expect(memoryStats1.episodicMemoryCount).toBeGreaterThan(0);
      expect(memoryStats1.semanticMemoryConceptCount).toBeGreaterThan(0);

      // Second complex execution with related goal
      await autonomousOrchestrator.execute('Analyze drug interactions in polypharmacy patients with multiple comorbidities', {
        mode: 'automatic',
        maxIterations: 10,
        maxCost: 50
      });

      const memoryStats2 = memoryManager.getMemoryStats();
      expect(memoryStats2.episodicMemoryCount).toBeGreaterThan(memoryStats1.episodicMemoryCount);

      // Should have learned from previous complex execution
      const similarEpisodes = memoryManager.findSimilarEpisodes('drug interaction analysis');
      expect(similarEpisodes.length).toBeGreaterThan(0);
    });

    it('should maintain concept associations across complex scenarios', async () => {
      // Execute multiple related complex scenarios
      const scenarios = [
        'Complex drug interaction analysis',
        'Regulatory submission for medical device',
        'Pandemic response planning'
      ];

      for (const scenario of scenarios) {
        await autonomousOrchestrator.execute(scenario, {
          mode: 'automatic',
          maxIterations: 8,
          maxCost: 40
        });
      }

      const memoryStats = memoryManager.getMemoryStats();
      expect(memoryStats.semanticMemoryConceptCount).toBeGreaterThan(5);
      expect(memoryStats.workingMemoryFacts.length).toBeGreaterThan(10);

      // Should have created concept associations
      const concepts = memoryManager.searchConcepts('clinical');
      expect(concepts.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling in Complex Scenarios', () => {
    it('should handle partial failures in complex multi-step processes', async () => {
      // Mock some tasks to fail
      let taskCount = 0;
      jest.mocked(require('../task-executor').taskExecutor.executeTask).mockImplementation(async (task, context) => {
        taskCount++;
        if (taskCount % 3 === 0) {
          throw new Error(`Simulated failure in task ${task.id}`);
        }
        
        const mockResults = createComplexTaskResults('multi-drug-interaction');
        const mockResult = mockResults[0];
        
        return {
          success: true,
          taskId: task.id,
          result: mockResult.result,
          evidence: mockResult.evidence || [],
          duration: 2000,
          cost: 0.1
        };
      });

      const testGoal = 'Complex drug interaction analysis with potential failures';
      
      const result = await autonomousOrchestrator.execute(testGoal, {
        mode: 'automatic',
        maxIterations: 10,
        maxCost: 50
      });

      // Should handle partial failures gracefully
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.completedTasks.length).toBeGreaterThan(0);
    });

    it('should recover from failures and continue execution', async () => {
      // Mock recovery scenario
      let failureCount = 0;
      jest.mocked(require('../task-executor').taskExecutor.executeTask).mockImplementation(async (task, context) => {
        if (failureCount < 2) {
          failureCount++;
          throw new Error(`Temporary failure ${failureCount}`);
        }
        
        const mockResults = createComplexTaskResults('multi-drug-interaction');
        const mockResult = mockResults[0];
        
        return {
          success: true,
          taskId: task.id,
          result: mockResult.result,
          evidence: mockResult.evidence || [],
          duration: 2000,
          cost: 0.1
        };
      });

      const testGoal = 'Complex analysis with recovery from failures';
      
      const result = await autonomousOrchestrator.execute(testGoal, {
        mode: 'automatic',
        maxIterations: 10,
        maxCost: 50
      });

      // Should eventually succeed after failures
      expect(result.success).toBe(true);
      expect(result.completedTasks.length).toBeGreaterThan(0);
    });
  });
});
