/**
 * VITAL Platform - Mode 3 Streaming BFF Route
 *
 * Mode 3: Manual Autonomous (Deep Research)
 * User MANUALLY selects expert → system executes autonomously with HITL checkpoints.
 *
 * ARCHITECTURE (Dec 2025):
 * - Mode 3 and Mode 4 use the SAME mission executor (master_graph.py)
 * - The only difference is agent selection:
 *   - Mode 3: agent_id is provided (manual selection)
 *   - Mode 4: agent_id is null (Fusion auto-selection)
 *
 * Backend Endpoint: /api/expert/autonomous (unified autonomous endpoint)
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
      template_id,
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
        JSON.stringify({ error: 'Expert ID is required for Mode 3 (manual selection)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward to Python backend - Unified Autonomous endpoint
    // Mode 3 = agent_id provided → backend uses manual selection
    const backendResponse = await fetch(`${AI_ENGINE_URL}/ask-expert/autonomous`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
        'x-tenant-id': tenantId,
        'x-request-id': mission_id || crypto.randomUUID(),
        'x-user-id': session.user.id,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        // Mode 3: agent_id is provided for manual selection
        agent_id: expert_id,
        goal,
        template_id: template_id || 'deep-research', // Default template
        inputs: options.inputs || {},
        budget_limit: options.budget_limit,
        timeout_minutes: options.timeout_minutes || 60,
        auto_approve_checkpoints: options.auto_approve_checkpoints ?? false,
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[Mode3 Stream] Mission creation error:', backendResponse.status, errorText);

      return new Response(
        `event: error\ndata: ${JSON.stringify({
          code: `BACKEND_${backendResponse.status}`,
          message: errorText || 'Failed to create mission',
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

    // Step 1 complete: Mission created, get mission_id
    const missionData = await backendResponse.json();
    const createdMissionId = missionData.id;

    if (!createdMissionId) {
      return new Response(
        `event: error\ndata: ${JSON.stringify({
          code: 'MISSION_CREATE_FAILED',
          message: 'Mission created but no ID returned',
          recoverable: false,
        })}\n\n`,
        { status: 500, headers: { 'Content-Type': 'text/event-stream' } }
      );
    }

    // Step 2: Connect to mission stream
    const streamResponse = await fetch(
      `${AI_ENGINE_URL}/ask-expert/missions/${createdMissionId}/stream`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'x-tenant-id': tenantId,
          'Accept': 'text/event-stream',
        },
      }
    );

    if (!streamResponse.ok) {
      const errorText = await streamResponse.text();
      console.error('[Mode3 Stream] Stream connection error:', streamResponse.status, errorText);

      return new Response(
        `event: error\ndata: ${JSON.stringify({
          code: `STREAM_${streamResponse.status}`,
          message: errorText || 'Failed to connect to mission stream',
          recoverable: true,
        })}\n\n`,
        {
          status: streamResponse.status,
          headers: { 'Content-Type': 'text/event-stream' },
        }
      );
    }

    // Stream mission events to client
    return new Response(streamResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'X-Mission-ID': createdMissionId,
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
