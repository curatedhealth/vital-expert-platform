import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      agent, 
      userId, 
      sessionId, 
      chatHistory = [],
      ragEnabled = false 
    } = body;

    if (!message || !agent || !userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: message, agent, userId, sessionId' },
        { status: 400 }
      );
    }

    console.log('🤖 Ask Expert API called:', {
      message: message.substring(0, 100) + '...',
      agentId: agent.id,
      userId,
      sessionId,
      chatHistoryLength: chatHistory.length
    });

    // Get agent details from database (skip for direct-llm)
    let agentData = agent;
    if (agent.id !== 'direct-llm') {
      const { data: dbAgentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agent.id)
        .single();

      if (agentError || !dbAgentData) {
        console.error('❌ Agent not found:', agentError);
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        );
      }
      agentData = dbAgentData;
    }

    // Build system prompt
    let systemPrompt;
    if (agent.id === 'direct-llm') {
      systemPrompt = `You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user questions. You can help with a wide range of topics including digital health, clinical trials, regulatory compliance, and general questions.`;
    } else {
      systemPrompt = `You are ${agentData.display_name}, a ${agentData.business_function} expert.

${agentData.system_prompt || `You are an expert in ${agentData.business_function} with deep knowledge of medical device development, regulatory affairs, and healthcare innovation.`}

Your capabilities include:
- ${agentData.capabilities?.join(', ') || 'Expert consultation and guidance'}

Please provide helpful, accurate, and professional responses based on your expertise.`;
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('📝 Sending to OpenAI:', {
      model: agentData.model || 'gpt-4',
      messageCount: messages.length,
      agentName: agentData.display_name
    });

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: agentData.model || 'gpt-4',
      messages: messages as any,
      temperature: agentData.temperature || 0.7,
      max_tokens: agentData.max_tokens || 2000,
      stream: true
    });

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          let tokenCount = 0;

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            
            if (content) {
              fullContent += content;
              tokenCount++;

              const data = JSON.stringify({
                type: 'content',
                content: content,
                fullContent: fullContent,
              });

              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            }
          }

          // Save message to database
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
                  metadata: { timestamp: new Date().toISOString() }
                },
                {
                  session_id: sessionId,
                  user_id: userId,
                  agent_id: agent.id,
                  role: 'assistant',
                  content: fullContent,
                  metadata: { 
                    timestamp: new Date().toISOString(),
                    tokenCount,
                    model: agentData.model || 'gpt-4'
                  }
                }
              ]);

            if (saveError) {
              console.error('❌ Error saving messages:', saveError);
            } else {
              console.log('✅ Messages saved to database');
            }
          } catch (dbError) {
            console.error('❌ Database error:', dbError);
          }

          // Send final metadata
          const metadata = JSON.stringify({
            type: 'metadata',
            metadata: {
              agent: {
                id: agent.id,
                name: agentData.display_name,
                businessFunction: agentData.business_function
              },
              tokenUsage: {
                promptTokens: 0, // Would need to calculate from input
                completionTokens: tokenCount,
                totalTokens: tokenCount
              },
              processingTime: Date.now(),
              citations: [],
              sources: []
            }
          });

          controller.enqueue(new TextEncoder().encode(`data: ${metadata}\n\n`));
          controller.close();

        } catch (error) {
          console.error('❌ Streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Failed to generate response'
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
    console.error('❌ Ask Expert API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
