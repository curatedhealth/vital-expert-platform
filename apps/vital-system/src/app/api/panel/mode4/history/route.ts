/**
 * VITAL Platform - Panel Mission History BFF Route
 *
 * GET /api/panel/mode4/history - List user's panel missions
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const panel_type = searchParams.get('panel_type');
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    // Build query string
    const queryParams = new URLSearchParams();
    if (status) queryParams.set('status', status);
    if (panel_type) queryParams.set('panel_type', panel_type);
    queryParams.set('limit', limit);
    queryParams.set('offset', offset);

    const response = await fetch(
      `${AI_ENGINE_URL}/ask-panel/missions?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'x-tenant-id': tenantId,
          'x-user-id': session.user.id,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to get mission history' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Panel History] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
