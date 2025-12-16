/**
 * useAPI Hook
 * 
 * Generic API hook with error handling, loading states, and caching.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface APIState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
}

export interface APIOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  cacheTime?: number; // milliseconds
  retryCount?: number;
  retryDelay?: number; // milliseconds
}

export interface UseAPIReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (data?: T) => void;
  refetch: () => Promise<void>;
}

const cache = new Map<string, { data: unknown; timestamp: number }>();

export function useAPI<T>(
  endpoint: string | null,
  options: APIOptions = {}
): UseAPIReturn<T> {
  const {
    baseUrl = '/api/v1',
    headers = {},
    cacheTime = 30000, // 30 seconds default
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<APIState<T>>({
    data: null,
    error: null,
    isLoading: Boolean(endpoint),
    isValidating: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const getCacheKey = useCallback(() => {
    return endpoint ? `${baseUrl}${endpoint}` : null;
  }, [baseUrl, endpoint]);

  const fetchWithRetry = useCallback(async (
    url: string,
    attempt: number = 0
  ): Promise<T> => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }

      if (attempt < retryCount - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        return fetchWithRetry(url, attempt + 1);
      }

      throw err;
    }
  }, [headers, retryCount, retryDelay]);

  const fetchData = useCallback(async () => {
    if (!endpoint) return;

    const cacheKey = getCacheKey();
    
    // Check cache
    if (cacheKey && cacheTime > 0) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            data: cached.data as T,
            isLoading: false,
            isValidating: true,
          }));
        }
      }
    }

    // Cancel previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const url = `${baseUrl}${endpoint}`;

    try {
      const data = await fetchWithRetry(url);
      
      // Update cache
      if (cacheKey && cacheTime > 0) {
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }

      if (mountedRef.current) {
        setState({
          data,
          error: null,
          isLoading: false,
          isValidating: false,
        });
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err : new Error('Unknown error'),
          isLoading: false,
          isValidating: false,
        }));
      }
    }
  }, [endpoint, baseUrl, cacheTime, getCacheKey, fetchWithRetry]);

  const mutate = useCallback((data?: T) => {
    const cacheKey = getCacheKey();
    
    if (data !== undefined) {
      setState(prev => ({ ...prev, data }));
      
      if (cacheKey && cacheTime > 0) {
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }
    } else {
      // Revalidate
      fetchData();
    }
  }, [getCacheKey, cacheTime, fetchData]);

  const refetch = useCallback(async () => {
    // Clear cache
    const cacheKey = getCacheKey();
    if (cacheKey) {
      cache.delete(cacheKey);
    }
    
    setState(prev => ({ ...prev, isValidating: true }));
    await fetchData();
  }, [getCacheKey, fetchData]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  return {
    ...state,
    mutate,
    refetch,
  };
}










