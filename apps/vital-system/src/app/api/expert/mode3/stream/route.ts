/**
 * VITAL Platform - Mode 3 Streaming BFF Route
 * 
 * Mode 3: Manual Autonomous (Deep Research)
 * User selects expert, system executes autonomously with HITL checkpoints.
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
      expert_id,
      goal,
      mode,
      options = {},
    } = body;

    // Validate required fields
    if (!goal?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Goal is required for Mode 3' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!expert_id) {
      return new Response(
        JSON.stringify({ error: 'Expert ID is required for Mode 3' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward to Python backend - Mode 3 autonomous execution
    const backendResponse = await fetch(`${AI_ENGINE_URL}/api/v1/expert/autonomous`, {
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
        expert_id,
        goal,
        mode: mode || 'mode3_manual_autonomous',
        tenant_id: tenantId,
        user_id: session.user.id,
        options: {
          enable_rag: options.enable_rag ?? true,
          enable_websearch: options.enable_websearch ?? true,
          max_iterations: options.max_iterations || 10,
          confidence_threshold: options.confidence_threshold || 0.8,
          // HITL configuration
          hitl_enabled: options.hitl_enabled ?? true,
          hitl_checkpoints: [
            'plan_approval',
            'tool_approval',
            'sub_agent_approval',
            'critical_decision',
            'final_review',
          ],
          hitl_timeout_seconds: options.hitl_timeout_seconds || 300, // 5 minutes default
          // Autonomous execution options
          enable_sub_agents: true,
          enable_react_loop: true,
          enable_artifact_generation: true,
        },
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[Mode3 Stream] Backend error:', backendResponse.status, errorText);
      
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
    console.error('[Mode3 Stream] Error:', error);
    
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
