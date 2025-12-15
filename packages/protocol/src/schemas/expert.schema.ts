/**
 * VITAL Protocol - Expert Schemas
 * 
 * Request/Response schemas for the Ask Expert API.
 */

import { z } from 'zod';

import { EXPERT_MODE_VALUES } from '../constants/modes';

import {
  UUIDSchema,
  TenantIdSchema,
  UserIdSchema,
  DateTimeSchema,
  MetadataSchema,
} from './common.schema';

// ============================================================================
// MESSAGE SCHEMAS
// ============================================================================

/**
 * Chat message role
 */
export const MessageRoleSchema = z.enum(['user', 'assistant', 'system', 'tool']);

/**
 * Citation/Evidence reference
 */
export const CitationSchema = z.object({
  /** Unique citation ID */
  id: z.string(),
  
  /** Citation type */
  type: z.enum(['document', 'web', 'database', 'expert']),
  
  /** Source title */
  title: z.string(),
  
  /** Source URL if available */
  url: z.string().url().optional(),
  
  /** Relevant snippet */
  snippet: z.string(),
  
  /** Relevance score */
  relevanceScore: z.number().min(0).max(1).optional(),
  
  /** Source metadata */
  metadata: MetadataSchema.optional(),
});

/**
 * Tool call information
 */
export const ToolCallSchema = z.object({
  /** Tool call ID */
  id: z.string(),
  
  /** Tool name */
  name: z.string(),
  
  /** Tool arguments */
  arguments: z.record(z.unknown()),
  
  /** Tool result (if completed) */
  result: z.unknown().optional(),
  
  /** Error message (if failed) */
  error: z.string().optional(),
  
  /** Status */
  status: z.enum(['pending', 'running', 'completed', 'failed']),
});

/**
 * Single chat message
 */
export const MessageSchema = z.object({
  /** Message ID */
  id: UUIDSchema,
  
  /** Role */
  role: MessageRoleSchema,
  
  /** Message content */
  content: z.string(),
  
  /** Citations referenced in this message */
  citations: z.array(CitationSchema).optional(),
  
  /** Tool calls made in this message */
  toolCalls: z.array(ToolCallSchema).optional(),
  
  /** Thinking/reasoning steps (for transparency) */
  thinking: z.array(z.object({
    step: z.number().int(),
    thought: z.string(),
    action: z.string().optional(),
  })).optional(),
  
  /** Token usage for this message */
  tokenUsage: z.object({
    promptTokens: z.number().int(),
    completionTokens: z.number().int(),
    totalTokens: z.number().int(),
  }).optional(),
  
  /** Timestamp */
  createdAt: DateTimeSchema,
  
  /** Custom metadata */
  metadata: MetadataSchema.optional(),
});

// ============================================================================
// EXPERT REQUEST SCHEMAS
// ============================================================================

/**
 * Expert chat request
 */
export const ExpertRequestSchema = z.object({
  /** Conversation ID (for continuing a conversation) */
  conversationId: UUIDSchema.optional(),
  
  /** Agent ID to use */
  agentId: UUIDSchema,
  
  /** Expert mode (determines sync vs async) */
  mode: z.enum(EXPERT_MODE_VALUES as [string, ...string[]]),
  
  /** User message */
  message: z.string().min(1).max(100000),
  
  /** Previous messages for context */
  history: z.array(MessageSchema).optional(),
  
  /** Knowledge domains to query */
  knowledgeDomainIds: z.array(UUIDSchema).optional(),
  
  /** Custom system prompt override */
  systemPromptOverride: z.string().optional(),
  
  /** Temperature override */
  temperature: z.number().min(0).max(2).optional(),
  
  /** Max tokens override */
  maxTokens: z.number().int().min(1).max(128000).optional(),
  
  /** Whether to include citations */
  includeCitations: z.boolean().default(true),
  
  /** Whether to stream response */
  stream: z.boolean().default(true),
  
  /** Custom metadata */
  metadata: MetadataSchema.optional(),
  
  // Multi-tenancy (injected by middleware, not sent by client)
  tenantId: TenantIdSchema.optional(),
  userId: UserIdSchema.optional(),
});

// ============================================================================
// EXPERT RESPONSE SCHEMAS
// ============================================================================

/**
 * Sync expert response (Mode 1-2)
 */
export const ExpertSyncResponseSchema = z.object({
  /** Conversation ID */
  conversationId: UUIDSchema,
  
  /** Response message */
  message: MessageSchema,
  
  /** Total token usage for this request */
  totalTokenUsage: z.object({
    promptTokens: z.number().int(),
    completionTokens: z.number().int(),
    totalTokens: z.number().int(),
    estimatedCostUsd: z.number(),
  }),
  
  /** Processing time in milliseconds */
  processingTimeMs: z.number().int(),
  
  /** Model used */
  model: z.string(),
});

/**
 * Async job response (Mode 3-4)
 */
export const ExpertAsyncResponseSchema = z.object({
  /** Job ID for tracking */
  jobId: UUIDSchema,
  
  /** Conversation ID */
  conversationId: UUIDSchema,
  
  /** Current status */
  status: z.enum(['queued', 'running']),
  
  /** Estimated completion time in seconds */
  estimatedTimeSeconds: z.number().int().optional(),
  
  /** URL to poll for status */
  pollUrl: z.string(),
  
  /** URL for SSE streaming updates */
  streamUrl: z.string().optional(),
});

/**
 * Union of expert responses
 */
export const ExpertResponseSchema = z.union([
  ExpertSyncResponseSchema,
  ExpertAsyncResponseSchema,
]);

// ============================================================================
// CONVERSATION SCHEMAS
// ============================================================================

/**
 * Full conversation
 */
export const ConversationSchema = z.object({
  /** Conversation ID */
  id: UUIDSchema,
  
  /** Conversation title (auto-generated or user-set) */
  title: z.string().max(200).optional(),
  
  /** Agent ID used */
  agentId: UUIDSchema,
  
  /** All messages in the conversation */
  messages: z.array(MessageSchema),
  
  /** Current mode */
  mode: z.enum(EXPERT_MODE_VALUES as [string, ...string[]]),
  
  /** Whether conversation is active */
  isActive: z.boolean().default(true),
  
  /** Total tokens used in conversation */
  totalTokens: z.number().int().default(0),
  
  /** Estimated cost in USD */
  totalCostUsd: z.number().default(0),
  
  /** Multi-tenancy */
  tenantId: TenantIdSchema,
  userId: UserIdSchema,
  
  /** Timestamps */
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
  
  /** Custom metadata */
  metadata: MetadataSchema.optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type MessageRole = z.infer<typeof MessageRoleSchema>;
export type Citation = z.infer<typeof CitationSchema>;
export type ToolCall = z.infer<typeof ToolCallSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type ExpertRequest = z.infer<typeof ExpertRequestSchema>;
export type ExpertSyncResponse = z.infer<typeof ExpertSyncResponseSchema>;
export type ExpertAsyncResponse = z.infer<typeof ExpertAsyncResponseSchema>;
export type ExpertResponse = z.infer<typeof ExpertResponseSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
