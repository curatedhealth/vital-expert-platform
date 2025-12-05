/**
 * Unified Search Router API
 *
 * A single API endpoint that routes queries to multiple search backends:
 * - Internal RAG (vector + keyword + entity search)
 * - External sources (PubMed, FDA, ClinicalTrials, EMA, WHO)
 *
 * Features:
 * - Parallel execution across multiple sources
 * - Result fusion and ranking
 * - Source filtering and weighting
 * - Response time optimization
 * - Server-side caching with TTL
 * - Cache-Control headers for client-side caching
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for server-side (per instance)
interface ServerCacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

const serverCache = new Map<string, ServerCacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default
const CACHE_MAX_SIZE = 100;

// Cache key generator
function generateCacheKey(
  query: string,
  sources: string[],
  domain?: string,
  strategy?: string
): string {
  const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ');
  return JSON.stringify({
    q: normalizedQuery,
    s: sources.sort(),
    d: domain || '',
    st: strategy || 'hybrid',
  });
}

// Cache get with TTL check
function getCached<T>(key: string): T | null {
  const entry = serverCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > entry.ttl) {
    serverCache.delete(key);
    return null;
  }

  return entry.data as T;
}

// Cache set with LRU eviction
function setCache(key: string, data: unknown, ttl: number = CACHE_TTL): void {
  // LRU eviction if at capacity
  if (serverCache.size >= CACHE_MAX_SIZE) {
    const oldestKey = serverCache.keys().next().value;
    if (oldestKey) serverCache.delete(oldestKey);
  }

  serverCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

// Get cache statistics (for debugging/monitoring)
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: serverCache.size,
    keys: Array.from(serverCache.keys()),
  };
}

// Types
interface SearchSource {
  id: string;
  name: string;
  type: 'internal' | 'external';
  weight: number; // For result ranking (0-1)
  enabled: boolean;
}

interface UnifiedSearchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  sourceType: 'internal' | 'external';
  sourceId?: string; // PMID, NCT ID, etc.
  url?: string;
  score: number; // Normalized score (0-1)
  metadata: Record<string, any>;
}

interface SearchConfig {
  sources: SearchSource[];
  query: string;
  maxResults: number;
  minScore: number;
  timeout: number;
  domain?: string;
  strategy?: 'hybrid' | 'vector' | 'keyword' | 'entity';
}

// Default search sources configuration
const DEFAULT_SOURCES: SearchSource[] = [
  { id: 'internal-rag', name: 'Knowledge Base', type: 'internal', weight: 1.0, enabled: true },
  { id: 'pubmed', name: 'PubMed', type: 'external', weight: 0.9, enabled: true },
  { id: 'clinicaltrials', name: 'ClinicalTrials.gov', type: 'external', weight: 0.85, enabled: true },
  { id: 'fda', name: 'FDA OpenFDA', type: 'external', weight: 0.8, enabled: true },
  { id: 'ema', name: 'EMA', type: 'external', weight: 0.7, enabled: false }, // No API
  { id: 'who', name: 'WHO', type: 'external', weight: 0.7, enabled: false }, // No API
];

// Internal RAG search
async function searchInternalRAG(
  query: string,
  options: { domain?: string; strategy?: string; maxResults?: number; baseUrl: string }
): Promise<UnifiedSearchResult[]> {
  try {
    const response = await fetch(`${options.baseUrl}/api/knowledge/hybrid-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: query,
        domain: options.domain,
        strategy: options.strategy || 'hybrid',
        maxResults: options.maxResults || 10,
        similarityThreshold: 0.5,
      }),
    });

    if (!response.ok) {
      console.error('Internal RAG search failed:', response.statusText);
      return [];
    }

    const data = await response.json();
    const results = data.results || [];

    return results.map((r: any) => ({
      id: r.chunk_id || r.document_id,
      title: r.source_title || `Document ${r.document_id?.slice(0, 8)}`,
      content: r.content?.slice(0, 500) || '',
      source: 'internal-rag',
      sourceType: 'internal' as const,
      score: r.scores?.combined || 0.5,
      metadata: {
        domain: r.domain,
        documentId: r.document_id,
        chunkId: r.chunk_id,
        matchedEntities: r.matched_entities,
        scores: r.scores,
      },
    }));
  } catch (error) {
    console.error('Internal RAG search error:', error);
    return [];
  }
}

// External evidence search
async function searchExternalSource(
  sourceId: string,
  query: string,
  options: { maxResults?: number; baseUrl: string }
): Promise<UnifiedSearchResult[]> {
  try {
    const response = await fetch(`${options.baseUrl}/api/evidence/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: sourceId,
        query,
        maxResults: options.maxResults || 10,
      }),
    });

    if (!response.ok) {
      console.error(`External search failed for ${sourceId}:`, response.statusText);
      return [];
    }

    const data = await response.json();

    // Handle guidance responses (EMA, WHO)
    if (data.data?.sourceType?.includes('guidance')) {
      return [{
        id: `${sourceId}-guidance`,
        title: `${sourceId.toUpperCase()} Search Instructions`,
        content: data.data.note || 'Manual search required',
        source: sourceId,
        sourceType: 'external' as const,
        url: data.data.searchUrl,
        score: 0.5,
        metadata: {
          instructions: data.data.instructions,
          resources: data.data.resources,
        },
      }];
    }

    // Handle array results
    const results = Array.isArray(data.data) ? data.data : [];

    return results.map((r: any) => {
      // Normalize based on source type
      if (sourceId === 'clinicaltrials') {
        return {
          id: r.nctId || r.id,
          title: r.title,
          content: `${r.conditions?.join(', ') || ''} - ${r.interventions?.join(', ') || ''}`,
          source: 'clinicaltrials',
          sourceType: 'external' as const,
          sourceId: r.nctId,
          url: r.url,
          score: 0.8, // Base score for clinical trials
          metadata: {
            status: r.status,
            phase: r.phase,
            sponsor: r.sponsor,
            enrollmentCount: r.enrollmentCount,
            studyType: r.studyType,
          },
        };
      }

      if (sourceId === 'fda') {
        return {
          id: r.id,
          title: `${r.brandName} (${r.genericName})`,
          content: `Manufacturer: ${r.manufacturer}. Approval: ${r.approvalDate}`,
          source: 'fda',
          sourceType: 'external' as const,
          sourceId: r.id,
          url: r.url,
          score: 0.75,
          metadata: {
            brandName: r.brandName,
            genericName: r.genericName,
            manufacturer: r.manufacturer,
            approvalDate: r.approvalDate,
            approvalType: r.approvalType,
          },
        };
      }

      if (sourceId === 'pubmed') {
        return {
          id: r.pmid,
          title: r.title,
          content: r.abstract || `${r.authors?.slice(0, 3).join(', ')}. ${r.journal}. ${r.publicationDate}`,
          source: 'pubmed',
          sourceType: 'external' as const,
          sourceId: `PMID:${r.pmid}`,
          url: r.url,
          score: 0.85,
          metadata: {
            pmid: r.pmid,
            authors: r.authors,
            journal: r.journal,
            publicationDate: r.publicationDate,
            doi: r.doi,
          },
        };
      }

      // Generic fallback
      return {
        id: r.id || `${sourceId}-${Date.now()}`,
        title: r.title || r.name || 'Unknown',
        content: r.content || r.description || '',
        source: sourceId,
        sourceType: 'external' as const,
        url: r.url,
        score: 0.5,
        metadata: r,
      };
    });
  } catch (error) {
    console.error(`External search error for ${sourceId}:`, error);
    return [];
  }
}

// Reciprocal Rank Fusion (RRF) for combining results
function fuseResults(
  resultSets: { source: SearchSource; results: UnifiedSearchResult[] }[],
  k: number = 60
): UnifiedSearchResult[] {
  const scores: Map<string, { result: UnifiedSearchResult; rrfScore: number }> = new Map();

  resultSets.forEach(({ source, results }) => {
    results.forEach((result, rank) => {
      const key = `${result.source}:${result.id}`;
      const rrfContribution = (source.weight / (k + rank + 1));

      if (scores.has(key)) {
        const existing = scores.get(key)!;
        existing.rrfScore += rrfContribution;
      } else {
        scores.set(key, {
          result: { ...result, score: result.score * source.weight },
          rrfScore: rrfContribution,
        });
      }
    });
  });

  // Sort by RRF score and normalize
  const sorted = Array.from(scores.values())
    .sort((a, b) => b.rrfScore - a.rrfScore);

  const maxScore = sorted[0]?.rrfScore || 1;

  return sorted.map(({ result, rrfScore }) => ({
    ...result,
    score: rrfScore / maxScore, // Normalize to 0-1
  }));
}

// Main handler
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const {
      query,
      sources = DEFAULT_SOURCES,
      maxResults = 20,
      minScore = 0.3,
      timeout = 10000,
      domain,
      strategy = 'hybrid',
      skipCache = false, // Allow bypassing cache for fresh results
    } = body as Partial<SearchConfig> & { query: string; skipCache?: boolean };

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Build search tasks for enabled sources
    const enabledSources = (sources as SearchSource[]).filter((s: SearchSource) => s.enabled);
    const sourceIds = enabledSources.map(s => s.id);

    // Check cache first (unless skipCache is true)
    const cacheKey = generateCacheKey(query, sourceIds, domain, strategy);
    if (!skipCache) {
      const cachedResult = getCached<{
        data: { results: UnifiedSearchResult[]; totalResults: number; sourceStats: Record<string, number> };
        metadata: Record<string, unknown>;
      }>(cacheKey);

      if (cachedResult) {
        const responseTime = Date.now() - startTime;
        return NextResponse.json({
          success: true,
          data: cachedResult.data,
          metadata: {
            ...cachedResult.metadata,
            responseTime,
            fromCache: true,
            cacheHit: true,
          },
        }, {
          headers: {
            'X-Cache': 'HIT',
            'X-Response-Time': `${responseTime}ms`,
            'Cache-Control': 'private, max-age=300', // 5 minutes client cache
          },
        });
      }
    }

    // Get base URL for internal API calls
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const searchPromises: Promise<{ source: SearchSource; results: UnifiedSearchResult[] }>[] = [];

    for (const source of enabledSources) {
      if (source.type === 'internal') {
        searchPromises.push(
          searchInternalRAG(query, { domain, strategy, maxResults, baseUrl })
            .then(results => ({ source, results }))
        );
      } else {
        searchPromises.push(
          searchExternalSource(source.id, query, { maxResults, baseUrl })
            .then(results => ({ source, results }))
        );
      }
    }

    // Execute all searches in parallel with timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Search timeout')), timeout)
    );

    const results = await Promise.race([
      Promise.allSettled(searchPromises),
      timeoutPromise,
    ]) as PromiseSettledResult<{ source: SearchSource; results: UnifiedSearchResult[] }>[];

    // Collect successful results
    const successfulResults = results
      .filter((r): r is PromiseFulfilledResult<{ source: SearchSource; results: UnifiedSearchResult[] }> =>
        r.status === 'fulfilled'
      )
      .map(r => r.value);

    // Log failed searches
    results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .forEach(r => console.warn('Search failed:', r.reason));

    // Fuse and rank results
    const fusedResults = fuseResults(successfulResults);

    // Filter by minimum score and limit results
    const filteredResults = fusedResults
      .filter(r => r.score >= minScore)
      .slice(0, maxResults);

    // Build response with metadata
    const responseTime = Date.now() - startTime;
    const sourceStats = successfulResults.reduce((acc, { source, results }) => {
      acc[source.id] = results.length;
      return acc;
    }, {} as Record<string, number>);

    const responseData = {
      data: {
        results: filteredResults,
        totalResults: filteredResults.length,
        sourceStats,
      },
      metadata: {
        query,
        strategy,
        domain,
        sourcesQueried: enabledSources.map(s => s.id),
        responseTime,
        timestamp: new Date().toISOString(),
        fromCache: false,
      },
    };

    // Store in cache for future requests
    setCache(cacheKey, responseData, CACHE_TTL);

    return NextResponse.json({
      success: true,
      ...responseData,
    }, {
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time': `${responseTime}ms`,
        'Cache-Control': 'private, max-age=300', // 5 minutes client cache
      },
    });
  } catch (error) {
    console.error('Unified search error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const domain = searchParams.get('domain') || undefined;
  const strategy = searchParams.get('strategy') || 'hybrid';
  const maxResults = parseInt(searchParams.get('maxResults') || '20', 10);
  const sources = searchParams.get('sources')?.split(',') || undefined;

  if (!query) {
    return NextResponse.json(
      { error: 'Missing required query parameter: query' },
      { status: 400 }
    );
  }

  // Build sources config if specified
  let sourcesConfig = DEFAULT_SOURCES;
  if (sources) {
    sourcesConfig = DEFAULT_SOURCES.map(s => ({
      ...s,
      enabled: sources.includes(s.id),
    }));
  }

  // Delegate to POST handler
  const body = { query, domain, strategy, maxResults, sources: sourcesConfig };
  const fakeRequest = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: request.headers,
  });

  return POST(fakeRequest);
}
