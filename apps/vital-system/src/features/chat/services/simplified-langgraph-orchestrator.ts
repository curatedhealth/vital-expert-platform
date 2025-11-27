/**
 * @fileoverview Simplified LangGraph Orchestrator - 4-Mode Toggle System
 * @module features/chat/services
 * @description Production-grade orchestration with 2 simple toggles: Interactive/Autonomous × Manual/Automatic
 *
 * Mode Matrix:
 * ┌─────────────────────────────────────────────────┐
 * │              MANUAL      AUTOMATIC              │
 * │  INTERACTIVE  Mode 1      Mode 2                │
 * │  AUTONOMOUS   Mode 3      Mode 4                │
 * └─────────────────────────────────────────────────┘
 *
 * @version 3.0.0 (Simplified)
 * @author VITAL AI Platform Team
 */

import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { MemorySaver } from '@langchain/langgraph';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createClient, SupabaseClient } from '@supabase/supabase/js';
import { z } from 'zod';
import { Document } from '@langchain/core/documents';

// ============================================================================
// SIMPLIFIED MODE SYSTEM
// ============================================================================

/**
 * Mode derivation helper
 * Converts 2 toggle states into 1 of 4 mode enums
 */
export function getModeFromToggles(isAutonomous: boolean, isAutomatic: boolean): SimplifiedMode {
  if (!isAutonomous && !isAutomatic) return SimplifiedMode.INTERACTIVE_MANUAL;
  if (!isAutonomous && isAutomatic) return SimplifiedMode.INTERACTIVE_AUTOMATIC;
  if (isAutonomous && !isAutomatic) return SimplifiedMode.AUTONOMOUS_MANUAL;
  return SimplifiedMode.AUTONOMOUS_AUTOMATIC;
}

/**
 * Simplified 4-mode enum
 */
export enum SimplifiedMode {
  /** Mode 1: Interactive + Manual - Focused expert conversation */
  INTERACTIVE_MANUAL = 'interactive_manual',

  /** Mode 2: Interactive + Automatic - Smart expert discussion */
  INTERACTIVE_AUTOMATIC = 'interactive_automatic',

  /** Mode 3: Autonomous + Manual - Expert-driven workflow */
  AUTONOMOUS_MANUAL = 'autonomous_manual',

  /** Mode 4: Autonomous + Automatic - AI-driven collaborative workflow */
  AUTONOMOUS_AUTOMATIC = 'autonomous_automatic',
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export const IntentSchema = z.object({
  primaryIntent: z.enum(['question', 'task', 'goal', 'analysis']),
  primaryDomain: z.string().describe('Primary knowledge domain'),
  domains: z.array(z.string()).describe('All relevant knowledge domains'),
  confidence: z.number().min(0).max(1),
  complexity: z.enum(['low', 'medium', 'high', 'very-high'])
});

export type Intent = z.infer<typeof IntentSchema>;

export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  tier: number;
  model: string;
  systemPrompt?: string;
}

export interface TaskStep {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  agentId?: string;
}

export interface Checkpoint {
  id: string;
  type: 'approval' | 'review' | 'decision';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
}

export interface ToolExecution {
  toolName: string;
  input: any;
  output: any;
  timestamp: Date;
}

// ============================================================================
// STATE SCHEMA - SIMPLIFIED
// ============================================================================

