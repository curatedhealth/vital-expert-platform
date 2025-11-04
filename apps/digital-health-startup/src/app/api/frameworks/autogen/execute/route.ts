/**
 * AutoGen Framework Execution API
 * 
 * Proxy endpoint that routes AutoGen execution requests to Python AI Engine
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(`🟣 [AutoGen API] Forwarding request to Python AI Engine`);

    // Forward to Python AI Engine
    const response = await fetch(`${AI_ENGINE_URL}/frameworks/autogen/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ [AutoGen API] Python AI Engine error: ${error}`);
      throw new Error(`AutoGen execution failed: ${error}`);
    }

    const result = await response.json();
    console.log(`✅ [AutoGen API] Execution complete`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ [AutoGen API] Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

