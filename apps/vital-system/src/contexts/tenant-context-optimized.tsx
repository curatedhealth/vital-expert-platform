'use client';

/**
 * Optimized Tenant Context Provider (Phase 1)
 * Uses unified database function for single-query data loading
 * Replaces 7 sequential queries with 1 optimized query
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

interface UnifiedTenantContext {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    tenant_id: string;
  };
  organization: Organization;
  config: TenantConfiguration;
  apps: TenantApp[];
  features: Array<{
    flag_key: string;
    enabled: boolean;
    config: Record<string, any>;
  }>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProviderOptimized({ children }: TenantProviderProps) {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Organization | null>(null);
  const [configuration, setConfiguration] = useState<TenantConfiguration | null>(null);
  const [apps, setApps] = useState<TenantApp[]>([]);
  const [featureFlags, setFeatureFlags] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  // Use singleton Supabase client (created once per browser session)
  const supabase = createClient();

  /**
   * Load tenant configuration using unified function (ONE query)
   */
  const loadTenantContext = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(undefined);

      console.log('[TenantContext] Loading unified context for user:', userId);
      const startTime = performance.now();

      // Single RPC call replaces 7 sequential queries
      const { data, error: rpcError } = await supabase
        .rpc('get_user_tenant_context', {
          p_user_id: userId
        });

      const loadTime = performance.now() - startTime;
      console.log(`[TenantContext] Loaded in ${loadTime.toFixed(0)}ms (target: <500ms)`);

      if (rpcError) {
        console.error('[TenantContext] RPC error:', rpcError);
        throw new Error(`Failed to load tenant context: ${rpcError.message}`);
      }

      if (!data || Object.keys(data).length === 0) {
        console.warn('[TenantContext] No tenant context found for user');
        throw new Error('No tenant context found - user may not have organization assignment');
      }

      const context = data as UnifiedTenantContext;

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
  }, [supabase]);

  /**
   * Load tenant when user changes
   */
  useEffect(() => {
    if (user?.id) {
      loadTenantContext(user.id);
    } else {
      setTenant(null);
      setConfiguration(null);
      setApps([]);
      setFeatureFlags(new Map());
      setIsLoading(false);
    }
  }, [user?.id, loadTenantContext]);

  /**
   * Reload tenant configuration
   */
  const reload = useCallback(() => {
    if (user?.id) {
      loadTenantContext(user.id);
    }
  }, [user?.id, loadTenantContext]);

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
