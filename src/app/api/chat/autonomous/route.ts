import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AutonomousExpertAgent } from '@/features/chat/agents/autonomous-expert-agent';
import { EnhancedLangChainService } from '@/features/chat/services/enhanced-langchain-service';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize services
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

    console.log('🤖 Autonomous Chat API called:', {
      message: message.substring(0, 100) + '...',
      agentId: agent?.id || 'autonomous',
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

          // Initialize autonomous agent
          const autonomousAgent = new AutonomousExpertAgent({
            userId,
            sessionId,
            agentId: agent?.id || 'autonomous',
            options: {
              stream: true,
              enableRAG: options.enableRAG || true,
              enableLearning: options.enableLearning || true,
              retrievalStrategy: options.retrievalStrategy || 'rag_fusion',
              memoryStrategy: options.memoryStrategy || 'research',
              outputFormat: options.outputFormat || 'regulatory',
              maxIterations: options.maxIterations || 10,
              ...options
            }
          });

          // Execute autonomous research
          const result = await autonomousAgent.execute(message, {
            chatHistory,
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
                id: agent?.id || 'autonomous',
                name: agent?.display_name || 'Autonomous Expert Agent',
                businessFunction: agent?.business_function || 'Research',
                capabilities: agent?.capabilities || ['Autonomous Research', 'Multi-tool Usage']
              },
              reasoning: result.reasoning,
              toolsUsed: result.toolsUsed || [],
              iterations: result.iterations || 0,
              processingTime: result.processingTime || 0,
              tokenUsage: tokenUsage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
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
                agent_id: agent?.id || 'autonomous',
                role: 'assistant',
                content: fullContent,
                metadata: {
                  ...metadata,
                  autonomous: true,
                  toolsUsed: result.toolsUsed || [],
                  iterations: result.iterations || 0
                }
              });

            if (messageError) {
              console.error('❌ Failed to save autonomous message:', messageError);
            }
          } catch (dbError) {
            console.error('❌ Database error:', dbError);
          }

        } catch (error) {
          console.error('❌ Autonomous streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Failed to generate autonomous response: ' + (error as Error).message,
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
    console.error('❌ Autonomous Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}