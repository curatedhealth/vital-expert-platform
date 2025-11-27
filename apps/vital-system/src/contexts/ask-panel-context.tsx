/**
 * Ask Panel Context
 * Manages saved panels state across the application
 * Now fetches from Supabase and persists user custom panels
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Saved Panel Type (matches Supabase user_panels table)
export interface SavedPanel {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  mode: string;
  suggestedAgents: string[]; // selected_agents from DB
  selectedAgents?: string[]; // Explicit selected agents
  purpose?: string;
  isBookmarked?: boolean; // is_favorite from DB
  IconComponent?: any; // Lucide icon component
  base_panel_slug?: string; // Template this was based on
  framework?: string;
  custom_settings?: Record<string, any>;
  default_settings?: Record<string, any>;
  metadata?: Record<string, any>;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  last_used_at?: string;
}

// Context Type
interface AskPanelContextType {
  savedPanels: SavedPanel[];
  loading: boolean;
  error: string | null;
  addPanel: (panel: SavedPanel) => Promise<void>;
  createCustomPanel: (panelData: {
    name: string;
    description?: string;
    category: string;
    base_panel_slug?: string;
    mode: string;
    framework: string;
    selected_agents: string[];
    custom_settings?: Record<string, any>;
    metadata?: Record<string, any>;
    icon?: string;
    tags?: string[];
  }) => Promise<SavedPanel | null>;
  updatePanel: (panelId: string, updates: Partial<SavedPanel>) => Promise<void>;
  duplicatePanel: (panel: SavedPanel) => Promise<void>;
  toggleBookmark: (panelId: string) => Promise<void>;
  removePanel: (panelId: string) => Promise<void>;
  refreshPanels: () => Promise<void>;
}

// Create Context
const AskPanelContext = createContext<AskPanelContextType | undefined>(undefined);

// Hook to use the context
export function useSavedPanels() {
  const context = useContext(AskPanelContext);
  if (!context) {
    throw new Error('useSavedPanels must be used within AskPanelProvider');
  }
  return context;
}

// Provider Component
export function AskPanelProvider({ children }: { children: ReactNode }) {
  const [savedPanels, setSavedPanels] = useState<SavedPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch panels from Supabase on mount
  useEffect(() => {
    let mounted = true;

    const fetchPanels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/user-panels');
        
        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated - return empty array
            if (mounted) {
              setSavedPanels([]);
              setLoading(false);
            }
            return;
          }
          throw new Error(`Failed to fetch panels: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!mounted) return;

        if (data.success) {
          // Map database format to SavedPanel format
          const mappedPanels: SavedPanel[] = (data.panels || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            icon: p.icon || p.metadata?.icon,
            category: p.category,
            mode: p.mode,
            suggestedAgents: p.selected_agents || [], // Use selected_agents as suggestedAgents
            selectedAgents: p.selected_agents || [],
            purpose: p.description,
            isBookmarked: p.is_favorite || false,
            base_panel_slug: p.base_panel_slug,
            framework: p.framework,
            custom_settings: p.custom_settings,
            default_settings: p.default_settings,
            metadata: p.metadata,
            tags: p.tags || [],
            created_at: p.created_at,
            updated_at: p.updated_at,
            last_used_at: p.last_used_at,
          }));
          
          setSavedPanels(mappedPanels);
        } else {
          throw new Error(data.error || 'Failed to fetch panels');
        }
      } catch (err: any) {
        if (!mounted) return;
        console.error('[AskPanelContext] Error fetching panels:', err);
        setError(err.message || 'Failed to load panels');
        setSavedPanels([]); // Fallback to empty array
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPanels();

    return () => {
      mounted = false;
    };
  }, []); // Only run on mount

  const refreshPanels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user-panels');
      
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - return empty array
          setSavedPanels([]);
          setLoading(false);
          return;
        }
        throw new Error(`Failed to fetch panels: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Map database format to SavedPanel format
        const mappedPanels: SavedPanel[] = (data.panels || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          icon: p.icon || p.metadata?.icon,
          category: p.category,
          mode: p.mode,
          suggestedAgents: p.selected_agents || [], // Use selected_agents as suggestedAgents
          selectedAgents: p.selected_agents || [],
          purpose: p.description,
          isBookmarked: p.is_favorite || false,
          base_panel_slug: p.base_panel_slug,
          framework: p.framework,
          custom_settings: p.custom_settings,
          default_settings: p.default_settings,
          metadata: p.metadata,
          tags: p.tags || [],
          created_at: p.created_at,
          updated_at: p.updated_at,
          last_used_at: p.last_used_at,
        }));
        
        setSavedPanels(mappedPanels);
      } else {
        throw new Error(data.error || 'Failed to fetch panels');
      }
    } catch (err: any) {
      console.error('[AskPanelContext] Error fetching panels:', err);
      setError(err.message || 'Failed to load panels');
      setSavedPanels([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomPanel = async (panelData: {
    name: string;
    description?: string;
    category: string;
    base_panel_slug?: string;
    mode: string;
    framework: string;
    selected_agents: string[];
    custom_settings?: Record<string, any>;
    metadata?: Record<string, any>;
    icon?: string;
    tags?: string[];
  }): Promise<SavedPanel | null> => {
    try {
      const response = await fetch('/api/user-panels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(panelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create panel');
      }

      const data = await response.json();
      
      if (data.success && data.panel) {
        // Refresh panels list
        await refreshPanels();
        
        // Return the created panel in SavedPanel format
        const panel = data.panel;
        return {
          id: panel.id,
          name: panel.name,
          description: panel.description || '',
          icon: panel.icon || panel.metadata?.icon,
          category: panel.category,
          mode: panel.mode,
          suggestedAgents: panel.selected_agents || [],
          selectedAgents: panel.selected_agents || [],
          purpose: panel.description,
          isBookmarked: panel.is_favorite || false,
          base_panel_slug: panel.base_panel_slug,
          framework: panel.framework,
          custom_settings: panel.custom_settings,
          default_settings: panel.default_settings,
          metadata: panel.metadata,
          tags: panel.tags || [],
          created_at: panel.created_at,
          updated_at: panel.updated_at,
        };
      }
      
      return null;
    } catch (err: any) {
      console.error('[AskPanelContext] Error creating panel:', err);
      setError(err.message || 'Failed to create panel');
      return null;
    }
  };

  const addPanel = async (panel: SavedPanel) => {
    // If panel has an ID and looks like it's from DB, just refresh
    // Otherwise, create it
    if (panel.id && panel.created_at) {
      await refreshPanels();
      return;
    }
    
    // Create new panel from SavedPanel format
    await createCustomPanel({
      name: panel.name,
      description: panel.description,
      category: panel.category,
      mode: panel.mode,
      framework: panel.framework || 'langgraph',
      selected_agents: panel.selectedAgents || panel.suggestedAgents,
      metadata: panel.metadata,
      icon: panel.icon,
      tags: panel.tags,
      base_panel_slug: panel.base_panel_slug,
    });
  };

  const updatePanel = async (panelId: string, updates: Partial<SavedPanel>) => {
    try {
      // Map SavedPanel fields to database fields
      const dbUpdates: any = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.mode !== undefined) dbUpdates.mode = updates.mode;
      if (updates.framework !== undefined) dbUpdates.framework = updates.framework;
      if (updates.selectedAgents !== undefined || updates.suggestedAgents !== undefined) {
        dbUpdates.selected_agents = updates.selectedAgents || updates.suggestedAgents;
      }
      if (updates.custom_settings !== undefined) dbUpdates.custom_settings = updates.custom_settings;
      if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.isBookmarked !== undefined) dbUpdates.is_favorite = updates.isBookmarked;

      const response = await fetch(`/api/user-panels/${panelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbUpdates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update panel');
      }

      await refreshPanels();
    } catch (err: any) {
      console.error('[AskPanelContext] Error updating panel:', err);
      setError(err.message || 'Failed to update panel');
      throw err;
    }
  };

  const duplicatePanel = async (panel: SavedPanel) => {
    await createCustomPanel({
      name: `${panel.name} (Copy)`,
      description: panel.description,
      category: panel.category,
      base_panel_slug: panel.base_panel_slug,
      mode: panel.mode,
      framework: panel.framework || 'langgraph',
      selected_agents: panel.selectedAgents || panel.suggestedAgents,
      custom_settings: panel.custom_settings,
      metadata: panel.metadata,
      icon: panel.icon,
      tags: panel.tags,
    });
  };

  const toggleBookmark = async (panelId: string) => {
    const panel = savedPanels.find((p) => p.id === panelId);
    if (panel) {
      await updatePanel(panelId, { isBookmarked: !panel.isBookmarked });
    }
  };

  const removePanel = async (panelId: string) => {
    try {
      const response = await fetch(`/api/user-panels/${panelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete panel');
      }

      await refreshPanels();
    } catch (err: any) {
      console.error('[AskPanelContext] Error deleting panel:', err);
      setError(err.message || 'Failed to delete panel');
      throw err;
    }
  };

  return (
    <AskPanelContext.Provider
      value={{
        savedPanels,
        loading,
        error,
        addPanel,
        createCustomPanel,
        updatePanel,
        duplicatePanel,
        toggleBookmark,
        removePanel,
        refreshPanels,
      }}
    >
      {children}
    </AskPanelContext.Provider>
  );
}

