/**
 * VITAL Protocol - Workflow Schema
 * 
 * Master schema for a complete workflow definition.
 * This is the contract between the Visual Designer (React Flow) 
 * and the Backend Compiler (LangGraph).
 */

import { z } from 'zod';

import {
  UUIDSchema,
  TenantIdSchema,
  UserIdSchema,
  DateTimeSchema,
  ViewportSchema,
  VersionSchema,
  MetadataSchema,
} from './common.schema';
import { EdgeSchema } from './edges.schema';
import { NodeSchema } from './nodes.schema';

// ============================================================================
// WORKFLOW STATUS
// ============================================================================

export const WORKFLOW_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  DEPRECATED: 'deprecated',
} as const;

export type WorkflowStatus = typeof WORKFLOW_STATUS[keyof typeof WORKFLOW_STATUS];

// ============================================================================
// WORKFLOW SCHEMAS
// ============================================================================

/**
 * Workflow validation result
 */
export const WorkflowValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.object({
    nodeId: z.string().optional(),
    edgeId: z.string().optional(),
    code: z.string(),
    message: z.string(),
    severity: z.enum(['error', 'warning', 'info']),
  })),
});

/**
 * Workflow execution settings
 */
export const WorkflowExecutionSettingsSchema = z.object({
  /** Maximum execution time in seconds */
  maxExecutionTime: z.number().int().min(1).max(3600).default(300),
  
  /** Maximum total tokens across all LLM calls */
  maxTokenBudget: z.number().int().min(1).default(100000),
  
  /** Whether to enable streaming */
  enableStreaming: z.boolean().default(true),
  
  /** Whether to enable checkpointing */
  enableCheckpointing: z.boolean().default(true),
  
  /** Checkpoint interval in nodes (0 = every node) */
  checkpointInterval: z.number().int().min(0).default(1),
  
  /** Whether to allow human-in-the-loop */
  allowHumanInLoop: z.boolean().default(true),
  
  /** Default retry count for failed nodes */
  defaultRetryCount: z.number().int().min(0).max(5).default(2),
  
  /** Retry delay in milliseconds */
  retryDelayMs: z.number().int().min(0).default(1000),
});

/**
 * Complete Workflow Schema
 * 
 * This is THE contract between frontend and backend.
 */
export const WorkflowSchema = z.object({
  // ====== IDENTITY ======
  /** Unique workflow identifier */
  id: UUIDSchema,
  
  /** Human-readable name */
  name: z.string().min(1).max(200),
  
  /** Description */
  description: z.string().max(2000).optional(),
  
  /** Version (semver) */
  version: VersionSchema,
  
  /** Status */
  status: z.enum(['draft', 'published', 'archived', 'deprecated']).default('draft'),
  
  // ====== REACT FLOW DATA ======
  /** All nodes in the workflow */
  nodes: z.array(NodeSchema),
  
  /** All edges (connections) in the workflow */
  edges: z.array(EdgeSchema),
  
  /** Current viewport state */
  viewport: ViewportSchema.optional(),
  
  // ====== CONFIGURATION ======
  /** Entry node ID (where execution starts) */
  entryNodeId: z.string().min(1),
  
  /** Exit node IDs (where execution can end) */
  exitNodeIds: z.array(z.string()).min(1),
  
  /** Execution settings */
  executionSettings: WorkflowExecutionSettingsSchema.optional(),
  
  /** Global variables available to all nodes */
  globalVariables: z.record(z.unknown()).optional(),
  
  // ====== METADATA ======
  /** Tags for categorization */
  tags: z.array(z.string()).default([]),
  
  /** Custom metadata */
  metadata: MetadataSchema.optional(),
  
  // ====== MULTI-TENANCY ======
  /** Tenant ID (required for isolation) */
  tenantId: TenantIdSchema,
  
  /** Creator user ID */
  createdBy: UserIdSchema,
  
  /** Last modifier user ID */
  updatedBy: UserIdSchema.optional(),
  
  // ====== TIMESTAMPS ======
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
  
  /** When the workflow was published (if published) */
  publishedAt: DateTimeSchema.optional(),
});

/**
 * Workflow for creation (without server-generated fields)
 */
export const CreateWorkflowSchema = WorkflowSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  updatedBy: true,
});

/**
 * Workflow for update (all fields optional except id)
 */
export const UpdateWorkflowSchema = WorkflowSchema.partial().required({ id: true });

/**
 * Workflow summary (for list views)
 */
export const WorkflowSummarySchema = WorkflowSchema.pick({
  id: true,
  name: true,
  description: true,
  version: true,
  status: true,
  tags: true,
  tenantId: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  nodeCount: z.number().int(),
  edgeCount: z.number().int(),
});

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a workflow definition
 */
export function validateWorkflow(data: unknown): z.infer<typeof WorkflowSchema> {
  return WorkflowSchema.parse(data);
}

/**
 * Safely validate a workflow (returns result object)
 */
export function safeValidateWorkflow(data: unknown) {
  return WorkflowSchema.safeParse(data);
}

/**
 * Validate workflow structure (graph validation)
 */
export function validateWorkflowStructure(
  workflow: z.infer<typeof WorkflowSchema>
): z.infer<typeof WorkflowValidationResultSchema> {
  const errors: z.infer<typeof WorkflowValidationResultSchema>['errors'] = [];
  
  // Check for entry node
  const entryNode = workflow.nodes.find(n => n.id === workflow.entryNodeId);
  if (!entryNode) {
    errors.push({
      code: 'MISSING_ENTRY_NODE',
      message: `Entry node "${workflow.entryNodeId}" not found`,
      severity: 'error',
    });
  }
  
  // Check for exit nodes
  for (const exitId of workflow.exitNodeIds) {
    const exitNode = workflow.nodes.find(n => n.id === exitId);
    if (!exitNode) {
      errors.push({
        nodeId: exitId,
        code: 'MISSING_EXIT_NODE',
        message: `Exit node "${exitId}" not found`,
        severity: 'error',
      });
    }
  }
  
  // Check for orphan nodes (not connected to anything)
  const connectedNodeIds = new Set<string>();
  for (const edge of workflow.edges) {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  }
  
  for (const node of workflow.nodes) {
    if (!connectedNodeIds.has(node.id) && node.type !== 'start' && node.type !== 'end') {
      errors.push({
        nodeId: node.id,
        code: 'ORPHAN_NODE',
        message: `Node "${node.id}" is not connected to any other node`,
        severity: 'warning',
      });
    }
  }
  
  // Check for invalid edge references
  const nodeIds = new Set(workflow.nodes.map(n => n.id));
  for (const edge of workflow.edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push({
        edgeId: edge.id,
        code: 'INVALID_EDGE_SOURCE',
        message: `Edge source "${edge.source}" not found`,
        severity: 'error',
      });
    }
    if (!nodeIds.has(edge.target)) {
      errors.push({
        edgeId: edge.id,
        code: 'INVALID_EDGE_TARGET',
        message: `Edge target "${edge.target}" not found`,
        severity: 'error',
      });
    }
  }
  
  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Workflow = z.infer<typeof WorkflowSchema>;
export type CreateWorkflow = z.infer<typeof CreateWorkflowSchema>;
export type UpdateWorkflow = z.infer<typeof UpdateWorkflowSchema>;
export type WorkflowSummary = z.infer<typeof WorkflowSummarySchema>;
export type WorkflowExecutionSettings = z.infer<typeof WorkflowExecutionSettingsSchema>;
export type WorkflowValidationResult = z.infer<typeof WorkflowValidationResultSchema>;
