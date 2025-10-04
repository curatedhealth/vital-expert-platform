/**
 * Tool Registry Service
 *
 * Manages tools and their assignments to agents via Supabase database
 */

import { createClient } from '@/shared/utils/supabase/client';
import { getAllExpertTools, type ToolCall } from './expert-tools';

export interface ToolCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
}

export interface Tool {
  id: string;
  tool_key: string;
  name: string;
  description: string;
  category_id: string | null;
  category?: ToolCategory;
  tool_type: 'api' | 'function' | 'hybrid';
  implementation_path: string | null;
  api_endpoint: string | null;
  requires_api_key: boolean;
  api_key_env_var: string | null;
  input_schema: any;
  output_format: string;
  max_iterations: number;
  timeout_seconds: number;
  rate_limit_per_minute: number | null;
  estimated_cost_per_call: number | null;
  avg_response_time_ms: number | null;
  is_active: boolean;
  is_premium: boolean;
  requires_approval: boolean;
  usage_examples: any;
  best_practices: string[] | null;
  limitations: string[] | null;
  documentation_url: string | null;
  total_calls: number;
  success_rate: number | null;
  avg_confidence_score: number | null;
  tags?: ToolTag[];
}

export interface ToolTag {
  id: string;
  name: string;
  color: string | null;
}

export interface AgentToolAssignment {
  id: string;
  agent_id: string;
  tool_id: string;
  tool?: Tool;
  is_enabled: boolean;
  auto_use: boolean;
  requires_confirmation: boolean;
  priority: number;
  max_uses_per_conversation: number | null;
  max_uses_per_day: number | null;
  current_day_usage: number;
  times_used: number;
  success_count: number;
  failure_count: number;
  avg_user_satisfaction: number | null;
  assigned_by: string | null;
  assigned_at: string;
  last_used_at: string | null;
  notes: string | null;
}

export interface ToolUsageLog {
  id?: string;
  tool_id: string;
  agent_id: string;
  user_id: string | null;
  conversation_id: string | null;
  input: any;
  output: any;
  success: boolean;
  error_message: string | null;
  execution_time_ms: number;
  tokens_used: number | null;
  cost: number | null;
  query_context: string | null;
  relevance_score: number | null;
  user_feedback: number | null;
}

class ToolRegistryService {
  private supabase = createClient();

  // ============================================================================
  // Tool Management
  // ============================================================================

  /**
   * Get all available tools
   */
  async getAllTools(includeInactive = false): Promise<Tool[]> {
    let query = this.supabase
      .from('tools')
      .select(`
        *,
        category:tool_categories(*),
        tags:tool_tag_assignments(tag:tool_tags(*))
      `)
      .order('name');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform tags
    return (data || []).map(tool => ({
      ...tool,
      tags: tool.tags?.map((t: any) => t.tag) || []
    }));
  }

  /**
   * Get tool by key
   */
  async getToolByKey(toolKey: string): Promise<Tool | null> {
    const { data, error } = await this.supabase
      .from('tools')
      .select(`
        *,
        category:tool_categories(*),
        tags:tool_tag_assignments(tag:tool_tags(*))
      `)
      .eq('tool_key', toolKey)
      .single();

    if (error) {
      console.error('Error fetching tool:', error);
      return null;
    }

    return {
      ...data,
      tags: data.tags?.map((t: any) => t.tag) || []
    };
  }

  /**
   * Get tools by category
   */
  async getToolsByCategory(categoryName: string): Promise<Tool[]> {
    const { data, error } = await this.supabase
      .from('tools')
      .select(`
        *,
        category:tool_categories!inner(*),
        tags:tool_tag_assignments(tag:tool_tags(*))
      `)
      .eq('category.name', categoryName)
      .eq('is_active', true);

    if (error) throw error;

    return (data || []).map(tool => ({
      ...tool,
      tags: tool.tags?.map((t: any) => t.tag) || []
    }));
  }

  /**
   * Get tools by tags
   */
  async getToolsByTags(tagNames: string[]): Promise<Tool[]> {
    const { data, error } = await this.supabase
      .from('tool_tag_assignments')
      .select(`
        tool:tools(
          *,
          category:tool_categories(*),
          tags:tool_tag_assignments(tag:tool_tags(*))
        ),
        tag:tool_tags!inner(name)
      `)
      .in('tag.name', tagNames);

    if (error) throw error;

    // Deduplicate tools
    const toolsMap = new Map();
    (data || []).forEach((item: any) => {
      if (item.tool && item.tool.is_active) {
        toolsMap.set(item.tool.id, {
          ...item.tool,
          tags: item.tool.tags?.map((t: any) => t.tag) || []
        });
      }
    });

    return Array.from(toolsMap.values());
  }

