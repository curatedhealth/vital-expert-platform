/**
 * Digital Health AI Agent System - TypeScript Type Definitions
 * Based on 3-document architecture: Agent Config, Capabilities, Prompts
 */

export enum AgentTier {
  TIER_1 = 1, // Essential (Launch Week 1-4)
  TIER_2 = 2, // Operational (Month 2-3)
  TIER_3 = 3, // Growth (Month 3-6)
}

export enum ComplianceLevel {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  STANDARD = "standard",
}

export enum AgentDomain {
  REGULATORY = "regulatory",
  CLINICAL = "clinical",
  BUSINESS = "business",
  TECHNICAL = "technical",
  MEDICAL = "medical",
  QUALITY = "quality",
}

export enum ModelType {
  GPT_4O = "gpt-4o",
  GPT_4 = "gpt-4",
  GPT_4_TURBO = "gpt-4-turbo",
  GPT_3_5_TURBO = "gpt-3.5-turbo",
  CLAUDE_3_OPUS = "claude-3-opus",
  CLAUDE_3_SONNET = "claude-3-sonnet",
}

export interface AgentMetadata {
  tier: AgentTier;
  priority: number; // 1-500 based on implementation order
  domain: AgentDomain;
  compliance_level: ComplianceLevel;
  implementation_phase: number; // 1-3 based on rollout timeline
  last_updated: string; // ISO date string
}

export interface DigitalHealthAgentConfig {
  name: string; // agent-identifier
  display_name: string; // Human Readable Name
  model: ModelType;
  temperature: number;
  max_tokens: number;
  context_window: number;
  system_prompt: string;
  capabilities_list: string[]; // Array of capability titles
  prompt_starters: string[]; // Array of prompt starter titles
  metadata: AgentMetadata;
}

export interface Capability {
  capability_id: string; // CAP-[DOMAIN]-[NUMBER]
  title: string;
  description: string;
  methodology: {
    [stepKey: string]: string | string[];
  };
  required_knowledge: string[];
  tools_required?: string[];
  output_format: {
    [key: string]: string;
  };
  quality_metrics: {
    accuracy_target: string;
    time_target: string;
    compliance_requirements: string[];
  };
  examples?: string[];
  limitations?: string[];
}

export interface PromptTemplate {
  prompt_id: string; // PS-[DOMAIN]-[NUMBER]
  prompt_starter: string; // Brief description shown to user
  category: string; // regulatory | clinical | business | technical
  complexity: string; // simple | moderate | complex
  estimated_time: string; // 5-30 minutes
  required_capabilities: string[]; // List of capability IDs needed
  detailed_prompt: string; // Complete prompt template with placeholders
  input_requirements: string[]; // Required information from user
  output_specification: string; // Expected deliverables
  success_criteria: string; // How to measure success
}

export interface ExecutionContext {
  user_id: string;
  session_id: string;
  timestamp: string;
  compliance_level: ComplianceLevel;
  audit_required: boolean;
}

export interface AgentResponse {
  success: boolean;
  content?: string;
  data?: Record<string, unknown>;
  error?: string;
  execution_time: number;
  validation_status: "passed" | "failed" | "warning";
  validation_details?: string;
  audit_log_id?: string;
}

// Enhanced Workflow Types for Agent Orchestrator
export interface WorkflowStep {
  step_id: string;
  agent_name: string;
  prompt_title: string;
  required_inputs: string[];
  depends_on?: string[];
  input_mapping?: Record<string, string>; // Maps outputs from previous steps to inputs
  output_mapping?: Record<string, string>; // Maps outputs to named variables
}

export interface WorkflowDefinition {
  workflow_id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  estimated_duration_minutes: number;
  compliance_level: ComplianceLevel;
}

export type WorkflowStatus = "running" | "completed" | "failed" | "cancelled";

export interface WorkflowExecution {
  execution_id: string;
  workflow_id: string;
  status: WorkflowStatus;
  started_at: string;
  completed_at?: string;
  inputs: Record<string, unknown>;
  context: ExecutionContext;
  steps_completed: number;
  total_steps: number;
  step_results: Record<string, {
    response: AgentResponse;
    inputs_used: Record<string, unknown>;
  }>;
  interactions: AgentInteraction[];
  error?: string;
}

export interface AgentInteraction {
  interaction_id: string;
  timestamp: string;
  agent_name: string;
  action: string;
  inputs: Record<string, unknown>;
  outputs: AgentResponse;
  success: boolean;
  execution_time: number;
}

// Legacy workflow interface - maintained for backwards compatibility
export interface Workflow {
  workflow_name: string;
  description: string;
  agents_involved: WorkflowStep[];
  handoff_protocol: string;
  quality_gates: string;
  estimated_time: string;
  compliance_requirements: ComplianceLevel[];
}

