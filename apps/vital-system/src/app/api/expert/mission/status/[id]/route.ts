/**
 * VITAL Platform - Shared Mission Status Route
 * 
 * Shared route for getting mission status (Mode 3 & Mode 4)
 * GET /api/expert/mission/status/[id]
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: missionId } = await params;
    const mode = request.nextUrl.searchParams.get('mode') || 'mode3_manual_autonomous';

    if (!missionId) {
      return NextResponse.json(
        { error: 'mission_id is required' },
        { status: 400 }
      );
    }

    // Determine backend endpoint based on mode
    const modePrefix = mode === 'mode4_auto_autonomous' ? 'mode4' : 'mode3';
    
    const response = await fetch(`${AI_ENGINE_URL}/api/v1/expert/${modePrefix}/status/${missionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': request.headers.get('x-tenant-id') || '',
        'x-user-id': request.headers.get('x-user-id') || '',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to get mission status: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Mission status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
