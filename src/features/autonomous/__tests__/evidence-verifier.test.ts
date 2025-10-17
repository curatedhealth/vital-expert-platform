import { describe, it, expect, beforeEach } from '@jest/globals';
import { evidenceVerifier, EvidenceVerifier } from '../evidence-verifier';
import { Evidence, EvidenceType, Task, Goal } from '../autonomous-state';

describe('Evidence Verifier Unit Tests', () => {
  let verifier: EvidenceVerifier;

  beforeEach(() => {
    verifier = new EvidenceVerifier();
  });

  describe('Evidence Collection', () => {
    it('should collect evidence from task results', () => {
      const task: Task = {
        id: 'task-1',
        description: 'Research diabetes treatments',
        type: 'research',
        priority: 5,
        status: 'completed',
        requiredTools: ['pubmed', 'web_search'],
        estimatedCost: 2.5,
        dependencies: [],
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date()
      };

      const taskResult = {
        synthesis: 'Found 5 effective treatments for diabetes',
        sources: ['pubmed.ncbi.nlm.nih.gov', 'diabetes.org'],
        confidence: 0.85
      };

      const evidence = verifier.collectEvidence(taskResult, task);

      expect(evidence).toHaveLength(1);
      expect(evidence[0].taskId).toBe('task-1');
      expect(evidence[0].type).toBeDefined();
      expect(evidence[0].content).toContain('Found 5 effective treatments');
      expect(evidence[0].source).toBeDefined();
    });

    it('should classify evidence types correctly', () => {
      const ragResult = { answer: 'Treatment A is effective', sources: ['source1'] };
      const toolResult = { results: ['result1', 'result2'] };
      const webResult = { content: 'Web content', url: 'https://example.com' };
      const summaryResult = { summary: 'Summary of findings' };
      const agentResult = { generated: 'Agent generated content' };

      const ragEvidence = verifier.collectEvidence(ragResult, { id: 'task-1' } as Task);
      const toolEvidence = verifier.collectEvidence(toolResult, { id: 'task-2' } as Task);
      const webEvidence = verifier.collectEvidence(webResult, { id: 'task-3' } as Task);
      const summaryEvidence = verifier.collectEvidence(summaryResult, { id: 'task-4' } as Task);
      const agentEvidence = verifier.collectEvidence(agentResult, { id: 'task-5' } as Task);

      expect(ragEvidence[0].type).toBe('RAG_SYNTHESIS');
      expect(toolEvidence[0].type).toBe('TOOL_OUTPUT');
      expect(webEvidence[0].type).toBe('WEB_CONTENT');
      expect(summaryEvidence[0].type).toBe('SUMMARY');
      expect(agentEvidence[0].type).toBe('AGENT_GENERATED');
    });

    it('should link evidence to goals', () => {
      const evidence: Evidence = {
        id: 'evidence-1',
        taskId: 'task-1',
        type: 'primary',
        source: 'test-source',
        content: 'Test content',
        confidence: 0.8,
        verificationStatus: 'unverified',
        timestamp: new Date(),
        hash: 'test-hash',
        citations: []
      };

      verifier.linkEvidenceToGoal(evidence, 'goal-123');
      expect(evidence.goalId).toBe('goal-123');
    });
  });

  describe('Evidence Verification', () => {
    it('should verify evidence with high confidence for credible sources', () => {
      const evidence: Evidence = {
        id: 'evidence-1',
        taskId: 'task-1',
        type: 'primary',
        source: 'pubmed.ncbi.nlm.nih.gov',
        content: 'Comprehensive study showing 90% efficacy',
        confidence: 0.8,
        verificationStatus: 'unverified',
        timestamp: new Date(),
        hash: 'test-hash',
        citations: []
      };

      const result = verifier.verifyEvidence(evidence);

      expect(result.verified).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.issues).toHaveLength(0);
    });

    it('should flag evidence with low confidence for unreliable sources', () => {
      const evidence: Evidence = {
        id: 'evidence-2',
        taskId: 'task-2',
        type: 'primary',
        source: 'random-blog.com',
        content: 'Short content',
        confidence: 0.8,
        verificationStatus: 'unverified',
        timestamp: new Date(),
        hash: 'test-hash',
        citations: []
      };

      const result = verifier.verifyEvidence(evidence);

      expect(result.confidence).toBeLessThan(0.8);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should detect contradictions in evidence', () => {
      const evidence1: Evidence = {
        id: 'evidence-1',
        taskId: 'task-1',
        type: 'primary',
        source: 'study1.com',
        content: 'Treatment A is 90% effective',
        confidence: 0.8,
        verificationStatus: 'unverified',
        timestamp: new Date(),
        hash: 'hash1',
        citations: []
      };

      const evidence2: Evidence = {
        id: 'evidence-2',
        taskId: 'task-2',
        type: 'primary',
        source: 'study2.com',
        content: 'Treatment A is only 30% effective',
        confidence: 0.7,
        verificationStatus: 'unverified',
        timestamp: new Date(),
        hash: 'hash2',
        citations: []
      };

      const crossRefResult = verifier.crossReferenceEvidence([evidence1, evidence2]);

      expect(crossRefResult.contradictions.length).toBeGreaterThan(0);
      expect(crossRefResult.supportingEvidence).toHaveLength(2);
    });

    it('should check source credibility correctly', () => {
      const highCredibility = verifier.checkSourceCredibility('pubmed.ncbi.nlm.nih.gov');
      const mediumCredibility = verifier.checkSourceCredibility('wikipedia.org');
      const lowCredibility = verifier.checkSourceCredibility('random-blog.com');

      expect(highCredibility).toBeGreaterThan(0.8);
      expect(mediumCredibility).toBeGreaterThan(0.5);
      expect(mediumCredibility).toBeLessThan(0.8);
      expect(lowCredibility).toBeLessThan(0.6);
    });
  });

  describe('Proof Generation', () => {
    it('should generate cryptographic proof for evidence', () => {
      const evidence: Evidence[] = [
        {
          id: 'evidence-1',
          taskId: 'task-1',
          type: 'primary',
          source: 'test-source',
          content: 'Test content 1',
          confidence: 0.8,
          verificationStatus: 'unverified',
          timestamp: new Date(),
          hash: 'hash1',
          citations: []
        },
        {
          id: 'evidence-2',
          taskId: 'task-2',
          type: 'primary',
          source: 'test-source-2',
          content: 'Test content 2',
          confidence: 0.7,
          verificationStatus: 'unverified',
          timestamp: new Date(),
          hash: 'hash2',
          citations: []
        }
      ];

      const proof = verifier.generateProof(evidence);

      expect(proof.id).toBeDefined();
      expect(proof.timestamp).toBeDefined();
      expect(proof.evidenceIds).toEqual(['evidence-1', 'evidence-2']);
      expect(proof.evidenceHashes).toHaveLength(2);
      expect(proof.combinedHash).toBeDefined();
      expect(proof.proofType).toBe('EVIDENCE_INTEGRITY');
    });

    it('should build evidence chains', () => {
      const evidence: Evidence[] = [
        {
          id: 'evidence-1',
          taskId: 'task-1',
          type: 'primary',
          source: 'test-source',
          content: 'Test content',
          confidence: 0.8,
          verificationStatus: 'unverified',
          timestamp: new Date(),
          hash: 'hash1',
          citations: []
        }
      ];

      const chain = verifier.buildEvidenceChain(evidence);

      expect(chain.id).toBeDefined();
      expect(chain.evidences).toEqual(['evidence-1']);
      expect(chain.timestamp).toBeDefined();
    });

    it('should generate reasoning proofs', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          description: 'Research treatment A',
          type: 'research',
          priority: 5,
          status: 'completed',
          requiredTools: ['pubmed'],
          estimatedCost: 2.0,
          dependencies: [],
          retryCount: 0,
          maxRetries: 3,
          createdAt: new Date()
        }
      ];

      const goal: Goal = {
        id: 'goal-1',
        description: 'Find effective diabetes treatments',
        successCriteria: ['Identify 3+ treatments', 'Verify efficacy'],
        createdAt: new Date(),
        status: 'active'
      };

      const reasoningProof = verifier.generateReasoningProof(tasks, goal);

      expect(reasoningProof.id).toBeDefined();
      expect(reasoningProof.goalId).toBe('goal-1');
      expect(reasoningProof.taskIds).toEqual(['task-1']);
      expect(reasoningProof.reasoningHash).toBeDefined();
      expect(reasoningProof.proofType).toBe('REASONING_TRACE');
    });
  });

  describe('Confidence Scoring', () => {
    it('should calculate confidence based on evidence type', () => {
      const ragEvidence: Evidence = {
        id: 'evidence-1',
        taskId: 'task-1',
        type: 'RAG_SYNTHESIS',
        source: 'pubmed.ncbi.nlm.nih.gov',
        content: 'Comprehensive study with detailed analysis',
        confidence: 0.8,
        verificationStatus: 'unverified',
        timestamp: new Date(),
        hash: 'hash1',
        citations: []
      };

      const confidence = verifier.calculateConfidence(ragEvidence);

      expect(confidence).toBeGreaterThan(0.7);
      expect(confidence).toBeLessThanOrEqual(1.0);
    });

    it('should weight confidence by source type', () => {
      const ragEvidence: Evidence = {
        id: 'evidence-1',
        taskId: 'task-1',
        type: 'RAG_SYNTHESIS',
        source: 'test-source',
        content: 'Test content',
        confidence: 0.8,
        verificationStatus: 'unverified',
        timestamp: new Date(),
        hash: 'hash1',
        citations: []
      };

      const toolEvidence: Evidence = {
        id: 'evidence-2',
        taskId: 'task-2',
        type: 'TOOL_OUTPUT',
        source: 'test-source',
        content: 'Test content',
        confidence: 0.8,
        verificationStatus: 'unverified',
        timestamp: new Date(),
        hash: 'hash2',
        citations: []
      };

      const ragConfidence = verifier.calculateConfidence(ragEvidence);
      const toolConfidence = verifier.calculateConfidence(toolEvidence);

      expect(ragConfidence).toBeGreaterThan(toolConfidence);
    });

    it('should adjust confidence for conflicts', () => {
      const baseConfidence = 0.8;
      const conflicts = [
        { type: 'contradiction', description: 'Conflicting evidence found' }
      ];

      const adjustedConfidence = verifier.adjustForConflicts(baseConfidence, conflicts);

      expect(adjustedConfidence).toBeLessThan(baseConfidence);
    });

    it('should aggregate confidence from multiple evidence', () => {
      const evidences: Evidence[] = [
        {
          id: 'evidence-1',
          taskId: 'task-1',
          type: 'primary',
          source: 'test-source',
          content: 'Test content 1',
          confidence: 0.8,
          verificationStatus: 'unverified',
          timestamp: new Date(),
          hash: 'hash1',
          citations: []
        },
        {
          id: 'evidence-2',
          taskId: 'task-2',
          type: 'primary',
          source: 'test-source-2',
          content: 'Test content 2',
          confidence: 0.6,
          verificationStatus: 'unverified',
          timestamp: new Date(),
          hash: 'hash2',
          citations: []
        }
      ];

      const aggregatedConfidence = verifier.aggregateConfidence(evidences);

      expect(aggregatedConfidence).toBeCloseTo(0.7, 1); // Average of 0.8 and 0.6
    });
  });

  describe('Evidence Synthesis', () => {
    it('should synthesize evidence into coherent summary', () => {
      const evidences: Evidence[] = [
        {
          id: 'evidence-1',
          taskId: 'task-1',
          type: 'primary',
          source: 'study1.com',
          content: 'Treatment A shows 90% efficacy in clinical trials',
          confidence: 0.8,
          verificationStatus: 'unverified',
          timestamp: new Date(),
          hash: 'hash1',
          citations: []
        },
        {
          id: 'evidence-2',
          taskId: 'task-2',
          type: 'primary',
          source: 'study2.com',
          content: 'Treatment A has minimal side effects',
          confidence: 0.7,
          verificationStatus: 'unverified',
          timestamp: new Date(),
          hash: 'hash2',
          citations: []
        }
      ];

      const synthesis = verifier.synthesizeEvidence(evidences);

      expect(synthesis.summary).toContain('Treatment A');
      expect(synthesis.citations).toHaveLength(2);
      expect(synthesis.confidence).toBeCloseTo(0.75, 1);
      expect(synthesis.evidenceIds).toEqual(['evidence-1', 'evidence-2']);
    });

    it('should generate citations correctly', () => {
      const evidences: Evidence[] = [
        {
          id: 'evidence-1',
          taskId: 'task-1',
          type: 'primary',
          source: 'pubmed.ncbi.nlm.nih.gov',
          content: 'Test content',
          confidence: 0.8,
          verificationStatus: 'unverified',
          timestamp: new Date(),
          hash: 'hash1',
          citations: []
        }
      ];

      const citations = verifier.generateCitations(evidences);

      expect(citations).toHaveLength(1);
      expect(citations[0]).toContain('pubmed.ncbi.nlm.nih.gov');
      expect(citations[0]).toContain('evidence-1');
    });

    it('should create evidence summary', () => {
      const evidences: Evidence[] = [
        {
          id: 'evidence-1',
          taskId: 'task-1',
          type: 'primary',
          source: 'test-source',
          content: 'Test content for summary',
          confidence: 0.8,
          verificationStatus: 'unverified',
          timestamp: new Date(),
          hash: 'hash1',
          citations: []
        }
      ];

      const summary = verifier.createEvidenceSummary(evidences);

      expect(summary).toContain('Test content for summary');
      expect(summary).toContain('test-source');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty evidence arrays', () => {
      const synthesis = verifier.synthesizeEvidence([]);
      const citations = verifier.generateCitations([]);
      const aggregatedConfidence = verifier.aggregateConfidence([]);

      expect(synthesis.summary).toBeDefined();
      expect(citations).toHaveLength(0);
      expect(aggregatedConfidence).toBe(0);
    });

    it('should handle evidence with missing fields', () => {
      const incompleteEvidence: Evidence = {
        id: 'evidence-1',
        taskId: 'task-1',
        type: 'primary',
        source: '',
        content: 'Short',
        confidence: 0.8,
        verificationStatus: 'unverified',
        timestamp: new Date(),
        hash: 'hash1',
        citations: []
      };

      const result = verifier.verifyEvidence(incompleteEvidence);

      expect(result.verified).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(10000);
      const evidence: Evidence = {
        id: 'evidence-1',
        taskId: 'task-1',
        type: 'primary',
        source: 'test-source',
        content: longContent,
        confidence: 0.8,
        verificationStatus: 'unverified',
        timestamp: new Date(),
        hash: 'hash1',
        citations: []
      };

      const confidence = verifier.calculateConfidence(evidence);

      expect(confidence).toBeGreaterThan(0.5);
    });
  });
});
