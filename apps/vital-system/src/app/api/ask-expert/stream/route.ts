import { NextRequest } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// Force dynamic to prevent Next.js from caching/buffering
export const dynamic = 'force-dynamic';
export const runtime = 'edge'; // Edge runtime for better streaming support

/**
 * Backward-compatible proxy that now routes to unified backend endpoints:
 * - Modes 1/2 -> POST /api/expert/stream
 * - Modes 3/4 -> POST /api/missions/stream
 *
 * Uses TransformStream to ensure real-time streaming without buffering.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';
    const mode = String(body.mode || '1');
    const userId = body.user_id || request.headers.get('x-user-id') || 'anonymous';

    const isInteractive = mode === '1' || mode === '2';
    const backendPath = isInteractive ? '/api/expert/stream' : '/api/missions/stream';

    // Support both expert_id and agent_id from frontend (backward compatibility)
    // Frontend page.tsx sends expert_id, some hooks send agent_id
    const agentId = body.expert_id || body.agent_id;

    const payload = isInteractive
      ? {
          mode: Number(mode),
          message: body.message,
          expert_id: agentId,
          tenant_id: tenantId,
          user_id: userId,
          session_id: body.session_id,
          mission_id: body.mission_id,
          user_context: body.user_context || {},
        }
      : {
          mode: Number(mode),
          goal: body.message || body.goal,
          template_id: body.template_id,
          expert_id: agentId,
          mission_id: body.mission_id,
          options: body.options,
          user_context: body.user_context || {},
        };

    const response = await fetch(`${AI_ENGINE_URL}${backendPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(payload),
      // @ts-ignore - Next.js specific option to disable response buffering
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ask-expert/stream] Backend error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Backend error: ${response.status}`, details: errorText }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if backend returned a stream
    if (!response.body) {
      return new Response(
        JSON.stringify({ error: 'No response body from backend' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use TransformStream to ensure immediate chunk forwarding
    // This prevents any buffering in the proxy layer
    const { readable, writable } = new TransformStream({
      transform(chunk, controller) {
        // Pass through chunks immediately without buffering
        controller.enqueue(chunk);
      },
    });

    // Pipe the backend response through our transform stream
    response.body.pipeTo(writable).catch((err) => {
      console.error('[ask-expert/stream] Pipe error:', err);
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    console.error('[ask-expert/stream] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error?.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}