  /**
   * Get all tool categories
   */
  async getToolCategories(): Promise<ToolCategory[]> {
    const { data, error } = await this.supabase
      .from('tool_categories')
      .select('*')
      .order('display_order');

    if (error) throw error;
    return data || [];
  }

  // ============================================================================
  // Agent Tool Assignments
  // ============================================================================

  /**
   * Get tools assigned to an agent
   */
  async getAgentTools(agentId: string, enabledOnly = true): Promise<AgentToolAssignment[]> {
    let query = this.supabase
      .from('agent_tool_assignments')
      .select(`
        *,
        tool:tools(
          *,
          category:tool_categories(*),
          tags:tool_tag_assignments(tag:tool_tags(*))
        )
      `)
      .eq('agent_id', agentId)
      .order('priority', { ascending: false });

    if (enabledOnly) {
      query = query.eq('is_enabled', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(assignment => ({
      ...assignment,
      tool: assignment.tool ? {
        ...assignment.tool,
        tags: assignment.tool.tags?.map((t: any) => t.tag) || []
      } : undefined
    }));
  }

  /**
   * Assign tool to agent
   */
  async assignToolToAgent(
    agentId: string,
    toolId: string,
    options: {
      isEnabled?: boolean;
      autoUse?: boolean;
      requiresConfirmation?: boolean;
      priority?: number;
      maxUsesPerConversation?: number;
      maxUsesPerDay?: number;
      notes?: string;
    } = {}
  ): Promise<AgentToolAssignment> {
    const { data, error } = await this.supabase
      .from('agent_tool_assignments')
      .upsert({
        agent_id: agentId,
        tool_id: toolId,
        is_enabled: options.isEnabled ?? true,
        auto_use: options.autoUse ?? false,
        requires_confirmation: options.requiresConfirmation ?? false,
        priority: options.priority ?? 0,
        max_uses_per_conversation: options.maxUsesPerConversation,
        max_uses_per_day: options.maxUsesPerDay,
        notes: options.notes
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Bulk assign tools to agent
   */
  async bulkAssignToolsToAgent(
    agentId: string,
    toolIds: string[],
    options: {
      isEnabled?: boolean;
      autoUse?: boolean;
      requiresConfirmation?: boolean;
      priority?: number;
    } = {}
  ): Promise<void> {
    const assignments = toolIds.map(toolId => ({
      agent_id: agentId,
      tool_id: toolId,
      is_enabled: options.isEnabled ?? true,
      auto_use: options.autoUse ?? false,
      requires_confirmation: options.requiresConfirmation ?? false,
      priority: options.priority ?? 0
    }));

    const { error } = await this.supabase
      .from('agent_tool_assignments')
      .upsert(assignments);

    if (error) throw error;
  }

  /**
   * Assign tools by category to agent
   */
  async assignToolsByCategoryToAgent(
    agentId: string,
    categoryName: string,
    options?: {
      isEnabled?: boolean;
      autoUse?: boolean;
      priority?: number;
    }
  ): Promise<void> {
    const tools = await this.getToolsByCategory(categoryName);
    const toolIds = tools.map(t => t.id);
    await this.bulkAssignToolsToAgent(agentId, toolIds, options);
  }

  /**
   * Assign tools by tags to agent
   */
  async assignToolsByTagsToAgent(
    agentId: string,
    tagNames: string[],
    options?: {
      isEnabled?: boolean;
      autoUse?: boolean;
      priority?: number;
    }
  ): Promise<void> {
    const tools = await this.getToolsByTags(tagNames);
    const toolIds = tools.map(t => t.id);
    await this.bulkAssignToolsToAgent(agentId, toolIds, options);
  }

  /**
   * Remove tool assignment from agent
   */
  async removeToolFromAgent(agentId: string, toolId: string): Promise<void> {
    const { error } = await this.supabase
      .from('agent_tool_assignments')
      .delete()
      .eq('agent_id', agentId)
      .eq('tool_id', toolId);

    if (error) throw error;
  }

  /**
   * Update tool assignment
   */
  async updateAgentToolAssignment(
    assignmentId: string,
    updates: Partial<AgentToolAssignment>
  ): Promise<AgentToolAssignment> {
    const { data, error } = await this.supabase
      .from('agent_tool_assignments')
      .update(updates)
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ============================================================================
  // Tool Usage Tracking
  // ============================================================================

  /**
   * Log tool usage
   */
  async logToolUsage(log: ToolUsageLog): Promise<void> {
    const { error } = await this.supabase
      .from('tool_usage_logs')
      .insert(log);

    if (error) {
      console.error('Failed to log tool usage:', error);
      // Don't throw - logging failures shouldn't break functionality
    }
  }

  /**
   * Get tool usage statistics for an agent
   */
  async getAgentToolUsageStats(agentId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await this.supabase
      .from('tool_usage_logs')
      .select(`
        tool_id,
        success,
        execution_time_ms,
        cost,
        tool:tools(name, tool_key)
      `)
      .eq('agent_id', agentId)
      .gte('created_at', since.toISOString());

    if (error) throw error;

    // Aggregate statistics
    const stats = new Map<string, any>();

    (data || []).forEach((log: any) => {
      const toolKey = log.tool?.tool_key || log.tool_id;
      if (!stats.has(toolKey)) {
        stats.set(toolKey, {
          toolName: log.tool?.name || toolKey,
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          totalExecutionTime: 0,
          totalCost: 0
        });
      }

      const stat = stats.get(toolKey);
      stat.totalCalls++;
      if (log.success) stat.successfulCalls++;
      else stat.failedCalls++;
      stat.totalExecutionTime += log.execution_time_ms || 0;
      stat.totalCost += parseFloat(log.cost) || 0;
    });

    return Array.from(stats.values()).map(stat => ({
      ...stat,
      successRate: (stat.successfulCalls / stat.totalCalls) * 100,
      avgExecutionTime: stat.totalExecutionTime / stat.totalCalls,
      avgCost: stat.totalCost / stat.totalCalls
    }));
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Get LangChain tool instances for an agent
   */
  async getAgentToolInstances(agentId: string): Promise<any[]> {
    const assignments = await this.getAgentTools(agentId, true);

    // Get all available tool instances from expert-tools
    const allToolInstances = getAllExpertTools();
    const toolMap = new Map(
      allToolInstances.map(tool => [tool.name, tool])
    );

    // Return only the tools assigned to this agent, sorted by priority
    return assignments
      .filter(assignment => assignment.tool && toolMap.has(assignment.tool.tool_key))
      .sort((a, b) => b.priority - a.priority)
      .map(assignment => toolMap.get(assignment.tool!.tool_key)!);
  }

  /**
   * Check if agent can use a tool (respects usage limits)
   */
  async canAgentUseTool(agentId: string, toolId: string, conversationId?: string): Promise<boolean> {
    const { data: assignment } = await this.supabase
      .from('agent_tool_assignments')
      .select('*')
      .eq('agent_id', agentId)
      .eq('tool_id', toolId)
      .single();

    if (!assignment || !assignment.is_enabled) return false;

    // Check daily limit
    if (assignment.max_uses_per_day) {
      // Check if we need to reset daily usage
      const today = new Date().toISOString().split('T')[0];
      const lastUsed = assignment.last_used_at ? new Date(assignment.last_used_at).toISOString().split('T')[0] : null;

      if (lastUsed !== today) {
        // Reset daily usage
        await this.supabase
          .from('agent_tool_assignments')
          .update({ current_day_usage: 0 })
          .eq('id', assignment.id);
      } else if (assignment.current_day_usage >= assignment.max_uses_per_day) {
        return false; // Daily limit exceeded
      }
    }

    // Check conversation limit
    if (assignment.max_uses_per_conversation && conversationId) {
      const { count } = await this.supabase
        .from('tool_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agentId)
        .eq('tool_id', toolId)
        .eq('conversation_id', conversationId);

      if (count && count >= assignment.max_uses_per_conversation) {
        return false; // Conversation limit exceeded
      }
    }

    return true;
  }

  /**
   * Increment tool usage counter
   */
  async incrementToolUsage(agentId: string, toolId: string, success: boolean): Promise<void> {
    const updateData: any = {
      times_used: this.supabase.rpc('increment_times_used'),
      last_used_at: new Date().toISOString(),
      current_day_usage: this.supabase.rpc('increment_current_day_usage')
    };

    if (success) {
      updateData.success_count = this.supabase.rpc('increment_success_count');
    } else {
      updateData.failure_count = this.supabase.rpc('increment_failure_count');
    }

    await this.supabase
      .from('agent_tool_assignments')
      .update(updateData)
      .eq('agent_id', agentId)
      .eq('tool_id', toolId);
  }
}

export const toolRegistryService = new ToolRegistryService();
export default toolRegistryService;
