/**
 * VITAL Platform - Mode 2 Streaming BFF Route
 *
 * Mode 2: Automatic Interactive (Smart Chat)
 * System AUTO-SELECTS expert via Fusion Intelligence.
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

export const runtime = 'edge';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const session = await auth();

    // Debug: log auth status
    console.log('[Mode2 Stream] Auth check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id?.slice(0, 8) + '...',
    });

    if (!session?.user) {
      console.error('[Mode2 Stream] Auth failed - no session or user');
      // Return SSE-formatted error for proper client handling
      return new Response(
        `event: error\ndata: ${JSON.stringify({
          code: 'AUTH_FAILED',
          message: 'Authentication required. Please sign in.',
          recoverable: true,
        })}\n\n`,
        {
          status: 401,
          headers: { 'Content-Type': 'text/event-stream' },
        }
      );
    }

    // Get tenant
    const tenantId = request.headers.get('x-tenant-id') || session.user.tenantId;
    if (!tenantId) {
      console.error('[Mode2 Stream] No tenant ID found');
      return new Response(
        `event: error\ndata: ${JSON.stringify({
          code: 'TENANT_MISSING',
          message: 'Tenant not found. Please contact support.',
          recoverable: false,
        })}\n\n`,
        {
          status: 403,
          headers: { 'Content-Type': 'text/event-stream' },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      conversation_id,
      message,
      session_id,    // Accept session_id from frontend (same as Mode 1)
      tenant_id,     // Accept tenant_id from frontend (same as Mode 1)
      options = {},
    } = body;

    // Validate required fields
    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Note: Mode 2 does NOT require agent_id - Fusion Intelligence auto-selects

    // Debug: Log FULL tenant context for troubleshooting
    console.log('[Mode2 Stream] 🔍 TENANT DEBUG:', {
      headerTenantId: request.headers.get('x-tenant-id'),
      sessionTenantId: session.user.tenantId,
      resolvedTenantId: tenantId,
      bodyTenantId: tenant_id,
      finalTenantId: tenant_id || tenantId,
    });

    // Debug: Log request details
    console.log('[Mode2 Stream] Request:', {
      message: message?.slice(0, 100),
      session_id: session_id || conversation_id,
      tenant_id: tenant_id || tenantId,
      AI_ENGINE_URL,
    });

    // Forward to Python backend - Unified Interactive endpoint
    // Mode 2 = NO agent_id → backend uses Fusion auto-selection
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
        mode: 2, // Mode 2 = Automatic Interactive (Fusion auto-selection)
        // expert_id: undefined,  // Explicitly omitted for Mode 2
        message,
        // Use session_id from body, fallback to conversation_id, then generate new
        session_id: session_id || conversation_id || crypto.randomUUID(),
        tenant_id: tenant_id || tenantId, // Pass tenant_id to backend
        enable_rag: options.enable_rag ?? true,
        enable_web_search: options.enable_web_search ?? true,
        response_depth: options.response_depth || 'standard',
        // Fusion-specific options (Mode 2 auto-selection)
        fusion_weights: options.fusion_weights || {
          vector: 0.4,
          graph: 0.35,
          relational: 0.25,
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
