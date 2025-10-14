import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { StateGraph, END, START, MemorySaver, Annotation } from '@langchain/langgraph';
import { createClient } from '@supabase/supabase-js';

import { enhancedLangChainService } from './enhanced-langchain-service';
import {
  routeByModeNode,
  routeByModeCondition,
  suggestAgentsNode,
  shouldWaitForUser,
  suggestToolsNode,
  shouldWaitForToolSelection,
  selectAgentAutomaticNode,
  retrieveContextNode,
  processAgentCondition,
  processWithAgentNormalNode,
  processWithAgentAutonomousNode,
  synthesizeResponseNode,
  getStepDescription,
  type WorkflowState,
  type ToolOption
} from './workflow-nodes';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase configuration missing - budget checking will be disabled');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Enhanced State definition for Mode-Aware Multi-Agent workflow
 * Extends the original AskExpertState with mode-aware capabilities
 */
const ModeAwareWorkflowState = Annotation.Root({
  // Core workflow state
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => current.concat(update),
  }),
  query: Annotation<string>(),
  agentId: Annotation<string | null>(),
  selectedAgent: Annotation<any>(),
  suggestedAgents: Annotation<any[]>(),
  context: Annotation<string>(),
  sources: Annotation<any[]>(),
  toolCalls: Annotation<any[]>(),
  answer: Annotation<string>(),
  citations: Annotation<string[]>(),
  tokenUsage: Annotation<any>(),
  metadata: Annotation<Record<string, any>>(),
  
  // Mode context
  interactionMode: Annotation<'automatic' | 'manual'>(),
  autonomousMode: Annotation<boolean>(),
  userId: Annotation<string>(),
  sessionId: Annotation<string>(),
  
  // User-selected tools (for normal mode)
  selectedTools: Annotation<string[]>({
    default: () => []
  }),
  availableTools: Annotation<ToolOption[]>({
    default: () => []
  }),
  
  // Workflow control
  workflowStep: Annotation<string>(),
  requiresUserInput: Annotation<boolean>(),
  
  // Legacy fields for backward compatibility
  question: Annotation<string>(),
  agent: Annotation<any>(),
  ragEnabled: Annotation<boolean>(),
  error: Annotation<string>(),
});

// Legacy interface for backward compatibility
interface AskExpertState {
  messages: BaseMessage[];
  question: string;
  agentId: string;
  sessionId: string;
  userId: string;
  agent: any;
  ragEnabled: boolean;
  context?: string;
  sources?: any[];
  answer?: string;
  citations?: string[];
  tokenUsage?: any;
  error?: string;
}

/**
 * Check if user is within budget
 */
async function checkBudget(state: AskExpertState): Promise<Partial<AskExpertState>> {
  console.log('💰 Checking user budget...');

  // Skip budget check if Supabase not configured
  if (!supabase) {
    console.log('⚠️ Supabase not configured - skipping budget check');
    return {};
  }

  try {
    const { data, error } = await supabase.rpc('check_user_budget', {
      p_user_id: state.userId,
      p_session_id: state.sessionId,
    });

    if (error) throw error;

    if (!data.allowed) {
      return {
        error: `Budget limit exceeded: ${data.reason}. Remaining: $${data.remaining_budget}`,
      };
    }

    console.log(`✅ Budget check passed. Remaining: $${data.remaining_budget}`);
    return {};
  } catch (error) {
    console.error('Budget check failed:', error);
    // Don't block on budget check failure in development
    return {};
  }
}

/**
 * Retrieve relevant context from knowledge base
 */
