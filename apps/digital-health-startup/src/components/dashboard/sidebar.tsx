'use client';

import * as React from "react";
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// ============================================================================
// SIDEBAR CONTEXT AND PROVIDER (NO Radix UI)
// ============================================================================

interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  variant: 'default' | 'inset';
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined);

const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  defaultOpen?: boolean;
}

const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  style,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, variant: 'inset' }}>
      <div className="flex min-h-screen" style={style}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

// ============================================================================
// SIDEBAR COMPONENTS (NO Radix UI)
// ============================================================================

interface SidebarProps {
  children: React.ReactNode;
  variant?: 'default' | 'inset';
}

const Sidebar: React.FC<SidebarProps> = ({ children, variant = 'default' }) => {
  const { isOpen } = useSidebar();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        isOpen ? 'w-72' : 'w-0',
        variant === 'inset' && 'relative'
      )}
      style={{ width: isOpen ? 'var(--sidebar-width, 18rem)' : '0' }}
    >
      <div className={cn('flex h-full flex-col', !isOpen && 'hidden')}>{children}</div>
    </aside>
  );
};

const SidebarHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn('flex items-center border-b px-6 py-4', className)} {...props} />
);

const SidebarContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn('flex-1 overflow-y-auto py-4', className)} {...props} />;

const SidebarFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn('border-t px-6 py-4', className)} {...props} />
);

const SidebarInset: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  const { isOpen } = useSidebar();

  return (
    <div
      className={cn('flex-1 transition-all duration-300', className)}
      style={{
        marginLeft: isOpen ? 'var(--sidebar-width, 18rem)' : '0',
      }}
      {...props}
    />
  );
};

// ============================================================================
// VITAL APP SIDEBAR COMPONENT
// ============================================================================

interface SidebarRoute {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface VitalAppSidebarProps {
  variant?: 'default' | 'inset';
  routes: SidebarRoute[];
  activeRoute: string;
  onRouteChange: (path: string) => void;
  user?: {
    name: string;
    email: string;
    initials: string;
  };
}

const VitalAppSidebar: React.FC<VitalAppSidebarProps> = ({
  variant = 'inset',
  routes,
  activeRoute,
  onRouteChange,
  user,
}) => {
  return (
    <Sidebar variant={variant}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold">VITAL</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <nav className="space-y-1 px-3">
          {routes.map((route) => (
            <button
              key={route.path}
              onClick={() => onRouteChange(route.path)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                activeRoute === route.path
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {route.icon}
              <span className="flex-1 text-left">{route.name}</span>
              {route.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {route.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </SidebarContent>

      {user && (
        <SidebarFooter>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <span className="text-xs font-medium">{user.initials}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  VitalAppSidebar,
  type SidebarRoute,
  type VitalAppSidebarProps,
};
