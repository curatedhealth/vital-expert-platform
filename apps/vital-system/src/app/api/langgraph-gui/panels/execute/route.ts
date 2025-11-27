/**
 * LangGraph GUI - Panel Workflow Execution API
 * POST /api/langgraph-gui/panels/execute
 *
 * Handles panel workflow execution from WorkflowTestModal
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[Next.js API] /api/langgraph-gui/panels/execute - Request received');
    console.log('[Next.js API] Body keys:', Object.keys(body));
    console.log('[Next.js API] Panel type:', body.panel_type);

    // Forward the complete request to backend
    const backendPayload = {
      query: body.query,
      workflow: body.workflow,
      panel_type: body.panel_type,
      openai_api_key: body.openai_api_key,
      pinecone_api_key: body.pinecone_api_key,
      provider: body.provider || 'openai',
      ollama_base_url: body.ollama_base_url,
      ollama_model: body.ollama_model,
      user_id: body.user_id,
    };

    console.log('[Next.js API] Forwarding to:', `${AI_ENGINE_URL}/frameworks/panels/execute-simple`);
    console.log('[Next.js API] Workflow nodes:', body.workflow?.nodes?.length);

    const response = await fetch(`${AI_ENGINE_URL}/frameworks/panels/execute-simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
      signal: AbortSignal.timeout(30000),
    });

    console.log('[Next.js API] Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Next.js API] Backend error:', errorText);
      return NextResponse.json(
        { error: 'Panel execution failed', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('[Next.js API] Success:', result.success);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[Next.js API] Error:', error.message);

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout', details: 'Backend did not respond in time' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Panel execution failed', details: error.message },
      { status: 500 }
    );
  }
}
