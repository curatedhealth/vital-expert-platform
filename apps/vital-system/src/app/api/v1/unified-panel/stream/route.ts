import { NextRequest } from 'next/server';

/**
 * Unified Panel Stream API
 *
 * POST /api/v1/unified-panel/stream
 *
 * Executes a panel consultation with Server-Sent Events (SSE) streaming.
 * Returns real-time updates as the panel executes.
 */

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[Unified Panel Stream] Request:', {
      panel_type: body.panel_type,
      question_length: body.question?.length,
      agent_count: body.agents?.length,
    });

    // Create a TransformStream to handle SSE
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Proxy to backend stream endpoint
          const response = await fetch(`${AI_ENGINE_URL}/api/v1/unified-panel/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'text/event-stream',
              'x-tenant-id': request.headers.get('x-tenant-id') || body.tenant_id || 'default',
            },
            body: JSON.stringify({
              question: body.question,
              panel_type: body.panel_type,
              agents: body.agents,
              context: body.context,
              tenant_id: body.tenant_id || 'default',
              user_id: body.user_id,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('[Unified Panel Stream] Backend error:', errorData);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', data: { message: errorData.detail || 'Backend error' } })}\n\n`)
            );
            controller.close();
            return;
          }

          if (!response.body) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', data: { message: 'No response body' } })}\n\n`)
            );
            controller.close();
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Forward the SSE data as-is
            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(encoder.encode(chunk));
          }

          controller.close();
        } catch (error) {
          console.error('[Unified Panel Stream] Error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', data: { message: String(error) } })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('[Unified Panel Stream] Parse error:', error);
    return new Response(
      `data: ${JSON.stringify({ type: 'error', data: { message: 'Failed to parse request' } })}\n\n`,
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        status: 400,
      }
    );
  }
}
