/**
 * VITAL Platform - Panel Checkpoint Resolution BFF Route
 *
 * POST /api/panel/mode4/checkpoint/[id] - Resolve a HITL checkpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = request.headers.get('x-tenant-id') || session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    const checkpointId = params.id;
    const body = await request.json();
    const { mission_id, action, feedback, modifications } = body;

    if (!mission_id) {
      return NextResponse.json(
        { error: 'mission_id is required' },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'reject', 'modify'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action (approve, reject, modify) is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${AI_ENGINE_URL}/ask-panel/missions/${mission_id}/checkpoints/${checkpointId}/resolve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          action,
          feedback: feedback || null,
          modifications: modifications || {},
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to resolve checkpoint' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Panel Checkpoint] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
