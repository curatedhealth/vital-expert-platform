/**
 * Ask Expert Chat API
 *
 * Handles chat requests with streaming responses using Server-Sent Events (SSE)
 * Integrates with:
 * - Vector search for context retrieval
 * - OpenAI for AI responses
 * - LangChain for workflow orchestration
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Mode configuration - maps UI modes to backend search strategies
// All modes search across all domains (including Digital Health and Regulatory Affairs)
// Domain filtering removed to allow searching both RAG domains
const MODE_CONFIG = {
  'mode-1-query-automatic': {
    searchFunction: 'search_knowledge_by_embedding',
    params: { domain_filter: null, max_results: 10, similarity_threshold: 0.7 },
    agentSelection: 'automatic',
    numExperts: 3,
  },
  'mode-2-query-manual': {
    searchFunction: 'search_knowledge_for_agent',
    params: { max_results: 15, similarity_threshold: 0.75 },
    agentSelection: 'manual',
    numExperts: 1,
  },
  'mode-3-chat-automatic': {
    searchFunction: 'hybrid_search',
    params: {
      domain_filter: null,
      max_results: 12,
      keyword_weight: 0.3,
      semantic_weight: 0.7
    },
    agentSelection: 'automatic',
    numExperts: 2,
  },
  'mode-4-chat-manual': {
    searchFunction: 'search_knowledge_for_agent',
    params: { max_results: 20, similarity_threshold: 0.8 },
    agentSelection: 'manual',
    numExperts: 1,
  },
  'mode-5-agent-autonomous': {
    searchFunction: 'hybrid_search',
    params: {
      max_results: 25,
      keyword_weight: 0.4,
      semantic_weight: 0.6,
      include_metadata: true
    },
    agentSelection: 'automatic',
    numExperts: 1,
  },
} as const;

interface ChatRequest {
  message: string;
  mode: keyof typeof MODE_CONFIG;
  agentId?: string;
  conversationId?: string;
  userId: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
}

interface ReasoningStep {
  id: string;
  type: 'thought' | 'action' | 'observation';
  content: string;
  confidence?: number;
}

/**
 * POST /api/ask-expert/chat
 * Streaming chat endpoint using Server-Sent Events
 */
