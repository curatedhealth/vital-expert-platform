/**
 * React Hooks for Ask Panel API
 * 
 * Provides React Query hooks for interacting with the Panel API.
 */

'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useTenant } from '@/contexts/tenant-context';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { createClient } from '@/lib/supabase/client';
import {
  createPanelAPIClient,
  PanelAPIClient,
  Panel,
  PanelResponse,
  PanelConsensus,
  CreatePanelRequest,
  ExecutePanelRequest,
  ExecutePanelResponse,
  ListPanelsResponse,
  UsageAnalytics,
  PanelStatus,
  PanelType,
  PanelAPIError,
  // Unified Panel types
  UnifiedPanelAgent,
  UnifiedConsensusResult,
  UnifiedComparisonMatrix,
  UnifiedExpertResponse,
  ExecuteUnifiedPanelRequest,
  ExecuteUnifiedPanelResponse,
  PanelTypeInfo,
} from '@/lib/api/panel-client';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const panelKeys = {
  all: ['panels'] as const,
  lists: () => [...panelKeys.all, 'list'] as const,
  list: (filters: any) => [...panelKeys.lists(), filters] as const,
  details: () => [...panelKeys.all, 'detail'] as const,
  detail: (id: string) => [...panelKeys.details(), id] as const,
  responses: (id: string) => [...panelKeys.detail(id), 'responses'] as const,
  consensus: (id: string) => [...panelKeys.detail(id), 'consensus'] as const,
  analytics: () => ['analytics', 'usage'] as const,
  // Unified Panel keys
  unifiedTypes: () => ['unified-panel', 'types'] as const,
  unifiedHealth: () => ['unified-panel', 'health'] as const,
};

// ============================================================================
// HOOK: USE PANEL API CLIENT
// ============================================================================

/**
 * Get an authenticated Panel API client instance
 */
export function usePanelAPIClient(): PanelAPIClient | null {
  const { tenant } = useTenant();
  const { user } = useAuth();

  const getAccessToken = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }, []);

  return useMemo(() => {
    if (!tenant?.id || !user?.id) {
      return null;
    }

    return createPanelAPIClient(
      tenant.id,
      user.id,
      getAccessToken
    );
  }, [tenant?.id, user?.id, getAccessToken]);
}

// ============================================================================
// HOOK: CREATE PANEL
// ============================================================================

export function useCreatePanel(
  options?: UseMutationOptions<Panel, PanelAPIError, CreatePanelRequest>
) {
  const client = usePanelAPIClient();
  const queryClient = useQueryClient();

  return useMutation<Panel, PanelAPIError, CreatePanelRequest>({
    mutationFn: async (request) => {
      if (!client) {
        throw new PanelAPIError('Panel API client not initialized');
      }
      return client.createPanel(request);
    },
    onSuccess: (data) => {
      // Invalidate panel lists
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
      
      // Optimistically update the list
      queryClient.setQueryData<ListPanelsResponse>(
        panelKeys.list({}),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            panels: [data, ...old.panels],
            total: old.total + 1,
          };
        }
      );
    },
    ...options,
  });
}

// ============================================================================
// HOOK: EXECUTE PANEL
// ============================================================================

export function useExecutePanel(
  panelId: string,
  options?: UseMutationOptions<ExecutePanelResponse, PanelAPIError, ExecutePanelRequest>
) {
  const client = usePanelAPIClient();
  const queryClient = useQueryClient();

  return useMutation<ExecutePanelResponse, PanelAPIError, ExecutePanelRequest>({
    mutationFn: async (request) => {
      if (!client) {
        throw new PanelAPIError('Panel API client not initialized');
      }
      return client.executePanel(panelId, request);
    },
    onSuccess: (data) => {
      // Invalidate panel detail
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      
      // Invalidate responses and consensus
      queryClient.invalidateQueries({ queryKey: panelKeys.responses(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.consensus(panelId) });
      
      // Update panel status in list
      queryClient.setQueryData<ListPanelsResponse>(
        panelKeys.list({}),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            panels: old.panels.map((panel) =>
              panel.id === panelId
                ? { ...panel, status: data.status, completed_at: data.completed_at }
                : panel
            ),
          };
        }
      );
    },
    ...options,
  });
}

// ============================================================================
// HOOK: GET PANEL
// ============================================================================

