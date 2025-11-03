/**
 * Mode 3: Autonomous-Automatic Service
 * 
 * This service implements autonomous reasoning with automatic agent selection.
 * Uses ReAct + Chain-of-Thought methodology with orchestrator-selected agents.
 * 
 * Architecture:
 * User Query → Goal Understanding → Agent Selection → ReAct Loop → Final Answer
 */

import { StateGraph, START, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { 
  Mode3Config, 
  Mode3State, 
  AutonomousStreamChunk,
  AutonomousEvidenceSource,
  AutonomousCitation,
  Agent,
  GoalUnderstanding,
  CoTSubQuestion,
  ExecutionPlan,
  ReActIteration
} from './autonomous-types';
import { chainOfThoughtEngine } from './chain-of-thought-engine';
import { reActEngine } from './react-engine';
import { agentSelectorService } from './agent-selector-service';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { getAgentMetricsService } from '@/lib/services/observability/agent-metrics-service';
import {
  AgentSelectionError,
  serializeError,
} from '@/lib/errors/agent-errors';

type EvidenceLevel = 'A' | 'B' | 'C' | 'D' | 'Unknown';

function mapSimilarityToEvidenceLevel(similarity?: number): EvidenceLevel {
  if (typeof similarity !== 'number') {
    return 'Unknown';
  }
  if (similarity >= 0.85) {
    return 'A';
  }
  if (similarity >= 0.7) {
    return 'B';
  }
  if (similarity >= 0.55) {
    return 'C';
  }
  return 'D';
}

// ============================================================================
// MODE 3 SERVICE CLASS
// ============================================================================

/**
 * @deprecated This class is deprecated and no longer used.
 * 
 * This handler class was replaced by the `executeMode3()` function which
 * calls the Python AI Engine via API Gateway (Golden Rule compliant).
 * 
 * The Python services handle Mode 3 execution with autonomous reasoning.
 * 
 * DO NOT USE: Use `executeMode3()` instead.
 * 
 * @see executeMode3 - The compliant function that uses API Gateway
 */
export class Mode3AutonomousAutomaticHandler {
  private workflow: any;
  private logger;

  constructor(options?: { requestId?: string; userId?: string }) {
    this.workflow = this.buildMode3Workflow();
    this.logger = createLogger({
      requestId: options?.requestId,
      userId: options?.userId,
    });
  }

  /**
   * Execute Mode 3: Autonomous-Automatic
   */
  async execute(config: Mode3Config): Promise<AsyncGenerator<AutonomousStreamChunk>> {
    const workflowId = `mode3_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startTime = Date.now();

    this.logger.info('mode3_execution_started', {
      operation: 'Mode3Execute',
      workflowId,
      queryPreview: config.message.substring(0, 100),
      enableRAG: config.enableRAG ?? true,
      enableTools: config.enableTools ?? true,
      maxIterations: config.maxIterations || 10,
      userId: config.userId,
    });

    try {
      // Convert conversation history to BaseMessage format
      const baseMessages: BaseMessage[] = (config.conversationHistory || []).map(msg => {
        if (msg.role === 'user') {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });

      // Initialize state
      const initialState: Mode3State = {
        query: config.message,
        conversationHistory: baseMessages,
        config,
        goalUnderstanding: {} as GoalUnderstanding,
        executionPlan: {} as ExecutionPlan,
        subQuestions: [],
        iterations: [],
        currentPhase: 'initial',
        currentIteration: 0,
        finalAnswer: '',
        confidence: 0,
        toolsUsed: [],
        ragContexts: [],
        sources: [],
        citations: [],
        executionTime: 0,
        timestamp: new Date().toISOString(),
        candidateAgents: [],
        selectedAgent: {} as Agent,
        agentSelectionReason: '',
        selectionConfidence: 0
      };

      // Execute LangGraph workflow
      const result = await this.workflow.invoke(initialState);

      // Calculate execution time
      const executionTime = Date.now() - startTime;
      result.executionTime = executionTime;

      // Record Mode 3 execution metrics (fire-and-forget)
      if (config.tenantId && result.selectedAgent?.id) {
        const metricsService = getAgentMetricsService();
        const iterations = result.iterations?.length || 0;
        metricsService.recordOperation({
          agentId: result.selectedAgent.id,
          tenantId: config.tenantId,
          operationType: 'mode3',
          responseTimeMs: executionTime,
          success: true,
          queryText: config.message.substring(0, 1000),
          selectedAgentId: result.selectedAgent.id,
          confidenceScore: result.confidence,
          sessionId: config.sessionId,
          userId: config.userId || null,
          metadata: {
            workflowId,
            iterations,
            finalAnswer: result.finalAnswer?.substring(0, 200),
            toolsUsed: result.toolsUsed || [],
            candidateCount: result.candidateAgents?.length || 0,
            executionTime,
          },
        }).catch(() => {
          // Silent fail - metrics should never break main flow
        });
      }

      // Stream the results
      return this.streamMode3Results(result, startTime);

    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Record Mode 3 error metrics (fire-and-forget)
      if (config.tenantId) {
        const metricsService = getAgentMetricsService();
        const agentId = 'system'; // We don't have result here in catch block
        metricsService.recordOperation({
          agentId,
          tenantId: config.tenantId,
          operationType: 'mode3',
          responseTimeMs: executionTime,
          success: false,
          errorOccurred: true,
          errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
          errorMessage: error instanceof Error ? error.message.substring(0, 500) : String(error),
          queryText: config.message.substring(0, 1000),
          sessionId: config.sessionId,
          userId: config.userId || null,
          metadata: {
            workflowId,
            executionTime,
          },
        }).catch(() => {
          // Silent fail
        });
      }

      this.logger.error(
        'mode3_execution_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'Mode3Execute',
          workflowId,
          executionTime,
          queryPreview: config.message.substring(0, 100),
        }
      );
      throw error;
    }
  }

  /**
   * Build LangGraph workflow for Mode 3
   */
  private buildMode3Workflow() {
    const workflow = new StateGraph<Mode3State>({
      channels: {
        query: { value: (x: string, y: string) => y ?? x },
        conversationHistory: { value: (x: BaseMessage[], y: BaseMessage[]) => y ?? x },
        config: { value: (x: Mode3Config, y: Mode3Config) => y ?? x },
        goalUnderstanding: { value: (x: GoalUnderstanding, y: GoalUnderstanding) => y ?? x },
        executionPlan: { value: (x: ExecutionPlan, y: ExecutionPlan) => y ?? x },
        subQuestions: { value: (x: CoTSubQuestion[], y: CoTSubQuestion[]) => y ?? x },
        iterations: { value: (x: ReActIteration[], y: ReActIteration[]) => y ?? x },
        currentPhase: { value: (x: string, y: string) => y ?? x },
        currentIteration: { value: (x: number, y: number) => y ?? x },
        finalAnswer: { value: (x: string, y: string) => y ?? x },
        confidence: { value: (x: number, y: number) => y ?? x },
        toolsUsed: { value: (x: string[], y: string[]) => y ?? x },
        ragContexts: { value: (x: string[], y: string[]) => y ?? x },
        sources: { value: (x: AutonomousEvidenceSource[], y: AutonomousEvidenceSource[]) => y ?? x },
        citations: { value: (x: AutonomousCitation[], y: AutonomousCitation[]) => y ?? x },
        executionTime: { value: (x: number, y: number) => y ?? x },
        timestamp: { value: (x: string, y: string) => y ?? x },
        error: { value: (x: string | undefined, y: string | undefined) => y ?? x },
        candidateAgents: { value: (x: Agent[], y: Agent[]) => y ?? x },
        selectedAgent: { value: (x: Agent, y: Agent) => y ?? x },
        agentSelectionReason: { value: (x: string, y: string) => y ?? x },
        selectionConfidence: { value: (x: number, y: number) => y ?? x }
      }
    });

    // Add workflow nodes
    workflow.addNode('understand_goal', this.understandGoalNode.bind(this));
    workflow.addNode('select_agent', this.selectAgentNode.bind(this));
    workflow.addNode('decompose_goal', this.decomposeGoalNode.bind(this));
    workflow.addNode('create_plan', this.createPlanNode.bind(this));
    workflow.addNode('execute_react', this.executeReActNode.bind(this));
    workflow.addNode('synthesize_answer', this.synthesizeAnswerNode.bind(this));

    // Define workflow edges
    workflow.addEdge(START, 'understand_goal');
    workflow.addEdge('understand_goal', 'select_agent');
    workflow.addEdge('select_agent', 'decompose_goal');
    workflow.addEdge('decompose_goal', 'create_plan');
    workflow.addEdge('create_plan', 'execute_react');
    workflow.addEdge('execute_react', 'synthesize_answer');
    workflow.addEdge('synthesize_answer', END);

    return workflow.compile();
  }

  // ============================================================================
  // WORKFLOW NODES
  // ============================================================================

  /**
   * Node 1: Understand Goal
   */
  private async understandGoalNode(state: Mode3State): Promise<Partial<Mode3State>> {
    this.logger.info('mode3_goal_understanding_started', {
      operation: 'understandGoal',
      queryPreview: state.query.substring(0, 100),
    });

    try {
      const goalUnderstanding = await chainOfThoughtEngine.understandGoal(state.query);
      
      this.logger.info('mode3_goal_understanding_completed', {
        operation: 'understandGoal',
        goalSummary: goalUnderstanding.summary?.substring(0, 200),
      });
      return { goalUnderstanding };
    } catch (error) {
      this.logger.error(
        'mode3_goal_understanding_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'understandGoal' }
      );
      return { error: `Goal understanding failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 2: Select Best Agent
   */
  private async selectAgentNode(state: Mode3State): Promise<Partial<Mode3State>> {
    this.logger.info('mode3_agent_selection_started', {
      operation: 'selectAgent',
      goalSummary: state.goalUnderstanding.summary?.substring(0, 100),
    });

    try {
      // Analyze query for agent selection
      const queryAnalysis = await agentSelectorService.analyzeQuery(state.query);
      
      // Find candidate agents
      const candidateAgents = await agentSelectorService.findCandidateAgents(
        state.query,
        queryAnalysis.domains,
        5 // Get top 5 candidates
      );

      // Rank and select best agent
      const rankedAgents = agentSelectorService.rankAgents(
        candidateAgents,
        state.query,
        queryAnalysis.intent,
        queryAnalysis.domains
      );

      const selectedAgent = rankedAgents[0];
      const selectionReason = `Selected ${selectedAgent.name} based on ${selectedAgent.reason}`;
      const selectionConfidence = selectedAgent.score;

      this.logger.info('mode3_agent_selection_completed', {
        operation: 'selectAgent',
        selectedAgent: selectedAgent.name,
        agentId: selectedAgent.id,
        confidence: selectionConfidence,
      });
      
      return {
        candidateAgents,
        selectedAgent,
        agentSelectionReason: selectionReason,
        selectionConfidence
      };
    } catch (error) {
      this.logger.error(
        'mode3_agent_selection_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'selectAgent' }
      );
      return { error: `Agent selection failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 3: Decompose Goal with Selected Agent
   */
  private async decomposeGoalNode(state: Mode3State): Promise<Partial<Mode3State>> {
    this.logger.info('mode3_goal_decomposition_started', {
      operation: 'decomposeGoal',
      selectedAgent: state.selectedAgent.name,
    });

    try {
      const subQuestions = await chainOfThoughtEngine.decomposeGoal(
        state.goalUnderstanding,
        state.selectedAgent
      );

      const prioritizedQuestions = await chainOfThoughtEngine.prioritizeQuestions(subQuestions);

      this.logger.info('mode3_goal_decomposition_completed', {
        operation: 'decomposeGoal',
        subQuestionCount: prioritizedQuestions.length,
      });
      return { subQuestions: prioritizedQuestions };
    } catch (error) {
      this.logger.error(
        'mode3_goal_decomposition_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'decomposeGoal' }
      );
      return { error: `Goal decomposition failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 4: Create Execution Plan
   */
  private async createPlanNode(state: Mode3State): Promise<Partial<Mode3State>> {
    this.logger.info('mode3_plan_creation_started', {
      operation: 'createExecutionPlan',
      subQuestionCount: state.subQuestions.length,
    });

    try {
      const executionPlan = await chainOfThoughtEngine.createExecutionPlan(
        state.goalUnderstanding,
        state.subQuestions,
        state.selectedAgent
      );

      this.logger.info('mode3_plan_creation_completed', {
        operation: 'createExecutionPlan',
        phaseCount: executionPlan.phases.length,
      });
      return { executionPlan };
    } catch (error) {
      this.logger.error(
        'mode3_plan_creation_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'createExecutionPlan' }
      );
      return { error: `Execution plan creation failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 5: Execute ReAct Loop
   */
  private async executeReActNode(state: Mode3State): Promise<Partial<Mode3State>> {
    this.logger.info('mode3_react_loop_started', {
      operation: 'executeReActLoop',
      maxIterations: state.config.maxIterations || 10,
    });

    try {
      // Create a streaming callback that will yield steps in real-time
      const streamingSteps: Array<{ type: string; content: string; metadata?: any }> = [];
      
      const reactResult = await reActEngine.executeReActLoop(
        state.goalUnderstanding,
        state.subQuestions,
        state.executionPlan,
        state.selectedAgent,
        state.config.maxIterations || 10,
        state.config.confidenceThreshold || 0.95,
        state.config.enableRAG !== false, // Default to true, only disable if explicitly false
        (step) => {
          // Collect steps for streaming
          streamingSteps.push(step);
        }
      );

      // Store streaming steps in state for later streaming
      (state as any).streamingSteps = streamingSteps;

      this.logger.info('mode3_react_loop_completed', {
        operation: 'executeReActLoop',
        iterationCount: reactResult.iterations.length,
        toolsUsed: reactResult.toolsUsed.length,
      });
      
      return {
        iterations: reactResult.iterations,
        finalAnswer: reactResult.finalAnswer,
        confidence: reactResult.confidence,
        toolsUsed: reactResult.toolsUsed,
        ragContexts: reactResult.ragContexts,
        sources: reactResult.sources,
        citations: reactResult.citations
      };
    } catch (error) {
      this.logger.error(
        'mode3_react_loop_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'executeReActLoop' }
      );
      return { error: `ReAct execution failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 6: Synthesize Final Answer
   */
  private async synthesizeAnswerNode(state: Mode3State): Promise<Partial<Mode3State>> {
    this.logger.info('mode3_synthesis_started', {
      operation: 'synthesizeFinalAnswer',
      iterationCount: state.iterations.length,
    });

    try {
      // The final answer is already synthesized in the ReAct loop
      // This node can add additional formatting or validation
      
      const executionTime = Date.now() - new Date(state.timestamp).getTime();
      
      this.logger.info('mode3_synthesis_completed', {
        operation: 'synthesizeFinalAnswer',
        answerLength: finalAnswer.length,
      });
      return { executionTime };
    } catch (error) {
      this.logger.error(
        'mode3_synthesis_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'synthesizeFinalAnswer' }
      );
      return { error: `Final answer synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  // ============================================================================
  // STREAMING RESULTS
  // ============================================================================

  private async *streamMode3Results(
    result: Mode3State, 
    startTime: number
  ): AsyncGenerator<AutonomousStreamChunk> {
    this.logger.info('mode3_streaming_started', {
      operation: 'streamResults',
      resultSummary: result.finalAnswer?.substring(0, 100),
    });

    try {
      // Stream goal understanding
      yield {
        type: 'goal_understanding',
        content: `Goal: ${result.goalUnderstanding.translatedGoal}`,
        metadata: {
          confidence: result.confidence,
          agent: result.selectedAgent
        },
        timestamp: new Date().toISOString()
      };

      // Stream agent selection
      yield {
        type: 'agent_selection',
        content: `Selected Agent: ${result.selectedAgent.name}`,
        metadata: {
          agent: result.selectedAgent,
          confidence: result.selectionConfidence
        },
        timestamp: new Date().toISOString()
      };

      // Stream execution plan
      yield {
        type: 'execution_plan',
        content: `Execution Plan: ${result.executionPlan.phases.length} phases, ${result.subQuestions.length} sub-questions`,
        metadata: {
          phases: result.executionPlan.phases.length,
          subQuestions: result.subQuestions.length
        },
        timestamp: new Date().toISOString()
      };

      // Stream all detailed ReAct steps in real-time
      // First stream the detailed steps collected during execution
      const streamingSteps = (result as any).streamingSteps;
      if (streamingSteps && streamingSteps.length > 0) {
        for (const step of streamingSteps) {
          yield {
            type: step.type as any,
            content: step.content,
            metadata: {
              ...step.metadata,
              timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
          };
        }
      } else {
        // Fallback: Stream iterations if detailed steps aren't available
        for (const iteration of result.iterations) {
          yield {
            type: 'iteration_start',
            content: `Iteration ${iteration.iteration + 1}`,
            metadata: {
              iteration: iteration.iteration,
              confidence: iteration.confidence
            },
            timestamp: new Date().toISOString()
          };

          yield {
            type: 'thought',
            content: iteration.thought,
            metadata: {
              iteration: iteration.iteration,
              phase: 'thinking'
            },
            timestamp: new Date().toISOString()
          };

          yield {
            type: 'action',
            content: iteration.action,
            metadata: {
              iteration: iteration.iteration,
              phase: 'acting',
              toolsUsed: iteration.toolsUsed
            },
            timestamp: new Date().toISOString()
          };

          yield {
            type: 'observation',
            content: iteration.observation,
            metadata: {
              iteration: iteration.iteration,
              phase: 'observing',
              ragContext: iteration.ragContext
            },
            timestamp: new Date().toISOString()
          };

          yield {
            type: 'reflection',
            content: iteration.reflection,
            metadata: {
              iteration: iteration.iteration,
              phase: 'reflecting',
              confidence: iteration.confidence
            },
            timestamp: new Date().toISOString()
          };
        }
      }

      const normalizedSources = Array.isArray(result.sources) ? result.sources : [];
      const normalizedCitations = Array.isArray(result.citations) ? result.citations : [];

      const finalMetaChunk = this.buildFinalMetaChunk(result, normalizedSources, normalizedCitations, startTime);
      yield {
        type: 'chunk',
        content: finalMetaChunk,
        timestamp: new Date().toISOString()
      };

      if (normalizedSources.length > 0) {
        const sourcePayloads = normalizedSources.map((source, idx) => this.toBranchSource(source, idx));
        const domains = Array.from(
          new Set(
            sourcePayloads
              .map((source) => source.domain)
              .filter((domain): domain is string => typeof domain === 'string' && domain.trim().length > 0)
          )
        );

        yield {
          type: 'sources',
          sources: sourcePayloads,
          metadata: {
            totalSources: sourcePayloads.length,
            domains,
          },
          timestamp: new Date().toISOString()
        };
      }

      // Stream final answer
      yield {
        type: 'final_answer',
        content: result.finalAnswer,
        metadata: {
          confidence: result.confidence,
          toolsUsed: result.toolsUsed,
          iterations: result.iterations.length
        },
        timestamp: new Date().toISOString()
      };

      // Stream completion
      yield {
        type: 'done',
        content: 'Mode 3 execution completed',
        metadata: {
          executionTime: result.executionTime,
          totalIterations: result.iterations.length,
          finalConfidence: result.confidence,
          totalSources: normalizedSources.length
        },
        sources: normalizedSources.map((source, idx) => this.toBranchSource(source, idx)),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(
        'mode3_streaming_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'streamResults' }
      );
      yield {
        type: 'error',
        content: `Streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private toBranchSource(
    source: AutonomousEvidenceSource,
    index: number
  ) {
    return {
      id: source.id || `source-${index + 1}`,
      title: source.title || `Source ${index + 1}`,
      url: source.url,
      excerpt: source.excerpt,
      similarity: source.similarity,
      domain: source.domain,
      organization: source.organization,
      evidenceLevel: mapSimilarityToEvidenceLevel(source.similarity),
      lastUpdated: source.lastUpdated,
    };
  }

  private formatMetaEvent(event: Record<string, unknown>): string {
    return `__mode1_meta__${JSON.stringify(event)}`;
  }

  private buildFinalMetaChunk(
    result: Mode3State,
    sources: AutonomousEvidenceSource[],
    citations: AutonomousCitation[],
    startTime: number
  ): string {
    const branchSources = sources.map((source, idx) => this.toBranchSource(source, idx));
    const sourceMap = new Map<string, any>();
    branchSources.forEach((source) => {
      if (source.id) {
        sourceMap.set(String(source.id), source);
      }
    });

    const normalizedCitations = (citations && citations.length > 0 ? citations : this.defaultCitationsFromSources(sources)).map(
      (citation, idx) => {
        const candidateSourceIds = [
          ...(citation.sources?.map((src) => src.id).filter(Boolean) as string[]),
          citation.sourceId,
          branchSources[idx]?.id,
        ].filter(Boolean) as string[];

        const mappedSources = candidateSourceIds
          .map((id) => sourceMap.get(String(id)))
          .filter(Boolean);

        if (mappedSources.length === 0 && branchSources[idx]) {
          mappedSources.push(branchSources[idx]);
        }

        const uniqueSources = Array.from(
          new Map(mappedSources.map((item) => [item.id, item])).values()
        );

        return {
          number: citation.number ?? idx + 1,
          sourceId: uniqueSources[0]?.id ?? citation.sourceId ?? branchSources[idx]?.id,
          sources: uniqueSources,
        };
      }
    );

    const reasoning = result.iterations
      ?.map((iteration) => iteration.reflection)
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    const durationMs = result.executionTime || Math.max(0, Date.now() - startTime);
    const uniqueDomains = Array.from(
      new Set(
        sources
          .map((source) => source.domain)
          .filter((domain): domain is string => typeof domain === 'string' && domain.trim().length > 0)
      )
    );

    return this.formatMetaEvent({
      event: 'final',
      executionPath: 'mode3_autonomous',
      durationMs,
      rag: {
        totalSources: sources.length,
        strategy: 'autonomous-react',
        domains: uniqueDomains,
        cacheHit: false,
        retrievalTimeMs: durationMs,
      },
      tools: {
        allowed: Array.from(new Set(result.toolsUsed || [])),
        used: Array.from(new Set(result.toolsUsed || [])),
        totals: {
          calls: result.toolsUsed?.length ?? 0,
          success: result.toolsUsed?.length ?? 0,
          failure: 0,
          totalTimeMs: durationMs,
        },
      },
      branches: [
        {
          id: branchSources[0]?.id || 'mode3-branch-0',
          content: result.finalAnswer,
          confidence: result.confidence,
          citations: normalizedCitations,
          sources: branchSources,
          createdAt: new Date().toISOString(),
          reasoning,
        },
      ],
      currentBranch: 0,
      confidence: result.confidence,
      citations: normalizedCitations,
    });
  }

  private defaultCitationsFromSources(
    sources: AutonomousEvidenceSource[]
  ): AutonomousCitation[] {
    return sources.map((source, idx) => ({
      number: idx + 1,
      sourceId: source.id || `source-${idx + 1}`,
      sources: [source],
    }));
  }
}

// ============================================================================
// EXPORT FUNCTION
// ============================================================================

/**
 * Execute Mode 3: Autonomous-Automatic
 */
// Use API Gateway URL for compliance with Golden Rule (Python services via gateway)
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'http://localhost:3001'; // Default to API Gateway (proper flow)

interface Mode3AutonomousAutomaticApiResponse {
  agent_id: string;
  content: string;
  confidence: number;
  citations: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
  processing_time_ms: number;
  autonomous_reasoning: {
    iterations: number;
    tools_used: string[];
    reasoning_steps: string[];
    confidence_threshold: number;
    max_iterations: number;
  };
  agent_selection: {
    selected_agent_id: string;
    selected_agent_name: string;
    selection_method: string;
    selection_confidence: number;
  };
}

/**
 * Build metadata chunk string to keep the UI streaming helpers working.
 */
function buildMetadataChunk(eventPayload: Record<string, unknown>): string {
  return `__mode3_meta__${JSON.stringify(eventPayload)}`;
}

/**
 * Convert Python response citations into the structure expected by the UI.
 */
function mapCitationsToSources(citations: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return citations.map((citation, index) => ({
    id: String(citation.id ?? `source-${index + 1}`),
    url: citation.url ?? citation.link ?? '#',
    title: citation.title ?? citation.name ?? `Source ${index + 1}`,
    excerpt: citation.relevant_quote ?? citation.excerpt ?? citation.summary ?? '',
    similarity: citation.similarity ?? citation.confidence_score ?? undefined,
    domain: citation.domain,
    evidenceLevel: citation.evidence_level ?? citation.evidenceLevel ?? 'Unknown',
    organization: citation.organization,
    reliabilityScore: citation.reliabilityScore,
    lastUpdated: citation.lastUpdated,
  }));
}

export async function* executeMode3(config: Mode3Config): AsyncGenerator<AutonomousStreamChunk> {
  const requestId = `mode3_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();

  try {
    const payload = {
      message: config.message,
      enable_rag: config.enableRAG !== false,
      enable_tools: config.enableTools ?? true,
      selected_rag_domains: config.selectedRagDomains ?? [],
      requested_tools: config.requestedTools ?? [],
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 2000,
      max_iterations: config.maxIterations ?? 10,
      confidence_threshold: config.confidenceThreshold ?? 0.95,
      user_id: config.userId,
      tenant_id: config.tenantId,
      session_id: config.sessionId,
      conversation_history: config.conversationHistory ?? [],
    };

    // Call via API Gateway to comply with Golden Rule (Python services via gateway)
    const response = await fetch(`${API_GATEWAY_URL}/api/mode3/autonomous-automatic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.detail || errorBody.error || `API Gateway responded with status ${response.status}`);
    }

    const result = (await response.json()) as Mode3AutonomousAutomaticApiResponse;

    // Emit agent selection metadata
    if (result.agent_selection) {
      yield {
        type: 'agent_selection',
        selectedAgent: {
          id: result.agent_selection.selected_agent_id,
          name: result.agent_selection.selected_agent_name,
        } as Agent,
        confidence: result.agent_selection.selection_confidence,
        timestamp: new Date().toISOString(),
      };
    }

    // Emit autonomous reasoning metadata
    if (result.autonomous_reasoning) {
      yield {
        type: 'reasoning_start',
        metadata: {
          max_iterations: result.autonomous_reasoning.max_iterations,
          confidence_threshold: result.autonomous_reasoning.confidence_threshold,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Emit RAG sources if available
    const sources = mapCitationsToSources(result.citations || []);
    if (sources.length > 0) {
      yield buildMetadataChunk({
        event: 'rag_sources',
        total: sources.length,
        sources,
        strategy: 'python_orchestrator',
        cacheHit: false,
        domains: config.selectedRagDomains ?? [],
      });
    }

    // Emit final metadata
    yield buildMetadataChunk({
      event: 'final',
      confidence: result.confidence,
      rag: {
        totalSources: sources.length,
        strategy: 'python_orchestrator',
        domains: config.selectedRagDomains ?? [],
        cacheHit: false,
        retrievalTimeMs: result.processing_time_ms,
      },
      autonomous_reasoning: result.autonomous_reasoning,
      agent_selection: result.agent_selection,
      citations: result.citations ?? [],
      reasoning: result.reasoning ?? [],  // ✅ Add reasoning from API response
    });

    // Emit response content - stream word-by-word
    const words = result.content.split(' ');
    const wordsPerChunk = 3; // Stream 3 words at a time
    
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunkContent = words.slice(i, i + wordsPerChunk).join(' ') + (i + wordsPerChunk < words.length ? ' ' : '');
      yield {
        type: 'content',
        content: chunkContent,
        metadata: {
          confidence: result.confidence,
          iterations: result.autonomous_reasoning?.iterations ?? 0,
          toolsUsed: result.autonomous_reasoning?.tools_used ?? [],
        },
        timestamp: new Date().toISOString(),
      };
      // Small delay for smoother streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Emit completion
    yield {
      type: 'done',
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    yield {
      type: 'error',
      content: `Error: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    };
    throw error;
  }
}
