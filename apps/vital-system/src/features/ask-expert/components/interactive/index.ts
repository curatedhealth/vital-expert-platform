/**
 * VITAL Platform - Interactive Components Index
 *
 * Exports all components for the Interactive View (Modes 1 & 2).
 * These components handle expert selection, chat conversation,
 * streaming messages, citations, and reasoning visualization.
 *
 * Phase 2 Implementation - December 11, 2025
 */

// Expert Selection
export { ExpertPicker } from './ExpertPicker';
export type { Expert, ExpertPickerProps } from './ExpertPicker';

export { FusionSelector } from './FusionSelector';
export type { FusionSelectorProps, FusionMode, FusionResult } from './FusionSelector';

export { AgentSelectionCard, VitalLevelBadge } from './AgentSelectionCard';
export type { AgentSelectionCardProps, VitalLevelBadgeProps } from './AgentSelectionCard';

// Chat Messages
export { VitalMessage } from './VitalMessage';
export type { VitalMessageProps, Message } from './VitalMessage';

export { StreamingMessage } from './StreamingMessage';
export type { StreamingMessageProps } from './StreamingMessage';

// Supporting Components
export { CitationList } from './CitationList';
export type { Citation, CitationListProps } from './CitationList';

export { VitalThinking, VitalThinkingCompact } from './VitalThinking';
export type { VitalThinkingProps, VitalThinkingCompactProps, ThinkingStep } from './VitalThinking';

export { ToolCallList } from './ToolCallList';
export type { ToolCall, ToolCallListProps } from './ToolCallList';

export { VitalSuggestionChips, generateDefaultSuggestions } from './VitalSuggestionChips';
export type { Suggestion, VitalSuggestionChipsProps } from './VitalSuggestionChips';

// Shared Components
export { ExpertHeader } from './ExpertHeader';
export type { ExpertHeaderProps } from './ExpertHeader';

export { ChatInput } from './ChatInput';
export type { ChatInputProps, Attachment } from './ChatInput';

// HITL Components (Human-in-the-Loop)
export { HITLCheckpointModal } from './HITLCheckpointModal';
export type {
  HITLCheckpointModalProps,
  CheckpointType,
  CheckpointDecision,
  CheckpointOption,
  CheckpointData,
} from './HITLCheckpointModal';

export { PlanApprovalCard } from './PlanApprovalCard';
export type {
  PlanApprovalCardProps,
  ExecutionPlan,
  PlanStep,
  PlanStepType,
  PlanStatus,
} from './PlanApprovalCard';

export { SubAgentDelegationCard } from './SubAgentDelegationCard';
export type {
  SubAgentDelegationCardProps,
  SubAgentDelegation,
  SubAgentInfo,
  DelegationContext,
  DelegationStatus,
  AgentTier,
} from './SubAgentDelegationCard';

export { ToolExecutionFeedback } from './ToolExecutionFeedback';
export type {
  ToolExecutionFeedbackProps,
  ToolExecution,
  ToolCategory,
  ToolExecutionStatus,
} from './ToolExecutionFeedback';

// Conversation History
export { ConversationHistorySidebar } from './ConversationHistorySidebar';
export type {
  ConversationHistorySidebarProps,
  ConversationPreview,
} from './ConversationHistorySidebar';
