/**
 * VITAL Platform - Shared Mission Checkpoint Route
 * 
 * Shared route for HITL checkpoint handling (Mode 3 & Mode 4)
 * POST /api/expert/mission/checkpoint/[id]
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: checkpointId } = await params;
    const body = await request.json();
    const { action, option, reason, mission_id, mode } = body;

    if (!checkpointId) {
      return NextResponse.json(
        { error: 'checkpoint_id is required' },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Determine backend endpoint based on mode
    const modePrefix = mode === 'mode4_auto_autonomous' ? 'mode4' : 'mode3';
    
    const response = await fetch(`${AI_ENGINE_URL}/api/v1/expert/${modePrefix}/checkpoint/${checkpointId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': request.headers.get('x-tenant-id') || '',
        'x-user-id': request.headers.get('x-user-id') || '',
      },
      body: JSON.stringify({
        action,
        option,
        reason,
        mission_id,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to process checkpoint: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Checkpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
