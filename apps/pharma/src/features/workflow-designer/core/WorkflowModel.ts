/**
 * Abstract Workflow Model
 * 
 * Framework-agnostic representation of workflows that can be translated
 * to LangGraph, AutoGen, CrewAI, or other frameworks.
 * 
 * This abstraction layer enables:
 * - Framework-independent workflow design
 * - Easy migration between frameworks
 * - Consistent API for all workflow operations
 */

import { z } from 'zod';

// ============================================================================
// NODE TYPES
// ============================================================================

export enum AbstractNodeType {
  Agent = 'agent',
  Tool = 'tool',
  Condition = 'condition',
  Parallel = 'parallel',
  Human = 'human',
  Start = 'start',
  End = 'end',
  SubWorkflow = 'subWorkflow',
}

// ============================================================================
// AGENT CONFIGURATION
// ============================================================================

export const AgentConfigSchema = z.object({
  // Model settings
  model: z.string().default('gpt-4o'),
  provider: z.enum(['openai', 'anthropic', 'azure', 'custom']).default('openai'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().positive().optional(),
  
  // Agent personality
  role: z.string().optional(),
  goal: z.string().optional(),
  backstory: z.string().optional(),
  systemPrompt: z.string(),
  
  // Tools and capabilities
  tools: z.array(z.string()).default([]),
  allowDelegation: z.boolean().default(false),
  
  // Memory and context
  memoryEnabled: z.boolean().default(true),
  contextWindow: z.number().int().positive().optional(),
  
  // Execution settings
  maxRetries: z.number().int().nonnegative().default(0),
  timeout: z.number().int().positive().optional(),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

// ============================================================================
// TOOL CONFIGURATION
// ============================================================================

export const ToolConfigSchema = z.object({
  toolName: z.string(),
  description: z.string().optional(),
  parameters: z.record(z.any()).default({}),
  async: z.boolean().default(false),
  cacheResults: z.boolean().default(false),
  timeout: z.number().int().positive().optional(),
});

export type ToolConfig = z.infer<typeof ToolConfigSchema>;

// ============================================================================
// CONDITION CONFIGURATION
// ============================================================================

export const ConditionConfigSchema = z.object({
  type: z.enum(['javascript', 'python', 'jsonpath']).default('javascript'),
  expression: z.string(),
  branches: z.array(z.object({
    label: z.string(),
    condition: z.string(),
    targetNodeId: z.string(),
  })),
  defaultBranch: z.string().optional(),
});

export type ConditionConfig = z.infer<typeof ConditionConfigSchema>;

// ============================================================================
// PARALLEL CONFIGURATION
// ============================================================================

export const ParallelConfigSchema = z.object({
  mode: z.enum(['all', 'race', 'any']).default('all'), // all = wait for all, race = first to finish, any = any completion
  maxConcurrency: z.number().int().positive().optional(),
  timeout: z.number().int().positive().optional(),
});

export type ParallelConfig = z.infer<typeof ParallelConfigSchema>;

// ============================================================================
// HUMAN INPUT CONFIGURATION
// ============================================================================

export const HumanConfigSchema = z.object({
  prompt: z.string(),
  inputType: z.enum(['text', 'choice', 'confirm', 'form']).default('text'),
  choices: z.array(z.string()).optional(),
  formFields: z.array(z.object({
    name: z.string(),
    type: z.string(),
    label: z.string(),
    required: z.boolean(),
  })).optional(),
  timeout: z.number().int().positive().optional(),
});

export type HumanConfig = z.infer<typeof HumanConfigSchema>;

// ============================================================================
// ABSTRACT NODE
// ============================================================================

export const AbstractNodeSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(AbstractNodeType),
  label: z.string(),
  description: z.string().optional(),
  
  // Position in visual editor
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  
  // Type-specific configuration
  config: z.union([
    AgentConfigSchema,
    ToolConfigSchema,
    ConditionConfigSchema,
    ParallelConfigSchema,
    HumanConfigSchema,
    z.record(z.any()), // Fallback for other types
  ]),
  
  // Runtime metadata
  metadata: z.record(z.any()).optional(),
});

export type AbstractNode = z.infer<typeof AbstractNodeSchema>;

// ============================================================================
// ABSTRACT EDGE
// ============================================================================

export enum EdgeType {
  Default = 'default',
  Conditional = 'conditional',
  Parallel = 'parallel',
  Loop = 'loop',
}

export const AbstractEdgeSchema = z.object({
  id: z.string(),
  source: z.string(), // source node id
  target: z.string(), // target node id
  type: z.nativeEnum(EdgeType).default(EdgeType.Default),
  
  // Edge label (optional)
  label: z.string().optional(),
  
  // Conditional edge configuration
  condition: z.string().optional(),
  
  // Edge metadata
  metadata: z.record(z.any()).optional(),
});

export type AbstractEdge = z.infer<typeof AbstractEdgeSchema>;

// ============================================================================
// STATE SCHEMA
// ============================================================================

export const StateFieldSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array', 'messages']),
  description: z.string().optional(),
  required: z.boolean().default(false),
  defaultValue: z.any().optional(),
  reducer: z.enum(['replace', 'append', 'merge', 'add_messages']).optional(),
});

