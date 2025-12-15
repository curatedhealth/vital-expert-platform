/**
 * Ask Panel Enhanced Streaming API Proxy
 *
 * Primary path: proxy SSE streaming requests to the Python AI Engine backend.
 * Fallback path: when the Python service is unavailable, stream responses
 * directly from OpenAI so the panel UI still exercises a real LLM.
 */

import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { createServerClient } from '@supabase/ssr';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PANEL_MODEL = process.env.OPENAI_PANEL_MODEL || 'gpt-4o-mini';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const openaiClient = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.question || !body.template_slug || !body.selected_agent_ids || !body.tenant_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: question, template_slug, selected_agent_ids, tenant_id' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Forward request to Python backend
    const backendUrl = `${AI_ENGINE_URL}/api/ask-panel-enhanced/stream`;
    console.log(`[Proxy] Forwarding streaming request to: ${backendUrl}`);

    // Get auth token from cookies or headers
    let authToken: string | null = null;
    
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
    } else {
      // Try to get from Supabase session cookie
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        try {
          const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            cookies: {
              get(name: string) {
                return request.cookies.get(name)?.value;
              },
              set() {
                // No-op for read-only access
              },
              remove() {
                // No-op for read-only access
              },
            },
          });
          const { data: { session } } = await supabase.auth.getSession();
          authToken = session?.access_token || null;
        } catch (error) {
          console.warn('[Proxy] Could not get session:', error);
        }
      }
    }

    // Forward authentication headers from the original request
    const tenantId = request.headers.get('x-tenant-id') || body.tenant_id;
    const userId = request.headers.get('x-user-id');

    const backendHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward auth token if present (from header or session)
    if (authHeader) {
      backendHeaders['Authorization'] = authHeader;
    } else if (authToken) {
      backendHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    // Forward tenant and user context headers
    if (tenantId) {
      backendHeaders['x-tenant-id'] = tenantId;
      backendHeaders['x-organization-id'] = tenantId; // Backend may use either
    }

    if (userId) {
      backendHeaders['x-user-id'] = userId;
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: backendHeaders,
      body: JSON.stringify(body),
    });

    // If backend is unavailable, fall back to a local LLM-backed stream so the UI
    // can still be tested without requiring the Python AI-engine to be healthy.
    if (!response.ok || !response.body) {
      const errorText = await response.text().catch(() => '');
      console.error(`[Proxy] Backend error: ${response.status} - ${errorText}`);

      // If OpenAI is not configured, fall back to a fixed mock message.
      if (!openaiClient) {
        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            const events = [
              {
                type: 'message',
                node: 'orchestrator_intro',
                data: {
                  id: 'fallback-intro',
                  type: 'orchestrator',
                  role: 'orchestrator',
                  content: `🎯 Expert panel consultation started.\n\n**Question:** ${body.question}\n\nOur experts will share a concise, high‑level view based on the latest internal knowledge configuration.`,
                  timestamp: new Date().toISOString(),
                  agent_id: null,
                  agent_name: 'Orchestrator',
                  metadata: { fallback: true },
                },
              },
              {
                type: 'message',
                node: 'initial_panel_responses',
                data: {
                  id: 'fallback-agent-1',
                  type: 'agent',
                  role: 'agent',
                  content:
                    'Based on our current configuration, there are no blocking issues detected, and the system is ready for multi‑expert panels once the full AI engine is connected. For now, you can safely use this view to validate panel templates, layout, and streaming behaviour.',
                  timestamp: new Date().toISOString(),
                  agent_id: 'fallback-agent-1',
                  agent_name: 'Mock Panel Expert',
                  metadata: { fallback: true },
                },
              },
              {
                type: 'complete',
                data: {
                  status: 'fallback',
                  message:
                    'Panel consultation completed in simplified mode. Connect the Python AI engine to enable full multi‑expert reasoning and RAG.',
                },
              },
            ];

            for (const event of events) {
              const chunk = `data: ${JSON.stringify(event)}\n\n`;
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          },
        });

        return new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
          },
        });
      }

      // OpenAI-backed streaming fallback
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            // Send an orchestrator intro message first
            const introEvent = {
              type: 'message',
              node: 'orchestrator_intro',
              data: {
                id: `llm-intro-${Date.now()}`,
                type: 'orchestrator',
                role: 'orchestrator',
                content: `🎯 Expert panel consultation started.\n\n**Question:** ${body.question}\n\nStreaming a synthesized panel response from the LLM while the backend engine is offline.`,
                timestamp: new Date().toISOString(),
                agent_id: null,
                agent_name: 'Orchestrator',
                metadata: { fallback: 'openai' },
              },
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(introEvent)}\n\n`));

            // Build a simple panel-style prompt
            const systemPrompt =
              'You are a panel of 2 senior experts discussing the user question. ' +
              'Respond as a single, well-structured answer, but clearly indicate different expert perspectives when useful.';

            const userPrompt = `Question: ${body.question}\n\nSelected agents: ${JSON.stringify(
              body.selected_agent_ids,
            )}\n\nProvide a concise but substantive panel-style answer.`;

            const completion = await openaiClient!.chat.completions.create({
              model: PANEL_MODEL,
              stream: true,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
            });

            // Accumulate streamed chunks and send a SINGLE panel message to the UI
            let fullText = '';
            for await (const chunk of completion) {
              const delta = chunk.choices[0]?.delta?.content;
              if (!delta) continue;
              fullText += delta;
            }

            const panelEvent = {
              type: 'message',
              node: 'initial_panel_responses',
              data: {
                id: `llm-agent-${Date.now()}`,
                type: 'agent',
                role: 'agent',
                content: fullText,
                timestamp: new Date().toISOString(),
                agent_id: 'llm-panel-expert',
                agent_name: 'LLM Panel Expert',
                metadata: { fallback: 'openai' },
              },
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(panelEvent)}\n\n`));

            // Final complete event
            const completeEvent = {
              type: 'complete',
              data: {
                status: 'success',
                message: 'Panel consultation completed using OpenAI fallback.',
              },
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeEvent)}\n\n`));
            controller.close();
          } catch (err) {
            const errorEvent = {
              type: 'error',
              data: {
                error: err instanceof Error ? err.message : 'Unknown LLM error',
              },
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    // Stream response back to client
    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('[Proxy] Streaming error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to proxy streaming request',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const backendUrl = `${AI_ENGINE_URL}/api/ask-panel-enhanced/health`;
    const response = await fetch(backendUrl);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Backend health check failed', status: response.status }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
