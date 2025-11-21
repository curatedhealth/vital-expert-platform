/**
 * Agent Store Integration for Ask Expert
 * 
 * Connects Ask Expert service to the Agent Store database
 * to fetch and use real agent configurations
 */

import { agentService } from '@/features/agents/services/agent-service';
import type { AgentWithCategories } from '@/features/agents/services/agent-service';

export interface AgentConfig {
  id: string;
  name: string;
  display_name: string;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  capabilities: string[];
  tools: string[];
  knowledge_domains: string[];
  rag_enabled: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Fetch agent configuration by ID
 */
export async function getAgentConfig(agentId: string): Promise<AgentConfig | null> {
  try {
    console.log(`📦 [Agent Store] Fetching agent config: ${agentId}`);
    const agent = await agentService.getAgentById(agentId);
    
    if (!agent) {
      console.warn(`⚠️ [Agent Store] Agent not found: ${agentId}`);
      return null;
    }
    
    if (agent.status !== 'active' && agent.status !== 'testing') {
      console.warn(`⚠️ [Agent Store] Agent is not active: ${agent.display_name} (status: ${agent.status})`);
      return null;
    }
    
    const config = {
      id: agent.id,
      name: agent.name,
      display_name: agent.display_name,
      system_prompt: agent.system_prompt,
      model: agent.model || 'gpt-4o',
      temperature: agent.temperature || 0.7,
      max_tokens: agent.max_tokens || 2000,
      capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : [],
      tools: Array.isArray(agent.tools) ? agent.tools : [],
      knowledge_domains: Array.isArray(agent.knowledge_domains) ? agent.knowledge_domains : [],
      rag_enabled: agent.rag_enabled ?? true,
      metadata: agent.metadata as Record<string, unknown> | undefined,
    };
    
    console.log(`✅ [Agent Store] Loaded: ${config.display_name} (${config.model})`);
    return config;
  } catch (error) {
    console.error('❌ [Agent Store Integration] Error fetching agent config:', error);
    return null;
  }
}

/**
 * Fetch agent configuration by name (for backward compatibility)
 */
export async function getAgentConfigByName(agentName: string): Promise<AgentConfig | null> {
  try {
    const agent = await agentService.getAgentByName(agentName);
    
    if (!agent) {
      console.warn(`⚠️ [Agent Store Integration] Agent not found by name: ${agentName}`);
      return null;
    }
    
    if (agent.status !== 'active' && agent.status !== 'testing') {
      console.warn(`⚠️ [Agent Store Integration] Agent is not active: ${agentName} (status: ${agent.status})`);
      return null;
    }
    
    return {
      id: agent.id,
      name: agent.name,
      display_name: agent.display_name,
      system_prompt: agent.system_prompt,
      model: agent.model || 'gpt-4o',
      temperature: agent.temperature || 0.7,
      max_tokens: agent.max_tokens || 2000,
      capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : [],
      tools: Array.isArray(agent.tools) ? agent.tools : [],
      knowledge_domains: Array.isArray(agent.knowledge_domains) ? agent.knowledge_domains : [],
      rag_enabled: agent.rag_enabled ?? true,
      metadata: agent.metadata as Record<string, unknown> | undefined,
    };
  } catch (error) {
    console.error('❌ [Agent Store Integration] Error fetching agent config by name:', error);
    return null;
  }
}

/**
 * Search and select best agent for a query (for automatic mode)
 */
export async function selectBestAgentForQuery(
  query: string,
  options?: {
    limit?: number;
    domain?: string;
    requiredCapabilities?: string[];
  }
): Promise<AgentConfig | null> {
  try {
    console.log(`🔍 [Agent Store] Searching for best agent for query: "${query.substring(0, 50)}..."`);
    
    // Search agents by query
    const searchResults = await agentService.searchAgents(query);
    console.log(`🔍 [Agent Store] Found ${searchResults.length} candidate agents`);
    
    // Filter by domain if specified
    let candidates = searchResults;
    if (options?.domain) {
      const beforeCount = candidates.length;
      candidates = candidates.filter(agent => 
        Array.isArray(agent.knowledge_domains) && 
        agent.knowledge_domains.includes(options.domain!)
      );
      console.log(`  📊 Filtered by domain "${options.domain}": ${candidates.length}/${beforeCount}`);
    }
    
    // Filter by required capabilities if specified
    if (options?.requiredCapabilities && options.requiredCapabilities.length > 0) {
      const beforeCount = candidates.length;
      candidates = candidates.filter(agent => {
        const agentCapabilities = Array.isArray(agent.capabilities) ? agent.capabilities : [];
        return options.requiredCapabilities!.some(cap => agentCapabilities.includes(cap));
      });
      console.log(`  📊 Filtered by capabilities: ${candidates.length}/${beforeCount}`);
    }
    
    // Filter to only active/testing agents
    const beforeCount = candidates.length;
    candidates = candidates.filter(agent => 
      agent.status === 'active' || agent.status === 'testing'
    );
    console.log(`  📊 Filtered by status (active/testing): ${candidates.length}/${beforeCount}`);
    
    // Sort by tier and priority (higher tier and lower priority number = better)
    candidates.sort((a, b) => {
      if (a.tier !== b.tier) return b.tier - a.tier; // Higher tier first
      return a.priority - b.priority; // Lower priority number first
    });
    
    // Return the best match
    const bestAgent = candidates[0];
    if (!bestAgent) {
      console.warn('⚠️ [Agent Store] No suitable agent found for query');
      return null;
    }
    
    console.log(`✅ [Agent Store] Selected: ${bestAgent.display_name} (Tier ${bestAgent.tier}, Priority ${bestAgent.priority})`);
    
    return {
      id: bestAgent.id,
      name: bestAgent.name,
      display_name: bestAgent.display_name,
      system_prompt: bestAgent.system_prompt,
      model: bestAgent.model || 'gpt-4o',
      temperature: bestAgent.temperature || 0.7,
      max_tokens: bestAgent.max_tokens || 2000,
      capabilities: Array.isArray(bestAgent.capabilities) ? bestAgent.capabilities : [],
      tools: Array.isArray(bestAgent.tools) ? bestAgent.tools : [],
      knowledge_domains: Array.isArray(bestAgent.knowledge_domains) ? bestAgent.knowledge_domains : [],
      rag_enabled: bestAgent.rag_enabled ?? true,
      metadata: bestAgent.metadata as Record<string, unknown> | undefined,
    };
  } catch (error) {
    console.error('❌ [Agent Store Integration] Error selecting best agent:', error);
    return null;
  }
}

/**
 * Get all active agents for selection UI
 */
export async function getAllActiveAgentsForSelection(): Promise<AgentConfig[]> {
  try {
    const agents = await agentService.getActiveAgents();
    return agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      display_name: agent.display_name,
      system_prompt: agent.system_prompt,
      model: agent.model || 'gpt-4o',
      temperature: agent.temperature || 0.7,
      max_tokens: agent.max_tokens || 2000,
      capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : [],
      tools: Array.isArray(agent.tools) ? agent.tools : [],
      knowledge_domains: Array.isArray(agent.knowledge_domains) ? agent.knowledge_domains : [],
      rag_enabled: agent.rag_enabled ?? true,
      metadata: agent.metadata as Record<string, unknown> | undefined,
    }));
  } catch (error) {
    console.error('❌ [Agent Store Integration] Error fetching all active agents:', error);
    return [];
  }
}

