/**
 * Mode 4: Autonomous-Manual Service
 * 
 * This service implements autonomous reasoning with manual agent selection.
 * Uses ReAct + Chain-of-Thought methodology with user-selected agent.
 * 
 * Architecture:
 * User Query + Selected Agent → Goal Understanding → ReAct Loop → Final Answer
 */

import { StateGraph, START, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { 
  Mode4Config, 
  Mode4State, 
  AutonomousStreamChunk,
  Agent,
  GoalUnderstanding,
  CoTSubQuestion,
  ExecutionPlan,
  ReActIteration
} from './autonomous-types';
import { chainOfThoughtEngine } from './chain-of-thought-engine';
import { reActEngine } from './react-engine';

// ============================================================================
// MODE 4 SERVICE CLASS
// ============================================================================

export class Mode4AutonomousManualHandler {
  private workflow: any;

  constructor() {
    this.workflow = this.buildMode4Workflow();
  }

  /**
   * Execute Mode 4: Autonomous-Manual
   */
  async execute(config: Mode4Config): Promise<AsyncGenerator<AutonomousStreamChunk>> {
    console.log('🤖 [Mode 4] Starting Autonomous-Manual execution...');
    console.log(`   Query: ${config.message}`);
    console.log(`   Agent: ${config.agentId}`);
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
      const initialState: Mode4State = {
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
        selectedAgent: {} as Agent,
        agentExpertise: []
      };

      // Execute LangGraph workflow
      const result = await this.workflow.invoke(initialState);

      // Stream the results
      return this.streamMode4Results(result, startTime);

    } catch (error) {
      console.error('❌ [Mode 4] Execution failed:', error);
      throw error;
    }
  }

  /**
   * Build LangGraph workflow for Mode 4
   */
  private buildMode4Workflow() {
    const workflow = new StateGraph<Mode4State>({
      channels: {
        query: { value: (x: string, y: string) => y ?? x },
        conversationHistory: { value: (x: BaseMessage[], y: BaseMessage[]) => y ?? x },
        config: { value: (x: Mode4Config, y: Mode4Config) => y ?? x },
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
        selectedAgent: { value: (x: Agent, y: Agent) => y ?? x },
        agentExpertise: { value: (x: string[], y: string[]) => y ?? x }
      }
    });

    // Add workflow nodes
    workflow.addNode('load_agent', this.loadAgentNode.bind(this));
    workflow.addNode('understand_goal', this.understandGoalNode.bind(this));
    workflow.addNode('decompose_goal', this.decomposeGoalNode.bind(this));
    workflow.addNode('create_plan', this.createPlanNode.bind(this));
    workflow.addNode('execute_react', this.executeReActNode.bind(this));
    workflow.addNode('synthesize_answer', this.synthesizeAnswerNode.bind(this));

    // Define workflow edges
    workflow.addEdge(START, 'load_agent');
    workflow.addEdge('load_agent', 'understand_goal');
    workflow.addEdge('understand_goal', 'decompose_goal');
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
   * Node 1: Load Selected Agent
   */
  private async loadAgentNode(state: Mode4State): Promise<Partial<Mode4State>> {
    console.log('👤 [Mode 4] Loading selected agent...');

    try {
      // In a real implementation, this would fetch the agent from the database
      // For now, we'll create a mock agent based on the agentId
      const selectedAgent: Agent = {
        id: state.config.agentId,
        name: `Agent ${state.config.agentId}`,
        display_name: `Expert Agent ${state.config.agentId}`,
        system_prompt: `You are an expert agent specialized in autonomous reasoning and problem-solving.`,
        model: 'gpt-4',
        capabilities: ['reasoning', 'analysis', 'problem-solving'],
        tools: ['rag_search', 'data_analysis', 'synthesis'],
        knowledge_domain: 'general',
        tier: 1,
        specialties: ['autonomous reasoning', 'chain-of-thought', 'react methodology']
      };

      const agentExpertise = [
        ...(selectedAgent.specialties || []),
        ...(selectedAgent.capabilities || []),
        selectedAgent.knowledge_domain || 'general'
      ];

      console.log(`✅ [Mode 4] Agent loaded: ${selectedAgent.name}`);
      return { 
        selectedAgent,
        agentExpertise
      };
    } catch (error) {
      console.error('❌ [Mode 4] Agent loading failed:', error);
      return { error: `Agent loading failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 2: Understand Goal with Selected Agent
   */
  private async understandGoalNode(state: Mode4State): Promise<Partial<Mode4State>> {
    console.log('🧠 [Mode 4] Understanding goal with selected agent...');

    try {
      const goalUnderstanding = await chainOfThoughtEngine.understandGoal(
        state.query, 
        state.selectedAgent
      );
      
      console.log('✅ [Mode 4] Goal understanding completed');
      return { goalUnderstanding };
    } catch (error) {
      console.error('❌ [Mode 4] Goal understanding failed:', error);
      return { error: `Goal understanding failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 3: Decompose Goal with Selected Agent
   */
  private async decomposeGoalNode(state: Mode4State): Promise<Partial<Mode4State>> {
    console.log('🔍 [Mode 4] Decomposing goal with selected agent...');

    try {
      const subQuestions = await chainOfThoughtEngine.decomposeGoal(
        state.goalUnderstanding,
        state.selectedAgent
      );

      const prioritizedQuestions = await chainOfThoughtEngine.prioritizeQuestions(subQuestions);

      console.log(`✅ [Mode 4] Goal decomposed into ${prioritizedQuestions.length} sub-questions`);
      return { subQuestions: prioritizedQuestions };
    } catch (error) {
      console.error('❌ [Mode 4] Goal decomposition failed:', error);
      return { error: `Goal decomposition failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 4: Create Execution Plan
   */
  private async createPlanNode(state: Mode4State): Promise<Partial<Mode4State>> {
    console.log('📋 [Mode 4] Creating execution plan...');

    try {
      const executionPlan = await chainOfThoughtEngine.createExecutionPlan(
        state.goalUnderstanding,
        state.subQuestions,
        state.selectedAgent
      );

      console.log(`✅ [Mode 4] Execution plan created with ${executionPlan.phases.length} phases`);
      return { executionPlan };
    } catch (error) {
      console.error('❌ [Mode 4] Execution plan creation failed:', error);
      return { error: `Execution plan creation failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 5: Execute ReAct Loop
   */
  private async executeReActNode(state: Mode4State): Promise<Partial<Mode4State>> {
    console.log('🔄 [Mode 4] Executing ReAct loop...');

    try {
      const reactResult = await reActEngine.executeReActLoop(
        state.goalUnderstanding,
        state.subQuestions,
        state.executionPlan,
        state.selectedAgent,
        state.config.maxIterations || 10,
        state.config.confidenceThreshold || 0.95
      );

      console.log(`✅ [Mode 4] ReAct loop completed after ${reactResult.iterations.length} iterations`);
      
      return {
        iterations: reactResult.iterations,
        finalAnswer: reactResult.finalAnswer,
        confidence: reactResult.confidence,
        toolsUsed: reactResult.toolsUsed
      };
    } catch (error) {
      console.error('❌ [Mode 4] ReAct execution failed:', error);
      return { error: `ReAct execution failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Node 6: Synthesize Final Answer
   */
  private async synthesizeAnswerNode(state: Mode4State): Promise<Partial<Mode4State>> {
    console.log('📝 [Mode 4] Synthesizing final answer...');

    try {
      // The final answer is already synthesized in the ReAct loop
      // This node can add additional formatting or validation
      
      const executionTime = Date.now() - new Date(state.timestamp).getTime();
      
      console.log('✅ [Mode 4] Final answer synthesis completed');
      return { executionTime };
    } catch (error) {
      console.error('❌ [Mode 4] Final answer synthesis failed:', error);
      return { error: `Final answer synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  // ============================================================================
  // STREAMING RESULTS
  // ============================================================================

  private async *streamMode4Results(
    result: Mode4State, 
    startTime: number
  ): AsyncGenerator<AutonomousStreamChunk> {
    console.log('📡 [Mode 4] Streaming results...');

    try {
      // Stream agent loading
      yield {
        type: 'agent_selection',
        content: `Using Agent: ${result.selectedAgent.name}`,
        metadata: {
          agent: result.selectedAgent,
          confidence: 1.0 // Manual selection has full confidence
        },
        timestamp: new Date().toISOString()
      };

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

      // Stream ReAct iterations
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
        content: 'Mode 4 execution completed',
        metadata: {
          executionTime: result.executionTime,
          totalIterations: result.iterations.length,
          finalConfidence: result.confidence
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ [Mode 4] Streaming failed:', error);
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
 * Execute Mode 4: Autonomous-Manual
 */
export async function executeMode4(config: Mode4Config): Promise<AsyncGenerator<AutonomousStreamChunk>> {
  const handler = new Mode4AutonomousManualHandler();
  return handler.execute(config);
}
