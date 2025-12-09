/**
 * VITAL Platform - Mode 4 Streaming BFF Route
 * 
 * Mode 4: Auto Autonomous (Background Dashboard)
 * System automatically selects expert team via Fusion Intelligence,
 * then executes the mission in the background with periodic updates.
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
      mission_id,
      goal,
      mode,
      options = {},
    } = body;

    // Validate required fields
    if (!goal?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Goal is required for Mode 4' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward to Python backend - Mode 4 auto-autonomous execution
    const backendResponse = await fetch(`${AI_ENGINE_URL}/api/v1/expert/background`, {
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
        mission_id: mission_id || crypto.randomUUID(),
        goal,
        mode: mode || 'mode4_auto_autonomous',
        tenant_id: tenantId,
        user_id: session.user.id,
        options: {
          // Fusion Intelligence for automatic team selection
          fusion_enabled: options.fusion_enabled ?? true,
          fusion_weights: options.fusion_weights || {
            vector: 0.4,
            graph: 0.35,
            relational: 0.25,
          },
          // RAG and search options
          enable_rag: options.enable_rag ?? true,
          enable_websearch: options.enable_websearch ?? true,
          enable_all_tools: options.enable_all_tools ?? true,
          // Execution constraints
          max_duration: options.max_duration || 3600, // 1 hour default
          budget_limit: options.budget_limit,
          max_iterations: options.max_iterations || 50,
          // HITL configuration for Mode 4
          hitl_enabled: true, // Always enabled for pre-flight
          hitl_checkpoints: [
            'pre_flight_validation',
            'critical_decision',
            'budget_exceeded',
            'final_review',
          ],
          hitl_timeout_seconds: options.hitl_timeout_seconds || 600, // 10 minutes default
          hitl_auto_action: options.hitl_auto_action || 'reject', // Auto-reject on timeout
          // Background execution options
          enable_sub_agents: true,
          enable_react_loop: true,
          enable_artifact_generation: true,
          enable_notifications: options.notify_on_complete ?? true,
          enable_checkpoint_notifications: options.notify_on_checkpoint ?? true,
          // Mode 4 specific
          execution_mode: 'background',
          priority: options.priority || 'normal',
          // Automatic team assembly
          min_team_size: 2,
          max_team_size: 5,
          require_l2_lead: true, // L2 expert must lead Mode 4 missions
        },
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[Mode4 Stream] Backend error:', backendResponse.status, errorText);
      
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
    console.error('[Mode4 Stream] Error:', error);
    
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
