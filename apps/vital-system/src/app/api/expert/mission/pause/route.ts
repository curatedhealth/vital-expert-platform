/**
 * VITAL Platform - Shared Mission Pause Route
 * 
 * Shared route for pausing missions (Mode 3 & Mode 4)
 * POST /api/expert/mission/pause
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mission_id, mode } = body;

    if (!mission_id) {
      return NextResponse.json(
        { error: 'mission_id is required' },
        { status: 400 }
      );
    }

    // Determine backend endpoint based on mode
    const modePrefix = mode === 'mode4_auto_autonomous' ? 'mode4' : 'mode3';
    
    const response = await fetch(`${AI_ENGINE_URL}/api/v1/expert/${modePrefix}/pause`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': request.headers.get('x-tenant-id') || '',
        'x-user-id': request.headers.get('x-user-id') || '',
      },
      body: JSON.stringify({ mission_id }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to pause mission: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Mission pause error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
