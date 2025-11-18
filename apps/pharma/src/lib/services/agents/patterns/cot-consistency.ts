/**
 * Chain of Thought with Self-Consistency Pattern Implementation
 * 
 * Generates multiple reasoning paths and selects the most consistent answer.
 * Implements self-consistency methodology from research papers.
 * 
 * Features:
 * - Multiple parallel reasoning path generation (5-10 paths)
 * - Answer extraction from each path
 * - Consensus voting mechanism
 * - Confidence based on agreement rate
 * - Reasoning path aggregation
 * 
 * Architecture Principles:
 * - SOLID: Single responsibility, dependency injection, clean interfaces
 * - Type Safety: Full TypeScript with discriminated unions
 * - Observability: Structured logging, distributed tracing
 * - Resilience: Circuit breakers, retries, graceful degradation
 * - Performance: Parallel path generation
 * 
 * @module lib/services/agents/patterns/cot-consistency
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
 * Reasoning path from a single CoT execution
 */
export interface ReasoningPath {
  pathNumber: number;
  reasoning: string[];
  answer: string;
  confidence: number; // 0-1, path confidence
  timestamp: Date;
}

/**
 * Self-Consistency result
 */
export interface CoTSelfConsistencyResult {
  answer: string;
  confidence: number; // 0-1, based on consensus
  reasoningPaths: ReasoningPath[];
  consensusScore: number; // 0-1, agreement rate
  executionTime: number; // milliseconds
  metadata: {
    totalPaths: number;
    pathsUsedForConsensus: number;
    agreementRate: number; // Fraction of paths agreeing with final answer
    averagePathConfidence: number;
  };
}

/**
 * Self-Consistency configuration
 */
export interface CoTSelfConsistencyConfig {
  numPaths?: number; // Number of reasoning paths to generate (default: 5)
  temperature?: number; // Temperature for path generation (default: 0.7, for diversity)
  minConsensusThreshold?: number; // Minimum agreement rate to accept (default: 0.4)
  enableParallelGeneration?: boolean; // Generate paths in parallel (default: true)
  llmProvider?: 'openai' | 'anthropic';
  model?: string;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: Required<Omit<CoTSelfConsistencyConfig, 'minConsensusThreshold'>> & {
  minConsensusThreshold: number;
} = {
  numPaths: 5,
  temperature: 0.7, // Higher temperature for path diversity
  enableParallelGeneration: true,
  llmProvider: 'openai',
  model: 'gpt-4-turbo-preview',
  minConsensusThreshold: 0.4, // Accept if at least 40% agree
};

// ============================================================================
// COT SELF-CONSISTENCY CLASS
// ============================================================================

/**
 * Chain of Thought with Self-Consistency
 * 
 * Generates multiple reasoning paths and selects most consistent answer.
 */
export class CoTSelfConsistency {
  private config: typeof DEFAULT_CONFIG;
  private logger;
  private tracing;
  private circuitBreaker;
  private llm: ChatOpenAI | ChatAnthropic;

