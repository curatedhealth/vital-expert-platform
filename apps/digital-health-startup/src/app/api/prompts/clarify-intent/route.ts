import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Intent Clarification (Proxy to Python Backend)
 * 
 * Proxies requests to the Python AI engine for intent clarification
 */

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward request to Python backend
    const response = await fetch(`${AI_ENGINE_URL}/api/prompts/clarify-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to clarify intent' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to AI engine:', error);
    return NextResponse.json(
      {
        error: 'Failed to connect to AI engine',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
