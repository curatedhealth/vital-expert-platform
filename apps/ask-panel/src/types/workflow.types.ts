/**
 * Extended Database Types - Workflow & Use Case Architecture
 * Adds types for the new digital health workflow system
 */

import { Json } from './database.types';

// ============================================================================
// WORKFLOW ENUMS
// ============================================================================

export type WorkflowStatus = 
  | 'draft'
  | 'active'
  | 'archived'
  | 'deprecated';

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'skipped';

export type AssignmentType =
  | 'PRIMARY_EXECUTOR'
  | 'CO_EXECUTOR'
  | 'VALIDATOR'
  | 'REVIEWER'
  | 'FALLBACK';

export type PersonaResponsibility =
  | 'APPROVE'
  | 'REVIEW'
  | 'PROVIDE_INPUT'
  | 'INFORM'
  | 'VALIDATE'
  | 'CONSULT';

export type ReviewTiming =
  | 'BEFORE_AGENT_RUNS'
  | 'AFTER_AGENT_RUNS'
  | 'PARALLEL'
  | 'ON_AGENT_ERROR';

export type UseCaseDomain =
  | 'CD'  // Clinical Development
  | 'MA'  // Market Access
  | 'RA'  // Regulatory Affairs
  | 'PD'  // Product Development
  | 'EG'  // Engagement
  | 'RWE' // Real-World Evidence
  | 'PMS' // Post-Market Surveillance;

export type ComplexityLevel =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'EXPERT';

// ============================================================================
// USE CASE INTERFACES
// ============================================================================

export interface UseCase {
  id: string;
  tenant_id: string;
  code: string;              // e.g., UC_MA_001
  unique_id: string;         // e.g., USC-MA-001
  title: string;
  description: string;
  domain: UseCaseDomain;
  complexity: ComplexityLevel;
  estimated_duration_minutes: number;
  prerequisites: string[];
  deliverables: string[];
  created_at: string;
  updated_at: string;
  metadata: Json;
}

// ============================================================================
// WORKFLOW INTERFACES
// ============================================================================

export interface Workflow {
  id: string;
  tenant_id: string;
  use_case_id: string;
  code?: string;
  unique_id: string;          // e.g., WFL-MA-001-001
  name: string;
  description: string;
  position: number;
  status?: WorkflowStatus;
  created_at: string;
  updated_at: string;
  metadata: Json;
}

export interface WorkflowWithUseCase extends Workflow {
  use_case: UseCase;
}

// ============================================================================
// TASK INTERFACES
// ============================================================================

export interface Task {
  id: string;
  tenant_id: string;
  workflow_id: string;
  code: string;               // e.g., TSK-MA-001-01
  unique_id: string;          // e.g., TSK-MA-001-01
  title: string;
  objective: string;
  position: number;
  status?: TaskStatus;
  created_at: string;
  updated_at: string;
  extra: Json;                // Task-specific metadata (complexity, duration, deliverable)
}

export interface TaskWithDetails extends Task {
  workflow: Workflow;
  dependencies: TaskDependency[];
  agents: TaskAgentAssignment[];
  personas: TaskPersonaAssignment[];
  tools: TaskToolMapping[];
  rag_sources: TaskRAGMapping[];
}

// ============================================================================
// ASSIGNMENT & MAPPING INTERFACES
// ============================================================================

export interface TaskDependency {
  id: string;
  tenant_id: string;
  task_id: string;
  depends_on_task_id: string;
  note?: string;
  created_at: string;
}

export interface TaskAgentAssignment {
  id: string;
  tenant_id: string;
  task_id: string;
  agent_id: string;
  assignment_type: AssignmentType;
  execution_order: number;
  requires_human_approval: boolean;
  max_retries: number;
  retry_strategy: string;
  is_parallel: boolean;
  approval_persona_code?: string;
  approval_stage?: string;
  on_failure: string;
  created_at: string;
  metadata: Json;
}

