/**
 * VITAL Platform - Mode 4 Status Route
 * 
 * Gets the current status of a Mode 4 background mission.
 * Used for polling updates when SSE connection is not active.
 * 
 * Phase 4: Integration & Streaming
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: missionId } = await params;
    
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

    // Forward to backend
    const backendResponse = await fetch(
      `${AI_ENGINE_URL}/api/v1/expert/mission/${missionId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'X-Tenant-ID': tenantId,
        },
      }
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.text();
      console.error('[Mode4 Status] Backend error:', backendResponse.status, error);
      return NextResponse.json(
        { error: error || 'Failed to get mission status' },
        { status: backendResponse.status }
      );
    }

    const status = await backendResponse.json();
    return NextResponse.json(status);

  } catch (error) {
    console.error('[Mode4 Status] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
