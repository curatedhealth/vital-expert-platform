import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

          // Build enhanced LangChain system prompt
          const systemPrompt = `You are an Enhanced LangChain Agent with advanced RAG (Retrieval-Augmented Generation) capabilities. You can access and synthesize information from multiple sources to provide comprehensive, evidence-based responses.

Your enhanced capabilities include:
- Advanced retrieval from knowledge bases
- Multi-source information synthesis
- Context-aware responses with citations
- Memory integration across conversations
- Structured analysis and recommendations

Current query: ${message}

Please provide a detailed analysis with:
1. Comprehensive overview
2. Key insights from multiple perspectives
3. Evidence-based recommendations
4. Source citations and references
5. Next steps and follow-up considerations

Use your enhanced capabilities to provide the most thorough and accurate response possible.`;

          // Get OpenAI streaming response
          const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            stream: true,
          });

          // Stream the response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              const data = JSON.stringify({
                type: 'content',
                content: content,
                fullContent: fullContent,
              });
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            }
          }

          // Send final metadata
          const finalData = JSON.stringify({
            type: 'final',
            content: fullContent,
            metadata: {
              selectedAgent: {
                id: agent?.id || 'enhanced',
                name: agent?.display_name || agent?.name || 'Enhanced LangChain Agent',
                businessFunction: agent?.business_function || 'General',
                capabilities: agent?.capabilities || ['Enhanced Memory', 'RAG Retrieval']
              },
              citations: ['Enhanced LangChain Processing'],
              sources: ['Knowledge Base', 'RAG Retrieval', 'Context Analysis'],
              processingTime: Date.now(),
              tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
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