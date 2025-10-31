/**
 * Master Orchestrator Agent
 * 
 * Top-level agent that orchestrates all agent interactions.
 * Implements hierarchical delegation and self-improvement.
 * 
 * Features:
 * - Complexity analysis (simple/moderate/complex/expert)
 * - Strategy selection (direct_response/single_expert/expert_panel/hierarchical_delegation)
 * - Task planning and execution
 * - Result synthesis with self-improvement
 * - Self-critique and refinement
 * 
 * Architecture:
 * - Extends DeepAgent as MASTER level
 * - Can delegate to EXPERT, SPECIALIST, WORKER agents
 * - Implements Claude-inspired deep reasoning
 * 
 * @module lib/services/agents/master-orchestrator
 * @version 1.0.0
 */

import { DeepAgent, AgentLevel, type DeepAgentState, type Task } from './deep-agent-system';
import { BaseMessage } from '@langchain/core/messages';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { getTracingService } from '@/lib/services/observability/tracing';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Query complexity levels
 */
export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'expert';

/**
 * Execution strategies
 */
export type ExecutionStrategy =
  | 'direct_response'
  | 'single_expert'
  | 'expert_panel'
  | 'hierarchical_delegation';

/**
 * Complexity analysis result
 */
export interface ComplexityAnalysis {
  level: ComplexityLevel;
  factors: string[];
  estimatedTime: number; // milliseconds
  requiredExpertise: string[];
}

// ============================================================================
// MASTER ORCHESTRATOR AGENT
// ============================================================================

/**
 * Master Orchestrator Agent
 * 
 * Top-level controller for all agents.
 * Analyzes query complexity and selects appropriate strategy.
 */
export class MasterOrchestratorAgent extends DeepAgent {
  constructor(config?: {
    llmProvider?: 'openai' | 'anthropic';
    model?: string;
    temperature?: number;
  }) {
    super({
      id: 'master-orchestrator',
      level: AgentLevel.MASTER,
      llmProvider: config?.llmProvider || 'anthropic',
      model: config?.model || 'claude-3-5-sonnet-20241022',
      temperature: config?.temperature ?? 0.3, // Lower temperature for planning
      maxDepth: 5,
      enableSelfCritique: true,
      enableChainOfThought: true,
    });
  }

