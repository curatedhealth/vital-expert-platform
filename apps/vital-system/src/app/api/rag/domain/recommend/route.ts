/**
 * Domain Recommendation API
 * Recommends which domains are most relevant for a query
 */

import { NextRequest, NextResponse } from 'next/server';
import { domainSpecificRAGService } from '@/lib/services/rag/domain-specific-rag-service';

/**
 * POST /api/rag/domain/recommend
 * Recommend domains for a query
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, topN = 3 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const recommendedDomains = await domainSpecificRAGService.recommendDomainsForQuery(query, topN);

    return NextResponse.json({
      query,
      recommendedDomains,
      count: recommendedDomains.length
    });

  } catch (error) {
    console.error('Domain recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to recommend domains', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

