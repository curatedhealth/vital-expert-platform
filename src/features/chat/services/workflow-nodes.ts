import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { MemorySaver, Annotation } from '@langchain/langgraph';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { enhancedLangChainService } from './enhanced-langchain-service';

// LangGraph Best Practice: Structured State with Proper Annotations
export const EnhancedWorkflowState = Annotation.Root({
  // Core message handling
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  
  // Agent and tool state
  selectedAgent: Annotation<any>({
    reducer: (current, update) => update || current,
    default: () => null
  }),
  activeTools: Annotation<any[]>({
    reducer: (current, update) => update || current,
    default: () => []
  }),
  
  // Reasoning and memory
  reasoningSteps: Annotation<any[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  episodicMemory: Annotation<any[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  
  // Execution metadata
  executionPlan: Annotation<any>(),
  currentStep: Annotation<string>(),
  error: Annotation<Error | null>()
});

// LangGraph Best Practice: ReAct Agent with Enhanced Reasoning
export async function createEnhancedReActAgent(
  agent: any,
  tools: any[],
  options?: {
    streaming?: boolean;
    memory?: MemorySaver;
    maxIterations?: number;
    temperature?: number;
  }
) {
  // Create agent-specific LLM with optimized settings
  const llm = new ChatOpenAI({
    modelName: agent.model || 'gpt-4-turbo-preview',
    temperature: options?.temperature || agent.temperature || 0.7,
    maxTokens: agent.max_tokens || 4000,
    streaming: options?.streaming ?? true,
    // LangGraph Best Practice: Enable function calling for better tool use
    modelKwargs: {
      functions: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.schema
      })),
      function_call: 'auto'
    }
  });
  
  // LangGraph Best Practice: Structured prompt with clear reasoning steps
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', `${agent.system_prompt}

You are an AI agent with access to tools. Follow the ReAct pattern:
1. Thought: Analyze what the user is asking
2. Action: Decide which tool(s) to use
3. Observation: Process tool results
4. Thought: Reflect on the results
5. Answer: Provide a comprehensive response

Always explain your reasoning before using tools.`],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad')
  ]);
  
  // Create ReAct agent with enhanced capabilities
  const reactAgent = await createReactAgent({
    llm,
    tools,
    prompt,
    // LangChain Best Practice: Add execution controls
    maxIterations: options?.maxIterations || 5,
    earlyStoppingMethod: 'generate',
    handleParsingErrors: true,
    // Add memory if provided
    memory: options?.memory
  });
  
  return reactAgent;
}

// LangGraph Best Practice: Parallel Tool Execution Node
export async function executeToolsInParallelNode(
  state: typeof EnhancedWorkflowState.State
): Promise<Partial<typeof EnhancedWorkflowState.State>> {
  const { activeTools, messages } = state;
  const lastMessage = messages[messages.length - 1];
  
  if (!lastMessage || lastMessage._getType() !== 'human') {
    return {};
  }
  
  const query = lastMessage.content;
  
  // Execute tools in parallel for better performance
  const toolPromises = activeTools.map(async (tool) => {
    try {
      const startTime = Date.now();
      const result = await tool.invoke({ query });
      const executionTime = Date.now() - startTime;
    
    return {
        tool: tool.name,
        result,
        executionTime,
        success: true
    };
  } catch (error) {
    return {
        tool: tool.name,
        error: error.message,
        success: false
      };
    }
  });
  
  const toolResults = await Promise.all(toolPromises);
  
  // Add reasoning step for tool execution
  const reasoningStep = {
    type: 'tool_execution',
    description: `Executed ${toolResults.length} tools in parallel`,
    data: toolResults,
    timestamp: new Date()
  };
  
  return {
    reasoningSteps: [reasoningStep],
    toolResults
  };
}

// LangGraph Best Practice: Adaptive Processing Node
export async function adaptiveProcessingNode(
  state: typeof EnhancedWorkflowState.State
): Promise<Partial<typeof EnhancedWorkflowState.State>> {
  const { selectedAgent, messages, activeTools, episodicMemory } = state;
  
  // Determine processing strategy based on query complexity
  const query = messages[messages.length - 1].content;
  const complexity = assessQueryComplexity(query);
  
  let processingStrategy: 'simple' | 'iterative' | 'multi-step';
  
  if (complexity.score < 3) {
    processingStrategy = 'simple';
  } else if (complexity.score < 7) {
    processingStrategy = 'iterative';
  } else {
    processingStrategy = 'multi-step';
  }
  
  // Add reasoning about strategy selection
  const strategyReasoning = {
    type: 'strategy_selection',
    description: `Selected ${processingStrategy} processing based on complexity analysis`,
    data: {
      complexity,
      strategy: processingStrategy,
      factors: complexity.factors
    },
    timestamp: new Date()
  };
  
  // Execute based on strategy
  let result;
  
  switch (processingStrategy) {
    case 'simple':
      result = await executeSimpleQuery(state);
      break;
    case 'iterative':
      result = await executeIterativeQuery(state);
      break;
    case 'multi-step':
      result = await executeMultiStepQuery(state);
      break;
  }
  
  return {
    ...result,
    reasoningSteps: [strategyReasoning, ...(result.reasoningSteps || [])]
  };
}

// Helper function to assess query complexity
function assessQueryComplexity(query: string): {
  score: number;
  factors: string[];
} {
  const factors = [];
  let score = 0;
  
  // Check for multiple questions
  const questionCount = (query.match(/\?/g) || []).length;
  if (questionCount > 1) {
    score += 2 * questionCount;
    factors.push(`Multiple questions (${questionCount})`);
  }
  
  // Check for complex medical/regulatory terms
  const complexTerms = [
    'pharmacokinetics', 'bioequivalence', 'clinical trial',
    'regulatory approval', 'adverse events', 'meta-analysis'
  ];
  
  complexTerms.forEach(term => {
    if (query.toLowerCase().includes(term)) {
      score += 3;
      factors.push(`Complex term: ${term}`);
    }
  });
  
  // Check for comparison requests
  if (/compare|versus|vs\.|difference between/i.test(query)) {
    score += 4;
    factors.push('Comparison request');
  }
  
  // Check for multi-step analysis
  if (/analyze.*then|first.*then|step.by.step/i.test(query)) {
    score += 5;
    factors.push('Multi-step analysis');
  }
  
  return { score, factors };
}

// LangGraph Best Practice: Memory-Enhanced Processing
export async function memoryEnhancedProcessingNode(
  state: typeof EnhancedWorkflowState.State
): Promise<Partial<typeof EnhancedWorkflowState.State>> {
  const { messages, episodicMemory, selectedAgent } = state;
  
  // Retrieve relevant memories
  const relevantMemories = await retrieveRelevantMemories(
    messages[messages.length - 1].content,
    episodicMemory
  );
  
  // Augment context with memories
  const contextualizedMessages = [
    ...messages.slice(0, -1),
    new SystemMessage(`Relevant context from previous interactions:
