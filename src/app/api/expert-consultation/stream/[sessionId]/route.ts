import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;

  console.log('🔌 [ReasoningStream] SSE connection requested for session:', sessionId);

  // Create a streaming response for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection event
      const connectEvent = {
        type: 'connected',
        data: { sessionId, timestamp: new Date().toISOString() }
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(connectEvent)}\n\n`));

      // Keep connection alive with periodic heartbeat
      const heartbeat = setInterval(() => {
        const heartbeatEvent = {
          type: 'heartbeat',
          data: { timestamp: new Date().toISOString() }
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(heartbeatEvent)}\n\n`));
      }, 30000); // Every 30 seconds

      // Cleanup function
      const cleanup = () => {
        clearInterval(heartbeat);
        console.log('🔌 [ReasoningStream] Connection closed for session:', sessionId);
      };

      // Handle client disconnect
      request.signal.addEventListener('abort', cleanup);

      // Store cleanup function for potential manual cleanup
      (controller as any).cleanup = cleanup;
    },
    cancel() {
      console.log('🔌 [ReasoningStream] Stream cancelled for session:', sessionId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
