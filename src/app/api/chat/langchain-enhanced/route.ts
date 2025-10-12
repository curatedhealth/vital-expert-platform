import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EnhancedLangChainService } from '@/features/chat/services/enhanced-langchain-service';
import { SupabaseRAGService } from '@/features/chat/services/supabase-rag-service';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize services
const ragService = new SupabaseRAGService(supabase);
const langchainService = new EnhancedLangChainService(ragService);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      agent, 
      userId, 
      sessionId, 
      options = {} 
    } = body;

    if (!message || !agent || !userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: message, agent, userId, sessionId' },
        { status: 400 }
      );
    }

    console.log('🔗 LangChain Enhanced API called:', {
      message: message.substring(0, 100) + '...',
      agentId: agent.id,
      userId,
      sessionId,
      options
    });

    // Get agent details from database
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agent.id)
      .single();

    if (agentError || !agentData) {
      console.error('❌ Agent not found:', agentError);
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          let metadata: any = {};
          let tokenUsage: any = {};

          // Execute enhanced conversational chain
          const result = await langchainService.executeConversationalChain({
            message,
            agent: {
              id: agent.id,
              name: agentData.display_name,
              businessFunction: agentData.business_function,
              systemPrompt: agentData.system_prompt,
              model: agentData.model || 'gpt-4',
              temperature: agentData.temperature || 0.7,
              maxTokens: agentData.max_tokens || 2000
            },
            userId,
            sessionId,
            chatHistory: options.chatHistory || [],
            enableRAG: options.enableRAG !== false,
            retrievalStrategy: options.retrievalStrategy || 'hybrid',
            memoryStrategy: options.memoryStrategy || 'buffer',
            streamCallback: (chunk) => {
              if (chunk.type === 'content') {
                fullContent = chunk.content;
                const data = JSON.stringify({
                  type: 'content',
                  content: chunk.content,
                  fullContent: fullContent,
                });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              } else if (chunk.type === 'retrieval') {
                const data = JSON.stringify({
                  type: 'retrieval',
                  documents: chunk.documents,
                  strategy: chunk.strategy
                });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              } else if (chunk.type === 'memory') {
                const data = JSON.stringify({
                  type: 'memory',
                  memoryType: chunk.memoryType,
                  content: chunk.content
                });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              } else if (chunk.type === 'metadata') {
                metadata = chunk.metadata;
                tokenUsage = chunk.tokenUsage;
              }
            }
          });

          // Save conversation to database
          try {
            const { error: saveError } = await supabase
              .from('chat_messages')
              .insert([
                {
                  session_id: sessionId,
                  user_id: userId,
                  agent_id: agent.id,
                  role: 'user',
                  content: message,
                  metadata: { 
                    timestamp: new Date().toISOString(),
                    enhancedMode: true
                  }
                },
                {
                  session_id: sessionId,
                  user_id: userId,
                  agent_id: agent.id,
                  role: 'assistant',
                  content: fullContent,
                  metadata: { 
                    timestamp: new Date().toISOString(),
                    enhancedMode: true,
                    tokenUsage,
                    retrievalStrategy: options.retrievalStrategy || 'hybrid',
                    memoryStrategy: options.memoryStrategy || 'buffer',
                    citations: result.citations,
                    sources: result.sources
                  }
                }
              ]);

            if (saveError) {
              console.error('❌ Error saving enhanced conversation:', saveError);
            } else {
              console.log('✅ Enhanced conversation saved to database');
            }
          } catch (dbError) {
            console.error('❌ Database error:', dbError);
          }

          // Send final metadata
          const finalMetadata = JSON.stringify({
            type: 'metadata',
            metadata: {
              agent: {
                id: agent.id,
                name: agentData.display_name,
                businessFunction: agentData.business_function
              },
              tokenUsage,
              retrievalStrategy: options.retrievalStrategy || 'hybrid',
              memoryStrategy: options.memoryStrategy || 'buffer',
              citations: result.citations,
              sources: result.sources,
              processingTime: Date.now(),
              enhancedMode: true
            }
          });

          controller.enqueue(new TextEncoder().encode(`data: ${finalMetadata}\n\n`));
          controller.close();

        } catch (error) {
          console.error('❌ Enhanced LangChain error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Failed to execute enhanced chain',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      }
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const memoryType = searchParams.get('memoryType') || 'all';

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, sessionId' },
        { status: 400 }
      );
    }

    console.log('🔍 Retrieving memory:', { userId, sessionId, memoryType });

    // Retrieve memory from LangChain service
    const memory = await langchainService.retrieveMemory({
      userId,
      sessionId,
      memoryType: memoryType as any
    });

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
    const memoryType = searchParams.get('memoryType') || 'all';

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, sessionId' },
        { status: 400 }
      );
    }

    console.log('🗑️ Clearing memory:', { userId, sessionId, memoryType });

    // Clear memory from LangChain service
    await langchainService.clearMemory({
      userId,
      sessionId,
      memoryType: memoryType as any
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Memory clearing error:', error);
    return NextResponse.json(
      { error: 'Failed to clear memory' },
      { status: 500 }
    );
  }
}
