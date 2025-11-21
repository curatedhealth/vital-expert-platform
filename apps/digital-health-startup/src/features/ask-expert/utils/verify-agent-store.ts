/**
 * Agent Store Verification Utility
 * 
 * Simple utility to verify that agents are available in Supabase
 * without modifying any database data.
 */

import { agentService } from '@/features/agents/services/agent-service';
import { getAgentConfig, selectBestAgentForQuery } from '../services/agent-store-integration';

export interface AgentStoreStatus {
  hasAgents: boolean;
  totalAgents: number;
  activeAgents: number;
  sampleAgents: Array<{
    id: string;
    name: string;
    display_name: string;
    status: string;
  }>;
  error?: string;
}

/**
 * Check if agent store has agents available
 */
export async function verifyAgentStore(): Promise<AgentStoreStatus> {
  try {
    const agents = await agentService.getActiveAgents();
    const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'testing');
    
    return {
      hasAgents: activeAgents.length > 0,
      totalAgents: agents.length,
      activeAgents: activeAgents.length,
      sampleAgents: activeAgents.slice(0, 5).map(agent => ({
        id: agent.id,
        name: agent.name,
        display_name: agent.display_name,
        status: agent.status,
      })),
    };
  } catch (error) {
    return {
      hasAgents: false,
      totalAgents: 0,
      activeAgents: 0,
      sampleAgents: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test agent fetching by ID
 */
export async function testAgentFetch(agentId: string): Promise<{
  success: boolean;
  agent?: {
    id: string;
    display_name: string;
    model: string;
    status: string;
  };
  error?: string;
}> {
  try {
    const agent = await getAgentConfig(agentId);
    if (!agent) {
      return {
        success: false,
        error: 'Agent not found or not active',
      };
    }
    
    return {
      success: true,
      agent: {
        id: agent.id,
        display_name: agent.display_name,
        model: agent.model,
        status: 'active',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test automatic agent selection
 */
export async function testAutoSelection(query: string): Promise<{
  success: boolean;
  selectedAgent?: {
    id: string;
    display_name: string;
    model: string;
  };
  error?: string;
}> {
  try {
    const agent = await selectBestAgentForQuery(query);
    if (!agent) {
      return {
        success: false,
        error: 'No suitable agent found for query',
      };
    }
    
    return {
      success: true,
      selectedAgent: {
        id: agent.id,
        display_name: agent.display_name,
        model: agent.model,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

