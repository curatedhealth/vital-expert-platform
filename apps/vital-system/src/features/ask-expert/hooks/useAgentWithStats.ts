/**
 * React Hook for Agent with Statistics
 * 
 * Fetches agent data from store and loads statistics from API
 * Provides loading states and error handling
 */

import { useState, useEffect } from 'react';
import { useAgentsStore, AgentStats } from '@/lib/stores/agents-store';
import type { AgentFeedbackFact } from '@/lib/stores/agents-store';

export interface UseAgentWithStatsReturn {
  agent: ReturnType<typeof useAgentsStore.getState>['agents'][0] | null;
  stats: AgentStats | null;
  isLoadingStats: boolean;
  error: string | null;
  memory: LongTermMemory | null;
  isLoadingMemory: boolean;
  memoryError: string | null;
  refresh: () => Promise<void>;
}

interface LongTermMemory {
  history: Array<{
    userMessage: string;
    assistantMessage: string;
    timestamp: string;
  }>;
  facts: AgentFeedbackFact[];
}

/**
 * Hook to fetch agent with statistics
 */
export function useAgentWithStats(agentId: string | null, userId?: string | null): UseAgentWithStatsReturn {
  const getAgentById = useAgentsStore(state => state.getAgentById);
  const loadAgentStats = useAgentsStore(state => state.loadAgentStats);
  
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memory, setMemory] = useState<LongTermMemory | null>(null);
  const [isLoadingMemory, setIsLoadingMemory] = useState(false);
  const [memoryError, setMemoryError] = useState<string | null>(null);

  const agent = agentId ? getAgentById(agentId) : null;

  // Load stats whenever agent changes
  useEffect(() => {
    if (!agentId) {
      setStats(null);
      setError(null);
      return;
    }

    loadStats();
  }, [agentId]);

  // Load memory only when both agent and user are available
  useEffect(() => {
    if (!agentId || !userId) {
      setMemory(null);
      setMemoryError(null);
      return;
    }

    loadMemory();
  }, [agentId, userId]);

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

  const loadMemory = async () => {
    if (!agentId || !userId) return;

    setIsLoadingMemory(true);
    setMemoryError(null);
    try {
      const response = await fetch(
        `/api/memory/long-term?userId=${encodeURIComponent(userId)}&agentId=${encodeURIComponent(agentId)}`
      );
      if (!response.ok) {
        throw new Error('Failed to retrieve long-term memory');
      }

      const payload = await response.json();
      if (payload.success) {
        setMemory({
          history: Array.isArray(payload.memory?.history) ? payload.memory.history : [],
          facts: Array.isArray(payload.facts) ? payload.facts : [],
        });
      } else {
        setMemoryError(payload.error || 'Failed to retrieve long-term memory');
      }
    } catch (err) {
      setMemoryError(err instanceof Error ? err.message : 'Failed to retrieve long-term memory');
      setMemory(null);
    } finally {
      setIsLoadingMemory(false);
    }
  };

  const refresh = async () => {
    await Promise.allSettled([
      loadStats(),
      userId ? loadMemory() : Promise.resolve(),
    ]);
  };

  return {
    agent,
    stats,
    isLoadingStats,
    error,
    memory,
    isLoadingMemory,
    memoryError,
    refresh,
  };
}
