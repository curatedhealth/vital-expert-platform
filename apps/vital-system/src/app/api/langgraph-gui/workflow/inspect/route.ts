/**
 * Workflow Inspection API
 * 
 * Inspects a workflow definition and returns metadata from the Python backend,
 * including which LangGraph mode it corresponds to and its capabilities.
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

interface WorkflowNode {
  id: string;
  type: string;
  data: any;
  position: { x: number; y: number };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

interface WorkflowInspectionRequest {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface ModeMetadata {
  mode_id: string;
  name: string;
  description: string;
  requires_agent_selection: boolean;
  supports_hitl: boolean;
  selection: 'manual' | 'automatic';
  interaction: 'interactive' | 'autonomous';
  capabilities: string[];
}

interface WorkflowInspectionResponse {
  detected_mode: string | null;
  mode_metadata: ModeMetadata | null;
  confidence: number;
  reasoning: string;
  workflow_type: 'ask_expert' | 'ask_panel' | 'custom';
}

export async function POST(request: NextRequest) {
  try {
    const body: WorkflowInspectionRequest = await request.json();
    const { nodes, edges } = body;

    // Call Python backend to inspect workflow
    const response = await fetch(`${AI_ENGINE_URL}/api/v1/langgraph/inspect-workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nodes,
        edges,
      }),
    });

    if (!response.ok) {
      // Fallback: Client-side heuristic detection
      const fallbackResult = detectModeClientSide(nodes, edges);
      return NextResponse.json(fallbackResult, { status: 200 });
    }

    const data: WorkflowInspectionResponse = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[Workflow Inspection] Error:', error);
    
    // Fallback to client-side detection on error
    const body: WorkflowInspectionRequest = await request.json();
    const fallbackResult = detectModeClientSide(body.nodes, body.edges);
    return NextResponse.json(fallbackResult, { status: 200 });
  }
}

/**
 * Client-side fallback: Heuristic mode detection
 * This is a temporary fallback until the backend endpoint is implemented
 */
