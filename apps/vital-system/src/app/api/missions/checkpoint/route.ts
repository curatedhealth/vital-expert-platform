/**
 * Checkpoint Response API Proxy
 *
 * Forwards checkpoint approve/reject responses to the Python backend.
 * Backend expects: mission_id, checkpoint_id, action (approve/reject/modify)
 */

import { NextRequest, NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = process.env.PYTHON_AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward to Python backend
    const backendResponse = await fetch(`${PYTHON_BACKEND_URL}/api/missions/checkpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('[CheckpointProxy] Backend error:', errorText);
      return NextResponse.json(
        { error: errorText },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[CheckpointProxy] Error forwarding checkpoint response:', error);
    return NextResponse.json(
      { error: 'Failed to forward checkpoint response' },
      { status: 500 }
    );
  }
}
