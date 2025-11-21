/**
 * Workflow Type Definitions
 * Based on vital-expert-platform's AbstractWorkflow model
 */

// ============================================================================
// NODE TYPES
// ============================================================================

export enum NodeType {
  // Agents
  Agent = 'agent',
  Orchestrator = 'orchestrator',
  
  // Tools
  Tool = 'tool',
  
  // Control Flow
  Condition = 'condition',
  Parallel = 'parallel',
  Loop = 'loop',
  Merge = 'merge',
  Switch = 'switch',
  
  // I/O
  Start = 'start',
  End = 'end',
  Input = 'input',
  Output = 'output',
  
  // Nested
  SubWorkflow = 'subWorkflow',
  
  // Human
  Human = 'human',
}

// ============================================================================
// NODE CONFIGURATION
// ============================================================================

export interface AgentConfig {
  model?: string;
  provider?: 'openai' | 'anthropic' | 'azure' | 'custom';
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: string[];
  role?: string;
  goal?: string;
  backstory?: string;
  allowDelegation?: boolean;
  memoryEnabled?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface ToolConfig {
  toolName: string;
  description?: string;
  parameters?: Record<string, any>;
  async?: boolean;
  cacheResults?: boolean;
  timeout?: number;
}

export interface ConditionConfig {
  type?: 'javascript' | 'python' | 'jsonpath' | 'simple';
  expression: string;
  branches?: Array<{
    label: string;
    condition: string;
    targetNodeId: string;
  }>;
  defaultBranch?: string;
}

export interface ParallelConfig {
  mode?: 'all' | 'race' | 'any';
  maxConcurrency?: number;
  timeout?: number;
}

export interface SubWorkflowConfig {
  workflowId?: string;
  workflowDefinition?: WorkflowDefinition;
  inputs?: Record<string, any>;
  outputs?: string[];
}

export type NodeConfig = 
  | AgentConfig 
  | ToolConfig 
  | ConditionConfig 
  | ParallelConfig 
  | SubWorkflowConfig
  | Record<string, any>;

// ============================================================================
// WORKFLOW NODE
// ============================================================================

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  position: { x: number; y: number };
  config: NodeConfig;
  data?: Record<string, any>;
  metadata?: Record<string, any>;
  
  // Subworkflow support
  subworkflow?: WorkflowDefinition | null;
}

// ============================================================================
// WORKFLOW EDGE
// ============================================================================

export enum EdgeType {
  Default = 'default',
  Conditional = 'conditional',
  Parallel = 'parallel',
  Loop = 'loop',
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: EdgeType;
  label?: string;
  condition?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// WORKFLOW DEFINITION
// ============================================================================

export enum PanelType {
  STRUCTURED = 'structured',
  OPEN = 'open',
}

export interface WorkflowConfig {
  name: string;
  description?: string;
  framework?: 'langgraph' | 'autogen' | 'crewai' | 'abstract';
  maxIterations?: number;
  timeout?: number;
  errorHandling?: 'stop' | 'retry' | 'skip' | 'fallback';
  maxRetries?: number;
  tags?: string[];
  version?: string;
  // Panel-specific configuration
  panel_type?: PanelType;
  system_prompt?: string;  // Workflow-level system prompt
  panel_config?: {
    rounds?: number;
    consensus_threshold?: number;
    time_budget?: number;
    intervention_mode?: string;
  };
}

export interface WorkflowDefinition {
  id: string;
  config: WorkflowConfig;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
  userId?: string;
  tenantId?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// VALIDATION
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
// EXECUTION
// ============================================================================

export interface ExecutionEvent {
  type: 'start' | 'node_start' | 'node_complete' | 'node_error' | 'checkpoint' | 'complete' | 'error';
  timestamp: string;
  nodeId?: string;
  data?: any;
  error?: string;
}

export interface ExecutionResult {
  workflowId: string;
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  outputs: Record<string, any>;
  finalState: Record<string, any>;
  startTime: string;
  endTime?: string;
  duration?: number;
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
  totalTokens?: number;
  estimatedCost?: number;
  error?: string;
  traceback?: string;
}

