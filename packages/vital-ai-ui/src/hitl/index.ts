/**
 * Domain I: HITL (Human-in-the-Loop) Components
 * 
 * Components for human oversight and approval workflows.
 * Shared across: Ask Expert, Ask Panel, Workflow Automation
 * 
 * Components (7):
 * - VitalHITLControls: Main HITL control panel
 * - VitalHITLCheckpointModal: Modal for HITL checkpoints
 * - VitalSubAgentApprovalCard: Approval card for sub-agent tasks
 * - VitalPlanApprovalModal: Modal to approve execution plans
 * - VitalUserPromptModal: Modal for user input prompts
 * - VitalFinalReviewPanel: Final review before submission
 * - VitalToolApproval: AI SDK Tool Approval Workflow (Confirmation)
 */

export { default as VitalHITLControls } from './VitalHITLControls';
export { default as VitalHITLCheckpointModal } from './VitalHITLCheckpointModal';
export { default as VitalSubAgentApprovalCard } from './VitalSubAgentApprovalCard';
export { default as VitalPlanApprovalModal } from './VitalPlanApprovalModal';
export { default as VitalUserPromptModal } from './VitalUserPromptModal';
export { default as VitalFinalReviewPanel } from './VitalFinalReviewPanel';

// AI SDK Tool Approval Workflow (Confirmation component)
// Note: Confirmation* aliases are exported from workflow/VitalConfirmation to avoid conflicts
export {
  VitalToolApproval,
  VitalToolApprovalTitle,
  VitalToolApprovalRequest,
  VitalToolApprovalAccepted,
  VitalToolApprovalRejected,
  VitalToolApprovalActions,
  VitalToolApprovalAction,
  // Hook
  useToolApproval,
} from './VitalToolApproval';

// Re-export types
export type {
  ToolUIPartApproval,
  ToolUIPartState,
  VitalToolApprovalProps,
  VitalToolApprovalTitleProps,
  VitalToolApprovalRequestProps,
  VitalToolApprovalAcceptedProps,
  VitalToolApprovalRejectedProps,
  VitalToolApprovalActionsProps,
  VitalToolApprovalActionProps,
} from './VitalToolApproval';
