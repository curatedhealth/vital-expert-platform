/**
 * Domain Type Definitions
 *
 * Comprehensive type system for the Ask Expert platform.
 * All types are strictly typed with zero `any` types.
 *
 * Architecture:
 * - Enums for constants
 * - Zod schemas for runtime validation
 * - TypeScript interfaces for compile-time safety
 * - Type guards for runtime type checking
 *
 * @module types/domain
 */

import { z } from 'zod';

// ============================================================================
// ENUMS - Use native TypeScript enums for type safety
// ============================================================================

/**
 * Orchestration modes for AI consultation
 * @see UPDATED_5_MODES_MATRIX_2.md for specifications
 */
export enum OrchestrationMode {
  /** Mode 1: One-shot query with 3-5 auto-selected experts, parallel execution */
  QUERY_AUTOMATIC = 'query_automatic',

  /** Mode 2: One-shot query with 1 user-selected expert, fastest path */
  QUERY_MANUAL = 'query_manual',

  /** Mode 3: Multi-turn chat with dynamic expert switching */
  CHAT_AUTOMATIC = 'chat_automatic',

  /** Mode 4: Multi-turn chat with single persistent expert */
  CHAT_MANUAL = 'chat_manual',

  /** Mode 5: Goal-oriented autonomous execution with checkpoints */
  AGENT = 'agent'
}

/**
 * Agent tier levels (1 = highest expertise)
 */
export enum AgentTier {
  /** Strategic, high-stakes decisions */
  TIER_1 = 1,

  /** Specialized domain experts */
  TIER_2 = 2,

  /** General assistance */
  TIER_3 = 3
}

/**
 * Agent operational status
 */
export enum AgentStatus {
  /** Live in production */
  ACTIVE = 'active',

  /** Not available */
  INACTIVE = 'inactive',

  /** In QA testing */
  TESTING = 'testing'
}

/**
 * Compliance levels for regulatory requirements
 */
export enum ComplianceLevel {
  STANDARD = 'standard',
  HIPAA = 'hipaa',
  GDPR = 'gdpr',
  FDA = 'fda',
  SOC2 = 'soc2',
  CCPA = 'ccpa'
}

/**
 * User intent classification types
 */
export enum IntentType {
  QUESTION = 'question',
  TASK = 'task',
  CONSULTATION = 'consultation',
  ANALYSIS = 'analysis',
  GENERATION = 'generation'
}

/**
 * Query complexity levels
 */
export enum ComplexityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very-high'
}

/**
 * Message roles in conversation
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

/**
 * Conversation status
 */
export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

// ============================================================================
// ZOD SCHEMAS - Runtime validation with type inference
// ============================================================================

/**
 * Schema for orchestration mode validation
 */
export const OrchestrationModeSchema = z.nativeEnum(OrchestrationMode);

/**
 * Schema for agent tier validation
 */
export const AgentTierSchema = z.nativeEnum(AgentTier);

/**
 * Schema for agent status validation
 */
export const AgentStatusSchema = z.nativeEnum(AgentStatus);

/**
 * Schema for compliance level validation
 */
export const ComplianceLevelSchema = z.nativeEnum(ComplianceLevel);

/**
 * Schema for intent classification result
 */
export const IntentResultSchema = z.object({
  primaryIntent: z.nativeEnum(IntentType),
  primaryDomain: z.string().min(1).max(100),
  domains: z.array(z.string().min(1).max(100)).min(1).max(10),
  confidence: z.number().min(0).max(1),
  complexity: z.nativeEnum(ComplexityLevel),
  urgency: z.enum(['low', 'standard', 'high', 'urgent']),
  requiresMultipleExperts: z.boolean(),
  reasoning: z.string().min(1).max(2000)
});

/**
 * Schema for agent metadata
 */
export const AgentMetadataSchema = z.object({
  usageCount: z.number().int().min(0).optional(),
  averageLatency: z.number().min(0).optional(),
  satisfactionScore: z.number().min(0).max(5).optional(),
  lastUsed: z.string().datetime().optional(),
  tags: z.array(z.string()).optional()
}).passthrough(); // Allow additional properties

/**
 * Schema for agent entity
 */
export const AgentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  displayName: z.string().min(1).max(100),
  description: z.string().max(2000),
  systemPrompt: z.string().max(20000),
  tier: AgentTierSchema,
  status: AgentStatusSchema,
  knowledgeDomains: z.array(z.string().min(1).max(100)).min(1),
  capabilities: z.array(z.string().min(1).max(100)),
  avatarUrl: z.string().url().optional(),
  priority: z.number().int().min(0).max(1000).default(0),
  metadata: AgentMetadataSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

