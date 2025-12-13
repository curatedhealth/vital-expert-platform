/**
 * React Hooks for Ask Panel API
 * 
 * Provides React Query hooks for interacting with the Panel API.
 */

'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useTenantContext } from '@/contexts/TenantContext';
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
};

// ============================================================================
// HOOK: USE PANEL API CLIENT
// ============================================================================

/**
 * Get an authenticated Panel API client instance
 */
export function usePanelAPIClient(): PanelAPIClient | null {
  const { currentTenant } = useTenantContext();
  const { user } = useAuth();

  const getAccessToken = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }, []);

  return useMemo(() => {
    if (!currentTenant?.id || !user?.id) {
      return null;
    }

    return createPanelAPIClient(
      currentTenant.id,
      user.id,
      getAccessToken
    );
  }, [currentTenant?.id, user?.id, getAccessToken]);
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

