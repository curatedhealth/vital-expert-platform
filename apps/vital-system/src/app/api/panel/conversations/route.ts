import { NextRequest, NextResponse } from 'next/server';

import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

export const runtime = 'nodejs';

/**
 * GET /api/panel/conversations
 * List all conversation sessions with their message history
 */
export async function GET(request: NextRequest) {
  try {
    const sessions = await langGraphOrchestrator.listSessions();

    // Filter sessions that have message history
    const conversations = sessions
      .filter((session: any) => session.messageHistory && session.messageHistory.length > 0)
      .map((session: any) => ({
        threadId: session.sessionId,
        mode: session.mode,
        lastMessage: session.messageHistory[session.messageHistory.length - 1],
        messageCount: session.messageHistory.length,
        createdAt: session.messageHistory[0]?.timestamp,
        updatedAt: session.messageHistory[session.messageHistory.length - 1]?.timestamp
      }));

    return NextResponse.json({
      success: true,
      conversations,
      count: conversations.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error fetching conversations:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch conversations'
      },
      { status: 500 }
    );
  }
}