export function usePanel(
  panelId: string | null,
  options?: Omit<UseQueryOptions<Panel, PanelAPIError>, 'queryKey' | 'queryFn'>
) {
  const client = usePanelAPIClient();

  return useQuery<Panel, PanelAPIError>({
    queryKey: panelKeys.detail(panelId || ''),
    queryFn: async () => {
      if (!client || !panelId) {
        throw new PanelAPIError('Panel API client not initialized or panel ID missing');
      }
      return client.getPanel(panelId);
    },
    enabled: !!client && !!panelId,
    ...options,
  });
}

// ============================================================================
// HOOK: LIST PANELS
// ============================================================================

export interface ListPanelsFilters {
  status?: PanelStatus;
  panel_type?: PanelType;
  limit?: number;
  offset?: number;
}

export function usePanels(
  filters?: ListPanelsFilters,
  options?: Omit<UseQueryOptions<ListPanelsResponse, PanelAPIError>, 'queryKey' | 'queryFn'>
) {
  const client = usePanelAPIClient();

  return useQuery<ListPanelsResponse, PanelAPIError>({
    queryKey: panelKeys.list(filters || {}),
    queryFn: async () => {
      if (!client) {
        throw new PanelAPIError('Panel API client not initialized');
      }
      return client.listPanels(filters);
    },
    enabled: !!client,
    ...options,
  });
}

// ============================================================================
// HOOK: GET PANEL RESPONSES
// ============================================================================

export function usePanelResponses(
  panelId: string | null,
  options?: Omit<UseQueryOptions<PanelResponse[], PanelAPIError>, 'queryKey' | 'queryFn'>
) {
  const client = usePanelAPIClient();

  return useQuery<PanelResponse[], PanelAPIError>({
    queryKey: panelKeys.responses(panelId || ''),
    queryFn: async () => {
      if (!client || !panelId) {
        throw new PanelAPIError('Panel API client not initialized or panel ID missing');
      }
      return client.getPanelResponses(panelId);
    },
    enabled: !!client && !!panelId,
    ...options,
  });
}

// ============================================================================
// HOOK: GET PANEL CONSENSUS
// ============================================================================

export function usePanelConsensus(
  panelId: string | null,
  options?: Omit<UseQueryOptions<PanelConsensus, PanelAPIError>, 'queryKey' | 'queryFn'>
) {
  const client = usePanelAPIClient();

  return useQuery<PanelConsensus, PanelAPIError>({
    queryKey: panelKeys.consensus(panelId || ''),
    queryFn: async () => {
      if (!client || !panelId) {
        throw new PanelAPIError('Panel API client not initialized or panel ID missing');
      }
      return client.getPanelConsensus(panelId);
    },
    enabled: !!client && !!panelId,
    ...options,
  });
}

// ============================================================================
// HOOK: GET USAGE ANALYTICS
// ============================================================================

export interface AnalyticsFilters {
  start_date?: string;
  end_date?: string;
}

