import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EnhancedLangChainService } from '@/features/chat/services/enhanced-langchain-service';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize enhanced LangChain service
const enhancedLangChainService = new EnhancedLangChainService({
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      agent,
      userId,
      sessionId,
      chatHistory = [],
      options = {}
    } = body;

    if (!message || !userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: message, userId, sessionId' },
        { status: 400 }
      );
    }

    console.log('🤖 LangChain Enhanced API called:', {
      message: message.substring(0, 100) + '...',
      agentId: agent?.id || 'enhanced',
      userId,
      sessionId,
      options
    });

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          let metadata: any = {};
          let tokenUsage: any = {};

          // Use enhanced LangChain service with memory and RAG
          const result = await enhancedLangChainService.chat(message, chatHistory, {
            userId,
            sessionId,
            agentId: agent?.id,
            agentName: agent?.display_name || agent?.name,
            businessFunction: agent?.business_function,
            capabilities: agent?.capabilities || [],
            specializations: agent?.specializations || [],
            systemPrompt: agent?.system_prompt,
            model: agent?.model || 'gpt-4',
            temperature: agent?.temperature || 0.7,
            maxTokens: agent?.max_tokens || 2000,
            ragEnabled: options.ragEnabled || true,
            memoryStrategy: options.memoryStrategy || 'buffer_window',
            retrievalStrategy: options.retrievalStrategy || 'hybrid',
            streamCallback: (chunk) => {
              if (chunk.type === 'content') {
                fullContent = chunk.content;
                const data = JSON.stringify({
                  type: 'content',
                  content: chunk.content,
                  fullContent: fullContent,
                });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              } else if (chunk.type === 'metadata') {
                metadata = { ...metadata, ...chunk.metadata };
              } else if (chunk.type === 'tokenUsage') {
                tokenUsage = chunk.tokenUsage;
              }
            }
          });

          // Send final metadata
          const finalData = JSON.stringify({
            type: 'metadata',
            metadata: {
              ...metadata,
              selectedAgent: {
                id: agent?.id || 'enhanced',
                name: agent?.display_name || agent?.name || 'Enhanced LangChain Agent',
                businessFunction: agent?.business_function || 'General',
                capabilities: agent?.capabilities || ['Enhanced Memory', 'RAG Retrieval']
              },
              citations: result.citations || [],
              sources: result.sources || [],
              processingTime: result.processingTime || 0,
              tokenUsage: tokenUsage || result.tokenUsage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            },
          });
          
          controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
          controller.close();

          // Save message to database
          try {
            const { error: messageError } = await supabase
              .from('chat_messages')
              .insert({
                session_id: sessionId,
                user_id: userId,
                agent_id: agent?.id || 'enhanced',
                role: 'assistant',
                content: fullContent,
                metadata: {
                  ...metadata,
                  enhanced: true,
                  citations: result.citations || [],
                  sources: result.sources || []
                }
              });

            if (messageError) {
              console.error('❌ Failed to save enhanced message:', messageError);
            }
          } catch (dbError) {
            console.error('❌ Database error:', dbError);
          }

        } catch (error) {
          console.error('❌ LangChain Enhanced streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Failed to generate enhanced response: ' + (error as Error).message,
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
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
    console.error('❌ LangChain Enhanced API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing userId or sessionId' },
        { status: 400 }
      );
    }

    // Retrieve memory for user session
    const memory = await enhancedLangChainService.getMemory(userId, sessionId);
    
    return NextResponse.json({ memory });
  } catch (error) {
    console.error('❌ Memory retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve memory' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing userId or sessionId' },
        { status: 400 }
      );
    }

    // Clear memory for user session
    await enhancedLangChainService.clearMemory(userId, sessionId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Memory clearing error:', error);
    return NextResponse.json(
      { error: 'Failed to clear memory' },
      { status: 500 }
    );
  }
}