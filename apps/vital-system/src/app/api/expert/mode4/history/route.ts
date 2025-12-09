/**
 * VITAL Platform - Mode 4 History Route
 * 
 * Gets the history of Mode 4 background missions for the current user.
 * 
 * Phase 4: Integration & Streaming
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';
    const status = searchParams.get('status'); // Filter by status

    // Build query string
    const queryParams = new URLSearchParams({
      limit,
      offset,
      mode: 'mode4_auto_autonomous',
    });
    if (status) {
      queryParams.append('status', status);
    }

    // Forward to backend
    const backendResponse = await fetch(
      `${AI_ENGINE_URL}/api/v1/expert/missions?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'X-Tenant-ID': tenantId,
          'X-User-ID': session.user.id,
        },
      }
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.text();
      console.error('[Mode4 History] Backend error:', backendResponse.status, error);
      return NextResponse.json(
        { error: error || 'Failed to get mission history' },
        { status: backendResponse.status }
      );
    }

    const history = await backendResponse.json();
    return NextResponse.json(history);

  } catch (error) {
    console.error('[Mode4 History] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