  /**
   * Execute orchestration workflow
   * 
   * Main entry point that follows deep reasoning pattern:
   * 1. Analyze complexity
   * 2. Select strategy
   * 3. Create task plan
   * 4. Execute tasks
   * 5. Synthesize results
   * 6. Self-critique and improve
   * 
   * @param state - Current agent state
   * @returns Updated state with final response
   */
  async execute(state: DeepAgentState): Promise<DeepAgentState> {
    const spanId = this.tracing.startSpan('MasterOrchestratorAgent.execute', undefined, {
      agentId: this.id,
      messageCount: state.messages.length,
      taskCount: state.task_queue.length,
    });

    const startTime = Date.now();

    try {
      this.logger.info('master_orchestrator_started', {
        agentId: this.id,
        messageCount: state.messages.length,
        hasParent: !!state.parent_agent,
      });

      // Step 1: Analyze query complexity
      const complexity = await this.analyzeComplexity(state.messages);
      this.logger.debug('master_orchestrator_complexity', {
        agentId: this.id,
        level: complexity.level,
        factors: complexity.factors,
      });

      // Step 2: Select execution strategy
      const strategy = await this.selectStrategy(complexity);
      this.logger.debug('master_orchestrator_strategy', {
        agentId: this.id,
        strategy,
      });

      // Step 3: Create task plan
      const tasks = await this.createTaskPlan(state.messages, strategy);
      state.task_queue = tasks;
      this.logger.info('master_orchestrator_tasks_created', {
        agentId: this.id,
        taskCount: tasks.length,
        strategy,
      });

      // Step 4: Execute tasks through delegation or direct execution
      for (const task of tasks) {
        state = await this.executeTask(task, state);
      }

      // Step 5: Synthesize results from all tasks
      const synthesis = await this.synthesizeResults(state);
      this.logger.debug('master_orchestrator_synthesis', {
        agentId: this.id,
        synthesisPreview: synthesis.substring(0, 200),
      });

      // Step 6: Self-critique and improve
      const critique = await this.selfCritique(synthesis, [
        'Accuracy',
        'Completeness',
        'Clarity',
        'Relevance',
        'Safety',
      ]);

      state.critique_history.push(critique);

      let finalSynthesis = synthesis;
      if (critique.score < 7) {
        this.logger.info('master_orchestrator_improving', {
          agentId: this.id,
          critiqueScore: critique.score,
          suggestionCount: critique.suggestions.length,
        });

        // Attempt improvement based on critique
        finalSynthesis = await this.improveResponse(finalSynthesis, critique);
        state.improvement_suggestions.push(...critique.suggestions);
      }

      state.final_response = finalSynthesis;

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('master_orchestrator_completed', duration, {
        agentId: this.id,
        taskCount: state.completed_tasks.length,
        critiqueScore: critique.score,
        finalResponseLength: finalSynthesis.length,
      });

      this.tracing.endSpan(spanId, true);

      return state;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'master_orchestrator_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          agentId: this.id,
          duration,
        }
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Graceful degradation: return state with error
      state.error = error instanceof Error ? error.message : String(error);
      state.final_response =
        'I encountered an error while processing your request. Please try again.';

      return state;
    }
  }

  /**
   * Analyze query complexity
   * 
   * Determines complexity level based on query characteristics.
   * Uses LLM for semantic analysis, not just heuristics.
   * 
   * @param messages - Conversation messages
   * @returns Complexity analysis
   */
  private async analyzeComplexity(
    messages: BaseMessage[]
  ): Promise<ComplexityAnalysis> {
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content.toString();

    const spanId = this.tracing.startSpan(
      'MasterOrchestratorAgent.analyzeComplexity',
      undefined,
      {
        queryLength: content.length,
      }
    );

    try {
      const prompt = `
Analyze the complexity of this query:

"${content}"

Consider:
1. Length and detail level
2. Number of concepts/questions
3. Required expertise domains
4. Analytical depth needed
5. Dependency on multiple information sources

Provide:
COMPLEXITY: simple | moderate | complex | expert
FACTORS: comma-separated list of complexity factors
EXPERTISE: comma-separated list of required expertise domains
TIME_ESTIMATE: estimated processing time in seconds

Format:
COMPLEXITY: [level]
FACTORS: [factor1, factor2, ...]
EXPERTISE: [domain1, domain2, ...]
TIME_ESTIMATE: [seconds]
      `.trim();

      const response = await this.llm.invoke([
        new SystemMessage(
          'You are a complexity analyzer. Assess queries objectively.'
        ),
        new HumanMessage(prompt),
      ]);

      const responseText = response.content.toString();

      // Parse response
      const complexityMatch = responseText.match(
        /COMPLEXITY:\s*(simple|moderate|complex|expert)/i
      );
      const factorsMatch = responseText.match(/FACTORS:\s*(.+?)(?:\n|EXPERTISE:|$)/s);
      const expertiseMatch = responseText.match(
        /EXPERTISE:\s*(.+?)(?:\n|TIME_ESTIMATE:|$)/s
      );
      const timeMatch = responseText.match(/TIME_ESTIMATE:\s*(\d+)/);

      const level = (complexityMatch?.[1]?.toLowerCase() ||
        'moderate') as ComplexityLevel;
      const factors = factorsMatch?.[1]
        ?.split(',')
        .map((f) => f.trim())
        .filter(Boolean) || [];
      const requiredExpertise = expertiseMatch?.[1]
        ?.split(',')
        .map((e) => e.trim())
        .filter(Boolean) || [];
      const estimatedSeconds = timeMatch ? parseInt(timeMatch[1]) : 5;
      const estimatedTime = estimatedSeconds * 1000; // Convert to milliseconds

      this.tracing.endSpan(spanId, true);

      return {
        level,
        factors,
        estimatedTime,
        requiredExpertise,
      };
    } catch (error) {
      this.logger.warn('master_orchestrator_complexity_analysis_failed', {
        agentId: this.id,
        error: error instanceof Error ? error.message : String(error),
      });

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Fallback: heuristic-based complexity
      const factors: string[] = [];
      let level: ComplexityLevel = 'simple';

      if (content.length > 500) factors.push('long_query');
      if (content.match(/\b(analyze|compare|evaluate|assess)\b/i))
        factors.push('analytical');
      if (content.match(/\b(multi|multiple|several|various)\b/i))
        factors.push('multi_part');
      if (content.match(/\d{4}-\d{2}-\d{2}/)) factors.push('temporal');
      if (factors.length === 0) level = 'simple';
      else if (factors.length === 1) level = 'moderate';
      else if (factors.length === 2) level = 'complex';
      else level = 'expert';

      return {
        level,
        factors,
        estimatedTime: 3000,
        requiredExpertise: [],
      };
    }
  }

  /**
   * Select execution strategy based on complexity
   * 
   * @param complexity - Complexity analysis result
   * @returns Execution strategy
   */
  private async selectStrategy(
    complexity: ComplexityAnalysis
  ): Promise<ExecutionStrategy> {
    const strategyMap: Record<ComplexityLevel, ExecutionStrategy> = {
      simple: 'direct_response',
      moderate: 'single_expert',
      complex: 'expert_panel',
      expert: 'hierarchical_delegation',
    };

    return strategyMap[complexity.level] || 'direct_response';
  }

  /**
   * Create task plan based on strategy
   * 
   * Generates structured task list with dependencies.
   * 
   * @param messages - Conversation messages
   * @param strategy - Execution strategy
   * @returns Task list
   */
  private async createTaskPlan(
    messages: BaseMessage[],
    strategy: ExecutionStrategy
  ): Promise<Task[]> {
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content.toString();

    const tasks: Task[] = [];

    switch (strategy) {
      case 'direct_response':
        tasks.push({
          id: 'task-1',
          type: 'execution',
          description: 'Generate direct response',
          assigned_to: this.id, // Master handles directly
          priority: 1,
          dependencies: [],
          status: 'pending',
          createdAt: new Date(),
        });
        break;

      case 'single_expert':
        tasks.push(
          {
            id: 'task-1',
            type: 'research',
            description: 'Research relevant information',
            assigned_to: null, // Auto-assign to expert
            priority: 1,
            dependencies: [],
            status: 'pending',
            createdAt: new Date(),
          },
          {
            id: 'task-2',
            type: 'synthesis',
            description: 'Synthesize findings',
            assigned_to: this.id,
            priority: 2,
            dependencies: ['task-1'],
            status: 'pending',
            createdAt: new Date(),
          }
        );
        break;

      case 'expert_panel':
        tasks.push(
          {
            id: 'task-1',
            type: 'research',
            description: 'Gather expert opinions',
            assigned_to: null, // Auto-assign to panel
            priority: 1,
            dependencies: [],
            status: 'pending',
            createdAt: new Date(),
          },
          {
            id: 'task-2',
            type: 'analysis',
            description: 'Analyze expert inputs',
            assigned_to: null, // Auto-assign to analysis agent
            priority: 2,
            dependencies: ['task-1'],
            status: 'pending',
            createdAt: new Date(),
          },
          {
            id: 'task-3',
            type: 'synthesis',
            description: 'Synthesize consensus',
            assigned_to: this.id,
            priority: 3,
            dependencies: ['task-2'],
            status: 'pending',
            createdAt: new Date(),
          }
        );
        break;

      case 'hierarchical_delegation':
        tasks.push(
          {
            id: 'task-1',
            type: 'analysis',
            description: 'Decompose into subtasks',
            assigned_to: this.id,
            priority: 1,
            dependencies: [],
            status: 'pending',
            createdAt: new Date(),
          },
          {
            id: 'task-2',
            type: 'execution',
            description: 'Execute subtasks in parallel',
            assigned_to: null, // Delegate to expert network
            priority: 2,
            dependencies: ['task-1'],
            status: 'pending',
            createdAt: new Date(),
          },
          {
            id: 'task-3',
            type: 'validation',
            description: 'Validate results',
            assigned_to: null, // Delegate to validator
            priority: 3,
            dependencies: ['task-2'],
            status: 'pending',
            createdAt: new Date(),
          },
          {
            id: 'task-4',
            type: 'synthesis',
            description: 'Final synthesis',
            assigned_to: this.id,
            priority: 4,
            dependencies: ['task-3'],
            status: 'pending',
            createdAt: new Date(),
          }
        );
        break;
    }

    return tasks;
  }

  /**
   * Execute a single task
   * 
   * Either executes directly or delegates to child agent.
   * 
   * @param task - Task to execute
   * @param state - Current state
   * @returns Updated state
   */
  private async executeTask(
    task: Task,
    state: DeepAgentState
  ): Promise<DeepAgentState> {
    task.status = 'in_progress';

    this.logger.debug('master_orchestrator_task_started', {
      agentId: this.id,
      taskId: task.id,
      taskType: task.type,
      assignedTo: task.assigned_to || 'auto',
    });

    try {
      if (task.assigned_to === this.id) {
        // Execute internally using Chain of Thought
        const lastMessage = state.messages[state.messages.length - 1];
        const query = lastMessage ? lastMessage.content.toString() : task.description;

        const cotResult = await this.chainOfThought(query, state.retrieved_contexts);

        task.result = {
          type: task.type,
          result: cotResult.conclusion,
          reasoning: cotResult.reasoning,
          confidence: cotResult.confidence,
        };

        state.reasoning_steps.push(...cotResult.reasoning);
        state.confidence_scores.push(cotResult.confidence);
        state.intermediate_results.push(task.result);
      } else {
        // Delegate to child agent
        const delegationResult = await this.delegateToChildren(task, state);
        task.result = delegationResult;
        state.intermediate_results.push(delegationResult);
      }

      task.status = 'completed';
      task.completedAt = new Date();
      state.completed_tasks.push(task);

      this.logger.debug('master_orchestrator_task_completed', {
        agentId: this.id,
        taskId: task.id,
        duration: task.completedAt.getTime() - task.createdAt.getTime(),
      });
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : String(error);
      task.completedAt = new Date();

      this.logger.error(
        'master_orchestrator_task_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          agentId: this.id,
          taskId: task.id,
        }
      );
    }

    return state;
  }

  /**
   * Synthesize results from all completed tasks
   * 
   * Combines intermediate results into final response.
   * 
   * @param state - Current state with completed tasks
   * @returns Synthesized response
   */
  private async synthesizeResults(state: DeepAgentState): Promise<string> {
    const spanId = this.tracing.startSpan(
      'MasterOrchestratorAgent.synthesizeResults',
      undefined,
      {
        agentId: this.id,
        resultCount: state.intermediate_results.length,
      }
    );

    try {
      const resultsText = state.intermediate_results
        .map(
          (r, i) =>
            `Result ${i + 1}: ${JSON.stringify(r).substring(0, 500)}...`
        )
        .join('\n\n');

      const prompt = `
Synthesize the following results into a coherent, comprehensive response:

${resultsText}

Original Query Context:
${state.messages.map((m) => m.content.toString()).join('\n')}

Provide a unified response that:
1. Integrates insights from all results
2. Resolves any contradictions
3. Maintains clarity and structure
4. Cites relevant evidence where appropriate

SYNTHESIS:
      `.trim();

      const response = await this.llm.invoke([
        new SystemMessage(
          'You are a master synthesizer. Create coherent narratives from multiple inputs.'
        ),
        new HumanMessage(prompt),
      ]);

      const synthesis = response.content.toString();

      this.tracing.endSpan(spanId, true);

      return synthesis;
    } catch (error) {
      this.logger.error(
        'master_orchestrator_synthesis_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          agentId: this.id,
        }
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Fallback: simple concatenation
      return state.intermediate_results
        .map((r) => JSON.stringify(r))
        .join('\n\n');
    }
  }

  /**
   * Improve response based on critique
   * 
   * Revises response to address identified weaknesses.
   * 
   * @param response - Original response
   * @param critique - Critique feedback
   * @returns Improved response
   */
  private async improveResponse(
    response: string,
    critique: { feedback: string; suggestions: string[] }
  ): Promise<string> {
    const prompt = `
Improve the following response based on this feedback:

Original Response:
${response}

Feedback:
${critique.feedback}

Suggestions:
${critique.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Provide an improved version that addresses the feedback while maintaining accuracy.

IMPROVED RESPONSE:
    `.trim();

    const improved = await this.llm.invoke([
      new SystemMessage(
        'You are an editor. Improve content based on feedback while maintaining accuracy.'
      ),
      new HumanMessage(prompt),
    ]);

    return improved.content.toString().replace('IMPROVED RESPONSE:', '').trim();
  }
}

// Singleton instance
let masterOrchestratorInstance: MasterOrchestratorAgent | null = null;

/**
 * Get Master Orchestrator instance (singleton)
 */
export function getMasterOrchestrator(): MasterOrchestratorAgent {
  if (!masterOrchestratorInstance) {
    masterOrchestratorInstance = new MasterOrchestratorAgent();
  }
  return masterOrchestratorInstance;
}

