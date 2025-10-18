import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await request.json();
    const { interaction_mode, agent_mode, selected_agent_id, preserve_context } = body;

    console.log('🔄 Switching mode:', { sessionId, interaction_mode, agent_mode, selected_agent_id });

    // Return mode switch confirmation
    return NextResponse.json({
      session_id: sessionId,
      new_interaction_mode: interaction_mode || 'interactive',
      new_agent_mode: agent_mode || 'automatic',
      selected_agent: selected_agent_id ? { id: selected_agent_id } : null,
      switched_at: new Date().toISOString(),
      status: 'success'
    });

  } catch (error) {
    console.error('❌ Switch mode error:', error);
    return NextResponse.json(
      { error: 'Failed to switch mode: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
