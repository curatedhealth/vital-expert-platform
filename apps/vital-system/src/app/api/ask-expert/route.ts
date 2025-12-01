import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { streamAskExpertWorkflow } from '@/features/chat/services/ask-expert-graph';
import { enhancedLangChainService } from '@/features/chat/services/enhanced-langchain-service';
import { getAnalyticsService } from '@/lib/analytics/UnifiedAnalyticsService';
import { getObservabilityService } from '@/lib/observability/UnifiedObservabilityService';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

/**
 * Ask Expert API - Dedicated endpoint for Ask Expert functionality
 * 
 * Features:
 * - ✅ LangGraph Workflow
 * - ✅ Enhanced LangChain Service
 * - ✅ Streaming Support
 * - ✅ Budget Checking
 * - ✅ Token Tracking
 * - ✅ RAG Integration
 * - ✅ Memory Management
 * - ✅ Analytics Tracking (Phase B)
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[Ask Expert API] Supabase configuration missing; returning empty session list');
      return NextResponse.json({ success: true, sessions: [] });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await request.json();
    const {
      message,
      agent,
      userId = 'anonymous',
      sessionId,
      chatHistory = [],
      ragEnabled = true, // Always enabled - all modes use RAG
      stream = true,
    } = body;

    // Validate required fields
    if (!message || !agent) {
      return NextResponse.json(
        { error: 'Message and agent are required' },
        { status: 400 }
      );
    }

    const effectiveSessionId = sessionId || `ask-expert-${Date.now()}`;

    // Load chat history into memory if continuing conversation
    if (chatHistory.length > 0) {
      await enhancedLangChainService.loadChatHistory(effectiveSessionId, chatHistory);
    }

    // Handle streaming response
    if (stream) {
      return handleStreamingResponse(
        message,
        agent,
        userId,
        effectiveSessionId,
        ragEnabled,
        supabase
      );
    } else {
      return handleNonStreamingResponse(
        message,
        agent,
        userId,
        effectiveSessionId,
        ragEnabled,
        supabase
      );
    }
  } catch (error: any) {
    console.error('Ask Expert API error:', error);
    return NextResponse.json(
      {
        error: 'Ask Expert execution failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle Streaming Response
 */
