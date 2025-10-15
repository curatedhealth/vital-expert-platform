import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { StateGraph, END, START, MemorySaver, Annotation } from '@langchain/langgraph';
import { createClient } from '@supabase/supabase-js';

import { enhancedLangChainService } from './enhanced-langchain-service';
import {
  routeByModeNode,
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
  selectedAgent: Annotation<any>({
    reducer: (current: any, update: any) => {
      console.log('🔄 [selectedAgent reducer] Current:', current?.name, 'Update:', update?.name);
      // Always prefer the update if it exists and has an id
      if (update && update.id) {
        console.log('✅ [selectedAgent reducer] Using update:', update.name);
        return update;
      }
      // Otherwise keep current if it exists
      if (current && current.id) {
        console.log('✅ [selectedAgent reducer] Keeping current:', current.name);
        return current;
      }
      // Return null if neither exists
      console.log('❌ [selectedAgent reducer] No valid agent found');
      return null;
    },
    default: () => null
  }),
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
    value: (x: string[], y: string[]) => y ?? x,
    default: () => []
  }),
  availableTools: Annotation<ToolOption[]>({
    value: (x: ToolOption[], y: ToolOption[]) => y ?? x,
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
    const searchResults = await enhancedLangChainService['vectorStore']?.similaritySearchWithScore(
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
 * Create Ask Expert workflow graph (Legacy - kept for backward compatibility)
 */
export function createAskExpertGraph() {
  // This is a legacy function - use createModeAwareWorkflowGraph instead
  console.warn('⚠️ createAskExpertGraph is deprecated. Use createModeAwareWorkflowGraph instead.');
  return createModeAwareWorkflowGraph();
}

/**
 * Compile graph with memory persistence (Legacy)
 */
export function compileAskExpertGraph() {
  const workflow = createModeAwareWorkflowGraph();
  const checkpointer = new MemorySaver();

  const app = workflow.compile({ checkpointer });

  console.log('✅ Ask Expert LangGraph workflow compiled');

  return app;
}

/**
 * Execute Ask Expert workflow (Legacy)
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
  console.log('🚀 Starting Ask Expert LangGraph workflow (Legacy)');

  // Use the new mode-aware workflow
  return executeModeAwareWorkflow({
    query: input.question,
    agentId: input.agentId,
    sessionId: input.sessionId,
    userId: input.userId,
    selectedAgent: input.agent,
    interactionMode: 'automatic',
    autonomousMode: input.ragEnabled,
    selectedTools: [],
    chatHistory: input.chatHistory
  });
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
      console.log(`🔀 [Workflow] Routing decision: mode=${state.interactionMode}, hasAgent=${!!state.selectedAgent}, workflowStep=${state.workflowStep}`);
      
      // Use the routing decision from the routeByModeNode
      if (state.metadata?.routingDecision === 'manual_with_agent') {
        console.log(`✅ [Workflow] Routing to retrieveContext (manual with agent)`);
        return 'manual_with_agent';
      } else if (state.metadata?.routingDecision === 'manual') {
        console.log(`⏳ [Workflow] Routing to suggestAgents (manual mode)`);
        return 'manual';
      } else {
        console.log(`🤖 [Workflow] Routing to suggestTools (automatic mode)`);
        return 'automatic';
      }
    }, {
      manual: "suggestAgents",
      manual_with_agent: "retrieveContext", // Skip tool selection for manual mode with pre-selected agent
      automatic: "suggestTools"
    })
    
    // Manual mode: Agent selection
    .addConditionalEdges("suggestAgents", shouldWaitForUser, {
      awaitSelection: "retrieveContext",  // Skip tool selection in manual mode
      proceed: "retrieveContext"
    })
    
    // Tool selection (for automatic mode only)
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
  const encoder = new TextEncoder();
  
  console.log(`🌊 Starting streaming mode-aware workflow: ${input.interactionMode} + ${input.autonomousMode ? 'Autonomous' : 'Normal'}`);
  console.log(`🔍 [Workflow] Input parameters:`, {
    query: input.query,
    selectedAgent: input.selectedAgent?.name,
    interactionMode: input.interactionMode,
    autonomousMode: input.autonomousMode,
    selectedTools: input.selectedTools
  });
  
  // CRITICAL: Validate manual mode requirements
  if (input.interactionMode === 'manual' && !input.selectedAgent) {
    console.error('❌ [Workflow] Manual mode requires agent');
    yield encoder.encode(`data: ${JSON.stringify({
      type: 'error',
      content: 'Please select an AI agent before sending a message in Manual Mode.',
      data: { 
        code: 'NO_AGENT_SELECTED',
        interactionMode: input.interactionMode 
      }
    })}\n\n`);
    yield encoder.encode(`data: [DONE]\n\n`);
    return;
  }
  
  // Validate agent structure
  if (input.selectedAgent && !input.selectedAgent.id) {
    console.error('❌ [Workflow] Invalid agent structure');
    yield encoder.encode(`data: ${JSON.stringify({
      type: 'error',
      content: 'Invalid agent selected. Please select another agent.',
      data: { code: 'INVALID_AGENT' }
    })}\n\n`);
    yield encoder.encode(`data: [DONE]\n\n`);
    return;
  }
  
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
  console.log('🚀 [Workflow] Starting workflow execution with state:', {
    messages: messages.length,
    query: input.query,
    selectedAgent: input.selectedAgent?.name,
    selectedAgentId: input.selectedAgent?.id,
    selectedAgentObject: input.selectedAgent,
    selectedAgentType: typeof input.selectedAgent,
    selectedAgentKeys: input.selectedAgent ? Object.keys(input.selectedAgent) : 'null',
    interactionMode: input.interactionMode,
    autonomousMode: input.autonomousMode
  });
  
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
  
  console.log('✅ [Workflow] Stream created, starting to process events...');

  // Yield step-by-step updates with real-time reasoning
  let hasGeneratedAnswer = false;
  let eventCount = 0;
  
  console.log('🔄 [Workflow] Starting to process stream events...');
  
  try {
    for await (const event of stream) {
      try {
        eventCount++;
        console.log(`📊 [Workflow] Processing event #${eventCount}`);
        console.log('🔍 [Stream] Raw event structure:', {
          keys: Object.keys(event),
          eventType: typeof event,
          eventValue: event
        });
        
        // LangGraph stream in "values" mode returns { nodeName: state } format
        const nodeName = Object.keys(event)[0];
        const state = (event as any)[nodeName];
        
        // Validate event structure
        if (!nodeName || !state) {
          throw new Error('Malformed stream event');
        }
    
    console.log('🔍 [Stream] Node execution:', {
      nodeName,
      stateKeys: Object.keys(state),
      workflowStep: state.workflowStep,
      hasAnswer: !!state.answer,
      hasReasoningSteps: !!(state.metadata?.reasoningSteps?.length),
      answerLength: state.answer?.length || 0,
      contextLength: state.context?.length || 0,
      selectedAgent: state.selectedAgent?.name,
      selectedAgentId: state.selectedAgent?.id,
      selectedAgentObject: state.selectedAgent,
      interactionMode: state.interactionMode,
      autonomousMode: state.autonomousMode
    });
    
    const stepDescription = getStepDescription(
      state.workflowStep || 'processing',
      input.interactionMode,
      input.autonomousMode,
      state.selectedAgent
    );
    
    // Send detailed reasoning events based on actual workflow state
    // Only include essential data to avoid JSON truncation
    const reasoningData = {
      workflowStep: state.workflowStep,
      selectedAgent: (state.selectedAgent || input.selectedAgent) ? {
        id: (state.selectedAgent || input.selectedAgent).id,
        name: (state.selectedAgent || input.selectedAgent).name,
        display_name: (state.selectedAgent || input.selectedAgent).display_name
      } : null,
      query: state.query,
      agentId: state.agentId,
      timestamp: Date.now(),
      mode: `${input.interactionMode}_${input.autonomousMode ? 'autonomous' : 'normal'}`,
      agent: (state.selectedAgent || input.selectedAgent)?.display_name || (state.selectedAgent || input.selectedAgent)?.name || 'System',
      interactionMode: input.interactionMode,
      autonomousMode: input.autonomousMode,
      // Include only essential metadata
      metadata: state.metadata ? {
        processing_mode: state.metadata.processing_mode,
        modeReasoning: state.metadata.modeReasoning,
        agentUsed: state.metadata.agentUsed,
        reasoningSteps: state.metadata.reasoningSteps || []
      } : {}
    };
    
    // Ensure data is JSON serializable
    const sanitizedData = JSON.parse(JSON.stringify(reasoningData));
    
    yield {
      type: 'reasoning',
      step: state.workflowStep,
      description: stepDescription,
      data: sanitizedData
    };
    
    // Send intermediate progress updates
    if (state.workflowStep === 'context_retrieved' && state.context) {
      const contextData = {
        workflowStep: 'context_analysis',
        contextLength: state.context.length,
        timestamp: Date.now(),
        interactionMode: input.interactionMode,
        autonomousMode: input.autonomousMode,
        agent: state.selectedAgent?.display_name || state.selectedAgent?.name || 'System'
      };
      
      yield {
        type: 'reasoning',
        step: 'context_analysis',
        description: `🧠 Analyzing retrieved context (${state.context.length} characters)...`,
        data: contextData
      };
    }
    
    if (state.workflowStep === 'response_generated' && state.toolCalls) {
      const toolData = {
        workflowStep: 'tool_execution',
        toolCount: state.toolCalls.length,
        timestamp: Date.now(),
        interactionMode: input.interactionMode,
        autonomousMode: input.autonomousMode,
        agent: state.selectedAgent?.display_name || state.selectedAgent?.name || 'System',
        tools: state.toolCalls.map((tc: any) => ({
          tool: tc.action?.tool || 'unknown',
          status: 'completed'
        }))
      };
      
      yield {
        type: 'reasoning',
        step: 'tool_execution',
        description: `🔧 Executed ${state.toolCalls.length} tool calls...`,
        data: toolData
      };
    }
    
    // If this is the final step with an answer, send it as content
    if (state.answer && (state.workflowStep === 'response_generated' || state.workflowStep === 'complete')) {
      console.log('📤 [Workflow] Sending final answer as content:', {
        answerLength: state.answer.length,
        workflowStep: state.workflowStep,
        agent: state.selectedAgent?.name
      });
      
      hasGeneratedAnswer = true;
      
      const contentMetadata = {
        agent: state.selectedAgent ? {
          id: state.selectedAgent.id,
          name: state.selectedAgent.name,
          display_name: state.selectedAgent.display_name
        } : null,
        sources: state.sources || [],
        citations: state.citations || [],
        tokenUsage: state.tokenUsage || {},
        reasoning: stepDescription,
        workflowSteps: state.metadata?.workflowSteps || [],
        interactionMode: input.interactionMode,
        autonomousMode: input.autonomousMode,
        reasoningSteps: state.metadata?.reasoningSteps || []
      };
      
      yield {
        type: 'content',
        content: state.answer,
        metadata: contentMetadata
      };
    }
    
        // Debug: Log all events to see what's being generated
        console.log('📊 [Workflow] Event details:', {
          nodeName,
          workflowStep: state.workflowStep,
          hasAnswer: !!state.answer,
          answerLength: state.answer?.length || 0,
          selectedAgent: state.selectedAgent?.name,
          hasReasoningSteps: !!(state.metadata?.reasoningSteps?.length),
          stateKeys: Object.keys(state)
        });
      } catch (eventError) {
        console.error('❌ Event processing error:', eventError);
        yield encoder.encode(`data: ${JSON.stringify({
          type: 'error:event',
          message: String(eventError)
        })}\n\n`);
        // Continue processing other events
      }
    }
  } catch (streamError) {
    console.error('❌ Fatal stream error:', streamError);
    yield encoder.encode(`data: ${JSON.stringify({
      type: 'error:fatal',
      message: String(streamError)
    })}\n\n`);
  } finally {
    console.log(`🏁 [Workflow] Stream processing complete. Total events: ${eventCount}, Answer generated: ${hasGeneratedAnswer}`);
  }
  
  // Fallback: If no answer was generated, send a default response
  if (!hasGeneratedAnswer) {
    console.log('⚠️ [Workflow] No answer generated, sending fallback response');
    const fallbackMetadata = {
      agent: null,
      sources: [],
      citations: [],
      tokenUsage: {},
      reasoning: 'Workflow completed without generating a response - fallback activated',
      workflowSteps: [],
      error: 'No answer generated by workflow',
      fallbackUsed: true,
      interactionMode: input.interactionMode,
      autonomousMode: input.autonomousMode,
      reasoningSteps: []
    };
    
    yield {
      type: 'content',
      content: 'I apologize, but I encountered an issue while processing your request. This might be due to a temporary service issue. Please try rephrasing your question or contact support if the problem persists.',
      metadata: fallbackMetadata
    };
  }
  
  // Always signal completion
  yield encoder.encode(`data: [DONE]\n\n`);
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
  for await (const event of await app.stream(
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