export type StateField = z.infer<typeof StateFieldSchema>;

export const StateSchemaDefinition = z.object({
  fields: z.array(StateFieldSchema),
  includeMessages: z.boolean().default(true), // Most frameworks need message history
});

export type StateSchema = z.infer<typeof StateSchemaDefinition>;

// ============================================================================
// WORKFLOW CONFIGURATION
// ============================================================================

export const WorkflowConfigSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  description: z.string().optional(),
  
  // Framework selection
  framework: z.enum(['langgraph', 'autogen', 'crewai', 'abstract']).default('langgraph'),
  
  // State schema
  stateSchema: StateSchemaDefinition,
  
  // Execution settings
  maxIterations: z.number().int().positive().default(100),
  timeout: z.number().int().positive().optional(),
  
  // Memory settings
  checkpointer: z.enum(['memory', 'postgres', 'redis', 'none']).default('memory'),
  
  // Error handling
  errorHandling: z.enum(['stop', 'retry', 'skip', 'fallback']).default('stop'),
  maxRetries: z.number().int().nonnegative().default(0),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  version: z.string().optional(),
});

export type WorkflowConfig = z.infer<typeof WorkflowConfigSchema>;

// ============================================================================
// ABSTRACT WORKFLOW
// ============================================================================

export const AbstractWorkflowSchema = z.object({
  id: z.string(),
  
  // Workflow metadata
  config: WorkflowConfigSchema,
  
  // Workflow structure
  nodes: z.array(AbstractNodeSchema),
  edges: z.array(AbstractEdgeSchema),
  
  // Visual editor state
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number(),
  }).optional(),
  
  // Ownership and permissions
  userId: z.string().optional(),
  tenantId: z.string().optional(),
  isPublic: z.boolean().default(false),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type AbstractWorkflow = z.infer<typeof AbstractWorkflowSchema>;

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ============================================================================
// EXECUTION RESULT
// ============================================================================

export interface ExecutionResult {
  workflowId: string;
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  
  // Results
  outputs: Record<string, any>;
  finalState: Record<string, any>;
  
  // Execution metadata
  startTime: string;
  endTime?: string;
  duration?: number;
  
  // Node execution details
  nodeExecutions: Array<{
    nodeId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startTime?: string;
    endTime?: string;
    duration?: number;
    input?: any;
    output?: any;
    error?: string;
  }>;
  
  // Metrics
  totalTokens: number;
  estimatedCost: number;
  
