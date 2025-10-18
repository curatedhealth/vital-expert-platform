import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = body.session_id || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🚀 [Backend API] Starting autonomous session:', sessionId);
    
    return NextResponse.json({
      session_id: sessionId,
      status: 'started',
      message: 'Autonomous session started successfully',
      backend: 'vercel-mock-langgraph'
    });
  } catch (error) {
    console.error('❌ [Backend API] Error starting autonomous session:', error);
    return NextResponse.json(
      { error: 'Failed to start autonomous session' },
      { status: 500 }
    );
  }
}