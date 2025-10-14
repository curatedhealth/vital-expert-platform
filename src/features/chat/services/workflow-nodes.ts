/**
 * Mode-Aware Workflow Nodes for LangGraph Multi-Agent System
 * Supports all 4 mode combinations: Manual/Automatic + Normal/Autonomous
 */

import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { getAllExpertTools } from '../../../lib/services/expert-tools';
import { AutomaticAgentOrchestrator } from './automatic-orchestrator';
import { enhancedLangChainService } from './enhanced-langchain-service';

// Types
export interface WorkflowState {
  messages: BaseMessage[];
  query: string;
  agentId: string | null;
  selectedAgent: any;
  suggestedAgents: any[];
  context: string;
  sources: any[];
  toolCalls: any[];
  answer: string;
  citations: string[];
  tokenUsage: any;
  metadata: Record<string, any>;
  
  // Mode context
  interactionMode: 'automatic' | 'manual';
  autonomousMode: boolean;
  userId: string;
  sessionId: string;
  
  // User-selected tools (for normal mode)
  selectedTools: string[];
  availableTools: ToolOption[];
  
  // Workflow control
  workflowStep: string;
  requiresUserInput: boolean;
}

export interface ToolOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'research' | 'knowledge' | 'analysis' | 'regulatory';
  enabled: boolean;
}

// Initialize LLM
const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Initialize orchestrator
const orchestrator = new AutomaticAgentOrchestrator();

/**
 * Route by Mode Node
 * Determines workflow path based on interactionMode and autonomousMode
 */
export async function routeByModeNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  const { interactionMode, autonomousMode, selectedAgent } = state;
  
  console.log(`🔄 [RouteByMode] Routing by mode: ${interactionMode} + ${autonomousMode ? 'Autonomous' : 'Normal'}`);
  console.log(`🔍 [RouteByMode] Selected agent: ${selectedAgent?.name || 'none'}`);
  
  // Determine the next step based on mode and agent selection
  let nextStep = 'routing';
  if (interactionMode === 'manual' && selectedAgent) {
    nextStep = 'manual_with_agent';
    console.log(`✅ [RouteByMode] Manual mode with pre-selected agent: ${selectedAgent.name}`);
  } else if (interactionMode === 'manual') {
    nextStep = 'manual';
    console.log(`⏳ [RouteByMode] Manual mode - waiting for agent selection`);
  } else {
    nextStep = 'automatic';
    console.log(`🤖 [RouteByMode] Automatic mode - will select agent automatically`);
  }
  
  return {
    workflowStep: nextStep,
    metadata: {
      ...state.metadata,
      mode: `${interactionMode}_${autonomousMode ? 'autonomous' : 'normal'}`,
      routingDecision: nextStep
    }
  };
}

export function routeByModeCondition(state: WorkflowState): string {
  return state.interactionMode; // 'manual' or 'automatic'
}

/**
 * Suggest Agents Node (Manual Mode)
 * Uses existing AutomaticAgentOrchestrator for agent ranking
 */
export async function suggestAgentsNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('🎯 Manual mode: Suggesting agents for user selection');
  console.log(`🔍 [SuggestAgents] State: mode=${state.interactionMode}, hasSelectedAgent=${!!state.selectedAgent}, agentId=${state.agentId}`);
  
  // If we already have a selected agent in manual mode, don't suggest new ones
  if (state.selectedAgent && state.interactionMode === 'manual') {
    console.log('✅ [SuggestAgents] Agent already selected in manual mode, proceeding directly');
    return {
      suggestedAgents: [state.selectedAgent],
      requiresUserInput: false,
      workflowStep: 'agent_selected'
    };
  }
  
  try {
    const suggestions = await orchestrator.getAgentSuggestions(state.query);
    
    return {
      suggestedAgents: suggestions.rankedAgents.slice(0, 3),
      requiresUserInput: true,
      workflowStep: 'awaiting_selection'
    };
  } catch (error) {
    console.error('Error suggesting agents:', error);
    return {
      suggestedAgents: [],
      requiresUserInput: false,
      workflowStep: 'error',
      metadata: {
        ...state.metadata,
        error: 'Failed to suggest agents'
      }
    };
  }
}

