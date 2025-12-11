'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  V0GenerationType,
  V0GenerationStatus,
  V0GenerationResponse,
  V0GenerationContext,
  V0GenerationHistoryEntry,
  V0GenerationState,
} from './types';

/**
 * Options for useV0Generation hook
 */
export interface UseV0GenerationOptions {
  /** API endpoint for v0 generation */
  apiEndpoint?: string;
  /** Maximum history entries to keep */
  maxHistory?: number;
  /** Callback on successful generation */
  onSuccess?: (result: V0GenerationResponse) => void;
  /** Callback on generation error */
  onError?: (error: string) => void;
}

/**
 * Return type for useV0Generation hook
 */
export interface UseV0GenerationReturn {
  /** Current generation state */
  state: V0GenerationState;
  /** Generate a new component */
  generate: (type: V0GenerationType, prompt: string, context?: V0GenerationContext) => Promise<V0GenerationResponse | null>;
  /** Refine the current generation */
  refine: (refinementPrompt: string) => Promise<V0GenerationResponse | null>;
  /** Reset the state */
  reset: () => void;
  /** Clear history */
  clearHistory: () => void;
  /** Delete a history entry */
  deleteHistoryEntry: (id: string) => void;
  /** Mark a history entry as applied */
  markAsApplied: (id: string) => void;
  /** Select a history entry as current */
  selectHistoryEntry: (entry: V0GenerationHistoryEntry) => void;
}

/**
 * useV0Generation - Hook for v0 AI UI Generation
 * 
 * Provides state management and API calls for v0 generation.
 * Optimized for performance with memoized callbacks and refs.
 * 
 * Features:
 * - Generate new UI components with v0
 * - Refine existing generations
 * - Track generation history
 * - Error handling and loading states
 * 
 * @example
 * ```tsx
 * const {
 *   state,
 *   generate,
 *   refine,
 *   reset
 * } = useV0Generation({
 *   onSuccess: (result) => console.log('Generated:', result.previewUrl),
 *   onError: (error) => console.error('Failed:', error),
 * });
 * 
 * // Generate a new component
 * await generate('workflow-node', 'Create a KOL scorer node');
 * 
 * // Refine the result
 * await refine('Make it more compact');
 * ```
 * 
 * @package @vital/ai-ui/v0
 */
export function useV0Generation(options: UseV0GenerationOptions = {}): UseV0GenerationReturn {
  const {
    apiEndpoint = '/api/v0/generate',
    maxHistory = 20,
    onSuccess,
    onError,
  } = options;

  // State
  const [status, setStatus] = useState<V0GenerationStatus>('idle');
  const [result, setResult] = useState<V0GenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<V0GenerationHistoryEntry[]>([]);

  // Refs for callbacks to avoid stale closures
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  // Create history entry
  const createHistoryEntry = useCallback((
    prompt: string,
    type: V0GenerationType,
    response: V0GenerationResponse | null,
    isRefinement: boolean
  ): V0GenerationHistoryEntry => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    chatId: response?.chatId || '',
    prompt,
    type,
    previewUrl: response?.previewUrl || '',
    timestamp: response?.timestamp || new Date().toISOString(),
    status: response?.success ? 'success' : 'error',
    refinementCount: isRefinement ? 1 : 0,
    applied: false,
  }), []);

  // Add to history
  const addToHistory = useCallback((entry: V0GenerationHistoryEntry) => {
    setHistory(prev => [entry, ...prev.slice(0, maxHistory - 1)]);
  }, [maxHistory]);

  // Generate
  const generate = useCallback(async (
    type: V0GenerationType,
    prompt: string,
    context?: V0GenerationContext
  ): Promise<V0GenerationResponse | null> => {
    if (!prompt.trim()) return null;

    setStatus('generating');
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          prompt: prompt.trim(),
          context,
        }),
      });

      const data: V0GenerationResponse = await response.json();

      if (data.success) {
        setStatus('success');
        setResult(data);
        addToHistory(createHistoryEntry(prompt, type, data, false));
        onSuccessRef.current?.(data);
        return data;
      } else {
        const errorMessage = data.error || 'Generation failed';
        setStatus('error');
        setError(errorMessage);
        addToHistory(createHistoryEntry(prompt, type, data, false));
        onErrorRef.current?.(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setStatus('error');
      setError(errorMessage);
      addToHistory(createHistoryEntry(prompt, type, null, false));
      onErrorRef.current?.(errorMessage);
      return null;
    }
  }, [apiEndpoint, addToHistory, createHistoryEntry]);

  // Refine
  const refine = useCallback(async (
    refinementPrompt: string
  ): Promise<V0GenerationResponse | null> => {
    if (!result?.chatId || !refinementPrompt.trim()) return null;

    setStatus('refining');
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: result.generationType,
          prompt: refinementPrompt.trim(),
          context: {
            chatId: result.chatId,
          },
        }),
      });

      const data: V0GenerationResponse = await response.json();

      if (data.success) {
        setStatus('success');
        setResult(data);
        addToHistory(createHistoryEntry(refinementPrompt, result.generationType, data, true));
        onSuccessRef.current?.(data);
        return data;
      } else {
        const errorMessage = data.error || 'Refinement failed';
        setStatus('error');
        setError(errorMessage);
        onErrorRef.current?.(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setStatus('error');
      setError(errorMessage);
      onErrorRef.current?.(errorMessage);
      return null;
    }
  }, [result, apiEndpoint, addToHistory, createHistoryEntry]);

  // Reset
  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Delete history entry
  const deleteHistoryEntry = useCallback((id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
  }, []);

  // Mark as applied
  const markAsApplied = useCallback((id: string) => {
    setHistory(prev => prev.map(entry =>
      entry.id === id ? { ...entry, applied: true } : entry
    ));
  }, []);

  // Select history entry
  const selectHistoryEntry = useCallback((entry: V0GenerationHistoryEntry) => {
    if (entry.status === 'success' && entry.previewUrl) {
      setResult({
        success: true,
        chatId: entry.chatId,
        previewUrl: entry.previewUrl,
        generationType: entry.type,
        timestamp: entry.timestamp,
      });
      setStatus('success');
      setError(null);
    }
  }, []);

  return {
    state: {
      status,
      result,
      error,
      history,
    },
    generate,
    refine,
    reset,
    clearHistory,
    deleteHistoryEntry,
    markAsApplied,
    selectHistoryEntry,
  };
}

export default useV0Generation;






