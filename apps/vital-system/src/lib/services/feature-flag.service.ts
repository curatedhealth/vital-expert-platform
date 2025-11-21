/**
 * Feature Flag Service
 * Manages feature flags and tenant-specific overrides
 */

import { createClient } from '@/lib/supabase/client';
import type {
  FeatureFlag,
  TenantFeatureFlag,
  FeatureFlagResponse,
  FeatureFlagCheckOptions,
  Organization,
} from '@/types/multitenancy.types';

export class FeatureFlagService {
  private supabase = createClient();
  private flagCache: Map<string, { flags: Map<string, boolean>; timestamp: number }> = new Map();
  private globalFlagsCache: Map<string, FeatureFlag> | null = null;
  private globalFlagsCacheTimestamp = 0;
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if a feature is enabled for a tenant
   */
  async isFeatureEnabled(
    tenantId: string,
    featureKey: string,
    options?: FeatureFlagCheckOptions
  ): Promise<boolean> {
    try {
      // Check cache first
      const cached = this.getCachedFlag(tenantId, featureKey);
      if (cached !== null) {
        return cached;
      }

      // Check for tenant-specific override
      const { data: override } = await this.supabase
        .from('tenant_feature_flags')
        .select('enabled')
        .eq('tenant_id', tenantId)
        .eq('feature_flag_id', await this.getFeatureFlagId(featureKey))
        .single();

      if (override) {
        this.setCachedFlag(tenantId, featureKey, override.enabled);
        return override.enabled;
      }

      // Check tier-based access if requested
      if (options?.checkTier) {
        const hasAccess = await this.checkTierAccess(tenantId, featureKey);
        if (!hasAccess) {
          this.setCachedFlag(tenantId, featureKey, false);
          return false;
        }
      }

      // Fall back to default flag value
      const defaultValue = await this.getDefaultFlagValue(featureKey);
      this.setCachedFlag(tenantId, featureKey, defaultValue);
      return defaultValue;
    } catch (error) {
      console.error('[FeatureFlagService] Error checking feature:', error);
      return options?.defaultValue ?? false;
    }
  }

