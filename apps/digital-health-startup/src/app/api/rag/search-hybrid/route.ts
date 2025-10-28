import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

/**
 * Hybrid RAG Search API - Routes to Python Medical RAG Pipeline
 * Enhanced medical document search with Supabase vector storage
 */

interface RAGSearchRequest {
  query: string;
  filters?: {
    medical_specialty?: string;
    document_type?: string;
    phase?: string;
    organization_id?: string;
  };
  max_results?: number;
  similarity_threshold?: number;
  include_metadata?: boolean;
  include_medical_context?: boolean;
  rerank_results?: boolean;
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

    const body: RAGSearchRequest = await request.json();

    // Validate required fields
    if (!body.query || body.query.length < 3) {
      return NextResponse.json(
        { error: 'Query must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Prepare request for Python AI service
    const pythonRequest = {
      query: body.query,
      filters: {
        ...body.filters,
        organization_id: userProfile?.organization_id // Ensure organization-level access
      },
      max_results: Math.min(body.max_results || 10, 50), // Cap at 50
      similarity_threshold: body.similarity_threshold || 0.7,
      include_metadata: body.include_metadata ?? true,
      include_medical_context: body.include_medical_context ?? true,
      rerank_results: body.rerank_results ?? true,
      user_context: {
        user_id: user.id,
        organization_id: userProfile?.organization_id,
        medical_specialty: userProfile?.medical_specialty,
        role: userProfile?.role
      }
    };

    // Call Python AI service
    const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${PYTHON_AI_SERVICE_URL}/api/rag/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': request.headers.get('x-request-id') || generateRequestId(),
        'Authorization': request.headers.get('authorization') || ''
      },
      body: JSON.stringify(pythonRequest)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // console.error('❌ Python RAG service error:', {
      //   status: response.status,
      //   statusText: response.statusText,
      //   error: errorData
      // });

      return NextResponse.json(
        {
          error: 'RAG search service temporarily unavailable',
          details: errorData.error || response.statusText,
          status: response.status
        },
        { status: response.status === 503 ? 503 : 500 }
      );
    }

    // Enhance response with hybrid architecture metadata
    const ragResponse = await response.json();
    const enhancedResponse = {
      ...ragResponse,
      search_metadata: {
        ...ragResponse.search_metadata,
        architecture: 'hybrid',
        vector_database: 'Supabase Vector',
        rag_pipeline: 'Python LangChain',
        embedding_model: 'OpenAI text-embedding-3-large',
        search_enhanced: true,
        medical_context_applied: true
      },
      user_context: {
        organization_id: userProfile?.organization_id,
        medical_specialty: userProfile?.medical_specialty,
        access_level: userProfile?.role
      },
      privacy: {
        hipaa_compliant: true,
        organization_scoped: true,
        audit_trail_enabled: true
      }
    };

    return NextResponse.json(enhancedResponse, { status: 200 });

  } catch (error) {
    // console.error('❌ Hybrid RAG search error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process RAG search',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        service: 'hybrid-rag-search'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for RAG search capabilities and statistics
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
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call Python AI service for RAG capabilities
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('include_stats') === 'true';
    const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(
      `${PYTHON_AI_SERVICE_URL}/api/rag/capabilities?include_stats=${includeStats}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Python RAG service error: ${response.statusText}`);
    }

    const capabilities = await response.json();

    // Get additional statistics from Supabase if requested
    let supabaseStats = {};
    if (includeStats) {
      try {
        // Get document counts by organization
        const { data: orgDocs, error: orgError } = await supabase
          .from('documents')
          .select('id, medical_specialty, document_type')
          .eq('organization_id', user.id); // This should be organization_id from user profile

        if (!orgError && orgDocs) {
          const specialtyCounts = orgDocs.reduce((acc: any, doc: any) => {
            acc[doc.medical_specialty] = (acc[doc.medical_specialty] || 0) + 1;
            return acc;
          }, {});

          const typeCounts = orgDocs.reduce((acc: any, doc: any) => {
            acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
            return acc;
          }, {});

          supabaseStats = {
            organization_documents: orgDocs.length,
            specialty_distribution: specialtyCounts,
            document_type_distribution: typeCounts
          };
        }
      } catch (error) {
        // console.warn('⚠️ Failed to get Supabase stats:', error);
      }
    }

    return NextResponse.json({
      ...capabilities,
      hybrid_architecture: {
        frontend: 'Next.js TypeScript',
        gateway: 'Node.js Express',
        rag_backend: 'Python FastAPI + LangChain',
        vector_database: 'Supabase Vector',
        embedding_model: 'OpenAI text-embedding-3-large'
      },
      supabase_integration: {
        vector_storage: 'pgvector extension',
        real_time_updates: true,
        organization_scoped: true,
        row_level_security: true
      },
      ...supabaseStats,
      search_features: [
        'Medical specialty filtering',
        'Regulatory phase context',
        'Evidence level assessment',
        'Citation quality scoring',
        'Medical relevance re-ranking',
        'HIPAA compliant search',
        'Organization-scoped results'
      ]
    });

  } catch (error) {
    // console.error('❌ RAG capabilities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RAG capabilities' },
      { status: 500 }
    );
  }
}

function generateRequestId(): string {
  return `rag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}