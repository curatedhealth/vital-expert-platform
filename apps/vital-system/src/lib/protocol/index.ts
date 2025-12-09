/**
 * Protocol Package Integration
 * 
 * Re-exports from @vital-path/protocol for frontend validation.
 * Provides type-safe workflow validation using Zod schemas.
 */

// Re-export schemas from protocol package
export {
  // Workflow schemas
  WorkflowSchema,
  WorkflowCreateSchema,
  WorkflowNodeSchema,
  WorkflowEdgeSchema,
  
  // Expert schemas
  ExpertRequestSchema,
  ExpertSyncResponseSchema,
  ExpertAsyncResponseSchema,
  
  // Job schemas
  JobSchema,
  JobStatusResponseSchema,
  JobResultResponseSchema,
  
  // Common schemas
  MessageSchema,
  ConversationSchema,
} from '@vital-path/protocol';

// Re-export types
export type {
  Workflow,
  WorkflowCreate,
  WorkflowNode,
  WorkflowEdge,
  ExpertRequest,
  ExpertSyncResponse,
  ExpertAsyncResponse,
  Job,
  JobStatusResponse,
  JobResultResponse,
  Message,
  Conversation,
} from '@vital-path/protocol';

// Re-export constants
export {
  NODE_TYPES,
  EXPERT_MODES,
  JOB_STATUSES,
  SSE_EVENT_TYPES,
} from '@vital-path/protocol';


