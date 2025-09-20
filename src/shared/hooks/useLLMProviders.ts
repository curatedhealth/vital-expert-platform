import { useState, useEffect, useCallback } from 'react';
import {
  LLMProvider,
  ProviderFilters,
  ProviderSort,
  ProviderListResponse,
  LLMProviderConfig,
  ProviderSelectionCriteria,
  ProviderRecommendation,
  LLMProviderMetrics,
  ProviderStatus
} from '@/types/llm-provider.types';
import { llmProviderService } from '@/services/llm-provider.service';

interface UseLLMProvidersState {
  providers: LLMProvider[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasNextPage: boolean;
  page: number;
}

interface UseLLMProvidersReturn extends UseLLMProvidersState {
  refreshProviders: () => Promise<void>;
  loadProviders: (filters?: ProviderFilters, sort?: ProviderSort, page?: number) => Promise<void>;
  createProvider: (config: LLMProviderConfig) => Promise<string>;
  updateProvider: (id: string, updates: Partial<LLMProviderConfig>) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  testProviderHealth: (id: string) => Promise<boolean>;
  getOptimalProvider: (criteria: ProviderSelectionCriteria) => Promise<ProviderRecommendation | null>;
  getProviderMetrics: (id: string, period?: string) => Promise<LLMProviderMetrics>;
}

export const useLLMProviders = (
  initialFilters?: ProviderFilters,
  initialSort?: ProviderSort,
  pageSize: number = 20
): UseLLMProvidersReturn => {
  const [state, setState] = useState<UseLLMProvidersState>({
    providers: [],
    loading: false,
    error: null,
    totalCount: 0,
    hasNextPage: false,
    page: 1
  });

  const [filters, setFilters] = useState<ProviderFilters>(initialFilters || {});
  const [sort, setSort] = useState<ProviderSort | undefined>(initialSort);

  // Load providers from service
  const loadProviders = useCallback(async (
    newFilters?: ProviderFilters,
    newSort?: ProviderSort,
    newPage: number = 1
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const filtersToUse = newFilters || filters;
      const sortToUse = newSort || sort;

      if (newFilters) setFilters(newFilters);
      if (newSort) setSort(newSort);

      const response: ProviderListResponse = await llmProviderService.listProviders(
        filtersToUse,
        sortToUse,
        newPage,
        pageSize
      );

      setState(prev => ({
        ...prev,
        providers: response.providers,
        totalCount: response.total_count,
        hasNextPage: response.has_next_page,
        page: newPage,
        loading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load providers'
      }));
    }
  }, [filters, sort, pageSize]);

  // Refresh current providers
  const refreshProviders = useCallback(async () => {
    await loadProviders(filters, sort, state.page);
  }, [loadProviders, filters, sort, state.page]);

