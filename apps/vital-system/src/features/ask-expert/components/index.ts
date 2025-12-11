/**
 * Ask Expert - Service-Specific Components
 * 
 * These components are ONLY for the Ask Expert service and implement
 * the 4-Mode Execution Matrix specific UI.
 * 
 * For SHARED components, import from '@vital/ai-ui':
 *   import { 
 *     VitalMessage, VitalThinking, VitalFusionExplanation,  // Core AI UI
 *     VitalHITLControls, VitalPlanApprovalModal,            // HITL
 *     VitalAdvancedChatInput, VitalEnhancedMessageDisplay,  // Chat
 *     VitalExpertAgentCard, VitalToolExecutionCard,         // Agents
 *     VitalStatusIndicators, VitalProgressTracker,          // Workflow
 *     VitalIntelligentSidebar                               // Layout
 *   } from '@vital/ai-ui';
 * 
 * For Ask Expert SPECIFIC components (4-Mode selection), import from here:
 *   import { ModeSelector, WorkflowSelector } from '@/features/ask-expert/components';
 */

// ============================================================================
// Layout Components - ADAPTIVE WORKSPACE SHELL
// ============================================================================

export {
  VitalWorkspace,
  type VitalWorkspaceProps,
  type WorkspaceMode,
  type SidebarPosition,
} from './VitalWorkspace';

// ============================================================================
// Mode Selection (5 components) - ASK EXPERT SPECIFIC
// ============================================================================
// These implement the 4-Mode Execution Matrix UI specific to Ask Expert

export { default as ModeSelector } from './ModeSelector';
export { default as EnhancedModeSelector } from './EnhancedModeSelector';
export { default as SimplifiedModeSelector } from './SimplifiedModeSelector';
export { default as ModeSelectionModal } from './ModeSelectionModal';
export { default as WorkflowSelector } from './WorkflowSelector';

// ============================================================================
// Artifacts (2 components) - ASK EXPERT SPECIFIC
// ============================================================================
// Inline artifact generation specific to Ask Expert workflow

export { default as InlineArtifactGenerator } from './InlineArtifactGenerator';
export { default as InlineDocumentGenerator } from './InlineDocumentGenerator';

// HITL / Autonomous (legacy components kept for Mode 3/4 UI until fully migrated to @vital/ai-ui)
export { PlanApprovalModal } from '../_archived_moved_to_shared/PlanApprovalModal';
export { UserPromptModal } from '../_archived_moved_to_shared/UserPromptModal';
export { ProgressTracker } from '../_archived_moved_to_shared/ProgressTracker';
export { ToolExecutionCard } from '../_archived_moved_to_shared/ToolExecutionCard';
export { SubAgentApprovalCard } from '../_archived_moved_to_shared/SubAgentApprovalCard';
export { FinalReviewPanel } from '../_archived_moved_to_shared/FinalReviewPanel';

// ============================================================================
// TOTAL: 7 Ask Expert Specific Components
// ============================================================================
// 
// All other components have been moved to shared @vital/ai-ui:
// - HITL (6): VitalHITLControls, VitalHITLCheckpointModal, etc.
// - Chat (4): VitalAdvancedChatInput, VitalEnhancedMessageDisplay, etc.
// - Agents (2): VitalExpertAgentCard, VitalToolExecutionCard
// - Workflow (2): VitalStatusIndicators, VitalProgressTracker
// - Layout (1): VitalIntelligentSidebar
