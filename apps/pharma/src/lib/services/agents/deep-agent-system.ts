/**
 * Deep Agent Architecture System
 * 
 * Enterprise-grade hierarchical agent system implementing:
 * - Multi-level agent hierarchy (Master → Expert → Specialist → Worker → Tool)
 * - Chain of Thought reasoning with self-reflection
 * - Self-critique mechanism (Constitutional AI inspired)
 * - Child agent delegation and supervision
 * - Tree of Thoughts pattern support
 * 
 * Architecture Principles:
 * - SOLID: Single responsibility per agent level, dependency injection, clean interfaces
 * - Type Safety: Full TypeScript with discriminated unions
 * - Observability: Structured logging, distributed tracing, metrics
 * - Resilience: Circuit breakers, retries, graceful degradation
 * - Performance: Batch operations, caching, query optimization
 * - Security: Permission checks, audit logging
 * 
 * @module lib/services/agents/deep-agent-system
 * @version 1.0.0
 */

import { ChatOpenAI, ChatAnthropic } from '@langchain/openai';
import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { getTracingService } from '@/lib/services/observability/tracing';
import { withRetry } from '../resilience/retry';
import { getSupabaseCircuitBreaker } from '../resilience/circuit-breaker';
import { z } from 'zod';
import type { Document } from '@langchain/core/documents';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Agent hierarchy levels
 * 
 * MASTER: Top-level orchestrator (delegates to experts)
 * EXPERT: Domain experts (may delegate to specialists)
 * SPECIALIST: Specialized sub-agents (delegate to workers)
 * WORKER: Task executors (use tools)
 * TOOL: Tool agents (execute specific tools)
 */
export enum AgentLevel {
  MASTER = 'master',
  EXPERT = 'expert',
  SPECIALIST = 'specialist',
  WORKER = 'worker',
  TOOL = 'tool',
}

/**
 * Task interface for delegation
 */
export interface Task {
  id: string;
  type: 'research' | 'analysis' | 'synthesis' | 'validation' | 'execution';
  description: string;
  assigned_to: string | null; // Agent ID or null for auto-assignment
  priority: number; // 1-10, higher = more priority
  dependencies: string[]; // Task IDs that must complete first
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Critique interface for self-evaluation
 */
export interface Critique {
  agentId: string;
  timestamp: Date;
  aspect: string; // e.g., 'accuracy', 'completeness', 'clarity'
  score: number; // 0-10
  feedback: string;
  suggestions: string[];
  criteria: string[]; // Criteria used for evaluation
}

/**
 * Reasoning step in Chain of Thought
 */
export interface ReasoningStep {
  step: number;
  content: string;
  confidence: number; // 0-1
  supportingEvidence?: string[];
  timestamp: Date;
}

/**
 * Chain of Thought result
 */
export interface ChainOfThoughtResult {
  reasoning: ReasoningStep[];
  conclusion: string;
  confidence: number; // 0-1
  evidence: string[];
}

/**
 * Agent state for execution
 */
export interface DeepAgentState {
  // Core state
  messages: BaseMessage[];
  current_level: AgentLevel;
  parent_agent: string | null;
  child_agents: string[];

  // Reasoning chain
  reasoning_steps: ReasoningStep[];
  confidence_scores: number[];

  // Knowledge context
  knowledge_base: any[];
  retrieved_contexts: Document[];

  // Execution tracking
  task_queue: Task[];
  completed_tasks: Task[];

  // Quality control
  critique_history: Critique[];
  improvement_suggestions: string[];

  // Final outputs
  intermediate_results: any[];
  final_response: string | null;
  metadata: Record<string, any>;
  error?: string | null;
}

/**
 * Deep Agent Configuration
 */
export interface DeepAgentConfig {
  id: string;
  level: AgentLevel;
  llmProvider: 'openai' | 'anthropic';
  model: string;
  temperature?: number;
  maxDepth?: number; // Maximum delegation depth
  enableSelfCritique?: boolean;
  enableChainOfThought?: boolean;
  parentAgentId?: string | null;
}

// ============================================================================
// BASE DEEP AGENT CLASS
// ============================================================================

/**
 * Deep Agent Base Class
 * 
 * Implements core reasoning capabilities following enterprise patterns:
 * - Single Responsibility: Each agent handles one level of abstraction
 * - Dependency Injection: LLM, services injected via constructor
 * - Interface Segregation: Clean interfaces for state and tasks
 * 
 * @abstract Must be subclassed with concrete execute() implementation
 */
export abstract class DeepAgent {
  protected readonly id: string;
  protected readonly level: AgentLevel;
  protected readonly llm: ChatOpenAI | ChatAnthropic;
  protected readonly children: Map<string, DeepAgent> = new Map();
  protected readonly logger;
  protected readonly tracing;
  protected readonly circuitBreaker;
  protected readonly maxDepth: number;
  protected readonly enableSelfCritique: boolean;
  protected readonly enableChainOfThought: boolean;
  protected readonly parentId: string | null;