export interface TaskPersonaAssignment {
  id: string;
  tenant_id: string;
  task_id: string;
  persona_id: string;
  responsibility: PersonaResponsibility;
  review_timing: ReviewTiming;
  escalation_to_persona_code?: string;
  created_at: string;
  metadata: Json;
}

export interface TaskToolMapping {
  id: string;
  tenant_id: string;
  task_id: string;
  tool_id: string;
  connection_config: Json;
  created_at: string;
}

export interface TaskRAGMapping {
  id: string;
  tenant_id: string;
  task_id: string;
  rag_source_id: string;
  query_context: string;
  search_config: Json;
  created_at: string;
}

// ============================================================================
// FOUNDATION ENTITY INTERFACES
// ============================================================================

export interface Agent {
  id: string;
  tenant_id: string;
  code: string;               // e.g., AGT-WORKFLOW-ORCHESTRATOR
  name: string;
  description: string;
  agent_type: string;
  model_provider: string;
  model_name: string;
  system_prompt: string;
  capabilities: string[];
  created_at: string;
  updated_at: string;
  metadata: Json;
}

export interface Persona {
  id: string;
  tenant_id: string;
  code: string;               // e.g., P21_MA_DIR
  name: string;
  role: string;
  department: string;
  expertise: string[];
  responsibilities: string[];
  created_at: string;
  updated_at: string;
  metadata: Json;
}

export interface Tool {
  id: string;
  tenant_id: string;
  code: string;               // e.g., TOOL-STATISTICAL-SOFTWARE
  name: string;
  tool_type: string;
  description: string;
  api_endpoint?: string;
  authentication_method?: string;
  created_at: string;
  updated_at: string;
  metadata: Json;
}

export interface RAGSource {
  id: string;
  tenant_id: string;
  code: string;               // e.g., RAG-FDA-GUIDANCE
  name: string;
  source_type: string;
  description: string;
  content_url?: string;
  embedding_model?: string;
  created_at: string;
  updated_at: string;
  metadata: Json;
}

export interface Prompt {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
  metadata: Json;
}

// ============================================================================
// WORKFLOW EXECUTION INTERFACES
// ============================================================================

export interface WorkflowExecution {
  id: string;
  tenant_id: string;
  workflow_id: string;
  user_id: string;
  status: TaskStatus;
  started_at: string;
  completed_at?: string;
  metadata: Json;
}

export interface TaskExecution {
  id: string;
  tenant_id: string;
  workflow_execution_id: string;
  task_id: string;
  agent_id?: string;
  status: TaskStatus;
  started_at: string;
  completed_at?: string;
  result: Json;
  error_message?: string;
  metadata: Json;
}

// ============================================================================
// AGGREGATED VIEW TYPES
// ============================================================================

export interface UseCaseWithWorkflows extends UseCase {
  workflows: Workflow[];
  total_tasks: number;
  total_duration_minutes: number;
}

export interface WorkflowWithTasks extends Workflow {
  tasks: Task[];
  use_case: UseCase;
}

export interface UseCaseSummary {
  domain: UseCaseDomain;
  count: number;
  use_cases: Pick<UseCase, 'code' | 'title' | 'complexity'>[];
}

// ============================================================================
// QUERY FILTER TYPES
// ============================================================================

export interface UseCaseFilters {
  domain?: UseCaseDomain;
  complexity?: ComplexityLevel;
  search?: string;
}

export interface WorkflowFilters {
  use_case_id?: string;
  status?: WorkflowStatus;
}

export interface TaskFilters {
  workflow_id?: string;
  status?: TaskStatus;
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface DomainStatistics {
  domain: UseCaseDomain;
  use_case_count: number;
  workflow_count: number;
  task_count: number;
  total_duration_minutes: number;
  complexity_breakdown: {
    BEGINNER: number;
    INTERMEDIATE: number;
    ADVANCED: number;
    EXPERT: number;
  };
}

export interface FoundationStatistics {
  total_agents: number;
  total_personas: number;
  total_tools: number;
  total_rag_sources: number;
  total_prompts: number;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  // Re-export from database.types
  Json,
};

