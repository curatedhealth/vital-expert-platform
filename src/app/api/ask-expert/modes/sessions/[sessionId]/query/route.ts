import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await request.json();
    const { query, stream } = body;

    console.log('💬 Processing query:', { sessionId, query: query?.substring(0, 100) + '...' });

    if (stream) {
      // Return streaming response
      const stream = new ReadableStream({
        start(controller) {
          const data = JSON.stringify({
            type: 'content',
            content: `Processing query: ${query}`,
            sessionId: sessionId
          });
          controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
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
    } else {
      // Return regular response
      return NextResponse.json({
        session_id: sessionId,
        response: `Processed query: ${query}`,
        status: 'completed'
      });
    }

  } catch (error) {
    console.error('❌ Process query error:', error);
    return NextResponse.json(
      { error: 'Failed to process query: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