export const SimplifiedStateAnnotation = Annotation.Root({
  // ===== MODE CONFIGURATION (2 TOGGLES) =====
  isAutonomous: Annotation<boolean>({
    reducer: (_current, update) => update,
    default: () => false
  }),

  isAutomatic: Annotation<boolean>({
    reducer: (_current, update) => update,
    default: () => false
  }),

  // ===== CORE INPUT =====
  query: Annotation<string>({
    reducer: (_current, update) => update,
    default: () => ''
  }),

  userId: Annotation<string>({
    reducer: (_current, update) => update,
    default: () => ''
  }),

  conversationId: Annotation<string>({
    reducer: (_current, update) => update,
    default: () => ''
  }),

  // ===== AGENT SELECTION =====
  selectedAgentId: Annotation<string | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  activeAgents: Annotation<string[]>({
    reducer: (current, update) => {
      if (Array.isArray(update)) return update;
      return [...current, update];
    },
    default: () => []
  }),

  // ===== INTERACTIVE MODE STATE =====
  chatHistory: Annotation<BaseMessage[]>({
    reducer: (current, update) => {
      if (Array.isArray(update)) return update;
      return [...current, update];
    },
    default: () => []
  }),

  turnCount: Annotation<number>({
    reducer: (_current, update) => update,
    default: () => 0
  }),

  // ===== AUTONOMOUS MODE STATE =====
  taskGoal: Annotation<string | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  taskPlan: Annotation<{
    steps: TaskStep[];
    currentStep: number;
  } | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  checkpoints: Annotation<Checkpoint[]>({
    reducer: (current, update) => {
      if (Array.isArray(update)) return update;
      return [...current, ...(Array.isArray(update) ? update : [update])];
    },
    default: () => []
  }),

  activeCheckpoint: Annotation<string | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  humanApproval: Annotation<boolean | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  toolExecutions: Annotation<ToolExecution[]>({
    reducer: (current, update) => {
      if (Array.isArray(update)) return update;
      return [...current, ...(Array.isArray(update) ? update : [update])];
    },
    default: () => []
  }),

  // ===== WORKFLOW STATE =====
  intent: Annotation<Intent | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  retrievedContext: Annotation<Document[]>({
    reducer: (current, update) => {
      if (Array.isArray(update)) return update;
      return [...current, ...(Array.isArray(update) ? update : [update])];
    },
    default: () => []
  }),

  // ===== OUTPUT =====
  response: Annotation<string>({
    reducer: (_current, update) => update,
    default: () => ''
  }),

  sources: Annotation<any[]>({
    reducer: (current, update) => {
      if (Array.isArray(update)) return update;
      return [...current, ...(Array.isArray(update) ? update : [update])];
    },
    default: () => []
  }),

  metadata: Annotation<Record<string, any>>({
    reducer: (current, update) => ({ ...current, ...update }),
    default: () => ({})
  }),

  logs: Annotation<string[]>({
    reducer: (current, update) => {
      if (Array.isArray(update)) return update;
      return [...current, ...(Array.isArray(update) ? update : [update])];
    },
    default: () => []
  }),

  error: Annotation<string | null>({
    reducer: (_current, update) => update,
    default: () => null
  }),

  // ===== STREAMING =====
  streamEvents: Annotation<boolean>({
    reducer: (_current, update) => update,
    default: () => false
  }),

  onStreamEvent: Annotation<((event: any) => void) | null>({
    reducer: (_current, update) => update,
    default: () => null
  })
});

export type SimplifiedState = typeof SimplifiedStateAnnotation.State;

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

const MODEL_CONFIG = {
  tier1: { model: 'gpt-4-turbo-preview', temperature: 0.1, maxTokens: 4096 },
  tier2: { model: 'gpt-4', temperature: 0.2, maxTokens: 2048 },
  tier3: { model: 'gpt-3.5-turbo', temperature: 0.3, maxTokens: 1024 },
  classification: { model: 'gpt-4-turbo-preview', temperature: 0, maxTokens: 512 }
};

// ============================================================================
// SIMPLIFIED ORCHESTRATOR CLASS
// ============================================================================

export class SimplifiedLangGraphOrchestrator {
  private graph: StateGraph<SimplifiedState>;
  private supabase: SupabaseClient;
  private embeddings: OpenAIEmbeddings;
  private checkpointer: MemorySaver;

  constructor() {
    // Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ [SimplifiedLangGraphOrchestrator] Supabase configuration missing, some features may be disabled');
      // Create a minimal client that will fail gracefully when used
      this.supabase = null as any;
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    // Initialize embeddings
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    // Initialize checkpointer
    this.checkpointer = new MemorySaver();

    // Build graph
    this.graph = this.buildGraph();
  }

  // ==========================================================================
  // GRAPH CONSTRUCTION
  // ==========================================================================

