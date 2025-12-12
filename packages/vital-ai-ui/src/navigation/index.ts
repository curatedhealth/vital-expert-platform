/**
 * VITAL AI UI - Navigation Components
 *
 * Shared navigation components for dashboard layouts including:
 * - VitalMainNavbar: Comprehensive top navbar with mega-menus
 * - VitalAppSidebar: Route-aware collapsible sidebar
 * - VitalUnifiedDashboardLayout: Combined layout with navbar + sidebar
 *
 * @packageDocumentation
 */

// ============================================================================
// COMPONENTS
// ============================================================================

export {
  VitalMainNavbar,
  default as MainNavbar,
} from './VitalMainNavbar';
export type { VitalMainNavbarProps } from './VitalMainNavbar';

export {
  VitalAppSidebar,
  VitalAppSidebarProvider,
  VitalAppSidebarHeader,
  VitalAppSidebarContent,
  VitalAppSidebarFooter,
  VitalAppSidebarSection,
  VitalAppSidebarItem,
  VitalAppSidebarTrigger,
  useAppSidebarContext,
  default as AppSidebar,
} from './VitalAppSidebar';
export type { VitalAppSidebarProps } from './VitalAppSidebar';

export {
  VitalUnifiedDashboardLayout,
  default as UnifiedDashboardLayout,
} from './VitalUnifiedDashboardLayout';
export type { VitalUnifiedDashboardLayoutProps } from './VitalUnifiedDashboardLayout';

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Navigation types
  NavItem,
  NavGroup,
  NavLink,
  NavUser,
  QuickAction,
  CommandGroup,
  CommandItem,
  NavbarConfig,

  // Sidebar types
  SidebarSection,
  SidebarItem,
  SidebarContentConfig,
  SidebarConfig,

  // Layout types
  DashboardLayoutConfig,
  NavigationContextValue,
} from './types';