  constructor(config: CoTSelfConsistencyConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
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
   * Execute CoT with self-consistency
   * 
   * Generates multiple reasoning paths and finds consensus answer.
   * 
   * @param query - User query or problem
   * @param context - Additional context (optional)
   * @returns Self-consistency result with consensus answer
   */
  async execute(
    query: string,
    context: any[] = []
  ): Promise<CoTSelfConsistencyResult> {
    const executionStart = Date.now();
    const spanId = this.tracing.startSpan('CoTSelfConsistency.execute', undefined, {
      queryLength: query.length,
      numPaths: this.config.numPaths,
    });

    try {
      this.logger.info('cot_consistency_started', {
        queryPreview: query.substring(0, 100),
        numPaths: this.config.numPaths,
        parallelGeneration: this.config.enableParallelGeneration,
      });

      // Step 1: Generate multiple reasoning paths
      const reasoningPaths = await this.generatePaths(query, context);

      this.logger.info('cot_consistency_paths_generated', {
        pathsGenerated: reasoningPaths.length,
        pathsWithAnswers: reasoningPaths.filter((p) => p.answer).length,
      });

      // Step 2: Extract answers and find consensus
      const consensusResult = this.findConsensus(reasoningPaths);

      const executionTime = Date.now() - executionStart;
      const avgConfidence =
        reasoningPaths.reduce((sum, p) => sum + p.confidence, 0) /
        reasoningPaths.length;

      const result: CoTSelfConsistencyResult = {
        answer: consensusResult.answer,
        confidence: consensusResult.confidence,
        reasoningPaths,
        consensusScore: consensusResult.consensusScore,
        executionTime,
        metadata: {
          totalPaths: reasoningPaths.length,
          pathsUsedForConsensus: consensusResult.pathsUsedForConsensus,
          agreementRate: consensusResult.agreementRate,
          averagePathConfidence: avgConfidence,
        },
      };

      this.logger.infoWithMetrics('cot_consistency_executed', executionTime, {
        finalAnswer: consensusResult.answer.substring(0, 200),
        consensusScore: consensusResult.consensusScore,
        agreementRate: consensusResult.agreementRate,
        pathsUsed: consensusResult.pathsUsedForConsensus,
      });

      this.tracing.endSpan(spanId, true);

      return result;
    } catch (error) {
      const executionTime = Date.now() - executionStart;
      this.logger.error(
        'cot_consistency_execute_failed',
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
   * Generate multiple reasoning paths
   * 
   * Generates N parallel CoT reasoning paths with diversity via temperature.
   * 
   * @param query - User query
   * @param context - Additional context
   * @returns Array of reasoning paths
   */
  private async generatePaths(
    query: string,
    context: any[] = []
  ): Promise<ReasoningPath[]> {
    const spanId = this.tracing.startSpan(
      'CoTSelfConsistency.generatePaths',
      undefined,
      {
        numPaths: this.config.numPaths,
        parallelGeneration: this.config.enableParallelGeneration,
      }
    );

    try {
      const contextText =
        context.length > 0
          ? `\n\nContext:\n${JSON.stringify(context, null, 2)}`
          : '';

      const prompt = `
Solve this step-by-step, showing all your reasoning:

${query}${contextText}

Format your response as:
REASONING:
Step 1: [your reasoning step]
Step 2: [your reasoning step]
...
Step N: [your reasoning step]

ANSWER: [Your final answer]

CONFIDENCE: [0-1 score indicating your confidence]
      `.trim();

      // Generate all paths
      const pathPromises = Array(this.config.numPaths)
        .fill(null)
        .map((_, index) =>
          this.generateSinglePath(prompt, index + 1)
        );

      const paths = this.config.enableParallelGeneration
        ? await Promise.all(pathPromises)
        : await this.sequentialGeneration(pathPromises);

      this.tracing.endSpan(spanId, true);

      return paths.filter((p) => p !== null) as ReasoningPath[];
    } catch (error) {
      this.logger.error(
        'cot_consistency_path_generation_failed',
        error instanceof Error ? error : new Error(String(error)),
        {}
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Graceful degradation: return empty array
      return [];
    }
  }

  /**
   * Generate a single reasoning path
   * 
   * @param prompt - Formatted prompt
   * @param pathNumber - Path number (for tracking)
   * @returns Reasoning path or null on failure
   */
  private async generateSinglePath(
    prompt: string,
    pathNumber: number
  ): Promise<ReasoningPath | null> {
    try {
      const response = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await this.llm.invoke([
              new SystemMessage(
                'You are a reasoning agent. Think step by step and provide clear reasoning.'
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 2,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            this.logger.warn('cot_consistency_path_retry', {
              pathNumber,
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      const content = response.content.toString();

      // Parse reasoning steps
      const reasoningMatch = content.match(/REASONING:([\s\S]*?)(?:ANSWER:|CONFIDENCE:|$)/i);
      const answerMatch = content.match(/ANSWER:\s*(.+?)(?:\n|CONFIDENCE:|$)/is);
      const confidenceMatch = content.match(/CONFIDENCE:\s*([\d.]+)/i);

      const reasoning = reasoningMatch
        ? reasoningMatch[1]
            .split('\n')
            .filter((line) => line.trim().match(/^Step\s+\d+:/i))
            .map((line) => line.replace(/^Step\s+\d+:\s*/i, '').trim())
            .filter(Boolean)
        : [];

      const answer = answerMatch
        ? answerMatch[1].trim()
        : content.split('ANSWER:')[1]?.trim() || content;

      const confidence = confidenceMatch
        ? Math.min(1.0, Math.max(0.0, parseFloat(confidenceMatch[1])))
        : 0.7; // Default confidence

      return {
        pathNumber,
        reasoning,
        answer,
        confidence,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.warn('cot_consistency_single_path_failed', {
        pathNumber,
        error: error instanceof Error ? error.message : String(error),
      });

      return null;
    }
  }

  /**
   * Find consensus answer from multiple paths
   * 
   * Uses voting mechanism to find most frequent answer.
   * 
   * @param paths - Reasoning paths
   * @returns Consensus result
   */
  private findConsensus(paths: ReasoningPath[]): {
    answer: string;
    confidence: number;
    consensusScore: number;
    pathsUsedForConsensus: number;
    agreementRate: number;
  } {
    if (paths.length === 0) {
      return {
        answer: 'Unable to generate reasoning paths',
        confidence: 0.0,
        consensusScore: 0.0,
        pathsUsedForConsensus: 0,
        agreementRate: 0.0,
      };
    }

    if (paths.length === 1) {
      return {
        answer: paths[0].answer,
        confidence: paths[0].confidence,
        consensusScore: 1.0,
        pathsUsedForConsensus: 1,
        agreementRate: 1.0,
      };
    }

    // Normalize answers for comparison
    const normalizedAnswers = new Map<string, {
      original: string;
      count: number;
      confidenceSum: number;
      paths: ReasoningPath[];
    }>();

    for (const path of paths) {
      const normalized = this.normalizeAnswer(path.answer);
      const existing = normalizedAnswers.get(normalized);

      if (existing) {
        existing.count++;
        existing.confidenceSum += path.confidence;
        existing.paths.push(path);
      } else {
        normalizedAnswers.set(normalized, {
          original: path.answer,
          count: 1,
          confidenceSum: path.confidence,
          paths: [path],
        });
      }
    }

    // Find answer with highest frequency
    let maxCount = 0;
    let bestAnswer = paths[0].answer; // Fallback
    let bestNormalized = '';
    let totalConfidence = 0;
    let pathsUsed = 0;

    for (const [normalized, data] of normalizedAnswers.entries()) {
      if (data.count > maxCount) {
        maxCount = data.count;
        bestAnswer = data.original; // Use first original answer as representative
        bestNormalized = normalized;
        totalConfidence = data.confidenceSum;
        pathsUsed = data.count;
      }
    }

    // Calculate consensus metrics
    const consensusScore = maxCount / paths.length; // Fraction of paths agreeing
    const agreementRate = consensusScore;
    const avgConfidence = totalConfidence / maxCount;

    // Check if consensus meets threshold
    if (consensusScore < this.config.minConsensusThreshold) {
      this.logger.warn('cot_consistency_low_consensus', {
        consensusScore,
        minThreshold: this.config.minConsensusThreshold,
        bestAnswerCount: maxCount,
        totalPaths: paths.length,
      });
    }

    // Aggregate reasoning from all agreeing paths
    const agreeingPaths = normalizedAnswers.get(bestNormalized)?.paths || [];
    const aggregatedReasoning = this.aggregateReasoning(agreeingPaths);

    this.logger.debug('cot_consistency_consensus_found', {
      consensusScore,
      agreementRate,
      pathsUsed,
      totalPaths: paths.length,
      answerPreview: bestAnswer.substring(0, 200),
    });

    return {
      answer: bestAnswer,
      confidence: Math.min(1.0, avgConfidence * consensusScore), // Weight confidence by consensus
      consensusScore,
      pathsUsedForConsensus: pathsUsed,
      agreementRate,
    };
  }

  /**
   * Normalize answer for comparison
   * 
   * Removes punctuation, whitespace, case differences.
   * 
   * @param answer - Answer to normalize
   * @returns Normalized answer
   */
  private normalizeAnswer(answer: string): string {
    return answer
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 200); // Limit length for comparison
  }

  /**
   * Aggregate reasoning from multiple paths
   * 
   * Combines reasoning steps from agreeing paths.
   * 
   * @param paths - Agreeing paths
   * @returns Aggregated reasoning steps
   */
  private aggregateReasoning(paths: ReasoningPath[]): string[] {
    if (paths.length === 0) {
      return [];
    }

    if (paths.length === 1) {
      return paths[0].reasoning;
    }

    // Combine all reasoning steps, deduplicate similar ones
    const allSteps: string[] = [];
    const seen = new Set<string>();

    for (const path of paths) {
      for (const step of path.reasoning) {
        const normalizedStep = step.toLowerCase().trim().substring(0, 100);
        if (!seen.has(normalizedStep)) {
          seen.add(normalizedStep);
          allSteps.push(step);
        }
      }
    }

    return allSteps;
  }

  /**
   * Generate paths sequentially (for testing or when parallel disabled)
   * 
   * @param promises - Array of path generation promises
   * @returns Paths in order
   */
  private async sequentialGeneration<T>(
    promises: Promise<T>[]
  ): Promise<T[]> {
    const results: T[] = [];
    for (const promise of promises) {
      results.push(await promise);
    }
    return results;
  }

  /**
   * Get configuration
   * 
   * @returns Current configuration
   */
  public getConfig(): CoTSelfConsistencyConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   * 
   * @param updates - Configuration updates
   */
  public updateConfig(updates: Partial<CoTSelfConsistencyConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };

    // Reinitialize LLM if provider/model/temperature changed
    if (
      updates.llmProvider ||
      updates.model ||
      updates.temperature !== undefined
    ) {
      const provider = updates.llmProvider || this.config.llmProvider;
      const model = updates.model || this.config.model;
      const temperature = updates.temperature ?? this.config.temperature;

      if (provider === 'anthropic') {
        this.llm = new ChatAnthropic({
          modelName: model,
          temperature,
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        });
      } else {
        this.llm = new ChatOpenAI({
          modelName: model,
          temperature,
          openAIApiKey: process.env.OPENAI_API_KEY,
        });
      }
    }

    this.logger.info('cot_consistency_config_updated', {
      updates: Object.keys(updates),
    });
  }
}

