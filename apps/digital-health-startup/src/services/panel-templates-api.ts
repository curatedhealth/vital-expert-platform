/**
 * Panel Templates API Service
 * Connects to Supabase panel_templates table
 */

import { createClient } from '@/lib/supabase/client';
import type {
  PanelTemplate,
  PanelTemplateRow,
  PanelManagementPatternRow,
  UserPanelCustomizationRow,
  PanelType,
  ManagementType,
  mapTemplateRowToTemplate,
  mapTemplateToTemplateRow,
} from '@/types/panel.types';

// ============================================================================
// API CLIENT
// ============================================================================

export class PanelTemplatesAPI {
  private supabase = createClient();

  /**
   * Get all public panel templates
   */
  async getPublicTemplates(): Promise<PanelTemplate[]> {
    const { data, error } = await this.supabase
      .from('panel_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false });

    if (error) {
      console.error('Error fetching public templates:', error);
      throw error;
    }

    return (data as PanelTemplateRow[]).map(mapTemplateRowToTemplate);
  }

  /**
   * Get templates by panel type
   */
  async getTemplatesByType(panelType: PanelType): Promise<PanelTemplate[]> {
    const { data, error } = await this.supabase
      .from('panel_templates')
      .select('*')
      .eq('panel_type', panelType)
      .eq('is_public', true)
      .order('usage_count', { ascending: false });

    if (error) {
      console.error('Error fetching templates by type:', error);
      throw error;
    }

    return (data as PanelTemplateRow[]).map(mapTemplateRowToTemplate);
  }

  /**
   * Get templates by management type
   */
  async getTemplatesByManagement(managementType: ManagementType): Promise<PanelTemplate[]> {
    const { data, error } = await this.supabase
      .from('panel_templates')
      .select('*')
      .eq('management_type', managementType)
      .eq('is_public', true)
      .order('usage_count', { ascending: false });

    if (error) {
      console.error('Error fetching templates by management:', error);
      throw error;
    }

    return (data as PanelTemplateRow[]).map(mapTemplateRowToTemplate);
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<PanelTemplate[]> {
    const { data, error } = await this.supabase
      .from('panel_templates')
      .select('*')
      .eq('category', category)
      .eq('is_public', true)
      .order('usage_count', { ascending: false });

    if (error) {
      console.error('Error fetching templates by category:', error);
      throw error;
    }

    return (data as PanelTemplateRow[]).map(mapTemplateRowToTemplate);
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id: string): Promise<PanelTemplate | null> {
    const { data, error } = await this.supabase
      .from('panel_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching template:', error);
      return null;
    }

    return mapTemplateRowToTemplate(data as PanelTemplateRow);
  }

  /**
   * Search templates
   */
  async searchTemplates(query: string): Promise<PanelTemplate[]> {
    const { data, error } = await this.supabase
      .from('panel_templates')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .eq('is_public', true)
      .order('usage_count', { ascending: false });

    if (error) {
      console.error('Error searching templates:', error);
      throw error;
    }

    return (data as PanelTemplateRow[]).map(mapTemplateRowToTemplate);
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit: number = 10): Promise<PanelTemplate[]> {
    const { data, error } = await this.supabase
      .from('panel_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching popular templates:', error);
      throw error;
    }

    return (data as PanelTemplateRow[]).map(mapTemplateRowToTemplate);
  }

  /**
   * Get top rated templates
   */
  async getTopRatedTemplates(limit: number = 10): Promise<PanelTemplate[]> {
    const { data, error } = await this.supabase
      .from('panel_templates')
      .select('*')
      .eq('is_public', true)
      .order('avg_rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top rated templates:', error);
      throw error;
    }