  // Error details
  error?: string;
  traceback?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a new abstract workflow with sensible defaults
 */
export function createAbstractWorkflow(
  config: Partial<WorkflowConfig> = {}
): AbstractWorkflow {
  return {
    id: crypto.randomUUID(),
    config: WorkflowConfigSchema.parse({
      name: 'New Workflow',
      stateSchema: {
        fields: [],
        includeMessages: true,
      },
      ...config,
    }),
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  };
}

/**
 * Create a new abstract node
 */
export function createAbstractNode(
  type: AbstractNodeType,
  position: { x: number; y: number },
  config: Partial<AbstractNode['config']> = {}
): AbstractNode {
  const id = crypto.randomUUID();
  
  // Type-specific defaults
  let defaultConfig: any = {};
  
  switch (type) {
    case AbstractNodeType.Agent:
      defaultConfig = AgentConfigSchema.parse({
        systemPrompt: 'You are a helpful AI assistant.',
        ...config,
      });
      break;
    case AbstractNodeType.Tool:
      defaultConfig = ToolConfigSchema.parse({
        toolName: 'custom_tool',
        ...config,
      });
      break;
    case AbstractNodeType.Condition:
      defaultConfig = ConditionConfigSchema.parse({
        expression: 'state.value === true',
        branches: [],
        ...config,
      });
      break;
    case AbstractNodeType.Human:
      defaultConfig = HumanConfigSchema.parse({
        prompt: 'Please provide input:',
        ...config,
      });
      break;
    default:
      defaultConfig = config;
  }
  
  return {
    id,
    type,
    label: `${type} ${id.slice(0, 4)}`,
    position,
    config: defaultConfig,
  };
}

/**
 * Create a new abstract edge
 */
export function createAbstractEdge(
  source: string,
  target: string,
  type: EdgeType = EdgeType.Default
): AbstractEdge {
  return {
    id: crypto.randomUUID(),
    source,
    target,
    type,
  };
}

/**
 * Validate workflow structure
 */
export function validateWorkflowStructure(
  workflow: AbstractWorkflow
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  // Check for start node
  const startNodes = workflow.nodes.filter(n => n.type === AbstractNodeType.Start);
  if (startNodes.length === 0) {
    errors.push({
      message: 'Workflow must have at least one Start node',
      severity: 'error',
    });
  } else if (startNodes.length > 1) {
    errors.push({
      message: 'Workflow can only have one Start node',
      severity: 'error',
    });
  }
  
  // Check for end node
  const endNodes = workflow.nodes.filter(n => n.type === AbstractNodeType.End);
  if (endNodes.length === 0) {
    warnings.push({
      message: 'Workflow should have at least one End node',
      severity: 'warning',
    });
  }
  
  // Check for disconnected nodes
  const connectedNodeIds = new Set<string>();
  workflow.edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });
  
  workflow.nodes.forEach(node => {
    if (
      node.type !== AbstractNodeType.Start &&
      node.type !== AbstractNodeType.End &&
      !connectedNodeIds.has(node.id)
    ) {
      warnings.push({
        nodeId: node.id,
        message: `Node "${node.label}" is not connected to any other nodes`,
        severity: 'warning',
      });
    }
  });
  
  // Check for invalid edge connections
  workflow.edges.forEach(edge => {
    const sourceNode = workflow.nodes.find(n => n.id === edge.source);
    const targetNode = workflow.nodes.find(n => n.id === edge.target);
    
    if (!sourceNode) {
      errors.push({
        edgeId: edge.id,
        message: `Edge references non-existent source node: ${edge.source}`,
        severity: 'error',
      });
    }
    
    if (!targetNode) {
      errors.push({
        edgeId: edge.id,
        message: `Edge references non-existent target node: ${edge.target}`,
        severity: 'error',
      });
    }
    
    // End nodes shouldn't have outgoing edges
    if (sourceNode?.type === AbstractNodeType.End) {
      errors.push({
        edgeId: edge.id,
        nodeId: edge.source,
        message: 'End nodes cannot have outgoing connections',
        severity: 'error',
      });
    }
    
    // Start nodes shouldn't have incoming edges
    if (targetNode?.type === AbstractNodeType.Start) {
      errors.push({
        edgeId: edge.id,
        nodeId: edge.target,
        message: 'Start nodes cannot have incoming connections',
        severity: 'error',
      });
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get all nodes that are direct children of a given node
 */
export function getChildNodes(
  workflow: AbstractWorkflow,
  nodeId: string
): AbstractNode[] {
  const childNodeIds = workflow.edges
    .filter(edge => edge.source === nodeId)
    .map(edge => edge.target);
  
  return workflow.nodes.filter(node => childNodeIds.includes(node.id));
}

/**
 * Get all nodes that are direct parents of a given node
 */
export function getParentNodes(
  workflow: AbstractWorkflow,
  nodeId: string
): AbstractNode[] {
  const parentNodeIds = workflow.edges
    .filter(edge => edge.target === nodeId)
    .map(edge => edge.source);
  
  return workflow.nodes.filter(node => parentNodeIds.includes(node.id));
}

/**
 * Get execution order of nodes (topological sort)
 */
export function getExecutionOrder(
  workflow: AbstractWorkflow
): string[] {
  const visited = new Set<string>();
  const result: string[] = [];
  
  function visit(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    
    // Visit children first (DFS)
    const children = getChildNodes(workflow, nodeId);
    children.forEach(child => visit(child.id));
    
    result.unshift(nodeId);
  }
  
  // Start from Start nodes
  const startNodes = workflow.nodes.filter(n => n.type === AbstractNodeType.Start);
  startNodes.forEach(node => visit(node.id));
  
  return result;
}

