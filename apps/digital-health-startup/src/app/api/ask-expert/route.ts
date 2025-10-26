import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { streamAskExpertWorkflow } from '@/features/chat/services/ask-expert-graph';
import { enhancedLangChainService } from '@/features/chat/services/enhanced-langchain-service';

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
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await request.json();
    const {
      message,
      agent,
      userId = 'anonymous',
      sessionId,
      chatHistory = [],
      ragEnabled = true,
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
          ragEnabled,
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
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Get user's Ask Expert sessions
    const { data: sessions, error } = await supabase
      .from('chat_messages')
      .select(`
        session_id,
        agent_id,
        agents!inner(name, description, avatar),
        created_at
      `)
      .eq('user_id', userId)
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    // Group by session
    const sessionMap = new Map();
    sessions.forEach((msg: any) => {
      if (!sessionMap.has(msg.session_id)) {
        sessionMap.set(msg.session_id, {
          sessionId: msg.session_id,
          agent: msg.agents,
          lastMessage: msg.created_at,
          messageCount: 0,
        });
      }
      sessionMap.get(msg.session_id).messageCount++;
    });

    return NextResponse.json({
      success: true,
      sessions: Array.from(sessionMap.values()),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