  private buildGraph(): StateGraph<SimplifiedState> {
    const workflow = new StateGraph(SimplifiedStateAnnotation);

    // Add nodes
    workflow.addNode('classify_intent', this.classifyIntent.bind(this));
    workflow.addNode('route_by_mode', this.routeByMode.bind(this));
    workflow.addNode('mode_1_flow', this.interactiveManualFlow.bind(this));
    workflow.addNode('mode_2_flow', this.interactiveAutomaticFlow.bind(this));
    workflow.addNode('mode_3_flow', this.autonomousManualFlow.bind(this));
    workflow.addNode('mode_4_flow', this.autonomousAutomaticFlow.bind(this));
    workflow.addNode('synthesize_response', this.synthesizeResponse.bind(this));

    // Define edges
    workflow.addEdge(START, 'classify_intent');
    workflow.addEdge('classify_intent', 'route_by_mode');

    workflow.addConditionalEdges(
      'route_by_mode',
      (state: SimplifiedState) => {
        const mode = getModeFromToggles(state.isAutonomous, state.isAutomatic);
        return mode;
      },
      {
        [SimplifiedMode.INTERACTIVE_MANUAL]: 'mode_1_flow',
        [SimplifiedMode.INTERACTIVE_AUTOMATIC]: 'mode_2_flow',
        [SimplifiedMode.AUTONOMOUS_MANUAL]: 'mode_3_flow',
        [SimplifiedMode.AUTONOMOUS_AUTOMATIC]: 'mode_4_flow'
      }
    );

    workflow.addEdge('mode_1_flow', 'synthesize_response');
    workflow.addEdge('mode_2_flow', 'synthesize_response');
    workflow.addEdge('mode_3_flow', 'synthesize_response');
    workflow.addEdge('mode_4_flow', 'synthesize_response');
    workflow.addEdge('synthesize_response', END);

    return workflow;
  }

  // ==========================================================================
  // NODE IMPLEMENTATIONS
  // ==========================================================================