export interface AuditLogEntry {
  log_id: string;
  timestamp: string;
  user_id: string;
  agent_name: string;
  action: string;
  inputs_hash: string; // Hashed for PHI protection
  success: boolean;
  execution_time: number;
  compliance_level: ComplianceLevel;
  error?: string;
  session_id: string;
}

export interface HIPAAComplianceRecord {
  access_type: "read" | "write" | "execute" | "delete";
  resource_type: "agent" | "prompt" | "capability" | "data";
  resource_id: string;
  user_id: string;
  timestamp: string;
  purpose: string;
  authorization_basis: string;
  phi_involved: boolean;
  audit_trail_id: string;
}

export interface AgentMetrics {
  agent_name: string;
  total_executions: number;
  success_rate: number;
  average_response_time: number;
  accuracy_score: number;
  user_satisfaction: number;
  cost_per_query: number;
  compliance_violations: number;
  last_24h_usage: number;
  trend_data: {
    period: string;
    executions: number;
    success_rate: number;
  }[];
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "unhealthy";
  agents_loaded: number;
  agents_active: number;
  capabilities_loaded: number;
  prompts_loaded: number;
  compliance_active: boolean;
  last_health_check: string;
  error_rate_5min: number;
  response_time_p95: number;
  memory_usage: number;
  cpu_usage: number;
}

// API Request/Response Types
export interface ExecutePromptRequest {
  agent_name: string;
  prompt_title: string;
  inputs: Record<string, unknown>;
  user_id: string;
  context?: Partial<ExecutionContext>;
}

export interface ExecuteWorkflowRequest {
  workflow_name: string;
  initial_inputs: Record<string, unknown>;
  user_id: string;
  context?: Partial<ExecutionContext>;
}

export interface AgentListResponse {
  agents: Array<{
    name: string;
    display_name: string;
    tier: AgentTier;
    priority: number;
    domain: AgentDomain;
    capabilities: string[];
    prompts: string[];
    status: "active" | "inactive" | "maintenance";
  }>;
  total_count: number;
  tier_breakdown: Record<string, number>;
}

export interface WorkflowExecutionResult {
  workflow_name: string;
  execution_id: string;
  status: "completed" | "failed" | "in_progress";
  steps_completed: number;
  total_steps: number;
  results: Array<{
    agent: string;
    action: string;
    success: boolean;
    result?: AgentResponse;
    error?: string;
    execution_time: number;
  }>;
  final_output?: Record<string, unknown>;
  total_execution_time: number;
  audit_log_ids: string[];
}

// Error Types
export class AgentError extends Error {
  constructor(
    message: string,
    public agent_name: string,
    public error_code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AgentError";
  }
}

export class CapabilityError extends Error {
  constructor(
    message: string,
    public capability_id: string,
    public error_code: string
  ) {
    super(message);
    this.name = "CapabilityError";
  }
}

export class PromptError extends Error {
  constructor(
    message: string,
    public prompt_id: string,
    public error_code: string
  ) {
    super(message);
    this.name = "PromptError";
  }
}

export class ComplianceError extends Error {
  constructor(
    message: string,
    public violation_type: string,
    public severity: "low" | "medium" | "high" | "critical"
  ) {
    super(message);
    this.name = "ComplianceError";
  }
}

// Utility Types
export type AgentName =
  | "fda-regulatory-strategist"
  | "clinical-trial-designer"
  | "hipaa-compliance-officer"
  | "reimbursement-strategist"
  | "qms-architect"
  | "medical-writer"
  | "clinical-evidence-analyst"
  | "hcp-marketing-strategist";

export type CapabilityTitle =
  | "Regulatory Strategy Development"
  | "510(k) Submission Preparation"
  | "Pre-Submission Strategy"
  | "AI/ML Regulatory Guidance"
  | "Clinical Evidence Planning"
  | "FDA Response Management"
  | "Post-Market Requirements"
  | "International Harmonization";

export type PromptStarterTitle =
  | "Create FDA Regulatory Strategy"
  | "Prepare 510(k) Submission"
  | "Plan Pre-Submission Meeting"
  | "Respond to FDA AI Request"
  | "Design Pivotal Trial Protocol"
  | "Calculate Sample Size"
  | "Develop Recruitment Strategy"
  | "Create Safety Monitoring Plan";

// Validation helpers
export const _isValidAgentName = (name: string): name is AgentName => {
  const validNames: AgentName[] = [
    "fda-regulatory-strategist",
    "clinical-trial-designer",
    "hipaa-compliance-officer",
    "reimbursement-strategist",
    "qms-architect",
    "medical-writer",
    "clinical-evidence-analyst",
    "hcp-marketing-strategist"
  ];
  return validNames.includes(name as AgentName);
};

export const _isValidTier = (tier: number): tier is AgentTier => {
  return Object.values(AgentTier).includes(tier as AgentTier);
};

export const _isValidComplianceLevel = (level: string): level is ComplianceLevel => {
  return Object.values(ComplianceLevel).includes(level as ComplianceLevel);
};