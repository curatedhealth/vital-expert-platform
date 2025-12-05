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

    // Extract enabled agents - prefer direct enabled_agents field, fallback to extracting from workflow nodes
    let enabled_agents: string[] = [];
    
    // If enabled_agents is provided directly, validate and filter to only UUIDs
    if (Array.isArray(body.enabled_agents) && body.enabled_agents.length > 0) {
      enabled_agents = body.enabled_agents.filter((id: string) => {
        if (!id || typeof id !== 'string') return false;
        const dashCount = (id.match(/-/g) || []).length;
        const isValid = id.length === 36 && dashCount === 4;
        if (!isValid) {
          console.warn(`[Next.js API] Filtering out non-UUID agent ID: ${id}`);
        }
        return isValid;
      });
      console.log(`[Next.js API] Filtered ${enabled_agents.length} valid UUIDs from provided enabled_agents (${body.enabled_agents.length} total)`);
    }
    
    // If no valid agents found, try extracting from workflow nodes
    if (enabled_agents.length === 0 && body.workflow?.nodes) {
      const workflowNodes = body.workflow.nodes;
      console.log(`[Next.js API] Attempting to extract agent IDs from ${workflowNodes.length} workflow nodes`);
      console.log(`[Next.js API] Sample node structure:`, JSON.stringify(workflowNodes[0], null, 2));
      
      workflowNodes.forEach((n: any) => {
        // Check for agent node types - be more permissive
        const nodeType = n.type === 'expertAgent' || 
                        n.data?.type === 'expertAgent' || 
                        n.type === 'agent' ||
                        n.data?.type === 'agent' ||
                        n.data?.task?.id === 'expert_agent' ||
                        n.config?.task?.id === 'expert_agent' ||
                        (n.id && n.id.startsWith('expert-')) ||
                        (n.label && n.label.toLowerCase().includes('expert'));
        
        if (nodeType) {
          // Check multiple locations for agent ID (in order of preference)
          // Also check nested structures more thoroughly
          const agentId = n.data?.config?.agentId || 
                         n.config?.agentId ||
                         n.data?.config?.expertConfig?.id ||
                         n.config?.expertConfig?.id ||
                         n.data?.agentId || 
                         n.data?.agent_id ||
                         n.agentId ||
                         n.data?.expertConfig?.id;
          
          console.log(`[Next.js API] Node ${n.id} (type: ${n.type}, label: ${n.label}): agentId = ${agentId}`);
          console.log(`[Next.js API] Node data structure:`, {
            hasData: !!n.data,
            hasConfig: !!n.config,
            dataKeys: n.data ? Object.keys(n.data) : [],
            configKeys: n.config ? Object.keys(n.config) : [],
          });
          
          // Only add if it's a valid UUID (36 chars with 4 dashes)
          if (agentId && typeof agentId === 'string') {
            const dashCount = (agentId.match(/-/g) || []).length;
            if (agentId.length === 36 && dashCount === 4 && !enabled_agents.includes(agentId)) {
              enabled_agents.push(agentId);
              console.log(`[Next.js API] ✅ Found valid agent ID: ${agentId} in node ${n.id}`);
            } else {
              console.warn(`[Next.js API] ⚠️ Skipping invalid agent ID in node ${n.id}: ${agentId} (length: ${agentId.length}, dashes: ${dashCount})`);
            }
          } else if (!agentId) {
            console.warn(`[Next.js API] ⚠️ Node ${n.id} (${n.type}) is an agent node but has no agentId configured. Node structure:`, {
              id: n.id,
              type: n.type,
              label: n.label,
              hasData: !!n.data,
              hasConfig: !!n.config,
            });
          }
        }
      });
      console.log(`[Next.js API] Extracted ${enabled_agents.length} valid agent IDs from workflow nodes`);
    }

    // If still no valid agents found, return error with helpful guidance
    if (enabled_agents.length === 0) {
      console.error('[Next.js API] No valid agent UUIDs found. Cannot execute workflow without agents.');
      
      // Check if we have agent nodes but they're not configured
      const agentNodeCount = body.workflow?.nodes?.filter((n: any) => 
        n.type === 'agent' || n.data?.type === 'agent' || n.id?.startsWith('expert-')
      ).length || 0;
      
      const errorMessage = agentNodeCount > 0
        ? `Found ${agentNodeCount} agent node(s) in the workflow, but none have agent IDs configured. Please:\n1. Open the workflow designer\n2. Click on each agent node (expert-1, expert-2, etc.)\n3. In the property panel, select a real agent from the dropdown\n4. Save the workflow\n5. Try testing again`
        : 'No agent nodes found in the workflow. Please add agent nodes to the workflow before testing.';
      
      return NextResponse.json(
        { 
          success: false,
          error: 'No valid agents configured',
          details: errorMessage,
          debug: {
            provided_enabled_agents_count: body.enabled_agents?.length || 0,
            provided_enabled_agents_sample: body.enabled_agents?.slice(0, 5) || [],
            workflow_nodes_count: body.workflow?.nodes?.length || 0,
            agent_nodes_found: agentNodeCount,
            workflow_has_nodes: !!body.workflow?.nodes,
          }
        },
        { status: 400 }
      );
    }

    // Build request for backend
    const backendPayload = {
      query: body.workflow?.description || body.query || 'Execute workflow',
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
