import { NextRequest, NextResponse } from 'next/server';

import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

/**
 * POST /api/panel/sessions/[threadId]/resume - Resume a paused session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const threadId = params.threadId;
    const body = await request.json();
    const { additionalInput } = body;

    const result = await langGraphOrchestrator.resumeSession(threadId, additionalInput);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error resuming session:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to resume session'
      },
      { status: 500 }
    );
  }
}
