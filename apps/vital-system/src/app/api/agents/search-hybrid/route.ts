/**
 * API Route: Hybrid Agent Search (GraphRAG)
 * 
 * Combines Pinecone vector search with Supabase metadata filtering
 * Provides best-in-class agent discovery
 */

import { NextRequest, NextResponse } from 'next/server';
import { pineconeVectorService } from '@/lib/services/vectorstore/pinecone-vector-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      embedding,
      topK = 10,
      minScore = 0.7,
      filters = {},
    } = body;

    if (!query && !embedding) {
      return NextResponse.json(
        { error: 'Either query text or embedding vector is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Hybrid agent search - Query: ${query || 'embedding provided'}, Filters:`, filters);

    // Check if Pinecone is configured
    if (!pineconeVectorService) {
      return NextResponse.json(
        { error: 'Vector search is not configured (PINECONE_API_KEY not set)' },
        { status: 503 }
      );
    }

    // Perform hybrid search
    const results = await pineconeVectorService.hybridAgentSearch({
      text: query,
      embedding: embedding,
      topK,
      minScore,
      filters: {
        tier: filters.tier,
        status: filters.status,
        business_function: filters.business_function,
        knowledge_domain: filters.knowledge_domain,
      },
    });

    // Format results for frontend
    const formattedResults = results.map(result => ({
      agent: result.agent,
      similarity: result.similarity,
      metadata: result.metadata,
    }));

    console.log(`✅ Found ${formattedResults.length} agents`);

    return NextResponse.json({
      success: true,
      results: formattedResults,
      count: formattedResults.length,
    });
  } catch (error) {
    console.error('❌ Hybrid agent search failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to search agents',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

