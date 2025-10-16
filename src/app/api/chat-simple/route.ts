import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Simple Chat API: Starting request processing');
    
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const { message, userId, sessionId } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    console.log('✅ Simple Chat API: Request validated successfully');
    
    // Return a simple streaming response
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        // Send initial response
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'message',
          content: `Hello! I received your message: "${message}"`
        })}\n\n`));
        
        // Send completion
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('❌ Simple Chat API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
