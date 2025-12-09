/**
 * VITAL AI UI - Navigation & Layout Components (Domain G)
 * 
 * Components for sidebar navigation, panel layouts, and page structure.
 * 6 components total (with multiple sub-components).
 */

// Sidebar
export { 
  VitalSidebarProvider,
  useSidebarContext,
  VitalSidebar, 
  VitalSidebarHeader,
  VitalSidebarContent,
  VitalSidebarFooter,
  VitalSidebarGroup,
  VitalSidebarItem,
  VitalSidebarTrigger,
  VitalSidebarInset,
  default as Sidebar 
} from './VitalSidebar';

// Split Panel
export { 
  VitalSplitPanel, 
  default as SplitPanel 
} from './VitalSplitPanel';

// Context Panel
export { 
  VitalContextPanel, 
  default as ContextPanel 
} from './VitalContextPanel';

// Chat Layout
export { 
  VitalChatLayout,
  VitalChatMessages,
  VitalChatHeader,
  default as ChatLayout 
} from './VitalChatLayout';

// Dashboard Layout
export { 
  VitalDashboardLayout,
  VitalDashboardHeader,
  VitalDashboardContent,
  VitalDashboardGrid,
  VitalDashboardSection,
  default as DashboardLayout 
} from './VitalDashboardLayout';

// Loading States
export { 
  VitalSpinner,
  VitalSkeleton,
  VitalSkeletonText,
  VitalSkeletonCard,
  VitalSkeletonMessage,
  VitalSkeletonTable,
  VitalSkeletonAvatar,
  VitalShimmer,
  VitalLoadingOverlay,
  VitalLoadingPage,
  VitalPulse,
  default as LoadingStates 
} from './VitalLoadingStates';
