/**
 * Agent Store (Zustand)
 * Central state management for agents feature
 *
 * @see https://github.com/pmndrs/zustand
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Agent,
  AgentFilters,
  AgentStoreState,
  AgentLevelNumber,
  AgentSortOption,
} from '../types/agent.types';

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

interface AgentStore extends AgentStoreState {
  // State
  agents: Agent[];
  filteredAgents: Agent[];
  selectedAgent: Agent | null;
  filters: AgentFilters;
  viewMode: 'grid' | 'list' | 'kanban';
  loading: boolean;
  error: Error | null;

  // Actions
  setAgents: (agents: Agent[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  selectAgent: (agent: Agent | null) => void;
  updateFilters: (filters: Partial<AgentFilters>) => void;
  resetFilters: () => void;
  setViewMode: (mode: 'grid' | 'list' | 'kanban') => void;

  // Computed
  getAgentById: (id: string) => Agent | undefined;
  getAgentsByLevel: (level: AgentLevelNumber) => Agent[];
  getAgentCountsByLevel: () => Record<AgentLevelNumber, number>;
  getAgentsByStatus: (status: string) => Agent[];
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

const DEFAULT_FILTERS: AgentFilters = {
  levels: undefined,
  functions: undefined,
  departments: undefined,
  roles: undefined,
  status: 'all',
  is_featured: undefined,
  search: '',
  sort: 'name',
  order: 'asc',
  page: 1,
  pageSize: 50,
};

// ============================================================================
// FILTERING LOGIC
// ============================================================================

/**
 * Apply filters to agents array
 */
const filterAgents = (agents: Agent[], filters: AgentFilters): Agent[] => {
  let filtered = [...agents];

  // Filter by search term (name, description, function, department, role)
  if (filters.search && filters.search.trim() !== '') {
    const searchLower = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchLower) ||
        agent.description?.toLowerCase().includes(searchLower) ||
        agent.function_name?.toLowerCase().includes(searchLower) ||
        agent.department_name?.toLowerCase().includes(searchLower) ||
        agent.role_name?.toLowerCase().includes(searchLower) ||
        agent.tagline?.toLowerCase().includes(searchLower)
    );
  }

  // Filter by levels
  if (filters.levels && filters.levels.length > 0) {
    filtered = filtered.filter((agent) => {
      const agentLevel = agent.agent_levels?.level_number;
      return agentLevel && filters.levels?.includes(agentLevel);
    });
  }

  // Filter by functions
  if (filters.functions && filters.functions.length > 0) {
    filtered = filtered.filter((agent) =>
      agent.function_name
        ? filters.functions?.includes(agent.function_name)
        : false
    );
  }

  // Filter by departments
  if (filters.departments && filters.departments.length > 0) {
    filtered = filtered.filter((agent) =>
      agent.department_name
        ? filters.departments?.includes(agent.department_name)
        : false
    );
  }

  // Filter by roles
  if (filters.roles && filters.roles.length > 0) {
    filtered = filtered.filter((agent) =>
      agent.role_name ? filters.roles?.includes(agent.role_name) : false
    );
  }

  // Filter by status
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((agent) => agent.status === filters.status);
  }

  // Filter by featured
  if (filters.is_featured !== undefined) {
    // This would need to come from tenant_agents junction table
    // For now, we'll skip this filter
    // TODO: Implement featured filtering when we have tenant context
  }

  // Sort agents
  filtered = sortAgents(filtered, filters.sort, filters.order);

  return filtered;
};

/**
 * Sort agents by specified field and order
 */
