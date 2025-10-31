/**
 * React Hook for Agent with Statistics
 * 
 * Fetches agent data from store and loads statistics from API
 * Provides loading states and error handling
 */

import { useState, useEffect } from 'react';
import { useAgentsStore, AgentStats, AgentWithStats } from '@/lib/stores/agents-store';

export interface UseAgentWithStatsReturn {
  agent: ReturnType<typeof useAgentsStore.getState>['agents'][0] | null;
  stats: AgentStats | null;
  isLoadingStats: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

/**
 * Hook to fetch agent with statistics
 */
export function useAgentWithStats(agentId: string | null): UseAgentWithStatsReturn {
  const getAgentById = useAgentsStore(state => state.getAgentById);
  const loadAgentStats = useAgentsStore(state => state.loadAgentStats);
  
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agent = agentId ? getAgentById(agentId) : null;

  // Load stats when agent changes
  useEffect(() => {
    if (agentId) {
      loadStats();
    } else {
      setStats(null);
      setError(null);
    }
  }, [agentId]);

  const loadStats = async () => {
    if (!agentId) return;

    setIsLoadingStats(true);
    setError(null);

    try {
      const loadedStats = await loadAgentStats(agentId);
      if (loadedStats) {
        setStats(loadedStats);
      } else {
        setError('Failed to load agent statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
      setStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const refreshStats = async () => {
    await loadStats();
  };

  return {
    agent,
    stats,
    isLoadingStats,
    error,
    refreshStats,
  };
}