export function useUsageAnalytics(
  filters?: AnalyticsFilters,
  options?: Omit<UseQueryOptions<UsageAnalytics, PanelAPIError>, 'queryKey' | 'queryFn'>
) {
  const client = usePanelAPIClient();

  return useQuery<UsageAnalytics, PanelAPIError>({
    queryKey: [...panelKeys.analytics(), filters || {}],
    queryFn: async () => {
      if (!client) {
        throw new PanelAPIError('Panel API client not initialized');
      }
      return client.getUsageAnalytics(filters);
    },
    enabled: !!client,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// HOOK: STREAMING
// ============================================================================

export interface StreamingPanelOptions {
  /** @deprecated Use onAgentStart instead */
  onExpertStart?: (data: { agent_id: string; agent_name: string; /** @deprecated */ expert_id?: string; /** @deprecated */ expert_name?: string }) => void;
  onAgentStart?: (data: { agent_id: string; agent_name: string }) => void;
  onExpertResponse?: (response: PanelResponse) => void;
  onConsensusUpdate?: (data: { consensus_level: number }) => void;
  onComplete?: (data: ExecutePanelResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for streaming panel execution via Server-Sent Events
 */
export function useStreamingPanel(
  panelId: string | null,
  query: string,
  options: StreamingPanelOptions = {}
) {
  const client = usePanelAPIClient();
  const queryClient = useQueryClient();

  const startStreaming = useCallback(() => {
    if (!client || !panelId || !query) {
      options.onError?.(new Error('Client, panel ID, or query missing'));
      return null;
    }

    const eventSource = client.createStreamingConnection(panelId, query);

    eventSource.addEventListener('expert_start', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        options.onExpertStart?.(data);
      } catch (error) {
        console.error('Failed to parse expert_start event:', error);
      }
    });

    eventSource.addEventListener('expert_response', (e) => {
      try {
        const response: PanelResponse = JSON.parse((e as MessageEvent).data);
        options.onExpertResponse?.(response);
      } catch (error) {
        console.error('Failed to parse expert_response event:', error);
      }
    });

    eventSource.addEventListener('consensus_update', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        options.onConsensusUpdate?.(data);
      } catch (error) {
        console.error('Failed to parse consensus_update event:', error);
      }
    });

    eventSource.addEventListener('panel_complete', (e) => {
      try {
        const data: ExecutePanelResponse = JSON.parse((e as MessageEvent).data);
        options.onComplete?.(data);
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
        queryClient.invalidateQueries({ queryKey: panelKeys.responses(panelId) });
        queryClient.invalidateQueries({ queryKey: panelKeys.consensus(panelId) });
        
        eventSource.close();
      } catch (error) {
        console.error('Failed to parse panel_complete event:', error);
      }
    });

    eventSource.addEventListener('error', (e) => {
      console.error('SSE error:', e);
      options.onError?.(new Error('Streaming connection error'));
      eventSource.close();
    });

    return eventSource;
  }, [client, panelId, query, options, queryClient]);

  return { startStreaming };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Get recent panels (last 10, ordered by updated_at)
 */
export function useRecentPanels() {
  return usePanels(
    { limit: 10 },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );
}

/**
 * Get active panels (running or created status)
 */
export function useActivePanels() {
  return usePanels(
    { status: 'running', limit: 10 },
    {
      refetchInterval: 5000, // Refetch every 5 seconds for active panels
    }
  );
}

/**
 * Prefetch panel details for faster navigation
 */
export function usePrefetchPanel() {
  const client = usePanelAPIClient();
  const queryClient = useQueryClient();

  return useCallback(
    (panelId: string) => {
      if (!client) return;

      queryClient.prefetchQuery({
        queryKey: panelKeys.detail(panelId),
        queryFn: () => client.getPanel(panelId),
      });
    },
    [client, queryClient]
  );
}

// ============================================================================
// UNIFIED PANEL HOOKS (All 6 Panel Types)
// ============================================================================

/**
 * Get all supported panel types with descriptions
 */
export function useUnifiedPanelTypes(
  options?: Omit<UseQueryOptions<PanelTypeInfo[], PanelAPIError>, 'queryKey' | 'queryFn'>
) {
  const client = usePanelAPIClient();

  return useQuery<PanelTypeInfo[], PanelAPIError>({
    queryKey: panelKeys.unifiedTypes(),
    queryFn: async () => {
      if (!client) {
        throw new PanelAPIError('Panel API client not initialized');
      }
      return client.getUnifiedPanelTypes();
    },
    enabled: !!client,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes - types don't change often
    ...options,
  });
}

/**
 * Check unified panel service health
 */
export function useUnifiedPanelHealth(
  options?: Omit<UseQueryOptions<{
    status: string;
    service: string;
    panel_types: string[];
    streaming_enabled: boolean;
  }, PanelAPIError>, 'queryKey' | 'queryFn'>
) {
  const client = usePanelAPIClient();

  return useQuery({
    queryKey: panelKeys.unifiedHealth(),
    queryFn: async () => {
      if (!client) {
        throw new PanelAPIError('Panel API client not initialized');
      }
      return client.checkUnifiedPanelHealth();
    },
    enabled: !!client,
    staleTime: 30 * 1000, // Cache for 30 seconds
    ...options,
  });
}

/**
 * Execute a unified panel discussion (synchronous)
 *
 * Supports all 6 panel types:
 * - structured: Sequential moderated discussion
 * - open: Free-form brainstorming (parallel)
 * - socratic: Dialectical questioning
 * - adversarial: Pro/con debate format
 * - delphi: Iterative consensus with voting
 * - hybrid: Human-AI collaborative panels
 */
export function useExecuteUnifiedPanel(
  options?: UseMutationOptions<ExecuteUnifiedPanelResponse, PanelAPIError, ExecuteUnifiedPanelRequest>
) {
  const client = usePanelAPIClient();
  const queryClient = useQueryClient();

  return useMutation<ExecuteUnifiedPanelResponse, PanelAPIError, ExecuteUnifiedPanelRequest>({
    mutationFn: async (request) => {
      if (!client) {
        throw new PanelAPIError('Panel API client not initialized');
      }
      return client.executeUnifiedPanel(request);
    },
    onSuccess: (data) => {
      // Invalidate panel lists
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });

      // Cache the result
      queryClient.setQueryData(
        panelKeys.detail(data.panel_id),
        data
      );
    },
    ...options,
  });
}

