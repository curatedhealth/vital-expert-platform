/**
 * Complete Enhanced Workflow Type System
 *
 * Production-ready type definitions with additional enterprise features
 * and missing interfaces from your excellent foundation.
 */

import { JTBDProcessStep } from './jtbd';

// =====================================================================
// Core Enhanced Workflow Types (Your Excellent Foundation)
// =====================================================================

export interface EnhancedWorkflowStep extends JTBDProcessStep {
  // Conditional branching
  conditional_next?: ConditionalNext[];

  // Parallel execution
  parallel_steps?: string[];
  is_parallel?: boolean;

  // Agent selection strategy
  agent_selection?: AgentSelectionStrategy;
  required_capabilities?: string[];

  // Execution configuration
  retry_config?: RetryConfiguration;
  timeout_config?: TimeoutConfiguration;

  // Validation
  validation_rules?: ValidationRule[];
  input_schema?: JSONSchema;
  output_schema?: JSONSchema;

  // Visual positioning for workflow builder
  position?: { x: number; y: number };

  // Monitoring
  monitoring_config?: MonitoringConfig;

  // Additional enterprise features
  cost_config?: CostConfiguration;
  quality_gates?: QualityGate[];
  approval_config?: ApprovalConfiguration;
  escalation_config?: EscalationConfiguration;
}

export interface ConditionalNext {
  condition: string; // JavaScript expression to evaluate
  next_step_id: string;
  transform_data?: DataTransformation;
  priority?: number;

  // Enhanced conditional features
  condition_type?: 'javascript' | 'json_path' | 'rule_engine';
  condition_metadata?: Record<string, any>;
  evaluation_context?: EvaluationContext;
}

export interface AgentSelectionStrategy {
  strategy: 'manual' | 'automatic' | 'consensus' | 'load_balanced' | 'capability_based' | 'round_robin' | 'performance_based';
  criteria: AgentSelectionCriteria;
  fallback_agents?: string[];
  consensus_config?: ConsensusConfiguration;

  // Enhanced selection features
  selection_timeout_ms?: number;
  backup_strategy?: AgentSelectionStrategy;
  cost_optimization?: boolean;
  geographic_preference?: string[];
}

export interface AgentSelectionCriteria {
  required_capabilities?: string[];
  preferred_capabilities?: string[];
  minimum_tier?: number;
  maximum_tier?: number;
  specializations?: string[];
  minimum_performance_score?: number;
  preferred_agent_id?: string;
  exclude_agents?: string[];

  // Enhanced criteria
  maximum_concurrent_tasks?: number;
  preferred_languages?: string[];
  timezone_preferences?: string[];
  cost_per_hour_max?: number;
  availability_schedule?: AvailabilitySchedule;
  security_clearance_level?: string;
}

export interface RetryConfiguration {
  max_retries: number;
  retry_delay_ms: number;
  exponential_backoff: boolean;
  retry_on_errors?: string[];
  skip_on_errors?: string[];

  // Enhanced retry features
  backoff_multiplier?: number;
  max_retry_delay_ms?: number;
  circuit_breaker_config?: CircuitBreakerConfig;
  retry_with_different_agent?: boolean;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'min' | 'max' | 'pattern' | 'custom' | 'enum' | 'type' | 'range';
  value?: any;
  message: string;
  severity: 'error' | 'warning' | 'info';

  // Enhanced validation
  custom_validator?: string; // Function name or expression
  depends_on?: string[]; // Fields this validation depends on
  conditional?: string; // When to apply this validation
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  industry_tags: string[];
  complexity_level: 'Low' | 'Medium' | 'High';
  estimated_duration: number; // minutes
  template_data: EnhancedWorkflowDefinition;
  usage_count: number;
  rating: number;
  created_by: string;
  is_public: boolean;
  version: string;

  // Enhanced template features
  changelog?: TemplateChange[];
  tags?: string[];
  cost_estimate?: CostEstimate;
  compliance_frameworks?: string[];
  last_tested_at?: string;
  test_results?: TestResult[];
  dependencies?: string[]; // Other template IDs this depends on
}

// =====================================================================
// Missing Interface Definitions
// =====================================================================

