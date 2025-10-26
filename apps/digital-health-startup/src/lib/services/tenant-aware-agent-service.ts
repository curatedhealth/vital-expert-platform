/**
 * Tenant-Aware Agent Service
 * Handles agent operations with multi-tenant support
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AgentWithTenant } from '@vital/shared/types/tenant.types';

export interface AgentFilters {
  includeShared?: boolean;
  includePrivate?: boolean;
  resourceType?: 'platform' | 'custom' | 'shared' | 'tenant_specific';
  sharingMode?: 'private' | 'global' | 'selective';
  search?: string;
}

export class TenantAwareAgentService {
  constructor(
    private supabase: SupabaseClient,
    private tenantId: string | null
  ) {}

  /**
   * Get all agents accessible to current tenant
   * RLS policies automatically filter based on tenant context
   */
  async getAgents(filters: AgentFilters = {}): Promise<AgentWithTenant[]> {
    const {
      includeShared = true,
      includePrivate = true,
      resourceType,
      sharingMode,
      search,
    } = filters;

    let query = this.supabase.from('agents').select('*');

    // Apply filters
    if (!includeShared) {
      query = query.eq('is_shared', false);
    }

    if (!includePrivate && this.tenantId) {
      query = query.or(`is_shared.eq.true,tenant_id.neq.${this.tenantId}`);
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    if (sharingMode) {
      query = query.eq('sharing_mode', sharingMode);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch agents:', error);
      throw error;
    }

    return (data as AgentWithTenant[]) || [];
  }

  /**
   * Get platform agents (globally shared)
   */
  async getPlatformAgents(): Promise<AgentWithTenant[]> {
    const { data, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('resource_type', 'platform')
      .eq('is_shared', true)
      .eq('sharing_mode', 'global');

    if (error) {
      console.error('Failed to fetch platform agents:', error);
      throw error;
    }

    return (data as AgentWithTenant[]) || [];
  }

  /**
   * Get tenant-specific agents (created by current tenant)
   */
  async getTenantAgents(): Promise<AgentWithTenant[]> {
    if (!this.tenantId) {
      return [];
    }

    const { data, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('tenant_id', this.tenantId);

    if (error) {
      console.error('Failed to fetch tenant agents:', error);
      throw error;
    }

    return (data as AgentWithTenant[]) || [];
  }

  /**
   * Get shared agents (accessible via sharing)
   */
  async getSharedAgents(): Promise<AgentWithTenant[]> {
    const { data, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('is_shared', true)
      .neq('tenant_id', this.tenantId || '');

    if (error) {
      console.error('Failed to fetch shared agents:', error);
      throw error;
    }

    return (data as AgentWithTenant[]) || [];
  }

  /**
   * Get agent by ID (with tenant access check via RLS)
   */
  async getAgentById(agentId: string): Promise<AgentWithTenant | null> {
    const { data, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - either doesn't exist or no access
        return null;
      }
      console.error('Failed to fetch agent:', error);
      throw error;
    }

    return data as AgentWithTenant;
  }

  /**
   * Create new agent for current tenant
   */
  async createAgent(agentData: {
    name: string;
    description: string;
    system_prompt: string;
    model: string;
    temperature?: number;
    max_tokens?: number;
    capabilities?: string[];
    is_shared?: boolean;
    sharing_mode?: 'private' | 'global' | 'selective';
    shared_with?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<AgentWithTenant> {
    if (!this.tenantId) {
      throw new Error('No tenant context - cannot create agent');
    }

    const { data, error } = await this.supabase
      .from('agents')
      .insert({
        ...agentData,
        tenant_id: this.tenantId,
        resource_type: 'custom',
        is_shared: agentData.is_shared ?? false,
        sharing_mode: agentData.sharing_mode ?? 'private',
        shared_with: agentData.shared_with ?? [],
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create agent:', error);
      throw error;
    }

    return data as AgentWithTenant;
  }

  /**
   * Update agent (only if tenant has permission via RLS)
   */
  async updateAgent(
    agentId: string,
    updates: Partial<AgentWithTenant>
  ): Promise<AgentWithTenant> {
    const { data, error} = await this.supabase
      .from('agents')
      .update(updates)
      .eq('id', agentId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update agent:', error);
      throw error;
    }

    return data as AgentWithTenant;
  }

  /**
   * Delete agent (only if tenant has permission via RLS)
   */
  async deleteAgent(agentId: string): Promise<void> {
    const { error } = await this.supabase
      .from('agents')
      .delete()
      .eq('id', agentId);

    if (error) {
      console.error('Failed to delete agent:', error);
      throw error;
    }
  }

  /**
   * Share agent with other tenants (selective sharing)
   */
  async shareAgent(
    agentId: string,
    tenantIds: string[]
  ): Promise<AgentWithTenant> {
    // First verify we own this agent
    const agent = await this.getAgentById(agentId);

    if (!agent || agent.tenant_id !== this.tenantId) {
      throw new Error('Agent not found or access denied');
    }

    return this.updateAgent(agentId, {
      is_shared: true,
      sharing_mode: 'selective',
      shared_with: tenantIds,
    });
  }

  /**
   * Make agent globally shared
   */
  async makeGloballyShared(agentId: string): Promise<AgentWithTenant> {
    return this.updateAgent(agentId, {
      is_shared: true,
      sharing_mode: 'global',
    });
  }

  /**
   * Make agent private (remove sharing)
   */
  async makePrivate(agentId: string): Promise<AgentWithTenant> {
    return this.updateAgent(agentId, {
      is_shared: false,
      sharing_mode: 'private',
      shared_with: [],
    });
  }

  /**
   * Get agent statistics for current tenant
   */
  async getAgentStats(): Promise<{
    total: number;
    platform: number;
    custom: number;
    shared: number;
  }> {
    const agents = await this.getAgents();

    return {
      total: agents.length,
      platform: agents.filter((a) => a.resource_type === 'platform').length,
      custom: agents.filter((a) => a.tenant_id === this.tenantId).length,
      shared: agents.filter(
        (a) => a.is_shared && a.tenant_id !== this.tenantId
      ).length,
    };
  }
}

/**
 * Factory function to create tenant-aware agent service
 */
export function createTenantAwareAgentService(
  supabase: SupabaseClient,
  tenantId: string | null
): TenantAwareAgentService {
  return new TenantAwareAgentService(supabase, tenantId);
}
