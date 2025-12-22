import { NextRequest, NextResponse } from 'next/server';

/**
 * Unified Panel Runners API
 *
 * GET /api/v1/unified-panel/runners
 *
 * Returns all panel types with their runner configurations.
 */

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Proxy to backend runners endpoint
    const response = await fetch(`${AI_ENGINE_URL}/api/v1/unified-panel/runners`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': request.headers.get('x-tenant-id') || 'default',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Unified Panel Runners API] Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch runners', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Unified Panel Runners API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to AI Engine', message: String(error) },
      { status: 503 }
    );
  }
}
