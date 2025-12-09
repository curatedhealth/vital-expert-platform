/**
 * VITAL Platform - Mode 1 Streaming BFF Route
 *
 * Mode 1: Manual Interactive (Expert Chat)
 * Forwards SSE stream from Python backend to frontend.
 *
 * REWIRED Dec 2025: Now calls /api/expert/stream with mode: 1
 * (previously called non-existent /api/mode1/interactive-manual)
 *
 * Backend: /api/expert/stream (unified Mode 1 & Mode 2 endpoint)
 * Frontend Hook: useMode1Chat → useBaseInteractive → useSSEStream
 */

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export const runtime = 'edge'; // Use edge runtime for low-latency streaming

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const session = await auth();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get tenant from headers or session
    const tenantId = request.headers.get('x-tenant-id') || session.user.tenantId;
    if (!tenantId) {
      return new Response('Tenant not found', { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const {
      conversation_id,
      expert_id,
      message,
      mode,
      options = {},
    } = body;

    // Validate required fields
    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!expert_id) {
      return new Response(
        JSON.stringify({ error: 'Expert ID is required for Mode 1' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward to Python backend - Unified Expert Stream endpoint
    // CRITICAL FIX (Dec 2025): Changed from /api/mode1/interactive-manual to /api/expert/stream
    // The unified endpoint handles both Mode 1 (manual) and Mode 2 (auto-select)
    const backendResponse = await fetch(`${AI_ENGINE_URL}/api/expert/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
        'X-Tenant-ID': tenantId,
        'X-Request-ID': crypto.randomUUID(),
        'X-User-ID': session.user.id,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        mode: 1, // Mode 1 = Manual Interactive (expert pre-selected)
        expert_id: expert_id,
        message,
        session_id: conversation_id || crypto.randomUUID(),
        enable_rag: options.enable_rag ?? true,
        enable_web_search: options.enable_web_search ?? true,
        response_depth: options.response_depth || 'standard',
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[Mode1 Stream] Backend error:', backendResponse.status, errorText);
      
      return new Response(
        `event: error\ndata: ${JSON.stringify({
          code: `BACKEND_${backendResponse.status}`,
          message: errorText || 'Backend request failed',
          recoverable: backendResponse.status >= 500,
        })}\n\n`,
        {
          status: backendResponse.status,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
          },
        }
      );
    }

    // Stream response to client
    return new Response(backendResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('[Mode1 Stream] Error:', error);
    
    return new Response(
      `event: error\ndata: ${JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        recoverable: true,
      })}\n\n`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/event-stream' },
      }
    );
  }
}
