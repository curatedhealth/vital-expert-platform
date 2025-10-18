import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    console.log('📋 Getting session:', sessionId);

    // Return mock session details
    return NextResponse.json({
      session_id: sessionId,
      user_id: 'current_user',
      interaction_mode: 'interactive',
      agent_mode: 'automatic',
      selected_agent: null,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      total_cost: 0.0,
      mode_history: []
    });

  } catch (error) {
    console.error('❌ Get session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    console.log('🗑️ Ending session:', sessionId);

    // Return session end confirmation
    return NextResponse.json({
      session_id: sessionId,
      status: 'ended',
      final_cost: 0.0,
      duration: 0
    });

  } catch (error) {
    console.error('❌ End session error:', error);
    return NextResponse.json(
      { error: 'Failed to end session: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
