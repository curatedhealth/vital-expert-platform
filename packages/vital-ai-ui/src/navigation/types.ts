/**
 * VitalNavigation - Types for Shared Navigation Components
 *
 * These types enable the MainNavbar and AppSidebar to be configurable
 * while remaining reusable across different applications.
 */

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

// ============================================================================
// NAVIGATION ITEM TYPES
// ============================================================================

/**
 * Base navigation item for menus and dropdowns
 */
export interface NavItem {
  /** Display label */
  label: string;
  /** Route href */
  href: string;
  /** Optional description for mega-menus */
  description?: string;
  /** Lucide icon component */
  icon?: LucideIcon;
  /** Badge text (e.g., "New", "Beta") */
  badge?: string;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** External link (opens in new tab) */
  external?: boolean;
}

/**
 * Navigation group with multiple items
 */
export interface NavGroup {
  /** Group title (e.g., "Consult", "Craft") */
  title: string;
  /** Icon for the group header */
  icon?: LucideIcon;
  /** Description for the group */
  description?: string;
  /** Items in this group */
  items: NavItem[];
  /** Gradient colors for styling [from, to] */
  gradientColors?: [string, string];
  /** Number of columns in dropdown */
  columns?: 1 | 2;
}

/**
 * Standalone navigation link (not in a dropdown)
 */
export interface NavLink extends NavItem {
  /** Whether this is a primary/highlighted link */
  primary?: boolean;
}

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * User information for display in navbar
 */
export interface NavUser {
  /** User's display name */
  name: string;
  /** User's email */
  email: string;
  /** Avatar URL */
  avatar?: string;
  /** User's role for display */
  role?: string;
}

// ============================================================================
// QUICK ACTION TYPES
// ============================================================================

/**
 * Quick action item for the + menu
 */
export interface QuickAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  /** Group separator before this item */
  separator?: boolean;
}

// ============================================================================
// COMMAND PALETTE TYPES
// ============================================================================

/**
 * Command palette group
 */
export interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

/**
 * Command palette item
 */
export interface CommandItem {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  shortcut?: string;
}

// ============================================================================
// NAVBAR CONFIGURATION
// ============================================================================

/**
 * Full navbar configuration
 */
export interface NavbarConfig {
  /** Logo/brand configuration */
  brand?: {
    logo?: ReactNode;
    name?: string;
    href?: string;
  };
  /** Navigation groups (mega-menus) */
  navGroups: NavGroup[];
  /** Standalone nav links */
  navLinks?: NavLink[];
  /** Quick actions for + button */
  quickActions?: QuickAction[];
  /** Command palette groups */
  commandGroups?: CommandGroup[];
  /** Right-side configuration */
  rightSide?: {
    showSearch?: boolean;
    showQuickActions?: boolean;
    showNotifications?: boolean;
    showThemeToggle?: boolean;
    showUserMenu?: boolean;
  };
  /** Notification count */
  notificationCount?: number;
  /** Custom components to render in specific slots */
  slots?: {
    /** Custom component before nav items */
    beforeNav?: ReactNode;
    /** Custom component after nav items */
    afterNav?: ReactNode;
    /** Custom component in right side */
    rightSide?: ReactNode;
    /** Custom tenant switcher */
    tenantSwitcher?: ReactNode;
    /** Custom theme toggle */
    themeToggle?: ReactNode;
  };
}

// ============================================================================
// SIDEBAR CONFIGURATION
// ============================================================================

/**
 * Sidebar section with items
 */
export interface SidebarSection {
  /** Section title (optional) */
  title?: string;
  /** Section items */
  items: SidebarItem[];
  /** Collapsible section */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

/**
 * Sidebar item
 */
export interface SidebarItem {
  /** Display label */
  label: string;
  /** Route href */
  href?: string;
  /** Click handler (alternative to href) */
  onClick?: () => void;
  /** Lucide icon */
  icon?: LucideIcon;
  /** Badge content */
  badge?: ReactNode;
  /** Sub-items for nested navigation */
  items?: SidebarItem[];
  /** Whether this item is active */
  isActive?: boolean;
  /** Whether this is a separator */
  separator?: boolean;
}

/**
 * Content renderer for route-based sidebar content
 */
export interface SidebarContentConfig {
  /** Route pattern to match */
  pattern: string | RegExp;
  /** Component to render */
  component: ReactNode;
  /** Priority for matching (higher = checked first) */
  priority?: number;
}

/**
 * Full sidebar configuration
 */
export interface SidebarConfig {
  /** Header content */
  header?: {
    title?: string;
    logo?: ReactNode;
    showStatus?: boolean;
    statusText?: string;
  };
  /** Route-based content configuration */
  contentRoutes?: SidebarContentConfig[];
  /** Default sections when no route matches */
  defaultSections?: SidebarSection[];
  /** Footer user display */
  showUserFooter?: boolean;
}

// ============================================================================
// DASHBOARD LAYOUT CONFIGURATION
// ============================================================================

/**
 * Full dashboard layout configuration
 */
export interface DashboardLayoutConfig {
  /** Navbar configuration */
  navbar?: NavbarConfig;
  /** Sidebar configuration */
  sidebar?: SidebarConfig;
  /** Routes that should be full-width (no sidebar) */
  fullWidthRoutes?: string[];
  /** Custom loading component */
  loadingComponent?: ReactNode;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

/**
 * Navigation context value for sharing state
 */
export interface NavigationContextValue {
  /** Current pathname */
  pathname: string | null;
  /** Navigation function */
  navigate: (href: string) => void;
  /** Current user */
  user: NavUser | null;
  /** Sign out function */
  signOut?: () => Promise<void>;
  /** Is path active check */
  isPathActive: (href: string) => boolean;
}