async function handleStreamingResponse(
  message: string,
  agent: any,
  userId: string,
  sessionId: string,
  ragEnabled: boolean,
  supabase: any
) {
  const analytics = getAnalyticsService();
  const observability = getObservabilityService();
  const startTime = Date.now();
  
  // Set user context for observability
  observability.setUser(userId);
  
  // Create distributed trace
  const traceId = await observability.trackUserQuery(message, userId, sessionId, {
    agent_id: agent.id,
    agent_name: agent.name,
    rag_enabled: ragEnabled,
  });
  
  // Track query submission (existing analytics)
  await analytics.trackEvent({
    tenant_id: STARTUP_TENANT_ID,
    user_id: userId,
    session_id: sessionId,
    event_type: 'query_submitted',
    event_category: 'user_behavior',
    event_data: {
      query: message,
      query_length: message.length,
      agent_id: agent.id,
      agent_name: agent.name,
      rag_enabled: ragEnabled,
    },
    source: 'ask_expert',
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial status
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'status',
            data: { message: 'Starting Ask Expert workflow...' }
          })}\n\n`)
        );

        // Stream Ask Expert workflow
        let fullAnswer = '';
        let sources: any[] = [];
        let citations: string[] = [];
        let tokenUsage: any = {};

        for await (const event of streamAskExpertWorkflow({
          question: message,
          agentId: agent.id,
          sessionId,
          userId,
          agent,
          ragEnabled: ragEnabled !== false, // Ensure RAG is enabled (default to true)
          chatHistory: [],
        })) {
          // Send workflow step
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'workflow_step',
              step: event.step,
              data: event.data,
              timestamp: event.timestamp,
            })}\n\n`)
          );

          // Collect final result
          const eventData = event.data as any;
          if (eventData.answer) {
            fullAnswer = eventData.answer;
            sources = eventData.sources || [];
            citations = eventData.citations || [];
            tokenUsage = eventData.tokenUsage || {};
          }
        }

        const executionTime = Date.now() - startTime;

        // Track LLM usage with unified observability (Sentry + LangFuse + Prometheus + Analytics)
        if (tokenUsage.totalTokens || tokenUsage.promptTokens) {
          await observability.trackLLMCall({
            model: tokenUsage.model || 'gpt-4',
            provider: 'openai',
            promptTokens: tokenUsage.promptTokens || 0,
            completionTokens: tokenUsage.completionTokens || 0,
            totalTokens: tokenUsage.totalTokens || 0,
            costUsd: tokenUsage.cost || 0,
            duration: executionTime / 1000,
            agentId: agent.id,
            userId,
            sessionId,
            traceId,
          });
          
          // Also track in analytics (existing)
          await analytics.trackLLMUsage({
            tenant_id: STARTUP_TENANT_ID,
            user_id: userId,
            session_id: sessionId,
            model: tokenUsage.model || 'gpt-4',
            prompt_tokens: tokenUsage.promptTokens || 0,
            completion_tokens: tokenUsage.completionTokens || 0,
            agent_id: agent.id,
          });
        }

        // Track agent execution with unified observability
        await observability.trackAgentExecution({
          agentId: agent.id,
          agentType: 'ask_expert',
          success: !!fullAnswer,
          duration: executionTime / 1000,
          userId,
          sessionId,
          traceId,
          qualityScore: sources.length > 0 ? 85 : 70, // Basic quality heuristic
          metadata: {
            sources_count: sources.length,
            citations_count: citations.length,
            rag_enabled: ragEnabled,
          },
        });
        
        // Also track in analytics (existing)
        await analytics.trackAgentExecution({
          tenant_id: STARTUP_TENANT_ID,
          user_id: userId,
          session_id: sessionId,
          agent_id: agent.id,
          agent_type: 'ask_expert',
          execution_time_ms: executionTime,
          success: !!fullAnswer,
          total_tokens: tokenUsage.totalTokens || 0,
          query_length: message.length,
          response_length: fullAnswer.length,
          metadata: {
            sources_count: sources.length,
            citations_count: citations.length,
            rag_enabled: ragEnabled,
          },
        });

        // Send final answer
        if (fullAnswer) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'output',
              content: fullAnswer,
              metadata: {
                sources,
                citations,
                tokenUsage,
                agent: {
                  id: agent.id,
                  name: agent.name,
                  description: agent.description,
                },
              },
            })}\n\n`)
          );
        }

        // Save conversation to database
        await saveConversation(supabase, sessionId, userId, agent.id, message, fullAnswer);

        // Send completion
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        );

      } catch (error: any) {
        console.error('Streaming error:', error);
        
        const executionTime = Date.now() - startTime;
        
        // Track error with unified observability (Sentry + analytics)
        observability.trackError(error, {
          userId,
          sessionId,
          agentId: agent.id,
          requestId: traceId,
          metadata: {
            message,
            messageLength: message.length,
            ragEnabled,
            executionTime,
          },
        });
        
        // Track failed agent execution
        await observability.trackAgentExecution({
          agentId: agent.id,
          agentType: 'ask_expert',
          success: false,
          duration: executionTime / 1000,
          userId,
          sessionId,
          traceId,
          errorType: error.name || 'UnknownError',
          errorMessage: error.message,
          metadata: {
            query_length: message.length,
          },
        });
        
        // Also track in analytics (existing)
        await analytics.trackAgentExecution({
          tenant_id: STARTUP_TENANT_ID,
          user_id: userId,
          session_id: sessionId,
          agent_id: agent.id,
          agent_type: 'ask_expert',
          execution_time_ms: executionTime,
          success: false,
          error_type: error.name || 'UnknownError',
          error_message: error.message,
          query_length: message.length,
        });
        
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: error.message,
          })}\n\n`)
        );
      } finally {
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
}

/**
 * Handle Non-Streaming Response
 */
