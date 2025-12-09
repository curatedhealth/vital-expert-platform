/**
 * VITAL Platform - HITL Checkpoint API Route
 * 
 * Handles Human-in-the-Loop checkpoint interactions for Mode 3/4.
 * 
 * Endpoints:
 * - POST: Respond to checkpoint (approve/reject/modify)
 * - GET: Get checkpoint status
 * 
 * Phase 4: Integration & Streaming
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST - Respond to checkpoint (approve/reject/modify)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    const { id: checkpointId } = await params;
    const body = await request.json();

    const {
      action,        // 'approve' | 'reject' | 'modify'
      option,        // Selected option if approve
      reason,        // Reason if reject
      modifications, // Modifications if modify
      feedback,      // Optional user feedback
      mission_id,    // Associated mission ID
    } = body;

    // Validate action
    if (!['approve', 'reject', 'modify'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve, reject, or modify' },
        { status: 400 }
      );
    }

    // Forward to Python backend
    const response = await fetch(
      `${AI_ENGINE_URL}/api/v1/hitl/checkpoint/${checkpointId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
          'X-Tenant-ID': tenantId,
          'X-User-ID': session.user.id,
          'X-Request-ID': crypto.randomUUID(),
        },
        body: JSON.stringify({
          action,
          option,
          reason,
          modifications,
          feedback,
          mission_id,
          user_id: session.user.id,
          timestamp: new Date().toISOString(),
          // Audit information
          audit: {
            user_email: session.user.email,
            user_name: session.user.name,
            action_source: 'web_ui',
            client_timestamp: new Date().toISOString(),
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Checkpoint POST] Backend error:', response.status, errorData);
      return NextResponse.json(
        errorData.error ? errorData : { error: 'Failed to process checkpoint response' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Checkpoint POST] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get checkpoint status
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    const { id: checkpointId } = await params;

    // Fetch checkpoint from Python backend
    const response = await fetch(
      `${AI_ENGINE_URL}/api/v1/hitl/checkpoint/${checkpointId}`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'X-Tenant-ID': tenantId,
          'X-User-ID': session.user.id,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Checkpoint GET] Backend error:', response.status, errorData);
      return NextResponse.json(
        errorData.error ? errorData : { error: 'Failed to fetch checkpoint' },
        { status: response.status }
      );
    }

    const checkpoint = await response.json();
    return NextResponse.json(checkpoint);
  } catch (error) {
    console.error('[Checkpoint GET] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Cancel/timeout checkpoint
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    const { id: checkpointId } = await params;

    // Cancel checkpoint in Python backend
    const response = await fetch(
      `${AI_ENGINE_URL}/api/v1/hitl/checkpoint/${checkpointId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'X-Tenant-ID': tenantId,
          'X-User-ID': session.user.id,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Checkpoint DELETE] Backend error:', response.status, errorData);
      return NextResponse.json(
        errorData.error ? errorData : { error: 'Failed to cancel checkpoint' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Checkpoint cancelled' });
  } catch (error) {
    console.error('[Checkpoint DELETE] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
