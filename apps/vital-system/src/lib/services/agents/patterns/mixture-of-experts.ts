/**
 * Mixture of Experts (MoE) Pattern Implementation
 * 
 * Routes queries to specialized experts based on domain and query characteristics.
 * Dynamically selects experts and synthesizes responses for comprehensive answers.
 * 
 * Features:
 * - Dynamic expert routing based on query analysis
 * - Multi-expert query handling
 * - Expert response synthesis
 * - Confidence scoring per expert
 * - Consensus building
 * 
 * Architecture Principles:
 * - SOLID: Single responsibility, dependency injection, clean interfaces
 * - Type Safety: Full TypeScript with discriminated unions
 * - Observability: Structured logging, distributed tracing
 * - Resilience: Circuit breakers, retries, graceful degradation
 * - Performance: Parallel expert execution where possible
 * 
 * @module lib/services/agents/patterns/mixture-of-experts
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
 * Expert definition
 */
export interface Expert {
  id: string;
  name: string;
  domain: string; // Primary domain (e.g., 'clinical', 'regulatory', 'technical')
  expertise: string[]; // Areas of expertise
  llm: ChatOpenAI | ChatAnthropic;
  metadata?: Record<string, any>;
}

/**
 * Expert selection result
 */
export interface ExpertSelection {
  experts: Expert[];
  reasoning: string;
  confidence: number; // 0-1
}

/**
 * Expert response
 */
export interface ExpertResponse {
  expertId: string;
  expertName: string;
  domain: string;
  content: string;
  confidence: number; // Expert's confidence (0-1)
  reasoning?: string;
  timestamp: Date;
}

/**
 * Mixture of Experts result
 */
export interface MixtureOfExpertsResult {
  answer: string;
  expertsUsed: string[]; // Expert names
  expertResponses: ExpertResponse[];
  synthesis: string;
  consensusScore: number; // 0-1, higher = more agreement
  executionTime: number; // milliseconds
  metadata: {
    expertCount: number;
    synthesisMethod: 'single' | 'multi';
    averageConfidence: number;
  };
}

/**
 * Mixture of Experts configuration
 */
export interface MixtureOfExpertsConfig {
  experts: Expert[];
  router?: {
    llmProvider?: 'openai' | 'anthropic';
    model?: string;
    temperature?: number;
  };
  synthesis?: {
    enableForMultiExpert?: boolean; // Synthesize when multiple experts (default: true)
    synthesisModel?: string;
  };
  enableParallelExecution?: boolean; // Execute experts in parallel (default: true)
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_ROUTER_CONFIG = {
  llmProvider: 'openai' as const,
  model: 'gpt-4-turbo-preview',
  temperature: 0.3, // Low temperature for routing decisions
};

// ============================================================================
// MIXTURE OF EXPERTS CLASS
// ============================================================================

/**
 * Mixture of Experts System
 * 
 * Routes queries to appropriate experts and synthesizes responses.
 */
export class MixtureOfExperts {
  private experts: Expert[];
  private router: ChatOpenAI | ChatAnthropic;
  private synthesisModel?: string;
  private enableSynthesis: boolean;
  private enableParallelExecution: boolean;
  private logger;
  private tracing;
  private circuitBreaker;

