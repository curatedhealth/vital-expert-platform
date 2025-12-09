// Agents Components Module
export { AgentDetailsModal } from './agent-details-modal';
export { AgentCard } from './AgentCard';
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

// Agent Detail Modal V2 (with all tabs)
export { AgentDetailModal } from './agent-detail-modal-v2';