/**
 * Supabase Client - Multi-Tenant Aware
 * Provides RLS-protected database access with automatic tenant context injection
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

// ============================================================================
// CLIENT COMPONENT CLIENT (Browser)
// ============================================================================

let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

/**
 * Get or create Supabase client for client components
 * Singleton pattern ensures one instance per browser session
 */
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseClient can only be used in client components');
  }

  if (!clientInstance) {
    clientInstance = createClientComponentClient<Database>();
  }

  return clientInstance;
}

// ============================================================================
// TENANT-AWARE QUERY BUILDER
// ============================================================================

/**
 * Tenant-aware database client
 * Automatically injects tenant_id in all queries for RLS compliance
 */
export class TenantAwareClient {
  private client: ReturnType<typeof getSupabaseClient>;
  private tenantId: string;

  constructor(tenantId: string, client?: ReturnType<typeof getSupabaseClient>) {
    if (!tenantId) {
      throw new Error('Tenant ID is required for tenant-aware client');
    }
    this.tenantId = tenantId;
    this.client = client || getSupabaseClient();
  }

  // ------------------------------------------------------------------------
  // TENANTS
  // ------------------------------------------------------------------------

  /**
   * Get current tenant configuration
   */
  async getTenant() {
    const { data, error } = await this.client
      .from('tenants')
      .select('*')
      .eq('id', this.tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update tenant configuration
   */
  async updateTenant(updates: Database['public']['Tables']['tenants']['Update']) {
    const { data, error } = await this.client
      .from('tenants')
      .update(updates)
      .eq('id', this.tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ------------------------------------------------------------------------
  // PANELS
  // ------------------------------------------------------------------------

  /**
   * List all panels for this tenant
   */
  panels() {
    return this.client
      .from('panels')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .order('created_at', { ascending: false });
  }

  /**
   * Get single panel by ID
   */
  async getPanel(panelId: string) {
    const { data, error } = await this.client
      .from('panels')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('id', panelId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create new panel
   */
  async createPanel(panel: Omit<Database['public']['Tables']['panels']['Insert'], 'tenant_id'>) {
    const { data, error } = await this.client
      .from('panels')
      .insert({
        ...panel,
        tenant_id: this.tenantId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update panel status
   */
  async updatePanel(panelId: string, updates: Database['public']['Tables']['panels']['Update']) {
    const { data, error } = await this.client
      .from('panels')
      .update(updates)
      .eq('tenant_id', this.tenantId)
      .eq('id', panelId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ------------------------------------------------------------------------
  // PANEL RESPONSES
  // ------------------------------------------------------------------------

  /**
   * Get all responses for a panel
   */
  panelResponses(panelId: string) {
    return this.client
      .from('panel_responses')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('panel_id', panelId)
      .order('created_at', { ascending: true });
  }

  /**
   * Subscribe to real-time panel responses
   */
  subscribeToPanelResponses(
    panelId: string,
    callback: (response: Database['public']['Tables']['panel_responses']['Row']) => void
  ) {
    return this.client
      .channel(`panel_responses:${panelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'panel_responses',
          filter: `panel_id=eq.${panelId}`,
        },
        (payload) => {
          callback(payload.new as Database['public']['Tables']['panel_responses']['Row']);
        }
      )
      .subscribe();
  }

  // ------------------------------------------------------------------------
  // CONSENSUS
  // ------------------------------------------------------------------------

  /**
   * Get latest consensus for a panel
   */
  async getConsensus(panelId: string) {
    const { data, error } = await this.client
      .from('panel_consensus')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('panel_id', panelId)
      .order('round_number', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  }

  /**
   * Subscribe to consensus updates
   */
  subscribeToConsensus(
    panelId: string,
    callback: (consensus: Database['public']['Tables']['panel_consensus']['Row']) => void
  ) {
    return this.client
      .channel(`panel_consensus:${panelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'panel_consensus',
          filter: `panel_id=eq.${panelId}`,
        },
        (payload) => {
          callback(payload.new as Database['public']['Tables']['panel_consensus']['Row']);
        }
      )
      .subscribe();
  }

  // ------------------------------------------------------------------------
  // AGENT USAGE
  // ------------------------------------------------------------------------

  /**
   * Get usage statistics for this tenant
   */
  async getUsageStats(startDate?: Date, endDate?: Date) {
    let query = this.client
      .from('agent_usage')
      .select('*')
      .eq('tenant_id', this.tenantId);

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get total usage cost for this tenant
   */
  async getTotalCost(startDate?: Date, endDate?: Date) {
    let query = this.client
      .from('agent_usage')
      .select('cost_usd')
      .eq('tenant_id', this.tenantId);

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;
    
    const totalCost = data.reduce((sum, record) => sum + (record.cost_usd || 0), 0);
    return totalCost;
  }

  // ------------------------------------------------------------------------
  // TEAM MANAGEMENT
  // ------------------------------------------------------------------------

  /**
   * Get all users for this tenant
   */
  async getTenantUsers() {
    const { data, error } = await this.client
      .from('tenant_users')
      .select('*, user:user_id(*)')
      .eq('tenant_id', this.tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Check if user has access to tenant
   */
  async validateUserAccess(userId: string) {
    const { data, error } = await this.client
      .from('tenant_users')
      .select('role, status')
      .eq('tenant_id', this.tenantId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) return { hasAccess: false, role: null };
    return { hasAccess: true, role: data.role };
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

/**
 * Handle Supabase errors with proper typing
 */
export function handleSupabaseError(error: unknown): never {
  if (typeof error === 'object' && error !== null) {
    const err = error as { message?: string; code?: string; details?: unknown };
    throw new SupabaseError(
      err.message || 'An unknown error occurred',
      err.code,
      err.details
    );
  }
  throw new SupabaseError('An unknown error occurred');
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Extract tenant ID from subdomain
 */
export function getTenantIdFromSubdomain(hostname: string): string | null {
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const subdomain = parts[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
      return subdomain;
    }
  }
  return null;
}

/**
 * Check if error is RLS violation
 */
export function isRLSError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const err = error as { code?: string };
    return err.code === '42501'; // PostgreSQL insufficient privilege error
  }
  return false;
}

