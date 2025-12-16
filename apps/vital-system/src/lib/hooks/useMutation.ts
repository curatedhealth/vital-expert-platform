/**
 * useMutation Hook
 * 
 * React hook for API mutations (POST, PUT, DELETE, PATCH).
 */

import { useState, useCallback, useRef } from 'react';

export interface MutationState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export interface MutationOptions<TData, TVariables> {
  method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  baseUrl?: string;
  headers?: Record<string, string>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
}

export interface UseMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | null>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  error: Error | null;
  isLoading: boolean;
  reset: () => void;
}

export function useMutation<TData = unknown, TVariables = Record<string, unknown>>(
  endpoint: string,
  options: MutationOptions<TData, TVariables> = {}
): UseMutationReturn<TData, TVariables> {
  const {
    method = 'POST',
    baseUrl = '/api/v1',
    headers = {},
    onSuccess,
    onError,
    onSettled,
  } = options;

  const [state, setState] = useState<MutationState<TData>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    // Cancel previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const url = `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(variables),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle 204 No Content
      const data: TData = response.status === 204 
        ? null as unknown as TData
        : await response.json();

      setState({ data, error: null, isLoading: false });
      onSuccess?.(data, variables);
      onSettled?.(data, null, variables);

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      if (error.name === 'AbortError') {
        throw error;
      }

      setState(prev => ({ ...prev, error, isLoading: false }));
      onError?.(error, variables);
      onSettled?.(null, error, variables);

      throw error;
    }
  }, [endpoint, method, baseUrl, headers, onSuccess, onError, onSettled]);

  const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
    try {
      return await mutateAsync(variables);
    } catch {
      return null;
    }
  }, [mutateAsync]);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    mutate,
    mutateAsync,
    ...state,
    reset,
  };
}










