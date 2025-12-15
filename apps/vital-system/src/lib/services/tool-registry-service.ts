/**
 * Tool Registry Service
 *
 * Manages tools and their assignments to agents via Supabase database
 */

import { createClient } from '@/lib/shared/services/supabase/client';

import { getAllExpertTools } from './expert-tools';

export interface ToolCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
}

export interface Tool {
  id: string;
  unique_id: string; // Was: tool_key
  code: string;
  name: string;
  description?: string;
  tool_description?: string;
  llm_description?: string; // Short description for LLM agent selection
  usage_guide?: string; // Step-by-step usage instructions
  category: string | null; // Now text, not FK
  category_id?: string | null; // Legacy support
  category_parent?: string | null; // Parent category for hierarchical filtering
  category_obj?: ToolCategory; // Renamed from 'category'
  tool_type: 'ai_function' | 'software_reference' | 'database' | 'saas' | 'api' | 'ai_framework';
  implementation_type?: 'custom' | 'langchain_tool' | 'api' | 'function';
  lifecycle_stage?: 'development' | 'testing' | 'staging' | 'production' | 'deprecated';
  implementation_path: string | null;
  function_name?: string | null;
  api_endpoint?: string | null;
  input_schema?: any;
  output_schema?: any;
  output_format?: string;
  max_iterations?: number;
  timeout_seconds?: number;
  is_async?: boolean;
  max_execution_time_seconds?: number | null;
  retry_config?: any;
  rate_limit_per_minute: number | null;
  cost_per_execution?: number | null;
  estimated_cost_per_call?: number | null; // Legacy
  avg_response_time_ms?: number | null;
  langgraph_compatible: boolean;
  langgraph_node_name?: string | null;
  is_active: boolean;
  is_premium?: boolean;
  requires_approval?: boolean;
  access_level?: string | null;
  required_env_vars?: string[] | null;
  allowed_tenants?: string[] | null;
  allowed_roles?: string[] | null;
  usage_examples?: any;
  example_usage?: any;
  best_practices?: string[] | null;
  limitations?: string[] | null;
  documentation_url: string | null;
  total_calls?: number;
  success_rate?: number | null;
  avg_confidence_score?: number | null;
  metadata?: any;
  tags?: ToolTag[];
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
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

export class ToolRegistryService {
  private supabase: ReturnType<typeof createClient> | null = null;

