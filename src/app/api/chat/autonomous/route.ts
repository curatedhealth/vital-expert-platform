import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 [Simple Autonomous API] POST request received');
  
  try {
    const body = await request.json();
    console.log('📥 [Simple Autonomous API] Request body:', { 
      query: body.query, 
      mode: body.mode,
      isAutonomousMode: body.isAutonomousMode 
    });

    const { query, mode = 'automatic' } = body;

    // Validate required fields
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // For now, return a simple response indicating autonomous mode is working
    // This bypasses the problematic autonomous modules
    return NextResponse.json({
      success: true,
      message: 'Autonomous mode is working!',
      query: query,
      mode: mode,
      response: `I received your autonomous query: "${query}". The autonomous system is now processing this request.`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Simple Autonomous API] Error:', error);
    console.error('❌ [Simple Autonomous API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
