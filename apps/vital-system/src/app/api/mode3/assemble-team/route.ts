import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

/**
 * Mode 3 HITL Checkpoint 3 Preparation: Assemble Team
 * Proxies to Python backend /api/mode3/assemble-team
 *
 * Uses LLM to determine team composition and deliverables
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';
    const userId = request.headers.get('x-user-id') || 'anonymous';

    console.log('[mode3/assemble-team] Proxying to backend:', {
      planPhasesCount: body.plan?.length,
      agentId: body.agent_id,
    });

    const response = await fetch(`${AI_ENGINE_URL}/api/mode3/assemble-team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-user-id': userId,
      },
      body: JSON.stringify({
        plan: body.plan,
        agent_id: body.agent_id,
        goals: body.goals,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[mode3/assemble-team] Backend error:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[mode3/assemble-team] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
