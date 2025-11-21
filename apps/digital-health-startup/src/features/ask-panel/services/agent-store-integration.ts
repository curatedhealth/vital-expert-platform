/**
 * Agent Store Integration for Ask Panel
 * 
 * Connects Ask Panel service to the Agent Store database
 * to use real agent configurations instead of hardcoded expert types
 */

import { agentService } from '@/features/agents/services/agent-service';
import type { AgentWithCategories } from '@/features/agents/services/agent-service';

export interface AgentDefinition {
  id: string;
  role: string;
  goal: string;
  backstory: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
  expertise: string[];
  allowDelegation?: boolean;
}

/**
 * Convert database agent to panel agent definition
 */
export function convertAgentToPanelDefinition(agent: AgentWithCategories): AgentDefinition {
  return {
    id: agent.id,
    role: agent.display_name,
    goal: agent.description,
    backstory: `${agent.display_name} - ${agent.description}`,
    systemPrompt: agent.system_prompt,
    model: agent.model || 'gpt-4o',
    temperature: agent.temperature || 0.7,
    maxTokens: agent.max_tokens || 2000,
    tools: Array.isArray(agent.tools) ? agent.tools : [],
    expertise: Array.isArray(agent.capabilities) 
      ? agent.capabilities 
      : Array.isArray(agent.knowledge_domains)
        ? agent.knowledge_domains
        : [],
    allowDelegation: false,
  };
}

/**
 * Fetch agents by IDs from agent store
 */
export async function fetchAgentsByIds(agentIds: string[]): Promise<AgentDefinition[]> {
  try {
    console.log(`📦 [Agent Store] Fetching ${agentIds.length} agents from store...`);
    const agents: AgentDefinition[] = [];
    
    for (const agentId of agentIds) {
      const agent = await agentService.getAgentById(agentId);
      if (agent) {
        if (agent.status === 'active' || agent.status === 'testing') {
          agents.push(convertAgentToPanelDefinition(agent));
          console.log(`  ✅ Loaded: ${agent.display_name} (${agent.status})`);
        } else {
          console.warn(`  ⚠️ Skipped: ${agent.display_name} (status: ${agent.status})`);
        }
      } else {
        console.warn(`  ⚠️ Not found: ${agentId}`);
      }
    }
    
    console.log(`📦 [Agent Store] Successfully loaded ${agents.length}/${agentIds.length} agents`);
    return agents;
  } catch (error) {
    console.error('❌ [Agent Store Integration] Error fetching agents:', error);
    throw new Error(`Failed to fetch agents from store: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch agents by names (for backward compatibility with ExpertType enum)
 */
export async function fetchAgentsByNames(agentNames: string[]): Promise<AgentDefinition[]> {
  try {
    const agents: AgentDefinition[] = [];
    
    for (const agentName of agentNames) {
      const agent = await agentService.getAgentByName(agentName);
      if (agent && (agent.status === 'active' || agent.status === 'testing')) {
        agents.push(convertAgentToPanelDefinition(agent));
      }
    }
    
    return agents;
  } catch (error) {
    console.error('❌ [Agent Store Integration] Error fetching agents by names:', error);
    throw new Error(`Failed to fetch agents by names: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all active agents for selection
 */
export async function getAllActiveAgents(): Promise<AgentDefinition[]> {
  try {
    console.log('📦 [Agent Store] Fetching all active agents...');
    const agents = await agentService.getActiveAgents();
    const converted = agents.map(convertAgentToPanelDefinition);
    console.log(`📦 [Agent Store] Found ${converted.length} active agents`);
    return converted;
  } catch (error) {
    console.error('❌ [Agent Store Integration] Error fetching all active agents:', error);
    // Return empty array instead of throwing to allow graceful degradation
    console.warn('⚠️ [Agent Store] Returning empty array - services will use fallback');
    return [];
  }
}

/**
 * Search agents by query (for automatic expert selection)
 */
export async function searchAgentsForQuery(query: string, limit: number = 5): Promise<AgentDefinition[]> {
  try {
    const agents = await agentService.searchAgents(query);
    return agents
      .slice(0, limit)
      .map(convertAgentToPanelDefinition);
  } catch (error) {
    console.error('❌ [Agent Store Integration] Error searching agents:', error);
    throw new Error(`Failed to search agents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

