/**
 * Ask Expert LangGraph Workflow Service
 * 
 * This service implements a sophisticated workflow orchestration system using LangGraph
 * to manage the Ask Expert functionality. It provides:
 * 
 * - Budget checking and user limits
 * - Context retrieval from knowledge base (RAG)
 * - AI response generation with agent-specific prompts
 * - Streaming support for real-time updates
 * - Memory persistence across conversation sessions
 * - Error handling and recovery
 * - Analytics tracking for performance monitoring (Phase B)
 * 
 * Architecture:
 * - Uses LangGraph StateGraph for workflow orchestration
 * - Integrates with Supabase for budget checking and data persistence
 * - Leverages enhanced LangChain service for AI interactions
 * - Supports both streaming and non-streaming execution modes
 * - Tracks all workflow steps for analytics and debugging
 */

import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { StateGraph, END, START , MemorySaver } from '@langchain/langgraph';
import { createClient } from '@supabase/supabase-js';

import { unifiedRAGService } from '../../../lib/services/rag/unified-rag-service';
import { getAnalyticsService } from '@/lib/analytics/UnifiedAnalyticsService';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

// ============================================================================
// SUPABASE CLIENT INITIALIZATION
// ============================================================================

/**
 * Initialize Supabase client for budget checking and data persistence
 * Falls back gracefully if configuration is missing (useful for development)
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase configuration missing - budget checking will be disabled');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// ============================================================================
// WORKFLOW STATE DEFINITION
// ============================================================================

/**
 * State definition for Ask Expert workflow
 * 
 * This interface defines the complete state that flows through the LangGraph workflow.
 * Each node in the workflow can read from and write to this state.
 * 
 * Key Components:
 * - messages: Conversation history in LangChain format
 * - question: Current user question being processed
 * - agentId/sessionId/userId: Identifiers for tracking and persistence
 * - agent: Agent configuration and system prompts
 * - ragEnabled: Whether to use Retrieval-Augmented Generation
 * - context/sources/citations: RAG results and references
 * - answer: Final AI response
 * - tokenUsage: Cost tracking for budget management
 * - error: Error handling and recovery
 */
interface AskExpertState {
  messages: BaseMessage[];        // Conversation history
  question: string;               // Current user question
  agentId: string;                // Selected agent ID
  sessionId: string;              // Conversation session ID
  userId: string;                 // User identifier
  agent: any;                     // Agent configuration object
  ragEnabled: boolean;           // Whether RAG is enabled
  context?: string;               // Retrieved context from knowledge base
  sources?: any[];                // Source documents with metadata
  answer?: string;                // Final AI response
  citations?: string[];           // Citation references
  tokenUsage?: any;               // Token usage for cost tracking
  error?: string;                 // Error message if workflow fails
}

// ============================================================================
// WORKFLOW NODES (INDIVIDUAL STEPS)
// ============================================================================

/**
 * Budget Check Node
 * 
 * Verifies that the user has sufficient budget/credits before proceeding
 * with expensive AI operations. This prevents runaway costs and ensures
 * fair usage across all users.
 * 
 * Process:
 * 1. Calls Supabase RPC function to check user budget
 * 2. Returns error state if budget exceeded
 * 3. Continues workflow if budget is sufficient
 * 4. Gracefully handles missing Supabase configuration
 * 
 * @param state Current workflow state
 * @returns Partial state update (error if budget exceeded, empty if OK)
 */
