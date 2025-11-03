/**
 * React Hook for Panel API Operations
 * 
 * Provides React Query hooks for all panel API operations.
 * Replaces direct Supabase calls with REST API calls to ai-engine.
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useTenant } from './use-tenant';
import { useAuth } from './use-auth';
import { createPanelAPIClient, APIError } from '@/lib/api/panel-client';
import type { 
  CreatePanelRequest,
  ExecutePanelResponse,
  ListPanelsResponse 
} from '@/lib/api/panel-client';
import type { Panel, PanelStatus } from '@/types/database.types';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Fetch a single panel by ID
 */
export function usePanel(panelId: string | null): UseQueryResult<Panel, APIError> {
  const { tenantId } = useTenant();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['panel', tenantId, panelId],
    queryFn: async () => {
      if (!tenantId || !panelId) {
        throw new Error('Tenant ID and Panel ID required');
      }

      const client = createPanelAPIClient(tenantId, user?.id);
      return client.getPanel(panelId);
    },
    enabled: !!tenantId && !!panelId,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
}

/**
 * List panels with optional filtering
 */
export function usePanels(
  page: number = 1,
  pageSize: number = 20,
  status?: PanelStatus
): UseQueryResult<ListPanelsResponse, APIError> {
  const { tenantId } = useTenant();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['panels', tenantId, page, pageSize, status],
    queryFn: async () => {
      if (!tenantId) {
        throw new Error('Tenant ID required');
      }

      const client = createPanelAPIClient(tenantId, user?.id);
      return client.listPanels({ page, page_size: pageSize, status });
    },
    enabled: !!tenantId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
}

/**
 * Fetch panel responses
 */
export function usePanelResponses(panelId: string | null): UseQueryResult<any, APIError> {
  const { tenantId } = useTenant();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['panelResponses', tenantId, panelId],
    queryFn: async () => {
      if (!tenantId || !panelId) {
        throw new Error('Tenant ID and Panel ID required');
      }

      const client = createPanelAPIClient(tenantId, user?.id);
      return client.getPanelResponses(panelId);
    },
    enabled: !!tenantId && !!panelId,
    staleTime: 10 * 1000, // 10 seconds
    retry: 2,
  });
}

/**
 * Fetch panel consensus
 */
export function usePanelConsensus(panelId: string | null): UseQueryResult<any, APIError> {
  const { tenantId } = useTenant();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['panelConsensus', tenantId, panelId],
    queryFn: async () => {
      if (!tenantId || !panelId) {
        throw new Error('Tenant ID and Panel ID required');
      }

      const client = createPanelAPIClient(tenantId, user?.id);
      return client.getPanelConsensus(panelId);
    },
    enabled: !!tenantId && !!panelId,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create a new panel
 */
export function useCreatePanel(): UseMutationResult<Panel, APIError, CreatePanelRequest> {
  const { tenantId } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreatePanelRequest) => {
      if (!tenantId || !user?.id) {
        throw new Error('Authentication required');
      }

      const client = createPanelAPIClient(tenantId, user.id);
      return client.createPanel(request);
    },
    onSuccess: () => {
      // Invalidate panels list to refetch
      queryClient.invalidateQueries({ queryKey: ['panels', tenantId] });
    },
  });
}

/**
 * Execute a panel (start the workflow)
 */
export function useExecutePanel(): UseMutationResult<ExecutePanelResponse, APIError, string> {
  const { tenantId } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (panelId: string) => {
      if (!tenantId || !user?.id) {
        throw new Error('Authentication required');
      }

      const client = createPanelAPIClient(tenantId, user.id);
      return client.executePanel(panelId);
    },
    onSuccess: (_, panelId) => {
      // Invalidate specific panel and panels list
      queryClient.invalidateQueries({ queryKey: ['panel', tenantId, panelId] });
      queryClient.invalidateQueries({ queryKey: ['panels', tenantId] });
    },
  });
}

// ============================================================================
// COMBINED OPERATIONS
// ============================================================================

/**
 * Create and immediately execute a panel
 */
export function useCreateAndExecutePanel() {
  const createPanel = useCreatePanel();
  const executePanel = useExecutePanel();

  return useMutation({
    mutationFn: async (request: CreatePanelRequest) => {
      // First create the panel
      const panel = await createPanel.mutateAsync(request);
      
      // Then execute it
      const execution = await executePanel.mutateAsync(panel.id);
      
      return { panel, execution };
    },
  });
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Get SSE stream URL for a panel
 */
export function usePanelStreamURL(panelId: string | null): string | null {
  const { tenantId } = useTenant();
  const { user } = useAuth();

  if (!tenantId || !panelId) return null;

  const client = createPanelAPIClient(tenantId, user?.id);
  return client.getStreamURL(panelId);
}

/**
 * Check if panel can be executed
 */
export function useCanExecutePanel(panel: Panel | null): boolean {
  if (!panel) return false;
  
  // Can execute if status is 'created'
  return panel.status === 'created';
}

/**
 * Check if panel is currently running
 */
export function usePanelIsRunning(panel: Panel | null): boolean {
  if (!panel) return false;
  
  return panel.status === 'running';
}

/**
 * Check if panel is completed
 */
export function usePanelIsCompleted(panel: Panel | null): boolean {
  if (!panel) return false;
  
  return panel.status === 'completed';
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  Panel,
  PanelStatus,
  CreatePanelRequest,
  ExecutePanelResponse,
  ListPanelsResponse,
  APIError,
};

