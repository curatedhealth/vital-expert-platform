import { NextRequest } from 'next/server';
import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

/**
 * POST /api/panel/orchestrate/stream - Stream panel consultation with real-time updates
 *
 * Uses Server-Sent Events (SSE) to stream workflow execution state
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, panel, context, mode = 'parallel', threadId } = body;

    if (!message || !panel?.members) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: message, panel.members' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const personas = panel.members.map((m: any) => m.agent?.name || m.name);

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Send initial connection event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`)
          );

          // Stream the orchestration
          for await (const chunk of langGraphOrchestrator.orchestrateStream({
            mode,
            question: message,
            personas,
            evidenceSources: context?.evidence || [],
            threadId
          })) {
            // Send each chunk as SSE event
            const data = `data: ${JSON.stringify(chunk)}\n\n`;
            controller.enqueue(encoder.encode(data));

            // If this is the completion event, close the stream
            if (chunk.type === 'complete') {
              controller.close();
              return;
            }
          }
        } catch (error: any) {
          console.error('Streaming error:', error);

          // Send error event
          const errorData = `data: ${JSON.stringify({
            type: 'error',
            error: error.message || 'Streaming failed',
            timestamp: new Date().toISOString()
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },

      cancel() {
        // Client disconnected
        console.log('Client disconnected from stream');
      }
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });

  } catch (error: any) {
    console.error('Stream initialization error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to initialize stream'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
