/**
 * VITAL AI UI - Workflow & Safety Components (Domain C)
 * 
 * Components for workflow control, HITL checkpoints, cost tracking,
 * and safety mechanisms. 6 components total.
 */

export { VitalCheckpointModal, default as CheckpointModal } from './VitalCheckpointModal';
export { VitalCostTracker, default as CostTracker } from './VitalCostTracker';
export { VitalProgressTimeline, default as ProgressTimeline } from './VitalProgressTimeline';
export { VitalCircuitBreaker, default as CircuitBreaker } from './VitalCircuitBreaker';
export { VitalApprovalCard } from './VitalApprovalCard';
export { VitalTimeoutWarning, VitalTimeoutBadge } from './VitalTimeoutWarning';
export { VitalWorkflowProgress, type WorkflowStep } from './VitalWorkflowProgress';
export { VitalHITLCheckpoint } from './VitalHITLCheckpoint';

// Re-export types
export type {
  ApprovalStatus,
  ApprovalType,
  RiskLevel,
  ApprovalAction,
  ApprovalContext,
  VitalApprovalCardProps,
} from './VitalApprovalCard';

export type {
  TimeoutSeverity,
  TimeoutAction,
  TimeoutContext,
  VitalTimeoutWarningProps,
} from './VitalTimeoutWarning';