export type WorkflowCategory = 'Regulatory' | 'Clinical' | 'Market Access' | 'Medical Affairs' | 'Custom' | 'Quality' | 'Safety' | 'Manufacturing';

export interface EnhancedWorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: WorkflowCategory;
  steps: EnhancedWorkflowStep[];
  conditional_logic: ConditionalBranch[];
  parallel_branches: ParallelBranch[];
  error_strategies: ErrorStrategy[];
  success_criteria: SuccessCriteria;
  metadata: WorkflowMetadata;

  // Enhanced workflow features
  execution_config: WorkflowExecutionConfig;
  security_config?: SecurityConfiguration;
  compliance_config?: ComplianceConfiguration;
  cost_budget?: CostBudget;
  sla_config?: SLAConfiguration;
  notification_config?: NotificationConfiguration;
  audit_config?: AuditConfiguration;
}

export interface ConditionalBranch {
  id: string;
  name: string;
  condition: string;
  target_steps: string[];
  merge_strategy?: 'all' | 'any' | 'first' | 'custom';
  timeout_behavior?: 'fail' | 'continue' | 'skip';
}

export interface ParallelBranch {
  id: string;
  name: string;
  step_ids: string[];
  merge_strategy: 'all_complete' | 'any_complete' | 'timeout' | 'manual';
  timeout_ms?: number;
  failure_threshold?: number; // How many can fail before branch fails
}

export interface ErrorStrategy {
  error_type: string;
  strategy: 'retry' | 'escalate' | 'skip' | 'fail' | 'compensate';
  max_attempts?: number;
  escalation_config?: EscalationConfiguration;
  compensation_step_id?: string;
  notification_config?: NotificationConfiguration;
}

export interface SuccessCriteria {
  required_outputs: string[];
  quality_thresholds: QualityThreshold[];
  performance_metrics: PerformanceMetric[];
  business_rules: BusinessRule[];
}

export interface WorkflowMetadata {
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  tags: string[];
  estimated_cost: number;
  estimated_duration_hours: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  compliance_requirements: string[];
  documentation_links: string[];
}

// =====================================================================
// Supporting Type Definitions
// =====================================================================

export interface DataTransformation {
  type: 'map' | 'filter' | 'aggregate' | 'custom';
  expression: string;
  input_fields: string[];
  output_fields: string[];
}

export interface ConsensusConfiguration {
  minimum_agents: number;
  agreement_threshold: number; // Percentage (0-100)
  voting_strategy: 'majority' | 'unanimous' | 'weighted' | 'expertise_based';
  timeout_ms: number;
  tie_breaking_strategy: 'escalate' | 'random' | 'senior_agent' | 'manual';
}

export interface TimeoutConfiguration {
  step_timeout_ms: number;
  warning_threshold_ms?: number;
  escalation_timeout_ms?: number;
  cleanup_behavior: 'cancel' | 'continue' | 'rollback';
}

export interface MonitoringConfig {
  metrics_to_track: string[];
  alert_thresholds: AlertThreshold[];
  dashboard_config?: DashboardConfig;
  real_time_monitoring: boolean;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  additionalProperties?: boolean;
  [key: string]: any;
}

export interface EvaluationContext {
  variables: Record<string, any>;
  functions: string[];
  security_level: 'sandboxed' | 'restricted' | 'full';
}

