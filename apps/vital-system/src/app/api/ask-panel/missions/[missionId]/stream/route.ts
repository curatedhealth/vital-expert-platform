/**
 * Ask Panel Mission Stream Proxy
 *
 * Proxies SSE stream from Python backend to frontend.
 * This allows the frontend to connect to mission streams
 * created by the AI Wizard or Autonomous Panel.
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ missionId: string }> }
) {
  const { missionId } = await params;

  if (!missionId) {
    return NextResponse.json(
      { error: 'Mission ID is required' },
      { status: 400 }
    );
  }

  try {
    // Forward request to Python backend
    const backendUrl = `${AI_ENGINE_URL}/ask-panel/missions/${missionId}/stream`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Stream Proxy] Backend error:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // Check if the response is a stream
    if (!response.body) {
      return NextResponse.json(
        { error: 'No response body from backend' },
        { status: 500 }
      );
    }

    // Create a TransformStream to pass through the SSE events
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body.getReader();

    // Pipe the stream in the background
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            await writer.close();
            break;
          }
          await writer.write(value);
        }
      } catch (error) {
        console.error('[Stream Proxy] Stream error:', error);
        try {
          await writer.abort(error);
        } catch {
          // Ignore abort errors
        }
      }
    })();

    // Return the readable side as the response
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('[Stream Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend stream', details: String(error) },
      { status: 500 }
    );
  }
}

// Disable static generation for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
