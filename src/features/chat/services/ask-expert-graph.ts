import { StateGraph, END, START } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { MemorySaver } from '@langchain/langgraph';
import { enhancedLangChainService } from './enhanced-langchain-service';

/**
 * State definition for Ask Expert workflow
 */
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
  const messages: BaseMessage[] = input.chatHistory.map((msg) => {
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

// Import supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
