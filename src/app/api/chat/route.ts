import { NextRequest, NextResponse } from 'next/server';
import { streamModeAwareWorkflow } from '@/features/chat/services/ask-expert-graph';

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      userId, 
      sessionId, 
      agent, 
      interactionMode = 'automatic', 
      autonomousMode = false, 
      selectedTools = [],
      chatHistory = []
    } = await request.json();

    console.log(`🚀 Chat API: ${interactionMode} + ${autonomousMode ? 'Autonomous' : 'Normal'} mode`);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream workflow execution
          for await (const event of streamModeAwareWorkflow({
            query: message,
            agentId: agent?.id,
            sessionId: sessionId || `session-${Date.now()}`,
            userId: userId || 'anonymous',
            selectedAgent: agent,
            interactionMode,
            autonomousMode,
            selectedTools,
            chatHistory
          })) {
            // Send workflow steps as SSE
            const sseData = {
              type: event.type || 'workflow_step',
              content: event.description || event.step || 'Processing...',
              data: event.data || {}
            };

            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify(sseData)}\n\n`)
            );
          }
          
          // Send completion signal
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'complete',
              content: 'Workflow completed successfully'
            })}\n\n`)
          );
          
          controller.close();
        } catch (error) {
          console.error('❌ Workflow execution failed:', error);
          
          // Send error as SSE
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'error',
              content: error instanceof Error ? error.message : 'Workflow execution failed'
            })}\n\n`)
          );
          
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}