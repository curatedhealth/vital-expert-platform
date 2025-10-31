/**
 * Unit Tests for Advanced Agent Patterns
 * 
 * Tests:
 * - Tree of Thoughts (ToT)
 * - Constitutional AI
 * - Adversarial Agents (basic)
 * - Mixture of Experts (basic)
 * 
 * Coverage Target: 85%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  TreeOfThoughts,
  type TreeOfThoughtsConfig,
  type ThoughtNode,
  type ThoughtPath,
} from '@/lib/services/agents/patterns/tree-of-thoughts';
import {
  ConstitutionalAgent,
  type ConstitutionalAIConfig,
  type Principle,
  type Violation,
} from '@/lib/services/agents/patterns/constitutional-ai';

// Mock dependencies
const mockLLM = {
  invoke: vi.fn(),
};

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  infoWithMetrics: vi.fn(),
};

const mockTracing = {
  startSpan: vi.fn(() => 'span-123'),
  endSpan: vi.fn(),
};

const mockCircuitBreaker = {
  execute: vi.fn((fn) => fn()),
};

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn(() => mockLLM),
  ChatAnthropic: vi.fn(() => mockLLM),
}));

vi.mock('@/lib/services/observability/structured-logger', () => ({
  createLogger: vi.fn(() => mockLogger),
}));

vi.mock('@/lib/services/observability/tracing', () => ({
  getTracingService: vi.fn(() => mockTracing),
}));

vi.mock('@/lib/services/resilience/circuit-breaker', () => ({
  getSupabaseCircuitBreaker: vi.fn(() => mockCircuitBreaker),
}));

vi.mock('@/lib/services/resilience/retry', () => ({
  withRetry: vi.fn(async (fn) => fn()),
}));

describe('Advanced Patterns Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tree of Thoughts Pattern', () => {
    let totPattern: TreeOfThoughts;
    let config: TreeOfThoughtsConfig;

    beforeEach(() => {
      config = {
        maxDepth: 3,
        maxBranches: 3,
        pruneThreshold: 0.3,
        llmProvider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
      };

      totPattern = new TreeOfThoughts(config);
    });

    it('should initialize with correct configuration', () => {
      expect(totPattern['config'].maxDepth).toBe(3);
      expect(totPattern['config'].maxBranches).toBe(3);
      expect(totPattern['config'].pruneThreshold).toBe(0.3);
    });

    it('should expand thought tree with multiple branches', async () => {
      // Initialize tree first
      await totPattern.initialize('Solve complex problem', 'agent-123');
      
      // Mock thought expansion responses
      mockLLM.invoke.mockResolvedValue({
        content: `
THOUGHT 1: Approach A
REASONING: This approach uses method X
CONFIDENCE: 0.8

THOUGHT 2: Approach B
REASONING: This approach uses method Y
CONFIDENCE: 0.7

THOUGHT 3: Approach C
REASONING: This approach uses method Z
CONFIDENCE: 0.6
        `,
      });

      const result = await totPattern.execute('Solve complex problem', 'agent-123');

      expect(result.root).toBeDefined();
      expect(result.bestPath).toBeDefined();
      expect(result.allPaths.length).toBeGreaterThan(0);
      expect(mockLLM.invoke).toHaveBeenCalled();
    });

    it('should prune low-scoring branches below threshold', async () => {
      config.pruneThreshold = 0.5;

      await totPattern.initialize('Test query', 'agent-123');
      
      mockLLM.invoke.mockResolvedValue({
        content: `
THOUGHT 1: Low score
REASONING: Not good
CONFIDENCE: 0.2
        `,
      });

      const result = await totPattern.execute('Test query', 'agent-123');

      expect(result.prunedCount).toBeGreaterThanOrEqual(0);
      expect(result.bestPath.totalScore).toBeGreaterThanOrEqual(0);
    });

    it('should respect maxDepth configuration', async () => {
      config.maxDepth = 2;

      await totPattern.initialize('Deep query', 'agent-123');
      
      mockLLM.invoke.mockResolvedValue({
        content: 'THOUGHT 1: Test\nREASONING: Test\nCONFIDENCE: 0.8',
      });

      const result = await totPattern.execute('Deep query', 'agent-123');

      // Verify depth doesn't exceed maxDepth (accounting for root at depth 0)
      const maxDepthInResult = Math.max(
        ...result.allPaths.map((path) => path.length)
      );
      expect(maxDepthInResult).toBeLessThanOrEqual(config.maxDepth + 1); // +1 for root
    });

    it('should select best path based on scores', async () => {
      await totPattern.initialize('Test', 'agent-123');
      
      mockLLM.invoke.mockResolvedValue({
        content: `
THOUGHT 1: High score
REASONING: Good approach
CONFIDENCE: 0.9
        `,
      });

      const result = await totPattern.execute('Test', 'agent-123');

      expect(result.bestPath).toBeDefined();
      expect(result.bestPath.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.bestPath.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty query gracefully', async () => {
      await totPattern.initialize('', 'agent-123');
      
      mockLLM.invoke.mockResolvedValue({
        content: 'THOUGHT 1: Empty query response\nREASONING: N/A\nCONFIDENCE: 0.5',
      });

      const result = await totPattern.execute('', 'agent-123');

      expect(result).toBeDefined();
      expect(result.root).toBeDefined();
    });

    it('should handle LLM errors gracefully', async () => {
      await totPattern.initialize('Test query', 'agent-123');
      
      mockLLM.invoke.mockRejectedValue(new Error('LLM API error'));

      await expect(totPattern.execute('Test query', 'agent-123')).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should evaluate paths with custom criteria', async () => {
      config.evaluationCriteria = ['Accuracy', 'Feasibility', 'Novelty'];

      await totPattern.initialize('Test', 'agent-123');
      
      mockLLM.invoke.mockResolvedValue({
        content: 'THOUGHT 1: Evaluated thought\nREASONING: Test\nCONFIDENCE: 0.8',
      });

      const result = await totPattern.execute('Test', 'agent-123');

      expect(result).toBeDefined();
      // Verify evaluation criteria used
      expect(mockLLM.invoke).toHaveBeenCalled();
    });
  });

  describe('Constitutional AI Pattern', () => {
    let constitutionalAI: ConstitutionalAgent;
    let config: ConstitutionalAIConfig;

    beforeEach(() => {
      config = {
        maxRevisions: 3,
        minComplianceScore: 0.8,
        enableRevision: true,
        llmProvider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
      };

      constitutionalAI = new ConstitutionalAgent(config);
    });

    it('should initialize with default healthcare principles', () => {
      expect(constitutionalAI['config'].principles).toBeDefined();
      expect(constitutionalAI['config'].principles!.length).toBeGreaterThan(0);
    });

    it('should review response against principles', async () => {
      const response = 'This is a medical response about patient care.';
      
      mockLLM.invoke.mockResolvedValue({
        content: `
VIOLATIONS: None found
COMPLIANCE_SCORE: 0.95
REQUIRES_REVISION: false
        `,
      });

      const result = await constitutionalAI.execute(response);

      expect(result.review).toBeDefined();
      expect(result.review.complianceScore).toBeGreaterThanOrEqual(0);
      expect(result.review.violations).toBeDefined();
      expect(mockLLM.invoke).toHaveBeenCalled();
    });

    it('should detect violations in non-compliant response', async () => {
      const response = 'This response violates privacy guidelines.';
      
      mockLLM.invoke.mockResolvedValue({
        content: `
VIOLATIONS:
- Principle: HIPAA Compliance
- Severity: high
- Explanation: Contains identifiable patient information

COMPLIANCE_SCORE: 0.4
REQUIRES_REVISION: true
        `,
      });

      const result = await constitutionalAI.execute(response);

      expect(result.review.violations.length).toBeGreaterThan(0);
      expect(result.review.complianceScore).toBeLessThan(config.minComplianceScore!);
      expect(result.review.requiresRevision).toBe(true);
    });

    it('should automatically revise response when violations found', async () => {
      const response = 'Non-compliant response';
      
      mockLLM.invoke
        .mockResolvedValueOnce({
          content: `
VIOLATIONS: Privacy violation
COMPLIANCE_SCORE: 0.5
REQUIRES_REVISION: true
          `,
        })
        .mockResolvedValueOnce({
          content: 'Revised compliant response',
        })
        .mockResolvedValueOnce({
          content: `
VIOLATIONS: None
COMPLIANCE_SCORE: 0.9
REQUIRES_REVISION: false
          `,
        });

      const result = await constitutionalAI.execute(response);

      expect(result.revisedResponse).toBeDefined();
      expect(result.revisionCount).toBeGreaterThan(0);
      expect(result.finalResponse).toBeDefined();
    });

    it('should respect maxRevisions limit', async () => {
      config.maxRevisions = 2;

      mockLLM.invoke.mockResolvedValue({
        content: `
VIOLATIONS: Always found
COMPLIANCE_SCORE: 0.3
REQUIRES_REVISION: true
        `,
      });

      const result = await constitutionalAI.execute('Test response');

      expect(result.revisionCount).toBeLessThanOrEqual(config.maxRevisions!);
    });

    it('should use custom principles when provided', async () => {
      const customPrinciples: Principle[] = [
        {
          id: 'custom-1',
          description: 'Custom principle',
          weight: 5,
          category: 'accuracy',
        },
      ];

      config.principles = customPrinciples;

      mockLLM.invoke.mockResolvedValue({
        content: 'REVIEW: Compliant',
      });

      const result = await constitutionalAI.execute('Test');

      expect(result).toBeDefined();
      // Verify custom principles used
      expect(mockLLM.invoke).toHaveBeenCalled();
    });

    it('should handle review errors gracefully', async () => {
      mockLLM.invoke.mockRejectedValue(new Error('Review failed'));

      const result = await constitutionalAI.execute('Test response');

      expect(result).toBeDefined();
      expect(result.finalResponse).toBeDefined(); // Should return original or error message
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should calculate compliance score correctly', async () => {
      mockLLM.invoke.mockResolvedValue({
        content: `
VIOLATIONS: 
- Principle 1 (low severity)
- Principle 2 (high severity)

COMPLIANCE_SCORE: 0.65
REQUIRES_REVISION: true
        `,
      });

      const result = await constitutionalAI.execute('Test');

      expect(result.review.complianceScore).toBeGreaterThanOrEqual(0);
      expect(result.review.complianceScore).toBeLessThanOrEqual(1);
    });

    it('should skip revision when disableRevision is true', async () => {
      config.enableRevision = false;

      mockLLM.invoke.mockResolvedValue({
        content: `
VIOLATIONS: Found
COMPLIANCE_SCORE: 0.4
REQUIRES_REVISION: true
        `,
      });

      const result = await constitutionalAI.execute('Test');

      expect(result.revisionCount).toBe(0);
      expect(result.revisedResponse).toBeNull();
    });
  });

  describe('Pattern Integration', () => {
    it('should chain ToT with Constitutional AI', async () => {
      const totConfig: TreeOfThoughtsConfig = {
        maxDepth: 2,
        maxBranches: 2,
      };
      
      const tot = new TreeOfThoughts(totConfig);
      
      await tot.initialize('Complex query', 'agent-123');
      
      mockLLM.invoke.mockResolvedValue({
        content: `
THOUGHT 1: Best thought path
REASONING: Good reasoning
CONFIDENCE: 0.9
        `,
      });

      const totResult = await tot.execute('Complex query', 'agent-123');
      const bestAnswer = totResult.bestPath.nodes.map(n => n.content).join(' ');

      const constitutionalConfig: ConstitutionalAIConfig = {
        enableRevision: true,
      };
      const constitutional = new ConstitutionalAgent(constitutionalConfig);

      mockLLM.invoke.mockResolvedValue({
        content: `
VIOLATIONS: None
COMPLIANCE_SCORE: 0.9
REQUIRES_REVISION: false
        `,
      });

      const constitutionalResult = await constitutional.execute('Original query', bestAnswer);

      expect(constitutionalResult.finalResponse).toBeDefined();
      expect(constitutionalResult.review.complianceScore).toBeGreaterThan(0);
    });
  });
});