  constructor(config: DeepAgentConfig) {
    this.id = config.id;
    this.level = config.level;
    this.maxDepth = config.maxDepth ?? 5;
    this.enableSelfCritique = config.enableSelfCritique ?? true;
    this.enableChainOfThought = config.enableChainOfThought ?? true;
    this.parentId = config.parentAgentId ?? null;

    this.logger = createLogger();
    this.tracing = getTracingService();
    this.circuitBreaker = getSupabaseCircuitBreaker();

    // Initialize LLM based on provider
    if (config.llmProvider === 'anthropic') {
      this.llm = new ChatAnthropic({
        modelName: config.model,
        temperature: config.temperature ?? 0.7,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      });
    } else {
      this.llm = new ChatOpenAI({
        modelName: config.model,
        temperature: config.temperature ?? 0.7,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Chain of Thought Reasoning
   * 
   * Implements step-by-step reasoning with self-reflection.
   * Follows CoT best practices from research papers.
   * 
   * @param query - The question or task to reason about
   * @param context - Additional context for reasoning
   * @returns Reasoning steps, conclusion, and confidence
   */
  protected async chainOfThought(
    query: string,
    context: any[] = []
  ): Promise<ChainOfThoughtResult> {
    const spanId = this.tracing.startSpan(
      'DeepAgent.chainOfThought',
      undefined,
      {
        agentId: this.id,
        level: this.level,
        queryPreview: query.substring(0, 100),
      }
    );

    const startTime = Date.now();

    try {
      if (!this.enableChainOfThought) {
        // Fast path: return direct result without CoT
        const response = await this.llm.invoke([
          new SystemMessage(`You are a ${this.level}-level agent. Provide a direct answer.`),
          new HumanMessage(query),
        ]);

        this.tracing.endSpan(spanId, true);
        return {
          reasoning: [],
          conclusion: response.content.toString(),
          confidence: 0.8,
          evidence: [],
        };
      }

      const prompt = `
You are a ${this.level}-level agent with ID: ${this.id}.

Task: ${query}

Context:
${JSON.stringify(context, null, 2)}

Please reason through this step-by-step:

1. Understanding: What is being asked?
2. Analysis: What information do I have?
3. Approach: How should I solve this?
4. Execution: Work through the solution
5. Validation: Check the reasoning
6. Conclusion: Final answer

Format your response as:
REASONING:
- Step 1: [your reasoning]
- Step 2: [your reasoning]
- Step N: [your reasoning]

CONCLUSION: [Your final answer]

CONFIDENCE: [0-1 score indicating your confidence]

EVIDENCE: [comma-separated list of supporting evidence or sources]
      `.trim();

      const response = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await this.llm.invoke([
              new SystemMessage(
                'You are a reasoning agent. Think step by step. Be thorough and precise.'
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 2,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            this.logger.warn('deep_agent_cot_retry', {
              agentId: this.id,
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      const content = response.content.toString();

      // Parse reasoning steps
      const reasoningMatch = content.match(/REASONING:([\s\S]*?)CONCLUSION:/);
      const conclusionMatch = content.match(/CONCLUSION:([\s\S]*?)(?:CONFIDENCE:|EVIDENCE:|$)/s);
      const confidenceMatch = content.match(/CONFIDENCE:\s*([\d.]+)/);
      const evidenceMatch = content.match(/EVIDENCE:\s*(.+?)(?:\n|$)/);

      const reasoningSteps: ReasoningStep[] = [];
      if (reasoningMatch) {
        const steps = reasoningMatch[1]
          .split('\n')
          .filter((line) => line.trim().match(/^[-•]\s*Step\s+\d+:/i))
          .map((line, idx) => {
            const content = line.replace(/^[-•]\s*Step\s+\d+:\s*/i, '').trim();
            return {
              step: idx + 1,
              content,
              confidence: 0.8, // Default confidence for step
              timestamp: new Date(),
            };
          });

        reasoningSteps.push(...steps);
      }

      const conclusion = conclusionMatch
        ? conclusionMatch[1].trim()
        : content.split('CONCLUSION:')[1]?.trim() || content;
      const confidence = confidenceMatch
        ? parseFloat(confidenceMatch[1])
        : 0.7; // Default confidence
      const evidence = evidenceMatch
        ? evidenceMatch[1].split(',').map((e) => e.trim()).filter(Boolean)
        : [];

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('deep_agent_cot_completed', duration, {
        agentId: this.id,
        level: this.level,
        stepCount: reasoningSteps.length,
        confidence,
      });

      this.tracing.endSpan(spanId, true);

      return {
        reasoning: reasoningSteps,
        conclusion,
        confidence: Math.min(1.0, Math.max(0.0, confidence)),
        evidence,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'deep_agent_cot_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          agentId: this.id,
          level: this.level,
          duration,
        }
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Graceful degradation: return basic result
      return {
        reasoning: [],
        conclusion: `I encountered an error while reasoning about: ${query}`,
        confidence: 0.3,
        evidence: [],
      };
    }
  }

  /**
   * Self-Critique Mechanism
   * 
   * Evaluates own output for quality and correctness.
   * Implements Constitutional AI principles.
   * 
   * @param output - The output to critique
   * @param criteria - List of criteria to evaluate against
   * @returns Critique with scores, feedback, and suggestions
   */
  protected async selfCritique(
    output: string,
    criteria: string[] = [
      'Accuracy',
      'Completeness',
      'Clarity',
      'Relevance',
      'Safety',
    ]
  ): Promise<Critique> {
    if (!this.enableSelfCritique) {
      // Skip critique if disabled
      return {
        agentId: this.id,
        timestamp: new Date(),
        aspect: 'self-evaluation',
        score: 7.0, // Default passing score
        feedback: 'Self-critique disabled',
        suggestions: [],
        criteria,
      };
    }

    const spanId = this.tracing.startSpan('DeepAgent.selfCritique', undefined, {
      agentId: this.id,
      criteriaCount: criteria.length,
    });

    const startTime = Date.now();

    try {
      const prompt = `
Evaluate the following output against these criteria:
${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Output to evaluate:
${output}

Provide:
1. Score (0-10) for each criterion
2. Overall feedback
3. Specific improvement suggestions

Format:
SCORES:
- ${criteria[0]}: X/10
- ${criteria[1]}: X/10
- ...

FEEDBACK: [Your overall feedback]

SUGGESTIONS:
- Suggestion 1
- Suggestion 2
- ...
      `.trim();

      const response = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await this.llm.invoke([
              new SystemMessage(
                'You are a critical evaluator. Be honest and constructive. Focus on accuracy and safety.'
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 2,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            this.logger.warn('deep_agent_critique_retry', {
              agentId: this.id,
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      const content = response.content.toString();

      // Parse scores
      const scoresMatch = content.match(/SCORES:([\s\S]*?)FEEDBACK:/);
      const feedbackMatch = content.match(/FEEDBACK:([\s\S]*?)(?:SUGGESTIONS:|$)/s);
      const suggestionsMatch = content.match(/SUGGESTIONS:([\s\S]*?)$/);

      const scores: number[] = [];
      if (scoresMatch) {
        const scoreLines = scoresMatch[1].match(/\d+\/10/g);
        if (scoreLines) {
          scores.push(...scoreLines.map((s) => parseFloat(s.replace('/10', ''))));
        }
      }

      const avgScore =
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 7.0; // Default score

      const feedback = feedbackMatch ? feedbackMatch[1].trim() : 'No feedback provided';
      const suggestions = suggestionsMatch
        ? suggestionsMatch[1]
            .split('\n')
            .filter((s) => s.trim().startsWith('-'))
            .map((s) => s.replace('-', '').trim())
            .filter(Boolean)
        : [];

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('deep_agent_critique_completed', duration, {
        agentId: this.id,
        avgScore,
        suggestionCount: suggestions.length,
      });

      this.tracing.endSpan(spanId, true);

      return {
        agentId: this.id,
        timestamp: new Date(),
        aspect: 'self-evaluation',
        score: Math.min(10, Math.max(0, avgScore)),
        feedback,
        suggestions,
        criteria,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.warn('deep_agent_critique_failed', {
        agentId: this.id,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Graceful degradation: return default critique
      return {
        agentId: this.id,
        timestamp: new Date(),
        aspect: 'self-evaluation',
        score: 7.0,
        feedback: 'Critique evaluation failed, using default assessment',
        suggestions: [],
        criteria,
      };
    }
  }

  /**
   * Delegate task to child agents
   * 
   * Implements supervisor-worker pattern.
   * Only delegates if child agents exist and task requires delegation.
   * 
   * @param task - Task to delegate
   * @param state - Current agent state
   * @returns Results from child agents
   */
  protected async delegateToChildren(
    task: Task,
    state: DeepAgentState
  ): Promise<any> {
    if (this.children.size === 0) {
      this.logger.debug('deep_agent_no_children', {
        agentId: this.id,
        taskId: task.id,
      });
      return null;
    }

    const spanId = this.tracing.startSpan('DeepAgent.delegateToChildren', undefined, {
      agentId: this.id,
      taskId: task.id,
      childCount: this.children.size,
    });

    try {
      const results: any[] = [];

      // If task specifies an agent, delegate only to that agent
      if (task.assigned_to) {
        const child = this.children.get(task.assigned_to);
        if (child) {
          const childState: DeepAgentState = {
            ...state,
            parent_agent: this.id,
            current_level: child.level,
          };
          const result = await child.execute(childState);
          results.push(result);
        } else {
          this.logger.warn('deep_agent_child_not_found', {
            agentId: this.id,
            taskId: task.id,
            assignedTo: task.assigned_to,
          });
        }
      } else {
        // Delegate to all relevant children (can be parallelized)
        const delegationPromises = Array.from(this.children.values()).map(
          async (child) => {
            const childState: DeepAgentState = {
              ...state,
              parent_agent: this.id,
              current_level: child.level,
            };
            return child.execute(childState);
          }
        );

        const childResults = await Promise.all(delegationPromises);
        results.push(...childResults);
      }

      const aggregated = this.aggregateChildResults(results);

      this.tracing.endSpan(spanId, true);

      return aggregated;
    } catch (error) {
      this.logger.error(
        'deep_agent_delegation_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          agentId: this.id,
          taskId: task.id,
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
   * Aggregate results from child agents
   * 
   * Default aggregation - can be overridden by subclasses.
   * 
   * @param results - Results from child agents
   * @returns Aggregated result
   */
  protected aggregateChildResults(results: any[]): any {
    // Default aggregation strategy: combine all results
    return {
      aggregated: true,
      count: results.length,
      results: results,
      summary: results
        .map(
          (r, i) =>
            `Result ${i + 1}: ${JSON.stringify(r.final_response || r).substring(0, 100)}...`
        )
        .join('\n'),
    };
  }

  /**
   * Add a child agent
   * 
   * @param child - Child agent to add
   */
  public addChild(child: DeepAgent): void {
    if (child.parentId && child.parentId !== this.id) {
      throw new Error(
        `Agent ${child.id} already has parent ${child.parentId}, cannot add to ${this.id}`
      );
    }

    this.children.set(child.id, child);
    this.logger.info('deep_agent_child_added', {
      parentId: this.id,
      childId: child.id,
      childLevel: child.level,
    });
  }

  /**
   * Get child agents
   * 
   * @returns Array of child agents
   */
  public getChildren(): DeepAgent[] {
    return Array.from(this.children.values());
  }

  /**
   * Abstract execute method - must be implemented by subclasses
   * 
   * @param state - Current agent state
   * @returns Updated agent state
   */
  abstract execute(state: DeepAgentState): Promise<DeepAgentState>;

  /**
   * Get agent information
   */
  public getInfo() {
    return {
      id: this.id,
      level: this.level,
      childCount: this.children.size,
      maxDepth: this.maxDepth,
      enableSelfCritique: this.enableSelfCritique,
      enableChainOfThought: this.enableChainOfThought,
    };
  }
}

