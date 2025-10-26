import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

/**
 * Hybrid Agent Query API - Routes to Python AI Services
 * Enhanced medical AI agent queries with RAG and compliance protocols
 */

interface AgentQueryRequest {
  agent_id?: string;
  agent_type: string;
  query: string;
  medical_specialty?: string;
  phase?: string;
  max_context_docs?: number;
  similarity_threshold?: number;
  pharma_protocol_required?: boolean;
  verify_protocol_required?: boolean;
  response_format?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id, role, medical_specialty')
      .eq('id', user.id)
      .single();

    const body: AgentQueryRequest = await request.json();

    // Validate required fields
    if (!body.query || !body.agent_type) {
      return NextResponse.json(
        { error: 'Missing required fields: query and agent_type' },
        { status: 400 }
      );
    }

    // Prepare request for Python AI service
    const requestPayload = {
      agent_id: body.agent_id,
      agent_type: body.agent_type,
      query: body.query,
      user_id: user.id,
      organization_id: userProfile?.organization_id,
      medical_specialty: body.medical_specialty || userProfile?.medical_specialty,
      phase: body.phase,
      max_context_docs: body.max_context_docs || 5,
      similarity_threshold: body.similarity_threshold || 0.7,
      pharma_protocol_required: body.pharma_protocol_required || false,
      verify_protocol_required: body.verify_protocol_required ?? true,
      response_format: body.response_format || 'detailed',
      include_citations: true,
      include_confidence_scores: true,
      include_medical_context: true,
      hipaa_compliant: true
    };

    // Call Python AI service
    const response = await fetch(`${process.env.PYTHON_AI_SERVICE_URL}/api/query/hybrid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': request.headers.get('x-request-id') || generateRequestId(),
        'Authorization': request.headers.get('authorization') || ''
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));

      // console.error('❌ Python AI service error:', {
      //   status: response.status,
      //   statusText: response.statusText,
      //   error: errorData
      // });

      return NextResponse.json(
        {
          error: 'AI service temporarily unavailable',
          details: errorData.error || response.statusText,
          status: response.status
        },
        { status: response.status === 503 ? 503 : 500 }
      );
    }

    // Enhance response with additional metadata
    const aiResponse = await response.json();

    const enhancedResponse = {
      ...aiResponse,
      hybrid_architecture: {
        frontend: 'Next.js TypeScript',
        gateway: 'Node.js Express',
        ai_backend: 'Python FastAPI + LangChain',
        vector_db: 'Supabase Vector',
        processed_at: new Date().toISOString()
      },
      compliance: {
        hipaa_compliant: true,
        fda_21cfr11_compliant: true,
        pharma_protocol_applied: requestPayload.pharma_protocol_required,
        verify_protocol_applied: requestPayload.verify_protocol_required
      }
    };

    return NextResponse.json(enhancedResponse, { status: 200 });

  } catch (error) {
    // console.error('❌ Hybrid agent query error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process agent query',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        service: 'hybrid-agent-query'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for agent query templates and examples
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    const { searchParams } = new URL(request.url);
    const agentType = searchParams.get('agent_type') || 'general';
    const includeExamples = searchParams.get('include_examples') || 'true';
    const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';

    // Call Python AI service for templates
    const response = await fetch(
      `${PYTHON_AI_SERVICE_URL}/api/agents/templates?agent_type=${agentType}&include_examples=${includeExamples}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Python AI service error: ${response.statusText}`);
    }

    const templates = await response.json();

    return NextResponse.json({
      ...templates,
      hybrid_info: {
        architecture: '3-tier hybrid (TypeScript + Node.js + Python)',
        ai_backend: 'Python FastAPI + LangChain',
        vector_storage: 'Supabase Vector Database'
      }
    });

  } catch (error) {
    // console.error('❌ Agent templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent templates' },
      { status: 500 }
    );
  }
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}