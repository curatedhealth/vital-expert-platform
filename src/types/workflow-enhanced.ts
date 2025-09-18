// Enhanced JTBD Workflow Types for Visual Configuration and Dynamic Execution

import { JTBDProcessStep } from '@/lib/jtbd/jtbd-service';
import { Agent } from '@/lib/agents/agent-service';

// Enhanced workflow step with conditional logic and advanced features
export interface EnhancedWorkflowStep extends JTBDProcessStep {
  // Conditional branching
  conditional_next?: ConditionalNext[];

  // Parallel execution
  parallel_steps?: string[];
  is_parallel: boolean;

  // Agent selection strategy
  agent_selection?: AgentSelectionStrategy;
  required_capabilities: string[];

  // Execution configuration
  retry_config?: RetryConfiguration;
  timeout_config?: TimeoutConfiguration;

  // Validation
  validation_rules?: ValidationRule[];
  input_schema: JSONSchema;
  output_schema: JSONSchema;

  // Visual positioning for workflow builder
  position?: { x: number; y: number };

  // Monitoring
  monitoring_config?: MonitoringConfig;
}

export interface ConditionalNext {
  condition: string; // JavaScript expression to evaluate
  next_step_id: string;
  transform_data?: DataTransformation;
  priority?: number;
}

export interface AgentSelectionStrategy {
  strategy: 'manual' | 'automatic' | 'consensus' | 'load_balanced' | 'capability_based';
  criteria: AgentSelectionCriteria;
  fallback_agents?: string[];
  consensus_config?: ConsensusConfiguration;
}

export interface AgentSelectionCriteria {
  required_capabilities?: string[];
  preferred_capabilities?: string[];
  min_success_rate?: number;
  max_cost_per_token?: number;
  min_quality_score?: number;
  availability_weight?: number;
  performance_weight?: number;
  cost_weight?: number;
}

export interface ConsensusConfiguration {
  min_agents: number;
  max_agents: number;
  agreement_threshold: number; // 0.0-1.0
  tie_breaker_strategy: 'random' | 'performance' | 'cost' | 'manual';
}

export interface RetryConfiguration {
  max_attempts: number;
  backoff_strategy: 'linear' | 'exponential' | 'fixed';
  base_delay: number; // milliseconds
  max_delay: number;
  retry_conditions: string[]; // Array of error conditions that trigger retry
}

export interface TimeoutConfiguration {
  execution_timeout: number; // milliseconds
  response_timeout: number;
  warning_threshold: number; // When to warn about slow execution
}

export interface ValidationRule {
  field: string;
  rule_type: 'required' | 'format' | 'range' | 'custom';
  parameters: Record<string, any>;
  error_message: string;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface DataTransformation {
  transformation_type: 'map' | 'filter' | 'reduce' | 'custom';
  expression: string; // JavaScript expression or function
  input_mapping?: Record<string, string>;
  output_mapping?: Record<string, string>;
}

export interface MonitoringConfig {
  track_performance: boolean;
  alert_on_failure: boolean;
  quality_thresholds?: {
    min_confidence?: number;
    max_execution_time?: number;
    min_success_rate?: number;
  };
}

// Enhanced workflow definition
export interface EnhancedWorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: WorkflowCategory;
  industry_tags: string[];
  complexity_level: 'Low' | 'Medium' | 'High';
  estimated_duration: number; // minutes

  // Workflow structure
  steps: EnhancedWorkflowStep[];
  parallel_branches?: ParallelBranch[];

  // Execution configuration
  execution_config: WorkflowExecutionConfig;

  // Success criteria
  success_criteria?: SuccessCriteria;

  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
  rating: number;
  is_public: boolean;
}

export interface ParallelBranch {
  id: string;
  name: string;
  steps: string[]; // Step IDs that execute in parallel
  merge_strategy: 'wait_all' | 'wait_any' | 'wait_majority';
  merge_condition?: string; // Custom merge condition
}

export interface WorkflowExecutionConfig {
  auto_assign_agents: boolean;
  require_approval: boolean;
  allow_parallel: boolean;
  max_concurrent_steps: number;
  global_timeout: number; // milliseconds
  error_handling: ErrorHandlingStrategy;
  notification_config?: NotificationConfig;
}

export interface ErrorHandlingStrategy {
  strategy: 'fail_fast' | 'continue' | 'retry' | 'escalate';
  escalation_config?: {
    escalate_to: string[]; // User IDs or roles
    escalation_threshold: number;
    escalation_message?: string;
  };
}

export interface NotificationConfig {
  notify_on_start: boolean;
  notify_on_completion: boolean;
  notify_on_error: boolean;
  notification_channels: ('email' | 'slack' | 'webhook')[];
  webhook_url?: string;
  slack_channel?: string;
}

