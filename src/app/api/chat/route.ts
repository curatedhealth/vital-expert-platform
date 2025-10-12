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
      ragEnabled = false,
      automaticRouting = true,
      useIntelligentRouting = true
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Chat API called:', {
      message: message.substring(0, 100) + '...',
      agentId: agent?.id || 'no-agent',
      userId,
      sessionId,
      automaticRouting,
      useIntelligentRouting
    });

    // Simple fallback: if no agent provided, use basic OpenAI response
    if (!agent) {
      console.log('⚠️ No agent provided, using basic OpenAI response');
      
      // Create streaming response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const completion = await openai.chat.completions.create({
              model: 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: 'You are a helpful AI assistant specializing in digital health, clinical trials, and regulatory compliance. Provide clear, accurate, and helpful responses.'
                },
                ...chatHistory.map(msg => ({
                  role: msg.role as 'user' | 'assistant',
                  content: msg.content
                })),
                { role: 'user', content: message }
              ],
              stream: true,
              temperature: 0.7,
              max_tokens: 2000
            });

            let fullContent = '';
            
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                  type: 'content',
                  content: content,
                  fullContent: fullContent
                })}\n\n`));
              }
            }

            // Send final message
            const finalData = JSON.stringify({
              type: 'final',
              content: fullContent,
              metadata: {
                agent: {
                  id: 'general-assistant',
                  name: 'General Assistant',
                  businessFunction: 'General Purpose'
                },
                sources: [],
                citations: [],
                followupQuestions: [],
                processingTime: 1000,
                tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
              }
            });
            
            controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
            controller.close();
          } catch (error) {
            console.error('❌ OpenAI streaming error:', error);
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'error',
              content: 'Sorry, I encountered an error. Please try again.'
            })}\n\n`));
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
    }

    // Handle agent-specific response
    console.log('🎯 Using provided agent:', agent.id);
    
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

    // Create streaming response with agent context
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: agentData.model || 'gpt-4',
            messages: [
              {
                role: 'system',
                content: agentData.system_prompt || `You are ${agentData.display_name}, a ${agentData.business_function} expert. ${agentData.description || 'Provide expert guidance in your field.'}`
              },
              ...chatHistory.map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content
              })),
              { role: 'user', content: message }
            ],
            stream: true,
            temperature: agentData.temperature || 0.7,
            max_tokens: agentData.max_tokens || 2000
          });

          let fullContent = '';
          
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'content',
                content: content,
                fullContent: fullContent
              })}\n\n`));
            }
          }

          // Send final message
          const finalData = JSON.stringify({
            type: 'final',
            content: fullContent,
            metadata: {
              agent: {
                id: agentData.id,
                name: agentData.display_name,
                businessFunction: agentData.business_function,
                capabilities: agentData.capabilities || []
              },
              sources: [],
              citations: [],
              followupQuestions: [],
              processingTime: 1000,
              tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
            }
          });
          
          controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
          controller.close();
        } catch (error) {
          console.error('❌ OpenAI streaming error:', error);
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'error',
            content: 'Sorry, I encountered an error. Please try again.'
          })}\n\n`));
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
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}