/**
 * System Settings Service
 * 
 * Manages global system configuration, feature flags, and announcements
 * for the admin dashboard Phase 4 implementation.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  rollout_percentage: number;
  target_users: string[];
  target_orgs: string[];
  environment: string;
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: 'security' | 'performance' | 'features' | 'compliance';
  environment: string;
  is_sensitive: boolean;
  requires_restart: boolean;
  updated_by: string;
  updated_at: string;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'maintenance';
  is_active: boolean;
  start_time: string;
  end_time?: string;
  target_roles: string[];
  created_by: string;
  created_at: string;
}

export interface FeatureFlagFilters {
  enabled?: boolean;
  environment?: string;
  search?: string;
}

export interface SystemSettingFilters {
  category?: string;
  environment?: string;
  search?: string;
}

export interface AnnouncementFilters {
  type?: string;
  is_active?: boolean;
  search?: string;
}

export class SystemSettingsService {
  /**
   * Get current user for audit logging
   */
  private async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return { user };
  }

  // ============================================================================
  // FEATURE FLAGS MANAGEMENT
  // ============================================================================

  /**
   * Get all feature flags with optional filtering
   */
  async getFeatureFlags(filters: FeatureFlagFilters = {}): Promise<FeatureFlag[]> {
    let query = supabase
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.enabled !== undefined) {
      query = query.eq('enabled', filters.enabled);
    }

    if (filters.environment) {
      query = query.eq('environment', filters.environment);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch feature flags: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single feature flag by ID
   */
  async getFeatureFlag(id: string): Promise<FeatureFlag> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch feature flag: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new feature flag
   */
  async createFeatureFlag(flagData: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<FeatureFlag> {
    const { user } = await this.getCurrentUser();

    const { data, error } = await supabase
      .from('feature_flags')
      .insert({
        ...flagData,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create feature flag: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a feature flag
   */
  async updateFeatureFlag(id: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag> {
    const { user } = await this.getCurrentUser();

    const { data, error } = await supabase
      .from('feature_flags')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update feature flag: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a feature flag
   */
  async deleteFeatureFlag(id: string): Promise<void> {
    const { error } = await supabase
      .from('feature_flags')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete feature flag: ${error.message}`);
    }
  }

  /**
   * Toggle feature flag enabled status
   */
  async toggleFeatureFlag(id: string, enabled: boolean): Promise<FeatureFlag> {
    return this.updateFeatureFlag(id, { enabled });
  }

  // ============================================================================
  // SYSTEM SETTINGS MANAGEMENT
  // ============================================================================

  /**
   * Get all system settings with optional filtering
   */
  async getSystemSettings(filters: SystemSettingFilters = {}): Promise<SystemSetting[]> {
    let query = supabase
      .from('system_settings')
      .select('*')
      .order('key', { ascending: true });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.environment) {
      query = query.eq('environment', filters.environment);
    }

    if (filters.search) {
      query = query.or(`key.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch system settings: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single system setting by key
   */
  async getSystemSetting(key: string): Promise<SystemSetting | null> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch system setting: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a system setting
   */
  async updateSystemSetting(key: string, value: any, category?: string): Promise<SystemSetting> {
    const { user } = await this.getCurrentUser();

    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        key,
        value,
        category: category || 'features',
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update system setting: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a system setting
   */
  async deleteSystemSetting(key: string): Promise<void> {
    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('key', key);

    if (error) {
      throw new Error(`Failed to delete system setting: ${error.message}`);
    }
  }

  /**
   * Get settings by category
   */
  async getSettingsByCategory(category: string): Promise<SystemSetting[]> {
    return this.getSystemSettings({ category });
  }

  // ============================================================================
  // SYSTEM ANNOUNCEMENTS MANAGEMENT
  // ============================================================================

  /**
   * Get all system announcements with optional filtering
   */
  async getSystemAnnouncements(filters: AnnouncementFilters = {}): Promise<SystemAnnouncement[]> {
    let query = supabase
      .from('system_announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('System announcements table not found, returning empty array:', error.message);
      return [];
    }

    return data || [];
  }

  /**
   * Get a single system announcement by ID
   */
  async getSystemAnnouncement(id: string): Promise<SystemAnnouncement> {
    const { data, error } = await supabase
      .from('system_announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch system announcement: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new system announcement
   */
  async createSystemAnnouncement(announcementData: Omit<SystemAnnouncement, 'id' | 'created_at' | 'created_by'>): Promise<SystemAnnouncement> {
    const { user } = await this.getCurrentUser();

    const { data, error } = await supabase
      .from('system_announcements')
      .insert({
        ...announcementData,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create system announcement: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a system announcement
   */
  async updateSystemAnnouncement(id: string, updates: Partial<SystemAnnouncement>): Promise<SystemAnnouncement> {
    const { data, error } = await supabase
      .from('system_announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update system announcement: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a system announcement
   */
  async deleteSystemAnnouncement(id: string): Promise<void> {
    const { error } = await supabase
      .from('system_announcements')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete system announcement: ${error.message}`);
    }
  }

  /**
   * Toggle announcement active status
   */
  async toggleAnnouncement(id: string, is_active: boolean): Promise<SystemAnnouncement> {
    return this.updateSystemAnnouncement(id, { is_active });
  }

  /**
   * Get active announcements for display
   */
  async getActiveAnnouncements(): Promise<SystemAnnouncement[]> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('system_announcements')
      .select('*')
      .eq('is_active', true)
      .lte('start_time', now)
      .or(`end_time.is.null,end_time.gte.${now}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch active announcements: ${error.message}`);
    }

    return data || [];
  }

  // ============================================================================
  // MAINTENANCE MODE MANAGEMENT
  // ============================================================================

  /**
   * Enable maintenance mode
   */
  async enableMaintenanceMode(reason?: string): Promise<void> {
    await this.updateSystemSetting('maintenance_mode', 'true', 'features');
    
    if (reason) {
      await this.createSystemAnnouncement({
        title: 'System Maintenance',
        message: reason,
        type: 'maintenance',
        is_active: true,
        start_time: new Date().toISOString(),
        target_roles: ['user', 'admin', 'super_admin']
      });
    }
  }

  /**
   * Disable maintenance mode
   */
  async disableMaintenanceMode(): Promise<void> {
    await this.updateSystemSetting('maintenance_mode', 'false', 'features');
  }

  /**
   * Check if maintenance mode is enabled
   */
  async isMaintenanceModeEnabled(): Promise<boolean> {
    const setting = await this.getSystemSetting('maintenance_mode');
    return setting?.value === 'true' || false;
  }

  // ============================================================================
  // FEATURE FLAG EVALUATION
  // ============================================================================

  /**
   * Check if a feature flag is enabled for a user/org
   */
  async isFeatureEnabled(flagName: string, userId?: string, orgId?: string): Promise<boolean> {
    const flag = await this.getSystemSetting(`feature_flag_${flagName}`);
    
    if (!flag) {
      // Check database for feature flag
      const { data } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('name', flagName)
        .eq('enabled', true)
        .single();

      if (!data) {
        return false;
      }

      // Check rollout percentage
      if (data.rollout_percentage < 100) {
        const hash = this.hashString(`${userId || 'anonymous'}_${flagName}`);
        const percentage = hash % 100;
        if (percentage >= data.rollout_percentage) {
          return false;
        }
      }

      // Check target users
      if (data.target_users.length > 0 && userId && !data.target_users.includes(userId)) {
        return false;
      }

      // Check target orgs
      if (data.target_orgs.length > 0 && orgId && !data.target_orgs.includes(orgId)) {
        return false;
      }

      return true;
    }

    return flag.value === true;
  }

  /**
   * Hash string for consistent rollout percentage
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk update feature flags
   */
  async bulkUpdateFeatureFlags(updates: Array<{ id: string; updates: Partial<FeatureFlag> }>): Promise<FeatureFlag[]> {
    const results: FeatureFlag[] = [];
    
    for (const { id, updates: flagUpdates } of updates) {
      try {
        const result = await this.updateFeatureFlag(id, flagUpdates);
        results.push(result);
      } catch (error) {
        console.error(`Failed to update feature flag ${id}:`, error);
      }
    }

    return results;
  }

  /**
   * Export all settings as JSON
   */
  async exportSettings(): Promise<{
    feature_flags: FeatureFlag[];
    system_settings: SystemSetting[];
    announcements: SystemAnnouncement[];
  }> {
    const [featureFlags, systemSettings, announcements] = await Promise.all([
      this.getFeatureFlags(),
      this.getSystemSettings(),
      this.getSystemAnnouncements()
    ]);

    return {
      feature_flags: featureFlags,
      system_settings: systemSettings,
      announcements: announcements
    };
  }

  /**
   * Import settings from JSON
   */
  async importSettings(data: {
    feature_flags?: Partial<FeatureFlag>[];
    system_settings?: Partial<SystemSetting>[];
    announcements?: Partial<SystemAnnouncement>[];
  }): Promise<{
    feature_flags: number;
    system_settings: number;
    announcements: number;
  }> {
    const results = {
      feature_flags: 0,
      system_settings: 0,
      announcements: 0
    };

    // Import feature flags
    if (data.feature_flags) {
      for (const flag of data.feature_flags) {
        try {
          await this.createFeatureFlag(flag as Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at' | 'created_by'>);
          results.feature_flags++;
        } catch (error) {
          console.error('Failed to import feature flag:', error);
        }
      }
    }

    // Import system settings
    if (data.system_settings) {
      for (const setting of data.system_settings) {
        try {
          if (setting.key) {
            await this.updateSystemSetting(setting.key, setting.value, setting.category);
            results.system_settings++;
          }
        } catch (error) {
          console.error('Failed to import system setting:', error);
        }
      }
    }

    // Import announcements
    if (data.announcements) {
      for (const announcement of data.announcements) {
        try {
          await this.createSystemAnnouncement(announcement as Omit<SystemAnnouncement, 'id' | 'created_at' | 'created_by'>);
          results.announcements++;
        } catch (error) {
          console.error('Failed to import announcement:', error);
        }
      }
    }

    return results;
  }
}
