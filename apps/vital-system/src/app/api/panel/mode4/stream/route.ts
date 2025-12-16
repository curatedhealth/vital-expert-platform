/**
 * VITAL Platform - Panel Mode 4 Streaming BFF Route
 *
 * Mode 4: Autonomous Panel Discussion
 * Multi-expert parallel execution with consensus building,
 * iterative refinement loops, and HITL checkpoints.
 *
 * Panel Types:
 * - structured: Formal structured analysis
 * - open: Free-form discussion
 * - socratic: Question-based exploration
 * - adversarial: Devil's advocate approach
 * - delphi: Anonymous expert consensus
 * - hybrid: Combined approach with HITL
 *
 * Backend Endpoint: /ask-panel/autonomous
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
      panel_type = 'structured',
      context,
      experts,
      options = {},
    } = body;

    // Validate required fields
    if (!goal?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Goal is required for Panel Mode 4' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate panel_type
    const validPanelTypes = ['structured', 'open', 'socratic', 'adversarial', 'delphi', 'hybrid'];
    if (!validPanelTypes.includes(panel_type)) {
      return new Response(
        JSON.stringify({ error: `Invalid panel_type. Must be one of: ${validPanelTypes.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward to Python backend - Panel Autonomous endpoint
    const backendResponse = await fetch(`${AI_ENGINE_URL}/ask-panel/autonomous`, {
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
        goal,
        panel_type,
        context: context || '',
        experts: experts || [], // Optional pre-selected experts
        max_rounds: options.max_rounds || 3,
        consensus_threshold: options.consensus_threshold || 0.7,
        budget_limit: options.budget_limit,
        auto_approve_checkpoints: options.auto_approve_checkpoints ?? false,
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[Panel Mode4 Stream] Mission creation error:', backendResponse.status, errorText);

      return new Response(
        `event: error\ndata: ${JSON.stringify({
          code: `BACKEND_${backendResponse.status}`,
          message: errorText || 'Failed to create panel mission',
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
          message: 'Panel mission created but no ID returned',
          recoverable: false,
        })}\n\n`,
        { status: 500, headers: { 'Content-Type': 'text/event-stream' } }
      );
    }

    // Step 2: Connect to mission stream
    const streamResponse = await fetch(
      `${AI_ENGINE_URL}/ask-panel/missions/${createdMissionId}/stream`,
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
      console.error('[Panel Mode4 Stream] Stream connection error:', streamResponse.status, errorText);

      return new Response(
        `event: error\ndata: ${JSON.stringify({
          code: `STREAM_${streamResponse.status}`,
          message: errorText || 'Failed to connect to panel mission stream',
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
        'X-Panel-Type': panel_type,
      },
    });
  } catch (error) {
    console.error('[Panel Mode4 Stream] Error:', error);

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
