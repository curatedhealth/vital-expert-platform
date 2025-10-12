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

          // Build autonomous research system prompt
          const systemPrompt = `You are an Autonomous Expert Agent specializing in comprehensive research and analysis. You have access to multiple research tools and can perform multi-step reasoning to provide thorough, evidence-based responses.

Your capabilities include:
- FDA database searches and regulatory guidance lookup
- Clinical trials research and study design analysis
- Literature review from PubMed and ArXiv
- Web search for current information via Tavily
- Multi-step reasoning and synthesis
- Structured output generation

Current query: ${message}

Please provide a comprehensive analysis using your research capabilities. Structure your response with:
1. Executive Summary
2. Key Findings
3. Detailed Analysis
4. Recommendations
5. Sources and References

Be thorough, accurate, and cite your sources.`;

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
                id: agent?.id || 'autonomous',
                name: agent?.display_name || 'Autonomous Expert Agent',
                businessFunction: agent?.business_function || 'Research',
                capabilities: agent?.capabilities || ['Autonomous Research', 'Multi-tool Usage']
              },
              autonomous: true,
              toolsUsed: ['research', 'analysis', 'synthesis'],
              iterations: 1,
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