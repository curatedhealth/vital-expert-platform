/**
 * Agent Tool Loader Service
 *
 * Fetches an agent's assigned tools from the database and loads
 * the corresponding LangChain tool implementations from the tool registry.
 */

import { supabase } from '@vital/sdk/client';

import { getToolsByNames } from '../tools/tool-registry';

import type { StructuredToolInterface } from '@langchain/core/tools';

export interface AgentToolAssignment {
  agent_id: string;
  tool_id: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  category: string | null;
  is_active: boolean | null;
}

export class AgentToolLoader {
  /**
   * Load LangChain tools for a specific agent
   *
   * @param agentId The UUID of the agent
   * @returns Array of LangChain tools ready to be used
   */
  async loadToolsForAgent(agentId: string): Promise<StructuredToolInterface[]> {
    try {
      console.log(`[Agent Tool Loader] Loading tools for agent: ${agentId}`);

      // Fetch agent with tools (tools are stored as JSON array in agents.tools column)
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('id, name, display_name, tools')
        .eq('id', agentId)
        .single();

      if (agentError) {
        console.error('[Agent Tool Loader] Error fetching agent:', agentError);
        return [];
      }

      if (!agent || !agent.tools || agent.tools.length === 0) {
        console.log(`[Agent Tool Loader] No tools assigned to agent ${agentId}`);
        return [];
      }

      // Tools are stored as an array of tool names
      const toolNames = agent.tools as string[];
      console.log(`[Agent Tool Loader] Agent ${agent.display_name || agent.name} has ${toolNames.length} tool(s):`, toolNames);

      // Map tool names to LangChain implementations
      const langchainTools = getToolsByNames(toolNames);

      console.log(`[Agent Tool Loader] ✅ Loaded ${langchainTools.length} LangChain tool(s) for agent ${agentId}`);

      return langchainTools;

    } catch (error) {
      console.error('[Agent Tool Loader] Exception loading tools:', error);
      return [];
    }
  }

  /**
   * Load tools by tool names directly (useful for testing)
   */
  async loadToolsByNames(toolNames: string[]): Promise<StructuredToolInterface[]> {
    try {
      const langchainTools = getToolsByNames(toolNames);
      console.log(`[Agent Tool Loader] Loaded ${langchainTools.length} tool(s) from names`);
      return langchainTools;
    } catch (error) {
      console.error('[Agent Tool Loader] Error loading tools by names:', error);
      return [];
    }
  }

  /**
   * Get tool summary for an agent (for debugging/logging)
   */
  async getAgentToolSummary(agentId: string): Promise<{
    agentId: string;
    toolCount: number;
    tools: Array<{ name: string; type: string | null; category: string | null }>;
  }> {
    try {
      const { data: toolAssignments } = await supabase
        .from('agent_tools')
        .select('tool_id')
        .eq('agent_id', agentId);

      if (!toolAssignments || toolAssignments.length === 0) {
        return { agentId, toolCount: 0, tools: [] };
      }

      const toolIds = toolAssignments.map(a => a.tool_id);

      const { data: tools } = await supabase
        .from('tools')
        .select('name, type, category')
        .in('id', toolIds)
        .eq('is_active', true);

      return {
        agentId,
        toolCount: tools?.length || 0,
        tools: tools || [],
      };
    } catch (error) {
      console.error('[Agent Tool Loader] Error getting tool summary:', error);
      return { agentId, toolCount: 0, tools: [] };
    }
  }

  /**
   * Check if an agent has a specific tool
   */
  async agentHasTool(agentId: string, toolName: string): Promise<boolean> {
    try {
      const { data: toolAssignments } = await supabase
        .from('agent_tools')
        .select('tool_id')
        .eq('agent_id', agentId);

      if (!toolAssignments || toolAssignments.length === 0) {
        return false;
      }

      const toolIds = toolAssignments.map(a => a.tool_id);

      const { data: tools } = await supabase
        .from('tools')
        .select('name')
        .in('id', toolIds)
        .eq('name', toolName)
        .eq('is_active', true)
        .limit(1);

      return (tools && tools.length > 0);
    } catch (error) {
      console.error('[Agent Tool Loader] Error checking tool:', error);
      return false;
    }
  }
}

// Singleton instance
export const agentToolLoader = new AgentToolLoader();
