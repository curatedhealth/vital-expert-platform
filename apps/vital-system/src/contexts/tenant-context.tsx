'use client';

/**
 * Tenant Context Provider
 * Manages tenant-specific state and configuration
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { tenantConfigService } from '@/lib/services/tenant-configuration.service';
import { featureFlagService } from '@/lib/services/feature-flag.service';
import type {
  Organization,
  TenantConfiguration,
  TenantApp,
  TenantContext as TenantContextType,
} from '@/types/multitenancy.types';

interface TenantProviderProps {
  children: React.ReactNode;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: TenantProviderProps) {
  const { organization } = useAuth();
  const [tenant, setTenant] = useState<Organization | null>(null);
  const [configuration, setConfiguration] = useState<TenantConfiguration | null>(null);
  const [apps, setApps] = useState<TenantApp[]>([]);
  const [featureFlags, setFeatureFlags] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  /**
   * Load tenant configuration
   */
  const loadTenantConfig = useCallback(async (tenantId: string) => {
    try {
      setIsLoading(true);
      setError(undefined);

      // Load tenant configuration
      const configResult = await tenantConfigService.getTenantConfig(tenantId);
      if (!configResult.success || !configResult.data) {
        throw new Error(configResult.error || 'Failed to load tenant configuration');
      }

      setConfiguration(configResult.data);

      // Load tenant apps
      const { data: appsData, error: appsError } = await fetch(
        `/api/tenants/${tenantId}/apps`
      ).then((res) => res.json());

      if (!appsError && appsData) {
        setApps(appsData);
      }

      // Load enabled features
      const enabledFeatures = await featureFlagService.getEnabledFeatures(tenantId);
      const flagsMap = new Map<string, boolean>();
      enabledFeatures.forEach((key) => flagsMap.set(key, true));
      setFeatureFlags(flagsMap);
    } catch (err) {
      console.error('[TenantContext] Error loading tenant config:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load tenant when organization changes
   */
  useEffect(() => {
    if (organization) {
      setTenant(organization as Organization);
      loadTenantConfig(organization.id);
    } else {
      setTenant(null);
      setConfiguration(null);
      setApps([]);
      setFeatureFlags(new Map());
      setIsLoading(false);
    }
  }, [organization, loadTenantConfig]);

  /**
   * Reload tenant configuration
   */
  const reload = useCallback(() => {
    if (tenant) {
      loadTenantConfig(tenant.id);
    }
  }, [tenant, loadTenantConfig]);

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
