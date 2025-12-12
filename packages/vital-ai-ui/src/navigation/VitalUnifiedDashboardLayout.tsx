/**
 * VitalUnifiedDashboardLayout - Shared Dashboard Layout Component
 *
 * Combines the main navbar and sidebar with the main content area.
 * Supports full-width routes and page-specific sidebar content.
 *
 * @example
 * ```tsx
 * <VitalUnifiedDashboardLayout
 *   navbarConfig={navbarConfig}
 *   sidebarConfig={sidebarConfig}
 *   pathname={pathname}
 *   user={currentUser}
 *   onNavigate={router.push}
 *   onSignOut={handleSignOut}
 * >
 *   {children}
 * </VitalUnifiedDashboardLayout>
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import {
  VitalMainNavbar,
  type VitalMainNavbarProps,
} from './VitalMainNavbar';
import {
  VitalAppSidebar,
  VitalAppSidebarProvider,
  type VitalAppSidebarProps,
} from './VitalAppSidebar';
import type { NavbarConfig, SidebarConfig, NavUser } from './types';

// ============================================================================
// LOADING COMPONENT
// ============================================================================

const DefaultLoadingComponent: React.FC = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface VitalUnifiedDashboardLayoutProps {
  /** Child content */
  children: React.ReactNode;
  /** Navbar configuration */
  navbarConfig: NavbarConfig;
  /** Sidebar configuration */
  sidebarConfig?: SidebarConfig;
  /** Current pathname */
  pathname?: string | null;
  /** Current user */
  user?: NavUser | null;
  /** Navigation handler */
  onNavigate: (href: string) => void;
  /** Sign out handler */
  onSignOut?: () => Promise<void>;
  /** Routes that should be full-width (no sidebar) */
  fullWidthRoutes?: string[];
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Route-based sidebar content map */
  sidebarContentRouter?: Map<string | RegExp, React.ReactNode>;
  /** Default sidebar content */
  defaultSidebarContent?: React.ReactNode;
  /** User footer component for sidebar */
  userFooter?: React.ReactNode;
  /** Command palette open state */
  commandOpen?: boolean;
  /** Command palette state setter */
  onCommandOpenChange?: (open: boolean) => void;
  /** Custom command palette component */
  commandPalette?: React.ReactNode;
  /** Additional className for wrapper */
  className?: string;
  /** Additional className for main content */
  contentClassName?: string;
}

export const VitalUnifiedDashboardLayout: React.FC<
  VitalUnifiedDashboardLayoutProps
> = ({
  children,
  navbarConfig,
  sidebarConfig,
  pathname,
  user,
  onNavigate,
  onSignOut,
  fullWidthRoutes = [],
  loadingComponent,
  sidebarContentRouter,
  defaultSidebarContent,
  userFooter,
  commandOpen,
  onCommandOpenChange,
  commandPalette,
  className,
  contentClassName,
}) => {
  const [mounted, setMounted] = React.useState(false);

  // Check if current route should be full-width (no global sidebar)
  const isFullWidthRoute = fullWidthRoutes.some((route) =>
    pathname?.startsWith(route)
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return loadingComponent || <DefaultLoadingComponent />;
  }

  // Full-width layout for routes that have their own sidebar
  if (isFullWidthRoute) {
    return (
      <div className={cn('flex min-h-screen w-full flex-col', className)}>
        {/* Main Navbar */}
        <VitalMainNavbar
          config={navbarConfig}
          user={user}
          pathname={pathname}
          onNavigate={onNavigate}
          onSignOut={onSignOut}
          commandOpen={commandOpen}
          onCommandOpenChange={onCommandOpenChange}
          sidebarSpacerWidth="0px"
        />

        {/* Full-width Content Area */}
        <main className={cn('flex flex-1 flex-col', contentClassName)}>
          {children}
        </main>

        {/* Command Palette */}
        {commandPalette}
      </div>
    );
  }

  // Standard layout with global sidebar
  return (
    <VitalAppSidebarProvider>
      <div className={cn('flex min-h-screen w-full flex-col', className)}>
        {/* Main Navbar - Above Everything */}
        <VitalMainNavbar
          config={navbarConfig}
          user={user}
          pathname={pathname}
          onNavigate={onNavigate}
          onSignOut={onSignOut}
          commandOpen={commandOpen}
          onCommandOpenChange={onCommandOpenChange}
        />

        {/* Sidebar and Content */}
        <div className="flex flex-1">
          <VitalAppSidebar
            config={sidebarConfig}
            pathname={pathname}
            user={user}
            onNavigate={onNavigate}
            contentRouter={sidebarContentRouter}
            defaultContent={defaultSidebarContent}
            userFooter={userFooter}
            className="!top-16 !h-[calc(100vh-4rem)]"
          />

          {/* Main Content Area */}
          <main
            className={cn(
              'flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6',
              contentClassName
            )}
          >
            {children}
          </main>
        </div>

        {/* Command Palette */}
        {commandPalette}
      </div>
    </VitalAppSidebarProvider>
  );
};

VitalUnifiedDashboardLayout.displayName = 'VitalUnifiedDashboardLayout';

export default VitalUnifiedDashboardLayout;
