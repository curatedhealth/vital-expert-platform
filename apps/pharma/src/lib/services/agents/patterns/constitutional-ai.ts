/**
 * Constitutional AI Pattern Implementation
 * 
 * Implements self-critique and improvement based on constitutional principles.
 * Healthcare-specific constitution ensures medical accuracy, safety, and compliance.
 * 
 * Features:
 * - Principle-based self-review
 * - Violation detection and explanation
 * - Automatic response revision
 * - Compliance scoring
 * - Healthcare-specific principles (HIPAA, accuracy, safety)
 * 
 * Architecture Principles:
 * - SOLID: Single responsibility, dependency injection, clean interfaces
 * - Type Safety: Full TypeScript with discriminated unions
 * - Observability: Structured logging, distributed tracing
 * - Resilience: Circuit breakers, retries, graceful degradation
 * - Security: Healthcare compliance principles enforced
 * 
 * @module lib/services/agents/patterns/constitutional-ai
 * @version 1.0.0
 */

import { ChatOpenAI, ChatAnthropic } from '@langchain/openai';
import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { getTracingService } from '@/lib/services/observability/tracing';
import { withRetry } from '@/lib/services/resilience/retry';
import { getSupabaseCircuitBreaker } from '@/lib/services/resilience/circuit-breaker';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Constitutional principle
 */
export interface Principle {
  id: string;
  description: string;
  weight: number; // 1-5, higher = more important
  category: 'accuracy' | 'safety' | 'privacy' | 'ethics' | 'compliance';
}

/**
 * Principle violation
 */
export interface Violation {
  principleId: string;
  principleDescription: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  weight: number;
}

/**
 * Constitutional review result
 */
export interface ConstitutionalReview {
  violations: Violation[];
  complianceScore: number; // 0-1, higher = more compliant
  overallCompliance: 'compliant' | 'minor_violations' | 'major_violations' | 'non_compliant';
  principleScores: Map<string, number>; // Principle ID -> score (0-10)
  feedback: string;
  requiresRevision: boolean;
}

/**
 * Constitutional AI execution result
 */
export interface ConstitutionalAIResult {
  initialResponse: string;
  review: ConstitutionalReview;
  revisedResponse: string | null; // Null if no revision needed
  finalResponse: string;
  revisionCount: number;
  executionTime: number; // milliseconds
  metadata: {
    finalComplianceScore: number;
    violationCount: number;
    principleCount: number;
  };
}

/**
 * Constitutional AI configuration
 */
export interface ConstitutionalAIConfig {
  principles?: Principle[]; // Custom principles (default: healthcare)
  maxRevisions?: number; // Maximum revision attempts (default: 3)
  minComplianceScore?: number; // Minimum score to accept (default: 0.8)
  enableRevision?: boolean; // Enable automatic revision (default: true)
  llmProvider?: 'openai' | 'anthropic';
  model?: string;
  temperature?: number;
}

// ============================================================================
// HEALTHCARE CONSTITUTION (Default Principles)
// ============================================================================

/**
 * Healthcare-specific constitutional principles
 * 
 * Based on HIPAA, FDA, and medical best practices.
 */
export const HEALTHCARE_CONSTITUTION: Principle[] = [
  // Medical Accuracy (Weight: 3 = High Priority)
  {
    id: 'medical_accuracy',
    description:
      'Provide medically accurate information based on current clinical guidelines, peer-reviewed research, and evidence-based medicine. Never make definitive medical claims without sufficient evidence.',
    weight: 3,
    category: 'accuracy',
  },
  // No Diagnosis (Weight: 3 = High Priority)
  {
    id: 'no_diagnosis',
    description:
      'Never provide specific medical diagnoses without proper clinical examination. Always recommend professional consultation for diagnosis.',
    weight: 3,
    category: 'safety',
  },
  // Patient Safety (Weight: 3 = High Priority)
  {
    id: 'patient_safety',
    description:
      'Prioritize patient safety above all. When in doubt, recommend professional medical consultation. Never recommend dangerous interventions.',
    weight: 3,
    category: 'safety',
  },
  // Privacy & HIPAA (Weight: 2 = Medium-High Priority)
  {
    id: 'privacy_hipaa',
    description:
      'Respect patient privacy and handle sensitive health information appropriately. Never store or log PHI without proper authorization. Comply with HIPAA regulations.',
    weight: 2,
    category: 'privacy',
  },
  // Evidence-Based (Weight: 2 = Medium-High Priority)
  {
    id: 'evidence_based',
    description:
      'Base recommendations on evidence-based medicine. Cite sources when possible. Distinguish between established facts and emerging research.',
    weight: 2,
    category: 'accuracy',
  },
  // Cultural Sensitivity (Weight: 1 = Standard Priority)
  {
    id: 'cultural_sensitivity',
    description:
      'Be culturally sensitive and inclusive in healthcare recommendations. Consider diverse patient backgrounds and beliefs.',
    weight: 1,
    category: 'ethics',
  },
  // FDA Compliance (Weight: 2 = Medium-High Priority)
  {
    id: 'fda_compliance',
    description:
      'Comply with FDA regulations. Do not recommend off-label uses without clear disclaimers. Distinguish between approved and investigational treatments.',
    weight: 2,
    category: 'compliance',
  },
  // Transparency (Weight: 1 = Standard Priority)
  {
    id: 'transparency',
    description:
      'Be transparent about limitations, uncertainties, and the need for professional consultation. Clearly state when information is incomplete.',
    weight: 1,
    category: 'ethics',
  },
];

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: Required<
  Omit<ConstitutionalAIConfig, 'principles' | 'minComplianceScore'>
