import { NextRequest, NextResponse } from 'next/server';
import { streamingProxy } from '@/lib/services/streaming-proxy';
import { backendConnection } from '@/lib/services/backend-connection';

export async function POST(request: NextRequest) {
  console.log('🚀 [Autonomous API] POST request received - Connecting to real LangGraph backend');
  
  try {
    const body = await request.json();
    console.log('📥 [Autonomous API] Request body:', { 
      query: body.query, 
      mode: body.mode,
      isAutonomousMode: body.isAutonomousMode,
      agent: body.agent
    });

    const { query, mode = 'automatic', agent = null, sessionId } = body;

    // Validate required fields
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Check if backend is available
    console.log('🔍 [Autonomous API] Checking backend health...');
    const isBackendHealthy = await backendConnection.checkHealth(request);
    console.log('🔍 [Autonomous API] Backend health result:', isBackendHealthy);
    
    if (!isBackendHealthy) {
      console.warn('⚠️ [Autonomous API] Backend not available, falling back to error response');
      return NextResponse.json(
        { error: 'Backend service unavailable. Please ensure the Python LangGraph backend is running.' },
        { status: 503 }
      );
    }

    console.log('✅ [Autonomous API] Backend is healthy, starting real LangGraph stream...');

    // Connect to real LangGraph backend
    const stream = await streamingProxy.streamAutonomousReasoning(query, agent, {
      onReasoningStep: (step) => {
        console.log('🧠 [Autonomous API] Real reasoning step:', step);
      },
      onPhaseChange: (phase, metadata) => {
        console.log('🔄 [Autonomous API] Real phase change:', phase, metadata);
      },
      onExecutionComplete: (result) => {
        console.log('✅ [Autonomous API] Real execution complete:', result);
      },
      onError: (error) => {
        console.error('❌ [Autonomous API] Real stream error:', error);
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
    console.error('❌ [Autonomous API] Error:', error);
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