export function shouldWaitForUser(state: WorkflowState): string {
  console.log(`🤔 [ShouldWaitForUser] requiresUserInput=${state.requiresUserInput}, hasSelectedAgent=${!!state.selectedAgent}, mode=${state.interactionMode}`);
  
  // If we already have a selected agent in manual mode, proceed directly
  if (state.selectedAgent && state.interactionMode === 'manual') {
    console.log('✅ [ShouldWaitForUser] Agent already selected, proceeding directly');
    return 'proceed';
  }
  
  return state.requiresUserInput ? 'awaitSelection' : 'proceed';
}

/**
 * Tool Suggestion Node
 * Provides available tools for user selection in normal mode
 */
export async function suggestToolsNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('🔧 Suggesting available tools for user selection');
  
  const availableTools: ToolOption[] = [
    {
      id: 'web_search',
      name: 'Web Search',
      description: 'Search the web for current information, news, research papers',
      icon: '🌐',
      category: 'research',
      enabled: false
    },
    {
      id: 'pubmed_search', 
      name: 'PubMed Search',
      description: 'Search peer-reviewed medical literature',
      icon: '📚',
      category: 'research',
      enabled: false
    },
    {
      id: 'knowledge_base',
      name: 'RAG Search',
      description: 'Search internal knowledge base and documents',
      icon: '🧠',
      category: 'knowledge',
      enabled: false
    },
    {
      id: 'calculator',
      name: 'Calculator',
      description: 'Perform mathematical calculations and statistical analysis',
      icon: '🧮',
      category: 'analysis',
      enabled: false
    },
    {
      id: 'fda_database',
      name: 'FDA Database',
      description: 'Search FDA approvals and regulatory information',
      icon: '🏛️',
      category: 'regulatory',
      enabled: false
    }
  ];
  
  return {
    availableTools,
    requiresUserInput: !state.autonomousMode && (!state.selectedTools || state.selectedTools.length === 0), // Only require selection in normal mode if no tools selected
    workflowStep: 'tool_selection'
  };
}

export function shouldWaitForToolSelection(state: WorkflowState): string {
  // In autonomous mode, always proceed
  if (state.autonomousMode) {
    return 'proceed';
  }
  
  // In normal mode, check if tools are already selected
  if (state.selectedTools && state.selectedTools.length > 0) {
    return 'proceed';
  }
  
  // Otherwise, wait for tool selection
  return 'awaitTools';
}

/**
 * Automatic Agent Selection Node
 * Uses existing AutomaticAgentOrchestrator for automatic selection
 */
export async function selectAgentAutomaticNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('🤖 Automatic mode: Selecting best agent automatically');
  
  try {
    const result = await orchestrator.chat(state.query);
    
    return {
      selectedAgent: result.selectedAgent,
      suggestedAgents: [result.selectedAgent], // For consistency
      requiresUserInput: false,
      workflowStep: 'agent_selected'
    };
  } catch (error) {
    console.error('Error selecting agent automatically:', error);
    
    // Create a fallback agent to ensure workflow continues
    const fallbackAgent = {
      id: 'fallback-agent',
      name: 'General AI Assistant',
      display_name: 'General AI Assistant',
      description: 'A general-purpose AI assistant that can help with various questions',
      system_prompt: 'You are a helpful AI assistant. Please provide accurate and helpful responses to user questions.',
      business_function: 'General Assistance',
      tier: 1,
      capabilities: ['general_assistance', 'question_answering'],
      rag_enabled: false
    };
    
    return {
      selectedAgent: fallbackAgent,
      suggestedAgents: [fallbackAgent],
      requiresUserInput: false,
      workflowStep: 'agent_selected',
      metadata: {
        ...state.metadata,
        error: 'Failed to select agent automatically, using fallback',
        fallbackUsed: true
      }
    };
  }
}

/**
 * Retrieve Context Node
 * Uses existing RAG service for context retrieval
 */
export async function retrieveContextNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('🔍 Retrieving context from knowledge base');
  
  // Add mode-specific reasoning
  const modeContext = state.interactionMode === 'manual' 
    ? `Using manually selected agent: ${state.selectedAgent?.display_name || state.selectedAgent?.name}`
    : 'Using automatically selected agent';
  
  console.log(`📋 [Context] ${modeContext}`);
  
  try {
    const result = await enhancedLangChainService.queryWithChain(
      state.query,
      state.selectedAgent?.id || 'default',
      state.sessionId,
      state.selectedAgent,
      state.userId
    );
    
    return {
      context: result.answer,
      sources: result.sources,
      citations: result.citations,
      tokenUsage: result.tokenUsage,
      workflowStep: 'context_retrieved',
      metadata: {
        ...state.metadata,
        modeContext,
        agentUsed: state.selectedAgent?.name || 'Unknown'
      }
    };
  } catch (error) {
    console.error('Error retrieving context:', error);
    return {
      context: '',
      sources: [],
      citations: [],
      workflowStep: 'context_retrieved',
      metadata: {
        ...state.metadata,
        modeContext,
        error: 'Context retrieval failed'
      }
    };
  }
}

