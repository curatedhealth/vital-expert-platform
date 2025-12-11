'use client';

/**
 * Agent metrics hook stub
 * TODO: Implement metrics tracking when chat feature is developed
 */

import { useState, useEffect, useCallback } from 'react';
import type { AgentMetrics } from '../components/metrics-dashboard';

export interface UseAgentMetricsOptions {
  agentId?: string;
  sessionId?: string;
  refreshInterval?: number;
}

export interface UseAgentMetricsReturn {
  metrics: AgentMetrics | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const defaultMetrics: AgentMetrics = {
  responseTime: 0,
  tokenCount: 0,
  successRate: 0,
  errorCount: 0,
};

export const useAgentMetrics = (
  options: UseAgentMetricsOptions = {}
): UseAgentMetricsReturn => {
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!options.agentId) return;

    setIsLoading(true);
    try {
      // TODO: Implement metrics fetching from backend
      setMetrics(defaultMetrics);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setIsLoading(false);
    }
  }, [options.agentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    metrics,
    isLoading,
    error,
    refresh,
  };
};

export default useAgentMetrics;
