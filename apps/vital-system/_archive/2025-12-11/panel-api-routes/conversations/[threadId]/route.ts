import { NextRequest, NextResponse } from 'next/server';

import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

export const runtime = 'nodejs';

/**
 * GET /api/panel/conversations/[threadId]
 * Get full message history for a specific conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;

    if (!threadId) {
      return NextResponse.json(
        { success: false, error: 'Missing threadId parameter' },
        { status: 400 }
      );
    }

    // Get session info
    const session = await (langGraphOrchestrator as any).getSessionInfo(threadId);

    if (!session) {
      return NextResponse.json(
        { success: false, error: `No conversation found with threadId: ${threadId}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation: {
        threadId: session.sessionId,
        mode: session.mode,
        messageHistory: session.messageHistory || [],
        metadata: {
          round: session.round,
          converged: session.converged,
          humanGateRequired: session.humanGateRequired,
          createdAt: session.messageHistory?.[0]?.timestamp,
          updatedAt: session.messageHistory?.[session.messageHistory.length - 1]?.timestamp
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    const { threadId } = await params;
    console.error(`❌ Error fetching conversation ${threadId}:`, error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch conversation'
      },
      { status: 500 }
    );
  }
}