${relevantMemories.map(m => `- ${m.summary}`).join('\n')}`),
    messages[messages.length - 1]
  ];
  
  // Process with enhanced context
  const agent = await createEnhancedReActAgent(
    selectedAgent,
    state.activeTools,
    { memory: new MemorySaver() }
  );
  
  const result = await agent.invoke({
    messages: contextualizedMessages
  });
  
  // Store new episodic memory
  const newMemory = {
    id: generateId(),
    timestamp: new Date(),
    query: messages[messages.length - 1].content,
    response: result.output,
    agent: selectedAgent.id,
    importance: calculateImportance(result)
    };
    
    return {
    answer: result.output,
    episodicMemory: [newMemory],
    reasoningSteps: [{
      type: 'memory_retrieval',
      description: `Retrieved ${relevantMemories.length} relevant memories`,
      data: relevantMemories,
      timestamp: new Date()
    }]
  };
}

// Helper functions
async function retrieveRelevantMemories(query: string, memories: any[]): Promise<any[]> {
  // Simple relevance scoring - in production, use semantic similarity
  return memories
    .filter(m => m.query.toLowerCase().includes(query.toLowerCase().split(' ')[0]))
    .slice(0, 3);
}

function calculateImportance(result: any): number {
  // Simple importance calculation based on response length and complexity
  const length = result.output?.length || 0;
  const complexity = (result.output?.match(/[.!?]/g) || []).length;
  return Math.min(1, (length / 1000) + (complexity / 10));
}

function generateId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Simple query execution strategies
async function executeSimpleQuery(state: any): Promise<any> {
  return {
    answer: 'Simple query executed',
    reasoningSteps: [{
      type: 'simple_execution',
      description: 'Executed simple query strategy',
      timestamp: new Date()
    }]
  };
}

async function executeIterativeQuery(state: any): Promise<any> {
  return {
    answer: 'Iterative query executed',
    reasoningSteps: [{
      type: 'iterative_execution',
      description: 'Executed iterative query strategy',
      timestamp: new Date()
    }]
  };
}

async function executeMultiStepQuery(state: any): Promise<any> {
    return {
    answer: 'Multi-step query executed',
    reasoningSteps: [{
      type: 'multi_step_execution',
      description: 'Executed multi-step query strategy',
      timestamp: new Date()
    }]
  };
}

// Export types for use in other files
export interface ToolOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  enabled: boolean;
}

// Legacy workflow node functions for backward compatibility
export async function routeByModeNode(state: any): Promise<any> {
  console.log('🔀 Routing by mode:', state.interactionMode);
  return {
    workflowStep: 'routing',
    currentStep: `Routing in ${state.interactionMode} mode`
  };
}

export async function suggestAgentsNode(state: any): Promise<any> {
  console.log('🎯 Suggesting agents');
    return {
    workflowStep: 'agent_suggestion',
    suggestedAgents: [],
    currentStep: 'Suggesting relevant agents'
  };
}

export async function selectAgentAutomaticNode(state: any): Promise<any> {
  console.log('🤖 Selecting agent automatically');
    return {
    workflowStep: 'agent_selection',
    selectedAgent: state.selectedAgent,
    currentStep: 'Agent selected automatically'
  };
}

export async function processWithAgentNormalNode(state: any): Promise<any> {
  console.log('🔄 Processing with agent (normal mode)');
  console.log('🔍 Agent details:', {
    agentId: state.selectedAgent?.id,
    agentName: state.selectedAgent?.name,
    agentModel: state.selectedAgent?.model,
    query: state.query
  });
  
  // Check if we have a valid agent
  if (!state.selectedAgent || !state.selectedAgent.id) {
    console.error('❌ No valid agent provided for processing');
    return {
      workflowStep: 'error',
      answer: 'No agent available for processing your request.',
      currentStep: 'Error: No agent selected',
      error: 'No agent selected'
    };
  }
  
  try {
    // Use the enhanced LangChain service to generate a response
    const response = await enhancedLangChainService.queryWithChain(
      state.query,
      state.selectedAgent.id,
      state.sessionId || 'default',
      state.selectedAgent,
      state.userId || 'anonymous'
    );
    
    console.log('✅ Generated response:', {
      contentLength: response.answer?.length || 0,
      hasSources: !!response.sources
    });
    
    return {
      workflowStep: 'processing_complete',
      answer: response.answer || 'I apologize, but I was unable to generate a response.',
      currentStep: 'Response generated successfully',
      metadata: {
        ...state.metadata,
        processingTime: Date.now() - (state.metadata?.startTime || Date.now()),
        agentUsed: state.selectedAgent.name,
        modelUsed: state.selectedAgent.model || 'gpt-4'
      },
      sources: response.sources || [],
      citations: response.citations || []
    };
  } catch (error) {
    console.error('❌ Error processing with agent:', error);
    return {
      workflowStep: 'error',
      answer: 'I apologize, but I encountered an error while processing your request. Please try again.',
      currentStep: 'Error occurred during processing',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function processWithAgentAutonomousNode(state: any): Promise<any> {
  console.log('🤖 Processing with agent (autonomous mode)');
  return {
    workflowStep: 'autonomous_processing',
    answer: 'Response generated using autonomous processing',
    currentStep: 'Autonomous processing complete'
  };
}

export async function synthesizeResponseNode(state: any): Promise<any> {
  console.log('📝 Synthesizing response');
  console.log('🔍 State for synthesis:', {
    hasAnswer: !!state.answer,
    answerLength: state.answer?.length || 0,
    hasMetadata: !!state.metadata,
    hasSources: !!state.sources,
    workflowStep: state.workflowStep
  });
  
  // Ensure we have a valid answer
  if (!state.answer || state.answer.trim() === '') {
    console.warn('⚠️ No answer provided for synthesis, using fallback');
    return {
      workflowStep: 'synthesis_complete',
      answer: 'I apologize, but I was unable to generate a proper response to your question. Please try rephrasing your question or contact support if the issue persists.',
      currentStep: 'Response synthesis complete (fallback)',
      metadata: {
        ...state.metadata,
        fallbackUsed: true,
        synthesisReason: 'No answer provided'
      }
    };
  }
  
  return {
    workflowStep: 'synthesis_complete',
    answer: state.answer,
    currentStep: 'Response synthesis complete',
    metadata: state.metadata || {},
    sources: state.sources || [],
    citations: state.citations || []
  };
}

export function getStepDescription(
  step: string,
  mode: string,
  autonomous: boolean,
  agent: any
): string {
  const agentName = agent?.display_name || agent?.name || 'AI Assistant';
  
  switch (step) {
    case 'routing':
      return `🔀 Routing request in ${mode} mode`;
    case 'agent_suggestion':
      return `🎯 Finding relevant experts for your question`;
    case 'agent_selection':
      return `🤖 Selecting best expert: ${agentName}`;
    case 'processing':
      return `🔄 ${agentName} is analyzing your question`;
    case 'autonomous_processing':
      return `🤖 ${agentName} is processing with advanced tools`;
    case 'synthesis':
      return `📝 Synthesizing comprehensive response`;
    default:
      return `🔄 ${agentName} is working on your request`;
  }
}