async function handleNonStreamingResponse(
  message: string,
  agent: any,
  userId: string,
  sessionId: string,
  ragEnabled: boolean,
  supabase: any
) {
  const analytics = getAnalyticsService();
  const startTime = Date.now();
  
  // Track query submission
  await analytics.trackEvent({
    tenant_id: STARTUP_TENANT_ID,
    user_id: userId,
    session_id: sessionId,
    event_type: 'query_submitted',
    event_category: 'user_behavior',
    event_data: {
      query: message,
      query_length: message.length,
      agent_id: agent.id,
      agent_name: agent.name,
      rag_enabled: ragEnabled,
    },
    source: 'ask_expert',
  });

  try {
    // Execute Ask Expert workflow
    const result = await streamAskExpertWorkflow({
      question: message,
      agentId: agent.id,
      sessionId,
      userId,
      agent,
      ragEnabled,
      chatHistory: [],
    });

    let finalResult: any = {};
    for await (const event of result) {
      const eventData = event.data as any;
      if (eventData.answer) {
        finalResult = eventData;
      }
    }

    const executionTime = Date.now() - startTime;

    // Track LLM usage if available
    if (finalResult.tokenUsage?.totalTokens || finalResult.tokenUsage?.promptTokens) {
      await analytics.trackLLMUsage({
        tenant_id: STARTUP_TENANT_ID,
        user_id: userId,
        session_id: sessionId,
        model: finalResult.tokenUsage.model || 'gpt-4',
        prompt_tokens: finalResult.tokenUsage.promptTokens || 0,
        completion_tokens: finalResult.tokenUsage.completionTokens || 0,
        agent_id: agent.id,
      });
    }

    // Track agent execution
    await analytics.trackAgentExecution({
      tenant_id: STARTUP_TENANT_ID,
      user_id: userId,
      session_id: sessionId,
      agent_id: agent.id,
      agent_type: 'ask_expert',
      execution_time_ms: executionTime,
      success: !!finalResult.answer,
      total_tokens: finalResult.tokenUsage?.totalTokens || 0,
      query_length: message.length,
      response_length: finalResult.answer?.length || 0,
      metadata: {
        sources_count: finalResult.sources?.length || 0,
        citations_count: finalResult.citations?.length || 0,
        rag_enabled: ragEnabled,
      },
    });

    // Save conversation to database
    await saveConversation(supabase, sessionId, userId, agent.id, message, finalResult.answer);

    return NextResponse.json({
      success: true,
      answer: finalResult.answer,
      sources: finalResult.sources || [],
      citations: finalResult.citations || [],
      tokenUsage: finalResult.tokenUsage || {},
      metadata: {
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
        },
        sessionId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Non-streaming error:', error);
    
    const executionTime = Date.now() - startTime;
    
    // Track failed execution
    await analytics.trackAgentExecution({
      tenant_id: STARTUP_TENANT_ID,
      user_id: userId,
      session_id: sessionId,
      agent_id: agent.id,
      agent_type: 'ask_expert',
      execution_time_ms: executionTime,
      success: false,
      error_type: error.name || 'UnknownError',
      error_message: error.message,
      query_length: message.length,
    });
    
    return NextResponse.json(
      {
        error: 'Ask Expert execution failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Save conversation to database
 */
async function saveConversation(
  supabase: any,
  sessionId: string,
  userId: string,
  agentId: string,
  userMessage: string,
  assistantMessage: string
) {
  try {
    // Generate a title from the first user message (first 50 chars, clean up)
    const generateTitle = (message: string): string => {
      // Remove extra whitespace and truncate
      const cleaned = message.replace(/\s+/g, ' ').trim();
      if (cleaned.length <= 50) return cleaned;
      // Truncate at word boundary if possible
      const truncated = cleaned.substring(0, 50);
      const lastSpace = truncated.lastIndexOf(' ');
      return lastSpace > 30 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    };

    // Check if conversation exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id, context')
      .eq('id', sessionId)
      .single();

    const newMessages = [
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage },
    ];

    if (existing) {
      // Update existing conversation - append messages to context
      const existingMessages = existing.context?.messages || [];
      const updatedMessages = [...existingMessages, ...newMessages];

      await supabase
        .from('conversations')
        .update({
          context: { messages: updatedMessages },
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);
    } else {
      // Create new conversation with title from first message
      const title = generateTitle(userMessage);

      await supabase.from('conversations').insert({
        id: sessionId,
        user_id: userId,
        title: title,
        metadata: { agent_id: agentId },
        context: { messages: newMessages },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Also save to chat_messages for backwards compatibility
    await supabase.from('chat_messages').insert([
      {
        session_id: sessionId,
        user_id: userId,
        agent_id: agentId,
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString(),
      },
      {
        session_id: sessionId,
        user_id: userId,
        agent_id: agentId,
        role: 'assistant',
        content: assistantMessage,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error('Failed to save conversation:', error);
    // Don't throw - conversation saving is not critical
  }
}

/**
 * GET /api/ask-expert/sessions
 * Get user's Ask Expert sessions
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                                process.env.NEW_SUPABASE_SERVICE_KEY ||
                                process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Ask Expert API] Missing Supabase configuration:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      });
      return NextResponse.json(
        { 
          error: 'Supabase configuration missing',
          success: true,
          sessions: [] 
        },
        { status: 200 } // Return empty sessions instead of 500
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');

    // If conversationId is provided, fetch that single conversation
    if (conversationId) {
      try {
        const { data: conversation, error } = await supabase
          .from('conversations')
          .select('id, title, metadata, context, created_at, updated_at')
          .eq('id', conversationId)
          .single();

        if (error) {
          console.error('[Ask Expert API] Failed to fetch conversation:', error);
          return NextResponse.json(
            { error: 'Conversation not found', success: false },
            { status: 404 }
          );
        }

        // Fetch agent details if present in metadata
        let agent = null;
        const agentId = conversation?.metadata?.agent_id;
        if (agentId) {
          const { data: agentData } = await supabase
            .from('agents')
            .select('id, name, display_name, description, avatar_url')
            .eq('id', agentId)
            .single();
          agent = agentData;
        }

        return NextResponse.json({
          success: true,
          conversation: {
            ...conversation,
            agent
          }
        });
      } catch (err: any) {
        console.error('[Ask Expert API] Error fetching conversation:', err);
        return NextResponse.json(
          { error: 'Failed to fetch conversation', success: false },
          { status: 500 }
        );
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Get user's Ask Expert sessions from CONVERSATIONS table
    // ⚡ FIX: Query 'conversations' table, not 'chat_messages' (which was empty!)
    let conversations: any[] = [];
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, metadata, context, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[Ask Expert API] Failed to fetch conversations:', error);
        // If table doesn't exist, return empty array
        if (error.code === '42P01') {
          return NextResponse.json({ success: true, sessions: [] });
        }
        // For other errors, also return empty array (graceful degradation)
        return NextResponse.json({ success: true, sessions: [] });
      }

      conversations = data || [];
      console.log(`[Ask Expert API] Found ${conversations.length} conversations for user ${userId}`);
    } catch (queryError: any) {
      console.error('[Ask Expert API] Query error:', queryError);
      // Return empty sessions on any error (graceful degradation)
      return NextResponse.json({ success: true, sessions: [] });
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ success: true, sessions: [] });
    }

    // Get unique agent IDs from metadata (filter out nulls)
    const agentIds = [...new Set(
      conversations
        .map((c: any) => c.metadata?.agent_id)
        .filter(Boolean)
    )];

    // Fetch agent details if we have agent IDs
    let agentMap = new Map();
    if (agentIds.length > 0) {
      try {
        const { data: agents, error: agentError } = await supabase
          .from('agents')
          .select('id, name, display_name, description, avatar_url')
          .in('id', agentIds);

        if (!agentError && agents) {
          agents.forEach((agent: any) => {
            agentMap.set(agent.id, agent);
          });
        } else if (agentError) {
          console.error('[Ask Expert API] Failed to fetch agents:', agentError);
          // Continue without agent details - not critical
        }
      } catch (agentError: any) {
        console.error('[Ask Expert API] Error fetching agent details:', agentError);
        // Continue without agent details - not critical
      }
    }

    // Transform conversations to sessions format
    const sessions = conversations.map((conv: any) => {
      const agentId = conv.metadata?.agent_id;
      const agent = agentId ? agentMap.get(agentId) : null;
      const messagesArray = conv.context?.messages || [];

      return {
        sessionId: conv.id, // Use conversation ID as session ID
        conversationId: conv.id,
        title: conv.title || 'New Consultation',
        agent: agent || {
          name: 'Ask Expert',
          display_name: 'Ask Expert',
          description: null,
          avatar_url: null,
        },
        lastMessage: conv.updated_at || conv.created_at,
        messageCount: messagesArray.length,
        isPinned: conv.metadata?.is_pinned || false,
        mode: conv.metadata?.mode || 'mode1',
      };
    });

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error: any) {
    console.error('[Ask Expert API] Unexpected error:', error);
    return NextResponse.json({ success: true, sessions: [] });
  }
}
