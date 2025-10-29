import { NextRequest, NextResponse } from 'next/server';

import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

/**
 * POST /api/panel/approvals/[threadId]
 * Submit approval or rejection for an interrupted workflow
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const body = await request.json();
    const { approved, feedback } = body;

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'Field "approved" must be a boolean value',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const { threadId } = await params;

    await langGraphOrchestrator.updateState({
      threadId,
      updates: {
        humanApproval: approved,
        humanFeedback: feedback || null,
        interruptReason: null,
        interruptData: null
      }
    });

    let result;
    try {
      result = await langGraphOrchestrator.resumeSession(threadId);
    } catch (resumeError: any) {
      console.warn('Resume failed after approval:', resumeError);
      result = {
        status: 'approved',
        message: 'Approval recorded, but workflow resume encountered an issue',
        error: resumeError.message
      };
    }

    return NextResponse.json({
      success: true,
      threadId,
      approved,
      feedback: feedback || null,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error(`Error processing approval for thread ${threadId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process approval',
        threadId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/panel/approvals/[threadId]
 * Get details of a specific pending approval
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
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const { threadId } = await params;
    console.error(`Error fetching approval details for thread ${threadId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch approval details',
        threadId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