async function retrieveContext(state: AskExpertState): Promise<Partial<AskExpertState>> {
  if (!state.ragEnabled) {
    console.log('⏭️ RAG disabled, skipping context retrieval');
    return { context: '', sources: [] };
  }

  console.log('🔍 Retrieving context from knowledge base...');

  try {
    const searchResults = await enhancedLangChainService['vectorStore'].similaritySearchWithScore(
      state.question,
      5
    );

    if (searchResults && searchResults.length > 0) {
      const context = searchResults.map(([doc]) => doc.pageContent).join('\n\n');
      const sources = searchResults.map(([doc, score], index) => ({
        id: doc.metadata?.id || index,
        content: doc.pageContent,
        title: doc.metadata?.source_name || doc.metadata?.title || 'Document Chunk',
        excerpt: doc.pageContent.substring(0, 200) + '...',
        similarity: score,
        citation: `[${index + 1}]`,
        domain: doc.metadata?.domain,
        source_id: doc.metadata?.source_id,
      }));

      console.log(`✅ Retrieved ${sources.length} relevant sources`);

      return { context, sources };
    }

    console.log('⚠️ No relevant context found');
    return { context: '', sources: [] };
  } catch (error) {
    console.error('Context retrieval error:', error);
    return { context: '', sources: [] };
  }
}

/**
 * Generate AI response using conversational chain
 */
async function generateResponse(state: AskExpertState): Promise<Partial<AskExpertState>> {
  console.log('🤖 Generating AI response...');

  try {
    const result = await enhancedLangChainService.queryWithChain(
      state.question,
      state.agentId,
      state.sessionId,
      state.agent,
      state.userId
    );

    console.log('✅ Response generated successfully');

    return {
      answer: result.answer,
      sources: result.sources,
      citations: result.citations,
      tokenUsage: result.tokenUsage,
    };
  } catch (error) {
    console.error('Response generation error:', error);
    return {
      error: 'Failed to generate response. Please try again.',
    };
  }
}

/**
 * Route to next step based on state
 */
function routeToNextStep(state: AskExpertState): string {
  if (state.error) {
    return 'error';
  }
  return 'retrieve_context';
}

/**
 * Create Ask Expert workflow graph
 */
export function createAskExpertGraph() {
  const workflow = new StateGraph<AskExpertState>({
    channels: {
      messages: { value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y) },
      question: { value: (x?: string, y?: string) => y ?? x },
      agentId: { value: (x?: string, y?: string) => y ?? x },
      sessionId: { value: (x?: string, y?: string) => y ?? x },
      userId: { value: (x?: string, y?: string) => y ?? x },
      agent: { value: (x?: any, y?: any) => y ?? x },
      ragEnabled: { value: (x?: boolean, y?: boolean) => y ?? x },
      context: { value: (x?: string, y?: string) => y ?? x },
      sources: { value: (x?: any[], y?: any[]) => y ?? x },
      answer: { value: (x?: string, y?: string) => y ?? x },
      citations: { value: (x?: string[], y?: string[]) => y ?? x },
      tokenUsage: { value: (x?: any, y?: any) => y ?? x },
      error: { value: (x?: string, y?: string) => y ?? x },
    },
  });

  // Add nodes
  workflow.addNode('check_budget', checkBudget);
  workflow.addNode('retrieve_context', retrieveContext);
  workflow.addNode('generate_response', generateResponse);
  workflow.addNode('error', (state: AskExpertState) => state);

  // Add edges
  workflow.addEdge(START, 'check_budget');
  workflow.addConditionalEdges(
    'check_budget',
    routeToNextStep,
    {
      retrieve_context: 'retrieve_context',
      error: 'error',
    }
  );
  workflow.addEdge('retrieve_context', 'generate_response');
  workflow.addEdge('generate_response', END);
  workflow.addEdge('error', END);

  return workflow;
}

/**
 * Compile graph with memory persistence
 */
export function compileAskExpertGraph() {
  const workflow = createAskExpertGraph();
  const checkpointer = new MemorySaver();

  const app = workflow.compile({ checkpointer });

  console.log('✅ Ask Expert LangGraph workflow compiled');

  return app;
}

/**
 * Execute Ask Expert workflow
 */
