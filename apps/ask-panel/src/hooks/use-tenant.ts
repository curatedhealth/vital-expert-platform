/**
 * Tenant Context Hook
 * Manages tenant detection, authentication, and configuration
 */

'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient, TenantAwareClient } from '@/lib/supabase/client';
import type { Tenant } from '@/types/database.types';

interface TenantContextValue {
  tenantId: string | null;
  tenant: Tenant | null;
  isLoading: boolean;
  error: Error | null;
  features: Tenant['features'];
  settings: Tenant['settings'];
  branding: Tenant['branding'];
  canCreatePanels: boolean;
  db: TenantAwareClient | null;
}

/**
 * Hook to access current tenant context
 * Automatically detects tenant from subdomain or user authentication
 */
export function useTenant(): TenantContextValue {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  // Extract tenant from subdomain or auth context
  useEffect(() => {
    const extractTenant = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        // Method 1: Extract from subdomain
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];

        if (subdomain && subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'localhost') {
          // Fetch tenant by subdomain
          const { data: tenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('subdomain', subdomain)
            .eq('status', 'active')
            .single();

          if (tenant) {
            setTenantId(tenant.id);
            return;
          }
        }

        // Method 2: Get from authenticated user's tenant
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: tenantUser } = await supabase
            .from('tenant_users')
            .select('tenant_id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('last_active_at', { ascending: false })
            .limit(1)
            .single();

          if (tenantUser) {
            setTenantId(tenantUser.tenant_id);
          }
        }
      } catch (error) {
        console.error('Failed to extract tenant:', error);
      }
    };

    extractTenant();
  }, []);

  // Fetch tenant configuration
  const { data: tenant, isLoading, error } = useQuery<Tenant>({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('No tenant ID');

      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Check if tenant can create panels based on subscription limits
  const canCreatePanels = tenant ? 
    tenant.status === 'active' && tenant.features && Object.values(tenant.features).some(f => f) : 
    false;

  // Create tenant-aware database client
  const db = tenantId ? new TenantAwareClient(tenantId, supabase) : null;

  return {
    tenantId,
    tenant: tenant || null,
    isLoading,
    error: error as Error | null,
    features: tenant?.features || {
      structured_panel: false,
      open_panel: false,
      socratic_panel: false,
      adversarial_panel: false,
      delphi_panel: false,
      hybrid_panel: false,
    },
    settings: tenant?.settings || {
      max_panels_per_month: 0,
      max_experts_per_panel: 0,
      enable_streaming: false,
      enable_consensus: false,
      enable_exports: false,
      enable_api_access: false,
    },
    branding: tenant?.branding || {
      primary_color: '#3B82F6',
      font_family: 'Inter',
    },
    canCreatePanels,
    db,
  };
}

/**
 * Hook to access tenant-aware database client
 */
export function useTenantDb() {
  const { tenantId } = useTenant();
  
  if (!tenantId) {
    throw new Error('useTenantDb must be used within a tenant context');
  }

  return new TenantAwareClient(tenantId);
}