/**
 * Process Agent Condition
 * Routes to normal or autonomous processing based on mode
 */
export function processAgentCondition(state: WorkflowState): string {
  return state.autonomousMode ? 'autonomous' : 'normal';
}

/**
 * Normal Mode Processing (with User-Selected Tools)
 * Creates ReAct agent with only user-selected tools
 */
export async function processWithAgentNormalNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('💬 [ProcessWithAgentNormal] Starting normal mode processing');
  console.log('🔍 [ProcessWithAgentNormal] State:', {
    selectedAgent: state.selectedAgent?.name,
    query: state.query,
    messagesCount: state.messages?.length || 0,
    selectedTools: state.selectedTools,
    interactionMode: state.interactionMode,
    autonomousMode: state.autonomousMode,
    contextLength: state.context?.length || 0
  });
  
  const { selectedAgent, query, messages, selectedTools, interactionMode } = state;
  
  // Add mode-specific reasoning
  const modeReasoning = interactionMode === 'manual' 
    ? `Processing with manually selected agent: ${selectedAgent?.display_name || selectedAgent?.name}`
    : 'Processing with automatically selected agent';
  
  console.log(`🧠 [Processing] ${modeReasoning}`);
  
  try {
    // Get user-selected tools
    const allTools = getAllExpertTools();
    const userTools = allTools.filter(tool => 
      selectedTools.includes(tool.name)
    );
    
    console.log(`🔧 [Tools] Using ${userTools.length} selected tools:`, userTools.map(t => t.name));
    
    // Create ReAct agent with selected tools
    const agent = await createReactAgent({
      llm: model,
      tools: userTools
    });
    
    // Ensure messages array is not empty
    const agentMessages = messages.length > 0 ? messages : [new HumanMessage(query)];
    
    console.log('🤖 [Normal Mode] Invoking agent with messages:', {
      messageCount: agentMessages.length,
      messageTypes: agentMessages.map(m => m._getType()),
      agentName: selectedAgent?.name,
      mode: interactionMode
    });
    
    // ReAct agent expects input directly, not chat_history
    let result;
    let reasoningSteps: Array<{
      step: number;
      description: string;
      toolUsed: string;
      status: string;
      timestamp: string;
    }> = [];
    
    try {
      result = await agent.invoke({
        messages: agentMessages
      });
      
      // Extract reasoning steps from intermediate steps
      if (result && typeof result === 'object' && 'intermediateSteps' in result) {
        const steps = (result as any).intermediateSteps;
        if (Array.isArray(steps)) {
          reasoningSteps = steps.map((step: any, index: number) => ({
            step: index + 1,
            description: `Tool execution: ${step.action?.tool || 'Unknown tool'}`,
            toolUsed: step.action?.tool,
            status: 'completed',
            timestamp: new Date().toISOString()
          }));
        }
      }
    } catch (agentError) {
      console.error('ReAct agent invoke failed:', agentError);
      // Fallback to simple LLM call
      const fallbackResponse = await model.invoke(agentMessages);
      result = {
        output: fallbackResponse.content,
        intermediateSteps: []
      };
      reasoningSteps = [{
        step: 1,
        description: 'Fallback to direct LLM call due to agent error',
        toolUsed: 'llm_fallback',
        status: 'completed',
        timestamp: new Date().toISOString()
      }];
    }
    
    const response = {
      answer: (result as any).output || (result as any).content || 'No response generated',
      toolCalls: (result as any).intermediateSteps || [],
      workflowStep: 'response_generated',
      metadata: {
        ...state.metadata,
        processing_mode: 'normal',
        tools_used: selectedTools,
        modeReasoning,
        reasoningSteps,
        agentUsed: selectedAgent?.name || 'Unknown'
      }
    };
    
    console.log('✅ [ProcessWithAgentNormal] Completed processing:', {
      answerLength: response.answer.length,
      toolCallsCount: response.toolCalls.length,
      reasoningStepsCount: response.metadata.reasoningSteps.length,
      workflowStep: response.workflowStep
    });
    
    return response;
  } catch (error) {
    console.error('Error processing with normal mode:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      answer: `I apologize, but I encountered an error while processing your request: ${errorMessage}. Please try rephrasing your question or contact support if the issue persists.`,
      toolCalls: [],
      workflowStep: 'response_generated',
      metadata: {
        ...state.metadata,
        processing_mode: 'normal',
        error: errorMessage,
        errorType: 'normal_mode_processing_error',
        modeReasoning
      }
    };
  }
}

