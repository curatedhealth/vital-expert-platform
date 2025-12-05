/**
 * Agent API Service
 * Handles all agent data fetching with RLS support
 *
 * Phase 1 Implementation - Aligned with multi-tenant architecture
 * @see /.claude/docs/platform/agents/MULTI_TENANT_ARCHITECTURE.md
 */

import { supabase } from '@vital/sdk/client';
import type {
  Agent,
  AgentFilters,
  AgentWithRelationships,
  AgentLevelNumber,
  RecommendedSubagent,
  RecommendSubagentsRequest,
  RecommendSubagentsResponse,
  SubagentHierarchyConfig,
} from '../types/agent.types';
import { PERFORMANCE } from '../constants/design-tokens';

// ============================================================================
// TYPES
// ============================================================================

interface FetchAgentsOptions {
  status?: 'all' | 'active' | 'testing' | 'development' | 'inactive';
  tenantId?: string;
  includeLevels?: boolean;
  includeSpawning?: boolean;
}

interface SearchOptions {
  query: string;
  limit?: number;
  fuzzyMatch?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// ============================================================================
// IN-MEMORY CACHE
// ============================================================================

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number = PERFORMANCE.cacheTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(keyPattern?: string): void {
    if (!keyPattern) {
      this.cache.clear();
      return;
    }

    // Remove all keys matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

// ============================================================================
// ERROR HANDLING
// ============================================================================

class AgentServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AgentServiceError';
  }
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Fetch with exponential backoff retry
 */
async function fetchWithRetry(
  url: string,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Disable Next.js cache for fresh data
      });

      // Success or client error (don't retry 4xx)
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // Server error (5xx) - retry
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);

      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed:`, lastError.message);
      }

    } catch (fetchError) {
      lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
    }

    // Wait before retry (exponential backoff)
    if (attempt < maxRetries) {
      const delayMs = attempt * 500; // 500ms, 1000ms, 1500ms
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

// ============================================================================
// AGENT API SERVICE
// ============================================================================

export class AgentApiService {
  private baseUrl = '/api/agents';

  /**
   * Get all agents (RLS-filtered by tenant)
   */
  async getAgents(options: FetchAgentsOptions = {}): Promise<Agent[]> {
    const { status = 'all', includeLevels = true } = options;

    // Check cache first
    const cacheKey = `agents:${status}`;
    const cached = cache.get<Agent[]>(cacheKey);
    if (cached) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Cache hit:', cacheKey);
      }
      return cached;
    }

    try {
      // Fetch from API (RLS handles tenant filtering)
      const url = `${this.baseUrl}?status=${status}`;
      const response = await fetchWithRetry(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Unknown error',
        }));
        throw new AgentServiceError(
          errorData.error || 'Failed to fetch agents',
          errorData.code,
          response.status
        );
      }

      const result = await response.json();
      const agents: Agent[] = result.agents || [];

      // Cache the result
      cache.set(cacheKey, agents);

      return agents;
    } catch (error) {
      // Fallback to direct Supabase call
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ API failed, attempting Supabase fallback...');
      }

      try {
        let query = supabase
          .from('agents')
          .select(
            includeLevels
              ? '*, agent_levels(*)'
              : '*'
          );

        // Apply status filter
        if (status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query
          .order('name', { ascending: true })
          .limit(1000);

        if (error) throw error;

        const agents = (data || []) as Agent[];

        // Cache the fallback result
        cache.set(cacheKey, agents);

        return agents;
      } catch (dbError) {
        console.error('❌ Both API and Supabase failed:', dbError);
        throw new AgentServiceError(
          'Failed to fetch agents from all sources',
          'FETCH_FAILED'
        );
      }
    }
  }

  /**
   * Get single agent by ID
   */
  async getAgentById(id: string): Promise<AgentWithRelationships | null> {
    // Check cache first
    const cacheKey = `agent:${id}`;
    const cached = cache.get<AgentWithRelationships>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('agents')
        .select(
          `
          *,
          agent_levels(*),
          spawning_relationships_parent:spawning_relationships!parent_agent_id(*),
          spawning_relationships_child:spawning_relationships!child_agent_id(*)
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      const agent = data as AgentWithRelationships;

      // Cache the result
      cache.set(cacheKey, agent);

      return agent;
    } catch (error) {
      console.error('Error fetching agent by ID:', error);
      throw new AgentServiceError(
        `Failed to fetch agent with ID: ${id}`,
        'AGENT_NOT_FOUND'
      );
    }
  }

  /**
   * Search agents by query (fuzzy matching)
   */
  async searchAgents(options: SearchOptions): Promise<Agent[]> {
    const { query, limit = 50, fuzzyMatch = true } = options;

    if (!query || query.trim() === '') {
      return [];
    }

    const searchTerm = fuzzyMatch
      ? `%${query.toLowerCase().trim()}%`
      : query.toLowerCase().trim();

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*, agent_levels(*)')
        .or(
          `name.ilike.${searchTerm},description.ilike.${searchTerm},function_name.ilike.${searchTerm},department_name.ilike.${searchTerm},role_name.ilike.${searchTerm},tagline.ilike.${searchTerm}`
        )
        .order('name', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return (data || []) as Agent[];
    } catch (error) {
      console.error('Error searching agents:', error);
      throw new AgentServiceError('Failed to search agents', 'SEARCH_FAILED');
    }
  }

  /**
   * Get agents by level
   */
  async getAgentsByLevel(level: AgentLevelNumber): Promise<Agent[]> {
    const cacheKey = `agents:level:${level}`;
    const cached = cache.get<Agent[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*, agent_levels!inner(*)')
        .eq('agent_levels.level_number', level)
        .order('name', { ascending: true });

      if (error) throw error;

      const agents = (data || []) as Agent[];
      cache.set(cacheKey, agents);

      return agents;
    } catch (error) {
      console.error('Error fetching agents by level:', error);
      throw new AgentServiceError(
        `Failed to fetch agents for level ${level}`,
        'FETCH_BY_LEVEL_FAILED'
      );
    }
  }

  /**
   * Get spawnable agents for a parent agent
   */
  async getSpawnableAgents(parentLevel: AgentLevelNumber): Promise<Agent[]> {
    // Spawning rules: Master(1) spawns 2-5, Expert(2) spawns 3-5, etc.
    const spawnableLevels: AgentLevelNumber[] = [];

    if (parentLevel === 1) spawnableLevels.push(2, 3, 4, 5);
    else if (parentLevel === 2) spawnableLevels.push(3, 4, 5);
    else if (parentLevel === 3) spawnableLevels.push(4, 5);
    else if (parentLevel === 4) spawnableLevels.push(5);
    // Level 5 cannot spawn

    if (spawnableLevels.length === 0) return [];

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*, agent_levels!inner(*)')
        .in('agent_levels.level_number', spawnableLevels)
        .eq('status', 'active') // Only active agents can be spawned
        .order('agent_levels.level_number', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      return (data || []) as Agent[];
    } catch (error) {
      console.error('Error fetching spawnable agents:', error);
      throw new AgentServiceError(
        'Failed to fetch spawnable agents',
        'FETCH_SPAWNABLE_FAILED'
      );
    }
  }

  /**
   * Get recommended subagents based on domain matching
   * Used by SubagentSelector component to suggest L4/L5 agents
   */
  async getRecommendedSubagents(
    request: RecommendSubagentsRequest
  ): Promise<RecommendSubagentsResponse> {
    const {
      parent_agent_id,
      target_level,
      domain_expertise,
      department_name,
      function_name,
      limit = 10,
    } = request;

    const cacheKey = `recommended:${parent_agent_id}:L${target_level}`;
    const cached = cache.get<RecommendSubagentsResponse>(cacheKey);
    if (cached) return cached;

    try {
      // Build query for ALL active agents
      // NOTE: agent_levels are not populated in DB yet, so we fetch all agents
      // and let users manually select which ones to use as L4/L5 workers/tools
      const { data: agents, error } = await supabase
        .from('agents')
        .select('*, agent_levels(*)')
        .eq('status', 'active')
        .order('name', { ascending: true })
        .limit(100);

      if (error) throw error;

      // Score and rank agents based on domain matching
      const recommendations: RecommendedSubagent[] = (agents || [])
        .map((agent: Agent) => {
          const matchReasons: string[] = [];
          let score = 0.5; // Base score

          // Department match (highest weight)
          if (
            department_name &&
            agent.department_name?.toLowerCase().includes(department_name.toLowerCase())
          ) {
            score += 0.3;
            matchReasons.push(`Same department: ${department_name}`);
          }

          // Function match
          if (
            function_name &&
            agent.function_name?.toLowerCase().includes(function_name.toLowerCase())
          ) {
            score += 0.15;
            matchReasons.push(`Same function: ${function_name}`);
          }

          // Domain expertise match
          if (domain_expertise && agent.metadata?.domain_expertise) {
            const agentDomain = agent.metadata.domain_expertise;
            if (
              agentDomain.primary_domain === domain_expertise.primary_domain ||
              agentDomain.sub_domains?.some((d: string) =>
                domain_expertise.sub_domains?.includes(d)
              )
            ) {
              score += 0.2;
              matchReasons.push('Domain expertise match');
            }
          }

          // Boost for context engineers
          if (
            agent.slug?.includes('context-engineer') ||
            agent.name?.toLowerCase().includes('context')
          ) {
            score += 0.1;
            matchReasons.push('Context management capability');
          }

          // Default reason if no specific matches
          if (matchReasons.length === 0) {
            matchReasons.push('General capability match');
          }

          return {
            agent_id: agent.id,
            agent_name: agent.name || agent.display_name || 'Unknown Agent',
            agent_level: target_level,
            domain_expertise: agent.metadata?.domain_expertise,
            match_score: Math.min(score, 1), // Cap at 1.0
            match_reasons: matchReasons,
          };
        })
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, limit);

      const response: RecommendSubagentsResponse = {
        recommendations,
        total_available: agents?.length || 0,
        match_criteria: {
          domain_match: !!domain_expertise,
          department_match: !!department_name,
          function_match: !!function_name,
        },
      };

      // Cache for 5 minutes
      cache.set(cacheKey, response, 5 * 60 * 1000);

      return response;
    } catch (error) {
      console.error('Error fetching recommended subagents:', error);
      throw new AgentServiceError(
        'Failed to fetch recommended subagents',
        'RECOMMENDATIONS_FAILED'
      );
    }
  }

  /**
   * Update agent hierarchy configuration in metadata
   */
  async updateAgentHierarchy(
    agentId: string,
    hierarchyConfig: SubagentHierarchyConfig
  ): Promise<Agent> {
    try {
      if (!agentId) {
        throw new AgentServiceError('Agent ID is required', 'INVALID_AGENT_ID');
      }

      // First get current metadata
      const { data: currentAgent, error: fetchError } = await supabase
        .from('agents')
        .select('metadata')
        .eq('id', agentId)
        .single();

      if (fetchError) {
        console.error('Error fetching agent for hierarchy update:', {
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
        });
        throw new AgentServiceError(
          `Failed to fetch agent ${agentId}: ${fetchError.message}`,
          fetchError.code || 'FETCH_FAILED'
        );
      }

      // Merge hierarchy into metadata
      const updatedMetadata = {
        ...(currentAgent?.metadata || {}),
        hierarchy: {
          ...hierarchyConfig,
          last_configured_at: new Date().toISOString(),
        },
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('Updating agent hierarchy:', {
          agentId,
          hierarchyConfig: JSON.stringify(hierarchyConfig).substring(0, 200) + '...',
        });
      }

      // Update agent
      const { data, error } = await supabase
        .from('agents')
        .update({
          metadata: updatedMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', agentId)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating agent hierarchy in database:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw new AgentServiceError(
          `Database update failed: ${error.message}`,
          error.code || 'UPDATE_FAILED'
        );
      }

      if (!data) {
        throw new AgentServiceError(
          'Update succeeded but no data returned',
          'NO_DATA_RETURNED'
        );
      }

      // Invalidate cache
      this.invalidateCache(`agent:${agentId}`);

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Agent hierarchy updated successfully:', agentId);
      }

      return data as Agent;
    } catch (error) {
      // Re-throw AgentServiceError as-is
      if (error instanceof AgentServiceError) {
        throw error;
      }

      // Handle unknown errors with better diagnostics
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = error instanceof Error ? error.stack : JSON.stringify(error);

      console.error('Unexpected error updating agent hierarchy:', {
        agentId,
        error: errorMessage,
        details: errorDetails,
      });

      throw new AgentServiceError(
        `Failed to update hierarchy for agent ${agentId}: ${errorMessage}`,
        'HIERARCHY_UPDATE_FAILED'
      );
    }
  }

  /**
   * Get context engineer agents available for workflows
   */
  async getContextEngineers(): Promise<Agent[]> {
    const cacheKey = 'agents:context-engineers';
    const cached = cache.get<Agent[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*, agent_levels(*)')
        .eq('status', 'active')
        .or('slug.ilike.%context-engineer%,name.ilike.%context engineer%')
        .order('name', { ascending: true });

      if (error) throw error;

      const agents = (data || []) as Agent[];
      cache.set(cacheKey, agents);

      return agents;
    } catch (error) {
      console.error('Error fetching context engineers:', error);
      throw new AgentServiceError(
        'Failed to fetch context engineers',
        'CONTEXT_ENGINEERS_FAILED'
      );
    }
  }

  /**
   * Invalidate cache
   */
  invalidateCache(pattern?: string): void {
    cache.invalidate(pattern);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    cache.clear();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const agentApi = new AgentApiService();

// ============================================================================
// EXPORTS
// ============================================================================

export default agentApi;