export interface AvailabilitySchedule {
  timezone: string;
  working_hours: TimeRange[];
  blackout_dates: string[];
  preferred_days: number[]; // 0-6, Sunday = 0
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface CircuitBreakerConfig {
  failure_threshold: number;
  recovery_time_ms: number;
  half_open_max_calls: number;
}

export interface CostConfiguration {
  max_cost_per_execution: number;
  cost_center: string;
  billing_category: string;
  cost_alerts: CostAlert[];
}

export interface CostAlert {
  threshold_percentage: number;
  notification_recipients: string[];
  escalation_level: 'info' | 'warning' | 'critical';
}

export interface QualityGate {
  id: string;
  name: string;
  criteria: QualityThreshold[];
  blocking: boolean; // If true, workflow stops if gate fails
  auto_approve_threshold?: number;
}

export interface QualityThreshold {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: number;
  unit?: string;
}

export interface ApprovalConfiguration {
  required_approvers: string[];
  approval_threshold: number;
  timeout_hours: number;
  escalation_chain: string[];
  auto_approve_conditions?: string[];
}

export interface EscalationConfiguration {
  levels: EscalationLevel[];
  auto_escalation_timeout_ms: number;
  notification_intervals_ms: number[];
}

export interface EscalationLevel {
  level: number;
  assignees: string[];
  timeout_ms: number;
  auto_resolve: boolean;
}

export interface WorkflowExecutionConfig {
  auto_assign_agents: boolean;
  require_approval: boolean;
  allow_parallel: boolean;
  max_concurrent_steps: number;
  global_timeout: number;
  error_handling: ErrorHandlingConfig;
  resource_allocation: ResourceAllocation;
}

export interface ErrorHandlingConfig {
  strategy: 'fail_fast' | 'continue_on_error' | 'retry' | 'rollback';
  rollback_strategy?: 'full' | 'partial' | 'checkpoint';
  error_notifications: boolean;
  preserve_partial_results: boolean;
}

export interface ResourceAllocation {
  max_cpu_percent: number;
  max_memory_mb: number;
  max_storage_mb: number;
  priority_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityConfiguration {
  access_level: 'public' | 'internal' | 'confidential' | 'restricted';
  required_permissions: string[];
  data_classification: 'public' | 'internal' | 'confidential' | 'secret';
  encryption_required: boolean;
  audit_level: 'basic' | 'detailed' | 'comprehensive';
}

export interface ComplianceConfiguration {
  frameworks: string[]; // e.g., ['SOX', 'GDPR', 'HIPAA', 'FDA']
  validation_rules: ComplianceRule[];
  attestation_required: boolean;
  retention_period_days: number;
}

export interface ComplianceRule {
  framework: string;
  rule_id: string;
  description: string;
  validation_expression: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface CostBudget {
  total_budget: number;
  currency: string;
  budget_alerts: CostAlert[];
  cost_tracking_granularity: 'step' | 'agent' | 'resource';
}

export interface SLAConfiguration {
  max_execution_time_hours: number;
  availability_percentage: number;
  performance_targets: PerformanceTarget[];
  penalties: SLAPenalty[];
}

export interface PerformanceTarget {
  metric: string;
  target_value: number;
  measurement_window: string;
}

export interface SLAPenalty {
  threshold: number;
  penalty_type: 'financial' | 'notification' | 'escalation';
  penalty_value: number;
}

export interface NotificationConfiguration {
  channels: NotificationChannel[];
  recipients: NotificationRecipient[];
  frequency: 'immediate' | 'batched' | 'scheduled';
  escalation_rules: NotificationEscalation[];
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms';
  config: Record<string, any>;
  enabled: boolean;
}

export interface NotificationRecipient {
  id: string;
  type: 'user' | 'group' | 'role';
  channels: string[];
  preferences: NotificationPreferences;
}

export interface NotificationPreferences {
  frequency: 'all' | 'errors_only' | 'summary' | 'none';
  quiet_hours: TimeRange[];
  escalation_delay_minutes: number;
}

export interface NotificationEscalation {
  trigger_condition: string;
  delay_minutes: number;
  recipients: string[];
  channels: string[];
}

export interface AuditConfiguration {
  log_level: 'minimal' | 'standard' | 'detailed' | 'comprehensive';
  retention_days: number;
  include_sensitive_data: boolean;
  real_time_monitoring: boolean;
  compliance_logging: boolean;
}

export interface AlertThreshold {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  notification_config: NotificationConfiguration;
}

export interface DashboardConfig {
  widgets: DashboardWidget[];
  refresh_interval_seconds: number;
  auto_refresh: boolean;
}

export interface DashboardWidget {
  type: 'chart' | 'metric' | 'table' | 'alert';
  config: Record<string, any>;
  position: { row: number; col: number; width: number; height: number };
}

export interface TemplateChange {
  version: string;
  date: string;
  author: string;
  changes: string[];
  migration_required: boolean;
}

export interface CostEstimate {
  total_estimated_cost: number;
  cost_breakdown: CostBreakdown[];
  confidence_level: number; // 0-100
  factors_considered: string[];
}

export interface CostBreakdown {
  category: string;
  estimated_cost: number;
  basis: string; // How the cost was calculated
}

export interface TestResult {
  test_id: string;
  test_name: string;
  status: 'passed' | 'failed' | 'skipped';
  execution_time_ms: number;
  error_message?: string;
  coverage_percentage?: number;
}

export interface PerformanceMetric {
  name: string;
  target_value: number;
  current_value?: number;
  unit: string;
  trend: 'improving' | 'stable' | 'degrading';
}

export interface BusinessRule {
  id: string;
  name: string;
  expression: string;
  priority: number;
  active: boolean;
}

// =====================================================================
// Execution and Runtime Types
// =====================================================================

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_version: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  started_at: string;
  completed_at?: string;
  triggered_by: string;
  input_data: Record<string, any>;
  output_data?: Record<string, any>;
  current_step_id?: string;
  step_executions: StepExecution[];
  error_details?: ExecutionError;
  metrics: ExecutionMetrics;
  cost_tracking: CostTracking;
}

export interface StepExecution {
  step_id: string;
  agent_id?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  started_at: string;
  completed_at?: string;
  input_data: Record<string, any>;
  output_data?: Record<string, any>;
  error_details?: ExecutionError;
  retry_count: number;
  execution_time_ms: number;
  cost: number;
}

export interface ExecutionError {
  code: string;
  message: string;
  stack_trace?: string;
  retry_count: number;
  escalated: boolean;
  resolution_status: 'pending' | 'resolved' | 'escalated';
}

export interface ExecutionMetrics {
  total_execution_time_ms: number;
  steps_completed: number;
  steps_failed: number;
  agents_used: string[];
  cost_incurred: number;
  quality_score?: number;
  efficiency_score?: number;
}

export interface CostTracking {
  total_cost: number;
  cost_by_step: Record<string, number>;
  cost_by_agent: Record<string, number>;
  cost_by_resource: Record<string, number>;
  budget_remaining: number;
  cost_optimization_opportunities: string[];
}

// =====================================================================
// Analytics and Reporting Types
// =====================================================================

export interface WorkflowAnalytics {
  workflow_id: string;
  execution_id?: string;
  metrics: AnalyticsMetrics;
  performance_data: PerformanceData;
  cost_analysis: CostAnalysis;
  quality_metrics: QualityMetrics;
  recommendations: Recommendation[];
  generated_at: string;
}

export interface AnalyticsMetrics {
  total_executions: number;
  success_rate: number;
  average_duration_ms: number;
  cost_per_execution: number;
  agent_utilization: Record<string, number>;
  step_performance: Record<string, StepPerformanceMetrics>;
}

export interface PerformanceData {
  throughput: number; // executions per hour
  latency_percentiles: Record<string, number>; // p50, p95, p99
  resource_utilization: ResourceUtilization;
  bottlenecks: Bottleneck[];
}

export interface StepPerformanceMetrics {
  average_duration_ms: number;
  success_rate: number;
  retry_rate: number;
  cost_per_execution: number;
  quality_score: number;
}

export interface ResourceUtilization {
  cpu_average: number;
  memory_average: number;
  storage_used: number;
  network_bandwidth: number;
}

export interface Bottleneck {
  location: 'step' | 'agent' | 'resource';
  identifier: string;
  impact_score: number;
  description: string;
  suggested_optimization: string;
}

export interface CostAnalysis {
  total_cost: number;
  cost_trends: CostTrend[];
  cost_optimization_opportunities: CostOptimization[];
  roi_metrics: ROIMetrics;
}

export interface CostTrend {
  period: string;
  cost: number;
  change_percentage: number;
}

export interface CostOptimization {
  opportunity: string;
  potential_savings: number;
  implementation_effort: 'low' | 'medium' | 'high';
  risk_level: 'low' | 'medium' | 'high';
}

export interface ROIMetrics {
  cost_savings: number;
  time_savings_hours: number;
  quality_improvements: number;
  roi_percentage: number;
}

export interface QualityMetrics {
  overall_quality_score: number;
  defect_rate: number;
  rework_rate: number;
  compliance_score: number;
  customer_satisfaction: number;
}

export interface Recommendation {
  type: 'performance' | 'cost' | 'quality' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation_steps: string[];
  expected_impact: string;
  effort_estimate: string;
}