function detectModeClientSide(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowInspectionResponse {
  // First, check if nodes have metadata that explicitly states the mode
  const nodeWithMetadata = nodes.find(n => n.data?.config?.mode || n.data?.metadata?.mode);
  if (nodeWithMetadata) {
    const explicitMode = nodeWithMetadata.data?.config?.mode || nodeWithMetadata.data?.metadata?.mode;
    console.log('[Workflow Inspection] Found explicit mode in node metadata:', explicitMode);
  }
  
  // Check for workflow-level metadata in any node's data
  let workflowMetadata: any = null;
  for (const node of nodes) {
    if (node.data?.workflowMetadata || node.data?.workflow_metadata) {
      workflowMetadata = node.data.workflowMetadata || node.data.workflow_metadata;
      break;
    }
  }
  
  // If we have workflow metadata with explicit mode, use it
  if (workflowMetadata?.mode) {
    const mode = workflowMetadata.mode;
    console.log('[Workflow Inspection] Found explicit mode in workflow metadata:', mode);
    
    if (mode === 'mode1' || mode === 'mode_1' || mode.includes('manual') && mode.includes('interactive')) {
      return {
        detected_mode: 'mode1',
        mode_metadata: {
          mode_id: 'mode1',
          name: 'Manual-Interactive',
          description: 'User selects expert for focused chat',
          requires_agent_selection: true,
          supports_hitl: false,
          selection: 'manual',
          interaction: 'interactive',
          capabilities: workflowMetadata.features || ['chat', 'single_agent', 'rag', 'tools'],
        },
        confidence: 0.95,
        reasoning: 'Explicit mode1 metadata found in workflow definition',
        workflow_type: 'ask_expert',
      };
    }
    
    if (mode === 'mode2' || mode === 'mode_2') {
      return {
        detected_mode: 'mode2',
        mode_metadata: {
          mode_id: 'mode2',
          name: 'Auto-Interactive',
          description: 'AI picks best expert(s) for chat',
          requires_agent_selection: false,
          supports_hitl: false,
          selection: 'automatic',
          interaction: 'interactive',
          capabilities: workflowMetadata.features || ['chat', 'multi_agent', 'auto_selection', 'rag', 'tools'],
        },
        confidence: 0.95,
        reasoning: 'Explicit mode2 metadata found in workflow definition',
        workflow_type: 'ask_expert',
      };
    }
  }
  
  // Check for mode in node labels or descriptions
  const mode1Keywords = ['mode 1', 'mode1', 'manual-interactive', 'manual interactive'];
  const mode2Keywords = ['mode 2', 'mode2', 'auto-interactive', 'automatic interactive'];
  
  const hasMode1Keyword = nodes.some(n => {
    const label = (n.data?.label || '').toLowerCase();
    const desc = (n.data?.description || '').toLowerCase();
    return mode1Keywords.some(kw => label.includes(kw) || desc.includes(kw));
  });
  
  const hasMode2Keyword = nodes.some(n => {
    const label = (n.data?.label || '').toLowerCase();
    const desc = (n.data?.description || '').toLowerCase();
    return mode2Keywords.some(kw => label.includes(kw) || desc.includes(kw));
  });
  
  if (hasMode1Keyword) {
    return {
      detected_mode: 'mode1',
      mode_metadata: {
        mode_id: 'mode1',
        name: 'Manual-Interactive',
        description: 'User selects expert for focused chat',
        requires_agent_selection: true,
        supports_hitl: false,
        selection: 'manual',
        interaction: 'interactive',
        capabilities: ['chat', 'single_agent', 'rag', 'tools', 'feedback', 'memory'],
      },
      confidence: 0.85,
      reasoning: 'Mode 1 keywords found in node labels/descriptions',
      workflow_type: 'ask_expert',
    };
  }
  
  if (hasMode2Keyword) {
    return {
      detected_mode: 'mode2',
      mode_metadata: {
        mode_id: 'mode2',
        name: 'Auto-Interactive',
        description: 'AI picks best expert(s) for chat',
        requires_agent_selection: false,
        supports_hitl: false,
        selection: 'automatic',
        interaction: 'interactive',
        capabilities: ['chat', 'multi_agent', 'auto_selection', 'rag', 'tools'],
      },
      confidence: 0.85,
      reasoning: 'Mode 2 keywords found in node labels/descriptions',
      workflow_type: 'ask_expert',
    };
  }
  
  // Fallback: Structural analysis
  const agentNodes = nodes.filter(n => n.data?.type === 'agent');
  const hasOrchestrator = nodes.some(n => n.data?.type === 'orchestrator');
  const hasManualSelection = nodes.some(n => 
    n.data?.config?.selection === 'manual' || 
    n.data?.config?.requires_user_input === true
  );
  
  // Complex flow with manual selection = Mode 1
  if (hasManualSelection) {
    return {
      detected_mode: 'mode1',
      mode_metadata: {
        mode_id: 'mode1',
        name: 'Manual-Interactive',
        description: 'User selects expert for focused chat',
        requires_agent_selection: true,
        supports_hitl: false,
        selection: 'manual',
        interaction: 'interactive',
        capabilities: ['chat', 'single_agent', 'rag', 'tools'],
      },
      confidence: 0.75,
      reasoning: 'Manual agent selection detected in workflow config',
      workflow_type: 'ask_expert',
    };
  }

  // Complex flow with orchestrator = Mode 2
  if (hasOrchestrator && agentNodes.length > 1) {
    return {
      detected_mode: 'mode2',
      mode_metadata: {
        mode_id: 'mode2',
        name: 'Auto-Interactive',
        description: 'AI picks best expert(s) for chat',
        requires_agent_selection: false,
        supports_hitl: false,
        selection: 'automatic',
        interaction: 'interactive',
        capabilities: ['chat', 'multi_agent', 'auto_selection', 'rag', 'tools'],
      },
      confidence: 0.7,
      reasoning: 'Multi-agent flow with orchestrator detected',
      workflow_type: 'ask_expert',
    };
  }

  // Default: custom workflow
  return {
    detected_mode: null,
    mode_metadata: null,
    confidence: 0.5,
    reasoning: 'Custom workflow - unable to match known patterns',
    workflow_type: 'custom',
  };
}