export async function executeAskExpertWorkflow(input: {
  question: string;
  agentId: string;
  sessionId: string;
  userId: string;
  agent: any;
  ragEnabled: boolean;
  chatHistory: any[];
}) {
  console.log('🚀 Starting Ask Expert LangGraph workflow');

  const app = compileAskExpertGraph();

  // Convert chat history to LangChain messages
  const messages: BaseMessage[] = (input.chatHistory || []).map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });

  // Add current question
  messages.push(new HumanMessage(input.question));

  // Execute workflow
  const result = await app.invoke(
    {
      messages,
      question: input.question,
      agentId: input.agentId,
      sessionId: input.sessionId,
      userId: input.userId,
      agent: input.agent,
      ragEnabled: input.ragEnabled,
    },
    {
      configurable: {
        thread_id: input.sessionId,
      },
    }
  );

  console.log('✅ Workflow execution complete');

  return result;
}

/**
 * Create Mode-Aware Multi-Agent Workflow Graph
 * Supports all 4 mode combinations: Manual/Automatic + Normal/Autonomous
 */
export function createModeAwareWorkflowGraph() {
  console.log('🔧 Creating mode-aware multi-agent workflow graph');
  
  const graph = new StateGraph(ModeAwareWorkflowState)
    // Core workflow nodes
    .addNode("routeByMode", routeByModeNode)
    .addNode("suggestAgents", suggestAgentsNode)
    .addNode("suggestTools", suggestToolsNode)
    .addNode("selectAgentAutomatic", selectAgentAutomaticNode)
    .addNode("retrieveContext", retrieveContextNode)
    .addNode("processWithAgentNormal", processWithAgentNormalNode)
    .addNode("processWithAgentAutonomous", processWithAgentAutonomousNode)
    .addNode("synthesizeResponse", synthesizeResponseNode)
    
    // Workflow edges
    .addEdge(START, "routeByMode")
    
    // Mode-based routing - check if agent is already selected
    .addConditionalEdges("routeByMode", (state) => {
      if (state.interactionMode === 'manual') {
        // If agent is already selected, skip agent selection
        return state.selectedAgent ? 'suggestTools' : 'suggestAgents';
      }
      return 'suggestTools'; // automatic mode
    }, {
      manual: "suggestAgents",
      manual_with_agent: "suggestTools",
      automatic: "suggestTools"
    })
    
    // Manual mode: Agent selection
    .addConditionalEdges("suggestAgents", shouldWaitForUser, {
      awaitSelection: "suggestTools",  // Continue to tool selection
      proceed: "suggestTools"
    })
    
    // Tool selection (for normal mode)
    .addConditionalEdges("suggestTools", shouldWaitForToolSelection, {
      awaitTools: "selectAgentAutomatic",  // Continue to agent selection
      proceed: "selectAgentAutomatic"
    })
    
    // Automatic mode: Direct to agent selection
    .addEdge("selectAgentAutomatic", "retrieveContext")
    
    // Context retrieval - route based on autonomous mode
    .addConditionalEdges("retrieveContext", processAgentCondition, {
      normal: "processWithAgentNormal",
      autonomous: "processWithAgentAutonomous"
    })
    
    // Response synthesis
    .addEdge("processWithAgentNormal", "synthesizeResponse")
    .addEdge("processWithAgentAutonomous", "synthesizeResponse")
    .addEdge("synthesizeResponse", END);

  return graph;
}

/**
 * Compile Mode-Aware Workflow with Checkpointing
 */
export function compileModeAwareWorkflow() {
  const workflow = createModeAwareWorkflowGraph();
  const checkpointer = new MemorySaver();
  const app = workflow.compile({ checkpointer });
  
  console.log('✅ Mode-aware workflow compiled with checkpointing');
  return app;
}

/**
 * Execute Mode-Aware Workflow
 * Handles all 4 mode combinations with proper routing
 */
