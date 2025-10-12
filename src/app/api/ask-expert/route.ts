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
      useEnhancedWorkflow = false
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Ask Expert API called:', {
      message: message.substring(0, 100) + '...',
      agentId: agent?.id || 'direct-llm',
      userId,
      sessionId,
      ragEnabled,
      useEnhancedWorkflow
    });

    // Get agent details from database (skip for direct-llm)
    let agentData = agent;
    if (agent && agent.id !== 'direct-llm') {
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
    if (agent && agent.id === 'direct-llm') {
      systemPrompt = `You are a helpful AI assistant specializing in digital health, clinical trials, regulatory compliance, and healthcare innovation. Provide clear, accurate, and helpful responses to user questions. You can help with a wide range of topics including digital health, clinical trials, regulatory compliance, and general questions.`;
    } else {
      systemPrompt = `You are ${agentData.display_name}, a ${agentData.business_function} expert.

${agentData.system_prompt || `You are an expert in ${agentData.business_function} with deep knowledge of medical device development, regulatory affairs, and healthcare innovation.`}

Your capabilities include:
- ${agentData.capabilities?.join(', ') || 'Expert consultation and guidance'}

Please provide helpful, accurate, and professional responses based on your expertise.`;
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          let metadata: any = {};

          // Prepare messages for OpenAI
          const messages = [
            { role: 'system', content: systemPrompt },
            ...chatHistory.map((msg: any) => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: message }
          ];

          // Call OpenAI with streaming
          const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: messages as any,
            stream: true,
            temperature: 0.7,
            max_tokens: 2000,
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
            type: 'metadata',
            metadata: {
              selectedAgent: agentData ? {
                id: agentData.id,
                name: agentData.display_name || agentData.name,
                businessFunction: agentData.business_function,
                capabilities: agentData.capabilities || []
              } : {
                id: 'direct-llm',
                name: 'Direct LLM',
                businessFunction: 'General Purpose',
                capabilities: ['General AI Assistance']
              },
              citations: [],
              followupQuestions: [
                'Can you provide more specific guidance?',
                'What would be the next steps?',
                'Are there any important considerations I should know about?',
              ],
              sources: [],
              processingTime: 1000,
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
                agent_id: agentData?.id || 'direct-llm',
                role: 'assistant',
                content: fullContent,
                metadata: metadata
              });

            if (messageError) {
              console.error('❌ Failed to save message:', messageError);
            }
          } catch (dbError) {
            console.error('❌ Database error:', dbError);
          }

        } catch (error) {
          console.error('❌ Ask Expert streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Failed to generate response: ' + (error as Error).message,
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
    console.error('❌ Ask Expert API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}