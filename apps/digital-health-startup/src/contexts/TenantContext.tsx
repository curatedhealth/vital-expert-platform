'use client';

/**
 * Tenant Context Provider - Simplified Version
 * Manages tenant state and switching across the application
 *
 * Note: Simplified to avoid monorepo dependency conflicts.
 * Uses local Supabase client instead of shared package utilities.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

// Platform Tenant ID (default/fallback)
const PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// Tenant type (simplified from shared types)
type Tenant = {
  id: string;
  name: string;
  slug: string;
  type: 'platform' | 'client' | 'solution' | 'industry';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

// Tenant Context interface
interface ITenantContext {
  currentTenant: Tenant | null;
  availableTenants: Tenant[];
  userRole: string | null;
  isPlatformAdmin: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
}

const TenantContext = createContext<ITenantContext | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<any>(null);

  // Load user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [userRole, setUserRole] = useState<ITenantContext['userRole']>(null);
  const [isPlatformAdminFlag, setIsPlatformAdminFlag] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Load user's tenants and set default - Simplified version
   */
  const loadTenants = useCallback(async () => {
    if (!user) {
      // No user - use Platform Tenant as default
      const platformTenant: Tenant = {
        id: PLATFORM_TENANT_ID,
        name: 'VITAL Platform',
        slug: 'platform',
        type: 'platform',
        is_active: true,
      };
      setCurrentTenant(platformTenant);
      setAvailableTenants([platformTenant]);
      setUserRole(null);
      setIsPlatformAdminFlag(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check if user has admin role
      const { data: adminCheck } = await supabase
        .from('user_tenants')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .limit(1);

      setIsPlatformAdminFlag((adminCheck?.length || 0) > 0);

      // Get user's tenants via user_tenants join
      const { data: userTenantData } = await supabase
        .from('user_tenants')
        .select(`
          role,
          tenant:tenants(
            id,
            name,
            slug,
            type,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (userTenantData && userTenantData.length > 0) {
        const tenants = userTenantData
          .map((ut: any) => ut.tenant)
          .filter((t: any) => t && t.is_active) as Tenant[];

        setAvailableTenants(tenants);

        // Use first tenant as default
        const defaultTenant = tenants[0];
        setCurrentTenant(defaultTenant);
        setUserRole(userTenantData[0].role);

        // Store in localStorage
        localStorage.setItem('vital_current_tenant_id', defaultTenant.id);
      } else {
        // No tenants assigned - use Platform Tenant
        const platformTenant: Tenant = {
          id: PLATFORM_TENANT_ID,
          name: 'VITAL Platform',
          slug: 'platform',
          type: 'platform',
          is_active: true,
        };
        setCurrentTenant(platformTenant);
        setAvailableTenants([platformTenant]);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);
      // Fallback to Platform Tenant on error
      const platformTenant: Tenant = {
        id: PLATFORM_TENANT_ID,
        name: 'VITAL Platform',
        slug: 'platform',
        type: 'platform',
        is_active: true,
      };
      setCurrentTenant(platformTenant);
      setAvailableTenants([platformTenant]);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  /**
   * Switch to a different tenant - Simplified version
   */
  const switchTenant = useCallback(
    async (tenantId: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        const newTenant = availableTenants.find((t) => t.id === tenantId);
        if (newTenant) {
          setCurrentTenant(newTenant);

          // Get user role for new tenant
          const { data: userTenantData } = await supabase
            .from('user_tenants')
            .select('role')
            .eq('user_id', user.id)
            .eq('tenant_id', tenantId)
            .single();

          if (userTenantData) {
            setUserRole(userTenantData.role);
          }

          // Store in localStorage for persistence
          localStorage.setItem('vital_current_tenant_id', tenantId);

          // Optionally reload page to apply new tenant context
          // window.location.reload();
        }
      } catch (error) {
        console.error('Failed to switch tenant:', error);
        throw error;
      }
    },
    [user, supabase, availableTenants]
  );

  /**
   * Refresh tenants list
   */
  const refreshTenants = useCallback(async () => {
    await loadTenants();
  }, [loadTenants]);

  // Load tenants when user changes
  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  // Restore tenant from localStorage on mount
  useEffect(() => {
    if (availableTenants.length > 0 && user) {
      const storedTenantId = localStorage.getItem('vital_current_tenant_id');
      if (storedTenantId && storedTenantId !== currentTenant?.id) {
        const storedTenant = availableTenants.find((t) => t.id === storedTenantId);
        if (storedTenant) {
          void switchTenant(storedTenantId);
        }
      }
    }
  }, [availableTenants, currentTenant, user]); // Note: switchTenant not in deps to avoid loop

  const value: ITenantContext = {
    currentTenant,
    availableTenants,
    userRole,
    isPlatformAdmin: isPlatformAdminFlag,
    switchTenant,
    refreshTenants,
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading tenant context...</div>
      </div>
    );
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

/**
 * Hook to access tenant context
 */
export function useTenantContext(): ITenantContext {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within TenantProvider');
  }
  return context;
}

/**
 * Hook to get current tenant
 */
export function useTenant(): Tenant | null {
  const { currentTenant } = useTenantContext();
  return currentTenant;
}

/**
 * Hook to check if user is platform admin
 */
export function useIsPlatformAdmin(): boolean {
  const { isPlatformAdmin } = useTenantContext();
  return isPlatformAdmin;
}

/**
 * Hook to get available tenants
 */
export function useAvailableTenants(): Tenant[] {
  const { availableTenants } = useTenantContext();
  return availableTenants;
}
