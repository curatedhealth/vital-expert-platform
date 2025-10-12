import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AutonomousExpertAgent } from '@/features/chat/agents/autonomous-expert-agent';
import { TokenTrackingCallback } from '@/features/chat/services/enhanced-langchain-service';

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
      options = {} 
    } = body;

    if (!message || !agent || !userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: message, agent, userId, sessionId' },
        { status: 400 }
      );
    }

    console.log('🤖 Autonomous Expert API called:', {
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

    // Initialize autonomous agent
    const autonomousAgent = new AutonomousExpertAgent({
      agentId: agent.id,
      agentName: agentData.display_name,
      businessFunction: agentData.business_function,
      capabilities: agentData.capabilities || [],
      specializations: agentData.specializations || [],
      systemPrompt: agentData.system_prompt,
      model: agentData.model || 'gpt-4',
      temperature: agentData.temperature || 0.7,
      maxTokens: agentData.max_tokens || 2000,
      maxIterations: options.maxIterations || 10,
      enableRAG: options.enableRAG !== false,
      enableLearning: options.enableLearning !== false,
      retrievalStrategy: options.retrievalStrategy || 'rag_fusion',
      memoryStrategy: options.memoryStrategy || 'research',
      outputFormat: options.outputFormat || 'regulatory',
      userId,
      sessionId
    });

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          let metadata: any = {};
          let toolUsage: any[] = [];
          let tokenUsage: any = {};

          // Set up token tracking
          const tokenTracker = new TokenTrackingCallback();
          
          // Execute autonomous agent
          const result = await autonomousAgent.execute({
            message,
            chatHistory: options.chatHistory || [],
            streamCallback: (chunk) => {
              if (chunk.type === 'content') {
                fullContent = chunk.content;
                const data = JSON.stringify({
                  type: 'content',
                  content: chunk.content,
                  fullContent: fullContent,
                });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              } else if (chunk.type === 'tool_use') {
                toolUsage.push(chunk.tool);
                const data = JSON.stringify({
                  type: 'tool_use',
                  tool: chunk.tool,
                  reasoning: chunk.reasoning
                });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              } else if (chunk.type === 'iteration') {
                const data = JSON.stringify({
                  type: 'iteration',
                  iteration: chunk.iteration,
                  maxIterations: chunk.maxIterations,
                  reasoning: chunk.reasoning
                });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              } else if (chunk.type === 'metadata') {
                metadata = chunk.metadata;
              }
            }
          });

          // Get final token usage
          tokenUsage = tokenTracker.getTokenUsage();

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
                    autonomousMode: true
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
                    autonomousMode: true,
                    toolUsage,
                    tokenUsage,
                    iterations: result.iterations,
                    reasoning: result.reasoning,
                    citations: result.citations,
                    sources: result.sources
                  }
                }
              ]);

            if (saveError) {
              console.error('❌ Error saving autonomous conversation:', saveError);
            } else {
              console.log('✅ Autonomous conversation saved to database');
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
              toolUsage,
              iterations: result.iterations,
              reasoning: result.reasoning,
              citations: result.citations,
              sources: result.sources,
              processingTime: Date.now(),
              autonomousMode: true
            }
          });

          controller.enqueue(new TextEncoder().encode(`data: ${finalMetadata}\n\n`));
          controller.close();

        } catch (error) {
          console.error('❌ Autonomous agent error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Failed to execute autonomous agent',
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
    console.error('❌ Autonomous Expert API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
