import { NextRequest, NextResponse } from 'next/server';
import { ragService } from '@/rag-service';

export interface SearchRequest {
  query: string;
  threshold?: number;
  limit?: number;
  domain?: string;
  prism_suite?: string;
  include_metadata?: boolean;
}

export interface SearchResponse {
  results: Array<{
    chunk_id: string;
    source_id: string;
    content: string;
    similarity: number;
    source_name: string;
    domain: string;
    prism_suite?: string;
    section_title?: string;
    medical_context: Record<string, unknown>;
    regulatory_context: Record<string, unknown>;
    clinical_context: Record<string, unknown>;
  }>;
  total_results: number;
  query: string;
  processing_time_ms: number;
  filters_applied: {
    domain?: string;
    prism_suite?: string;
    threshold: number;
    limit: number;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🔍 RAG Search API called');

    // Parse request body
    const body: SearchRequest = await request.json();
    const {
      query,
      threshold = 0.7,
      limit = 10,
      domain,
      prism_suite,
      include_metadata = true
    } = body;

    // Validate input
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Query is required',
          code: 'MISSING_QUERY'
        },
        { status: 400 }
      );
    }

    if (query.length > 1000) {
      return NextResponse.json(
        { 
          error: 'Query too long (max 1000 characters)',
          code: 'QUERY_TOO_LONG'
        },
        { status: 400 }
      );
    }

    if (threshold < 0 || threshold > 1) {
      return NextResponse.json(
        { 
          error: 'Threshold must be between 0 and 1',
          code: 'INVALID_THRESHOLD'
        },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { 
          error: 'Limit must be between 1 and 100',
          code: 'INVALID_LIMIT'
        },
        { status: 400 }
      );
    }

    console.log('📝 Search parameters:', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      threshold,
      limit,
      domain,
      prism_suite
    });

    // Initialize RAG service
    await ragService.initialize();

    // Generate embedding for the query
    console.log('🧠 Generating embedding for query...');
    const queryEmbedding = await ragService.generateEmbedding(query);

    // Perform vector search
    console.log('🔍 Performing vector search...');
    const searchResults = await ragService.searchKnowledge(
      query,
      queryEmbedding,
      {
        threshold,
        limit,
        domain,
        prism_suite,
        include_metadata
      }
    );

    const processingTime = Date.now() - startTime;

    // Format response
    const response: SearchResponse = {
      results: searchResults.map(result => ({
        chunk_id: result.chunk_id,
        source_id: result.source_id,
        content: result.content,
        similarity: result.similarity,
        source_name: result.source_name,
        domain: result.domain,
        prism_suite: result.prism_suite,
        section_title: result.section_title,
        medical_context: result.medical_context || {},
        regulatory_context: result.regulatory_context || {},
        clinical_context: result.clinical_context || {}
      })),
      total_results: searchResults.length,
      query,
      processing_time_ms: processingTime,
      filters_applied: {
        domain,
        prism_suite,
        threshold,
        limit
      }
    };

    console.log(`✅ Search completed: ${searchResults.length} results in ${processingTime}ms`);

    return NextResponse.json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ RAG Search API error:', error);

    // Return appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('not initialized')) {
        return NextResponse.json(
          { 
            error: 'RAG service not initialized',
            code: 'SERVICE_NOT_INITIALIZED',
            details: error.message
          },
          { status: 503 }
        );
      }

      if (error.message.includes('embedding')) {
        return NextResponse.json(
          { 
            error: 'Failed to generate embedding',
            code: 'EMBEDDING_ERROR',
            details: error.message
          },
          { status: 500 }
        );
      }

      if (error.message.includes('database') || error.message.includes('supabase')) {
        return NextResponse.json(
          { 
            error: 'Database error',
            code: 'DATABASE_ERROR',
            details: error.message
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: processingTime
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    await ragService.initialize();
    
    return NextResponse.json({
      status: 'healthy',
      service: 'rag-search',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'rag-search',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
