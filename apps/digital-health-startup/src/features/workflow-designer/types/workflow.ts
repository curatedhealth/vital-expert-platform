/**
 * Workflow Designer Type Definitions
 * 
 * Core types for the Visual Workflow Designer system
 */

// ============================================================================
// WORKFLOW DEFINITIONS
// ============================================================================

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  framework: 'langgraph' | 'autogen' | 'crewai';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  config: WorkflowConfig;
  metadata?: WorkflowMetadata;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  config: NodeConfig;
  data?: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  condition?: EdgeCondition;
  label?: string;
}

export interface WorkflowConfig {
  stateSchema?: StateSchema;
  maxRounds?: number;
  timeout?: number;
  errorHandling?: 'stop' | 'continue' | 'retry';
  retryConfig?: {
    maxRetries: number;
    backoff: 'linear' | 'exponential';
  };
}

export interface WorkflowMetadata {
  tags?: string[];
  category?: string;
  version?: number;
  author?: string;
  isTemplate?: boolean;
  isPublic?: boolean;
}

// ============================================================================
// NODE TYPES
// ============================================================================

export type NodeType = 
  | 'start'
  | 'end'
  | 'agent'
  | 'tool'
  | 'condition'
  | 'parallel'
  | 'human'
  | 'subgraph';

export interface NodeConfig {
  // Agent-specific
  agentTemplate?: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
  
  // Tool-specific
  toolName?: string;
  toolParams?: Record<string, any>;
  
  // Condition-specific
  conditionType?: 'javascript' | 'python' | 'simple';
  conditionExpression?: string;
  branches?: ConditionalBranch[];
  
  // Parallel-specific
  parallelBranches?: string[]; // Node IDs to execute in parallel
  mergeStrategy?: 'all' | 'first' | 'any';
  
  // Human-in-the-loop
  humanApprovalRequired?: boolean;
  humanInstructions?: string;
  
  // Subgraph
  subgraphId?: string;
  
  // Common
  description?: string;
  timeout?: number;
  retryOnError?: boolean;
}

export interface ConditionalBranch {
  condition: string;
  target: string;
  label?: string;
}

// ============================================================================
// EDGE TYPES
// ============================================================================

export type EdgeType =
  | 'default'
  | 'conditional'
  | 'parallel'
  | 'error';

export interface EdgeCondition {
  type: 'javascript' | 'python' | 'simple';
  expression: string;
  fallbackTarget?: string;
}

// ============================================================================
// STATE SCHEMA
// ============================================================================

export interface StateSchema {
  fields: StateField[];
  reducers?: Record<string, string>; // Field name -> reducer type
}

export interface StateField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'messages';
  default?: any;
  required?: boolean;
  description?: string;
}

// ============================================================================
// DATABASE MODELS
// ============================================================================

export interface Workflow {
  id: string;
  user_id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  framework: 'langgraph' | 'autogen' | 'crewai';
  workflow_definition: WorkflowDefinition;
  tags?: string[];
  is_template: boolean;
  is_public: boolean;
  execution_count: number;
  last_executed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowVersion {
  id: string;
  workflow_id: string;
  version: number;
  workflow_definition: WorkflowDefinition;
  commit_message?: string;
  created_by: string;
  created_at: string;
}

export interface WorkflowShare {
  id: string;
  workflow_id: string;
  shared_with_user_id: string;
  shared_with_team_id?: string;
  permission: 'view' | 'edit' | 'admin';
  shared_by: string;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_version_id?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  error_message?: string;
  execution_state?: ExecutionState;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  total_tokens?: number;
  total_cost?: number;
  executed_by: string;
  tenant_id?: string;
  created_at: string;
}

export interface ExecutionState {
  currentNode?: string;
  nodeStates: Record<string, NodeExecutionState>;
  checkpoints?: Checkpoint[];
  variables?: Record<string, any>;
}

export interface NodeExecutionState {
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  startTime?: number;
  endTime?: number;
  input?: any;
  output?: any;
  error?: string;
  attempts?: number;
}

export interface Checkpoint {
  id: string;
  nodeId: string;
  timestamp: number;
  state: Record<string, any>;
}

// ============================================================================
// TEMPLATES
// ============================================================================

export interface AgentTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  config: NodeConfig;
  is_builtin: boolean;
  created_by?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  framework: 'langgraph' | 'autogen' | 'crewai';
  workflow_definition: WorkflowDefinition;
  is_builtin: boolean;
  created_by?: string;
  usage_count: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// UI STATE
// ============================================================================

export interface WorkflowDesignerState {
  workflow: WorkflowDefinition | null;
  selectedNodes: string[];
  selectedEdges: string[];
  clipboard: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  } | null;
  undoStack: WorkflowDefinition[];
  redoStack: WorkflowDefinition[];
  isDirty: boolean;
  isExecuting: boolean;
  executionState?: ExecutionState;
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'error';
  nodeId?: string;
  edgeId?: string;
  message: string;
  field?: string;
}

export interface ValidationWarning {
  type: 'warning';
  nodeId?: string;
  edgeId?: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// CODE GENERATION
// ============================================================================

export interface CodeGenerationOptions {
  framework: 'langgraph' | 'autogen' | 'crewai';
  language: 'python' | 'typescript';
  includeComments: boolean;
  includeTests: boolean;
  format: 'script' | 'docker' | 'jupyter' | 'api';
}

export interface GeneratedCode {
  code: string;
  language: string;
  framework: string;
  dependencies: string[];
  entrypoint?: string;
  additionalFiles?: Record<string, string>; // filename -> content
}

// ============================================================================
// EXECUTION
// ============================================================================

export interface ExecutionOptions {
  inputs: Record<string, any>;
  streaming?: boolean;
  debug?: boolean;
  breakpoints?: string[]; // Node IDs to pause at
  maxTokens?: number;
  timeout?: number;
}

export interface ExecutionEvent {
  type: 'start' | 'node_start' | 'node_complete' | 'node_error' | 'checkpoint' | 'complete' | 'error';
  timestamp: string;
  nodeId?: string;
  data?: any;
  error?: string;
}

// ============================================================================
// PERMISSIONS
// ============================================================================

export interface WorkflowPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canExecute: boolean;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface WorkflowMetrics {
  executions: number;
  successRate: number;
  avgDuration: number;
  totalTokens: number;
  totalCost: number;
  lastExecuted?: string;
  popularNodes: Array<{ nodeId: string; count: number }>;
}

