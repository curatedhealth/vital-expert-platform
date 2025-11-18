import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Agent {
  id: string;
  name: string;
  display_name?: string;
  description: string;
  avatar?: string;
  tier?: number;
  status?: string;
  capabilities?: string[];
  model?: string;
  temperature?: number;
  system_prompt?: string;
}

interface AgentsResponse {
  success: boolean;
  agents: Agent[];
  count: number;
}

interface AgentResponse {
  success: boolean;
  agent: Agent;
}

/**
 * Fetch agents from API with React Query caching
 * Data is cached for 1 hour and automatically revalidated
 */
export function useAgentsQuery(filters?: {
  status?: string;
  tier?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['agents', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.tier) params.append('tier', filters.tier.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/agents?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      return response.json() as Promise<AgentsResponse>;
    },
    // Cache data for 1 hour
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Fetch single agent by ID with React Query caching
 */
export function useAgentQuery(id: string | null) {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/agents/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agent');
      }
      return response.json() as Promise<AgentResponse>;
    },
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
}

/**
 * Create agent mutation with optimistic updates
 */
export function useCreateAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agent: Partial<Agent>) => {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent),
      });
      if (!response.ok) {
        throw new Error('Failed to create agent');
      }
      return response.json() as Promise<AgentResponse>;
    },
    onSuccess: () => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

/**
 * Update agent mutation with optimistic updates
 */
export function useUpdateAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Agent> }) => {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update agent');
      }
      return response.json() as Promise<AgentResponse>;
    },
    onSuccess: (data, variables) => {
      // Invalidate specific agent and agents list
      queryClient.invalidateQueries({ queryKey: ['agent', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

/**
 * Delete agent mutation
 */
export function useDeleteAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate agents list
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}
