/**
 * VITAL Protocol - Node Schemas
 * 
 * Defines all node types for the Visual Workflow Designer.
 * These schemas are used by:
 * - Frontend: Validation before saving
 * - Backend: Validation before compiling to LangGraph
 */

import { z } from 'zod';

import { EXPERT_MODE_VALUES } from '../constants/modes';
import { NODE_TYPES, NODE_TYPE_VALUES } from '../constants/node-types';

import { PositionSchema, UUIDSchema } from './common.schema';

// ============================================================================
// BASE NODE SCHEMA
// ============================================================================

/**
 * Base properties shared by all nodes
 */
const BaseNodeSchema = z.object({
  /** Unique node identifier */
  id: z.string().min(1),
  
  /** Node type - determines behavior and UI */
  type: z.enum(NODE_TYPE_VALUES as [string, ...string[]]),
  
  /** Position on canvas */
  position: PositionSchema,
  
  /** Node data/configuration */
  data: z.object({}).passthrough(),
  
  /** Optional display label override */
  label: z.string().optional(),
  
  /** Whether node is selected */
  selected: z.boolean().optional(),
  
  /** Whether node is dragging */
  dragging: z.boolean().optional(),
});

// ============================================================================
// ENTRY/EXIT NODES
// ============================================================================

/**
 * Start Node - Entry point for workflow
 */
export const StartNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.START),
  data: z.object({
    /** Initial variables/context to pass to workflow */
    initialContext: z.record(z.unknown()).optional(),
  }),
});

/**
 * End Node - Exit point for workflow
 */
export const EndNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.END),
  data: z.object({
    /** How to handle the final output */
    outputMode: z.enum(['return', 'store', 'webhook']).default('return'),
    /** Webhook URL if outputMode is 'webhook' */
    webhookUrl: z.string().url().optional(),
  }),
});

// ============================================================================
// AI AGENT NODES
// ============================================================================

/**
 * Expert Node - Single AI expert agent
 */
export const ExpertNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.EXPERT),
  data: z.object({
    /** Agent ID to use */
    agentId: UUIDSchema,
    
    /** Expert mode (1-4) */
    mode: z.enum(EXPERT_MODE_VALUES as [string, ...string[]]),
    
    /** Custom system prompt override */
    systemPrompt: z.string().optional(),
    
    /** Temperature for LLM calls */
    temperature: z.number().min(0).max(2).default(0.7),
    
    /** Max tokens for response */
    maxTokens: z.number().int().min(1).max(128000).optional(),
    
    /** Whether to stream response */
    streaming: z.boolean().default(true),
    
    /** Tools available to this expert */
    enabledTools: z.array(z.string()).optional(),
  }),
});

/**
 * Panel Node - Multi-agent expert panel
 */
export const PanelNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.PANEL),
  data: z.object({
    /** Panel configuration ID */
    panelId: UUIDSchema.optional(),
    
    /** Inline panel configuration */
    agents: z.array(z.object({
      agentId: UUIDSchema,
      role: z.string(),
      weight: z.number().min(0).max(1).default(1),
    })).optional(),
    
    /** Consensus strategy */
    consensusStrategy: z.enum([
      'majority_vote',
      'weighted_average', 
      'moderator_decision',
      'unanimous',
    ]).default('weighted_average'),
    
    /** Minimum agreement threshold */
    consensusThreshold: z.number().min(0).max(1).default(0.7),
    
    /** Maximum rounds of discussion */
    maxRounds: z.number().int().min(1).max(10).default(3),
  }),
});

// ============================================================================
// TOOL NODES
// ============================================================================

/**
 * Tool Node - Execute a specific tool
 */
export const ToolNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.TOOL),
  data: z.object({
    /** Tool identifier */
    toolId: z.string().min(1),
    
    /** Tool configuration */
    config: z.record(z.unknown()).optional(),
    
    /** Input mapping from state */
    inputMapping: z.record(z.string()).optional(),
    
    /** Output key in state */
    outputKey: z.string().optional(),
  }),
});

/**
 * RAG Query Node - Query knowledge base
 */
