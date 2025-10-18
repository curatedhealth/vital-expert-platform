'use client';

import { useState, useCallback } from 'react';

interface Agent {
  id: string;
  name: string;
  domain: string;
  tier: string;
  capabilities: string[];
  description: string;
  business_function?: string;
  performance_score?: number;
}

interface AgentSearchFilters {
  domains?: string[];
  tiers?: string[];
  capabilities?: string[];
  business_functions?: string[];
  search_query?: string;
  limit?: number;
}

export function useAgentSelection() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAgents = useCallback(async (filters: AgentSearchFilters = {}): Promise<Agent[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ask-expert/modes/agents/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`Failed to search agents: ${response.statusText}`);
      }

      const data = await response.json();
      const agentList = data.agents || [];
      setAgents(agentList);
      return agentList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search agents';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAgentDetails = useCallback(async (agentId: string): Promise<Agent | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/ask-expert/modes/agents/${agentId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get agent details: ${response.statusText}`);
      }

      const agent = await response.json();
      return agent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get agent details';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectAgent = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAgent(null);
  }, []);

  const getAgentsByDomain = useCallback(async (domain: string): Promise<Agent[]> => {
    return searchAgents({ domains: [domain] });
  }, [searchAgents]);

  const getAgentsByTier = useCallback(async (tier: string): Promise<Agent[]> => {
    return searchAgents({ tiers: [tier] });
  }, [searchAgents]);

  const getAgentsByCapability = useCallback(async (capability: string): Promise<Agent[]> => {
    return searchAgents({ capabilities: [capability] });
  }, [searchAgents]);

  const searchAgentsByQuery = useCallback(async (query: string, limit: number = 20): Promise<Agent[]> => {
    return searchAgents({ search_query: query, limit });
  }, [searchAgents]);

  const getTopAgents = useCallback(async (limit: number = 10): Promise<Agent[]> => {
    return searchAgents({ limit });
  }, [searchAgents]);

  const getAgentsByBusinessFunction = useCallback(async (businessFunction: string): Promise<Agent[]> => {
    return searchAgents({ business_functions: [businessFunction] });
  }, [searchAgents]);

  const filterAgents = useCallback((filters: Partial<AgentSearchFilters>): Agent[] => {
    let filtered = [...agents];

    if (filters.domains && filters.domains.length > 0) {
      filtered = filtered.filter(agent => 
        filters.domains!.includes(agent.domain)
      );
    }

    if (filters.tiers && filters.tiers.length > 0) {
      filtered = filtered.filter(agent => 
        filters.tiers!.includes(agent.tier)
      );
    }

    if (filters.capabilities && filters.capabilities.length > 0) {
      filtered = filtered.filter(agent => 
        agent.capabilities.some(cap => 
          filters.capabilities!.some(filterCap => 
            cap.toLowerCase().includes(filterCap.toLowerCase())
          )
        )
      );
    }

    if (filters.business_functions && filters.business_functions.length > 0) {
      filtered = filtered.filter(agent => 
        agent.business_function && 
        filters.business_functions!.includes(agent.business_function)
      );
    }

    if (filters.search_query) {
      const query = filters.search_query.toLowerCase();
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(query))
      );
    }

    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }, [agents]);

  const getAgentStatistics = useCallback(async (agentId: string): Promise<any> => {
    try {
      const response = await fetch(`/api/ask-expert/modes/agents/${agentId}/stats`);

      if (!response.ok) {
        throw new Error(`Failed to get agent statistics: ${response.statusText}`);
      }

      const stats = await response.json();
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get agent statistics';
      setError(errorMessage);
      return null;
    }
  }, []);

  const addToFavorites = useCallback(async (agentId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/ask-expert/modes/agents/${agentId}/favorite`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to add to favorites: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to favorites';
      setError(errorMessage);
      return false;
    }
  }, []);

  const removeFromFavorites = useCallback(async (agentId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/ask-expert/modes/agents/${agentId}/favorite`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to remove from favorites: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove from favorites';
      setError(errorMessage);
      return false;
    }
  }, []);

  const getFavorites = useCallback(async (): Promise<Agent[]> => {
    try {
      const response = await fetch('/api/ask-expert/modes/agents/favorites');

      if (!response.ok) {
        throw new Error(`Failed to get favorites: ${response.statusText}`);
      }

      const data = await response.json();
      return data.agents || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get favorites';
      setError(errorMessage);
      return [];
    }
  }, []);

  const getRecentAgents = useCallback(async (limit: number = 10): Promise<Agent[]> => {
    try {
      const response = await fetch(`/api/ask-expert/modes/agents/recent?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`Failed to get recent agents: ${response.statusText}`);
      }

      const data = await response.json();
      return data.agents || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recent agents';
      setError(errorMessage);
      return [];
    }
  }, []);

  return {
    selectedAgent,
    agents,
    isLoading,
    error,
    searchAgents,
    getAgentDetails,
    selectAgent,
    setSelectedAgent,
    clearSelection,
    getAgentsByDomain,
    getAgentsByTier,
    getAgentsByCapability,
    searchAgentsByQuery,
    getTopAgents,
    getAgentsByBusinessFunction,
    filterAgents,
    getAgentStatistics,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    getRecentAgents,
  };
}
