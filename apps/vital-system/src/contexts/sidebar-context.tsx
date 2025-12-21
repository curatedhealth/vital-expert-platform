'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ============================================================================
// CONSTANTS
// ============================================================================

export const SIDEBAR_COLLAPSED_WIDTH = 76;
export const SIDEBAR_EXPANDED_WIDTH = 240;

// ============================================================================
// TYPES
// ============================================================================

interface SidebarContextValue {
  isExpanded: boolean;
  toggleSidebar: () => void;
  sidebarWidth: number;
}

// ============================================================================
// CONTEXT
// ============================================================================

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const sidebarWidth = isExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar, sidebarWidth }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
