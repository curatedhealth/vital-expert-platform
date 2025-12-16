/**
 * Mode 3: Manual Autonomous - TypeScript Interfaces
 *
 * VITAL Platform - Ask Expert Service
 * Matches Python backend: services/ai-engine/src/workflows/mode3_autonomous_manual.py
 *
 * Mode 3 = Manual Agent Selection + Autonomous Execution + HITL Checkpoints
 *
 * Reference: PRD @ /.claude/docs/services/ask-expert/MODE_3_PRD.md
 * Reference: ARD @ /.claude/docs/services/ask-expert/MODE_3_ARD.md
 */

// ============================================================================
// Core Enums and Constants
// ============================================================================

/** 5-Level Agent Hierarchy (L1 = Master, L5 = Tool) */
export type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

/** Agent hierarchy configuration */
export const AGENT_LEVEL_CONFIG: Record<AgentLevel, AgentLevelMetadata> = {
  L1: {
    level: 'L1',
    name: 'Master Agent',
    role: 'Task coordination, HITL triggers, escalation to human',
    canSpawn: ['L2'],
    maxConcurrent: 1,
  },
  L2: {
    level: 'L2',
    name: 'Expert Agent',
    role: 'Domain expertise, user-selected, L2→L3 delegation',
    canSpawn: ['L3', 'L4'],
    maxConcurrent: 1,
  },
  L3: {
    level: 'L3',
    name: 'Specialist Agent',
    role: 'Sub-domain tasks, spawned by L2, L3→L4 delegation',
    canSpawn: ['L4'],
    maxConcurrent: 3,
  },
  L4: {
    level: 'L4',
    name: 'Worker Agent',
    role: 'Parallel task execution, tool requests',
    canSpawn: ['L5'],
    maxConcurrent: 5,
  },
  L5: {
    level: 'L5',
    name: 'Tool Agent',
    role: 'RAG, Web Search, Code Execution, Database queries',
    canSpawn: [],
    maxConcurrent: 10,
  },
};

export interface AgentLevelMetadata {
  level: AgentLevel;
  name: string;
  role: string;
  canSpawn: AgentLevel[];
  maxConcurrent: number;
}

/** HITL checkpoint types - 5 mandatory approval points */
export type HITLCheckpointType =
  | 'plan'           // Multi-step execution plan approval
  | 'tool'           // External tool/API execution approval
  | 'subagent'       // L3/L4/L5 agent spawning approval
  | 'decision'       // High-stakes business decision approval
  | 'final';         // Final response delivery approval

/** HITL checkpoint status */
export type HITLStatus = 'pending' | 'approved' | 'rejected' | 'modified' | 'timeout';

/** Safety levels for HITL configuration */
export type HITLSafetyLevel = 'strict' | 'balanced' | 'permissive';

/** HITL safety level configuration */
export const HITL_SAFETY_CONFIG: Record<HITLSafetyLevel, HITLSafetyConfig> = {
  strict: {
    level: 'strict',
    description: 'All 5 checkpoints require approval',
    checkpointsRequired: ['plan', 'tool', 'subagent', 'decision', 'final'],
    autoApproveNone: true,
    timeoutSeconds: 300,
  },
  balanced: {
    level: 'balanced',
    description: 'Critical checkpoints require approval, routine auto-approved',
    checkpointsRequired: ['plan', 'decision', 'final'],
    autoApproveNone: false,
    timeoutSeconds: 180,
  },
  permissive: {
    level: 'permissive',
    description: 'Only plan and final checkpoints require approval',
    checkpointsRequired: ['plan', 'final'],
    autoApproveNone: false,
    timeoutSeconds: 120,
  },
};

export interface HITLSafetyConfig {
  level: HITLSafetyLevel;
  description: string;
  checkpointsRequired: HITLCheckpointType[];
  autoApproveNone: boolean;
  timeoutSeconds: number;
}

// ============================================================================
// Request/Response Types
// ============================================================================

