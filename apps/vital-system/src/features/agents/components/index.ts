// Agents Components Module
// Note: Agent detail view is now at /agents/[slug]/page.tsx (full-page route)

// ============================================================================
// AGENT CARD COMPONENTS
// ============================================================================
//
// LOCAL (Agent Views - Primary):
// - agent-card.tsx → PRIMARY card for agent library/grid views
//   Features: Size variants (compact/comfortable/detailed), level badges, metadata
//
// @vital/ui (Shared Library - For other contexts):
// - AgentCardMinimal: Inline compact display
// - AgentCardCompact: Simple grid cards
// - AgentCardDetailed: Full details
// - EnhancedAgentCard: Premium design with animations
//
// DEPRECATED:
// - AgentCard.tsx → Old admin card, use agent-card.tsx or EnhancedAgentCard
// - agent-card-enhanced.tsx → Use EnhancedAgentCard from @vital/ui

// Primary agent card for agent views (uses cva variants)
export { AgentCard, AgentCardSkeleton, agentCardVariants, type AgentCardProps } from './agent-card';

// Re-exports from @vital/ui for other contexts
export {
  EnhancedAgentCard,
  AgentCardGrid,
  AgentCardMinimal,
  AgentCardCompact,
  AgentCardDetailed,
  AgentCardSelectable,
  type AgentCardData,
  type AgentCardMinimalProps,
  type AgentCardCompactProps,
  type AgentCardDetailedProps,
  type AgentCardSelectableProps,
} from '@vital/ui';

// Legacy admin card REMOVED: was ./AgentCard, now use AgentCard from agent-card.tsx
// or EnhancedAgentCard/VitalAgentCard from @vital/ui/@vital/ai-ui

// ============================================================================
// OTHER AGENT COMPONENTS
// ============================================================================
// export { AgentImport } from './AgentImport'; // Temporarily disabled
export { AgentsBoard } from './agents-board';
export { KnowledgeGraphVisualization } from './knowledge-graph-view';

// Agent Edit Forms
export { AgentEditForm } from './agent-edit-form';
export { AgentEditFormEnhanced } from './agent-edit-form-enhanced';

// Hierarchy & Spawning Components
export { SubagentSelector } from './subagent-selector';

// Agent Comparison Components
export { AgentComparison } from './agent-comparison';
export {
  AgentComparisonSidebar,
  AgentComparisonProvider,
  FloatingCompareButton,
  CompareButton,
  useAgentComparison,
} from './agent-comparison-sidebar';

// Enhanced Capability System Components
export { default as EnhancedCapabilityManagement } from './enhanced-capability-management';
export { default as VirtualAdvisoryBoards } from './virtual-advisory-boards';

// Level Badge
export { LevelBadge, LevelIndicator } from './level-badge';

// NEW: Agent OS 5-Level Components (December 2025)
// Personality Type configuration tab
export { PersonalityTypeTab } from './personality-type-tab';

// Context assignment tab
export { ContextAssignmentTab } from './context-assignment-tab';

// Agent instantiation modal (pre-chat context injection)
export { AgentInstantiationModal } from './agent-instantiation-modal';

// Agent detail view: See /agents/[slug]/page.tsx for full-page detail route