export async function executeModeAwareWorkflow(input: {
  query: string;
  agentId?: string;
  sessionId: string;
  userId: string;
  selectedAgent?: any;
  interactionMode: 'automatic' | 'manual';
  autonomousMode: boolean;
  selectedTools?: string[];
  chatHistory: any[];
}) {
  console.log(`🚀 Executing mode-aware workflow: ${input.interactionMode} + ${input.autonomousMode ? 'Autonomous' : 'Normal'}`);
  
  const app = compileModeAwareWorkflow();
  
  // Convert chat history to BaseMessage format
  const messages: BaseMessage[] = (input.chatHistory || []).map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });

  // Add current query
  messages.push(new HumanMessage(input.query));

  // Execute workflow
  const result = await app.invoke(
    {
      messages,
      query: input.query,
      agentId: input.agentId || null,
      selectedAgent: input.selectedAgent || null,
      suggestedAgents: [],
      context: '',
      sources: [],
      toolCalls: [],
      answer: '',
      citations: [],
      tokenUsage: {},
      metadata: {},
      interactionMode: input.interactionMode,
      autonomousMode: input.autonomousMode,
      userId: input.userId,
      sessionId: input.sessionId,
      selectedTools: input.selectedTools || [],
      availableTools: [],
      workflowStep: 'starting',
      requiresUserInput: false,
      // Legacy fields
      question: input.query,
      agent: input.selectedAgent,
      ragEnabled: input.autonomousMode,
      error: ''
    },
    {
      configurable: {
        thread_id: input.sessionId,
      },
    }
  );

  console.log('✅ Mode-aware workflow execution complete');
  return result;
}

/**
 * Stream Mode-Aware Workflow (for real-time updates)
 */
export async function* streamModeAwareWorkflow(input: {
  query: string;
  agentId?: string;
  sessionId: string;
  userId: string;
  selectedAgent?: any;
  interactionMode: 'automatic' | 'manual';
  autonomousMode: boolean;
  selectedTools?: string[];
  chatHistory: any[];
}) {
  console.log(`🌊 Starting streaming mode-aware workflow: ${input.interactionMode} + ${input.autonomousMode ? 'Autonomous' : 'Normal'}`);
  
  const app = compileModeAwareWorkflow();
  
  // Convert chat history to BaseMessage format
  const messages: BaseMessage[] = (input.chatHistory || []).map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });

  // Add current query
  messages.push(new HumanMessage(input.query));
  
  console.log('📝 [Streaming Workflow] Initialized messages:', {
    chatHistoryLength: input.chatHistory?.length || 0,
    totalMessages: messages.length,
    messageTypes: messages.map(m => m._getType())
  });

  // Stream workflow execution
  const stream = await app.stream(
    {
      messages,
      query: input.query,
      agentId: input.agentId || null,
      selectedAgent: input.selectedAgent || null,
      suggestedAgents: [],
      context: '',
      sources: [],
      toolCalls: [],
      answer: '',
      citations: [],
      tokenUsage: {},
      metadata: {},
      interactionMode: input.interactionMode,
      autonomousMode: input.autonomousMode,
      userId: input.userId,
      sessionId: input.sessionId,
      selectedTools: input.selectedTools || [],
      availableTools: [],
      workflowStep: 'starting',
      requiresUserInput: false,
      // Legacy fields
      question: input.query,
      agent: input.selectedAgent,
      ragEnabled: input.autonomousMode,
      error: ''
    },
    {
      configurable: {
        thread_id: input.sessionId,
      },
      streamMode: "values"
    }
  );

  // Yield step-by-step updates with real-time reasoning
  let hasGeneratedAnswer = false;
  
  for await (const event of stream) {
    const stepDescription = getStepDescription(
      event.workflowStep || 'processing',
      input.interactionMode,
      input.autonomousMode,
      event.selectedAgent
    );
    
    // Send detailed reasoning events based on actual workflow state
    yield {
      type: 'reasoning',
      step: event.workflowStep,
      description: stepDescription,
      data: {
        ...event,
        timestamp: Date.now(),
        mode: `${input.interactionMode}_${input.autonomousMode ? 'autonomous' : 'normal'}`,
        agent: event.selectedAgent?.display_name || event.selectedAgent?.name || 'System'
      }
    };
    
    // Send intermediate progress updates
    if (event.workflowStep === 'context_retrieved' && event.context) {
      yield {
        type: 'reasoning',
        step: 'context_analysis',
        description: `🧠 Analyzing retrieved context (${event.context.length} characters)...`,
        data: {
          ...event,
          timestamp: Date.now(),
          contextLength: event.context.length
        }
      };
    }
    
    if (event.workflowStep === 'response_generated' && event.toolCalls) {
      yield {
        type: 'reasoning',
        step: 'tool_execution',
        description: `🔧 Executed ${event.toolCalls.length} tool calls...`,
        data: {
          ...event,
          timestamp: Date.now(),
          toolCount: event.toolCalls.length
        }
      };
    }
    
    // If this is the final step with an answer, send it as content
    if (event.answer && (event.workflowStep === 'response_generated' || event.workflowStep === 'complete')) {
      console.log('📤 [Workflow] Sending final answer as content:', {
        answerLength: event.answer.length,
        workflowStep: event.workflowStep,
        agent: event.selectedAgent?.name
      });
      
      hasGeneratedAnswer = true;
      
      yield {
        type: 'content',
        content: event.answer,
        metadata: {
          agent: event.selectedAgent,
          sources: event.sources || [],
          citations: event.citations || [],
          tokenUsage: event.tokenUsage || {},
          reasoning: stepDescription,
          workflowSteps: event.metadata?.workflowSteps || []
        }
      };
    }
    
    // Debug: Log all events to see what's being generated
    console.log('📊 [Workflow] Event details:', {
      workflowStep: event.workflowStep,
      hasAnswer: !!event.answer,
      answerLength: event.answer?.length || 0,
      selectedAgent: event.selectedAgent?.name,
      keys: Object.keys(event)
    });
  }
  
  // Fallback: If no answer was generated, send a default response
  if (!hasGeneratedAnswer) {
    console.log('⚠️ [Workflow] No answer generated, sending fallback response');
    yield {
      type: 'content',
      content: 'I apologize, but I encountered an issue while processing your request. Please try again.',
      metadata: {
        agent: null,
        sources: [],
        citations: [],
        tokenUsage: {},
        reasoning: 'Workflow completed without generating a response',
        workflowSteps: []
      }
    };
  }
}

