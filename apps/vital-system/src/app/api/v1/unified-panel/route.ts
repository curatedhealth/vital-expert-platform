import { NextRequest, NextResponse } from 'next/server';

/**
 * Unified Panel API Proxy
 *
 * Proxies requests to the AI Engine backend's unified panel endpoints.
 *
 * Endpoints:
 * - GET /api/v1/unified-panel - Health check & panel types
 * - POST /api/v1/unified-panel/execute - Synchronous panel execution
 * - POST /api/v1/unified-panel/stream - Streaming panel execution (SSE)
 */

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Proxy to backend health/types endpoint
    const response = await fetch(`${AI_ENGINE_URL}/api/v1/unified-panel/types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': request.headers.get('x-tenant-id') || 'default',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Unified Panel API] Backend error:', errorText);
      return NextResponse.json(
        { error: 'Backend service unavailable', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Unified Panel API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to AI Engine', message: String(error) },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Proxy to backend execute endpoint
    const response = await fetch(`${AI_ENGINE_URL}/api/v1/unified-panel/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': request.headers.get('x-tenant-id') || body.tenant_id || 'default',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Unified Panel API] Backend error:', errorData);
      return NextResponse.json(
        { error: 'Panel execution failed', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Unified Panel API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to execute panel', message: String(error) },
      { status: 500 }
    );
  }
}
