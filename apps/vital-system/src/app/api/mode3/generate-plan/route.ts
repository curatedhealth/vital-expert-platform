import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

/**
 * Mode 3 HITL Checkpoint 2 Preparation: Generate Plan
 * Proxies to Python backend /api/mode3/generate-plan
 *
 * Uses LLM to generate execution plan from confirmed goals
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';
    const userId = request.headers.get('x-user-id') || 'anonymous';

    console.log('[mode3/generate-plan] Proxying to backend:', {
      goalsCount: body.goals?.length,
      agentId: body.agent_id,
    });

    const response = await fetch(`${AI_ENGINE_URL}/api/mode3/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-user-id': userId,
      },
      body: JSON.stringify({
        goals: body.goals,
        agent_id: body.agent_id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[mode3/generate-plan] Backend error:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[mode3/generate-plan] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
