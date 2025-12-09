/**
 * VITAL Platform - Mode 4 Checkpoint Route
 * 
 * Handles HITL checkpoint interactions for Mode 4 background missions:
 * - Approve/reject checkpoints
 * - Modify parameters
 * - Get checkpoint status
 * 
 * Phase 4: Integration & Streaming
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Respond to a checkpoint (approve/reject/modify)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: checkpointId } = await params;
    
    // Authenticate
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant
    const tenantId = request.headers.get('x-tenant-id') || session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const {
      action, // 'approve' | 'reject' | 'modify'
      option, // Selected option if approve
      reason, // Reason if reject
      modifications, // Modifications if modify
      mission_id,
    } = body;

    // Validate action
    if (!['approve', 'reject', 'modify'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Forward to backend HITL API
    const backendResponse = await fetch(
      `${AI_ENGINE_URL}/api/v1/hitl/checkpoint/${checkpointId}/respond`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
          'X-Tenant-ID': tenantId,
          'X-User-ID': session.user.id,
        },
        body: JSON.stringify({
          action,
          option,
          reason,
          modifications,
          mission_id,
          user_id: session.user.id,
          timestamp: new Date().toISOString(),
          // Mode 4 specific metadata
          mode: 'mode4_auto_autonomous',
          source: 'background_dashboard',
        }),
      }
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      return NextResponse.json(error, { status: backendResponse.status });
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('[Mode4 Checkpoint] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get checkpoint status
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: checkpointId } = await params;
    
    // Authenticate
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant
    const tenantId = request.headers.get('x-tenant-id') || session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    // Forward to backend HITL API
    const backendResponse = await fetch(
      `${AI_ENGINE_URL}/api/v1/hitl/checkpoint/${checkpointId}`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'X-Tenant-ID': tenantId,
        },
      }
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      return NextResponse.json(error, { status: backendResponse.status });
    }

    const checkpoint = await backendResponse.json();
    return NextResponse.json(checkpoint);

  } catch (error) {
    console.error('[Mode4 Checkpoint GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