  /**
   * Get feature flag with configuration
   */
  async getFeatureFlag(
    tenantId: string,
    featureKey: string
  ): Promise<FeatureFlagResponse> {
    try {
      // Get the global flag
      const globalFlag = await this.getGlobalFlag(featureKey);
      if (!globalFlag) {
        return {
          success: false,
          error: `Feature flag not found: ${featureKey}`,
        };
      }

      // Check for tenant override
      const { data: override } = await this.supabase
        .from('tenant_feature_flags')
        .select('enabled, config')
        .eq('tenant_id', tenantId)
        .eq('feature_flag_id', globalFlag.id)
        .single();

      return {
        success: true,
        data: {
          flag_key: featureKey,
          enabled: override?.enabled ?? globalFlag.default_enabled,
          config: override?.config ?? {},
        },
      };
    } catch (error) {
      console.error('[FeatureFlagService] Error getting feature flag:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all enabled features for a tenant
   */
  async getEnabledFeatures(tenantId: string): Promise<string[]> {
    try {
      // Get all global flags
      const globalFlags = await this.getAllGlobalFlags();

      // Get tenant overrides
      const { data: overrides } = await this.supabase
        .from('tenant_feature_flags')
        .select(`
          enabled,
          feature_flag:feature_flags(flag_key)
        `)
        .eq('tenant_id', tenantId);

      const enabledFlags: string[] = [];
      const overrideMap = new Map(
        overrides?.map((o: any) => [o.feature_flag.flag_key, o.enabled]) || []
      );

      // Combine defaults and overrides
      for (const flag of globalFlags) {
        if (!flag.is_active) continue;

        const isEnabled = overrideMap.has(flag.flag_key)
          ? overrideMap.get(flag.flag_key)
          : flag.default_enabled;

        if (isEnabled) {
          enabledFlags.push(flag.flag_key);
        }
      }

      return enabledFlags;
    } catch (error) {
      console.error('[FeatureFlagService] Error getting enabled features:', error);
      return [];
    }
  }

  /**
   * Get features by category
   */
  async getFeaturesByCategory(
    tenantId: string,
    category: string
  ): Promise<Map<string, boolean>> {
    try {
      const { data: flags } = await this.supabase
        .from('feature_flags')
        .select('*')
        .eq('category', category)
        .eq('is_active', true);

      if (!flags) return new Map();

      const results = new Map<string, boolean>();

      for (const flag of flags) {
        const enabled = await this.isFeatureEnabled(tenantId, flag.flag_key);
        results.set(flag.flag_key, enabled);
      }

      return results;
    } catch (error) {
      console.error('[FeatureFlagService] Error getting features by category:', error);
      return new Map();
    }
  }

  /**
   * Enable a feature for a tenant (create override)
   */
  async enableFeature(
    tenantId: string,
    featureKey: string,
    config?: Record<string, any>,
    enabledBy?: string
  ): Promise<FeatureFlagResponse> {
    try {
      const flagId = await this.getFeatureFlagId(featureKey);
      if (!flagId) {
        return {
          success: false,
          error: `Feature flag not found: ${featureKey}`,
        };
      }

      // Upsert tenant override
      const { data, error } = await this.supabase
        .from('tenant_feature_flags')
        .upsert({
          tenant_id: tenantId,
          feature_flag_id: flagId,
          enabled: true,
          config: config || {},
          enabled_by: enabledBy,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to enable feature: ${error.message}`);
      }

      // Invalidate cache
      this.invalidateTenantCache(tenantId);

      return {
        success: true,
        data: {
          flag_key: featureKey,
          enabled: true,
          config: config || {},
        },
      };
    } catch (error) {
      console.error('[FeatureFlagService] Error enabling feature:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Disable a feature for a tenant (create override)
   */
  async disableFeature(
    tenantId: string,
    featureKey: string,
    disabledBy?: string
  ): Promise<FeatureFlagResponse> {
    try {
      const flagId = await this.getFeatureFlagId(featureKey);
      if (!flagId) {
        return {
          success: false,
          error: `Feature flag not found: ${featureKey}`,
        };
      }

      // Upsert tenant override
      const { data, error } = await this.supabase
        .from('tenant_feature_flags')
        .upsert({
          tenant_id: tenantId,
          feature_flag_id: flagId,
          enabled: false,
          enabled_by: disabledBy,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to disable feature: ${error.message}`);
      }

      // Invalidate cache
      this.invalidateTenantCache(tenantId);

      return {
        success: true,
        data: {
          flag_key: featureKey,
          enabled: false,
        },
      };
    } catch (error) {
      console.error('[FeatureFlagService] Error disabling feature:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Remove tenant override (revert to default)
   */
  async removeOverride(tenantId: string, featureKey: string): Promise<boolean> {
    try {
      const flagId = await this.getFeatureFlagId(featureKey);
      if (!flagId) return false;

      const { error } = await this.supabase
        .from('tenant_feature_flags')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('feature_flag_id', flagId);

      if (error) {
        throw new Error(`Failed to remove override: ${error.message}`);
      }

      // Invalidate cache
      this.invalidateTenantCache(tenantId);

      return true;
    } catch (error) {
      console.error('[FeatureFlagService] Error removing override:', error);
      return false;
    }
  }

  /**
   * Check if tenant tier has access to feature
   */
  private async checkTierAccess(tenantId: string, featureKey: string): Promise<boolean> {
    try {
      // Get tenant's subscription tier
      const { data: org } = await this.supabase
        .from('organizations')
        .select('subscription_tier')
        .eq('id', tenantId)
        .single();

      if (!org) return false;

      // Get feature flag's available tiers
      const flag = await this.getGlobalFlag(featureKey);
      if (!flag) return false;

      return flag.available_tiers.includes(org.subscription_tier);
    } catch (error) {
      console.error('[FeatureFlagService] Error checking tier access:', error);
      return false;
    }
  }

  /**
   * Helper: Get global flag by key
   */
  private async getGlobalFlag(featureKey: string): Promise<FeatureFlag | null> {
    try {
      const flags = await this.getAllGlobalFlags();
      return flags.find((f) => f.flag_key === featureKey) || null;
    } catch (error) {
      console.error('[FeatureFlagService] Error getting global flag:', error);
      return null;
    }
  }

  /**
   * Helper: Get all global flags (cached)
   */
  private async getAllGlobalFlags(): Promise<FeatureFlag[]> {
    try {
      const now = Date.now();

      // Check cache
      if (
        this.globalFlagsCache &&
        now - this.globalFlagsCacheTimestamp < this.CACHE_TTL
      ) {
        return Array.from(this.globalFlagsCache.values());
      }

      // Fetch from database
      const { data, error } = await this.supabase
        .from('feature_flags')
        .select('*')
        .eq('is_active', true);

      if (error) {
        throw new Error(`Failed to fetch feature flags: ${error.message}`);
      }

      // Update cache
      this.globalFlagsCache = new Map(data?.map((f) => [f.flag_key, f]) || []);
      this.globalFlagsCacheTimestamp = now;

      return data || [];
    } catch (error) {
      console.error('[FeatureFlagService] Error getting all global flags:', error);
      return [];
    }
  }

  /**
   * Helper: Get feature flag ID by key
   */
  private async getFeatureFlagId(featureKey: string): Promise<string | null> {
    const flag = await this.getGlobalFlag(featureKey);
    return flag?.id || null;
  }

  /**
   * Helper: Get default flag value
   */
  private async getDefaultFlagValue(featureKey: string): Promise<boolean> {
    const flag = await this.getGlobalFlag(featureKey);
    return flag?.default_enabled ?? false;
  }

  /**
   * Cache helpers
   */
  private getCachedFlag(tenantId: string, featureKey: string): boolean | null {
    const tenantCache = this.flagCache.get(tenantId);
    if (!tenantCache) return null;

    const now = Date.now();
    if (now - tenantCache.timestamp > this.CACHE_TTL) {
      this.flagCache.delete(tenantId);
      return null;
    }

    return tenantCache.flags.get(featureKey) ?? null;
  }

  private setCachedFlag(tenantId: string, featureKey: string, enabled: boolean): void {
    let tenantCache = this.flagCache.get(tenantId);

    if (!tenantCache) {
      tenantCache = {
        flags: new Map(),
        timestamp: Date.now(),
      };
      this.flagCache.set(tenantId, tenantCache);
    }

    tenantCache.flags.set(featureKey, enabled);
  }

  private invalidateTenantCache(tenantId: string): void {
    this.flagCache.delete(tenantId);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.flagCache.clear();
    this.globalFlagsCache = null;
    this.globalFlagsCacheTimestamp = 0;
  }
}

// Export singleton instance
export const featureFlagService = new FeatureFlagService();
