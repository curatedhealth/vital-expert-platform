import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export type Agent = Database['public']['Tables']['agents']['Row'];
export type AgentCategory = Database['public']['Tables']['agent_categories']['Row'];
export type AgentCollaboration = Database['public']['Tables']['agent_collaborations']['Row'];
export interface AgentPerformanceMetrics {
  accuracy_score: number | null;
  agent_id: string | null;
  avg_response_time_ms: number;
  completeness_score: number | null;
  created_at: string;
  decisions_supported: number;
  documents_generated: number;
  id: string;
  user_satisfaction_score: number | null;
}
export type Capability = Database['public']['Tables']['capabilities']['Row'];
export type AgentCapability = Database['public']['Tables']['agent_capabilities']['Row'];
export type CapabilityCategory = Database['public']['Tables']['capability_categories']['Row'];

export interface AgentWithCategories extends Agent {
  categories: AgentCategory[];
}

export interface AgentWithMetrics extends Omit<Agent, 'performance_metrics'> {
  performance_metrics?: AgentPerformanceMetrics;
}

export interface AgentWithCapabilities extends Agent {
  capabilities_detail: (AgentCapability & { capability: Capability })[];
  primary_capabilities: (AgentCapability & { capability: Capability })[];
}

export interface CapabilityWithProficiency extends Capability {
  proficiency_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  is_primary: boolean;
}

export class AgentService {
  private supabase = supabase;

  // Get all active agents
  async getActiveAgents(): Promise<AgentWithCategories[]> {
    console.log('🔍 AgentService: Loading active agents from database...');

    const { data, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('status', 'active')
      .order('tier', { ascending: true })
      .order('priority', { ascending: true })
      .limit(1000); // Explicitly set a high limit to ensure we get all agents

    if (error) {
      console.error('❌ Error fetching agents:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw new Error('Failed to fetch agents');
    }

    console.log(`✅ AgentService: Loaded ${data?.length || 0} agents from database`);
    console.log('📋 Agent names:', data?.map(a => a.display_name || a.name));

    // Transform the data to include empty categories array since categories tables don't exist yet
    return data?.map(agent => ({
      ...agent,
      categories: []
    })) || [];
  }

  // Get agents by tier
  async getAgentsByTier(tier: number): Promise<AgentWithCategories[]> {
    const { data, error } = await this.supabase
      .from('agents')
      .select(`
        *,
        agent_category_mapping(
          agent_categories(*)
        )
      `)
      .eq('status', 'active')
      .eq('tier', tier)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching agents by tier:', error);
      throw new Error('Failed to fetch agents by tier');
    }

    return data?.map(agent => ({
      ...agent,
      categories: agent.agent_category_mapping?.map((mapping: any) => mapping.agent_categories) || []
    })) || [];
  }

  // Get agents by implementation phase
  async getAgentsByPhase(phase: number): Promise<AgentWithCategories[]> {
    const { data, error } = await this.supabase
      .from('agents')
      .select(`
        *,
        agent_category_mapping(
          agent_categories(*)
        )
      `)
      .eq('status', 'active')
      .eq('implementation_phase', phase)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching agents by phase:', error);
      throw new Error('Failed to fetch agents by phase');
    }

    return data?.map(agent => ({
      ...agent,
      categories: agent.agent_category_mapping?.map((mapping: any) => mapping.agent_categories) || []
    })) || [];
  }

  // Get agents by category
  async getAgentsByCategory(categoryName: string): Promise<AgentWithCategories[]> {
    const { data, error } = await this.supabase
      .from('agents')
      .select(`
        *,
        agent_category_mapping!inner(
          agent_categories!inner(*)
        )
      `)
      .eq('status', 'active')
      .eq('agent_category_mapping.agent_categories.name', categoryName)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching agents by category:', error);
      throw new Error('Failed to fetch agents by category');
    }

