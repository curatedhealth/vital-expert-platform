/**
 * LangGraph GUI - Regular Workflow Execution API
 * POST /api/langgraph-gui/execute
 * 
 * Executes regular (non-panel) workflows with enabled agents.
 * This endpoint is used by the legacy WorkflowBuilder for orchestrator-based workflows.
 */

import { NextRequest, NextResponse } from 'next/server';

// Python AI Engine URL (from environment or default)
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

interface RegularExecuteRequest {
  query: string;
  openai_api_key: string;
  pinecone_api_key?: string;
  provider?: 'openai' | 'ollama';
  ollama_base_url?: string;
  ollama_model?: string;
  orchestrator_system_prompt?: string;
  enabled_agents: string[]; // Array of task IDs to enable
}

export async function POST(request: NextRequest) {
  try {
    const body: RegularExecuteRequest = await request.json();

    // Validate required fields
    if (!body.query || !body.enabled_agents || body.enabled_agents.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: query and enabled_agents are required' },
        { status: 400 }
      );
    }

    console.log(`🚀 [LangGraph GUI] Executing regular workflow:`, {
      enabled_agents: body.enabled_agents,
      agent_count: body.enabled_agents.length,
      provider: body.provider || 'openai',
    });

    // Forward request to Python AI Engine
    const response = await fetch(`${AI_ENGINE_URL}/langgraph-gui/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: body.query,
        openai_api_key: body.openai_api_key,
        pinecone_api_key: body.pinecone_api_key || '',
        provider: body.provider || 'openai',
        ollama_base_url: body.ollama_base_url || 'http://localhost:11434',
        ollama_model: body.ollama_model || 'qwen3:4b',
        orchestrator_system_prompt: body.orchestrator_system_prompt || 'You are an intelligent orchestrator coordinating multiple specialized agents.',
        enabled_agents: body.enabled_agents,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [LangGraph GUI] Python backend error:`, errorText);
      
      return NextResponse.json(
        {
          error: `Python AI Engine error: ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    // Check if response is streaming (Server-Sent Events)
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/event-stream') || contentType.includes('application/x-ndjson')) {
      // Stream the response back to the client
      return new Response(response.body, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle regular JSON response
    const result = await response.json();
    console.log(`✅ [LangGraph GUI] Regular workflow execution complete`);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ [LangGraph GUI] Regular execution error:', error);
    
    return NextResponse.json(
      {
        error: 'Regular workflow execution failed',
        message: error.message || 'Unknown error',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}


