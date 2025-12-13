'use client';

/**
 * useAgentDetail Hook
 *
 * Fetches and manages single agent detail data
 * Extracted from agents/[slug]/page.tsx for reusability
 */

import { useState, useEffect, useCallback } from 'react';
import { useAgentsStore, type Agent } from '@/lib/stores/agents-store';

interface UseAgentDetailResult {
  agent: Agent | null;
  relatedAgents: Agent[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Hook for fetching a single agent by slug or ID
 * Also computes related agents based on department/function
 */
export function useAgentDetail(slug: string | undefined): UseAgentDetailResult {
  const { agents, loadAgents, isLoading } = useAgentsStore();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [relatedAgents, setRelatedAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      await loadAgents(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reload agents');
    }
  }, [loadAgents]);

  // Load agents if not already loaded
  useEffect(() => {
    if (agents.length === 0 && !isLoading) {
      loadAgents(false).catch(console.error);
    }
  }, [agents.length, isLoading, loadAgents]);

  // Find agent by slug once agents are loaded
  useEffect(() => {
    if (agents.length > 0 && slug) {
      const foundAgent = agents.find(
        (a: Agent) => (a as any).slug === slug || a.id === slug
      );
      if (foundAgent) {
        setAgent(foundAgent);
        setError(null);
      } else {
        setAgent(null);
        setError('Agent not found');
      }
    }
  }, [agents, slug]);

  // Find related agents based on department/function
  useEffect(() => {
    if (agent && agents.length > 0) {
      const related = agents.filter((a: Agent) => {
        if (a.id === agent.id) return false;
        // Same department or function
        if (
          (agent.department && a.department === agent.department) ||
          (agent.function_name && a.function_name === agent.function_name) ||
          (agent.business_function && a.business_function === agent.business_function)
        ) {
          return true;
        }
        return false;
      });
      setRelatedAgents(related.slice(0, 10));
    } else {
      setRelatedAgents([]);
    }
  }, [agent, agents]);

  return {
    agent,
    relatedAgents,
    loading: isLoading || (agents.length === 0 && !error),
    error,
    reload,
  };
}
