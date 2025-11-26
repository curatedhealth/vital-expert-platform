/**
 * LangGraph GUI - Regular Workflow Execution API
 * POST /api/langgraph-gui/execute
 *
 * Handles workflow execution from WorkflowTestModal
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[Next.js API] /api/langgraph-gui/execute - Request received');
    console.log('[Next.js API] Body keys:', Object.keys(body));

    // Extract enabled agents from workflow nodes
    const workflowNodes = body.workflow?.nodes || [];
    const enabled_agents = workflowNodes
      .filter((n: any) => n.type === 'expertAgent' || n.data?.type === 'expertAgent')
      .map((n: any) => n.data?.agentId || n.data?.agent_id || n.id);

    console.log('[Next.js API] Extracted enabled_agents:', enabled_agents);

    // Build request for backend
    const backendPayload = {
      query: body.workflow?.description || 'Execute workflow',
      enabled_agents: enabled_agents,
      openai_api_key: body.openai_api_key,
      pinecone_api_key: body.pinecone_api_key,
      provider: body.provider || 'openai',
      ollama_base_url: body.ollama_base_url,
      ollama_model: body.ollama_model,
    };

    console.log('[Next.js API] Forwarding to:', `${AI_ENGINE_URL}/frameworks/langgraph/execute-simple`);
    console.log('[Next.js API] Payload:', JSON.stringify(backendPayload, null, 2));

    const response = await fetch(`${AI_ENGINE_URL}/frameworks/langgraph/execute-simple`, {
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
        { error: 'Backend execution failed', details: errorText },
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
      { error: 'Execution failed', details: error.message },
      { status: 500 }
    );
  }
}