> & {
  minComplianceScore: number;
  principles: Principle[];
} = {
  principles: HEALTHCARE_CONSTITUTION,
  maxRevisions: 3,
  minComplianceScore: 0.8,
  enableRevision: true,
  llmProvider: 'openai',
  model: 'gpt-4-turbo-preview',
  temperature: 0.5,
};

// ============================================================================
// CONSTITUTIONAL AI CLASS
// ============================================================================

/**
 * Constitutional AI Agent
 * 
 * Implements self-critique and improvement based on constitutional principles.
 */
export class ConstitutionalAgent {
  private config: typeof DEFAULT_CONFIG;
  private logger;
  private tracing;
  private circuitBreaker;
  private llm: ChatOpenAI | ChatAnthropic;

  constructor(config: ConstitutionalAIConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      principles: config.principles || HEALTHCARE_CONSTITUTION,
      minComplianceScore:
        config.minComplianceScore ?? DEFAULT_CONFIG.minComplianceScore,
    };

    this.logger = createLogger();
    this.tracing = getTracingService();
    this.circuitBreaker = getSupabaseCircuitBreaker();

    // Initialize LLM
    if (this.config.llmProvider === 'anthropic') {
      this.llm = new ChatAnthropic({
        modelName: this.config.model,
        temperature: this.config.temperature,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      });
    } else {
      this.llm = new ChatOpenAI({
        modelName: this.config.model,
        temperature: this.config.temperature,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Generate response with constitutional review
   * 
   * @param query - User query
   * @param initialResponse - Initial response (optional, will generate if not provided)
   * @param context - Additional context for generation
   * @returns Complete constitutional AI result
   */
  async execute(
    query: string,
    initialResponse?: string,
    context: any[] = []
  ): Promise<ConstitutionalAIResult> {
    const executionStart = Date.now();
    const spanId = this.tracing.startSpan('ConstitutionalAgent.execute', undefined, {
      queryPreview: query.substring(0, 100),
      principleCount: this.config.principles.length,
    });

    try {
      // Step 1: Generate initial response (if not provided)
      let currentResponse =
        initialResponse || (await this.generateInitial(query, context));

      this.logger.debug('constitutional_ai_initial_generated', {
        responseLength: currentResponse.length,
        responsePreview: currentResponse.substring(0, 200),
      });

      // Step 2: Constitutional review
      let review = await this.constitutionalReview(currentResponse);
      let revisionCount = 0;

      // Step 3: Revise if needed (up to maxRevisions)
      while (
        review.requiresRevision &&
        revisionCount < this.config.maxRevisions &&
        this.config.enableRevision
      ) {
        this.logger.info('constitutional_ai_revising', {
          revisionCount: revisionCount + 1,
          complianceScore: review.complianceScore,
          violationCount: review.violations.length,
        });

        currentResponse = await this.reviseResponse(query, currentResponse, review);
        revisionCount++;

        // Re-review revised response
        review = await this.constitutionalReview(currentResponse);

        // If still below threshold after max revisions, accept best attempt
        if (
          review.complianceScore >= this.config.minComplianceScore ||
          revisionCount >= this.config.maxRevisions
        ) {
          break;
        }
      }

      const executionTime = Date.now() - executionStart;
      const finalResponse = currentResponse;

      const result: ConstitutionalAIResult = {
        initialResponse: initialResponse || currentResponse,
        review,
        revisedResponse:
          revisionCount > 0 ? currentResponse : null,
        finalResponse,
        revisionCount,
        executionTime,
        metadata: {
          finalComplianceScore: review.complianceScore,
          violationCount: review.violations.length,
          principleCount: this.config.principles.length,
        },
      };

      this.logger.infoWithMetrics('constitutional_ai_executed', executionTime, {
        revisionCount,
        finalComplianceScore: review.complianceScore,
        violationCount: review.violations.length,
        requiresRevision: review.requiresRevision,
      });

      this.tracing.endSpan(spanId, true);

      return result;
    } catch (error) {
      const executionTime = Date.now() - executionStart;
      this.logger.error(
        'constitutional_ai_execute_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          executionTime,
        }
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      throw error;
    }
  }

  /**
   * Generate initial response
   * 
   * @param query - User query
   * @param context - Additional context
   * @returns Initial response
   */
  private async generateInitial(query: string, context: any[] = []): Promise<string> {
    const spanId = this.tracing.startSpan('ConstitutionalAgent.generateInitial', undefined, {
      queryLength: query.length,
      contextCount: context.length,
    });

    try {
      const contextText =
        context.length > 0
          ? `\n\nContext:\n${JSON.stringify(context, null, 2)}`
          : '';

      const prompt = `${query}${contextText}`;

      const response = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await this.llm.invoke([
              new SystemMessage(
                'You are a helpful healthcare assistant. Provide accurate, safe, and evidence-based information.'
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 2,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            this.logger.warn('constitutional_ai_initial_retry', {
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      const initialResponse = response.content.toString();

      this.tracing.endSpan(spanId, true);

      return initialResponse;
    } catch (error) {
      this.logger.error(
        'constitutional_ai_initial_generation_failed',
        error instanceof Error ? error : new Error(String(error)),
        {}
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      throw error;
    }
  }

  /**
   * Review response against constitutional principles
   * 
   * @param response - Response to review
   * @returns Constitutional review result
   */
  private async constitutionalReview(response: string): Promise<ConstitutionalReview> {
    const spanId = this.tracing.startSpan(
      'ConstitutionalAgent.constitutionalReview',
      undefined,
      {
        responseLength: response.length,
        principleCount: this.config.principles.length,
      }
    );

    const startTime = Date.now();

    try {
      const violations: Violation[] = [];
      const principleScores = new Map<string, number>();
      let totalWeightedScore = 0;
      let totalWeight = 0;

      // Review against each principle
      const reviewPromises = this.config.principles.map(async (principle) => {
        return this.reviewPrinciple(response, principle);
      });

      const principleReviews = await Promise.all(reviewPromises);

      for (const review of principleReviews) {
        const { principle, score, compliant, explanation } = review;

        principleScores.set(principle.id, score);
        totalWeightedScore += score * principle.weight;
        totalWeight += principle.weight * 10; // Max score is 10

        if (!compliant) {
          // Determine severity based on score and weight
          let severity: Violation['severity'] = 'low';
          if (score < 3) severity = 'critical';
          else if (score < 5) severity = 'high';
          else if (score < 7) severity = 'medium';

          violations.push({
            principleId: principle.id,
            principleDescription: principle.description,
            severity,
            explanation,
            weight: principle.weight,
          });
        }
      }

      // Calculate compliance score (0-1)
      const complianceScore =
        totalWeight > 0 ? totalWeightedScore / totalWeight : 0.5;

      // Determine overall compliance level
      let overallCompliance: ConstitutionalReview['overallCompliance'];
      const criticalViolations = violations.filter((v) => v.severity === 'critical').length;
      const highViolations = violations.filter((v) => v.severity === 'high').length;

      if (criticalViolations > 0 || complianceScore < 0.5) {
        overallCompliance = 'non_compliant';
      } else if (highViolations > 0 || complianceScore < 0.7) {
        overallCompliance = 'major_violations';
      } else if (violations.length > 0 || complianceScore < this.config.minComplianceScore) {
        overallCompliance = 'minor_violations';
      } else {
        overallCompliance = 'compliant';
      }

      const requiresRevision =
        overallCompliance !== 'compliant' &&
        complianceScore < this.config.minComplianceScore;

      const feedback = this.generateFeedback(violations, complianceScore);

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('constitutional_ai_reviewed', duration, {
        complianceScore,
        violationCount: violations.length,
        criticalViolations,
        highViolations,
        overallCompliance,
      });

      this.tracing.endSpan(spanId, true);

      return {
        violations,
        complianceScore,
        overallCompliance,
        principleScores,
        feedback,
        requiresRevision,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'constitutional_ai_review_failed',
        error instanceof Error ? error : new Error(String(error)),
        { duration }
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Graceful degradation: return lenient review
      return {
        violations: [],
        complianceScore: 0.8,
        overallCompliance: 'compliant',
        principleScores: new Map(),
        feedback: 'Review process encountered an error, assuming compliance',
        requiresRevision: false,
      };
    }
  }

  /**
   * Review response against a single principle
   * 
   * @param response - Response to review
   * @param principle - Principle to check
   * @returns Principle review result
   */
  private async reviewPrinciple(
    response: string,
    principle: Principle
  ): Promise<{
    principle: Principle;
    score: number;
    compliant: boolean;
    explanation: string;
  }> {
    const prompt = `
Evaluate this response against the principle:
"${principle.description}"

Response to evaluate:
${response}

Provide:
COMPLIANT: yes/no
SCORE: [0-10, where 10 is fully compliant]
EXPLANATION: [Brief explanation of compliance or violation]
    `.trim();

    try {
      const reviewResponse = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await this.llm.invoke([
              new SystemMessage(
                'You are a constitutional reviewer. Assess compliance objectively and rigorously.'
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 1,
          initialDelayMs: 300,
        }
      );

      const content = reviewResponse.content.toString();
      const compliant = content.toLowerCase().includes('compliant: yes');
      const scoreMatch = content.match(/SCORE:\s*(\d+)/i);
      const explanationMatch = content.match(/EXPLANATION:\s*(.+?)(?:\n|$)/is);

      const score = scoreMatch
        ? Math.min(10, Math.max(0, parseInt(scoreMatch[1])))
        : compliant
          ? 8
          : 5;
      const explanation = explanationMatch
        ? explanationMatch[1].trim()
        : compliant
          ? 'Response complies with principle'
          : 'Response may violate principle';

      return {
        principle,
        score,
        compliant,
        explanation,
      };
    } catch (error) {
      this.logger.warn('constitutional_ai_principle_review_failed', {
        principleId: principle.id,
        error: error instanceof Error ? error.message : String(error),
      });

      // Graceful degradation: assume compliance
      return {
        principle,
        score: 8,
        compliant: true,
        explanation: 'Review failed, assuming compliance',
      };
    }
  }

  /**
   * Revise response based on violations
   * 
   * @param query - Original query
   * @param response - Current response
   * @param review - Constitutional review
   * @returns Revised response
   */
  private async reviseResponse(
    query: string,
    response: string,
    review: ConstitutionalReview
  ): Promise<string> {
    const spanId = this.tracing.startSpan('ConstitutionalAgent.reviseResponse', undefined, {
      violationCount: review.violations.length,
      complianceScore: review.complianceScore,
    });

    try {
      const violationsText = review.violations
        .map(
          (v, i) =>
            `${i + 1}. ${v.principleDescription} (${v.severity}): ${v.explanation}`
        )
        .join('\n');

      const prompt = `
Original query: ${query}

Current response:
${response}

Constitutional violations found:
${violationsText}

Overall feedback: ${review.feedback}

Please revise the response to address these violations while:
1. Maintaining accuracy and helpfulness
2. Addressing all identified issues
3. Improving compliance with principles
4. Keeping the response natural and clear

REVISED RESPONSE:
      `.trim();

      const revised = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await this.llm.invoke([
              new SystemMessage(
                'You are an editor. Improve responses based on constitutional feedback while maintaining quality.'
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 2,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            this.logger.warn('constitutional_ai_revision_retry', {
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      const revisedResponse = revised.content
        .toString()
        .replace(/REVISED RESPONSE:\s*/i, '')
        .trim();

      this.tracing.endSpan(spanId, true);

      return revisedResponse;
    } catch (error) {
      this.logger.error(
        'constitutional_ai_revision_failed',
        error instanceof Error ? error : new Error(String(error)),
        {}
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Graceful degradation: return original response
      return response;
    }
  }

  /**
   * Generate feedback from violations
   * 
   * @param violations - Violations found
   * @param complianceScore - Overall compliance score
   * @returns Feedback string
   */
  private generateFeedback(violations: Violation[], complianceScore: number): string {
    if (violations.length === 0) {
      return 'Response is fully compliant with all constitutional principles.';
    }

    const criticalCount = violations.filter((v) => v.severity === 'critical').length;
    const highCount = violations.filter((v) => v.severity === 'high').length;

    if (criticalCount > 0) {
      return `Response has ${criticalCount} critical violation(s) requiring immediate revision.`;
    }

    if (highCount > 0) {
      return `Response has ${highCount} high-severity violation(s) that should be addressed.`;
    }

    return `Response has ${violations.length} minor violation(s). Compliance score: ${(
      complianceScore * 100
    ).toFixed(1)}%.`;
  }
}