export interface SuccessCriteria {
  required_outputs: string[];
  quality_thresholds: Record<string, number>;
  completion_criteria: string; // JavaScript expression
  acceptance_criteria?: string[];
}

// Workflow template for the template library
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  industry_tags: string[];
  complexity_level: 'Low' | 'Medium' | 'High';
  estimated_duration: number;
  template_data: EnhancedWorkflowDefinition;
  usage_count: number;
  rating: number;
  created_by: string;
  is_public: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

export type WorkflowCategory = 'Regulatory' | 'Clinical' | 'Market Access' | 'Medical Affairs' | 'Custom';

// Execution tracking and analytics
export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  execution_id: number;
  status: ExecutionStatus;
  current_step?: string;
  started_at: string;
  completed_at?: string;
  total_duration?: number;

  // Step execution details
  step_executions: StepExecution[];

  // Performance metrics
  performance_metrics: ExecutionMetrics;

  // Results
  results?: Record<string, any>;
  errors?: ExecutionError[];
}

export interface StepExecution {
  step_id: string;
  agent_id?: string;
  status: ExecutionStatus;
  started_at: string;
  completed_at?: string;
  duration?: number;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  error?: ExecutionError;
  retry_count: number;
  quality_score?: number;
  cost?: number;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retry';

export interface ExecutionMetrics {
  total_duration: number;
  average_step_duration: number;
  success_rate: number;
  total_cost: number;
  agent_utilization: Record<string, number>;
  bottlenecks: string[];
  optimization_opportunities: string[];
}

export interface ExecutionError {
  error_type: string;
  error_message: string;
  step_id?: string;
  agent_id?: string;
  timestamp: string;
  stack_trace?: string;
  recovery_suggestions?: string[];
}

// Agent performance tracking
export interface AgentPerformanceMetrics {
  id: string;
  agent_id: string;
  step_id?: string;
  jtbd_id?: string;
  execution_time: number;
  success_rate: number;
  quality_score: number;
  cost_per_token: number;
  user_satisfaction: number;
  error_count: number;
  capability_scores: Record<string, number>;
  metadata?: Record<string, any>;
  recorded_at: string;
}

// Workflow analytics and insights
export interface WorkflowAnalytics {
  id: string;
  workflow_id: string;
  execution_id: number;
  total_duration: number;
  step_durations: Record<string, number>;
  agent_utilization: Record<string, AgentUtilization>;
  bottlenecks: BottleneckAnalysis[];
  cost_breakdown: CostBreakdown;
  optimization_opportunities: OptimizationOpportunity[];
  performance_metrics: Record<string, number>;
  recorded_at: string;
}

export interface AgentUtilization {
  agent_id: string;
  total_time: number;
  active_time: number;
  utilization_rate: number;
  task_count: number;
  average_quality_score: number;
  cost_efficiency: number;
}

export interface BottleneckAnalysis {
  step_id: string;
  bottleneck_type: 'agent_availability' | 'processing_time' | 'data_dependency' | 'validation_failure';
  impact_score: number;
  suggested_solutions: string[];
}

export interface CostBreakdown {
  total_cost: number;
  agent_costs: Record<string, number>;
  step_costs: Record<string, number>;
  infrastructure_cost: number;
  cost_per_outcome: number;
}

export interface OptimizationOpportunity {
  opportunity_type: 'agent_reallocation' | 'parallel_execution' | 'step_optimization' | 'cost_reduction';
  description: string;
  potential_impact: {
    time_savings?: number;
    cost_savings?: number;
    quality_improvement?: number;
  };
  implementation_effort: 'Low' | 'Medium' | 'High';
  priority: number;
}

// Validation and error types
export interface ValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  error_type: string;
  message: string;
  step_id?: string;
  field?: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  warning_type: string;
  message: string;
  step_id?: string;
  field?: string;
}

// Visual workflow builder types
export interface WorkflowNode {
  id: string;
  type: 'step' | 'decision' | 'parallel' | 'merge' | 'start' | 'end';
  position: { x: number; y: number };
  data: NodeData;
  style?: Record<string, any>;
}

export interface NodeData {
  label: string;
  step?: EnhancedWorkflowStep;
  config?: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: {
    condition?: string;
    label?: string;
  };
  style?: Record<string, any>;
}

export interface WorkflowBuilderState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode?: string;
  selectedEdge?: string;
  viewport: { x: number; y: number; zoom: number };
}

// Export utility types
export type WorkflowStepType = 'analysis' | 'review' | 'documentation' | 'decision' | 'approval' | 'notification' | 'custom';
export type AgentCapability = string;
export type WorkflowStatus = 'draft' | 'active' | 'archived' | 'deprecated';