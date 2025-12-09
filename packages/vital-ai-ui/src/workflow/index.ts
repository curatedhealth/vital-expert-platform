/**
 * VITAL AI UI - Workflow & Safety Components (Domain C)
 * 
 * Components for workflow control, HITL checkpoints, cost tracking,
 * and safety mechanisms. 
 * Shared across: Ask Expert, Ask Panel, Workflow Automation
 * 
 * Components (15):
 * - VitalCheckpoint: Conversation state checkpoint (restore points)
 * - VitalCheckpointModal: HITL checkpoint modal
 * - VitalCostTracker: Token/cost tracking
 * - VitalProgressTimeline: Workflow progress display
 * - VitalCircuitBreaker: Safety circuit breaker
 * - VitalApprovalCard: Approval action card
 * - VitalTimeoutWarning: Timeout warning display
 * - VitalStatusIndicators: Mode/agent status indicators
 * - VitalProgressTracker: Detailed progress tracking
 * - VitalPlan: Mission roadmap/task tree (complex, with progress)
 * - VitalPlanCard: Collapsible plan card (compound, 8 sub-components)
 * - VitalConfirmation: Boolean/choice confirmation
 * - VitalPreFlightCheck: Pre-flight validation modal
 * - VitalTask: Collapsible task display
 * - VitalQueue: Task queue display
 */

// Conversation checkpoint / HITL Safety Gates
export {
  VitalCheckpoint,
  VitalCheckpointIcon,
  VitalCheckpointContent,
  VitalCheckpointTitle,
  VitalCheckpointDescription,
  VitalCheckpointBudget,
  VitalCheckpointTimer,
  VitalCheckpointActions,
  VitalCheckpointAction,
  VitalCheckpointTrigger,
  // Aliases
  Checkpoint,
  CheckpointIcon,
  CheckpointContent,
  CheckpointTitle,
  CheckpointDescription,
  CheckpointBudget,
  CheckpointTimer,
  CheckpointActions,
  CheckpointAction,
  CheckpointTrigger,
  // Utilities
  riskColors as checkpointRiskColors,
  riskIcons as checkpointRiskIcons,
  modeLabels as checkpointModeLabels,
} from './VitalCheckpoint';

export { VitalCheckpointModal, default as CheckpointModal } from './VitalCheckpointModal';
export { VitalCostTracker, default as CostTracker } from './VitalCostTracker';
export { VitalProgressTimeline, default as ProgressTimeline } from './VitalProgressTimeline';
export { VitalCircuitBreaker, default as CircuitBreaker } from './VitalCircuitBreaker';
export { VitalApprovalCard } from './VitalApprovalCard';
export { VitalTimeoutWarning, VitalTimeoutBadge } from './VitalTimeoutWarning';
export { default as VitalStatusIndicators } from './VitalStatusIndicators';
export { default as VitalProgressTracker } from './VitalProgressTracker';

// Plan and confirmation
export { VitalPlan, default as MissionPlan } from './VitalPlan';

// Confirmation - AI SDK tool approval workflow + VITAL extensions
export {
  VitalConfirmation,
  VitalConfirmationTitle,
  VitalConfirmationRequest,
  VitalConfirmationAccepted,
  VitalConfirmationRejected,
  VitalConfirmationActions,
  VitalConfirmationAction,
  VitalConfirmationInfo,
  // ai-elements aliases
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
  ConfirmationInfo,
  // Hook
  useConfirmation,
} from './VitalConfirmation';

export { VitalPreFlightCheck, default as PreFlightCheck } from './VitalPreFlightCheck';

// Plan Card (compound component - 9 sub-components with VITAL extensions)
export {
  VitalPlanCard,
  VitalPlanCardHeader,
  VitalPlanCardTitle,
  VitalPlanCardDescription,
  VitalPlanCardTrigger,
  VitalPlanCardContent,
  VitalPlanCardStep,
  VitalPlanCardFooter,
  VitalPlanCardAction,
  // Aliases (for ai-elements compatibility)
  Plan,
  PlanHeader,
  PlanTitle,
  PlanDescription,
  PlanTrigger,
  PlanContent,
  PlanStep,
  PlanFooter,
  PlanAction,
} from './VitalPlanCard';

// Task components (L4 Worker context)
export {
  VitalTask,
  VitalTaskTrigger,
  VitalTaskContent,
  VitalTaskItem,
  VitalTaskItemFile,
  VitalTaskResult,
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskResult,
  // Utilities
  workerCategoryColors,
} from './VitalTask';

// Tool components (L5 Tool context, AI SDK ToolUIPart compatible)
export {
  VitalTool,
  VitalToolHeader,
  VitalToolContent,
  VitalToolInput,
  VitalToolOutput,
  VitalToolRetry,
  // Aliases
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
  ToolRetry,
} from './VitalTool';

