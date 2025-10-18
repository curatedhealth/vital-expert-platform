import { NextRequest, NextResponse } from 'next/server';
import { streamingProxy } from '@/lib/services/streaming-proxy';

export async function POST(request: NextRequest) {
  console.log('🚀 [Chat API] POST request received - Connecting to real LangGraph backend');
  
  try {
    const body = await request.json();
    console.log('📥 [Chat API] Request body:', { 
      message: body.message,
      query: body.query,
      agent: body.agent,
      isAutonomousMode: body.isAutonomousMode
    });

    const { message, query, agent = null } = body;
    const userMessage = message || query;

    // Validate required fields
    if (!userMessage) {
      return NextResponse.json(
        { error: 'Message or query is required' },
        { status: 400 }
      );
    }

    // Check if backend is available
    const isBackendHealthy = await streamingProxy['backendConnection'].checkHealth();
    if (!isBackendHealthy) {
      console.warn('⚠️ [Chat API] Backend not available, falling back to error response');
      return NextResponse.json(
        { error: 'Backend service unavailable. Please ensure the Python LangGraph backend is running.' },
        { status: 503 }
      );
    }

    console.log('✅ [Chat API] Backend is healthy, starting real LangGraph stream...');

    // Connect to real LangGraph backend for interactive consultation
    const stream = await streamingProxy.streamInteractiveConsultation(userMessage, agent, {
      onReasoningStep: (step) => {
        console.log('🧠 [Chat API] Real reasoning step:', step);
      },
      onPhaseChange: (phase, metadata) => {
        console.log('🔄 [Chat API] Real phase change:', phase, metadata);
      },
      onExecutionComplete: (result) => {
        console.log('✅ [Chat API] Real execution complete:', result);
      },
      onError: (error) => {
        console.error('❌ [Chat API] Real stream error:', error);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Backend-Source': 'langgraph-python'
      },
    });

  } catch (error) {
    console.error('❌ [Chat API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect to LangGraph backend', 
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Please ensure the Python backend is running on the configured URL'
      },
      { status: 500 }
    );
  }
}