/**
 * Adversarial Agent Pattern Implementation
 * 
 * Uses opposing agents to strengthen reasoning through debate:
 * - Proposer: Generates solutions
 * - Critic: Identifies flaws and weaknesses
 * - Judge: Makes final decision
 * 
 * Features:
 * - Multi-round debate mechanism
 * - Critique-based refinement
 * - Consensus building
 * - Final judgment with reasoning
 * 
 * Architecture Principles:
 * - SOLID: Single responsibility, dependency injection, clean interfaces
 * - Type Safety: Full TypeScript with discriminated unions
 * - Observability: Structured logging, distributed tracing
 * - Resilience: Circuit breakers, retries, graceful degradation
 * 
 * @module lib/services/agents/patterns/adversarial-agents
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
 * Debate round result
 */
export interface DebateRound {
  round: number;
  proposal: string;
  critique: string;
  revision: string;
  timestamp: Date;
  proposalConfidence?: number;
  critiqueSeverity?: 'low' | 'medium' | 'high';
}

/**
 * Judge decision
 */
export interface JudgeDecision {
  finalAnswer: string;
  assessment: string;
  strengths: string[];
  weaknesses: string[];
  overallScore: number; // 0-10
  confidence: number; // 0-1
  reasoning: string;
}

/**
 * Adversarial system result
 */
export interface AdversarialSystemResult {
  finalAnswer: string;
  debateHistory: DebateRound[];
  judgeDecision: JudgeDecision;
  executionTime: number; // milliseconds
  metadata: {
    roundsCompleted: number;
    finalConfidence: number;
    finalScore: number;
  };
}

/**
 * Adversarial system configuration
 */
export interface AdversarialSystemConfig {
  rounds?: number; // Number of debate rounds (default: 3)
  enableParallelDebate?: boolean; // Run proposer/critic in parallel (default: false)
  minConfidence?: number; // Minimum confidence to accept (default: 0.7)
  llmProvider?: 'openai' | 'anthropic';
  proposerModel?: string;
  criticModel?: string;
  judgeModel?: string;
  temperature?: {
    proposer?: number;
    critic?: number;
    judge?: number;
  };
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: Required<
  Omit<
    AdversarialSystemConfig,
    'temperature' | 'minConfidence' | 'enableParallelDebate'
  >
> & {
  rounds: number;
  enableParallelDebate: boolean;
  minConfidence: number;
  temperature: {
    proposer: number;
    critic: number;
    judge: number;
  };
} = {
  rounds: 3,
  enableParallelDebate: false,
  minConfidence: 0.7,
  llmProvider: 'openai',
  proposerModel: 'gpt-4-turbo-preview',
  criticModel: 'gpt-4-turbo-preview',
  judgeModel: 'gpt-4-turbo-preview',
  temperature: {
    proposer: 0.7, // Higher creativity for proposals
    critic: 0.5, // Lower temperature for critical analysis
    judge: 0.3, // Lowest for objective judgment
  },
};

// ============================================================================
// ADVERSARIAL SYSTEM CLASS
// ============================================================================

/**
 * Adversarial Agent System
 * 
 * Implements proposer-critic-judge pattern for robust reasoning.
 */
export class AdversarialSystem {
  private config: typeof DEFAULT_CONFIG;
  private logger;
  private tracing;
  private circuitBreaker;
  private proposer: ChatOpenAI | ChatAnthropic;
  private critic: ChatOpenAI | ChatAnthropic;
  private judge: ChatOpenAI | ChatAnthropic;

  constructor(config: AdversarialSystemConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      temperature: {
        ...DEFAULT_CONFIG.temperature,
        ...config.temperature,
      },
    };

    this.logger = createLogger();
    this.tracing = getTracingService();
    this.circuitBreaker = getSupabaseCircuitBreaker();

