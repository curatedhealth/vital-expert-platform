/**
 * Domain RAG Statistics API
 * Shows richness and coverage of each domain
 */

import { NextRequest, NextResponse } from 'next/server';
import { domainSpecificRAGService } from '@/lib/services/rag/domain-specific-rag-service';

/**
 * GET /api/rag/domain/stats?domain=regulatory
 * Get stats for a specific domain
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');

    if (domain) {
      // Single domain stats
      const stats = await domainSpecificRAGService.getDomainStats(domain);
      return NextResponse.json(stats);
    } else {
      // All domains stats (shows richness)
      const stats = await domainSpecificRAGService.getAllDomainsStats();
      return NextResponse.json({
        domains: stats,
        totalDomains: stats.length,
        totalDocuments: stats.reduce((sum, s) => sum + s.totalDocuments, 0),
        totalChunks: stats.reduce((sum, s) => sum + s.totalChunks, 0),
        domainsWithContent: stats.filter(s => s.totalDocuments > 0).length
      });
    }

  } catch (error) {
    console.error('Domain stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get domain stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