export const RAGQueryNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.RAG_QUERY),
  data: z.object({
    /** Knowledge domain to query */
    domainId: UUIDSchema.optional(),
    
    /** Number of results to retrieve */
    topK: z.number().int().min(1).max(50).default(10),
    
    /** Similarity threshold */
    similarityThreshold: z.number().min(0).max(1).default(0.7),
    
    /** Whether to rerank results */
    rerank: z.boolean().default(true),
    
    /** Filter metadata */
    filters: z.record(z.unknown()).optional(),
  }),
});

/**
 * Web Search Node - Search the web
 */
export const WebSearchNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.WEB_SEARCH),
  data: z.object({
    /** Search provider */
    provider: z.enum(['tavily', 'serper', 'brave']).default('tavily'),
    
    /** Number of results */
    maxResults: z.number().int().min(1).max(20).default(5),
    
    /** Search depth */
    searchDepth: z.enum(['basic', 'advanced']).default('basic'),
    
    /** Include domains */
    includeDomains: z.array(z.string()).optional(),
    
    /** Exclude domains */
    excludeDomains: z.array(z.string()).optional(),
  }),
});

// ============================================================================
// CONTROL FLOW NODES
// ============================================================================

/**
 * Router Node - Conditional routing
 */
export const RouterNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.ROUTER),
  data: z.object({
    /** Routing conditions */
    conditions: z.array(z.object({
      id: z.string(),
      label: z.string(),
      expression: z.string(), // JavaScript-like expression
      targetNodeId: z.string(),
    })),
    
    /** Default target if no condition matches */
    defaultTargetNodeId: z.string(),
    
    /** Evaluation mode */
    evaluationMode: z.enum(['first_match', 'all_matches']).default('first_match'),
  }),
});

/**
 * Condition Node - Simple if/else branching
 */
export const ConditionNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.CONDITION),
  data: z.object({
    /** Condition expression */
    expression: z.string(),
    
    /** True branch target */
    trueTargetNodeId: z.string(),
    
    /** False branch target */
    falseTargetNodeId: z.string(),
  }),
});

/**
 * Parallel Node - Execute branches in parallel
 */
export const ParallelNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.PARALLEL),
  data: z.object({
    /** Branch definitions */
    branches: z.array(z.object({
      id: z.string(),
      label: z.string(),
      targetNodeId: z.string(),
    })),
    
    /** Whether to wait for all branches */
    waitForAll: z.boolean().default(true),
    
    /** Timeout in seconds */
    timeout: z.number().int().min(1).optional(),
  }),
});

/**
 * Merge Node - Merge parallel branches
 */
export const MergeNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.MERGE),
  data: z.object({
    /** Merge strategy */
    strategy: z.enum(['concat', 'merge_objects', 'first', 'custom']).default('merge_objects'),
    
    /** Custom merge function (if strategy is 'custom') */
    customMergeExpression: z.string().optional(),
  }),
});

// ============================================================================
// HUMAN-IN-THE-LOOP NODES
// ============================================================================

/**
 * Human Input Node - Wait for human input
 */
export const HumanInputNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.HUMAN_INPUT),
  data: z.object({
    /** Prompt to show to user */
    prompt: z.string(),
    
    /** Input type */
    inputType: z.enum(['text', 'choice', 'file', 'rating']).default('text'),
    
    /** Choices if inputType is 'choice' */
    choices: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).optional(),
    
    /** Timeout in seconds (0 = no timeout) */
    timeout: z.number().int().min(0).default(0),
    
    /** Whether input is required */
    required: z.boolean().default(true),
  }),
});

/**
 * Approval Node - Wait for human approval
 */
export const ApprovalNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.APPROVAL),
  data: z.object({
    /** What needs approval */
    approvalPrompt: z.string(),
    
    /** Context to show for approval */
    contextKeys: z.array(z.string()).optional(),
    
    /** Approvers (user IDs) */
    approverIds: z.array(UUIDSchema).optional(),
    
    /** Minimum approvals required */
    minApprovals: z.number().int().min(1).default(1),
    
    /** Timeout in seconds (0 = no timeout) */
    timeout: z.number().int().min(0).default(0),
  }),
});

