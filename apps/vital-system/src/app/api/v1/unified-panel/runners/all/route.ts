import { NextRequest, NextResponse } from 'next/server';

/**
 * Unified Panel All Runners API
 *
 * GET /api/v1/unified-panel/runners/all
 *
 * Returns all 215+ available runners from the unified registry.
 * Supports filtering by category and runner_type.
 */

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const runner_type = searchParams.get('runner_type');

    // Build query string
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (runner_type) params.append('runner_type', runner_type);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    // Proxy to backend runners/all endpoint
    const response = await fetch(`${AI_ENGINE_URL}/api/v1/unified-panel/runners/all${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': request.headers.get('x-tenant-id') || 'default',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Unified Panel All Runners API] Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch runners', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Unified Panel All Runners API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to AI Engine', message: String(error) },
      { status: 503 }
    );
  }
}
