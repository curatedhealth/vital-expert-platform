import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Connect to real Python LangGraph backend
    const pythonBackendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 'http://localhost:8002';
    
    const response = await fetch(`${pythonBackendUrl}/api/autonomous/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Python backend error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [Backend API] Autonomous execute error:', error);
    return NextResponse.json(
      { error: 'Failed to start autonomous session with real LangGraph backend' },
      { status: 500 }
    );
  }
}