// Queue components
export {
  VitalQueue,
  VitalQueueList,
  VitalQueueItem,
  VitalQueueItemIndicator,
  VitalQueueItemContent,
  VitalQueueItemDescription,
  VitalQueueItemActions,
  VitalQueueItemAction,
  VitalQueueItemAttachment,
  VitalQueueItemImage,
  VitalQueueItemFile,
  VitalQueueSection,
  VitalQueueSectionTrigger,
  VitalQueueSectionLabel,
  VitalQueueSectionContent,
  Queue,
  QueueList,
  QueueItem,
  QueueItemIndicator,
  QueueItemContent,
  QueueItemDescription,
  QueueItemActions,
  QueueItemAction,
  QueueItemAttachment,
  QueueItemImage,
  QueueItemFile,
  QueueSection,
  QueueSectionTrigger,
  QueueSectionLabel,
  QueueSectionContent,
} from './VitalQueue';

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

export type {
  TaskStatus,
  PlanTask,
  VitalPlanProps,
} from './VitalPlan';

export type {
  // VITAL-specific types
  AgentLevel,
  RiskLevel,
  VitalMode,
  ConfirmationAgent,
  ConfirmationCost,
  // AI SDK compatible types
  ConfirmationApproval,
  ConfirmationState,
  // Component props
  VitalConfirmationProps,
  VitalConfirmationTitleProps,
  VitalConfirmationRequestProps,
  VitalConfirmationAcceptedProps,
  VitalConfirmationRejectedProps,
  VitalConfirmationActionsProps,
  VitalConfirmationActionProps,
} from './VitalConfirmation';

export type {
  CheckStatus,
  PreFlightCheckItem,
  VitalPreFlightCheckProps,
} from './VitalPreFlightCheck';

export type {
  // VITAL-specific types
  AgentLevel as CheckpointAgentLevel,
  RiskLevel as CheckpointRiskLevel,
  VitalMode as CheckpointVitalMode,
  CheckpointType,
  CheckpointAgent,
  CheckpointBudget,
  // Component props
  VitalCheckpointProps,
  VitalCheckpointIconProps,
  VitalCheckpointContentProps,
  VitalCheckpointTitleProps,
  VitalCheckpointDescriptionProps,
  VitalCheckpointActionsProps,
  VitalCheckpointActionProps,
  VitalCheckpointTriggerProps,
} from './VitalCheckpoint';

export type {
  // L4 Worker types
  AgentLevel as TaskAgentLevel,
  WorkerCategory,
  TaskStatus as TaskItemStatus,
  AgentRef as TaskAgentRef,
  TaskWorker,
  TaskAgent,
  // Component props
  VitalTaskProps,
  VitalTaskTriggerProps,
  VitalTaskContentProps,
  VitalTaskItemProps,
  VitalTaskItemFileProps,
} from './VitalTask';

export type {
  // VITAL Queue types
  AgentLevel as QueueAgentLevel,
  WorkerCategory as QueueWorkerCategory,
  TaskPriority,
  QueueItemStatus,
  AgentRef as QueueAgentRef,
  WorkerRef,
  QueueCost,
  // Legacy types
  QueueMessagePart,
  QueueMessage,
  QueueTodo,
  // Component props
  VitalQueueProps,
  VitalQueueListProps,
  VitalQueueItemProps,
  VitalQueueItemIndicatorProps,
  VitalQueueItemContentProps,
  VitalQueueItemDescriptionProps,
  VitalQueueItemActionsProps,
  VitalQueueItemActionProps,
  VitalQueueItemAttachmentProps,
  VitalQueueItemImageProps,
  VitalQueueItemFileProps,
  VitalQueueSectionProps,
  VitalQueueSectionTriggerProps,
  VitalQueueSectionLabelProps,
  VitalQueueSectionContentProps,
} from './VitalQueue';

// Queue utilities
export { 
  priorityColors as queuePriorityColors, 
  statusIcons as queueStatusIcons,
  workerCategoryColors as queueWorkerCategoryColors,
} from './VitalQueue';

export type {
  // VITAL-specific types
  AgentLevel as PlanAgentLevel,
  RiskLevel as PlanRiskLevel,
  VitalMode as PlanVitalMode,
  StepStatus as PlanStepStatus,
  PlanAgent,
  PlanCost,
  PlanProgress,
  // Component props
  VitalPlanCardProps,
  VitalPlanCardHeaderProps,
  VitalPlanCardTitleProps,
  VitalPlanCardDescriptionProps,
  VitalPlanCardTriggerProps,
  VitalPlanCardContentProps,
  VitalPlanCardStepProps,
  VitalPlanCardFooterProps,
  VitalPlanCardActionProps,
} from './VitalPlanCard';

export type {
  // L5 Tool types
  ToolCategory,
  ToolState,
  L5Tool,
  ToolApproval,
  // Component props
  VitalToolProps,
  VitalToolHeaderProps,
  VitalToolContentProps,
  VitalToolInputProps,
  VitalToolOutputProps,
} from './VitalTool';

// Loader component (SVG spinner)
export {
  VitalLoader,
  VitalLoaderWithText,
  VitalLoaderOverlay,
  Loader,
  LoaderWithText,
  LoaderOverlay,
} from './VitalLoader';

export type {
  VitalLoaderIconProps,
  VitalLoaderProps,
  VitalLoaderWithTextProps,
  VitalLoaderOverlayProps,
} from './VitalLoader';
