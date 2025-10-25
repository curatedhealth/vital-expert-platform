import { NextRequest, NextResponse } from 'next/server';

import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

/**
 * GET /api/panel/approvals
 * List all pending approvals (interrupted sessions requiring human input)
 */
export async function GET(request: NextRequest) {
  try {
    // Get all sessions
    const sessions = await langGraphOrchestrator.listSessions();

    // Filter for interrupted sessions (pending approval)
    const pendingApprovals = sessions.filter(session => {
      // Check if session is waiting for human approval
      return (
        session.humanGateRequired ||
        session.interruptReason !== null ||
        (session.humanApproval === null && session.interruptReason !== null)
      );
    });

    return NextResponse.json({
      success: true,
      approvals: pendingApprovals,
      count: pendingApprovals.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch approvals',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
