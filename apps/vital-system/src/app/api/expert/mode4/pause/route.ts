/**
 * VITAL Platform - Mode 4 Pause Route
 * 
 * Pauses a running Mode 4 background mission.
 * 
 * Phase 4: Integration & Streaming
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
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
    const { mission_id } = body;

    if (!mission_id) {
      return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
    }

    // Forward to backend
    const backendResponse = await fetch(
      `${AI_ENGINE_URL}/api/v1/expert/mission/${mission_id}/pause`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
          'X-Tenant-ID': tenantId,
          'X-User-ID': session.user.id,
        },
        body: JSON.stringify({
          user_id: session.user.id,
          timestamp: new Date().toISOString(),
        }),
      }
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.text();
      console.error('[Mode4 Pause] Backend error:', backendResponse.status, error);
      return NextResponse.json(
        { error: error || 'Failed to pause mission' },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('[Mode4 Pause] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
