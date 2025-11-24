'use client';

import { createContext, useContext, ReactNode } from 'react';

interface DesignerContextType {
  onPanelSelect: (panelId: string) => void;
}

const DesignerContext = createContext<DesignerContextType | null>(null);

export function DesignerProvider({
  children,
  onPanelSelect,
}: {
  children: ReactNode;
  onPanelSelect: (panelId: string) => void;
}) {
  return (
    <DesignerContext.Provider value={{ onPanelSelect }}>
      {children}
    </DesignerContext.Provider>
  );
}

export function useDesigner() {
  const context = useContext(DesignerContext);
  if (!context) {
    // Return a no-op if not in designer context (for sidebars on other pages)
    return { onPanelSelect: () => {} };
  }
  return context;
}
