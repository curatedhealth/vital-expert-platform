/**
 * Domain-Specific RAG API
 * 
 * Exposes domain-specific RAG endpoints that feel like separate RAGs
 * while using efficient single namespace storage with metadata filtering.
 * 
 * Routes:
 *   GET  /api/rag/domain?domain=regulatory&query=... - Query single domain
 *   POST /api/rag/domain/multi - Query multiple domains
 *   GET  /api/rag/domain/stats?domain=regulatory - Get domain stats
 *   GET  /api/rag/domain/stats/all - Get all domain stats (shows richness)
 *   POST /api/rag/domain/recommend - Recommend domains for a query
 *   GET  /api/rag/domain/coverage - Get domain coverage visualization
 */

import { NextRequest, NextResponse } from 'next/server';
import { domainSpecificRAGService } from '@/lib/services/rag/domain-specific-rag-service';

/**
 * GET /api/rag/domain
 * Query a specific domain's RAG
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');
    const query = searchParams.get('query');
    const topK = parseInt(searchParams.get('topK') || '10');
    const minScore = parseFloat(searchParams.get('minScore') || '0.7');

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter is required' },
        { status: 400 }
      );
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const results = await domainSpecificRAGService.queryDomainRAG({
      text: query,
      domain,
      topK,
      minScore
    });

    return NextResponse.json({
      domain,
      query,
      results,
      count: results.length
    });

  } catch (error) {
    console.error('Domain RAG query error:', error);
    return NextResponse.json(
      { error: 'Failed to query domain RAG', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rag/domain/multi
 * Query multiple domains simultaneously
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, domains, topK = 20, minScore = 0.7 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return NextResponse.json(
        { error: 'Domains array is required' },
        { status: 400 }
      );
    }

    const results = await domainSpecificRAGService.queryMultiDomainRAG({
      text: query,
      domain: domains,
      topK,
      minScore
    });

    // Group results by domain for better UX
    const byDomain: Record<string, typeof results> = {};
    results.forEach(result => {
      if (!byDomain[result.domain]) {
        byDomain[result.domain] = [];
      }
      byDomain[result.domain].push(result);
    });

    return NextResponse.json({
      query,
      domains,
      totalResults: results.length,
      results,
      byDomain,
      domainCounts: Object.fromEntries(
        Object.entries(byDomain).map(([domain, results]) => [domain, results.length])
      )
    });

  } catch (error) {
    console.error('Multi-domain RAG query error:', error);
    return NextResponse.json(
      { error: 'Failed to query multi-domain RAG', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