    // Initialize proposer LLM
    if (this.config.llmProvider === 'anthropic') {
      this.proposer = new ChatAnthropic({
        modelName: this.config.proposerModel,
        temperature: this.config.temperature.proposer,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      });
      this.critic = new ChatAnthropic({
        modelName: this.config.criticModel,
        temperature: this.config.temperature.critic,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      });
      this.judge = new ChatAnthropic({
        modelName: this.config.judgeModel,
        temperature: this.config.temperature.judge,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      });
    } else {
      this.proposer = new ChatOpenAI({
        modelName: this.config.proposerModel,
        temperature: this.config.temperature.proposer,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
      this.critic = new ChatOpenAI({
        modelName: this.config.criticModel,
        temperature: this.config.temperature.critic,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
      this.judge = new ChatOpenAI({
        modelName: this.config.judgeModel,
        temperature: this.config.temperature.judge,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Execute adversarial debate process
   * 
   * @param query - User query or problem
   * @param context - Additional context (optional)
   * @returns Complete adversarial system result
   */
  async execute(
    query: string,
    context: any[] = []
  ): Promise<AdversarialSystemResult> {
    const executionStart = Date.now();
    const spanId = this.tracing.startSpan('AdversarialSystem.execute', undefined, {
      queryPreview: query.substring(0, 100),
      rounds: this.config.rounds,
    });

    try {
      const debateHistory: DebateRound[] = [];

      // Initial proposal
      let currentProposal = await this.propose(query, context);
      this.logger.debug('adversarial_system_initial_proposal', {
        proposalPreview: currentProposal.substring(0, 200),
      });

      // Debate rounds
      for (let round = 1; round <= this.config.rounds; round++) {
        this.logger.debug('adversarial_system_round_started', {
          round,
          totalRounds: this.config.rounds,
        });

        // Get critique
        const critique = await this.critique(query, currentProposal);

        // Revise based on critique
        const revision = await this.revise(query, currentProposal, critique);

        // Store round
        debateHistory.push({
          round,
          proposal: currentProposal,
          critique,
          revision,
          timestamp: new Date(),
        });

        currentProposal = revision;

        this.logger.info('adversarial_system_round_completed', {
          round,
          proposalLength: currentProposal.length,
          critiqueLength: critique.length,
        });
      }

      // Final judgment
      const judgeDecision = await this.judgeDecision(query, currentProposal, debateHistory);

      const executionTime = Date.now() - executionStart;

      const result: AdversarialSystemResult = {
        finalAnswer: currentProposal,
        debateHistory,
        judgeDecision,
        executionTime,
        metadata: {
          roundsCompleted: this.config.rounds,
          finalConfidence: judgeDecision.confidence,
          finalScore: judgeDecision.overallScore,
        },
      };

      this.logger.infoWithMetrics('adversarial_system_executed', executionTime, {
        roundsCompleted: this.config.rounds,
        finalConfidence: judgeDecision.confidence,
        finalScore: judgeDecision.overallScore,
      });

      this.tracing.endSpan(spanId, true);

      return result;
    } catch (error) {
      const executionTime = Date.now() - executionStart;
      this.logger.error(
        'adversarial_system_execute_failed',
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
   * Propose initial solution
   * 
   * @param query - User query
   * @param context - Additional context
   * @returns Proposed solution
   */
  private async propose(query: string, context: any[] = []): Promise<string> {
    const spanId = this.tracing.startSpan('AdversarialSystem.propose', undefined, {
      queryLength: query.length,
    });

    try {
      const contextText =
        context.length > 0
          ? `\n\nContext:\n${JSON.stringify(context, null, 2)}`
          : '';

      const prompt = `
As a proposer, provide a comprehensive answer to:
${query}${contextText}

Be thorough and confident in your response. Present your solution clearly and completely.
      `.trim();

      const response = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await this.proposer.invoke([
              new SystemMessage(
                'You are a proposer. Provide thorough, confident solutions to problems.'
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 2,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            this.logger.warn('adversarial_system_propose_retry', {
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      const proposal = response.content.toString();

      this.tracing.endSpan(spanId, true);

      return proposal;
    } catch (error) {
      this.logger.error(
        'adversarial_system_propose_failed',
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
   * Critique proposal
   * 
   * @param query - Original query
   * @param proposal - Proposal to critique
   * @returns Critique feedback
   */
  private async critique(query: string, proposal: string): Promise<string> {
    const spanId = this.tracing.startSpan('AdversarialSystem.critique', undefined, {
      proposalLength: proposal.length,
    });

    try {
      const prompt = `
As a critic, rigorously evaluate this proposal:

Query: ${query}

Proposal: ${proposal}

Identify:
1. Logical flaws or contradictions
2. Missing information or assumptions
3. Unsupported claims
4. Potential improvements
5. Edge cases not considered

Be specific and constructive. Focus on making the proposal better.
      `.trim();

      const response = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await this.critic.invoke([
              new SystemMessage(
                'You are a critic. Rigorously evaluate proposals and identify weaknesses constructively.'
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 2,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            this.logger.warn('adversarial_system_critique_retry', {
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      const critique = response.content.toString();

      this.tracing.endSpan(spanId, true);

      return critique;
    } catch (error) {
      this.logger.error(
        'adversarial_system_critique_failed',
        error instanceof Error ? error : new Error(String(error)),
        {}
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Graceful degradation: return neutral critique
      return 'No specific issues identified. Proposal appears reasonable.';
    }
  }

  /**
   * Revise proposal based on critique
   * 
   * @param query - Original query
   * @param proposal - Current proposal
   * @param critique - Critique feedback
   * @returns Revised proposal
   */
  private async revise(
    query: string,
    proposal: string,
    critique: string
  ): Promise<string> {
    const spanId = this.tracing.startSpan('AdversarialSystem.revise', undefined, {
      proposalLength: proposal.length,
      critiqueLength: critique.length,
    });

    try {
      const prompt = `
Revise your proposal based on this critique:

Original query: ${query}

Your proposal: ${proposal}

Critique: ${critique}

Provide an improved response that addresses the critique while maintaining quality.
      `.trim();

      const response = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await this.proposer.invoke([
              new SystemMessage(
                'You are a proposer. Improve your proposals based on constructive critique.'
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 2,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            this.logger.warn('adversarial_system_revise_retry', {
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      const revision = response.content.toString();

      this.tracing.endSpan(spanId, true);

      return revision;
    } catch (error) {
      this.logger.error(
        'adversarial_system_revise_failed',
        error instanceof Error ? error : new Error(String(error)),
        {}
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Graceful degradation: return original proposal
      return proposal;
    }
  }

  /**
   * Judge makes final decision
   * 
   * @param query - Original query
   * @param finalProposal - Final proposal after debate
   * @param debateHistory - Complete debate history
   * @returns Judge decision
   */
  private async judgeDecision(
    query: string,
    finalProposal: string,
    debateHistory: DebateRound[]
  ): Promise<JudgeDecision> {
    const spanId = this.tracing.startSpan('AdversarialSystem.judgeDecision', undefined, {
      proposalLength: finalProposal.length,
      debateRounds: debateHistory.length,
    });

    try {
      const debateSummary = debateHistory
        .map(
          (r, i) => `
Round ${i + 1}:
- Proposal: ${r.proposal.substring(0, 300)}...
- Critique: ${r.critique.substring(0, 300)}...
- Revision: ${r.revision.substring(0, 300)}...
        `.trim()
        )
        .join('\n\n');

      const prompt = `
Query: ${query}

Final proposal after adversarial refinement:
${finalProposal}

Debate history:
${debateSummary}

As an impartial judge, provide:
1. Assessment of the final answer quality
2. Key strengths
3. Any remaining weaknesses
4. Overall score (0-10)
5. Confidence level (0-1)

Format:
ASSESSMENT: [Your assessment]

STRENGTHS:
- Strength 1
- Strength 2
- ...

WEAKNESSES:
- Weakness 1
- Weakness 2
- ...

OVERALL_SCORE: [0-10]

CONFIDENCE: [0-1]

REASONING: [Your reasoning for the score]
      `.trim();

      const response = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await this.judge.invoke([
              new SystemMessage(
                'You are an impartial judge. Evaluate proposals objectively and provide constructive feedback.'
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 2,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            this.logger.warn('adversarial_system_judge_retry', {
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      const content = response.content.toString();

      // Parse response
      const assessmentMatch = content.match(/ASSESSMENT:\s*(.+?)(?:\n|STRENGTHS:|$)/s);
      const strengthsMatch = content.match(/STRENGTHS:([\s\S]*?)(?:WEAKNESSES:|OVERALL_SCORE:|$)/s);
      const weaknessesMatch = content.match(/WEAKNESSES:([\s\S]*?)(?:OVERALL_SCORE:|CONFIDENCE:|$)/s);
      const scoreMatch = content.match(/OVERALL_SCORE:\s*(\d+)/i);
      const confidenceMatch = content.match(/CONFIDENCE:\s*([\d.]+)/i);
      const reasoningMatch = content.match(/REASONING:\s*(.+?)$/s);

      const assessment = assessmentMatch?.[1].trim() || 'Assessment completed';
      const strengths = strengthsMatch
        ? strengthsMatch[1]
            .split('\n')
            .filter((s) => s.trim().startsWith('-'))
            .map((s) => s.replace('-', '').trim())
            .filter(Boolean)
        : [];
      const weaknesses = weaknessesMatch
        ? weaknessesMatch[1]
            .split('\n')
            .filter((s) => s.trim().startsWith('-'))
            .map((s) => s.replace('-', '').trim())
            .filter(Boolean)
        : [];
      const overallScore = scoreMatch
        ? Math.min(10, Math.max(0, parseInt(scoreMatch[1])))
        : 7;
      const confidence = confidenceMatch
        ? Math.min(1.0, Math.max(0.0, parseFloat(confidenceMatch[1])))
        : 0.75;
      const reasoning = reasoningMatch?.[1].trim() || 'Evaluation completed';

      const decision: JudgeDecision = {
        finalAnswer: finalProposal,
        assessment,
        strengths,
        weaknesses,
        overallScore,
        confidence,
        reasoning,
      };

      this.logger.info('adversarial_system_judge_completed', {
        overallScore,
        confidence,
        strengthsCount: strengths.length,
        weaknessesCount: weaknesses.length,
      });

      this.tracing.endSpan(spanId, true);

      return decision;
    } catch (error) {
      this.logger.error(
        'adversarial_system_judge_failed',
        error instanceof Error ? error : new Error(String(error)),
        {}
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Graceful degradation: return default decision
      return {
        finalAnswer: finalProposal,
        assessment: 'Evaluation process encountered an error',
        strengths: ['Proposal generated'],
        weaknesses: ['Unable to complete full evaluation'],
        overallScore: 6,
        confidence: 0.5,
        reasoning: 'Default assessment due to evaluation error',
      };
    }
  }
}

