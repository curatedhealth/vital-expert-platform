/**
 * Mode 1 Interactive Manual - Next.js API Route
 * 
 * Handles Mode 1: Interactive Manual (Multi-Turn Conversation) requests
 * from frontend and proxies them to Python AI Engine.
 * 
 * Features:
 * - Session management (create/load)
 * - Authentication and authorization
 * - Request validation
 * - SSE streaming proxy
 * - Error handling
 * 
 * @module api/ask-expert/mode1/chat
 * @author VITAL AI Platform Team
 * @created 2025-11-18
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs'; // Required for streaming
export const dynamic = 'force-dynamic'; // Disable caching for SSE

// Environment variables
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8080';

/**
 * POST /api/ask-expert/mode1/chat
 * 
 * Execute Mode 1 Interactive Manual workflow
 * 
 * @param request - Next.js request
 * @returns Streaming SSE response
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // =========================================================================
    // 1. AUTHENTICATION
    // =========================================================================
    
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[Mode1 API] Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get tenant ID from user metadata
    const tenantId = user.user_metadata?.tenant_id || user.user_metadata?.tenant?.id;
    if (!tenantId) {
      console.error('[Mode1 API] No tenant ID found for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'Tenant ID not found' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // =========================================================================
    // 2. REQUEST VALIDATION
    // =========================================================================
    
    const body = await request.json();
    const {
      sessionId,
      agentId,
      message,
      enableRAG = true,
      enableTools = false,
      selectedRagDomains = [],
      requestedTools = [],
      model = 'gpt-4',
      temperature = 0.7,
      maxTokens = 2000,
    } = body;
    
    // Validate required fields
    if (!agentId) {
      return new Response(
        JSON.stringify({ error: 'agentId is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'message is required and cannot be empty' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (message.length > 10000) {
      return new Response(
        JSON.stringify({ error: 'message too long (max 10,000 characters)' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // =========================================================================
    // 3. VERIFY AGENT EXISTS AND USER HAS ACCESS
    // =========================================================================
    
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name, display_name, tier')
      .eq('id', agentId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (agentError || !agent) {
      console.error('[Mode1 API] Agent not found:', agentId, agentError);
      return new Response(
        JSON.stringify({ error: 'Agent not found or access denied' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('[Mode1 API] Request validated', {
      userId: user.id,
      tenantId,
      agentId,
      agentName: agent.name,
      sessionId: sessionId || 'new',
      messageLength: message.length,
      enableRAG,
      enableTools,
    });
    
    // =========================================================================
    // 4. CALL PYTHON AI ENGINE
    // =========================================================================
    
    const aiEngineEndpoint = `${AI_ENGINE_URL}/api/mode1/interactive`;
    
    console.log('[Mode1 API] Calling Python AI Engine:', aiEngineEndpoint);
    
    const aiEnginePayload = {
      session_id: sessionId || null,
      agent_id: agentId,
      message: message.trim(),
      tenant_id: tenantId,
      user_id: user.id,
      enable_rag: enableRAG,
      enable_tools: enableTools,
      selected_rag_domains: selectedRagDomains,
      requested_tools: requestedTools,
      model: model,
      temperature: temperature,
      max_tokens: maxTokens,
      max_results: 10,
      conversation_history: [], // History loaded from DB in Python
    };
    
    let aiEngineResponse: Response;
    
    try {
      aiEngineResponse = await fetch(aiEngineEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify(aiEnginePayload),
      });
    } catch (fetchError) {
      console.error('[Mode1 API] Failed to connect to AI Engine:', {
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        endpoint: aiEngineEndpoint,
        stack: fetchError instanceof Error ? fetchError.stack : undefined,
      });
      
      return new Response(
        JSON.stringify({
          error: 'Failed to connect to AI Engine',
          details: fetchError instanceof Error ? fetchError.message : String(fetchError),
          endpoint: aiEngineEndpoint,
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // =========================================================================
    // 5. HANDLE AI ENGINE ERRORS
    // =========================================================================
    
    if (!aiEngineResponse.ok) {
      console.error('[Mode1 API] AI Engine returned error:', {
        status: aiEngineResponse.status,
        statusText: aiEngineResponse.statusText,
      });
      
      let errorText = 'Unknown error';
      try {
        errorText = await aiEngineResponse.text();
      } catch (e) {
        // Ignore parse error
      }
      
      return new Response(
        JSON.stringify({
          error: `AI Engine error: ${aiEngineResponse.statusText}`,
          details: errorText,
          status: aiEngineResponse.status,
        }),
        {
          status: aiEngineResponse.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // =========================================================================
    // 6. STREAM SSE RESPONSE TO CLIENT
    // =========================================================================
    
    console.log('[Mode1 API] Streaming response to client');
    
    // The response is already an SSE stream from Python
    // We just need to proxy it to the client
    
    const responseHeaders = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    });
    
    // Add CORS headers if needed
    if (process.env.NODE_ENV === 'development') {
      responseHeaders.set('Access-Control-Allow-Origin', '*');
    }
    
    // Create a new Response with the stream from AI Engine
    return new Response(aiEngineResponse.body, {
      status: 200,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error('[Mode1 API] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Return error as JSON (not SSE) since we haven't started streaming yet
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * OPTIONS /api/ask-expert/mode1/chat
 * 
 * CORS preflight handler
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

