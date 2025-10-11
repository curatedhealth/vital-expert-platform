import { NextRequest, NextResponse } from 'next/server';
import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

/**
 * GET /api/panel/sessions - List all persisted sessions
 */
export async function GET(request: NextRequest) {
  try {
    const sessions = await langGraphOrchestrator.listSessions();

    return NextResponse.json({
      success: true,
      sessions,
      count: sessions.length
    });
  } catch (error: any) {
    console.error('Error listing sessions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to list sessions'
      },
      { status: 500 }
    );
  }
}
