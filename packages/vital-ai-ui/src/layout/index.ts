/**
 * VITAL AI UI - Navigation & Layout Components (Domain G)
 * 
 * Components for sidebar navigation, panel layouts, and page structure.
 * Shared across: Ask Expert, Ask Panel, Workflow Automation, Admin
 * 
 * Components (7):
 * - VitalSidebar: Base sidebar with provider
 * - VitalSplitPanel: Resizable split panels
 * - VitalContextPanel: Context/detail panel
 * - VitalChatLayout: Chat interface layout
 * - VitalDashboardLayout: Dashboard layout
 * - VitalLoadingStates: Loading skeletons/spinners
 * - VitalIntelligentSidebar: Context-aware sidebar
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

// Loading States (skeletons, spinners, overlays)
export { 
  VitalSpinner,
  VitalSkeleton,
  VitalSkeletonText,
  VitalSkeletonCard,
  VitalSkeletonMessage,
  VitalSkeletonTable,
  VitalSkeletonAvatar,
  VitalSkeletonShimmer,
  VitalLoadingOverlay,
  VitalLoadingPage,
  VitalPulse,
  default as LoadingStates 
} from './VitalLoadingStates';

// Text Shimmer (Framer Motion powered)
export {
  VitalShimmer,
  Shimmer,
  TextShimmer,
} from './VitalShimmer';

export type {
  VitalShimmerProps,
  TextShimmerProps,
} from './VitalShimmer';

// Intelligent Sidebar
export { VitalIntelligentSidebar } from './VitalIntelligentSidebar';
