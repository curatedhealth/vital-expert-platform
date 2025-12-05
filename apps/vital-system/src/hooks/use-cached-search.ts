/**
 * useCachedSearch Hook
 *
 * React hook for performing cached searches with:
 * - Automatic caching and deduplication
 * - Debounced input handling
 * - Stale-while-revalidate pattern
 * - Loading and error states
 * - Cache statistics for debugging
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  searchCache,
  externalApiCache,
  debounce,
  deduplicatedFetch,
  measurePerformance,
  TTL_PRESETS,
} from '@/lib/services/knowledge/search-cache';

// Search result types
interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  score: number;
  metadata?: Record<string, unknown>;
}

interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  metadata?: {
    query: string;
    strategy: string;
    responseTime: number;
    timestamp: string;
    sourceStats?: Record<string, number>;
    fromCache?: boolean;
  };
}

// Hook options
interface UseCachedSearchOptions {
  source?: 'internal' | 'pubmed' | 'clinicaltrials' | 'fda' | 'unified';
  domain?: string;
  strategy?: 'hybrid' | 'vector' | 'keyword' | 'entity';
  maxResults?: number;
  debounceMs?: number;
  staleWhileRevalidate?: boolean;
  enabled?: boolean;
}

// Hook return type
interface UseCachedSearchReturn {
  search: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  isRevalidating: boolean;
  error: Error | null;
  fromCache: boolean;
  responseTime: number;
  cacheStats: {
    hitRate: number;
    entries: number;
    memoryMB: number;
  };
  clearCache: () => void;
}

// Default options
const DEFAULT_OPTIONS: Required<UseCachedSearchOptions> = {
  source: 'unified',
  domain: '',
  strategy: 'hybrid',
  maxResults: 20,
  debounceMs: 300,
  staleWhileRevalidate: true,
  enabled: true,
};

export function useCachedSearch(
  options: UseCachedSearchOptions = {}
): UseCachedSearchReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [responseTime, setResponseTime] = useState(0);

  // Refs for cleanup and abort
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>('');

  // Get appropriate cache based on source
  const cache = opts.source === 'internal' ? searchCache : externalApiCache;

  // Build cache key
  const buildCacheKey = useCallback(
    (q: string) => ({
      query: q,
      source: opts.source,
      domain: opts.domain,
      strategy: opts.strategy,
      maxResults: opts.maxResults,
    }),
    [opts.source, opts.domain, opts.strategy, opts.maxResults]
  );

  // Fetch function
  const fetchResults = useCallback(
    async (searchQuery: string, signal?: AbortSignal): Promise<SearchResponse> => {
      // Build request based on source type
      const endpoint = opts.source === 'unified'
        ? '/api/knowledge/unified-search'
        : opts.source === 'internal'
        ? '/api/knowledge/hybrid-search'
        : '/api/evidence/search';

      const body = opts.source === 'internal'
        ? {
            text: searchQuery,
            domain: opts.domain || undefined,
            strategy: opts.strategy,
            maxResults: opts.maxResults,
            similarityThreshold: 0.5,
          }
        : opts.source === 'unified'
        ? {
            query: searchQuery,
            domain: opts.domain || undefined,
            strategy: opts.strategy,
            maxResults: opts.maxResults,
            minScore: 0.3,
          }
        : {
            source: opts.source,
            query: searchQuery,
            maxResults: opts.maxResults,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Normalize response format
      if (opts.source === 'unified') {
        return {
          results: data.data?.results || [],
          totalResults: data.data?.totalResults || 0,
          metadata: data.metadata,
        };
      }

      if (opts.source === 'internal') {
        return {
          results: data.results?.map((r: any) => ({
            id: r.chunk_id || r.document_id,
            title: r.source_title || `Document ${r.document_id?.slice(0, 8)}`,
            content: r.content?.slice(0, 500) || '',
            source: 'internal',
            score: r.scores?.combined || 0.5,
            metadata: r.metadata,
          })) || [],
          totalResults: data.results?.length || 0,
        };
      }

      // External sources
      return {
        results: data.data?.map((r: any, idx: number) => ({
          id: r.pmid || r.nctId || r.id || `result-${idx}`,
          title: r.title || r.brandName || 'Unknown',
          content: r.abstract || r.description || '',
          source: opts.source,
          score: 0.8,
          metadata: r,
        })) || [],
        totalResults: data.data?.length || 0,
      };
    },
    [opts.source, opts.domain, opts.strategy, opts.maxResults]
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim() || !opts.enabled) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const cacheKey = buildCacheKey(searchQuery);
      lastQueryRef.current = searchQuery;

      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached !== null) {
        setResults((cached as SearchResponse).results);
        setFromCache(true);
        setResponseTime(0);
        setIsLoading(false);

        // Stale-while-revalidate: fetch fresh data in background
        if (opts.staleWhileRevalidate) {
          setIsRevalidating(true);
          try {
            const { result, duration } = await measurePerformance(
              () => fetchResults(searchQuery, abortControllerRef.current!.signal),
              'search-revalidate'
            );
            cache.set(cacheKey, result);
            setResults(result.results);
            setFromCache(false);
            setResponseTime(duration);
          } catch (err) {
            // Ignore revalidation errors - we have cached data
            if (err instanceof Error && err.name !== 'AbortError') {
              console.warn('Revalidation failed:', err);
            }
          } finally {
            setIsRevalidating(false);
          }
        }
        return;
      }

      // No cache, fetch fresh
      setIsLoading(true);
      setFromCache(false);
      setError(null);

      try {
        const { result, duration } = await measurePerformance(
          () => fetchResults(searchQuery, abortControllerRef.current!.signal),
          'search-fresh'
        );
        cache.set(cacheKey, result);
        setResults(result.results);
        setResponseTime(duration);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was cancelled, ignore
          return;
        }
        setError(err instanceof Error ? err : new Error('Search failed'));
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, opts.debounceMs),
    [opts.enabled, opts.staleWhileRevalidate, opts.debounceMs, buildCacheKey, fetchResults, cache]
  );

  // Search trigger
  const search = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      if (newQuery.trim()) {
        setIsLoading(true);
        debouncedSearch(newQuery);
      } else {
        setResults([]);
        setIsLoading(false);
      }
    },
    [debouncedSearch]
  );

  // Clear cache
  const clearCache = useCallback(() => {
    cache.clearSource(opts.source);
  }, [cache, opts.source]);

  // Get cache stats
  const cacheStats = cache.getStats();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    search,
    results,
    isLoading,
    isRevalidating,
    error,
    fromCache,
    responseTime,
    cacheStats: {
      hitRate: cacheStats.hitRate,
      entries: cacheStats.entries,
      memoryMB: cacheStats.memoryUsedMB,
    },
    clearCache,
  };
}

/**
 * usePrefetchSearch Hook
 *
 * Prefetch search results based on user behavior patterns
 */
export function usePrefetchSearch() {
  const prefetch = useCallback(
    async (queries: string[], source: string = 'unified') => {
      const cache = source === 'internal' ? searchCache : externalApiCache;

      for (const query of queries) {
        const cacheKey = { query, source };

        // Skip if already cached
        if (cache.get(cacheKey) !== null) {
          continue;
        }

        // Fetch in background with low priority
        try {
          const endpoint = source === 'unified'
            ? '/api/knowledge/unified-search'
            : source === 'internal'
            ? '/api/knowledge/hybrid-search'
            : '/api/evidence/search';

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query,
              maxResults: 10,
            }),
            // Use keepalive for prefetch requests
            keepalive: true,
          });

          if (response.ok) {
            const data = await response.json();
            cache.set(cacheKey, data);
          }
        } catch (error) {
          // Ignore prefetch errors
          console.debug('Prefetch failed for query:', query);
        }
      }
    },
    []
  );

  return { prefetch };
}

export default useCachedSearch;