const sortAgents = (
  agents: Agent[],
  sort?: AgentSortOption,
  order: 'asc' | 'desc' = 'asc'
): Agent[] => {
  const sorted = [...agents];

  const compareFunc = (a: Agent, b: Agent): number => {
    let aValue: any;
    let bValue: any;

    switch (sort) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'level':
        aValue = a.agent_levels?.level_number || 999;
        bValue = b.agent_levels?.level_number || 999;
        break;
      case 'function':
        aValue = a.function_name?.toLowerCase() || '';
        bValue = b.function_name?.toLowerCase() || '';
        break;
      case 'department':
        aValue = a.department_name?.toLowerCase() || '';
        bValue = b.department_name?.toLowerCase() || '';
        break;
      case 'created':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'updated':
        aValue = new Date(a.updated_at).getTime();
        bValue = new Date(b.updated_at).getTime();
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  };

  return sorted.sort(compareFunc);
};

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useAgentStore = create<AgentStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        agents: [],
        filteredAgents: [],
        selectedAgent: null,
        filters: DEFAULT_FILTERS,
        viewMode: 'grid',
        loading: false,
        error: null,

        // Actions
        setAgents: (agents: Agent[]) => {
          set({ agents });
          // Reapply filters with new agents
          const { filters } = get();
          const filteredAgents = filterAgents(agents, filters);
          set({ filteredAgents });
        },

        setLoading: (loading: boolean) => {
          set({ loading });
        },

        setError: (error: Error | null) => {
          set({ error, loading: false });
        },

        selectAgent: (agent: Agent | null) => {
          set({ selectedAgent: agent });
        },

        updateFilters: (newFilters: Partial<AgentFilters>) => {
          const { filters, agents } = get();
          const updatedFilters = { ...filters, ...newFilters };
          const filteredAgents = filterAgents(agents, updatedFilters);
          set({ filters: updatedFilters, filteredAgents });
        },

        resetFilters: () => {
          const { agents } = get();
          const filteredAgents = filterAgents(agents, DEFAULT_FILTERS);
          set({ filters: DEFAULT_FILTERS, filteredAgents });
        },

        setViewMode: (mode: 'grid' | 'list' | 'kanban') => {
          set({ viewMode: mode });
        },

        // Computed Getters
        getAgentById: (id: string) => {
          return get().agents.find((agent) => agent.id === id);
        },

        getAgentsByLevel: (level: AgentLevelNumber) => {
          return get().agents.filter(
            (agent) => agent.agent_levels?.level_number === level
          );
        },

        getAgentCountsByLevel: () => {
          const agents = get().agents;
          const counts: Record<AgentLevelNumber, number> = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          };

          agents.forEach((agent) => {
            const level = agent.agent_levels?.level_number;
            if (level && level >= 1 && level <= 5) {
              counts[level]++;
            }
          });

          return counts;
        },

        getAgentsByStatus: (status: string) => {
          return get().agents.filter((agent) => agent.status === status);
        },
      }),
      {
        name: 'vital-agent-store',
        // Only persist filters and viewMode, not agents data
        partialize: (state) => ({
          filters: state.filters,
          viewMode: state.viewMode,
        }),
      }
    ),
    {
      name: 'AgentStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================================================
// SELECTORS (For optimal re-render performance)
// ============================================================================

/**
 * Select only filtered agents (avoids re-render when other state changes)
 */
export const useFilteredAgents = () =>
  useAgentStore((state) => state.filteredAgents);

/**
 * Select only selected agent
 */
export const useSelectedAgent = () =>
  useAgentStore((state) => state.selectedAgent);

/**
 * Select only filters
 */
export const useFilters = () => useAgentStore((state) => state.filters);

/**
 * Select only view mode
 */
export const useViewMode = () => useAgentStore((state) => state.viewMode);

/**
 * Select loading state
 */
export const useAgentLoading = () => useAgentStore((state) => state.loading);

/**
 * Select error state
 */
export const useAgentError = () => useAgentStore((state) => state.error);

/**
 * Select agent counts by level
 */
export const useAgentCountsByLevel = () =>
  useAgentStore((state) => state.getAgentCountsByLevel());

// ============================================================================
// EXPORTS
// ============================================================================

export default useAgentStore;
