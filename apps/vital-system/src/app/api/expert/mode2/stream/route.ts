/**
 * VITAL Platform - Mode 2 Streaming BFF Route
 * 
 * Mode 2: Automatic Interactive (Smart Chat)
 * System automatically selects experts via Fusion Intelligence.
 * 
 * Phase 4: Integration & Streaming
 */

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export const runtime = 'edge';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const session = await auth();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get tenant
    const tenantId = request.headers.get('x-tenant-id') || session.user.tenantId;
    if (!tenantId) {
      return new Response('Tenant not found', { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const {
      conversation_id,
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

    // Forward to Python backend - Mode 2 uses automatic selection
    const backendResponse = await fetch(`${AI_ENGINE_URL}/api/v1/expert/stream`, {
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
        conversation_id: conversation_id || crypto.randomUUID(),
        message,
        mode: mode || 'mode2_automatic_interactive',
        tenant_id: tenantId,
        user_id: session.user.id,
        options: {
          enable_rag: options.enable_rag ?? true,
          enable_websearch: options.enable_websearch ?? true,
          response_depth: options.response_depth || 'standard',
          max_experts: options.max_experts || 3,
          preferred_domains: options.preferred_domains || [],
          // Mode 2 specific - enable Fusion Intelligence
          enable_fusion: true,
          fusion_weights: {
            vector: 0.4,
            graph: 0.35,
            relational: 0.25,
          },
        },
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[Mode2 Stream] Backend error:', backendResponse.status, errorText);
      
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
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('[Mode2 Stream] Error:', error);
    
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