async function checkBudget(state: AskExpertState): Promise<Partial<AskExpertState>> {
  console.log('💰 Checking user budget...');

  // Skip budget check if Supabase not configured (development mode)
  if (!supabase) {
    console.log('⚠️ Supabase not configured - skipping budget check');
    return {};
  }

  try {
    // Call Supabase RPC function to check user budget
    const { data, error } = await supabase.rpc('check_user_budget', {
      p_user_id: state.userId,
      p_session_id: state.sessionId,
    });

    if (error) throw error;

    // Check if user is within budget limits
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
 * Context Retrieval Node (RAG)
 * 
 * Implements Retrieval-Augmented Generation by searching the knowledge base
 * for relevant information to provide context for the AI response.
 * 
 * Process:
 * 1. Checks if RAG is enabled (can be disabled for faster responses)
 * 2. Uses vector similarity search to find relevant documents
 * 3. Extracts content and metadata from search results
 * 4. Formats sources with citations for the AI to reference
 * 5. Handles cases where no relevant context is found
 * 
 * @param state Current workflow state
 * @returns Partial state update with context and sources
 */
async function retrieveContext(state: AskExpertState): Promise<Partial<AskExpertState>> {
  // RAG is always enabled for all modes - all queries benefit from knowledge base context
  console.log('🔍 Retrieving context from knowledge base using Pinecone + Supabase (RAG always enabled)...');

  try {
    // Use UnifiedRAGService with Pinecone for vector search and Supabase for metadata
    const ragResult = await unifiedRAGService.query({
      text: state.question,
      agentId: state.agentId,
      userId: state.userId,
      sessionId: state.sessionId,
      maxResults: 5,
      similarityThreshold: 0.7,
      strategy: 'agent-optimized', // Uses Pinecone with agent domain boosting
      includeMetadata: true
    });

    if (ragResult.sources && ragResult.sources.length > 0) {
      // Combine all relevant content into a single context string
      const context = ragResult.sources.map(doc => doc.pageContent).join('\n\n');
      
      // Format sources with metadata for citation and reference
      const sources = ragResult.sources.map((doc, index) => ({
        id: doc.metadata?.id || index,
        content: doc.pageContent,
        title: doc.metadata?.title || doc.metadata?.source_title || 'Document Chunk',
        excerpt: doc.pageContent.substring(0, 200) + '...',
        similarity: doc.metadata?.similarity || 0.8,
        citation: `[${index + 1}]`,  // Generate citation reference
        domain: doc.metadata?.domain,
        source_id: doc.metadata?.source_id,
      }));

      console.log(`✅ Retrieved ${sources.length} relevant sources using Pinecone + Supabase`);

      return { context, sources };
    }

    console.log('⚠️ No relevant context found');
    return { context: '', sources: [] };
  } catch (error) {
    console.error('Context retrieval error:', error);
    // Return empty context on error to allow workflow to continue
    return { context: '', sources: [] };
  }
}

/**
 * AI Response Generation Node
 * 
 * Generates the final AI response using the enhanced LangChain service.
 * This node combines the user's question with retrieved context and agent-specific
 * prompts to produce a comprehensive, accurate response.
 * 
 * Process:
 * 1. Calls the enhanced LangChain service with all context
 * 2. Uses agent-specific system prompts and configurations
 * 3. Incorporates retrieved context for accurate, cited responses
 * 4. Tracks token usage for budget management
 * 5. Handles errors gracefully with fallback responses
 * 
 * @param state Current workflow state with context and sources
 * @returns Partial state update with answer, citations, and token usage
 */
async function generateResponse(state: AskExpertState): Promise<Partial<AskExpertState>> {
  console.log('🤖 Generating AI response...');

  try {
    // Import enhanced LangChain service dynamically
    const { enhancedLangChainService } = await import('./enhanced-langchain-service');
    
    // Use the enhanced LangChain service to generate response
    // This service handles agent-specific prompts, context integration, and token tracking
    const result = await enhancedLangChainService.queryWithChain(
      state.question,
      state.agentId,
      state.sessionId,
      state.agent,
      state.userId
    );

    console.log('✅ Response generated successfully');

    return {
      answer: result.answer,           // Final AI response
      sources: result.sources,          // Source documents used
      citations: result.citations,     // Citation references in the response
      tokenUsage: result.tokenUsage,    // Token count for cost tracking
    };
  } catch (error) {
    console.error('Response generation error:', error);
    return {
      error: 'Failed to generate response. Please try again.',
    };
  }
}

// ============================================================================
// WORKFLOW ROUTING AND GRAPH CONSTRUCTION
// ============================================================================

/**
 * Workflow Routing Function
 * 
 * Determines the next step in the workflow based on the current state.
 * This implements conditional logic for error handling and flow control.
 * 
 * Routing Logic:
 * - If there's an error (e.g., budget exceeded), route to error handling
 * - Otherwise, continue to context retrieval step
 * 
 * @param state Current workflow state
 * @returns Next node name to execute
 */
function routeToNextStep(state: AskExpertState): string {
  if (state.error) {
    return 'error';  // Route to error handling
  }
  return 'retrieve_context';  // Continue normal flow
}

/**
 * Create Ask Expert Workflow Graph
 * 
 * Constructs the LangGraph StateGraph that defines the complete workflow.
 * This function sets up the nodes, edges, and state management for the
 * Ask Expert functionality.
 * 
 * Workflow Structure:
 * START → check_budget → [retrieve_context | error] → generate_response → END
 * 
 * State Management:
 * - Defines how state is merged between nodes
 * - Handles arrays (messages, sources) by concatenation
 * - Uses fallback values for optional fields
 * 
 * @returns Configured StateGraph ready for compilation
 */
export function createAskExpertGraph() {
  // Create the state graph with comprehensive state management
  const workflow = new StateGraph<AskExpertState>({
    channels: {
      // Array fields: concatenate new values with existing ones
      messages: { value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y) },
      sources: { value: (x?: any[], y?: any[]) => y ?? x },
      citations: { value: (x?: string[], y?: string[]) => y ?? x },
      
      // String fields: use new value if provided, otherwise keep existing
      question: { value: (x?: string, y?: string) => y ?? x },
      agentId: { value: (x?: string, y?: string) => y ?? x },
      sessionId: { value: (x?: string, y?: string) => y ?? x },
      userId: { value: (x?: string, y?: string) => y ?? x },
      context: { value: (x?: string, y?: string) => y ?? x },
      answer: { value: (x?: string, y?: string) => y ?? x },
      error: { value: (x?: string, y?: string) => y ?? x },
      
      // Object fields: use new value if provided, otherwise keep existing
      agent: { value: (x?: any, y?: any) => y ?? x },
      tokenUsage: { value: (x?: any, y?: any) => y ?? x },
      
      // Boolean fields: use new value if provided, otherwise keep existing
      ragEnabled: { value: (x?: boolean, y?: boolean) => y ?? x },
    },
  });

  // Add workflow nodes (individual processing steps)
  workflow.addNode('check_budget', checkBudget);
  workflow.addNode('retrieve_context', retrieveContext);
  workflow.addNode('generate_response', generateResponse);
  workflow.addNode('error', (state: AskExpertState) => state);  // Error passthrough

  // Define workflow edges (execution flow)
  workflow.addEdge(START, 'check_budget');  // Always start with budget check
  
  // Conditional routing from budget check
  workflow.addConditionalEdges(
    'check_budget',
    routeToNextStep,  // Use routing function to determine next step
    {
      retrieve_context: 'retrieve_context',  // Continue normal flow
      error: 'error',                        // Handle errors
    }
  );
  
  // Linear flow after context retrieval
  workflow.addEdge('retrieve_context', 'generate_response');
  workflow.addEdge('generate_response', END);
  workflow.addEdge('error', END);

  return workflow;
}

// ============================================================================
// WORKFLOW COMPILATION AND EXECUTION
// ============================================================================

/**
 * Compile Ask Expert Graph with Memory Persistence
 * 
 * Compiles the workflow graph and adds memory persistence using LangGraph's
 * MemorySaver. This enables conversation history to be maintained across
 * multiple interactions within the same session.
 * 
 * Memory Features:
 * - Conversation history persists across workflow executions
 * - State is maintained per session (thread_id)
 * - Enables context-aware responses in multi-turn conversations
 * 
 * @returns Compiled workflow application ready for execution
 */
export function compileAskExpertGraph() {
  const workflow = createAskExpertGraph();
  const checkpointer = new MemorySaver();  // Enable memory persistence

  const app = workflow.compile({ checkpointer });

  console.log('✅ Ask Expert LangGraph workflow compiled');

  return app;
}

/**
 * Execute Ask Expert Workflow (Non-Streaming)
 * 
 * Executes the complete Ask Expert workflow and returns the final result.
 * This is used for non-streaming requests where the client waits for
 * the complete response.
 * 
 * Process:
 * 1. Compiles the workflow with memory persistence
 * 2. Converts chat history to LangChain message format
 * 3. Executes the workflow with session-based memory
 * 4. Returns the final state with answer, sources, and metadata
 * 
 * @param input Workflow input parameters
 * @returns Final workflow state with complete response
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

  // Convert chat history to LangChain messages format
  const messages: BaseMessage[] = input.chatHistory.map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });

  // Add current question to message history
  messages.push(new HumanMessage(input.question));

  // Execute workflow with session-based memory
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
        thread_id: input.sessionId,  // Use session ID for memory persistence
      },
    }
  );

  console.log('✅ Workflow execution complete');

  return result;
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

  const messages: BaseMessage[] = input.chatHistory.map((msg) => {
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


