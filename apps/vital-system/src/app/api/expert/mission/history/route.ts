/**
 * VITAL Platform - Shared Mission History Route
 * 
 * Shared route for getting mission history (Mode 3 & Mode 4)
 * GET /api/expert/mission/history
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get('mode') || 'mode3_manual_autonomous';
    const limit = request.nextUrl.searchParams.get('limit') || '20';
    const offset = request.nextUrl.searchParams.get('offset') || '0';
    const status = request.nextUrl.searchParams.get('status');

    // Determine backend endpoint based on mode
    const modePrefix = mode === 'mode4_auto_autonomous' ? 'mode4' : 'mode3';
    
    const queryParams = new URLSearchParams({
      limit,
      offset,
      ...(status && { status }),
    });
    
    const response = await fetch(
      `${AI_ENGINE_URL}/api/v1/expert/${modePrefix}/history?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': request.headers.get('x-tenant-id') || '',
          'x-user-id': request.headers.get('x-user-id') || '',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to get mission history: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Mission history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
