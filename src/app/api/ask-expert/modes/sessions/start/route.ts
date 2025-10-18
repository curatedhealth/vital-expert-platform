import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, interaction_mode, agent_mode, selected_agent_id, context } = body;

    console.log('🚀 Starting session:', { user_id, interaction_mode, agent_mode, selected_agent_id });

    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Return session details
    return NextResponse.json({
      session_id: sessionId,
      interaction_mode: interaction_mode || 'interactive',
      agent_mode: agent_mode || 'automatic',
      selected_agent: selected_agent_id ? { id: selected_agent_id } : null,
      created_at: new Date().toISOString(),
      status: 'active'
    });

  } catch (error) {
    console.error('❌ Start session error:', error);
    return NextResponse.json(
      { error: 'Failed to start session: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
