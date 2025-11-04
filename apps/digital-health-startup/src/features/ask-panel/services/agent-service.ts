/**
 * Agent Service
 * 
 * Service layer for fetching and managing agents from Supabase
 */

import { createClient } from '@/lib/supabase/client';
import type { 
  Agent, 
  AgentFilters, 
  AgentSearchResult,
  AgentSuite,
  AgentSuiteMember 
} from '../types/agent';

// ============================================================================
// AGENT QUERIES
// ============================================================================

/**
 * Get all active agents with optional filtering
 */
export async function getAgents(filters?: AgentFilters): Promise<Agent[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('agents')
    .select('*')
    .eq('is_active', true);
  
  // Apply filters
  if (filters?.category) {
    if (Array.isArray(filters.category)) {
      query = query.in('category', filters.category);
    } else {
      query = query.eq('category', filters.category);
    }
  }
  
  if (filters?.minRating) {
    query = query.gte('rating', filters.minRating.toString());
  }
  
  if (filters?.minConsultations) {
    query = query.gte('total_consultations', filters.minConsultations);
  }
  
  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }
  
  if (filters?.searchQuery) {
    // Simple text search across name, title, description
    query = query.or(
      `name.ilike.%${filters.searchQuery}%,` +
      `title.ilike.%${filters.searchQuery}%,` +
      `description.ilike.%${filters.searchQuery}%`
    );
  }
  
  // Order by popularity and rating
  query = query.order('popularity_score', { ascending: false })
               .order('rating', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching agents:', error);
    throw new Error(`Failed to fetch agents: ${error.message}`);
  }
  
  return data as Agent[];
}

/**
 * Get a single agent by ID or slug
 */
export async function getAgent(idOrSlug: string): Promise<Agent | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .eq('is_active', true)
    .single();
  
  if (error) {
    console.error('Error fetching agent:', error);
    return null;
  }
  
  return data as Agent;
}

/**
 * Get agents by IDs
 */
export async function getAgentsByIds(ids: string[]): Promise<Agent[]> {
  if (ids.length === 0) return [];
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .in('id', ids)
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching agents by IDs:', error);
    throw new Error(`Failed to fetch agents: ${error.message}`);
  }
  
  return data as Agent[];
}

/**
 * Get agents by slugs
 */
export async function getAgentsBySlugs(slugs: string[]): Promise<Agent[]> {
  if (slugs.length === 0) return [];
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .in('slug', slugs)
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching agents by slugs:', error);
    throw new Error(`Failed to fetch agents: ${error.message}`);
  }
  
  return data as Agent[];
}

/**
 * Search agents with faceted results
 */
export async function searchAgents(
  filters: AgentFilters
): Promise<AgentSearchResult> {
  const agents = await getAgents(filters);
  
  // Build facets from results
  const categories = new Map<string, number>();
  const expertise = new Map<string, number>();
  const tags = new Map<string, number>();
  
  agents.forEach(agent => {
    // Category facet
    if (agent.category) {
      categories.set(agent.category, (categories.get(agent.category) || 0) + 1);
    }
    
    // Expertise facet
    agent.expertise.forEach(exp => {
      expertise.set(exp, (expertise.get(exp) || 0) + 1);
    });
    
    // Tags facet
    agent.tags.forEach(tag => {
      tags.set(tag, (tags.get(tag) || 0) + 1);
    });
  });
  
  return {
    agents,
    totalCount: agents.length,
    filters,
    facets: {
      categories: Array.from(categories.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      expertise: Array.from(expertise.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20), // Top 20
      tags: Array.from(tags.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20), // Top 20
    },
  };
}

// ============================================================================
// AGENT SUITE QUERIES
// ============================================================================

/**
 * Get all active agent suites
 */
export async function getAgentSuites(): Promise<AgentSuite[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('dh_agent_suite')
    .select(`
      *,
      members:dh_agent_suite_member(count)
    `)
    .eq('is_active', true)
    .order('position', { ascending: true });
  
  if (error) {
    console.error('Error fetching agent suites:', error);
    throw new Error(`Failed to fetch agent suites: ${error.message}`);
  }
  
  return data.map(suite => ({
    ...suite,
    agent_count: suite.members?.[0]?.count || 0,
  })) as AgentSuite[];
}

/**
 * Get a single agent suite by ID
 */
export async function getAgentSuite(id: string): Promise<AgentSuite | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('dh_agent_suite')
    .select(`
      *,
      members:dh_agent_suite_member(
        *,
        agent:dh_role(*)
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single();
  
  if (error) {
    console.error('Error fetching agent suite:', error);
    return null;
  }
  
  return data as AgentSuite;
}

/**
 * Get agents for a specific suite
 */
export async function getAgentsForSuite(suiteId: string): Promise<Agent[]> {
  const supabase = createClient();
  
  // Get suite members
  const { data: members, error: membersError } = await supabase
    .from('dh_agent_suite_member')
    .select('agent_id, position')
    .eq('suite_id', suiteId)
    .order('position', { ascending: true });
  
  if (membersError) {
    console.error('Error fetching suite members:', membersError);
    throw new Error(`Failed to fetch suite members: ${membersError.message}`);
  }
  
  if (!members || members.length === 0) {
    return [];
  }
  
  // Get agents
  const agentIds = members.map(m => m.agent_id);
  const agents = await getAgentsByIds(agentIds);
  
  // Sort by suite position
  const positionMap = new Map(members.map(m => [m.agent_id, m.position]));
  agents.sort((a, b) => {
    const posA = positionMap.get(a.id) || 0;
    const posB = positionMap.get(b.id) || 0;
    return posA - posB;
  });
  
  return agents;
}

// ============================================================================
// AGENT MUTATIONS
// ============================================================================

/**
 * Update agent popularity score (e.g., after consultation)
 */
export async function incrementAgentPopularity(agentId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase.rpc('increment_agent_popularity', {
    agent_id: agentId,
  });
  
  if (error) {
    console.error('Error incrementing agent popularity:', error);
    // Non-critical, don't throw
  }
}

/**
 * Update agent rating (after consultation feedback)
 */
export async function updateAgentRating(
  agentId: string,
  rating: number
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase.rpc('update_agent_rating', {
    agent_id: agentId,
    new_rating: rating,
  });
  
  if (error) {
    console.error('Error updating agent rating:', error);
    // Non-critical, don't throw
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse agent rating from string to number
 */
export function parseAgentRating(rating: string): number {
  return parseFloat(rating) || 0;
}

/**
 * Get all unique categories from agents
 */
export async function getAgentCategories(): Promise<string[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('agents')
    .select('category')
    .eq('is_active', true)
    .not('category', 'is', null);
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  const categories = Array.from(new Set(data.map(d => d.category as string)));
  return categories.sort();
}

/**
 * Get all unique expertise areas
 */
export async function getAgentExpertiseAreas(): Promise<string[]> {
  const agents = await getAgents();
  
  const expertiseSet = new Set<string>();
  agents.forEach(agent => {
    agent.expertise.forEach(exp => expertiseSet.add(exp));
  });
  
  return Array.from(expertiseSet).sort();
}

