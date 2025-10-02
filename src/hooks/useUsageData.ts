import { useState, useEffect, useCallback } from 'react';

export interface UsageMetrics {
  activeProviders: number;
  totalRequestsToday: number;
  totalCostToday: number;
  averageLatency: number;
  successRate: number;
}

export interface CostBreakdown {
  daily: Array<{
    date: string;
    cost: number;
    tokens: number;
    requests: number;
  }>;
  by_provider: Array<{
    provider_name: string;
    cost: number;
    percentage: number;
  }>;
  by_model: Array<{
    model: string;
    cost: number;
    percentage: number;
  }>;
  by_user: Array<{
    user_id: string;
    cost: number;
    percentage: number;
  }>;
  total_cost: number;
  total_tokens: number;
  total_requests: number;
}

export const _useUsageMetrics = () => {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/llm/metrics');

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh: fetchMetrics
  };
};

export const _useCostBreakdown = (
  startDate: Date,
  endDate: Date,
  providerId?: string,
  userId?: string
) => {
  const [data, setData] = useState<CostBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (providerId) params.append('providerId', providerId);
      if (userId) params.append('userId', userId);

      const response = await fetch(`/api/llm/usage?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, providerId, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData
  };
};

export const _useProviderUsage = (providerId: string, startDate: Date, endDate: Date) => {
  const [usage, setUsage] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    if (!providerId) return;

    try {
      setLoading(true);

      const params = new URLSearchParams({
        providerId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const response = await fetch(`/api/llm/usage?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch provider usage');
      }

      const data = await response.json();
      setUsage(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setUsage(null);
    } finally {
      setLoading(false);
    }
  }, [providerId, startDate, endDate]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    usage,
    loading,
    error,
    refresh: fetchUsage
  };
};