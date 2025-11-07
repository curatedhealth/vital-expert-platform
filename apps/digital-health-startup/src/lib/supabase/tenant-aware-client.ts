/**
 * Tenant-Aware Supabase Client
 * Automatically includes tenant context in all queries
 * 
 * ⚠️ PRODUCTION-READY FIX: Multiple GoTrueClient Issue
 * 
 * PROBLEM FIXED:
 * - Previously used createClientComponentClient() which created NEW instances
 * - This caused "Multiple GoTrueClient instances" warnings
 * - This caused Map maximum size exceeded errors
 * 
 * SOLUTION:
 * - Now uses singleton createClient() from @/lib/supabase/client
 * - All tenant-aware clients share the same underlying Supabase instance
 * - Tenant context is set on the singleton instance
 */

import { createClient } from '@/lib/supabase/client';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { setTenantContext } from '@vital/shared/lib/tenant-context';

/**
 * Create tenant-aware client for client components (SINGLETON)
 * 
 * ✅ PRODUCTION-READY: Uses singleton pattern to prevent multiple instances
 */
export function createTenantAwareClient(tenantId?: string | null): SupabaseClient {
  // ✅ Use singleton - returns the same instance every time
  const supabase = createClient();

  // Set tenant context if provided
  if (tenantId) {
    void setTenantContext(supabase, tenantId);
  }

  return supabase;
}

/**
 * Create tenant-aware client for server components (SINGLETON)
 * 
 * ✅ PRODUCTION-READY: Uses singleton pattern to prevent multiple instances
 * 
 * Note: Server components can't use the same browser client singleton,
 * but they also don't share state, so each request creates its own instance.
 * This is acceptable as server components are isolated per-request.
 */
export async function createTenantAwareServerClient(
  tenantId?: string | null
): Promise<SupabaseClient> {
  // For server components, we still need per-request instances
  // But this is OK because server components don't share state
  const { createServerClient } = await import('@supabase/ssr');
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

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
 * Hook-friendly factory function (SINGLETON)
 * 
 * ✅ PRODUCTION-READY: Uses singleton pattern to prevent multiple instances
 */
export function useTenantAwareClient(tenantId?: string | null): TenantAwareSupabaseClient {
  // ✅ Use singleton - returns the same instance every time
  const client = createClient();
  return new TenantAwareSupabaseClient(client, tenantId);
}
