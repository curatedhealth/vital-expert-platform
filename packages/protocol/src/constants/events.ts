/**
 * VITAL Protocol - SSE Event Type Constants
 * 
 * Server-Sent Event types for real-time streaming.
 * Used by both frontend (consuming) and backend (producing).
 */

export const SSE_EVENT_TYPES = {
  // Connection Events
  CONNECTED: 'connected',
  HEARTBEAT: 'heartbeat',
  DISCONNECTED: 'disconnected',
  
  // Workflow Events
  WORKFLOW_STARTED: 'workflow_started',
  WORKFLOW_COMPLETED: 'workflow_completed',
  WORKFLOW_FAILED: 'workflow_failed',
  
  // Node Events
  NODE_STARTED: 'node_started',
  NODE_COMPLETED: 'node_completed',
  NODE_FAILED: 'node_failed',
  
  // Streaming Content Events
  TOKEN: 'token',
  CHUNK: 'chunk',
  THOUGHT: 'thought',
  
  // Artifact Events
  ARTIFACT_STARTED: 'artifact_started',
  ARTIFACT_CHUNK: 'artifact_chunk',
  ARTIFACT_COMPLETED: 'artifact_completed',
  
  // Citation Events
  CITATION_FOUND: 'citation_found',
  
  // Tool Events
  TOOL_CALL_STARTED: 'tool_call_started',
  TOOL_CALL_COMPLETED: 'tool_call_completed',
  TOOL_CALL_FAILED: 'tool_call_failed',
  
  // Human-in-the-Loop Events
  HUMAN_INPUT_REQUIRED: 'human_input_required',
  HUMAN_INPUT_RECEIVED: 'human_input_received',
  APPROVAL_REQUIRED: 'approval_required',
  APPROVAL_RECEIVED: 'approval_received',
  
  // Budget Events
  BUDGET_WARNING: 'budget_warning',
  BUDGET_EXCEEDED: 'budget_exceeded',
  
  // Error Events
  ERROR: 'error',
  RATE_LIMITED: 'rate_limited',
} as const;

export type SSEEventType = typeof SSE_EVENT_TYPES[keyof typeof SSE_EVENT_TYPES];

export const SSE_EVENT_TYPE_VALUES = Object.values(SSE_EVENT_TYPES);

/**
 * Job status constants
 */
export const JOB_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  TIMEOUT: 'timeout',
} as const;

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];

export const JOB_STATUS_VALUES = Object.values(JOB_STATUS);

/**
 * Terminal job statuses (no more updates expected)
 */
export const TERMINAL_JOB_STATUSES: JobStatus[] = [
  JOB_STATUS.COMPLETED,
  JOB_STATUS.FAILED,
  JOB_STATUS.CANCELLED,
  JOB_STATUS.TIMEOUT,
];

/**
 * Check if a job status is terminal
 */
export function isTerminalJobStatus(status: JobStatus): boolean {
  return TERMINAL_JOB_STATUSES.includes(status);
}