  private async classifyIntent(state: SimplifiedState): Promise<Partial<SimplifiedState>> {
    this.emitEvent(state, { type: 'workflow_step', step: 'classify_intent', status: 'running' });

    const llm = new ChatOpenAI({
      modelName: MODEL_CONFIG.classification.model,
      temperature: MODEL_CONFIG.classification.temperature,
      maxTokens: MODEL_CONFIG.classification.maxTokens
    });

    const structuredLLM = llm.withStructuredOutput(IntentSchema);

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `Classify the user's intent and identify knowledge domains.
Mode context: ${state.isAutonomous ? 'Goal-driven task' : 'Conversational query'}
Analyze carefully and provide structured classification.`],
      ['user', state.query]
    ]);

    try {
      const chain = prompt.pipe(structuredLLM);
      const intent = await chain.invoke({});

      this.emitEvent(state, {
        type: 'intent_classified',
        intent,
        confidence: intent.confidence
      });

      return {
        intent,
        logs: [`Intent classified: ${intent.primaryIntent} (${intent.primaryDomain})`]
      };
    } catch (error) {
      console.error('Intent classification error:', error);
      return {
        intent: {
          primaryIntent: 'question',
          primaryDomain: 'general',
          domains: ['general'],
          confidence: 0.5,
          complexity: 'medium'
        } as Intent,
        logs: ['Intent classification failed, using defaults']
      };
    }
  }

  private async routeByMode(state: SimplifiedState): Promise<Partial<SimplifiedState>> {
    const mode = getModeFromToggles(state.isAutonomous, state.isAutomatic);

    this.emitEvent(state, {
      type: 'mode_routed',
      mode,
      isAutonomous: state.isAutonomous,
      isAutomatic: state.isAutomatic
    });

    return {
      logs: [`Routing to ${mode}`]
    };
  }

  // ==========================================================================
  // MODE 1: INTERACTIVE + MANUAL
  // ==========================================================================

  private async interactiveManualFlow(state: SimplifiedState): Promise<Partial<SimplifiedState>> {
    this.emitEvent(state, { type: 'mode_1_start', mode: 'interactive_manual' });

    if (!state.selectedAgentId) {
      return {
        error: 'Mode 1 requires selectedAgentId',
        logs: ['ERROR: No agent selected for manual mode']
      };
    }

    // Get selected agent
    const agent = await this.getAgentById(state.selectedAgentId);
    if (!agent) {
      return {
        error: 'Selected agent not found',
        logs: [`ERROR: Agent ${state.selectedAgentId} not found`]
      };
    }

    // Retrieve context for this agent
    const context = await this.retrieveAgentSpecificContext(
      state.query,
      agent,
      10
    );

    // Generate response with chat history
    const response = await this.generateAgentResponse(
      agent,
      state.query,
      context,
      state.chatHistory
    );

    return {
      activeAgents: [agent.id],
      retrievedContext: context,
      response,
      turnCount: state.turnCount + 1,
      logs: [`Mode 1: ${agent.name} responded`]
    };
  }

  // ==========================================================================
  // MODE 2: INTERACTIVE + AUTOMATIC
  // ==========================================================================

  private async interactiveAutomaticFlow(state: SimplifiedState): Promise<Partial<SimplifiedState>> {
    this.emitEvent(state, { type: 'mode_2_start', mode: 'interactive_automatic' });

    // Select 1-2 best agents based on intent
    const agents = await this.selectBestAgents(state.intent!, 2);

    if (agents.length === 0) {
      return {
        error: 'No suitable agents found',
        logs: ['ERROR: Agent selection failed']
      };
    }

    this.emitEvent(state, {
      type: 'agents_selected',
      agents: agents.map(a => ({ id: a.id, name: a.name }))
    });

    // Retrieve context from multiple domains
    const context = await this.retrieveMultiDomainContext(
      state.query,
      state.intent!.domains,
      15
    );

    // Generate collaborative response
    const response = await this.generateCollaborativeResponse(
      agents,
      state.query,
      context,
      state.chatHistory
    );

    return {
      activeAgents: agents.map(a => a.id),
      retrievedContext: context,
      response,
      turnCount: state.turnCount + 1,
      logs: [`Mode 2: ${agents.length} agents collaborated`]
    };
  }

  // ==========================================================================
  // MODE 3: AUTONOMOUS + MANUAL
  // ==========================================================================

  private async autonomousManualFlow(state: SimplifiedState): Promise<Partial<SimplifiedState>> {
    this.emitEvent(state, { type: 'mode_3_start', mode: 'autonomous_manual' });

    if (!state.selectedAgentId) {
      return {
        error: 'Mode 3 requires selectedAgentId',
        logs: ['ERROR: No agent selected']
      };
    }

    const agent = await this.getAgentById(state.selectedAgentId);
    if (!agent) {
      return {
        error: 'Selected agent not found'
      };
    }

    // If no task plan exists, create one
    if (!state.taskPlan) {
      const taskPlan = await this.createTaskPlan(state.query, agent, state.intent!);

      this.emitEvent(state, {
        type: 'task_plan_created',
        taskPlan
      });

      return {
        taskGoal: state.query,
        taskPlan,
        activeAgents: [agent.id],
        logs: [`Task plan created with ${taskPlan.steps.length} steps`]
      };
    }

    // Execute current step
    const currentStep = state.taskPlan.steps[state.taskPlan.currentStep];
    if (!currentStep) {
      return {
        response: 'All steps completed',
        logs: ['Task execution complete']
      };
    }

    // Execute step with tools
    const stepResult = await this.executeTaskStep(
      agent,
      currentStep,
      state.retrievedContext
    );

    // Check if checkpoint needed
    if (state.taskPlan.currentStep % 2 === 1) {
      const checkpoint: Checkpoint = {
        id: `checkpoint-${Date.now()}`,
        type: 'approval',
        description: `Approve step: ${currentStep.description}`,
        status: 'pending',
        timestamp: new Date()
      };

      this.emitEvent(state, {
        type: 'checkpoint_required',
        checkpoint
      });

      return {
        activeCheckpoint: checkpoint.id,
        checkpoints: [checkpoint],
        logs: [`Checkpoint required at step ${state.taskPlan.currentStep + 1}`]
      };
    }

    // Move to next step
    const updatedPlan = {
      ...state.taskPlan,
      currentStep: state.taskPlan.currentStep + 1
    };

    return {
      taskPlan: updatedPlan,
      logs: [`Step ${state.taskPlan.currentStep + 1} completed`]
    };
  }

  // ==========================================================================
  // MODE 4: AUTONOMOUS + AUTOMATIC
  // ==========================================================================

  private async autonomousAutomaticFlow(state: SimplifiedState): Promise<Partial<SimplifiedState>> {
    this.emitEvent(state, { type: 'mode_4_start', mode: 'autonomous_automatic' });

    // Select 2-4 best agents for collaborative task
    const agents = await this.selectBestAgents(state.intent!, 4);

    // If no task plan, create collaborative plan
    if (!state.taskPlan) {
      const taskPlan = await this.createCollaborativeTaskPlan(
        state.query,
        agents,
        state.intent!
      );

      this.emitEvent(state, {
        type: 'collaborative_plan_created',
        taskPlan,
        agents: agents.map(a => ({ id: a.id, name: a.name }))
      });

      return {
        taskGoal: state.query,
        taskPlan,
        activeAgents: agents.map(a => a.id),
        logs: [`Collaborative plan created with ${agents.length} agents`]
      };
    }

    // Execute current step with assigned agent
    const currentStep = state.taskPlan.steps[state.taskPlan.currentStep];
    if (!currentStep || !currentStep.agentId) {
      return {
        response: 'All collaborative steps completed',
        logs: ['Collaborative task complete']
      };
    }

    const agent = agents.find(a => a.id === currentStep.agentId);
    if (!agent) {
      return {
        error: 'Agent not found for step execution'
      };
    }

    const stepResult = await this.executeTaskStep(
      agent,
      currentStep,
      state.retrievedContext
    );

    // Checkpoint every 2 steps
    if (state.taskPlan.currentStep % 2 === 1) {
      const checkpoint: Checkpoint = {
        id: `checkpoint-${Date.now()}`,
        type: 'approval',
        description: `Approve step: ${currentStep.description}`,
        status: 'pending',
        timestamp: new Date()
      };

      return {
        activeCheckpoint: checkpoint.id,
        checkpoints: [checkpoint],
        logs: [`Checkpoint at step ${state.taskPlan.currentStep + 1}`]
      };
    }

    const updatedPlan = {
      ...state.taskPlan,
      currentStep: state.taskPlan.currentStep + 1
    };

    return {
      taskPlan: updatedPlan,
      logs: [`Collaborative step ${state.taskPlan.currentStep + 1} completed`]
    };
  }

  // ==========================================================================
  // SYNTHESIS NODE
  // ==========================================================================

  private async synthesizeResponse(state: SimplifiedState): Promise<Partial<SimplifiedState>> {
    this.emitEvent(state, { type: 'synthesis_complete' });

    const sources = state.retrievedContext.map((doc, idx) => ({
      id: `source-${idx}`,
      title: doc.metadata.title || 'Unknown',
      excerpt: doc.pageContent.substring(0, 200),
      similarity: doc.metadata.similarity || 0
    }));

    return {
      sources,
      metadata: {
        mode: getModeFromToggles(state.isAutonomous, state.isAutomatic),
        agentCount: state.activeAgents.length,
        turnCount: state.turnCount,
        timestamp: new Date().toISOString()
      },
      logs: ['Response synthesis complete']
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private async getAgentById(agentId: string): Promise<Agent | null> {
    const { data, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (error || !data) return null;
    return data as Agent;
  }

  private async selectBestAgents(intent: Intent, maxAgents: number): Promise<Agent[]> {
    const { data, error } = await this.supabase
      .from('agents')
      .select('*')
      .contains('capabilities', intent.domains)
      .order('tier', { ascending: false })
      .limit(maxAgents);

    if (error || !data) return [];
    return data as Agent[];
  }

  private async retrieveAgentSpecificContext(
    query: string,
    agent: Agent,
    limit: number
  ): Promise<Document[]> {
    try {
      const vectorStore = await SupabaseVectorStore.fromExistingIndex(
        this.embeddings,
        {
          client: this.supabase,
          tableName: 'documents',
          queryName: 'match_documents'
        }
      );

      const results = await vectorStore.similaritySearch(query, limit);
      return results;
    } catch (error) {
      console.error('Context retrieval error:', error);
      return [];
    }
  }

  private async retrieveMultiDomainContext(
    query: string,
    domains: string[],
    limit: number
  ): Promise<Document[]> {
    return this.retrieveAgentSpecificContext({ id: 'multi', name: 'Multi' } as Agent, query, limit);
  }

  private async generateAgentResponse(
    agent: Agent,
    query: string,
    context: Document[],
    history: BaseMessage[]
  ): Promise<string> {
    const llm = new ChatOpenAI({
      modelName: agent.model || MODEL_CONFIG.tier2.model,
      temperature: 0.2,
      maxTokens: 2048
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', agent.systemPrompt || `You are ${agent.name}, an expert in ${agent.capabilities.join(', ')}.`],
      new MessagesPlaceholder('history'),
      ['user', `Context:\n${context.map(d => d.pageContent).join('\n\n')}\n\nQuestion: ${query}`]
    ]);

    const chain = prompt.pipe(llm);
    const response = await chain.invoke({ history });

    return response.content as string;
  }

  private async generateCollaborativeResponse(
    agents: Agent[],
    query: string,
    context: Document[],
    history: BaseMessage[]
  ): Promise<string> {
    const responses: string[] = [];

    for (const agent of agents) {
      const response = await this.generateAgentResponse(agent, query, context, history);
      responses.push(`**${agent.name}:**\n${response}`);
    }

    return responses.join('\n\n---\n\n');
  }

  private async createTaskPlan(
    goal: string,
    agent: Agent,
    intent: Intent
  ): Promise<{ steps: TaskStep[]; currentStep: number }> {
    const steps: TaskStep[] = [
      { id: 'step-1', description: 'Research and gather information', status: 'pending' },
      { id: 'step-2', description: 'Analyze findings', status: 'pending' },
      { id: 'step-3', description: 'Generate deliverable', status: 'pending' }
    ];

    return { steps, currentStep: 0 };
  }

  private async createCollaborativeTaskPlan(
    goal: string,
    agents: Agent[],
    intent: Intent
  ): Promise<{ steps: TaskStep[]; currentStep: number }> {
    const steps: TaskStep[] = agents.map((agent, idx) => ({
      id: `step-${idx + 1}`,
      description: `${agent.name}: ${agent.capabilities[0]} analysis`,
      status: 'pending' as const,
      agentId: agent.id
    }));

    steps.push({
      id: `step-${steps.length + 1}`,
      description: 'Synthesize all findings',
      status: 'pending'
    });

    return { steps, currentStep: 0 };
  }

  private async executeTaskStep(
    agent: Agent,
    step: TaskStep,
    context: Document[]
  ): Promise<string> {
    const llm = new ChatOpenAI({
      modelName: agent.model || MODEL_CONFIG.tier2.model
    });

    const prompt = `Execute this task step: ${step.description}\n\nContext: ${context.map(d => d.pageContent.substring(0, 500)).join('\n\n')}`;

    const response = await llm.invoke(prompt);
    return response.content as string;
  }

  private emitEvent(state: SimplifiedState, event: any) {
    if (state.streamEvents && state.onStreamEvent) {
      state.onStreamEvent(event);
    }
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  public async invoke(input: Partial<SimplifiedState>): Promise<SimplifiedState> {
    const compiledGraph = this.graph.compile({ checkpointer: this.checkpointer });

    const config = {
      configurable: {
        thread_id: input.conversationId || `thread-${Date.now()}`
      }
    };

    const result = await compiledGraph.invoke(input, config);
    return result as SimplifiedState;
  }
}

// Export singleton instance
export const simplifiedOrchestrator = new SimplifiedLangGraphOrchestrator();