// ============================================================================
// DATA NODES
// ============================================================================

/**
 * Transform Node - Transform data
 */
export const TransformNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.TRANSFORM),
  data: z.object({
    /** Transformation expression or code */
    expression: z.string(),
    
    /** Input keys to transform */
    inputKeys: z.array(z.string()),
    
    /** Output key */
    outputKey: z.string(),
  }),
});

/**
 * Aggregate Node - Aggregate data
 */
export const AggregateNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.AGGREGATE),
  data: z.object({
    /** Aggregation function */
    aggregation: z.enum(['concat', 'sum', 'average', 'min', 'max', 'count', 'custom']),
    
    /** Input keys to aggregate */
    inputKeys: z.array(z.string()),
    
    /** Output key */
    outputKey: z.string(),
    
    /** Custom aggregation expression */
    customExpression: z.string().optional(),
  }),
});

// ============================================================================
// UTILITY NODES
// ============================================================================

/**
 * Delay Node - Add a delay
 */
export const DelayNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.DELAY),
  data: z.object({
    /** Delay in milliseconds */
    delayMs: z.number().int().min(0).max(300000).default(1000),
  }),
});

/**
 * Log Node - Log data for debugging
 */
export const LogNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.LOG),
  data: z.object({
    /** Log level */
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    
    /** Log message template */
    message: z.string(),
    
    /** Keys to include in log */
    includeKeys: z.array(z.string()).optional(),
  }),
});

/**
 * Webhook Node - Call external webhook
 */
export const WebhookNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NODE_TYPES.WEBHOOK),
  data: z.object({
    /** Webhook URL */
    url: z.string().url(),
    
    /** HTTP method */
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('POST'),
    
    /** Headers */
    headers: z.record(z.string()).optional(),
    
    /** Body template */
    bodyTemplate: z.string().optional(),
    
    /** Whether to wait for response */
    waitForResponse: z.boolean().default(true),
    
    /** Timeout in seconds */
    timeout: z.number().int().min(1).max(60).default(30),
  }),
});

// ============================================================================
// UNION TYPE
// ============================================================================

/**
 * Union of all node schemas
 */
export const NodeSchema = z.discriminatedUnion('type', [
  StartNodeSchema,
  EndNodeSchema,
  ExpertNodeSchema,
  PanelNodeSchema,
  ToolNodeSchema,
  RAGQueryNodeSchema,
  WebSearchNodeSchema,
  RouterNodeSchema,
  ConditionNodeSchema,
  ParallelNodeSchema,
  MergeNodeSchema,
  HumanInputNodeSchema,
  ApprovalNodeSchema,
  TransformNodeSchema,
  AggregateNodeSchema,
  DelayNodeSchema,
  LogNodeSchema,
  WebhookNodeSchema,
]);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type StartNode = z.infer<typeof StartNodeSchema>;
export type EndNode = z.infer<typeof EndNodeSchema>;
export type ExpertNode = z.infer<typeof ExpertNodeSchema>;
export type PanelNode = z.infer<typeof PanelNodeSchema>;
export type ToolNode = z.infer<typeof ToolNodeSchema>;
export type RAGQueryNode = z.infer<typeof RAGQueryNodeSchema>;
export type WebSearchNode = z.infer<typeof WebSearchNodeSchema>;
export type RouterNode = z.infer<typeof RouterNodeSchema>;
export type ConditionNode = z.infer<typeof ConditionNodeSchema>;
export type ParallelNode = z.infer<typeof ParallelNodeSchema>;
export type MergeNode = z.infer<typeof MergeNodeSchema>;
export type HumanInputNode = z.infer<typeof HumanInputNodeSchema>;
export type ApprovalNode = z.infer<typeof ApprovalNodeSchema>;
export type TransformNode = z.infer<typeof TransformNodeSchema>;
export type AggregateNode = z.infer<typeof AggregateNodeSchema>;
export type DelayNode = z.infer<typeof DelayNodeSchema>;
export type LogNode = z.infer<typeof LogNodeSchema>;
export type WebhookNode = z.infer<typeof WebhookNodeSchema>;
export type WorkflowNode = z.infer<typeof NodeSchema>;
