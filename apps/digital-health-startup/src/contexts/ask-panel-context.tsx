/**
 * Ask Panel Context
 * Manages saved panels state across the application
 */

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Saved Panel Type
export interface SavedPanel {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  mode: string;
  suggestedAgents: string[];
  purpose?: string;
  isBookmarked?: boolean;
  IconComponent?: any; // Lucide icon component
}

// Context Type
interface AskPanelContextType {
  savedPanels: SavedPanel[];
  addPanel: (panel: SavedPanel) => void;
  duplicatePanel: (panel: SavedPanel) => void;
  toggleBookmark: (panelId: string) => void;
  removePanel: (panelId: string) => void;
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

  const addPanel = (panel: SavedPanel) => {
    setSavedPanels((prev) => {
      // Check if panel already exists
      if (prev.some((p) => p.id === panel.id)) {
        return prev;
      }
      return [...prev, panel];
    });
  };

  const duplicatePanel = (panel: SavedPanel) => {
    const duplicatedPanel = {
      ...panel,
      id: `${panel.id}-${Date.now()}`,
      name: `${panel.name} (Copy)`,
    };
    setSavedPanels((prev) => [...prev, duplicatedPanel]);
  };

  const toggleBookmark = (panelId: string) => {
    setSavedPanels((prev) =>
      prev.map((p) =>
        p.id === panelId ? { ...p, isBookmarked: !p.isBookmarked } : p
      )
    );
  };

  const removePanel = (panelId: string) => {
    setSavedPanels((prev) => prev.filter((p) => p.id !== panelId));
  };

  return (
    <AskPanelContext.Provider
      value={{ savedPanels, addPanel, duplicatePanel, toggleBookmark, removePanel }}
    >
      {children}
    </AskPanelContext.Provider>
  );
}