/**
 * Stream Ask Expert workflow (for real-time updates)
 */
export async function* streamAskExpertWorkflow(input: {
  question: string;
  agentId: string;
  sessionId: string;
  userId: string;
  agent: any;
  ragEnabled: boolean;
  chatHistory: any[];
}) {
  console.log('🌊 Starting streaming Ask Expert workflow');

  const app = compileAskExpertGraph();

  const messages: BaseMessage[] = (input.chatHistory || []).map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });

  messages.push(new HumanMessage(input.question));

  // Stream workflow execution
  for await (const event of app.stream(
    {
      messages,
      question: input.question,
      agentId: input.agentId,
      sessionId: input.sessionId,
      userId: input.userId,
      agent: input.agent,
      ragEnabled: input.ragEnabled,
    },
    {
      configurable: {
        thread_id: input.sessionId,
      },
    }
  )) {
    // Yield each step's output
    const [nodeName, nodeOutput] = Object.entries(event)[0];

    yield {
      step: nodeName,
      data: nodeOutput,
      timestamp: new Date().toISOString(),
    };
  }

  console.log('✅ Streaming workflow complete');
}

// Helper to get workflow state
export async function getWorkflowState(sessionId: string) {
  const app = compileAskExpertGraph();

  const state = await app.getState({
    configurable: {
      thread_id: sessionId,
    },
  });

  return state;
}

// Helper to update workflow state
export async function updateWorkflowState(
  sessionId: string,
  updates: Partial<AskExpertState>
) {
  const app = compileAskExpertGraph();

  await app.updateState(
    {
      configurable: {
        thread_id: sessionId,
      },
    },
    updates
  );
}


