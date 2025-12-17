/**
 * VITAL Platform - Panel Mission Resume BFF Route
 *
 * POST /api/panel/mode4/resume - Resume a paused panel mission
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    const body = await request.json();
    const { mission_id } = body;

    if (!mission_id) {
      return NextResponse.json(
        { error: 'mission_id is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${AI_ENGINE_URL}/ask-panel/missions/${mission_id}/resume`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'x-tenant-id': tenantId,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to resume mission' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Panel Resume] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
