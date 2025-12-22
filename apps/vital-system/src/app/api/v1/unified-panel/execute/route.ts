import { NextRequest, NextResponse } from 'next/server';

/**
 * Unified Panel Execute API
 *
 * POST /api/v1/unified-panel/execute
 *
 * Executes a panel consultation synchronously and returns the complete result.
 */

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[Unified Panel Execute] Request:', {
      panel_type: body.panel_type,
      question_length: body.question?.length,
      agent_count: body.agents?.length,
    });

    // Proxy to backend execute endpoint
    const response = await fetch(`${AI_ENGINE_URL}/api/v1/unified-panel/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': request.headers.get('x-tenant-id') || body.tenant_id || 'default',
      },
      body: JSON.stringify({
        question: body.question,
        panel_type: body.panel_type,
        agents: body.agents,
        context: body.context,
        tenant_id: body.tenant_id || 'default',
        user_id: body.user_id,
        save_to_db: body.save_to_db ?? false,
        generate_matrix: body.generate_matrix ?? true,
        runner_config: body.runner_config,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('[Unified Panel Execute] Backend error:', errorData);
      return NextResponse.json(
        { error: 'Panel execution failed', details: errorData.detail || errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('[Unified Panel Execute] Success:', {
      panel_id: data.panel_id,
      status: data.status,
      consensus_score: data.consensus?.consensus_score,
      execution_time_ms: data.execution_time_ms,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Unified Panel Execute] Error:', error);
    return NextResponse.json(
      { error: 'Failed to execute panel', message: String(error) },
      { status: 500 }
    );
  }
}
