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
  Agent,
  GoalUnderstanding,
  CoTSubQuestion,
  ExecutionPlan,
  ReActIteration
} from './autonomous-types';
import { chainOfThoughtEngine } from './chain-of-thought-engine';
import { reActEngine } from './react-engine';
import { agentSelectorService } from './agent-selector-service';

// ============================================================================
// MODE 3 SERVICE CLASS
// ============================================================================

export class Mode3AutonomousAutomaticHandler {
  private workflow: any;

  constructor() {
    this.workflow = this.buildMode3Workflow();
  }

  /**
   * Execute Mode 3: Autonomous-Automatic
   */
  async execute(config: Mode3Config): Promise<AsyncGenerator<AutonomousStreamChunk>> {
    console.log('🤖 [Mode 3] Starting Autonomous-Automatic execution...');
    console.log(`   Query: ${config.message}`);
    console.log(`   RAG: ${config.enableRAG ? 'enabled' : 'disabled'}`);
    console.log(`   Tools: ${config.enableTools ? 'enabled' : 'disabled'}`);
    console.log(`   Max Iterations: ${config.maxIterations || 10}`);

    const startTime = Date.now();

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
        executionTime: 0,
        timestamp: new Date().toISOString(),
        candidateAgents: [],
        selectedAgent: {} as Agent,
        agentSelectionReason: '',
        selectionConfidence: 0
      };

      // Execute LangGraph workflow
      const result = await this.workflow.invoke(initialState);

      // Stream the results
      return this.streamMode3Results(result, startTime);

    } catch (error) {
      console.error('❌ [Mode 3] Execution failed:', error);
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
    console.log('🧠 [Mode 3] Understanding goal...');

    try {
      const goalUnderstanding = await chainOfThoughtEngine.understandGoal(state.query);
      
      console.log('✅ [Mode 3] Goal understanding completed');
      return { goalUnderstanding };
    } catch (error) {
      console.error('❌ [Mode 3] Goal understanding failed:', error);
      return { error: `Goal understanding failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 2: Select Best Agent
   */
  private async selectAgentNode(state: Mode3State): Promise<Partial<Mode3State>> {
    console.log('🎯 [Mode 3] Selecting best agent...');

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

      console.log(`✅ [Mode 3] Agent selected: ${selectedAgent.name} (confidence: ${selectionConfidence.toFixed(2)})`);
      
      return {
        candidateAgents,
        selectedAgent,
        agentSelectionReason: selectionReason,
        selectionConfidence
      };
    } catch (error) {
      console.error('❌ [Mode 3] Agent selection failed:', error);
      return { error: `Agent selection failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 3: Decompose Goal with Selected Agent
   */
  private async decomposeGoalNode(state: Mode3State): Promise<Partial<Mode3State>> {
    console.log('🔍 [Mode 3] Decomposing goal with selected agent...');

    try {
      const subQuestions = await chainOfThoughtEngine.decomposeGoal(
        state.goalUnderstanding,
        state.selectedAgent
      );

      const prioritizedQuestions = await chainOfThoughtEngine.prioritizeQuestions(subQuestions);

      console.log(`✅ [Mode 3] Goal decomposed into ${prioritizedQuestions.length} sub-questions`);
      return { subQuestions: prioritizedQuestions };
    } catch (error) {
      console.error('❌ [Mode 3] Goal decomposition failed:', error);
      return { error: `Goal decomposition failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 4: Create Execution Plan
   */
  private async createPlanNode(state: Mode3State): Promise<Partial<Mode3State>> {
    console.log('📋 [Mode 3] Creating execution plan...');

    try {
      const executionPlan = await chainOfThoughtEngine.createExecutionPlan(
        state.goalUnderstanding,
        state.subQuestions,
        state.selectedAgent
      );

      console.log(`✅ [Mode 3] Execution plan created with ${executionPlan.phases.length} phases`);
      return { executionPlan };
    } catch (error) {
      console.error('❌ [Mode 3] Execution plan creation failed:', error);
      return { error: `Execution plan creation failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 5: Execute ReAct Loop
   */
  private async executeReActNode(state: Mode3State): Promise<Partial<Mode3State>> {
    console.log('🔄 [Mode 3] Executing ReAct loop...');

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

      console.log(`✅ [Mode 3] ReAct loop completed after ${reactResult.iterations.length} iterations`);
      
      return {
        iterations: reactResult.iterations,
        finalAnswer: reactResult.finalAnswer,
        confidence: reactResult.confidence,
        toolsUsed: reactResult.toolsUsed
      };
    } catch (error) {
      console.error('❌ [Mode 3] ReAct execution failed:', error);
      return { error: `ReAct execution failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 6: Synthesize Final Answer
   */
  private async synthesizeAnswerNode(state: Mode3State): Promise<Partial<Mode3State>> {
    console.log('📝 [Mode 3] Synthesizing final answer...');

    try {
      // The final answer is already synthesized in the ReAct loop
      // This node can add additional formatting or validation
      
      const executionTime = Date.now() - new Date(state.timestamp).getTime();
      
      console.log('✅ [Mode 3] Final answer synthesis completed');
      return { executionTime };
    } catch (error) {
      console.error('❌ [Mode 3] Final answer synthesis failed:', error);
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
    console.log('📡 [Mode 3] Streaming results...');

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
          finalConfidence: result.confidence
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ [Mode 3] Streaming failed:', error);
      yield {
        type: 'error',
        content: `Streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// ============================================================================
// EXPORT FUNCTION
// ============================================================================

/**
 * Execute Mode 3: Autonomous-Automatic
 */
export async function executeMode3(config: Mode3Config): Promise<AsyncGenerator<AutonomousStreamChunk>> {
  const handler = new Mode3AutonomousAutomaticHandler();
  return handler.execute(config);
}
