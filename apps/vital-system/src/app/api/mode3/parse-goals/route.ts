import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

/**
 * Mode 3 HITL Checkpoint 1 Preparation: Parse Goals
 * Proxies to Python backend /api/mode3/parse-goals
 *
 * Uses LLM to parse user prompt into structured mission goals
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';
    const userId = request.headers.get('x-user-id') || 'anonymous';

    console.log('[mode3/parse-goals] Proxying to backend:', {
      prompt: body.prompt?.substring(0, 50) + '...',
      agentId: body.agent_id,
    });

    const response = await fetch(`${AI_ENGINE_URL}/api/mode3/parse-goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-user-id': userId,
      },
      body: JSON.stringify({
        prompt: body.prompt,
        agent_id: body.agent_id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[mode3/parse-goals] Backend error:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[mode3/parse-goals] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
