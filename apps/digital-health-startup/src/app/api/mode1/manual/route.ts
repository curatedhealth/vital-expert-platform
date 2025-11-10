/**
 * Mode 1: Manual Interactive - Proxy to AI Engine
 *
 * This route proxies SSE requests from the frontend to the AI Engine backend
 * to avoid CORS issues when connecting from the browser.
 */

import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const aiEngineUrl = process.env.PYTHON_AI_ENGINE_URL || 'http://localhost:8080';
  const targetUrl = `${aiEngineUrl}/api/mode1/manual`;

  try {
    // Get the request body
    const body = await request.json();

    // Forward the request to the AI Engine
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(body),
    });

    // Return the streaming response
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[Mode1 Proxy] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to connect to AI Engine',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
