/**
 * Tenant-Aware Supabase Client
 * Automatically includes tenant context in all queries
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { setTenantContext } from '@vital/shared/lib/tenant-context';

/**
 * Create tenant-aware client for client components
 */
export function createTenantAwareClient(tenantId?: string | null): SupabaseClient {
  const supabase = createClientComponentClient();

  // Set tenant context if provided
  if (tenantId) {
    void setTenantContext(supabase, tenantId);
  }

  return supabase;
}

/**
 * Create tenant-aware client for server components
 */
export async function createTenantAwareServerClient(
  tenantId?: string | null
): Promise<SupabaseClient> {
  const supabase = createServerComponentClient({ cookies });

  // Set tenant context if provided
  if (tenantId) {
    await setTenantContext(supabase, tenantId);
  }

  return supabase;
}

/**
 * Wrapper for Supabase queries with automatic tenant context
 */
export class TenantAwareSupabaseClient {
  private client: SupabaseClient;
  private tenantId: string | null;

  constructor(client: SupabaseClient, tenantId: string | null = null) {
    this.client = client;
    this.tenantId = tenantId;
  }

  /**
   * Initialize tenant context
   */
  async init(): Promise<void> {
    if (this.tenantId) {
      await setTenantContext(this.client, this.tenantId);
    }
  }

  /**
   * Query agents with tenant context automatically applied
   */
  async getAgents(filters?: {
    includeShared?: boolean;
    includePrivate?: boolean;
    resourceType?: string;
  }) {
    const { includeShared = true, includePrivate = true } = filters || {};

    let query = this.client.from('agents').select('*');

    // RLS policies will automatically filter based on tenant context
    // But we can add additional client-side filters

    if (!includeShared) {
      query = query.eq('is_shared', false);
    }

    if (!includePrivate) {
      query = query.eq('is_shared', true);
    }

    return query;
  }

  /**
   * Get shared platform agents (accessible to all tenants)
   */
  async getPlatformAgents() {
    return this.client
      .from('agents')
      .select('*')
      .eq('is_shared', true)
      .eq('sharing_mode', 'global')
      .eq('resource_type', 'platform');
  }

  /**
   * Get tenant-specific agents only
   */
  async getTenantAgents() {
    if (!this.tenantId) {
      throw new Error('No tenant context set');
    }

    return this.client
      .from('agents')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('is_shared', false);
  }

  /**
   * Create agent for current tenant
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
    metadata?: Record<string, unknown>;
  }) {
    if (!this.tenantId) {
      throw new Error('No tenant context set');
    }

    return this.client.from('agents').insert({
      ...agentData,
      tenant_id: this.tenantId,
      resource_type: 'custom',
      is_shared: agentData.is_shared ?? false,
      sharing_mode: agentData.sharing_mode ?? 'private',
    });
  }

  /**
   * Get raw Supabase client (for advanced usage)
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Update tenant context
   */
  async setTenant(tenantId: string | null): Promise<void> {
    this.tenantId = tenantId;
    await setTenantContext(this.client, tenantId);
  }
}

/**
 * Hook-friendly factory function
 */
export function useTenantAwareClient(tenantId?: string | null): TenantAwareSupabaseClient {
  const client = createClientComponentClient();
  return new TenantAwareSupabaseClient(client, tenantId);
}