/**
 * Autonomous Mode Processing
 * Uses full LangChain agent with all tools and advanced capabilities
 */
export async function processWithAgentAutonomousNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('🔧 Autonomous mode: Processing with LangChain agent + tools');
  
  const { selectedAgent, query, messages } = state;
  
  try {
    // Use existing enhanced-langchain-service with full capabilities
    const result = await enhancedLangChainService.queryWithChain(
      query,
      selectedAgent?.id || 'default',
      state.sessionId,
      selectedAgent,
      state.userId
    );
    
    return {
      answer: result.answer,
      sources: result.sources,
      citations: result.citations,
      tokenUsage: result.tokenUsage,
      workflowStep: 'response_generated',
      metadata: {
        ...state.metadata,
        processing_mode: 'autonomous',
        tools_used: ['rag', 'memory', 'knowledge_base', 'web_search', 'pubmed', 'calculator', 'fda_database']
      }
    };
  } catch (error) {
    console.error('Error processing with autonomous mode:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      answer: `I apologize, but I encountered an error while processing your request with advanced tools: ${errorMessage}. Please try rephrasing your question or contact support if the issue persists.`,
      sources: [],
      citations: [],
      workflowStep: 'response_generated',
      metadata: {
        ...state.metadata,
        processing_mode: 'autonomous',
        error: errorMessage,
        errorType: 'autonomous_mode_processing_error'
      }
    };
  }
}

/**
 * Synthesize Response Node
 * Finalizes the response with metadata and formatting
 */
export async function synthesizeResponseNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('✅ Synthesizing final response');
  
  const { answer, sources, citations, toolCalls, metadata } = state;
  
  // Ensure we always have a valid answer
  const finalAnswer = answer || 'I apologize, but I was unable to generate a response to your question. Please try rephrasing your question or contact support if the issue persists.';
  
  // Add final metadata
  const finalMetadata = {
    ...metadata,
    response_generated: true,
    timestamp: new Date().toISOString(),
    workflow_complete: true,
    hasAnswer: !!answer
  };
  
  return {
    answer: finalAnswer,
    sources: sources || [],
    citations: citations || [],
    toolCalls: toolCalls || [],
    metadata: finalMetadata,
    workflowStep: 'complete'
  };
}

/**
 * Get Step Description for UI
 * Provides user-friendly descriptions for workflow steps
 */
export function getStepDescription(step: string, interactionMode: string, autonomousMode: boolean, selectedAgent?: any): string {
  const mode = `${interactionMode}_${autonomousMode ? 'autonomous' : 'normal'}`;
  
  switch (step) {
    case 'routing':
      return `🔄 Initializing ${interactionMode} mode workflow...`;
    case 'awaiting_selection':
      return `🎯 Found top agents. Please select the best one for your query:`;
    case 'tool_selection':
      return `🔧 Configuring tools for your request...`;
    case 'agent_selected':
      if (interactionMode === 'manual') {
        return `✅ Agent selected: ${selectedAgent?.display_name || selectedAgent?.name || 'Selected Agent'}`;
      }
      return `✅ Agent selected automatically`;
    case 'context_retrieved':
      if (interactionMode === 'manual' && selectedAgent) {
        return `🔍 ${selectedAgent.display_name || selectedAgent.name} is retrieving context...`;
      }
      return autonomousMode ? `🔍 Retrieved context with RAG...` : `🔍 Processing your query...`;
    case 'context_analysis':
      return `🧠 Analyzing retrieved context...`;
    case 'tool_execution':
      return `🔧 Executing specialized tools...`;
    case 'response_generated':
      if (interactionMode === 'manual' && selectedAgent) {
        return `✅ ${selectedAgent.display_name || selectedAgent.name} generated response`;
      }
      return `✅ Response generated successfully`;
    case 'complete':
      return `🎉 Complete!`;
    case 'error':
      return `❌ An error occurred. Please try again.`;
    default:
      return `🔄 Processing...`;
  }
}
