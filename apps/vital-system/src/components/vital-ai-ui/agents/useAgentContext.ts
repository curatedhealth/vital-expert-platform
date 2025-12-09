'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  ContextRegion,
  ContextDomain,
  ContextTherapeuticArea,
  ContextPhase,
  SelectedContext,
} from './VitalAgentContextSelector';

/**
 * Personality Type from API
 */
export interface PersonalityType {
  id: string;
  slug: string;
  display_name: string;
  description?: string;
  temperature: number;
  icon?: string;
  color?: string;
  category: string;
}

/**
 * All context lookups from /api/agents/context/all-lookups
 */
export interface AllContextLookups {
  personality_types: PersonalityType[];
  regions: ContextRegion[];
  domains: ContextDomain[];
  therapeutic_areas: ContextTherapeuticArea[];
  phases: ContextPhase[];
  timestamp: string;
}

/**
 * Instantiated agent response from /api/agents/sessions/instantiate
 */
export interface InstantiatedAgent {
  session_id: string;
  agent_id: string;
  agent_name: string;
  agent_display_name?: string;
  resolved_context: {
    region?: { code: string; name: string };
    domain?: { code: string; name: string };
    therapeutic_area?: { code: string; name: string };
    phase?: { code: string; name: string };
  };
  personality: {
    slug?: string;
    display_name?: string;
    temperature?: number;
    verbosity_level?: number;
    formality_level?: number;
    directness_level?: number;
    reasoning_approach?: string;
    tone_keywords?: string[];
  };
  llm_config: {
    temperature: number;
    max_tokens: number;
    model: string;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
  system_prompt?: string;
}

/**
 * Session response from /api/agents/sessions
 */
export interface AgentSession {
  id: string;
  agent_id: string;
  user_id: string;
  tenant_id: string;
  context_region_id?: string;
  context_domain_id?: string;
  context_therapeutic_area_id?: string;
  context_phase_id?: string;
  personality_type_id?: string;
  session_name?: string;
  session_mode: 'interactive' | 'autonomous' | 'batch';
  status: 'active' | 'paused' | 'expired' | 'completed' | 'error';
  started_at?: string;
  expires_at?: string;
  last_activity_at?: string;
  query_count: number;
  total_tokens_used: number;
  total_cost_usd: number;
}

interface UseAgentContextOptions {
  baseUrl?: string;
  autoFetch?: boolean;
}

interface UseAgentContextReturn {
  // Data
  lookups: AllContextLookups | null;
  personalityTypes: PersonalityType[];
  regions: ContextRegion[];
  domains: ContextDomain[];
  therapeuticAreas: ContextTherapeuticArea[];
  phases: ContextPhase[];
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLookups: () => Promise<void>;
  instantiateAgent: (params: InstantiateAgentParams) => Promise<InstantiatedAgent>;
  createSession: (params: CreateSessionParams) => Promise<AgentSession>;
  getActiveSessions: (userId: string) => Promise<AgentSession[]>;
  updateSessionMetrics: (sessionId: string, metrics: SessionMetrics) => Promise<void>;
  completeSession: (sessionId: string) => Promise<void>;
}

interface InstantiateAgentParams {
  agentId: string;
  userId: string;
  tenantId: string;
  regionId?: string;
  domainId?: string;
  therapeuticAreaId?: string;
  phaseId?: string;
  personalityTypeId?: string;
  sessionMode?: 'interactive' | 'autonomous' | 'batch';
  expiresInHours?: number;
}

interface CreateSessionParams {
  agentId: string;
  userId: string;
  tenantId: string;
  regionId?: string;
  domainId?: string;
  therapeuticAreaId?: string;
  phaseId?: string;
  personalityTypeId?: string;
  sessionName?: string;
  sessionMode?: 'interactive' | 'autonomous' | 'batch';
  expiresInHours?: number;
}

interface SessionMetrics {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  responseTimeMs?: number;
}

/**
 * useAgentContext - Hook for agent context API calls
 * 
 * Provides:
 * - Fetching all context lookups (personality types, regions, domains, TAs, phases)
 * - Agent instantiation with context injection
 * - Session management
 * 
 * Reference: api/routes/agent_context.py, api/routes/agent_sessions.py
 */
export function useAgentContext(
  options: UseAgentContextOptions = {}
): UseAgentContextReturn {
  const { baseUrl = '', autoFetch = true } = options;

  const [lookups, setLookups] = useState<AllContextLookups | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all context lookups in a single call
   */
  const fetchLookups = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/api/agents/context/all-lookups`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch lookups: ${response.statusText}`);
      }

      const data: AllContextLookups = await response.json();
      setLookups(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('useAgentContext.fetchLookups error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl]);

  /**
   * Instantiate an agent with context injection
   * Returns full configuration including system prompt with context
   */
  const instantiateAgent = useCallback(
    async (params: InstantiateAgentParams): Promise<InstantiatedAgent> => {
      const response = await fetch(`${baseUrl}/api/agents/sessions/instantiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: params.agentId,
          user_id: params.userId,
          tenant_id: params.tenantId,
          region_id: params.regionId,
          domain_id: params.domainId,
          therapeutic_area_id: params.therapeuticAreaId,
          phase_id: params.phaseId,
          personality_type_id: params.personalityTypeId,
          session_mode: params.sessionMode || 'interactive',
          expires_in_hours: params.expiresInHours || 24,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to instantiate agent: ${error}`);
      }

      return response.json();
    },
    [baseUrl]
  );

  /**
   * Create a new session (without full instantiation)
   */
  const createSession = useCallback(
    async (params: CreateSessionParams): Promise<AgentSession> => {
      const response = await fetch(`${baseUrl}/api/agents/sessions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: params.agentId,
          user_id: params.userId,
          tenant_id: params.tenantId,
          region_id: params.regionId,
          domain_id: params.domainId,
          therapeutic_area_id: params.therapeuticAreaId,
          phase_id: params.phaseId,
          personality_type_id: params.personalityTypeId,
          session_name: params.sessionName,
          session_mode: params.sessionMode || 'interactive',
          expires_in_hours: params.expiresInHours || 24,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create session: ${error}`);
      }

      return response.json();
    },
    [baseUrl]
  );

  /**
   * Get active sessions for a user
   */
  const getActiveSessions = useCallback(
    async (userId: string): Promise<AgentSession[]> => {
      const response = await fetch(
        `${baseUrl}/api/agents/sessions/user/${userId}/active`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }

      return response.json();
    },
    [baseUrl]
  );

  /**
   * Update session metrics after a query
   */
  const updateSessionMetrics = useCallback(
    async (sessionId: string, metrics: SessionMetrics): Promise<void> => {
      const response = await fetch(
        `${baseUrl}/api/agents/sessions/${sessionId}/metrics`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input_tokens: metrics.inputTokens,
            output_tokens: metrics.outputTokens,
            cost_usd: metrics.costUsd,
            response_time_ms: metrics.responseTimeMs,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update metrics: ${response.statusText}`);
      }
    },
    [baseUrl]
  );

  /**
   * Mark session as completed
   */
  const completeSession = useCallback(
    async (sessionId: string): Promise<void> => {
      const response = await fetch(
        `${baseUrl}/api/agents/sessions/${sessionId}/complete`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error(`Failed to complete session: ${response.statusText}`);
      }
    },
    [baseUrl]
  );

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchLookups();
    }
  }, [autoFetch, fetchLookups]);

  return {
    // Data
    lookups,
    personalityTypes: lookups?.personality_types || [],
    regions: lookups?.regions || [],
    domains: lookups?.domains || [],
    therapeuticAreas: lookups?.therapeutic_areas || [],
    phases: lookups?.phases || [],
    
    // State
    isLoading,
    error,
    
    // Actions
    fetchLookups,
    instantiateAgent,
    createSession,
    getActiveSessions,
    updateSessionMetrics,
    completeSession,
  };
}

/**
 * Hook for synergy data
 */
export function useAgentSynergies(baseUrl = '') {
  const [isLoading, setIsLoading] = useState(false);

  const getSynergyBetween = useCallback(
    async (agentAId: string, agentBId: string) => {
      const response = await fetch(
        `${baseUrl}/api/agents/synergies/between/${agentAId}/${agentBId}`
      );
      if (!response.ok) throw new Error('Failed to fetch synergy');
      return response.json();
    },
    [baseUrl]
  );

  const getSynergyPartners = useCallback(
    async (agentId: string, limit = 10, minScore = 0.5) => {
      const response = await fetch(
        `${baseUrl}/api/agents/synergies/partners/${agentId}?limit=${limit}&min_score=${minScore}`
      );
      if (!response.ok) throw new Error('Failed to fetch partners');
      return response.json();
    },
    [baseUrl]
  );

  return {
    isLoading,
    getSynergyBetween,
    getSynergyPartners,
  };
}

export default useAgentContext;
