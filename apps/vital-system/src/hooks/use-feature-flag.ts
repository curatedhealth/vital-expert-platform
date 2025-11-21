'use client';

/**
 * Feature Flag Hooks
 * Convenient hooks for checking feature flags
 */

import { useTenant } from '@/contexts/tenant-context';
import { useEffect, useState } from 'react';
import { featureFlagService } from '@/lib/services/feature-flag.service';

/**
 * Hook to check if a feature is enabled
 * Returns the flag value from tenant context
 */
export function useFeatureFlag(featureKey: string): boolean {
  const { isFeatureEnabled } = useTenant();
  return isFeatureEnabled(featureKey);
}

/**
 * Hook to check multiple feature flags
 * Returns a map of flag keys to boolean values
 */
export function useFeatureFlags(featureKeys: string[]): Map<string, boolean> {
  const { featureFlags } = useTenant();
  const results = new Map<string, boolean>();

  featureKeys.forEach((key) => {
    results.set(key, featureFlags.get(key) ?? false);
  });

  return results;
}

/**
 * Hook to get feature flag with configuration
 * Fetches detailed flag information including config
 */
export function useFeatureFlagWithConfig(featureKey: string) {
  const { tenant, isFeatureEnabled } = useTenant();
  const [config, setConfig] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant) {
      setLoading(false);
      return;
    }

    async function loadConfig() {
      try {
        const result = await featureFlagService.getFeatureFlag(tenant.id, featureKey);
        if (result.success && result.data) {
          setConfig(result.data.config || null);
        }
      } catch (error) {
        console.error('[useFeatureFlagWithConfig] Error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [tenant, featureKey]);

  return {
    enabled: isFeatureEnabled(featureKey),
    config,
    loading,
  };
}

/**
 * Hook to check if any of the provided features are enabled
 * Useful for OR conditions
 */
export function useAnyFeatureEnabled(featureKeys: string[]): boolean {
  const { featureFlags } = useTenant();
  return featureKeys.some((key) => featureFlags.get(key) === true);
}

/**
 * Hook to check if all of the provided features are enabled
 * Useful for AND conditions
 */
export function useAllFeaturesEnabled(featureKeys: string[]): boolean {
  const { featureFlags } = useTenant();
  return featureKeys.every((key) => featureFlags.get(key) === true);
}

/**
 * Hook to get features by category
 * Returns all flags in a specific category
 */
export function useFeaturesByCategory(category: string) {
  const { tenant } = useTenant();
  const [features, setFeatures] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant) {
      setLoading(false);
      return;
    }

    async function loadFeatures() {
      try {
        const result = await featureFlagService.getFeaturesByCategory(
          tenant.id,
          category
        );
        setFeatures(result);
      } catch (error) {
        console.error('[useFeaturesByCategory] Error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFeatures();
  }, [tenant, category]);

  return { features, loading };
}
