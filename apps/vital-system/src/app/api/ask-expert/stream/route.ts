/**
 * API Route: /api/ask-expert/stream
 *
 * Proxies streaming requests to Python AI Engine, avoiding CORS issues.
 * Maintains SSE format for token-by-token streaming.
 *
 * Supports:
 * - Mode 1: Manual-Interactive (user selects agent, multi-turn chat) - SSE passthrough
 * - Mode 3: Manual-Autonomous (user selects agent, goal-driven with HITL) - JSON→SSE conversion
 */

import { NextRequest } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// Mode-specific endpoint mapping
const MODE_ENDPOINTS: Record<string, string> = {
  '1': '/api/mode1/interactive-manual',
  '3': '/api/mode3/autonomous-manual',
};

// Helper to encode SSE event
function encodeSSE(event: string, data: object): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(`data: ${JSON.stringify({ event, ...data })}\n\n`);
}

// Convert Mode 3 JSON response to SSE stream with full autonomous workflow events
// Aligned with frontend event handlers in ask-expert/page.tsx
async function* convertMode3ToSSE(jsonResponse: any): AsyncGenerator<Uint8Array> {
  const autonomousReasoning = jsonResponse.autonomous_reasoning || {};
  const agentSelection = jsonResponse.agent_selection || {};
  const reasoningSteps = jsonResponse.reasoning || autonomousReasoning.reasoning_steps || [];
  const strategy = autonomousReasoning.strategy || 'react';

  // 1. Emit initial thinking step to show workflow has started
  yield encodeSSE('thinking', {
    step: 'workflow_init',
    status: 'running',
    content: `Mode 3 Autonomous Workflow - ${strategy.toUpperCase()} strategy`,
  });
  await new Promise(resolve => setTimeout(resolve, 50));

  // 2. Emit planning phase as thinking step
  const planStepName = strategy === 'react' ? 'react_reasoning' :
                       strategy === 'tree_of_thoughts' ? 'tree_of_thoughts' : 'planning';
  yield encodeSSE('thinking', {
    step: planStepName,
    status: 'running',
    content: `Initiating ${strategy === 'react' ? 'ReAct' : strategy === 'tree_of_thoughts' ? 'Tree-of-Thoughts' : 'Planning'} reasoning...`,
  });
  await new Promise(resolve => setTimeout(resolve, 100));

  // 3. Emit reasoning steps with progress - aligned with frontend step_progress handler
  const totalSteps = Array.isArray(reasoningSteps) ? reasoningSteps.length : 0;

  // Emit strategy/pattern info up front
  yield encodeSSE('pattern', {
    strategy,
    hitl_required: autonomousReasoning.hitl_required ?? false,
    confidence_threshold: autonomousReasoning.confidence_threshold ?? undefined,
    iterations: autonomousReasoning.iterations ?? undefined,
  });

  // Emit plan if present
  if (autonomousReasoning.plan) {
    yield encodeSSE('plan', {
      plan: autonomousReasoning.plan,
      plan_confidence: autonomousReasoning.plan_confidence,
    });
  }

  if (totalSteps > 0) {
    for (let i = 0; i < reasoningSteps.length; i++) {
      const stepData = reasoningSteps[i];
      const stepContent = typeof stepData === 'string'
        ? stepData
        : (stepData.content || stepData.thought || stepData.reasoning || JSON.stringify(stepData));
      const stepType = typeof stepData === 'object'
        ? (stepData.type || stepData.step_type || 'reasoning')
        : 'reasoning';
      const stepName = `${stepType}_step_${i + 1}`;

      // Emit step_progress with 'step' field as expected by frontend
      yield encodeSSE('step_progress', {
        step: stepName,
        step_number: i + 1,
        total_steps: totalSteps,
        percentage: Math.round(((i + 1) / totalSteps) * 100),
      });
      await new Promise(resolve => setTimeout(resolve, 30));

      // Emit thinking with 'step' and 'status' as expected by frontend
      yield encodeSSE('thinking', {
        step: stepName,
        status: 'running',
        content: stepContent,
      });
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  } else {
    // If no explicit reasoning steps, emit a default processing step
    yield encodeSSE('thinking', {
      step: 'processing',
      status: 'running',
      content: 'Processing request autonomously...',
    });
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // 4. Emit tools_used as thinking step
  const toolsUsed = autonomousReasoning.tools_used || [];
  if (toolsUsed.length > 0) {
    for (const tool of toolsUsed) {
      const toolName = typeof tool === 'string' ? tool : (tool.name || tool.tool_name || 'tool');
      yield encodeSSE('thinking', {
        step: `tool_${toolName}`,
        status: 'running',
        content: `Executing tool: ${toolName}`,
      });
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  // 5. Emit RAG/sources as thinking step
  const sources = jsonResponse.sources || jsonResponse.rag_sources || [];
  if (sources.length > 0) {
    yield encodeSSE('thinking', {
      step: 'rag_retrieval',
      status: 'running',
      content: `Retrieved ${sources.length} relevant sources`,
    });
    await new Promise(resolve => setTimeout(resolve, 30));
  }

  // 6. Mark planning as complete
  yield encodeSSE('thinking', {
    step: 'synthesis',
    status: 'running',
    content: 'Synthesizing response...',
  });
  await new Promise(resolve => setTimeout(resolve, 50));

  // 7. Stream content token by token for natural display
  const content = jsonResponse.content || jsonResponse.response || jsonResponse.message || '';
  if (content) {
    // Split into words and stream them for natural appearance
    const words = content.split(/(\s+)/);
    let buffer = '';
    const CHUNK_SIZE = 5; // Stream 5 words at a time

    for (let i = 0; i < words.length; i++) {
      buffer += words[i];

      // Emit every CHUNK_SIZE words or at the end
      if ((i + 1) % CHUNK_SIZE === 0 || i === words.length - 1) {
        yield encodeSSE('token', { content: buffer });
        buffer = '';
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    }
  }

  // 8. Emit HITL request if present (for approval workflow) - aligned with frontend hitl_request handler
  if (jsonResponse.hitl_pending || jsonResponse.hitl_request || autonomousReasoning.hitl_required) {
    yield encodeSSE('hitl_request', {
      checkpoint_id: jsonResponse.checkpoint_id || `checkpoint-${Date.now()}`,
      checkpoint_type: jsonResponse.hitl_checkpoint_type || 'final_review',
      title: jsonResponse.hitl_title || 'Review Required',
      description: jsonResponse.hitl_description || 'Please review the autonomous response before sending',
      options: jsonResponse.hitl_options || [
        { label: 'Approve', value: 'approve' },
        { label: 'Modify', value: 'modify' },
        { label: 'Reject', value: 'reject' },
      ],
      status: 'pending',
      risk_level: jsonResponse.risk_level || 'medium',
    });
  }

  // Emit iteration summary if present
  if (typeof autonomousReasoning.iterations === 'number') {
    yield encodeSSE('iteration_summary', {
      iterations: autonomousReasoning.iterations,
      react_iterations: autonomousReasoning.react_iterations,
      converged: autonomousReasoning.react_converged,
    });
  }

  // 9. Extract HITL checkpoints and autonomy metadata from response
  const hitlCheckpoints = jsonResponse.hitl_checkpoints || {};
  const autonomyMetadata = jsonResponse.autonomy_metadata || {};

  // 10. Emit done event with full metadata (AutoGPT-like data)
  yield encodeSSE('done', {
    response: content, // Frontend checks data.response first
    content: content,
    sources: sources,
    confidence: jsonResponse.confidence || 0.9,
    session_id: jsonResponse.session_id,
    agent_id: jsonResponse.agent_id,
    // Full autonomous reasoning from backend
    autonomous_reasoning: {
      strategy: autonomousReasoning.strategy || 'react',
      reasoning_steps: autonomousReasoning.reasoning_steps || [],
      plan: autonomousReasoning.plan || {},
      plan_confidence: autonomousReasoning.plan_confidence || 0,
      tier: autonomousReasoning.tier || 2,
      tier_reasoning: autonomousReasoning.tier_reasoning || '',
      iterations: autonomousReasoning.iterations || 0,
      tools_used: toolsUsed,
      hitl_required: autonomousReasoning.hitl_required || false,
      confidence_threshold: autonomousReasoning.confidence_threshold || 0.95,
      // ReAct data
      react_iterations: autonomousReasoning.react_iterations || 0,
      react_converged: autonomousReasoning.react_converged || false,
      observations: autonomousReasoning.observations || [],
      // Tree-of-Thoughts data
      thought_tree: autonomousReasoning.thought_tree || [],
      selected_strategy: autonomousReasoning.selected_strategy || {},
      alternative_strategies: autonomousReasoning.alternative_strategies || [],
      // Self-reflection data
      self_reflections: autonomousReasoning.self_reflections || [],
      corrections_applied: autonomousReasoning.corrections_applied || [],
    },
    // HITL checkpoint status (5 checkpoints per PRD)
    hitl_checkpoints: {
      plan_approved: hitlCheckpoints.plan_approved,
      tool_approved: hitlCheckpoints.tool_approved,
      subagent_approved: hitlCheckpoints.subagent_approved,
      decision_approved: hitlCheckpoints.decision_approved,
      final_approved: hitlCheckpoints.final_approved,
      approval_timeout: hitlCheckpoints.approval_timeout || false,
      rejection_reason: hitlCheckpoints.rejection_reason,
    },
    // Autonomy metadata (goal tracking, task tree)
    autonomy_metadata: {
      autonomy_level: autonomyMetadata.autonomy_level || 'B',
      decomposition_type: autonomyMetadata.decomposition_type || 'fallback',
      task_tree: autonomyMetadata.task_tree || [],
      completed_tasks: autonomyMetadata.completed_tasks || [],
      pending_tasks: autonomyMetadata.pending_tasks || [],
      goal_achieved: autonomyMetadata.goal_achieved || false,
      loop_status: autonomyMetadata.loop_status || 'complete',
      confidence_calibrated: autonomyMetadata.confidence_calibrated || false,
      active_l3_agents: autonomyMetadata.active_l3_agents || 0,
      active_l4_agents: autonomyMetadata.active_l4_agents || 0,
    },
    agent_selection: agentSelection,
    metadata: {
      model: jsonResponse.model || jsonResponse.metadata?.model,
      tokens_used: jsonResponse.tokens_used || jsonResponse.metadata?.tokens_used,
      processing_time_ms: jsonResponse.processing_time_ms || jsonResponse.metadata?.latency_ms,
      sources_count: sources.length,
      citations_count: (jsonResponse.citations || []).length,
      langgraph_execution: jsonResponse.metadata?.langgraph_execution || true,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';

    // Determine which mode to use (default to Mode 1)
    const mode = body.mode || '1';
    let endpoint = MODE_ENDPOINTS[mode] || MODE_ENDPOINTS['1'];

    // If JTBD deep research is requested, route to the dedicated endpoint
    if (mode === '3' && body.jtbd === 'deep_research') {
      endpoint = '/api/mode3/deep-research';
    }

    console.log('[ask-expert/stream] Proxying to AI Engine:', {
      url: `${AI_ENGINE_URL}${endpoint}`,
      mode,
      agent_id: body.agent_id,
      session_id: body.session_id,
      tenant_id: tenantId,
      selected_rag_domains: body.selected_rag_domains,
      requested_tools: body.requested_tools,
    });

    // Build request body based on mode
    // Backend requires: agent_id, message, tenant_id, user_id (all required)
    const userId = body.user_id || request.headers.get('x-user-id') || 'anonymous';

    const requestBody: Record<string, unknown> = {
      agent_id: body.agent_id,
      message: body.message,
      session_id: body.session_id,
      tenant_id: tenantId,  // Required by backend
      user_id: userId,      // Required by backend
    };

    // Mode 3 specific parameters
    if (mode === '3') {
      requestBody.hitl_enabled = body.hitl_enabled ?? true;
      requestBody.hitl_safety_level = body.hitl_safety_level || 'balanced';
      requestBody.enable_rag = body.enable_rag ?? true;
      if (Array.isArray(body.selected_rag_domains)) {
        requestBody.selected_rag_domains = body.selected_rag_domains;
      }
      if (Array.isArray(body.requested_tools)) {
        requestBody.requested_tools = body.requested_tools;
      }
    }

    // Forward request to Python backend
    const response = await fetch(`${AI_ENGINE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ask-expert/stream] Backend error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Backend error: ${response.status}`, details: errorText }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // MODE 3: JSON response needs conversion to SSE
    if (mode === '3') {
      console.log('[ask-expert/stream] Mode 3: Converting JSON response to SSE');

      const jsonResponse = await response.json();
      console.log('[ask-expert/stream] Mode 3 response received:', {
        hasContent: !!jsonResponse.content,
        contentLength: jsonResponse.content?.length || 0,
        hasReasoning: !!jsonResponse.reasoning_steps || !!jsonResponse.reasoning,
        hasSources: !!(jsonResponse.sources || jsonResponse.rag_sources),
      });

      // Create SSE stream from JSON
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of convertMode3ToSSE(jsonResponse)) {
              controller.enqueue(chunk);
            }
            controller.close();
          } catch (error) {
            console.error('[ask-expert/stream] Mode 3 stream error:', error);
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    // MODE 1 and others: Passthrough SSE stream from backend
    const reader = response.body?.getReader();
    if (!reader) {
      return new Response(
        JSON.stringify({ error: 'No response body from backend' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a ReadableStream that forwards the SSE data
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('[ask-expert/stream] Stream error:', error);
          controller.error(error);
        }
      },
      cancel() {
        reader.cancel();
      },
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    console.error('[ask-expert/stream] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