    return data?.map(agent => ({
      ...agent,
      categories: agent.agent_category_mapping?.map((mapping: any) => mapping.agent_categories) || []
    })) || [];
  }

  // Get single agent by ID
  async getAgentById(id: string): Promise<AgentWithCategories | null> {
    const { data, error } = await this.supabase
      .from('agents')
      .select(`
        *,
        agent_category_mapping(
          agent_categories(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching agent by ID:', error);
      return null;
    }

    return data ? {
      ...data,
      categories: data.agent_category_mapping?.map((mapping: any) => mapping.agent_categories) || []
    } : null;
  }

  // Get single agent by name
  async getAgentByName(name: string): Promise<AgentWithCategories | null> {
    const { data, error } = await this.supabase
      .from('agents')
      .select(`
        *,
        agent_category_mapping(
          agent_categories(*)
        )
      `)
      .eq('name', name)
      .single();

    if (error) {
      console.error('Error fetching agent by name:', error);
      return null;
    }

    return data ? {
      ...data,
      categories: data.agent_category_mapping?.map((mapping: any) => mapping.agent_categories) || []
    } : null;
  }

  // Get all categories
  async getCategories(): Promise<AgentCategory[]> {
    const { data, error } = await this.supabase
      .from('agent_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }

    return data || [];
  }

  // Get agent collaborations
  async getCollaborations(): Promise<AgentCollaboration[]> {
    const { data, error } = await this.supabase
      .from('agent_collaborations')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching collaborations:', error);
      throw new Error('Failed to fetch collaborations');
    }

    return data || [];
  }

  // Get agents with performance metrics
  async getAgentsWithMetrics(userId?: string): Promise<AgentWithMetrics[]> {
    const { data, error } = await this.supabase
      .from('agents')
      .select(`
        *,
        agent_performance_metrics(*)
      `)
      .eq('status', 'active')
      .eq(userId ? 'agent_performance_metrics.user_id' : 'agent_performance_metrics.user_id', userId || null)
      .order('tier', { ascending: true })
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching agents with metrics:', error);
      throw new Error('Failed to fetch agents with metrics');
    }

    return data?.map(agent => ({
      ...agent,
      performance_metrics: agent.agent_performance_metrics?.[0] || undefined
    })) || [];
  }

  // Create custom agent
  async createCustomAgent(
    agentData: Database['public']['Tables']['agents']['Insert'],
    categoryIds: string[] = []
  ): Promise<AgentWithCategories> {
    const { data, error } = await this.supabase
      .from('agents')
      .insert({
        ...agentData,
        is_custom: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating custom agent:', error);
      throw new Error('Failed to create custom agent');
    }

    // Add category mappings if provided
    if (categoryIds.length > 0) {
      const mappings = categoryIds.map(categoryId => ({
        agent_id: data.id,
        category_id: categoryId
      }));

      await this.supabase
        .from('agent_category_mapping')
        .insert(mappings);
    }

    // Return the created agent with categories
    const createdAgent = await this.getAgentById(data.id);
    if (!createdAgent) {
      throw new Error('Failed to retrieve created agent');
    }

    return createdAgent;
  }

  // Update agent
  async updateAgent(
    id: string,
    updates: Database['public']['Tables']['agents']['Update']
  ): Promise<AgentWithCategories> {
    console.log('🔧 AgentService.updateAgent: Starting...');
    console.log('- Agent ID:', id);
    console.log('- Agent ID type:', typeof id);
    console.log('- Updates to apply:', updates);
    console.log('- Update keys:', Object.keys(updates));

    const { data, error } = await this.supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ AgentService.updateAgent: Supabase error');
      console.error('- Error:', error);
      console.error('- Error code:', error.code);
      console.error('- Error message:', error.message);
      console.error('- Error details:', error.details);
      
      // Provide more specific error message based on error code
      let errorMessage = 'Failed to update agent';
      if (error.code === '23505') {
        errorMessage = 'Agent name or display name already exists';
      } else if (error.code === '23503') {
        errorMessage = 'Invalid reference in agent data';
      } else if (error.code === '42501') {
        errorMessage = 'Permission denied - insufficient privileges';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }

    console.log('✅ AgentService.updateAgent: Supabase update successful');
    console.log('- Updated data:', data);

    const updatedAgent = await this.getAgentById(data.id);
    if (!updatedAgent) {
      throw new Error('Failed to retrieve updated agent');
    }

    return updatedAgent;
  }

  // Delete agent (soft delete by setting status to 'deprecated')
  async deleteAgent(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('agents')
      .update({ status: 'deprecated' })
      .eq('id', id);

    if (error) {
      console.error('Error deleting agent:', error);
      throw new Error('Failed to delete agent');
    }
  }

  // Record agent performance metrics
  async recordMetrics(
    agentId: string,
    userId: string,
    metrics: Partial<Database['public']['Tables']['agent_performance_metrics']['Insert']>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('agent_performance_metrics')
      .upsert({
        agent_id: agentId,
        user_id: userId,
        metric_date: new Date().toISOString().split('T')[0],
        ...metrics
      }, {
        onConflict: 'agent_id,user_id,metric_date'
      });

    if (error) {
      console.error('Error recording metrics:', error);
      throw new Error('Failed to record metrics');
    }
  }

  // Search agents by text
  async searchAgents(searchTerm: string): Promise<AgentWithCategories[]> {
    const { data, error } = await this.supabase
      .from('agents')
      .select(`
        *,
        agent_category_mapping(
          agent_categories(*)
        )
      `)
      .eq('status', 'active')
      .or(`display_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,capabilities.cs.["${searchTerm}"]`)
      .order('tier', { ascending: true })
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error searching agents:', error);
      throw new Error('Failed to search agents');
    }

    return data?.map(agent => ({
      ...agent,
      categories: agent.agent_category_mapping?.map((mapping: any) => mapping.agent_categories) || []
    })) || [];
  }

  // ===== CAPABILITIES METHODS =====

  // Get all capabilities
  async getCapabilities(): Promise<Capability[]> {
    const { data, error } = await this.supabase
      .from('capabilities')
      .select('*')
      .eq('status', 'active')
      .order('category', { ascending: true })
      .order('display_name', { ascending: true });

    if (error) {
      console.error('Error fetching capabilities:', error);
      throw new Error('Failed to fetch capabilities');
    }

    return data || [];
  }

  // Get capabilities by category
  async getCapabilitiesByCategory(category: string): Promise<Capability[]> {
    const { data, error } = await this.supabase
      .from('capabilities')
      .select('*')
      .eq('status', 'active')
      .eq('category', category)
      .order('display_name', { ascending: true });

    if (error) {
      console.error('Error fetching capabilities by category:', error);
      throw new Error('Failed to fetch capabilities by category');
    }

    return data || [];
  }

  // Get capability categories
  async getCapabilityCategories(): Promise<CapabilityCategory[]> {
    const { data, error } = await this.supabase
      .from('capability_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching capability categories:', error);
      throw new Error('Failed to fetch capability categories');
    }

    return data || [];
  }

  // Get agent with detailed capabilities
  async getAgentWithCapabilities(agentId: string): Promise<AgentWithCapabilities | null> {
    const { data, error } = await this.supabase
      .from('agents')
      .select(`
        *,
        agent_capabilities(
          *,
          capability:capabilities(*)
        )
      `)
      .eq('id', agentId)
      .single();

    if (error) {
      console.error('Error fetching agent with capabilities:', error);
      return null;
    }

    if (!data) return null;

    const capabilitiesDetail = data.agent_capabilities?.map((ac: any) => ({
      ...ac,
      capability: ac.capability
    })) || [];

    return {
      ...data,
      capabilities_detail: capabilitiesDetail,
      primary_capabilities: capabilitiesDetail.filter((cap: any) => cap.is_primary)
    };
  }

  // Get agents by capability
  async getAgentsByCapability(capabilityName: string): Promise<AgentWithCategories[]> {
    const { data, error } = await this.supabase
      .from('agents')
      .select(`
        *,
        agent_category_mapping(
          agent_categories(*)
        ),
        agent_capabilities!inner(
          capability:capabilities!inner(*)
        )
      `)
      .eq('status', 'active')
      .eq('agent_capabilities.capability.name', capabilityName)
      .order('tier', { ascending: true })
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching agents by capability:', error);
      throw new Error('Failed to fetch agents by capability');
    }

    return data?.map(agent => ({
      ...agent,
      categories: agent.agent_category_mapping?.map((mapping: any) => mapping.agent_categories) || []
    })) || [];
  }

  // Add capability to agent
  async addCapabilityToAgent(
    agentId: string,
    capabilityId: string,
    proficiencyLevel: 'basic' | 'intermediate' | 'advanced' | 'expert' = 'intermediate',
    isPrimary: boolean = false
  ): Promise<void> {
    const { error } = await this.supabase
      .from('agent_capabilities')
      .insert({
        agent_id: agentId,
        capability_id: capabilityId,
        proficiency_level: proficiencyLevel,
        is_primary: isPrimary
      });

    if (error) {
      console.error('Error adding capability to agent:', error);
      throw new Error('Failed to add capability to agent');
    }
  }

  // Remove capability from agent
  async removeCapabilityFromAgent(agentId: string, capabilityId: string): Promise<void> {
    const { error } = await this.supabase
      .from('agent_capabilities')
      .delete()
      .eq('agent_id', agentId)
      .eq('capability_id', capabilityId);

    if (error) {
      console.error('Error removing capability from agent:', error);
      throw new Error('Failed to remove capability from agent');
    }
  }

  // Update agent capability proficiency
  async updateAgentCapabilityProficiency(
    agentId: string,
    capabilityId: string,
    proficiencyLevel: 'basic' | 'intermediate' | 'advanced' | 'expert'
  ): Promise<void> {
    const { error } = await this.supabase
      .from('agent_capabilities')
      .update({ proficiency_level: proficiencyLevel })
      .eq('agent_id', agentId)
      .eq('capability_id', capabilityId);

    if (error) {
      console.error('Error updating capability proficiency:', error);
      throw new Error('Failed to update capability proficiency');
    }
  }

  // Search capabilities
  async searchCapabilities(searchTerm: string): Promise<Capability[]> {
    const { data, error } = await this.supabase
      .from('capabilities')
      .select('*')
      .eq('status', 'active')
      .or(`display_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,domain.ilike.%${searchTerm}%`)
      .order('display_name', { ascending: true });

    if (error) {
      console.error('Error searching capabilities:', error);
      throw new Error('Failed to search capabilities');
    }

    return data || [];
  }

  // Get capability usage statistics
  async getCapabilityStats(capabilityId: string): Promise<{
    total_agents: number;
    proficiency_distribution: Record<string, number>;
    usage_count: number;
    success_rate: number;
  }> {
    const { data, error } = await this.supabase
      .from('agent_capabilities')
      .select('proficiency_level, usage_count, success_rate')
      .eq('capability_id', capabilityId);

    if (error) {
      console.error('Error fetching capability stats:', error);
      throw new Error('Failed to fetch capability stats');
    }

    const stats = data?.reduce((acc, item) => {
      acc.total_agents += 1;
      acc.proficiency_distribution[item.proficiency_level] = (acc.proficiency_distribution[item.proficiency_level] || 0) + 1;
      acc.usage_count += item.usage_count;
      acc.success_rate += item.success_rate;
      return acc;
    }, {
      total_agents: 0,
      proficiency_distribution: {} as Record<string, number>,
      usage_count: 0,
      success_rate: 0
    }) || { total_agents: 0, proficiency_distribution: {}, usage_count: 0, success_rate: 0 };

    if (stats.total_agents > 0) {
      stats.success_rate = stats.success_rate / stats.total_agents;
    }

    return stats;
  }

  // Convert database agent to chat store format (enhanced with capabilities)
  async convertToLegacyFormatWithCapabilities(agent: Agent): Promise<any> {
    const agentWithCapabilities = await this.getAgentWithCapabilities(agent.id);

    const capabilityNames = agentWithCapabilities?.capabilities_detail?.map(
      (ac) => ac.capability.display_name
    ) || [];

    return {
      id: agent.name,
      name: agent.display_name,
      description: agent.description,
      systemPrompt: agent.system_prompt,
      model: agent.model,
      avatar: agent.avatar,
      color: agent.color,
      capabilities: capabilityNames,
      ragEnabled: agent.rag_enabled,
      temperature: agent.temperature,
      maxTokens: agent.max_tokens,
      isCustom: agent.is_custom,
    };
  }

  // Convert database agent to chat store format
  convertToLegacyFormat(agent: Agent): any {
    return {
      id: agent.name,
      name: agent.display_name,
      description: agent.description,
      systemPrompt: agent.system_prompt,
      model: agent.model,
      avatar: agent.avatar,
      color: agent.color,
      capabilities: Array.isArray(agent.capabilities) ? agent.capabilities as string[] : [],
      ragEnabled: agent.rag_enabled,
      temperature: agent.temperature,
      maxTokens: agent.max_tokens,
      isCustom: agent.is_custom,
    };
  }
}

export const agentService = new AgentService();