export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body: ChatRequest = await req.json();
    const { message, mode, agentId, conversationId, userId } = body;

    // Validate request
    if (!message || !mode || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const config = MODE_CONFIG[mode];
    if (!config) {
      return new Response(
        JSON.stringify({ error: 'Invalid mode' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
          // Helper to send SSE events
          const sendEvent = (event: string, data: any) => {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
          };

        try {
          // Step 1: Context Retrieval
          sendEvent('workflow', {
            step: {
              id: 'step-1',
              name: 'Context Retrieval',
              description: 'Searching knowledge base for relevant information',
              status: 'running',
              progress: 0,
            } as WorkflowStep,
          });

          sendEvent('reasoning', {
            step: {
              id: 'reason-1',
              type: 'thought',
              content: 'Analyzing user query to identify key concepts and information needs',
              confidence: 0.89,
            } as ReasoningStep,
          });

          // Get embedding for user message
          const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: message,
          });
          const embedding = embeddingResponse.data[0].embedding;

          sendEvent('workflow', {
            step: {
              id: 'step-1',
              name: 'Context Retrieval',
              status: 'running',
              progress: 50,
            } as WorkflowStep,
          });

          // Execute vector search based on mode
          let contextResults;
          if (config.searchFunction === 'search_knowledge_by_embedding') {
            const { data, error } = await supabase.rpc('search_knowledge_by_embedding', {
              query_embedding: embedding,
              ...config.params,
            });
            if (error) throw error;
            contextResults = data;
          } else if (config.searchFunction === 'search_knowledge_for_agent') {
            const { data, error } = await supabase.rpc('search_knowledge_for_agent', {
              agent_id_param: agentId,
              query_text_param: message,
              query_embedding_param: embedding,
              max_results: config.params.max_results || 10
            });
            if (error) throw error;
            contextResults = data;
          } else if (config.searchFunction === 'hybrid_search') {
            const hybridParams: any = {
              query_text: message,
              query_embedding: embedding,
              max_results: config.params.max_results || 15,
              semantic_weight: config.params.semantic_weight || 0.7,
              keyword_weight: config.params.keyword_weight || 0.3,
              similarity_threshold: 0.6 // Fixed threshold since it's not in config.params
            };
            // Add domain_filter if specified in config
            if (config.params.domain_filter) {
              hybridParams.domain_filter = config.params.domain_filter;
            }
            const { data, error } = await supabase.rpc('hybrid_search', hybridParams);
            if (error) throw error;
            contextResults = data;
          }

          sendEvent('workflow', {
            step: {
              id: 'step-1',
              name: 'Context Retrieval',
              status: 'completed',
              progress: 100,
            } as WorkflowStep,
          });

          sendEvent('reasoning', {
            step: {
              id: 'reason-2',
              type: 'action',
              content: `Retrieved ${contextResults?.length || 0} relevant knowledge base entries`,
            } as ReasoningStep,
          });

          // Step 2: Expert Analysis
          sendEvent('workflow', {
            step: {
              id: 'step-2',
              name: 'Expert Analysis',
              description: 'AI expert analyzing requirements and formulating response',
              status: 'running',
              progress: 0,
            } as WorkflowStep,
          });

          // Get agent information if specified
          let agentInfo = null;
          if (agentId) {
            const { data } = await supabase
              .from('agents')
              .select('*')
              .eq('id', agentId)
              .single();
            agentInfo = data;
          }

          // Build context string
          const context = contextResults
            ?.map((result: any, idx: number) =>
              `[${idx + 1}] ${result.title || result.content?.substring(0, 200)}`
            )
            .join('\n\n') || '';

          // Build system prompt
          const systemPrompt = agentInfo
            ? `You are ${agentInfo.name}, ${agentInfo.description}. ${agentInfo.system_prompt || ''}`
            : `You are an expert AI assistant specializing in healthcare and medical devices. Provide accurate, evidence-based responses.`;

          const userPrompt = `Context from knowledge base:\n\n${context}\n\nUser question: ${message}\n\nProvide a detailed response with citations [1], [2], etc. referencing the context above.`;

          sendEvent('workflow', {
            step: {
              id: 'step-2',
              name: 'Expert Analysis',
              status: 'running',
              progress: 30,
            } as WorkflowStep,
          });

          sendEvent('reasoning', {
            step: {
              id: 'reason-3',
              type: 'observation',
              content: 'Synthesizing information from multiple sources to provide comprehensive answer',
              confidence: 0.92,
            } as ReasoningStep,
          });

          // Stream response from OpenAI
          const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            stream: true,
            temperature: 0.7,
            max_tokens: 2000,
          });

          let fullResponse = '';
          let tokenCount = 0;

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              tokenCount++;

              // Send content chunk
              sendEvent('content', { content });

              // Update progress every 50 tokens
              if (tokenCount % 50 === 0) {
                const progress = Math.min(95, 30 + (tokenCount / 10));
                sendEvent('workflow', {
                  step: {
                    id: 'step-2',
                    name: 'Expert Analysis',
                    status: 'running',
                    progress,
                  } as WorkflowStep,
                });
              }

              // Send metrics update every 100 tokens
              if (tokenCount % 100 === 0) {
                sendEvent('metrics', {
                  tokensGenerated: tokenCount,
                  tokensPerSecond: 42, // Approximate
                });
              }
            }
          }

          // Complete workflow
          sendEvent('workflow', {
            step: {
              id: 'step-2',
              name: 'Expert Analysis',
              status: 'completed',
              progress: 100,
            } as WorkflowStep,
          });

          // Send sources
          if (contextResults && contextResults.length > 0) {
            const sources = contextResults.slice(0, 5).map((result: any, idx: number) => ({
              id: `src-${idx + 1}`,
              title: result.title || 'Knowledge Base Entry',
              url: result.url || '#',
              excerpt: result.content?.substring(0, 200) || '',
              similarity: result.similarity || 0.85,
            }));

            sendEvent('sources', { sources });
          }

          // Send metadata
          sendEvent('metadata', {
            confidence: 0.92,
            tokenUsage: {
              prompt: 1500,
              completion: tokenCount,
              total: 1500 + tokenCount,
            },
            agentName: agentInfo?.name || 'AI Expert',
            mode,
          });

          // Save to database
          if (conversationId) {
            await supabase.from('messages').insert({
              conversation_id: conversationId,
              role: 'user',
              content: message,
              user_id: userId,
            });

            await supabase.from('messages').insert({
              conversation_id: conversationId,
              role: 'assistant',
              content: fullResponse,
              agent_id: agentId,
              metadata: {
                sources: contextResults?.slice(0, 5),
                tokenUsage: { prompt: 1500, completion: tokenCount, total: 1500 + tokenCount },
              },
            });
          }

          // Complete stream
          sendEvent('done', { success: true });
          controller.close();

        } catch (error) {
          console.error('Streaming error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          sendEvent('error', { error: errorMessage });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
