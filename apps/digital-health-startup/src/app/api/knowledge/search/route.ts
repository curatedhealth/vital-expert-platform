import { NextRequest, NextResponse } from 'next/server';

import { langchainRAGService } from '@/features/chat/services/langchain-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, domain, scope, limit = 10, agentId } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Use LangChain service to search knowledge
    const results = await langchainRAGService.searchKnowledge(query, {
      domain: domain !== 'all' ? domain : undefined,
      limit,
      agentId,
    });

    const searchTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      query,
      results: results.chunks || [],
      totalResults: results.chunks?.length || 0,
      searchTime,
      metadata: {
        domain,
        scope,
        limit,
      },
    });

  } catch (error) {
    console.error('Knowledge search error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search knowledge base',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}