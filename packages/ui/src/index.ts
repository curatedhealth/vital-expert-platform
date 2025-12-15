// UI Components - shadcn/ui based
export * from './accordion';
export * from './components/agent-avatar';
export * from './components/alert';
export * from './components/avatar';
export * from './components/badge';
export * from './components/breadcrumb';
export * from './components/button';
export * from './components/card';
export * from './components/checkbox';
export * from './components/collapsible';
export * from './components/command';
export * from './components/dialog';
export * from './components/dropdown-menu';
export * from './components/enhanced-agent-card';
export * from './components/hover-card';
export * from './components/icon-selection-modal';
export * from './components/input';
export * from './components/label';
export * from './components/loading-skeletons';
export * from './components/popover';
export * from './components/progress';
// export * from './components/resizable'; // Requires react-resizable-panels dependency
export * from './components/scroll-area';
export * from './components/select';
export * from './components/separator';
export * from './components/sheet';
export * from './components/sidebar';
export * from './components/skeleton';
export * from './components/slider';
export * from './components/switch';
export * from './components/table';
export * from './components/tabs';
export * from './components/textarea';
// Toast exports - avoid duplicate Toast type
export * from './components/toaster';
export * from './components/toggle';
export { useToast } from './components/use-toast';
export type { ToastActionElement, ToastProps } from './components/toast';
export * from './components/toggle-group';
export * from './components/tooltip';

// Agent Components (action buttons, filters, cards)
// Export components but avoid type conflicts
export * from './components/agents';
export type {
  AgentStatus,
  AgentLevelNumber,
  AgentCardData,
} from './components/agents';

// Missions & HITL Components
export * from './components/missions';
export * from './components/hitl';

// AI Components
export * from './components/ai/inline-citation';

// Marketing Components (landing pages)
export * from './components/marketing';

// Types (canonical) - export explicitly to avoid conflicts
export type * from './types';

// Utilities
export * from './lib/utils';