/**
 * Schema for token usage tracking
 */
export const TokenUsageSchema = z.object({
  prompt: z.number().int().min(0),
  completion: z.number().int().min(0),
  total: z.number().int().min(0),
  estimatedCost: z.number().min(0)
});

/**
 * Schema for orchestration input validation
 */
export const OrchestrationInputSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty').max(10000, 'Query too long'),
  mode: OrchestrationModeSchema,
  userId: z.string().uuid('Invalid user ID'),
  sessionId: z.string().uuid('Invalid session ID'),
  conversationId: z.string().uuid('Invalid conversation ID').optional(),
  tenantId: z.string().uuid('Invalid tenant ID').optional(),
  manualAgentId: z.string().uuid('Invalid agent ID').optional(),
  persistentAgentId: z.string().uuid('Invalid persistent agent ID').optional(),
  humanApproval: z.boolean().optional(),
  complianceLevel: ComplianceLevelSchema.default(ComplianceLevel.STANDARD),
  metadata: z.record(z.string(), z.unknown()).optional()
}).strict(); // Disallow additional properties

/**
 * Schema for source document
 */
export const SourceSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(500),
  url: z.string().url(),
  excerpt: z.string().max(2000),
  similarity: z.number().min(0).max(1),
  metadata: z.record(z.string(), z.unknown())
});

/**
 * Schema for audit log entry
 */
export const AuditLogEntrySchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  userId: z.string().uuid(),
  action: z.string().min(1).max(100),
  resource: z.string().min(1).max(100),
  resourceId: z.string().min(1).max(100),
  ipAddress: z.string().ip(),
  userAgent: z.string().max(500),
  phiAccessed: z.array(z.string()),
  piiAccessed: z.array(z.string()),
  complianceLevel: ComplianceLevelSchema,
  justification: z.string().max(1000).optional(),
  sessionId: z.string().uuid(),
  requestId: z.string().uuid(),
  metadata: z.record(z.string(), z.unknown())
});

// ============================================================================
// TYPE INFERENCE - Derive TypeScript types from Zod schemas
// ============================================================================

export type IntentResult = z.infer<typeof IntentResultSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type AgentMetadata = z.infer<typeof AgentMetadataSchema>;
export type TokenUsage = z.infer<typeof TokenUsageSchema>;
export type OrchestrationInput = z.infer<typeof OrchestrationInputSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;

// ============================================================================
// DOMAIN INTERFACES - Compile-time only types
// ============================================================================

/**
 * Ranked agent with multi-factor scoring
 */
export interface RankedAgent {
  readonly agent: Agent;
  readonly score: number;
  readonly ranking: number;
  readonly reasoning: string;
  readonly factors: Readonly<{
    semanticSimilarity: number;
    domainMatch: number;
    tierBoost: number;
    popularityScore: number;
    availabilityScore: number;
  }>;
}

/**
 * Agent response with full context
 */
export interface AgentResponse {
  readonly agentId: string;
  readonly agentName: string;
  readonly content: string;
  readonly confidence: number;
  readonly reasoning: ReadonlyArray<string>;
  readonly sources: ReadonlyArray<Source>;
  readonly citations: ReadonlyArray<string>;
  readonly tokenUsage: TokenUsage;
  readonly latency: number;
  readonly timestamp: Date;
}

/**
 * Performance metrics for monitoring
 */
export interface PerformanceMetrics {
  readonly intentClassification: number;
  readonly domainDetection: number;
  readonly agentSelection: number;
  readonly contextRetrieval: number;
  readonly execution: number;
  readonly synthesis: number;
  readonly total: number;
}

/**
 * Workflow step status
 */