    return (data as PanelTemplateRow[]).map(mapTemplateRowToTemplate);
  }

  /**
   * Increment template usage count
   */
  async incrementUsage(templateId: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_template_usage', {
      template_id: templateId,
    });

    if (error) {
      console.error('Error incrementing usage:', error);
    }
  }

  /**
   * Create custom template
   */
  async createTemplate(
    template: PanelTemplate,
    userId: string,
    tenantId?: string
  ): Promise<PanelTemplate | null> {
    const row = mapTemplateToTemplateRow(template, userId, tenantId);

    const { data, error } = await this.supabase
      .from('panel_templates')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw error;
    }

    return mapTemplateRowToTemplate(data as PanelTemplateRow);
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<PanelTemplate>
  ): Promise<PanelTemplate | null> {
    // Convert camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.panelType) dbUpdates.panel_type = updates.panelType;
    if (updates.managementType) dbUpdates.management_type = updates.managementType;
    if (updates.suggestedAgents) dbUpdates.suggested_agents = updates.suggestedAgents;
    if (updates.optimalExperts !== undefined) dbUpdates.optimal_experts = updates.optimalExperts;
    if (updates.durationTypical !== undefined) dbUpdates.duration_typical = updates.durationTypical;

    const { data, error } = await this.supabase
      .from('panel_templates')
      .update(dbUpdates)
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      throw error;
    }

    return mapTemplateRowToTemplate(data as PanelTemplateRow);
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    const { error } = await this.supabase
      .from('panel_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Get all management patterns
   */
  async getManagementPatterns(): Promise<PanelManagementPatternRow[]> {
    const { data, error } = await this.supabase
      .from('panel_management_patterns')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching management patterns:', error);
      throw error;
    }

    return data as PanelManagementPatternRow[];
  }

  /**
   * Get user customizations
   */
  async getUserCustomizations(userId: string): Promise<UserPanelCustomizationRow[]> {
    const { data, error } = await this.supabase
      .from('user_panel_customizations')
      .select('*')
      .eq('user_id', userId)
      .order('last_used_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching user customizations:', error);
      throw error;
    }

    return data as UserPanelCustomizationRow[];
  }

  /**
   * Save user customization
   */
  async saveCustomization(
    userId: string,
    templateId: string,
    customization: {
      custom_name: string;
      custom_description?: string;
      custom_agents: string[];
      custom_configuration: Record<string, any>;
    },
    tenantId?: string
  ): Promise<UserPanelCustomizationRow | null> {
    const { data, error } = await this.supabase
      .from('user_panel_customizations')
      .insert({
        user_id: userId,
        tenant_id: tenantId || null,
        template_id: templateId,
        ...customization,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving customization:', error);
      throw error;
    }

    return data as UserPanelCustomizationRow;
  }

  /**
   * Toggle favorite
   */
  async toggleFavorite(customizationId: string, isFavorite: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('user_panel_customizations')
      .update({ is_favorite: isFavorite })
      .eq('id', customizationId);

    if (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Update customization usage
   */
  async updateCustomizationUsage(customizationId: string): Promise<void> {
    const { error } = await this.supabase.rpc('update_customization_usage', {
      customization_id: customizationId,
    });

    if (error) {
      console.error('Error updating customization usage:', error);
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('panel_templates')
      .select('category')
      .eq('is_public', true);

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    const categories = Array.from(new Set(data.map((row) => row.category)));
    return categories.sort();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let apiInstance: PanelTemplatesAPI | null = null;

export function getPanelTemplatesAPI(): PanelTemplatesAPI {
  if (!apiInstance) {
    apiInstance = new PanelTemplatesAPI();
  }
  return apiInstance;
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useEffect, useState } from 'react';

export function usePanelTemplates() {
  const [templates, setTemplates] = useState<PanelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const api = getPanelTemplatesAPI();
    api
      .getPublicTemplates()
      .then(setTemplates)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { templates, loading, error };
}

export function usePopularTemplates(limit: number = 10) {
  const [templates, setTemplates] = useState<PanelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const api = getPanelTemplatesAPI();
    api
      .getPopularTemplates(limit)
      .then(setTemplates)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [limit]);

  return { templates, loading, error };
}

export function useTemplatesByType(panelType: PanelType | null) {
  const [templates, setTemplates] = useState<PanelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!panelType) {
      setLoading(false);
      return;
    }

    const api = getPanelTemplatesAPI();
    api
      .getTemplatesByType(panelType)
      .then(setTemplates)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [panelType]);

  return { templates, loading, error };
}