  private getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = createClient();
    }
    return this.supabase;
  }

  // ============================================================================
  // Tool Management
  // ============================================================================

  /**
   * Get all available tools from unified dh_tool table
   */
  async getAllTools(includeInactive = false): Promise<Tool[]> {
    let query = this.getSupabaseClient()
      .from('dh_tool')
      .select('*')
      .order('name');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Map dh_tool columns to Tool interface
    return (data || []).map((tool: any) => ({
      id: tool.id,
      unique_id: tool.unique_id,
      code: tool.code,
      name: tool.name,
      description: tool.tool_description || tool.notes || '',
      tool_description: tool.tool_description,
      category: tool.category,
      category_id: null, // dh_tool uses text category, not FK
      tool_type: tool.tool_type || 'software_reference',
      implementation_type: tool.implementation_type || 'custom',
      lifecycle_stage: tool.lifecycle_stage || 'development',
      implementation_path: tool.implementation_path,
      function_name: tool.function_name,
      api_endpoint: null, // Not in dh_tool
      input_schema: tool.input_schema,
      output_schema: tool.output_schema,
      output_format: 'json',
      max_iterations: 3,
      timeout_seconds: tool.max_execution_time_seconds || 30,
      is_async: tool.is_async,
      max_execution_time_seconds: tool.max_execution_time_seconds,
      retry_config: tool.retry_config,
      rate_limit_per_minute: tool.rate_limit_per_minute,
      cost_per_execution: tool.cost_per_execution,
      estimated_cost_per_call: tool.cost_per_execution,
      avg_response_time_ms: null,
      langgraph_compatible: tool.langgraph_compatible || false,
      langgraph_node_name: tool.langgraph_node_name,
      is_active: tool.is_active,
      is_premium: false,
      requires_approval: false,
      access_level: tool.access_level,
      required_env_vars: tool.required_env_vars,
      allowed_tenants: tool.allowed_tenants,
      allowed_roles: tool.allowed_roles,
      usage_examples: tool.example_usage,
      example_usage: tool.example_usage,
      best_practices: null,
      limitations: null,
      documentation_url: tool.documentation_url,
      total_calls: 0,
      success_rate: null,
      avg_confidence_score: null,
      metadata: tool.metadata,
      tags: tool.tags || [],
      tenant_id: tool.tenant_id,
      created_at: tool.created_at,
      updated_at: tool.updated_at,
    }));
  }

  /**
   * Get tools by lifecycle stage (e.g., only production tools)
   */
  async getToolsByLifecycleStage(
    stage: 'development' | 'testing' | 'staging' | 'production' | 'deprecated',
    includeInactive = false
  ): Promise<Tool[]> {
    let query = this.getSupabaseClient()
      .from('dh_tool')
      .select('*')
      .eq('lifecycle_stage', stage)
      .order('name');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    const allTools = await this.getAllTools(includeInactive);
    return allTools.filter(t => t.lifecycle_stage === stage);
  }

  /**
   * Get only production-ready tools
   */
  async getProductionTools(): Promise<Tool[]> {
    return this.getToolsByLifecycleStage('production', false);
  }

  /**
   * Get tools ready for testing
   */
  async getTestingTools(): Promise<Tool[]> {
    return this.getToolsByLifecycleStage('testing', false);
  }

  /**
   * Get tool by unique_id (was tool_key)
   */
  async getToolByKey(toolKey: string): Promise<Tool | null> {
    const { data, error } = await this.getSupabaseClient()
      .from('dh_tool')
      .select('*')
      .eq('unique_id', toolKey)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching tool:', error);
      return null;
    }

    if (!data) return null;

    // Map to Tool interface
    return {
      id: data.id,
      unique_id: data.unique_id,
      code: data.code,
      name: data.name,
      description: data.tool_description || data.notes || '',
      tool_description: data.tool_description,
      category: data.category,
      category_id: null,
      tool_type: data.tool_type || 'software_reference',
      implementation_type: data.implementation_type,
      implementation_path: data.implementation_path,
      function_name: data.function_name,
      api_endpoint: null,
      input_schema: data.input_schema,
      output_schema: data.output_schema,
      output_format: 'json',
      max_iterations: 3,
      timeout_seconds: data.max_execution_time_seconds || 30,
      is_async: data.is_async,
      max_execution_time_seconds: data.max_execution_time_seconds,
      retry_config: data.retry_config,
      rate_limit_per_minute: data.rate_limit_per_minute,
      cost_per_execution: data.cost_per_execution,
      estimated_cost_per_call: data.cost_per_execution,
      avg_response_time_ms: null,
      langgraph_compatible: data.langgraph_compatible || false,
      langgraph_node_name: data.langgraph_node_name,
      is_active: data.is_active,
      is_premium: false,
      requires_approval: false,
      access_level: data.access_level,
      required_env_vars: data.required_env_vars,
      allowed_tenants: data.allowed_tenants,
      allowed_roles: data.allowed_roles,
      usage_examples: data.example_usage,
      example_usage: data.example_usage,
      best_practices: null,
      limitations: null,
      documentation_url: data.documentation_url,
      total_calls: 0,
      success_rate: null,
      avg_confidence_score: null,
      metadata: data.metadata,
      tags: data.tags || [],
      tenant_id: data.tenant_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  /**
   * Get tools by category
   */
  async getToolsByCategory(categoryName: string): Promise<Tool[]> {
    const allTools = await this.getAllTools(false);
    return allTools.filter(t => 
      t.category?.toLowerCase() === categoryName.toLowerCase()
    );
  }

  /**
   * Get tools by tags
   */
  async getToolsByTags(tagNames: string[]): Promise<Tool[]> {
    const allTools = await this.getAllTools(false);
    return allTools.filter(t => 
      t.tags?.some(tag => tagNames.includes(tag.name))
    );
  }

  /**
   * Get all tool categories
   */
  async getToolCategories(): Promise<ToolCategory[]> {
    const { data, error } = await this.getSupabaseClient()
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
    let query = this.getSupabaseClient()
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
    const { data, error } = await this.getSupabaseClient()
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

    const { error } = await this.getSupabaseClient()
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
    const toolIds = tools.map((t: any) => t.id);
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
    const toolIds = tools.map((t: any) => t.id);
    await this.bulkAssignToolsToAgent(agentId, toolIds, options);
  }

  /**
   * Remove tool assignment from agent
   */
  async removeToolFromAgent(agentId: string, toolId: string): Promise<void> {
    const { error } = await this.getSupabaseClient()
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
    const { data, error } = await this.getSupabaseClient()
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
    const { error } = await this.getSupabaseClient()
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

    const { data, error } = await this.getSupabaseClient()
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
      allToolInstances.map((tool: any) => [tool.name, tool])
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
    const { data: assignment } = await this.getSupabaseClient()
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
        await this.getSupabaseClient()
          .from('agent_tool_assignments')
          .update({ current_day_usage: 0 })
          .eq('id', assignment.id);
      } else if (assignment.current_day_usage >= assignment.max_uses_per_day) {
        return false; // Daily limit exceeded
      }
    }

    // Check conversation limit
    if (assignment.max_uses_per_conversation && conversationId) {
      const { count } = await this.getSupabaseClient()
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
      times_used: this.getSupabaseClient().rpc('increment_times_used'),
      last_used_at: new Date().toISOString(),
      current_day_usage: this.getSupabaseClient().rpc('increment_current_day_usage')
    };

    if (success) {
      updateData.success_count = this.getSupabaseClient().rpc('increment_success_count');
    } else {
      updateData.failure_count = this.getSupabaseClient().rpc('increment_failure_count');
    }

    await this.getSupabaseClient()
      .from('agent_tool_assignments')
      .update(updateData)
      .eq('agent_id', agentId)
      .eq('tool_id', toolId);
  }
}

export const toolRegistryService = new ToolRegistryService();
export default toolRegistryService;
