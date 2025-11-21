'use client';

/**
 * Subdomain-based Tenant Context Provider
 * Uses middleware-detected tenant from cookie instead of user's organization
 * Allows users to access any tenant based on subdomain
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { createClient } from '@/lib/supabase/client';
import type {
  Organization,
  TenantConfiguration,
  TenantApp,
  TenantContext as TenantContextType,
} from '@/types/multitenancy.types';

interface TenantProviderProps {
  children: React.ReactNode;
}

interface SubdomainTenantContext {
  organization: Organization;
  config: TenantConfiguration;
  apps: TenantApp[];
  features: Array<{
    feature_flag_id: string;
    flag_key: string;
    name: string;
    description: string;
    enabled: boolean;
    config: Record<string, any>;
  }>;
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    tenant_id: string;
  };
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProviderSubdomain({ children }: TenantProviderProps) {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Organization | null>(null);
  const [configuration, setConfiguration] = useState<TenantConfiguration | null>(null);
  const [apps, setApps] = useState<TenantApp[]>([]);
  const [featureFlags, setFeatureFlags] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  // Use singleton Supabase client
  const supabase = createClient();

  /**
   * Get tenant_key from cookie set by middleware
   */
  const getTenantKeyFromCookie = useCallback((): string => {
    if (typeof window === 'undefined') return 'vital-system'; // SSR default

    const cookies = document.cookie.split(';');
    const tenantCookie = cookies.find(c => c.trim().startsWith('vital-tenant-key='));

    if (tenantCookie) {
      const tenantKey = tenantCookie.split('=')[1].trim();
      console.log('[TenantContext] Tenant key from cookie:', tenantKey);
      return tenantKey;
    }

    // Default to vital-system if no cookie
    console.log('[TenantContext] No tenant cookie found, defaulting to vital-system');
    return 'vital-system';
  }, []);

  /**
   * Load tenant configuration by tenant_key (from subdomain)
   */
  const loadTenantContext = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      const tenantKey = getTenantKeyFromCookie();

      console.log('[TenantContext] Loading subdomain-based context for tenant:', tenantKey);
      const startTime = performance.now();

      // Single RPC call with tenant_key from subdomain
      const { data, error: rpcError } = await supabase
        .rpc('get_tenant_context_by_key', {
          p_tenant_key: tenantKey,
          p_user_id: user?.id || null
        });

      const loadTime = performance.now() - startTime;
      console.log(`[TenantContext] Loaded in ${loadTime.toFixed(0)}ms (target: <500ms)`);

      if (rpcError) {
        console.error('[TenantContext] RPC error:', rpcError);
        throw new Error(`Failed to load tenant context: ${rpcError.message}`);
      }

      if (!data || Object.keys(data).length === 0) {
        console.warn('[TenantContext] No tenant context found for key:', tenantKey);
        throw new Error(`No tenant found with key: ${tenantKey}`);
      }

      const context = data as SubdomainTenantContext;

      // Set tenant (organization)
      if (context.organization) {
        setTenant(context.organization);
        console.log('[TenantContext] Tenant:', context.organization.name, '(', context.organization.tenant_type, ')');
      }

      // Set configuration
      if (context.config) {
        setConfiguration(context.config);
        console.log('[TenantContext] Config loaded:', Object.keys(context.config).length, 'fields');
      }

      // Set apps
      if (context.apps && Array.isArray(context.apps)) {
        setApps(context.apps);
        console.log('[TenantContext] Apps loaded:', context.apps.length);
      }

      // Set feature flags
      if (context.features && Array.isArray(context.features)) {
        const flagsMap = new Map<string, boolean>();
        context.features.forEach((feature) => {
          flagsMap.set(feature.flag_key, feature.enabled);
        });
        setFeatureFlags(flagsMap);
        console.log('[TenantContext] Features loaded:', context.features.length);
      }

    } catch (err) {
      console.error('[TenantContext] Error loading tenant context:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.id, getTenantKeyFromCookie]);

  /**
   * Load tenant on mount and when cookie changes
   */
  useEffect(() => {
    loadTenantContext();

    // Watch for cookie changes (e.g., when middleware updates it)
    const intervalId = setInterval(() => {
      const currentTenantKey = getTenantKeyFromCookie();
      if (tenant && tenant.tenant_key !== currentTenantKey) {
        console.log('[TenantContext] Tenant changed, reloading:', currentTenantKey);
        loadTenantContext();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [loadTenantContext, getTenantKeyFromCookie, tenant]);

  /**
   * Reload tenant configuration
   */
  const reload = useCallback(() => {
    loadTenantContext();
  }, [loadTenantContext]);

  /**
   * Check if a feature is enabled
   */
  const isFeatureEnabled = useCallback(
    (featureKey: string): boolean => {
      return featureFlags.get(featureKey) ?? false;
    },
    [featureFlags]
  );

  /**
   * Check if an app is enabled
   */
  const isAppEnabled = useCallback(
    (appKey: string): boolean => {
      const app = apps.find((a) => a.app_key === appKey);
      return app?.is_enabled ?? false;
    },
    [apps]
  );

  /**
   * Get app by key
   */
  const getApp = useCallback(
    (appKey: string): TenantApp | undefined => {
      return apps.find((a) => a.app_key === appKey);
    },
    [apps]
  );

  /**
   * Get visible apps
   */
  const getVisibleApps = useCallback((): TenantApp[] => {
    return apps.filter((a) => a.is_visible && a.is_enabled);
  }, [apps]);

  const contextValue: TenantContextType & {
    reload: () => void;
    isFeatureEnabled: (featureKey: string) => boolean;
    isAppEnabled: (appKey: string) => boolean;
    getApp: (appKey: string) => TenantApp | undefined;
    getVisibleApps: () => TenantApp[];
  } = {
    tenant: tenant as Organization,
    configuration: configuration as TenantConfiguration,
    apps,
    featureFlags,
    isLoading,
    error,
    reload,
    isFeatureEnabled,
    isAppEnabled,
    getApp,
    getVisibleApps,
  };

  return (
    <TenantContext.Provider value={contextValue}>{children}</TenantContext.Provider>
  );
}

/**
 * Hook to use tenant context
 */
export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context as TenantContextType & {
    reload: () => void;
    isFeatureEnabled: (featureKey: string) => boolean;
    isAppEnabled: (appKey: string) => boolean;
    getApp: (appKey: string) => TenantApp | undefined;
    getVisibleApps: () => TenantApp[];
  };
}
