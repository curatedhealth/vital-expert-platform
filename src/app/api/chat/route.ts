import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Simple demo response
    const demoResponse = `Thank you for your message: "${message}". This is a demo response from the VITAL Expert platform. The full chat functionality is being updated and will be available soon.`;

    // Create a simple streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the response word by word
          const words = demoResponse.split(' ');
          let currentText = '';
          
          for (let i = 0; i < words.length; i++) {
            currentText += (i > 0 ? ' ' : '') + words[i];
            
            const data = JSON.stringify({
              type: 'content',
              content: (i > 0 ? ' ' : '') + words[i],
              fullContent: currentText,
            });
            
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          // Send final metadata
          const finalData = JSON.stringify({
            type: 'metadata',
            metadata: {
              citations: [],
              followupQuestions: [
                'Can you provide more specific guidance?',
                'What would be the next steps?',
                'Are there any important considerations I should know about?',
              ],
              sources: [],
              processingTime: 1000,
              tokenUsage: {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
              },
            },
          });
          
          controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
          controller.close();
          
        } catch (error) {
          console.error('❌ Streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Failed to generate response',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      { status: 500 }
    );
  }
}