/**
 * useJobStatus Hook
 * 
 * React hook for monitoring async job status via SSE.
 * Used for tracking long-running operations like Mode 3/4 workflows.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export type JobStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface JobProgress {
  currentStep: number;
  totalSteps?: number;
  percentComplete?: number;
  currentStepDescription?: string;
}

export interface JobResult<T = unknown> {
  data: T;
  metadata?: Record<string, unknown>;
}

export interface UseJobStatusOptions<T = unknown> {
  jobId: string;
  enabled?: boolean;
  onComplete?: (result: JobResult<T>) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: JobProgress) => void;
  baseUrl?: string;
  pollInterval?: number; // Fallback polling if SSE fails
}

export interface UseJobStatusReturn<T = unknown> {
  status: JobStatus | null;
  progress: JobProgress | null;
  result: JobResult<T> | null;
  error: string | null;
  isLoading: boolean;
  cancel: () => Promise<void>;
  refetch: () => void;
}

export function useJobStatus<T = unknown>({
  jobId,
  enabled = true,
  onComplete,
  onError,
  onProgress,
  baseUrl = '/api/v1',
  pollInterval = 2000,
}: UseJobStatusOptions<T>): UseJobStatusReturn<T> {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [progress, setProgress] = useState<JobProgress | null>(null);
  const [result, setResult] = useState<JobResult<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    abortControllerRef.current?.abort();
  }, []);

  // Process SSE event
  const processEvent = useCallback((eventType: string, data: Record<string, unknown>) => {
    switch (eventType) {
      case 'status_update':
        setStatus(data.status as JobStatus);
        break;

      case 'progress_update':
        const progressData: JobProgress = {
          currentStep: data.currentStep as number,
          totalSteps: data.totalSteps as number | undefined,
          percentComplete: data.percentComplete as number | undefined,
          currentStepDescription: data.description as string | undefined,
        };
        setProgress(progressData);
        onProgress?.(progressData);
        break;

      case 'completed':
        setStatus('completed');
        setIsLoading(false);
        const completedResult = {
          data: data.result as T,
          metadata: data.metadata as Record<string, unknown>,
        };
        setResult(completedResult);
        onComplete?.(completedResult);
        cleanup();
        break;

      case 'failed':
        setStatus('failed');
        setIsLoading(false);
        const errorMessage = data.error as string;
        setError(errorMessage);
        onError?.(errorMessage);
        cleanup();
        break;

      case 'cancelled':
        setStatus('cancelled');
        setIsLoading(false);
        cleanup();
        break;
    }
  }, [cleanup, onComplete, onError, onProgress]);

  // Start SSE connection
  const startSSE = useCallback(() => {
    if (!enabled || !jobId) return;

    cleanup();
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    // Try SSE first
    const eventSource = new EventSource(`${baseUrl}/stream/job/${jobId}/status`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsLoading(false);
    };

    eventSource.onerror = () => {
      // Fall back to polling if SSE fails
      eventSource.close();
      startPolling();
    };

    eventSource.addEventListener('status_update', (e) => {
      const data = JSON.parse(e.data);
      processEvent('status_update', data);
    });

    eventSource.addEventListener('progress_update', (e) => {
      const data = JSON.parse(e.data);
      processEvent('progress_update', data);
    });

    eventSource.addEventListener('completed', (e) => {
      const data = JSON.parse(e.data);
      processEvent('completed', data);
    });

    eventSource.addEventListener('failed', (e) => {
      const data = JSON.parse(e.data);
      processEvent('failed', data);
    });

    eventSource.addEventListener('cancelled', (e) => {
      processEvent('cancelled', {});
    });
  }, [enabled, jobId, baseUrl, cleanup, processEvent]);

  // Fallback polling
  const startPolling = useCallback(async () => {
    if (!enabled || !jobId) return;

    const poll = async () => {
      try {
        const response = await fetch(`${baseUrl}/jobs/${jobId}/status`, {
          signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        setStatus(data.status);
        setIsLoading(false);

        if (data.progress) {
          setProgress(data.progress);
          onProgress?.(data.progress);
        }

        if (data.status === 'completed') {
          // Fetch full result
          const resultResponse = await fetch(`${baseUrl}/jobs/${jobId}/result`);
          if (resultResponse.ok) {
            const resultData = await resultResponse.json();
            setResult(resultData);
            onComplete?.(resultData);
          }
          cleanup();
        } else if (data.status === 'failed') {
          setError(data.error_message || 'Job failed');
          onError?.(data.error_message || 'Job failed');
          cleanup();
        } else if (data.status === 'cancelled') {
          cleanup();
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Polling error:', err);
        }
      }
    };

    // Initial poll
    await poll();

    // Continue polling if job is still running
    if (!['completed', 'failed', 'cancelled'].includes(status || '')) {
      pollIntervalRef.current = setInterval(poll, pollInterval);
    }
  }, [enabled, jobId, baseUrl, status, pollInterval, cleanup, onComplete, onError, onProgress]);

  // Cancel job
  const cancel = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/jobs/${jobId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel job: ${response.statusText}`);
      }

      setStatus('cancelled');
      cleanup();
    } catch (err) {
      console.error('Failed to cancel job:', err);
      throw err;
    }
  }, [jobId, baseUrl, cleanup]);

  // Refetch / restart monitoring
  const refetch = useCallback(() => {
    setStatus(null);
    setProgress(null);
    setResult(null);
    setError(null);
    startSSE();
  }, [startSSE]);

  // Start monitoring when enabled
  useEffect(() => {
    if (enabled && jobId) {
      startSSE();
    }

    return cleanup;
  }, [enabled, jobId, startSSE, cleanup]);

  return {
    status,
    progress,
    result,
    error,
    isLoading,
    cancel,
    refetch,
  };
}