export interface WorkflowStep {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly status: 'pending' | 'running' | 'completed' | 'error';
  readonly progress?: number;
  readonly startTime?: Date;
  readonly endTime?: Date;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Reasoning step (Chain-of-Thought)
 */
export interface ReasoningStep {
  readonly id: string;
  readonly type: 'thought' | 'action' | 'observation';
  readonly content: string;
  readonly confidence?: number;
  readonly timestamp: Date;
}

/**
 * Streaming metrics for real-time updates
 */
export interface StreamingMetrics {
  readonly tokensGenerated: number;
  readonly tokensPerSecond: number;
  readonly elapsedTime: number;
  readonly estimatedTimeRemaining?: number;
}

/**
 * Human-in-the-loop checkpoint (Mode 5)
 */
export interface Checkpoint {
  readonly id: string;
  readonly type: 'approval' | 'review' | 'decision' | 'safety';
  readonly description: string;
  readonly status: 'pending' | 'approved' | 'rejected';
  readonly timestamp: Date;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Task plan for autonomous execution (Mode 5)
 */
export interface TaskPlan {
  readonly goal: string;
  readonly steps: ReadonlyArray<{
    readonly id: string;
    readonly description: string;
    readonly status: 'pending' | 'in_progress' | 'completed' | 'failed';
    readonly requiresApproval: boolean;
  }>;
  readonly currentStep: number;
}

/**
 * Complete orchestration result
 */
export interface OrchestrationResult {
  readonly conversationId: string;
  readonly response: string;
  readonly selectedAgents: ReadonlyArray<Agent>;
  readonly agentResponses: ReadonlyMap<string, AgentResponse>;
  readonly sources: ReadonlyArray<Source>;
  readonly citations: ReadonlyArray<string>;
  readonly reasoning?: ReadonlyArray<ReasoningStep>;
  readonly workflowSteps: ReadonlyArray<WorkflowStep>;
  readonly taskPlan?: TaskPlan;
  readonly checkpoints?: ReadonlyArray<Checkpoint>;
  readonly tokenUsage: TokenUsage;
  readonly performance: PerformanceMetrics;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly timestamp: Date;
}

/**
 * Message in a conversation
 */
export interface Message {
  readonly id: string;
  readonly conversationId: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly agentId?: string;
  readonly reasoning?: ReadonlyArray<string>;
  readonly sources?: ReadonlyArray<Source>;
  readonly citations?: ReadonlyArray<string>;
  readonly tokenUsage?: TokenUsage;
  readonly latency?: number;
  readonly confidence?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly createdAt: Date;
}

/**
 * Conversation entity
 */
export interface Conversation {
  readonly id: string;
  readonly title: string;
  readonly userId: string;
  readonly tenantId?: string;
  readonly mode: OrchestrationMode;
  readonly status: ConversationStatus;
  readonly complianceLevel: ComplianceLevel;
  readonly messages: ReadonlyArray<Message>;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly archivedAt?: Date;
  readonly deletedAt?: Date;
}

// ============================================================================
// COMPLIANCE TYPES
// ============================================================================

/**
 * Data subject request (GDPR/CCPA)
 */
export interface DataSubjectRequest {
  readonly id: string;
  readonly type: 'access' | 'deletion' | 'portability' | 'rectification';
  readonly userId: string;
  readonly status: 'pending' | 'processing' | 'completed' | 'rejected';
  readonly requestedAt: Date;
  readonly completedAt?: Date;
  readonly regulation: 'GDPR' | 'CCPA' | 'HIPAA';
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Consent record (GDPR/CCPA)
 */
export interface ConsentRecord {
  readonly id: string;
  readonly userId: string;
  readonly purpose: string;
  readonly granted: boolean;
  readonly grantedAt: Date;
  readonly revokedAt?: Date;
  readonly regulation: 'GDPR' | 'CCPA';
  readonly version: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

// ============================================================================
// TYPE GUARDS - Runtime type checking
// ============================================================================

/**
 * Type guard for checking if a value is an OrchestrationMode
 */
export function isOrchestrationMode(value: unknown): value is OrchestrationMode {
  return (
    typeof value === 'string' &&
    Object.values(OrchestrationMode).includes(value as OrchestrationMode)
  );
}

/**
 * Type guard for checking if a value is an Agent
 */
export function isAgent(value: unknown): value is Agent {
  return AgentSchema.safeParse(value).success;
}

/**
 * Type guard for checking if a value is an OrchestrationInput
 */
export function isOrchestrationInput(value: unknown): value is OrchestrationInput {
  return OrchestrationInputSchema.safeParse(value).success;
}

/**
 * Type guard for checking if a value is a Message
 */
export function isMessage(value: unknown): value is Message {
  if (typeof value !== 'object' || value === null) return false;
  const msg = value as Record<string, unknown>;
  return (
    typeof msg.id === 'string' &&
    typeof msg.conversationId === 'string' &&
    typeof msg.role === 'string' &&
    typeof msg.content === 'string' &&
    msg.createdAt instanceof Date
  );
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make all properties of T required and non-null
 */
export type Required<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

/**
 * Make all properties of T optional
 */
export type Optional<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Pick properties of T that are of type U
 */
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

/**
 * Omit properties of T that are of type U
 */
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};

/**
 * Deep readonly type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends Record<string, unknown>
    ? DeepReadonly<T[P]>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : Readonly<T[P]>;
};

/**
 * Extract keys from T where value is not undefined
 */
export type DefinedKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

/**
 * Make properties K of T required
 */
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: T[P];
};
