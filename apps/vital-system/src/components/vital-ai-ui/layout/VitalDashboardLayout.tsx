'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface VitalDashboardLayoutProps {
  sidebar?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  showSidebar?: boolean;
  sidebarWidth?: number;
  className?: string;
}

/**
 * VitalDashboardLayout - Standard dashboard layout
 * 
 * Provides a consistent layout for dashboard views
 * with sidebar, header, main content, and footer areas.
 * Reusable across all admin and analytics dashboards.
 */
export function VitalDashboardLayout({
  sidebar,
  header,
  children,
  footer,
  showSidebar = true,
  sidebarWidth = 256,
  className
}: VitalDashboardLayoutProps) {
  return (
    <div className={cn("flex h-screen overflow-hidden", className)}>
      {/* Sidebar */}
      {sidebar && showSidebar && (
        <div 
          className="border-r bg-background shrink-0 hidden lg:block"
          style={{ width: sidebarWidth }}
        >
          {sidebar}
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        {header && (
          <div className="border-b shrink-0 bg-background">
            {header}
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        {footer && (
          <div className="border-t shrink-0 bg-background">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * VitalDashboardHeader - Dashboard header with breadcrumb and actions
 */
export function VitalDashboardHeader({
  title,
  description,
  breadcrumb,
  actions,
  className
}: {
  title: string;
  description?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {breadcrumb && (
        <div className="mb-2 text-sm text-muted-foreground">
          {breadcrumb}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * VitalDashboardContent - Dashboard main content area
 */
export function VitalDashboardContent({
  children,
  fullWidth = false,
  className
}: {
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(
      "p-6",
      !fullWidth && "max-w-7xl mx-auto",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * VitalDashboardGrid - Responsive grid for dashboard cards
 */
export function VitalDashboardGrid({
  children,
  columns = 4,
  className
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const colClasses = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  };

  return (
    <div className={cn(
      "grid gap-4 md:grid-cols-2",
      colClasses[columns],
      className
    )}>
      {children}
    </div>
  );
}

/**
 * VitalDashboardSection - Section within dashboard
 */
export function VitalDashboardSection({
  title,
  description,
  actions,
  children,
  className
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export default VitalDashboardLayout;
