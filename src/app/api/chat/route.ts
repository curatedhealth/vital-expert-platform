import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 [Chat API Simple] POST request received');
  
  try {
    const body = await request.json();
    console.log('📥 [Chat API Simple] Request body:', { 
      message: body.message,
      query: body.query,
      agent: body.agent,
      isAutonomousMode: body.isAutonomousMode
    });

    const { message, query, agent = null } = body;
    const userMessage = message || query;

    // Validate required fields
    if (!userMessage) {
      return NextResponse.json(
        { error: 'Message or query is required' },
        { status: 400 }
      );
    }

    // Create a streaming response with mock chat response
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        // Mock chat response
        const response = `I understand you're asking about "${userMessage}". This is a mock response from the chat API. In a full implementation, this would connect to the actual AI services and provide a real response.`;

        // Stream the response character by character
        let index = 0;
        const streamResponse = () => {
          if (index < response.length) {
            const chunk = response.slice(index, index + 10); // Stream 10 characters at a time
            const event = {
              type: 'content',
              content: chunk,
              timestamp: new Date().toISOString()
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            index += 10;
            setTimeout(streamResponse, 50); // 50ms delay between chunks
          } else {
            // Send completion event
            const completionEvent = {
              type: 'completion',
              status: 'completed',
              timestamp: new Date().toISOString()
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionEvent)}\n\n`));
            controller.close();
          }
        };

        // Start streaming
        streamResponse();
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
    console.error('❌ [Chat API Simple] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}