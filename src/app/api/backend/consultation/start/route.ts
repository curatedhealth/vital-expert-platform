import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = body.session_id || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return NextResponse.json({
      session_id: sessionId,
      status: 'started',
      message: 'Interactive consultation session started successfully',
      backend: 'vercel-mock-langgraph'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start consultation session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
