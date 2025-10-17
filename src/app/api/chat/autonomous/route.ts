import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';

export async function POST(request: NextRequest) {
  console.log('🚀 [Autonomous API] POST request received');
  
  try {
    const body = await request.json();
    console.log('📥 [Autonomous API] Request body:', { 
      query: body.query, 
      mode: body.mode,
      isAutonomousMode: body.isAutonomousMode 
    });

    const { query, mode = 'automatic' } = body;

    // Validate required fields
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Create a streaming response with reasoning steps
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        // Send initial reasoning step
        const initialStep = {
          type: 'reasoning',
          step: 1,
          status: 'in_progress',
          description: `Analyzing your request for "${query}" and developing a comprehensive strategy...`,
          timestamp: new Date().toISOString()
        };
        
        console.log('🧠 [API] Sending initial reasoning step:', initialStep);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialStep)}\n\n`));

        // Simulate reasoning steps with delays - INTELLIGENT ANALYSIS
        const reasoningSteps = [
          {
            type: 'reasoning',
            step: 2,
            status: 'in_progress',
            description: 'Analyzing query context and extracting key requirements...',
            timestamp: new Date().toISOString()
          },
          {
            type: 'reasoning',
            step: 3,
            status: 'in_progress',
            description: 'Researching relevant digital health technologies and approaches...',
            timestamp: new Date().toISOString()
          },
          {
            type: 'reasoning',
            step: 4,
            status: 'in_progress',
            description: 'Evaluating regulatory and compliance considerations...',
            timestamp: new Date().toISOString()
          },
          {
            type: 'reasoning',
            step: 5,
            status: 'completed',
            description: 'Generating comprehensive AI-powered strategy analysis...',
            timestamp: new Date().toISOString()
          }
        ];

        // Send reasoning steps with delays
        let stepIndex = 0;
        const sendNextStep = () => {
          if (stepIndex < reasoningSteps.length) {
            const step = reasoningSteps[stepIndex];
            console.log('🧠 [API] Sending reasoning step:', step);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(step)}\n\n`));
            stepIndex++;
            setTimeout(sendNextStep, 2000); // 2 second delay between steps
          } else {
            // Wait a bit before starting content after reasoning is complete
            console.log('🧠 [API] All reasoning steps complete, starting AI analysis...');
            setTimeout(async () => {
              // Use real AI to analyze the user query
              try {
                const llm = new ChatOpenAI({
                  modelName: 'gpt-4o',
                  temperature: 0.7,
                  streaming: true,
                });

                const prompt = `You are a digital health strategy expert. Analyze the following user query and provide a comprehensive digital health strategy response. Be specific to their actual query and avoid generic templates.

User Query: "${query}"

Please provide:
1. A relevant title based on their specific query
2. Executive summary addressing their specific needs
3. Key strategic pillars tailored to their query
4. Implementation roadmap
5. Success metrics relevant to their domain

Be thorough, specific, and directly address what they're asking about.`;

                console.log('🤖 [API] Starting AI analysis for query:', query);
                
                // Stream the AI response
                const stream = await llm.stream(prompt);
                
                let fullResponse = '';
                for await (const chunk of stream) {
                  const content = chunk.content;
                  if (content) {
                    fullResponse += content;
                    
                    // Send content chunk to client
                    const contentEvent = {
                      type: 'content',
                      content: content,
                      timestamp: new Date().toISOString()
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(contentEvent)}\n\n`));
                  }
                }
                
                console.log('✅ [API] AI analysis complete, response length:', fullResponse.length);
                
              } catch (aiError) {
                console.error('❌ [API] AI analysis failed:', aiError);
                
                // Fallback response if AI fails
                const fallbackContent = `I apologize, but I encountered an issue while analyzing your query: "${query}". 

Please try rephrasing your question or contact support if the issue persists.`;
                
                const contentEvent = {
                  type: 'content',
                  content: fallbackContent,
                  timestamp: new Date().toISOString()
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(contentEvent)}\n\n`));
              }

              // Send completion event after AI analysis
              const completionEvent = {
                type: 'complete',
                message: 'AI analysis completed successfully',
                timestamp: new Date().toISOString()
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionEvent)}\n\n`));
              controller.close();
              
            }, 3000); // Wait 3 seconds after reasoning is complete
          }
        };
        
        setTimeout(sendNextStep, 500); // Start reasoning steps after 500ms
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('❌ [Autonomous API] Error:', error);
    console.error('❌ [Autonomous API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}