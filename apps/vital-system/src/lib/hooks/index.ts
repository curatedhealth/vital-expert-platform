/**
 * Shared Hooks
 * 
 * Common React hooks for API integration, validation, and streaming.
 */

export { useAPI } from './useAPI';
export type { APIState, APIOptions, UseAPIReturn } from './useAPI';

export { useMutation } from './useMutation';
export type { MutationState, MutationOptions, UseMutationReturn } from './useMutation';

export { useProtocolValidation } from './useProtocolValidation';
export type {
  ValidationType,
  UseProtocolValidationOptions,
  UseProtocolValidationReturn,
} from './useProtocolValidation';

// Re-export streaming hooks for convenience
export {
  useStreamingChat,
  useJobStatus,
  useWorkflowExecution,
} from '../../features/streaming/hooks';

export type {
  // Streaming Chat
  StreamEventType,
  StreamEvent,
  ChatMessage,
  UseStreamingChatOptions,
  UseStreamingChatReturn,
  // Job Status
  JobStatus,
  JobProgress,
  JobResult,
  UseJobStatusOptions,
  UseJobStatusReturn,
  // Workflow Execution
  ExecutionEventType,
  ExecutionEvent,
  NodeExecution,
  ExecutionProgress,
  ExecutionResult,
  UseWorkflowExecutionOptions,
  UseWorkflowExecutionReturn,
} from '../../features/streaming/hooks';










