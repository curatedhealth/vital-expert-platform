/**
 * Tenant Configuration Service
 * Manages tenant-specific configurations, settings, and limits
 */

import { createClient } from '@/lib/supabase/client';
import type {
  TenantConfiguration,
  TenantConfigResponse,
  GetTenantConfigOptions,
  Organization,
} from '@/types/multitenancy.types';

export class TenantConfigurationService {
  private supabase = createClient();
  private configCache: Map<string, { config: TenantConfiguration; timestamp: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get tenant configuration by tenant ID
   */
  async getTenantConfig(
    tenantId: string,
    options?: GetTenantConfigOptions
  ): Promise<TenantConfigResponse> {
    try {
      // Check cache first
      const cached = this.getCachedConfig(tenantId);
      if (cached) {
        return { success: true, data: cached };
      }

      // Fetch from database
      const { data, error } = await this.supabase
        .from('tenant_configurations')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch tenant configuration: ${error.message}`);
      }

      if (!data) {
        throw new Error('Tenant configuration not found');
      }

      // Cache the result
      this.setCachedConfig(tenantId, data);

      return { success: true, data };
    } catch (error) {
      console.error('[TenantConfigService] Error fetching config:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get tenant configuration by tenant key
   */
  async getTenantConfigByKey(tenantKey: string): Promise<TenantConfigResponse> {
    try {
      // First, get the organization by tenant_key
      const { data: org, error: orgError } = await this.supabase
        .from('organizations')
        .select('id')
        .eq('tenant_key', tenantKey)
        .single();

      if (orgError || !org) {
        throw new Error(`Tenant not found: ${tenantKey}`);
      }

      // Then get the configuration
      return await this.getTenantConfig(org.id);
    } catch (error) {
      console.error('[TenantConfigService] Error fetching config by key:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update tenant configuration
   */
  async updateTenantConfig(
    tenantId: string,
    updates: Partial<TenantConfiguration>
  ): Promise<TenantConfigResponse> {
    try {
      const { data, error } = await this.supabase
        .from('tenant_configurations')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update tenant configuration: ${error.message}`);
      }

      // Invalidate cache
      this.invalidateCache(tenantId);

      return { success: true, data };
    } catch (error) {
      console.error('[TenantConfigService] Error updating config:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get enabled features for tenant
   */
  async getEnabledFeatures(tenantId: string): Promise<string[]> {
    try {
      const result = await this.getTenantConfig(tenantId);
      if (!result.success || !result.data) {
        return [];
      }
      return result.data.enabled_features || [];
    } catch (error) {
      console.error('[TenantConfigService] Error fetching enabled features:', error);
      return [];
    }
  }

  /**
   * Get enabled apps for tenant
   */
  async getEnabledApps(tenantId: string): Promise<string[]> {
    try {
      const result = await this.getTenantConfig(tenantId);
      if (!result.success || !result.data) {
        return [];
      }
      return result.data.enabled_apps || [];
    } catch (error) {
      console.error('[TenantConfigService] Error fetching enabled apps:', error);
      return [];
    }
  }

  /**
   * Get enabled agent tiers for tenant
   */
  async getEnabledAgentTiers(tenantId: string): Promise<number[]> {
    try {
      const result = await this.getTenantConfig(tenantId);
      if (!result.success || !result.data) {
        return [3]; // Default to Tier 3 only
      }
      return result.data.enabled_agent_tiers || [3];
    } catch (error) {
      console.error('[TenantConfigService] Error fetching enabled agent tiers:', error);
      return [3];
    }
  }

  /**
   * Get enabled knowledge domains for tenant
   */
  async getEnabledKnowledgeDomains(tenantId: string): Promise<string[]> {
    try {
      const result = await this.getTenantConfig(tenantId);
      if (!result.success || !result.data) {
        return [];
      }
      return result.data.enabled_knowledge_domains || [];
    } catch (error) {
      console.error('[TenantConfigService] Error fetching enabled knowledge domains:', error);
      return [];
    }
  }

  /**
   * Get resource limits for tenant
   */
  async getResourceLimits(tenantId: string) {
    try {
      const result = await this.getTenantConfig(tenantId);
      if (!result.success || !result.data) {
        return null;
      }
      return result.data.limits;
    } catch (error) {
      console.error('[TenantConfigService] Error fetching resource limits:', error);
      return null;
    }
  }

  /**
   * Get compliance settings for tenant
   */
  async getComplianceSettings(tenantId: string) {
    try {
      const result = await this.getTenantConfig(tenantId);
      if (!result.success || !result.data) {
        return null;
      }
      return result.data.compliance_settings;
    } catch (error) {
      console.error('[TenantConfigService] Error fetching compliance settings:', error);
      return null;
    }
  }

  /**
   * Check if tenant has HIPAA enabled
   */
  async isHipaaEnabled(tenantId: string): Promise<boolean> {
    const compliance = await this.getComplianceSettings(tenantId);
    return compliance?.hipaa_enabled || false;
  }

  /**
   * Check if tenant has GDPR enabled
   */
  async isGdprEnabled(tenantId: string): Promise<boolean> {
    const compliance = await this.getComplianceSettings(tenantId);
    return compliance?.gdpr_enabled || false;
  }

  /**
   * Check if tenant allows PHI
   */
  async isPhiAllowed(tenantId: string): Promise<boolean> {
    const compliance = await this.getComplianceSettings(tenantId);
    return compliance?.phi_allowed || false;
  }

  /**
   * Check if tenant allows PII
   */
  async isPiiAllowed(tenantId: string): Promise<boolean> {
    const compliance = await this.getComplianceSettings(tenantId);
    return compliance?.pii_allowed || false;
  }

  /**
   * Get UI configuration for tenant
   */
  async getUiConfig(tenantId: string) {
    try {
      const result = await this.getTenantConfig(tenantId);
      if (!result.success || !result.data) {
        return null;
      }
      return result.data.ui_config;
    } catch (error) {
      console.error('[TenantConfigService] Error fetching UI config:', error);
      return null;
    }
  }

  /**
   * Update UI configuration
   */
  async updateUiConfig(tenantId: string, uiConfig: any) {
    try {
      const result = await this.getTenantConfig(tenantId);
      if (!result.success || !result.data) {
        throw new Error('Tenant configuration not found');
      }

      return await this.updateTenantConfig(tenantId, {
        ui_config: { ...result.data.ui_config, ...uiConfig },
      });
    } catch (error) {
      console.error('[TenantConfigService] Error updating UI config:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Enable a feature for tenant
   */
  async enableFeature(tenantId: string, featureKey: string) {
    try {
      const result = await this.getTenantConfig(tenantId);
      if (!result.success || !result.data) {
        throw new Error('Tenant configuration not found');
      }

      const enabledFeatures = new Set(result.data.enabled_features || []);
      enabledFeatures.add(featureKey);

      const disabledFeatures = (result.data.disabled_features || []).filter(
        (f) => f !== featureKey
      );

      return await this.updateTenantConfig(tenantId, {
        enabled_features: Array.from(enabledFeatures),
        disabled_features: disabledFeatures,
      });
    } catch (error) {
      console.error('[TenantConfigService] Error enabling feature:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Disable a feature for tenant
   */
  async disableFeature(tenantId: string, featureKey: string) {
    try {
      const result = await this.getTenantConfig(tenantId);
      if (!result.success || !result.data) {
        throw new Error('Tenant configuration not found');
      }

      const enabledFeatures = (result.data.enabled_features || []).filter(
        (f) => f !== featureKey
      );

      const disabledFeatures = new Set(result.data.disabled_features || []);
      disabledFeatures.add(featureKey);

      return await this.updateTenantConfig(tenantId, {
        enabled_features: enabledFeatures,
        disabled_features: Array.from(disabledFeatures),
      });
    } catch (error) {
      console.error('[TenantConfigService] Error disabling feature:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cache helpers
   */
  private getCachedConfig(tenantId: string): TenantConfiguration | null {
    const cached = this.configCache.get(tenantId);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.configCache.delete(tenantId);
      return null;
    }

    return cached.config;
  }

  private setCachedConfig(tenantId: string, config: TenantConfiguration): void {
    this.configCache.set(tenantId, {
      config,
      timestamp: Date.now(),
    });
  }

  private invalidateCache(tenantId: string): void {
    this.configCache.delete(tenantId);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.configCache.clear();
  }
}

// Export singleton instance
export const tenantConfigService = new TenantConfigurationService();
