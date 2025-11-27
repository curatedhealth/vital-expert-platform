/**
 * LangGraph GUI - Panel Workflow Execution API
 * POST /api/langgraph-gui/panels/execute
 * 
 * Executes panel workflows with full LangGraph backend integration.
 * This endpoint is used by both legacy WorkflowBuilder and modern WorkflowDesignerEnhanced.
 */

import { NextRequest, NextResponse } from 'next/server';

// Python AI Engine URL (from environment or default)
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

interface PanelWorkflowNode {
  id: string;
  type: string;
  taskId?: string;
  label?: string;
  position: { x: number; y: number };
  data?: any;
  expertConfig?: any;
  parameters?: any;
}

interface PanelWorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
}

interface PanelWorkflowDefinition {
  nodes: PanelWorkflowNode[];
  edges: PanelWorkflowEdge[];
  metadata?: any;
}

interface PanelExecuteRequest {
  query: string;
  openai_api_key: string;
  pinecone_api_key?: string;
  provider?: 'openai' | 'ollama';
  ollama_base_url?: string;
  ollama_model?: string;
  workflow: PanelWorkflowDefinition;
  panel_type: string; // 'mode1', 'structured', 'open', 'expert', 'socratic', 'devils_advocate', 'structured_ask_expert', etc.
  user_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PanelExecuteRequest = await request.json();

    // Validate required fields
    if (!body.query || !body.workflow) {
      return NextResponse.json(
        { error: 'Missing required fields: query and workflow are required' },
        { status: 400 }
      );
    }

    console.log(`🚀 [LangGraph GUI] Executing panel workflow:`, {
      panel_type: body.panel_type,
      node_count: body.workflow.nodes?.length || 0,
      edge_count: body.workflow.edges?.length || 0,
      provider: body.provider || 'openai',
    });

    // Forward request to Python AI Engine
    const response = await fetch(`${AI_ENGINE_URL}/langgraph-gui/panels/execute`, {
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
        workflow: body.workflow,
        panel_type: body.panel_type,
        user_id: body.user_id || 'user',
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
    console.log(`✅ [LangGraph GUI] Panel workflow execution complete`);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ [LangGraph GUI] Panel execution error:', error);
    
    return NextResponse.json(
      {
        error: 'Panel workflow execution failed',
        message: error.message || 'Unknown error',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}