  constructor(config: MixtureOfExpertsConfig) {
    if (!config.experts || config.experts.length === 0) {
      throw new Error('At least one expert is required for Mixture of Experts');
    }

    this.experts = config.experts;
    this.enableSynthesis = config.synthesis?.enableForMultiExpert ?? true;
    this.enableParallelExecution = config.enableParallelExecution ?? true;
    this.synthesisModel = config.synthesis?.synthesisModel;

    this.logger = createLogger();
    this.tracing = getTracingService();
    this.circuitBreaker = getSupabaseCircuitBreaker();

    // Initialize router LLM
    const routerConfig = {
      ...DEFAULT_ROUTER_CONFIG,
      ...config.router,
    };

    if (routerConfig.llmProvider === 'anthropic') {
      this.router = new ChatAnthropic({
        modelName: routerConfig.model,
        temperature: routerConfig.temperature,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      });
    } else {
      this.router = new ChatOpenAI({
        modelName: routerConfig.model,
        temperature: routerConfig.temperature,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Route query to appropriate expert(s)
   * 
   * Uses LLM to analyze query and select experts.
   * 
   * @param query - User query
   * @returns Expert selection result
   */
  async route(query: string): Promise<ExpertSelection> {
    const spanId = this.tracing.startSpan('MixtureOfExperts.route', undefined, {
      queryLength: query.length,
      expertCount: this.experts.length,
    });

    try {
      const expertList = this.experts
        .map(
          (e) =>
            `- ${e.name} (${e.domain}): ${e.expertise.join(', ')}`
        )
        .join('\n');

      const prompt = `
Given this query: "${query}"

And these available experts:
${expertList}

Which expert(s) should handle this query? 
- Select multiple experts if the query requires expertise from different domains
- Select a single expert if the query fits clearly within one domain

Respond with expert IDs, comma-separated:
EXPERTS: [expert_id1, expert_id2, ...]
REASONING: [Why these experts are appropriate]
CONFIDENCE: [0-1 confidence in routing decision]
      `.trim();

      const response = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await this.router.invoke([
              new SystemMessage(
                'You are a router. Select experts based on query domain and complexity.'
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 2,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            this.logger.warn('mixture_of_experts_route_retry', {
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      const content = response.content.toString();

      // Parse expert IDs
      const expertsMatch = content.match(/EXPERTS:\s*\[(.+?)\]/i);
      const reasoningMatch = content.match(/REASONING:\s*(.+?)(?:\n|CONFIDENCE:|$)/s);
      const confidenceMatch = content.match(/CONFIDENCE:\s*([\d.]+)/i);

      let selectedExperts: Expert[] = [];

      if (expertsMatch) {
        const expertIds = expertsMatch[1]
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean);

        selectedExperts = this.experts.filter((e) => expertIds.includes(e.id));
      }

      // Fallback: select first expert if routing fails
      if (selectedExperts.length === 0) {
        this.logger.warn('mixture_of_experts_route_fallback', {
          selectedExperts: [],
          defaultingTo: this.experts[0].id,
        });
        selectedExperts = [this.experts[0]];
      }

      const reasoning = reasoningMatch?.[1].trim() || 'Expert selection completed';
      const confidence = confidenceMatch
        ? Math.min(1.0, Math.max(0.0, parseFloat(confidenceMatch[1])))
        : 0.7;

      this.logger.info('mixture_of_experts_routed', {
        selectedExpertIds: selectedExperts.map((e) => e.id),
        confidence,
      });

      this.tracing.endSpan(spanId, true);

      return {
        experts: selectedExperts,
        reasoning,
        confidence,
      };
    } catch (error) {
      this.logger.error(
        'mixture_of_experts_route_failed',
        error instanceof Error ? error : new Error(String(error)),
        {}
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Graceful degradation: return first expert
      return {
        experts: [this.experts[0]],
        reasoning: 'Routing failed, using default expert',
        confidence: 0.5,
      };
    }
  }

  /**
   * Execute query with dynamic expert selection
   * 
   * @param query - User query
   * @param context - Additional context (optional)
   * @returns Complete MoE result
   */
  async execute(
    query: string,
    context: any[] = []
  ): Promise<MixtureOfExpertsResult> {
    const executionStart = Date.now();
    const spanId = this.tracing.startSpan('MixtureOfExperts.execute', undefined, {
      queryLength: query.length,
      expertCount: this.experts.length,
    });

    try {
      // Step 1: Route to experts
      const selection = await this.route(query);
      const selectedExperts = selection.experts;

      this.logger.info('mixture_of_experts_execution_started', {
        selectedExpertCount: selectedExperts.length,
        expertIds: selectedExperts.map((e) => e.id),
      });

      // Step 2: Get responses from each expert
      const expertResponses: ExpertResponse[] = [];

      const queryPromises = selectedExperts.map(async (expert) => {
        return this.queryExpert(expert, query, context);
      });

      const responses = this.enableParallelExecution
        ? await Promise.all(queryPromises)
        : await this.sequentialQuery(queryPromises);

      expertResponses.push(...responses);

      // Step 3: Synthesize if multiple experts
      let finalAnswer: string;
      let synthesis = '';

      if (selectedExperts.length === 1) {
        finalAnswer = expertResponses[0].content;
        this.logger.debug('mixture_of_experts_single_expert', {
          expertId: selectedExperts[0].id,
        });
      } else {
        // Multiple experts: synthesize
        if (this.enableSynthesis) {
          synthesis = await this.synthesizeResponses(query, expertResponses);
          finalAnswer = synthesis;
          this.logger.info('mixture_of_experts_synthesized', {
            expertCount: selectedExperts.length,
            synthesisLength: synthesis.length,
          });
        } else {
          // No synthesis: combine responses
          finalAnswer = expertResponses
            .map(
              (r) =>
                `**${r.expertName} (${r.domain})**:\n${r.content}`
            )
            .join('\n\n---\n\n');
        }
      }

      // Calculate consensus score (based on response similarity)
      const consensusScore = await this.calculateConsensus(expertResponses);

      const executionTime = Date.now() - executionStart;
      const avgConfidence =
        expertResponses.reduce((sum, r) => sum + r.confidence, 0) /
        expertResponses.length;

      const result: MixtureOfExpertsResult = {
        answer: finalAnswer,
        expertsUsed: selectedExperts.map((e) => e.name),
        expertResponses,
        synthesis,
        consensusScore,
        executionTime,
        metadata: {
          expertCount: selectedExperts.length,
          synthesisMethod:
            selectedExperts.length === 1 ? 'single' : 'multi',
          averageConfidence: avgConfidence,
        },
      };

      this.logger.infoWithMetrics('mixture_of_experts_executed', executionTime, {
        expertCount: selectedExperts.length,
        consensusScore,
        averageConfidence: avgConfidence,
      });

      this.tracing.endSpan(spanId, true);

      return result;
    } catch (error) {
      const executionTime = Date.now() - executionStart;
      this.logger.error(
        'mixture_of_experts_execute_failed',
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
   * Query a single expert
   * 
   * @param expert - Expert to query
   * @param query - User query
   * @param context - Additional context
   * @returns Expert response
   */
  private async queryExpert(
    expert: Expert,
    query: string,
    context: any[] = []
  ): Promise<ExpertResponse> {
    const spanId = this.tracing.startSpan('MixtureOfExperts.queryExpert', undefined, {
      expertId: expert.id,
      queryLength: query.length,
    });

    try {
      const contextText =
        context.length > 0
          ? `\n\nContext:\n${JSON.stringify(context, null, 2)}`
          : '';

      const prompt = `
You are ${expert.name}, an expert in ${expert.domain}.
Your specializations include: ${expert.expertise.join(', ')}.

Please answer this query from your expert perspective:
${query}${contextText}

Provide your expert response with confidence (0-1):
RESPONSE: [Your answer]
CONFIDENCE: [Your confidence level]
REASONING: [Brief reasoning if needed]
      `.trim();

      const response = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await expert.llm.invoke([
              new SystemMessage(
                `You are ${expert.name}, a specialist in ${expert.domain}. Provide expert-level responses.`
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 2,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            this.logger.warn('mixture_of_experts_expert_retry', {
              expertId: expert.id,
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      const content = response.content.toString();

      // Parse response
      const responseMatch = content.match(/RESPONSE:\s*(.+?)(?:\n|CONFIDENCE:|$)/s);
      const confidenceMatch = content.match(/CONFIDENCE:\s*([\d.]+)/i);
      const reasoningMatch = content.match(/REASONING:\s*(.+?)$/s);

      const expertResponse = responseMatch?.[1].trim() || content;
      const confidence = confidenceMatch
        ? Math.min(1.0, Math.max(0.0, parseFloat(confidenceMatch[1])))
        : 0.8;
      const reasoning = reasoningMatch?.[1].trim();

      const result: ExpertResponse = {
        expertId: expert.id,
        expertName: expert.name,
        domain: expert.domain,
        content: expertResponse,
        confidence,
        reasoning,
        timestamp: new Date(),
      };

      this.tracing.endSpan(spanId, true);

      return result;
    } catch (error) {
      this.logger.error(
        'mixture_of_experts_expert_query_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          expertId: expert.id,
        }
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Graceful degradation: return default response
      return {
        expertId: expert.id,
        expertName: expert.name,
        domain: expert.domain,
        content: `I encountered an error while processing your query.`,
        confidence: 0.3,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Synthesize multiple expert responses
   * 
   * @param query - Original query
   * @param responses - Expert responses
   * @returns Synthesized response
   */
  private async synthesizeResponses(
    query: string,
    responses: ExpertResponse[]
  ): Promise<string> {
    const spanId = this.tracing.startSpan(
      'MixtureOfExperts.synthesizeResponses',
      undefined,
      {
        responseCount: responses.length,
      }
    );

    try {
      const responsesText = responses
        .map(
          (r) => `
**${r.expertName} (${r.domain})** (Confidence: ${(r.confidence * 100).toFixed(0)}%):
${r.content}
      `.trim()
        )
        .join('\n\n---\n\n');

      const prompt = `
Synthesize these expert responses into a comprehensive, unified answer:

Query: ${query}

Expert Responses:
${responsesText}

Provide a unified response that:
1. Combines insights from all experts
2. Resolves any contradictions
3. Highlights consensus and disagreements where appropriate
4. Provides a clear, actionable answer
5. Maintains clarity and structure

SYNTHESIS:
      `.trim();

      // Use synthesis model if configured, otherwise use router
      const synthesisLLM = this.synthesisModel
        ? new ChatOpenAI({
            modelName: this.synthesisModel,
            temperature: 0.5,
            openAIApiKey: process.env.OPENAI_API_KEY,
          })
        : this.router;

      const response = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await synthesisLLM.invoke([
              new SystemMessage(
                'You are a synthesizer. Create coherent, unified answers from multiple expert perspectives.'
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 2,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            this.logger.warn('mixture_of_experts_synthesis_retry', {
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      const synthesis = response.content
        .toString()
        .replace(/SYNTHESIS:\s*/i, '')
        .trim();

      this.tracing.endSpan(spanId, true);

      return synthesis;
    } catch (error) {
      this.logger.error(
        'mixture_of_experts_synthesis_failed',
        error instanceof Error ? error : new Error(String(error)),
        {}
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Graceful degradation: simple concatenation
      return responses
        .map(
          (r) =>
            `**${r.expertName}**:\n${r.content}`
        )
        .join('\n\n');
    }
  }

  /**
   * Calculate consensus score between expert responses
   * 
   * Uses LLM to assess agreement level.
   * 
   * @param responses - Expert responses
   * @returns Consensus score (0-1)
   */
  private async calculateConsensus(
    responses: ExpertResponse[]
  ): Promise<number> {
    if (responses.length <= 1) {
      return 1.0; // Perfect consensus with single response
    }

    try {
      const responsesText = responses
        .map((r) => `**${r.expertName}**: ${r.content.substring(0, 300)}...`)
        .join('\n\n');

      const prompt = `
Assess the consensus between these expert responses:

${responsesText}

Provide a consensus score (0-1) indicating how much the experts agree:
- 1.0 = Complete agreement
- 0.7-0.9 = General agreement with minor differences
- 0.4-0.6 = Partial agreement with notable differences
- 0.0-0.3 = Significant disagreement

CONSENSUS_SCORE: [0-1]
      `.trim();

      const response = await this.router.invoke([
        new SystemMessage('You are a consensus evaluator. Assess expert agreement objectively.'),
        new HumanMessage(prompt),
      ]);

      const content = response.content.toString();
      const scoreMatch = content.match(/CONSENSUS_SCORE:\s*([\d.]+)/i);

      return scoreMatch
        ? Math.min(1.0, Math.max(0.0, parseFloat(scoreMatch[1])))
        : 0.7; // Default consensus
    } catch (error) {
      this.logger.warn('mixture_of_experts_consensus_calculation_failed', {
        error: error instanceof Error ? error.message : String(error),
      });

      return 0.7; // Default consensus on error
    }
  }

  /**
   * Query experts sequentially (for testing or when parallel disabled)
   * 
   * @param promises - Array of query promises
   * @returns Responses in order
   */
  private async sequentialQuery<T>(promises: Promise<T>[]): Promise<T[]> {
    const results: T[] = [];
    for (const promise of promises) {
      results.push(await promise);
    }
    return results;
  }

  /**
   * Add an expert
   * 
   * @param expert - Expert to add
   */
  public addExpert(expert: Expert): void {
    if (this.experts.find((e) => e.id === expert.id)) {
      throw new Error(`Expert with ID ${expert.id} already exists`);
    }

    this.experts.push(expert);
    this.logger.info('mixture_of_experts_expert_added', {
      expertId: expert.id,
      expertName: expert.name,
      domain: expert.domain,
    });
  }

  /**
   * Get all experts
   * 
   * @returns Array of experts
   */
  public getExperts(): Expert[] {
    return [...this.experts];
  }
}