/**
 * Streaming callbacks for unified panel execution
 */
export interface UnifiedStreamingCallbacks {
  onPanelStarted?: (data: { panel_id: string; panel_type: string; question: string; agent_count: number }) => void;
  onExpertsLoaded?: (data: { experts: Array<{ id: string; name: string }> }) => void;
  onExpertThinking?: (data: { expert_id: string; expert_name: string; position: number; total: number }) => void;
  onExpertResponse?: (data: { expert_id: string; expert_name: string; content: string; confidence: number }) => void;
  onCalculatingConsensus?: (data: { response_count: number }) => void;
  onConsensusComplete?: (data: Partial<UnifiedConsensusResult>) => void;
  onBuildingMatrix?: (data: Record<string, any>) => void;
  onMatrixComplete?: (data: { aspects: number; overall_consensus: number; synthesis: string }) => void;
  onPanelComplete?: (data: { panel_id: string; status: string; execution_time_ms: number; consensus_score: number; recommendation: string }) => void;
  onError?: (error: { error: string }) => void;
  // Orchestrator callbacks
  onOrchestratorThinking?: (data: { message: string; phase?: string }) => void;
  onOrchestratorMessage?: (data: { message: string; phase?: string; message_type?: string }) => void;
  onOrchestratorDecision?: (data: { message: string; experts?: string[]; rationale?: string[] }) => void;
  onOrchestratorIntervention?: (data: { message: string; reason: string }) => void;
  onTopicAnalysis?: (data: { domain?: string; complexity?: string; focus_areas?: string[]; recommended_approach?: string }) => void;
}

/**
 * Execute a unified panel with streaming
 *
 * Returns a mutation that triggers streaming execution with real-time callbacks.
 */
export function useExecuteUnifiedPanelStreaming(
  callbacks: UnifiedStreamingCallbacks = {}
) {
  const client = usePanelAPIClient();
  const queryClient = useQueryClient();

  return useMutation<void, PanelAPIError, Omit<ExecuteUnifiedPanelRequest, 'save_to_db' | 'generate_matrix'>>({
    mutationFn: async (request) => {
      if (!client) {
        throw new PanelAPIError('Panel API client not initialized');
      }

      await client.executeUnifiedPanelStreaming(request, {
        onPanelStarted: callbacks.onPanelStarted,
        onExpertsLoaded: callbacks.onExpertsLoaded,
        onExpertThinking: callbacks.onExpertThinking,
        onExpertResponse: callbacks.onExpertResponse,
        onCalculatingConsensus: callbacks.onCalculatingConsensus,
        onConsensusComplete: callbacks.onConsensusComplete,
        onBuildingMatrix: callbacks.onBuildingMatrix,
        onMatrixComplete: callbacks.onMatrixComplete,
        onPanelComplete: (data) => {
          callbacks.onPanelComplete?.(data);
          // Invalidate panel lists after completion
          queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
        },
        onError: callbacks.onError,
        // Orchestrator callbacks
        onOrchestratorThinking: callbacks.onOrchestratorThinking,
        onOrchestratorMessage: callbacks.onOrchestratorMessage,
        onOrchestratorDecision: callbacks.onOrchestratorDecision,
        onOrchestratorIntervention: callbacks.onOrchestratorIntervention,
        onTopicAnalysis: callbacks.onTopicAnalysis,
      });
    },
  });
}

// Re-export types for convenience
export type {
  UnifiedPanelAgent,
  UnifiedConsensusResult,
  UnifiedComparisonMatrix,
  UnifiedExpertResponse,
  ExecuteUnifiedPanelRequest,
  ExecuteUnifiedPanelResponse,
  PanelTypeInfo,
};

