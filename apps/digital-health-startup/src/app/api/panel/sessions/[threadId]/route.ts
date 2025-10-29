import { NextRequest, NextResponse } from 'next/server';

import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

/**
 * GET /api/panel/sessions/[threadId] - Get session history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const history = await langGraphOrchestrator.getSessionHistory(threadId);

    return NextResponse.json({
      success: true,
      threadId,
      history,
      checkpointCount: history.length
    });
  } catch (error: any) {
    console.error('Error getting session history:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get session history'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/panel/sessions/[threadId] - Delete a session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    await langGraphOrchestrator.deleteSession(threadId);

    return NextResponse.json({
      success: true,
      message: `Session ${threadId} deleted`
    });
  } catch (error: any) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete session'
      },
      { status: 500 }
    );
  }
}
