import { NextRequest, NextResponse } from 'next/server';
import { entityAwareHybridSearch } from '@/lib/services/search/entity-aware-hybrid-search';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      domain,
      strategy = 'hybrid',
      maxResults = 20,
      similarityThreshold = 0.6,
      agentId,
      userId,
      phase,
      filters,
    } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query text is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Use entity-aware hybrid search
    const results = await entityAwareHybridSearch.search({
      text,
      domain,
      strategy,
      maxResults,
      similarityThreshold,
      agentId,
      userId,
      phase,
      filters,
    });

    const searchTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      results,
      totalResults: results.length,
      searchTime,
      metadata: {
        domain,
        strategy,
        maxResults,
        similarityThreshold,
      },
    });
  } catch (error) {
    console.error('Hybrid search error:', error);
    return NextResponse.json(
      {
        error: 'Failed to perform hybrid search',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