  // Create a new provider
  const createProvider = useCallback(async (config: LLMProviderConfig): Promise<string> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const providerId = await llmProviderService.createProvider(config);

      // Refresh the list to include the new provider
      await refreshProviders();

      return providerId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create provider';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, [refreshProviders]);

  // Update an existing provider
  const updateProvider = useCallback(async (
    id: string,
    updates: Partial<LLMProviderConfig>
  ): Promise<void> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      await llmProviderService.updateProvider(id, updates);

      // Update the provider in the local state
      setState(prev => ({
        ...prev,
        providers: prev.providers.map(provider =>
          provider.id === id
            ? { ...provider, ...updates, updated_at: new Date() } as LLMProvider
            : provider
        )
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update provider';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, []);

  // Delete a provider
  const deleteProvider = useCallback(async (id: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      await llmProviderService.deleteProvider(id);

      // Remove the provider from local state
      setState(prev => ({
        ...prev,
        providers: prev.providers.filter(provider => provider.id !== id),
        totalCount: prev.totalCount - 1
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete provider';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, []);

  // Test provider health
  const testProviderHealth = useCallback(async (id: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const provider = state.providers.find(p => p.id === id);

      if (!provider) {
        throw new Error('Provider not found');
      }

      const isHealthy = await llmProviderService.testProviderHealth(provider);

      // Update provider status in local state
      setState(prev => ({
        ...prev,
        providers: prev.providers.map(p =>
          p.id === id
            ? {
                ...p,
                status: isHealthy ? ProviderStatus.ACTIVE : ProviderStatus.ERROR,
                uptime_percentage: isHealthy ? Math.min(p.uptime_percentage + 1, 100) : Math.max(p.uptime_percentage - 5, 0)
              } as LLMProvider
            : p
        )
      }));

      return isHealthy;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Health check failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, [state.providers]);

  // Get optimal provider based on criteria
  const getOptimalProvider = useCallback(async (
    criteria: ProviderSelectionCriteria
  ): Promise<ProviderRecommendation | null> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      return await llmProviderService.selectOptimalProvider(criteria);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get optimal provider';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, []);

  // Get provider metrics
  const getProviderMetrics = useCallback(async (
    id: string,
    period: string = '24h'
  ): Promise<LLMProviderMetrics> => {
    try {
      setState(prev => ({ ...prev, error: null }));

      // In a real implementation, this would call the service method
      // For now, return mock metrics
      const mockMetrics: LLMProviderMetrics = {
        id: `metrics-${id}`,
        provider_id: id,
        metric_date: new Date(),
        total_requests: Math.floor(Math.random() * 1000),
        successful_requests: Math.floor(Math.random() * 900),
        failed_requests: Math.floor(Math.random() * 100),
        cancelled_requests: Math.floor(Math.random() * 10),
        total_input_tokens: Math.floor(Math.random() * 100000),
        total_output_tokens: Math.floor(Math.random() * 50000),
        total_tokens: 0, // Will be calculated
        total_cost: Math.random() * 100,
        avg_cost_per_request: Math.random() * 0.1,
        avg_latency_ms: Math.random() * 2000,
        p50_latency_ms: Math.random() * 1500,
        p95_latency_ms: Math.random() * 3000,
        p99_latency_ms: Math.random() * 5000,
        max_latency_ms: Math.floor(Math.random() * 10000),
        avg_confidence_score: 0.8 + Math.random() * 0.2,
        avg_medical_accuracy: 85 + Math.random() * 15,
        error_rate: Math.random() * 5,
        timeout_count: Math.floor(Math.random() * 10),
        rate_limit_count: Math.floor(Math.random() * 5),
        auth_error_count: Math.floor(Math.random() * 3),
        server_error_count: Math.floor(Math.random() * 5),
        health_check_success_rate: 90 + Math.random() * 10,
        uptime_minutes: 1400 + Math.floor(Math.random() * 40),
        unique_users_count: Math.floor(Math.random() * 50),
        unique_agents_count: Math.floor(Math.random() * 10),
        peak_concurrent_requests: Math.floor(Math.random() * 20),
        phi_requests_count: Math.floor(Math.random() * 50),
        clinical_validations_passed: Math.floor(Math.random() * 30),
        clinical_validations_failed: Math.floor(Math.random() * 5),
        created_at: new Date()
      };

      return mockMetrics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get provider metrics';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, []);

  // Load providers on mount
  useEffect(() => {
    loadProviders();
  }, []);

  // Clear error after some time
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  return {
    ...state,
    refreshProviders,
    loadProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    testProviderHealth,
    getOptimalProvider,
    getProviderMetrics
  };
};

// Specialized hook for provider selection
export const useProviderSelection = () => {
  const [recommendations, setRecommendations] = useState<ProviderRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = useCallback(async (criteria: ProviderSelectionCriteria) => {
    try {
      setLoading(true);
      setError(null);

      const recommendation = await llmProviderService.selectOptimalProvider(criteria);
      setRecommendations(recommendation ? [recommendation] : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recommendations,
    loading,
    error,
    getRecommendations
  };
};

// Hook for real-time provider monitoring
export const useProviderMonitoring = (providerIds: string[], refreshInterval: number = 30000) => {
  const [healthStatuses, setHealthStatuses] = useState<Record<string, boolean>>({});
  const [metrics, setMetrics] = useState<Record<string, LLMProviderMetrics>>({});
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const updateHealthStatuses = useCallback(async () => {
    try {
      const promises = providerIds.map(async (id) => {
        const provider = await llmProviderService.getProvider(id);
        if (provider) {
          const isHealthy = await llmProviderService.testProviderHealth(provider);
          return { id, isHealthy };
        }
        return { id, isHealthy: false };
      });

      const results = await Promise.all(promises);
      const newStatuses: Record<string, boolean> = {};

      results.forEach(({ id, isHealthy }) => {
        newStatuses[id] = isHealthy;
      });

      setHealthStatuses(newStatuses);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to update health statuses:', error);
    }
  }, [providerIds]);

  useEffect(() => {
    if (providerIds.length > 0) {
      updateHealthStatuses();

      const interval = setInterval(updateHealthStatuses, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [providerIds, refreshInterval, updateHealthStatuses]);

  return {
    healthStatuses,
    metrics,
    lastUpdate,
    updateHealthStatuses
  };
};

export default useLLMProviders;