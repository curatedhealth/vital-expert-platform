'use client';

/**
 * Header Actions Context
 *
 * Allows pages to inject content into the global DashboardHeader.
 * Content appears between the breadcrumb and user menu.
 */

import { createContext, useContext, useState, type ReactNode } from 'react';

interface HeaderActionsContextValue {
  actions: ReactNode | null;
  setActions: (actions: ReactNode | null) => void;
}

const HeaderActionsContext = createContext<HeaderActionsContextValue | undefined>(undefined);

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode | null>(null);

  return (
    <HeaderActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </HeaderActionsContext.Provider>
  );
}

export function useHeaderActions() {
  const context = useContext(HeaderActionsContext);
  if (!context) {
    throw new Error('useHeaderActions must be used within HeaderActionsProvider');
  }
  return context;
}

export function useSetHeaderActions() {
  const { setActions } = useHeaderActions();
  return setActions;
}

export function HeaderActionsSlot() {
  const context = useContext(HeaderActionsContext);
  return context?.actions ?? null;
}
