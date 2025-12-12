/**
 * VITAL Platform - Mode 1 Streaming BFF Route
 *
 * Mode 1: Manual Interactive (Expert Chat)
 * User MANUALLY selects agent → single-turn conversation.
 *
 * ARCHITECTURE (Dec 2025):
 * - Mode 1 and Mode 2 use the SAME interactive executor
 * - The only difference is agent selection:
 *   - Mode 1: agent_id is provided (manual selection)
 *   - Mode 2: agent_id is null (Fusion auto-selection)
 *
 * Backend Endpoint: /api/expert/interactive (unified interactive endpoint)
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
      agent_id,   // Primary field name (standard across all modes)
      expert_id,  // Backwards compatibility alias
      message,
      mode,
      session_id,
      tenant_id,
      options = {},
    } = body;

    // agent_id is primary, expert_id kept for backwards compatibility
    const effectiveAgentId = agent_id || expert_id;

    // Validate required fields
    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!effectiveAgentId) {
      return new Response(
        JSON.stringify({ error: 'Agent ID is required for Mode 1' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward to Python backend - Unified Interactive endpoint
    // Mode 1 = agent_id provided → backend uses manual selection
    const backendResponse = await fetch(`${AI_ENGINE_URL}/api/expert/interactive`, {
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
        mode: 1, // Mode 1 = Manual Interactive (agent pre-selected)
        agent_id: effectiveAgentId,   // Primary field name
        expert_id: effectiveAgentId,  // Backwards compatibility
        message,
        session_id: session_id || conversation_id || crypto.randomUUID(),
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
