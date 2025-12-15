/**
 * VITAL Protocol - Job Schemas
 * 
 * Schemas for async job tracking (Mode 3-4, Panel executions, etc.)
 */

import { z } from 'zod';

import { JOB_STATUS_VALUES } from '../constants/events';

import {
  UUIDSchema,
  TenantIdSchema,
  UserIdSchema,
  DateTimeSchema,
  MetadataSchema,
} from './common.schema';

// ============================================================================
// JOB SCHEMAS
// ============================================================================

/**
 * Job type enumeration
 */
export const JOB_TYPES = {
  EXPERT_MODE_3: 'expert_mode_3',
  EXPERT_MODE_4: 'expert_mode_4',
  PANEL_EXECUTION: 'panel_execution',
  WORKFLOW_EXECUTION: 'workflow_execution',
  DOCUMENT_INGESTION: 'document_ingestion',
  ONTOLOGY_DISCOVERY: 'ontology_discovery',
} as const;

export type JobType = typeof JOB_TYPES[keyof typeof JOB_TYPES];

/**
 * Job progress update
 */
export const JobProgressSchema = z.object({
  /** Current step number */
  currentStep: z.number().int().min(0),
  
  /** Total steps (if known) */
  totalSteps: z.number().int().min(0).optional(),
  
  /** Percentage complete (0-100) */
  percentComplete: z.number().min(0).max(100).optional(),
  
  /** Current step description */
  currentStepDescription: z.string().optional(),
  
  /** Tokens used so far */
  tokensUsed: z.number().int().min(0).default(0),
  
  /** Estimated tokens remaining */
  tokensRemaining: z.number().int().min(0).optional(),
});

/**
 * Job error details
 */
export const JobErrorSchema = z.object({
  /** Error code */
  code: z.string(),
  
  /** Human-readable message */
  message: z.string(),
  
  /** Stack trace (only in development) */
  stackTrace: z.string().optional(),
  
  /** Whether the error is retryable */
  isRetryable: z.boolean().default(false),
  
  /** Retry count so far */
  retryCount: z.number().int().min(0).default(0),
  
  /** Additional error details */
  details: MetadataSchema.optional(),
});

/**
 * Complete Job schema
 */
export const JobSchema = z.object({
  /** Job ID */
  id: UUIDSchema,
  
  /** Job type */
  type: z.enum(Object.values(JOB_TYPES) as [string, ...string[]]),
  
  /** Current status */
  status: z.enum(JOB_STATUS_VALUES as [string, ...string[]]),
  
  /** Progress information */
  progress: JobProgressSchema.optional(),
  
  /** Error information (if failed) */
  error: JobErrorSchema.optional(),
  
  /** Job result (if completed) */
  result: z.unknown().optional(),
  
  /** Input data that started the job */
  input: z.record(z.unknown()),
  
  /** Reference to related entity (conversation, workflow, etc.) */
  referenceId: UUIDSchema.optional(),
  
  /** Reference type */
  referenceType: z.string().optional(),
  
  // ====== TIMING ======
  /** When job was queued */
  queuedAt: DateTimeSchema,
  
  /** When job started running */
  startedAt: DateTimeSchema.optional(),
  
  /** When job completed (success or failure) */
  completedAt: DateTimeSchema.optional(),
  
  /** Estimated completion time */
  estimatedCompletionAt: DateTimeSchema.optional(),
  
  // ====== MULTI-TENANCY ======
  tenantId: TenantIdSchema,
  userId: UserIdSchema,
  
  /** Custom metadata */
  metadata: MetadataSchema.optional(),
});

/**
 * Job status response (for polling)
 */
export const JobStatusResponseSchema = z.object({
  /** Job ID */
  jobId: UUIDSchema,
  
  /** Current status */
  status: z.enum(JOB_STATUS_VALUES as [string, ...string[]]),
  
  /** Progress information */
  progress: JobProgressSchema.optional(),
  
  /** Error information (if failed) */
  error: JobErrorSchema.optional(),
  
  /** Whether the job is complete (terminal status) */
  isComplete: z.boolean(),
  
  /** Result URL (if completed successfully) */
  resultUrl: z.string().optional(),
  
  /** Time elapsed in milliseconds */
  elapsedMs: z.number().int().optional(),
  
  /** Estimated time remaining in milliseconds */
  estimatedRemainingMs: z.number().int().optional(),
});

/**
 * Job result response
 */
export const JobResultResponseSchema = z.object({
  /** Job ID */
  jobId: UUIDSchema,
  
  /** Job status (should be 'completed') */
  status: z.literal('completed'),
  
  /** The result data */
  result: z.unknown(),
  
  /** Token usage summary */
  tokenUsage: z.object({
    totalTokens: z.number().int(),
    estimatedCostUsd: z.number(),
  }),
  
  /** Total processing time in milliseconds */
  processingTimeMs: z.number().int(),
  
  /** Completion timestamp */
  completedAt: DateTimeSchema,
});

/**
 * Job cancellation request
 */
export const CancelJobRequestSchema = z.object({
  /** Job ID to cancel */
  jobId: UUIDSchema,
  
  /** Reason for cancellation */
  reason: z.string().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type JobProgress = z.infer<typeof JobProgressSchema>;
export type JobError = z.infer<typeof JobErrorSchema>;
export type Job = z.infer<typeof JobSchema>;
export type JobStatusResponse = z.infer<typeof JobStatusResponseSchema>;
export type JobResultResponse = z.infer<typeof JobResultResponseSchema>;
export type CancelJobRequest = z.infer<typeof CancelJobRequestSchema>;