/** Mode 3 API request (matches backend schema) */
export interface Mode3Request {
  agent_id: string;
  message: string;
  session_id: string;
  tenant_id: string;
  enable_rag?: boolean;
  hitl_enabled?: boolean;
  hitl_safety_level?: HITLSafetyLevel;
  max_execution_time?: number;
  metadata?: Record<string, unknown>;
}

/** Mode 3 configuration for frontend */
export interface Mode3Config {
  isAutomatic: false;       // Manual agent selection (Mode 3)
  isAutonomous: true;       // Goal-driven execution
  hitlEnabled: true;        // HITL checkpoints active
  selectedAgentId: string;  // User pre-selected agent
  hitlSafetyLevel: HITLSafetyLevel;
  maxExecutionTime: number; // Timeout in seconds (default: 120)
}

/** Mode 3 session state */
export interface Mode3Session {
  id: string;
  tenant_id: string;
  user_id: string;
  agent_id: string;
  status: Mode3SessionStatus;
  goal: string;
  execution_plan?: ExecutionPlan;
  current_step: number;
  total_steps: number;
  hitl_checkpoints: HITLCheckpoint[];
  agent_executions: AgentExecution[];
  tool_executions: ToolExecution[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  hipaa_compliant: boolean;
  data_classification: 'public' | 'internal' | 'confidential' | 'restricted';
}

export type Mode3SessionStatus =
  | 'initializing'
  | 'planning'
  | 'awaiting_plan_approval'
  | 'executing'
  | 'awaiting_tool_approval'
  | 'awaiting_subagent_approval'
  | 'awaiting_decision_approval'
  | 'awaiting_final_approval'
  | 'completed'
  | 'failed'
  | 'timeout'
  | 'cancelled';

// ============================================================================
// Execution Plan Types
// ============================================================================

/** Multi-step execution plan (ToT/ReAct generated) */
export interface ExecutionPlan {
  id: string;
  session_id: string;
  goal: string;
  steps: ExecutionStep[];
  estimated_duration: number;
  confidence_score: number;
  reasoning_pattern: 'tree_of_thoughts' | 'react' | 'chain_of_thought';
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface ExecutionStep {
  id: string;
  step_number: number;
  description: string;
  action_type: StepActionType;
  agent_level: AgentLevel;
  estimated_duration: number;
  dependencies: string[];      // Step IDs this depends on
  tools_required: string[];
  status: StepStatus;
  result?: string;
  error?: string;
  started_at?: string;
  completed_at?: string;
}

export type StepActionType =
  | 'reasoning'           // Pure LLM reasoning
  | 'rag_retrieval'       // Vector DB search
  | 'web_search'          // External web search
  | 'database_query'      // Read-only DB query
  | 'code_execution'      // Sandboxed code execution
  | 'agent_delegation'    // Spawn sub-agent
  | 'synthesis'           // Combine results
  | 'validation';         // Constitutional AI check

export type StepStatus =
  | 'pending'
  | 'awaiting_approval'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'skipped';

// ============================================================================
// HITL Checkpoint Types
// ============================================================================

/** HITL checkpoint requiring user approval */
export interface HITLCheckpoint {
  id: string;
  session_id: string;
  checkpoint_type: HITLCheckpointType;
  status: HITLStatus;
  request: HITLRequest;
  response?: HITLResponse;
  created_at: string;
  responded_at?: string;
  timeout_at: string;
}

/** HITL approval request (sent to frontend) */
export interface HITLRequest {
  checkpoint_id: string;
  checkpoint_type: HITLCheckpointType;
  title: string;
  description: string;
  details: HITLRequestDetails;
  options: HITLOption[];
  required_action: 'approve' | 'reject' | 'modify';
  timeout_seconds: number;
  risk_assessment?: RiskAssessment;
}

export type HITLRequestDetails =
  | PlanApprovalDetails
  | ToolApprovalDetails
  | SubagentApprovalDetails
  | DecisionApprovalDetails
  | FinalApprovalDetails;

export interface PlanApprovalDetails {
  type: 'plan';
  plan: ExecutionPlan;
  modifications_allowed: boolean;
}

export interface ToolApprovalDetails {
  type: 'tool';
  tool_name: string;
  tool_category: 'rag' | 'web' | 'code' | 'database' | 'external_api';
  parameters: Record<string, unknown>;
  expected_result: string;
  risks: string[];
  reversible: boolean;
}

export interface SubagentApprovalDetails {
  type: 'subagent';
  agent_level: AgentLevel;
  agent_name: string;
  agent_capabilities: string[];
  task_description: string;
  justification: string;
  estimated_duration: number;
}

export interface DecisionApprovalDetails {
  type: 'decision';
  decision_category: 'regulatory' | 'clinical' | 'commercial' | 'operational';
  recommendation: string;
  alternatives: string[];
  impact_assessment: string;
  confidence_score: number;
  evidence_summary: string[];
}

export interface FinalApprovalDetails {
  type: 'final';
  response_preview: string;
  citations: Citation[];
  confidence_score: number;
  compliance_check: ComplianceCheck;
}

export interface HITLOption {
  id: string;
  label: string;
  action: 'approve' | 'reject' | 'modify';
  description: string;
  is_default?: boolean;
}

/** HITL approval response (from frontend) */
export interface HITLResponse {
  checkpoint_id: string;
  action: 'approved' | 'rejected' | 'modified';
  modifications?: Record<string, unknown>;
  reason?: string;
  user_id: string;
  responded_at: string;
}

export interface RiskAssessment {
  overall_risk: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: RiskFactor[];
  mitigation_suggestions: string[];
}

export interface RiskFactor {
  category: 'hipaa' | 'gdpr' | 'regulatory' | 'clinical' | 'operational';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// Agent Execution Types
// ============================================================================

/** Agent execution record (5-level hierarchy) */
export interface AgentExecution {
  id: string;
  session_id: string;
  agent_id: string;
  agent_level: AgentLevel;
  agent_name: string;
  parent_execution_id?: string;   // For spawned agents
  task: string;
  status: AgentExecutionStatus;
  input: string;
  output?: string;
  reasoning_trace: ReasoningStep[];
  tools_used: string[];
  child_executions: string[];     // IDs of spawned agents
  tokens_used: TokenUsage;
  started_at: string;
  completed_at?: string;
  error?: string;
}

export type AgentExecutionStatus =
  | 'queued'
  | 'initializing'
  | 'reasoning'
  | 'executing'
  | 'awaiting_approval'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ReasoningStep {
  id: string;
  step_type: 'thought' | 'action' | 'observation' | 'reflection';
  content: string;
  timestamp: string;
  confidence?: number;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
}

// ============================================================================
// Tool Execution Types
// ============================================================================

/** Tool execution record */
export interface ToolExecution {
  id: string;
  session_id: string;
  agent_execution_id: string;
  tool_name: string;
  tool_category: 'rag' | 'web' | 'code' | 'database' | 'external_api';
  input: Record<string, unknown>;
  output?: string;
  status: 'pending' | 'approved' | 'executing' | 'completed' | 'failed' | 'rejected';
  approval_required: boolean;
  approved_at?: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  error?: string;
}

// ============================================================================
// Constitutional AI Types
// ============================================================================

/** Constitutional AI validation result */
export interface ConstitutionalValidation {
  is_compliant: boolean;
  autonomous_safe: boolean;
  compliance_score: number;
  violations: ConstitutionalViolation[];
  requires_hitl_override: boolean;
  validated_response: string;
  validation_timestamp: string;
}

export interface ConstitutionalViolation {
  principle: string;
  category: 'hipaa' | 'gdpr' | 'regulatory' | 'clinical' | 'safety' | 'autonomous';
  severity: 'warning' | 'error' | 'critical';
  description: string;
  suggested_fix?: string;
}

export interface ComplianceCheck {
  hipaa_compliant: boolean;
  gdpr_compliant: boolean;
  regulatory_compliant: boolean;
  phi_detected: boolean;
  pii_detected: boolean;
  violations: ConstitutionalViolation[];
}

// ============================================================================
// SSE Streaming Types
// ============================================================================

/** SSE event types for Mode 3 streaming */
export type Mode3EventType =
  | 'session_start'
  | 'planning_start'
  | 'planning_complete'
  | 'hitl_request'
  | 'hitl_response'
  | 'step_start'
  | 'step_progress'
  | 'step_complete'
  | 'agent_spawn'
  | 'tool_execution'
  | 'token'
  | 'reasoning'
  | 'error'
  | 'done';

/** SSE event payload */
export interface Mode3StreamEvent {
  type: Mode3EventType;
  session_id: string;
  timestamp: string;
  data: Mode3EventData;
}

export type Mode3EventData =
  | SessionStartEvent
  | PlanningEvent
  | HITLEvent
  | StepEvent
  | AgentSpawnEvent
  | ToolExecutionEvent
  | TokenEvent
  | ReasoningEvent
  | ErrorEvent
  | DoneEvent;

export interface SessionStartEvent {
  type: 'session_start';
  agent_id: string;
  agent_name: string;
  goal: string;
}

export interface PlanningEvent {
  type: 'planning_start' | 'planning_complete';
  plan?: ExecutionPlan;
  reasoning_pattern?: string;
}

export interface HITLEvent {
  type: 'hitl_request' | 'hitl_response';
  checkpoint: HITLCheckpoint;
}

export interface StepEvent {
  type: 'step_start' | 'step_progress' | 'step_complete';
  step: ExecutionStep;
  progress_percentage?: number;
}

export interface AgentSpawnEvent {
  type: 'agent_spawn';
  agent_execution: AgentExecution;
  parent_id: string;
}

export interface ToolExecutionEvent {
  type: 'tool_execution';
  tool: ToolExecution;
}

export interface TokenEvent {
  type: 'token';
  content: string;
  finish_reason?: string;
}

export interface ReasoningEvent {
  type: 'reasoning';
  step: ReasoningStep;
}

export interface ErrorEvent {
  type: 'error';
  error_code: string;
  error_message: string;
  recoverable: boolean;
}

export interface DoneEvent {
  type: 'done';
  final_response: string;
  citations: Citation[];
  execution_summary: ExecutionSummary;
  compliance_check: ComplianceCheck;
}

// ============================================================================
// Citation Types
// ============================================================================

export interface Citation {
  id: string;
  source_type: 'rag' | 'web' | 'database' | 'external';
  title: string;
  url?: string;
  content_snippet: string;
  relevance_score: number;
  retrieved_at: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Summary Types
// ============================================================================

export interface ExecutionSummary {
  session_id: string;
  total_steps: number;
  completed_steps: number;
  total_agents_spawned: number;
  total_tools_used: number;
  total_hitl_checkpoints: number;
  approved_checkpoints: number;
  rejected_checkpoints: number;
  total_tokens: TokenUsage;
  total_duration_seconds: number;
  success: boolean;
}

// ============================================================================
// GDPR Types (for data subject rights)
// ============================================================================

export interface GDPRConsentRecord {
  id: string;
  session_id: string;
  user_id: string;
  consent_type: 'processing' | 'transfer' | 'marketing' | 'profiling';
  consent_given: boolean;
  consent_timestamp: string;
  ip_address_hash: string;
  purpose: string;
  lawful_basis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
}

export interface GDPRDataSubjectRequest {
  id: string;
  user_id: string;
  request_type: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  submitted_at: string;
  completed_at?: string;
  notes?: string;
}

// ============================================================================
// UI Component Props
// ============================================================================

export interface Mode3ChatProps {
  config: Mode3Config;
  sessionId: string;
  agentId: string;
  onHITLRequest: (request: HITLRequest) => Promise<HITLResponse>;
  onSessionComplete: (summary: ExecutionSummary) => void;
  onError: (error: ErrorEvent) => void;
}

export interface HITLApprovalModalProps {
  request: HITLRequest;
  isOpen: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onModify: (modifications: Record<string, unknown>) => void;
  onClose: () => void;
}

export interface ExecutionPlanViewerProps {
  plan: ExecutionPlan;
  currentStep: number;
  showDetails: boolean;
  onStepClick?: (step: ExecutionStep) => void;
}

export interface AgentHierarchyViewerProps {
  executions: AgentExecution[];
  rootExecutionId: string;
  highlightedId?: string;
  onAgentClick?: (execution: AgentExecution) => void;
}

export interface ProgressTrackerProps {
  session: Mode3Session;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

export interface ReasoningTraceProps {
  steps: ReasoningStep[];
  showTimestamps: boolean;
  expandedByDefault: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface Mode3APIResponse {
  success: boolean;
  session_id: string;
  message?: string;
  error?: string;
}

export interface Mode3SessionResponse extends Mode3APIResponse {
  session: Mode3Session;
}

export interface Mode3HITLResponseAPI extends Mode3APIResponse {
  checkpoint: HITLCheckpoint;
  next_action?: 'continue' | 'wait' | 'complete';
}

// ============================================================================
// NEW: Canonical 4 HITL Checkpoint Journey Types (December 2025)
// ============================================================================

/**
 * Mission Goal - Parsed from user prompt by L1 orchestrator
 * Supports editing, reordering, and priority assignment
 */
export interface MissionGoal {
  id: string;
  text: string;
  priority: number; // 1-5, where 5 is highest
  category?: 'research' | 'analysis' | 'synthesis' | 'comparison' | 'validation' | 'custom';
  extracted_from?: string; // Original prompt text this was extracted from
  order: number;
  confidence?: number; // L1 confidence in extraction (0-1)
}

/**
 * Plan Step - Individual action within a phase
 */
export interface PlanStep {
  id: string;
  name: string;
  description: string;
  estimated_duration_minutes: number;
  dependencies: string[]; // Step IDs this depends on
  assigned_to?: string; // Agent name
  tools_required?: string[];
  order: number;
}

/**
 * Plan Phase - Multi-step execution phase
 */
export interface PlanPhase {
  id: string;
  name: string;
  description: string;
  steps: PlanStep[];
  estimated_duration_minutes: number;
  order: number;
  parallel_allowed?: boolean;
}

/**
 * Team Member - Agent assigned to mission
 */
export interface TeamMember {
  id: string;
  agent_id: string;
  agent_name: string;
  role: string;
  responsibilities: string[];
  avatar?: string;
  tier?: 1 | 2 | 3;
}

/**
 * Loop Configuration - Controls iteration and refinement
 */
export interface LoopConfig {
  max_iterations: number;
  convergence_threshold: number;
  enable_auto_refinement: boolean;
  refinement_loops?: number;
  verification_loops?: number;
}

/**
 * Deliverable - Mission output artifact
 */
export interface Deliverable {
  id: string;
  name: string;
  type: 'markdown' | 'csv' | 'json' | 'bibtex' | 'pdf' | 'pptx';
  status: 'pending' | 'generating' | 'generated' | 'approved' | 'revision_requested';
  quality_score?: number; // 0-100
  content?: string;
  file_url?: string;
  preview?: string;
  revision_count?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Mission Configuration - Complete mission setup
 */
export interface MissionConfig {
  goals: MissionGoal[];
  plan: PlanPhase[];
  team: TeamMember[];
  loops: LoopConfig;
  deliverables: Deliverable[];
  variables: Record<string, unknown>;
  metadata?: {
    mission_name?: string;
    description?: string;
    created_at?: string;
    estimated_total_duration?: number;
    estimated_cost?: number;
  };
  budget_limit?: number;
  time_limit_minutes?: number;
  quality_threshold?: number;
}

/**
 * Mission Draft - Saved mission configuration before launch
 */
export interface MissionDraft {
  id: string;
  user_id: string;
  tenant_id: string;
  name: string;
  config: Partial<MissionConfig>;
  checkpoint: CanonicalCheckpoint;
  original_prompt?: string;
  agent_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Mission Template - Reusable mission configuration
 */
export interface MissionTemplate {
  id: string;
  name: string;
  description: string;
  config: Partial<MissionConfig>;
  category?: string;
  tags?: string[];
  created_by: string;
  tenant_id: string;
  is_public?: boolean;
  created_at: string;
  usage_count: number;
}

/**
 * Canonical 4 HITL Checkpoint Types
 * These are the pre-execution checkpoints for the new user journey
 */
export type CanonicalCheckpoint =
  | 'goal_confirmation'      // HITL 1: Review/edit parsed goals
  | 'plan_confirmation'      // HITL 2: Review/edit generated plan
  | 'mission_validation'     // HITL 3: Final review before launch
  | 'deliverable_confirmation'; // HITL 4: Accept or request revision

/**
 * Mode 3 Orchestrator Phase - State machine phases
 */
export type Mode3OrchestratorPhase =
  | 'initial'                // Entry point
  | 'goal_parsing'           // L1 orchestrator parsing prompt
  | 'goal_confirmation'      // HITL 1 - User reviews goals
  | 'plan_generation'        // L1 orchestrator generating plan
  | 'plan_confirmation'      // HITL 2 - User reviews plan
  | 'team_assembly'          // L1 orchestrator assembling team
  | 'mission_validation'     // HITL 3 - Final pre-launch review
  | 'execution'              // Mission running (immutable plan)
  | 'deliverable_generation' // Generating outputs
  | 'deliverable_review'     // HITL 4 - User reviews deliverables
  | 'revision'               // Re-executing with feedback
  | 'completed'              // Mission finished successfully
  | 'failed'                 // Mission failed
  | 'cancelled';             // User cancelled

/**
 * Mode 3 Orchestrator State
 */
export interface Mode3OrchestratorState {
  phase: Mode3OrchestratorPhase;
  config: Partial<MissionConfig>;
  conversation_id?: string;
  mission_id?: string;
  original_prompt?: string;
  agent_id?: string;
  error?: string;
  is_loading: boolean;
  revision_feedback?: string;
  revision_count: number;
  max_revisions: number;
}

/**
 * SSE Events for Canonical 4 HITL Journey
 */
export type CanonicalSSEEventType =
  | 'goals_parsed'           // L1 finished parsing goals
  | 'plan_generated'         // L1 finished generating plan
  | 'team_assembled'         // L1 finished assembling team
  | 'checkpoint_reached'     // Waiting for user at HITL checkpoint
  | 'checkpoint_resolved'    // User responded to checkpoint
  | 'execution_started'      // Mission launch confirmed
  | 'execution_progress'     // Step-by-step progress
  | 'deliverables_ready'     // All outputs generated
  | 'revision_started'       // Revision round started
  | 'mission_completed'      // Successfully finished
  | 'mission_failed'         // Failed with error
  | 'draft_saved'            // Draft saved successfully
  | 'template_saved';        // Template saved successfully

export interface CanonicalSSEEvent {
  type: CanonicalSSEEventType;
  conversation_id: string;
  mission_id?: string;
  timestamp: string;
  payload: unknown;
  error?: string;
}

// ============================================================================
// HITL Checkpoint Component Props
// ============================================================================

export interface GoalConfirmationCheckpointProps {
  goals: MissionGoal[];
  originalPrompt?: string;
  onConfirm: (goals: MissionGoal[]) => void;
  onRefine: () => void;
  onStartOver: () => void;
  isLoading?: boolean;
}

export interface PlanConfirmationCheckpointProps {
  phases: PlanPhase[];
  estimatedDuration?: number;
  estimatedCost?: number;
  onConfirm: (phases: PlanPhase[]) => void;
  onRefine: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export interface MissionValidationCheckpointProps {
  config: MissionConfig;
  onLaunch: (config: MissionConfig) => void;
  onSaveDraft: (name: string, config: MissionConfig) => void;
  onSaveTemplate: (name: string, description: string, config: MissionConfig) => void;
  onEditSection: (section: 'goals' | 'plan' | 'team' | 'settings') => void;
  isLoading?: boolean;
}

export interface DeliverableConfirmationCheckpointProps {
  deliverables: Deliverable[];
  missionId: string;
  revisionCount: number;
  maxRevisions: number;
  onAccept: () => void;
  onRequestRevision: (feedback: string, deliverableIds?: string[]) => void;
  onDownload: (deliverableId: string) => void;
  onPreview: (deliverableId: string) => void;
  isLoading?: boolean;
}
