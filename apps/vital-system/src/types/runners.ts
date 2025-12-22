// PRODUCTION_TAG: PRODUCTION_READY
// LAST_VERIFIED: 2025-12-19
// PURPOSE: TypeScript types for VITAL Runners system (88 task + 8 family runners)

/**
 * Runner types for VITAL platform.
 *
 * Runners are the atomic cognitive operations that power VITAL's AI:
 * - Task Runners (88): Single-purpose cognitive operations (30s-3min)
 * - Family Runners (8): Complex multi-step workflows (5-30min)
 * - Orchestrators: Coordinate multiple runners (for L4-L5)
 */

// =============================================================================
// Core Types
// =============================================================================

export type RunnerType = 'task' | 'family' | 'orchestrator';

export type AIIntervention =
  | 'ASSIST'      // Human-led, AI supports
  | 'AUGMENT'     // Human-led, AI enhances
  | 'AUTOMATE'    // AI-led, human approves
  | 'ORCHESTRATE' // AI coordinates multiple agents
  | 'REDESIGN';   // AI transforms the process

export type JTBDLevel =
  | 'strategic'  // L5: Multi-month initiatives
  | 'solution'   // L4: Multi-week projects
  | 'workflow'   // L3: Multi-hour workflows
  | 'task';      // L1-L2: Minutes-to-hours tasks

export type JobStep =
  | 'define'     // Determine objectives and plan approach
  | 'locate'     // Gather items and information needed
  | 'prepare'    // Set up environment to do the job
  | 'confirm'    // Verify ready to perform the job
  | 'execute'    // Carry out the job
  | 'monitor'    // Verify job is being successfully executed
  | 'modify'     // Make alterations to improve execution
  | 'conclude';  // Finish the job or prepare for next

// =============================================================================
// Runner Information
// =============================================================================

export interface RunnerInfo {
  runner_id: string;
  name: string;
  runner_type: RunnerType;
  category?: string;           // For task runners: UNDERSTAND, EVALUATE, etc.
  family?: string;             // For family runners: DEEP_RESEARCH, STRATEGY, etc.
  description?: string;
  service_layers: string[];    // L1, L2, L3, L4, L5
  ai_intervention?: AIIntervention;
  algorithmic_core?: string;   // CoT, ToT, MCDA, etc.
}

export interface FamilyRunnerInfo {
  family: string;
  name: string;
  reasoning_pattern: string;
  description?: string;
}

// =============================================================================
// API Responses
// =============================================================================

export interface RunnerListResponse {
  runners: RunnerInfo[];
  total: number;
  runner_type?: string;
  category?: string;
}

export interface RunnerDetailResponse {
  runner_id: string;
  name: string;
  runner_type: string;
  category?: string;
  family?: string;
  description?: string;
  service_layers: string[];
  ai_intervention?: string;
  algorithmic_core?: string;
}

// =============================================================================
// Execution Types
// =============================================================================

export interface RunnerExecuteRequest {
  input_data: Record<string, unknown>;
  session_id?: string;
  trace_id?: string;
  timeout_seconds?: number;
}

export interface RunnerExecuteResponse {
  runner_id: string;
  execution_id: string;
  success: boolean;
  output?: Record<string, unknown>;
  confidence_score: number;
  quality_score: number;
  execution_time_ms: number;
  tokens_used: number;
  error?: string;
}

// =============================================================================
// JTBD Mapping Types
// =============================================================================

export interface JTBDRunnerMapping {
  jtbd_level: JTBDLevel;
  job_step: JobStep;
  runner_id: string;
  runner_type: RunnerType;
  category?: string;
  service_layer: string;
  ai_intervention: AIIntervention;
}

export interface JTBDRunnerMatrix {
  [level: string]: {
    [step: string]: JTBDRunnerMapping;
  };
}

// =============================================================================
// Constants: 22 Cognitive Categories
// =============================================================================

export const RUNNER_CATEGORIES = [
  'UNDERSTAND',   // Extract, comprehend, classify, summarize
  'EVALUATE',     // Score, compare, rank, critique
  'DECIDE',       // Frame, choose, prioritize
  'INVESTIGATE',  // Trace, diagnose, audit
  'WATCH',        // Monitor, detect, alert
  'SOLVE',        // Troubleshoot, resolve, optimize
  'PREPARE',      // Setup, configure, initialize
  'CREATE',       // Generate, compose, design
  'REFINE',       // Edit, improve, polish
  'VALIDATE',     // Check, verify, test
  'SYNTHESIZE',   // Combine, integrate, consolidate
  'PLAN',         // Schedule, roadmap, decompose
  'PREDICT',      // Forecast, model, estimate
  'ENGAGE',       // Communicate, present, respond
  'ALIGN',        // Coordinate, synchronize, harmonize
  'INFLUENCE',    // Persuade, negotiate, advocate
  'ADAPT',        // Pivot, adjust, transform
  'DISCOVER',     // Explore, research, uncover
  'DESIGN',       // Architect, prototype, model
  'GOVERN',       // Policy, compliance, standards
  'SECURE',       // Protect, encrypt, audit
  'EXECUTE',      // Run, deploy, implement
] as const;

export type RunnerCategory = typeof RUNNER_CATEGORIES[number];

// =============================================================================
// Constants: 8 Family Runner Types
// =============================================================================

export const FAMILY_TYPES = [
  {
    id: 'DEEP_RESEARCH',
    name: 'Deep Research Runner',
    pattern: 'ToT → CoT → Reflection',
    description: 'Tree-of-Thought exploration followed by Chain-of-Thought synthesis and self-reflection'
  },
  {
    id: 'STRATEGY',
    name: 'Strategy Runner',
    pattern: 'Scenario → SWOT → Roadmap',
    description: 'Scenario planning with SWOT analysis leading to actionable roadmap'
  },
  {
    id: 'EVALUATION',
    name: 'Evaluation Runner',
    pattern: 'MCDA Scoring',
    description: 'Multi-Criteria Decision Analysis with weighted scoring'
  },
  {
    id: 'INVESTIGATION',
    name: 'Investigation Runner',
    pattern: 'RCA → Bayesian',
    description: 'Root Cause Analysis with Bayesian probability reasoning'
  },
  {
    id: 'PROBLEM_SOLVING',
    name: 'Problem Solving Runner',
    pattern: 'Hypothesis → Test → Iterate',
    description: 'Scientific method-based hypothesis testing and iteration'
  },
  {
    id: 'COMMUNICATION',
    name: 'Communication Runner',
    pattern: 'Audience → Format → Review',
    description: 'Audience-aware content creation with format optimization'
  },
  {
    id: 'MONITORING',
    name: 'Monitoring Runner',
    pattern: 'Baseline → Delta → Alert',
    description: 'Continuous monitoring with delta detection and alerting'
  },
  {
    id: 'GENERIC',
    name: 'Generic Runner',
    pattern: 'Plan → Execute → Review',
    description: 'Standard step-by-step execution for general workflows'
  },
] as const;

export type FamilyType = typeof FAMILY_TYPES[number]['id'];

// =============================================================================
// Constants: JTBD Levels with Metadata
// =============================================================================

export const JTBD_LEVELS = [
  {
    id: 'strategic' as JTBDLevel,
    name: 'Strategic',
    serviceLayer: 'L5',
    duration: 'Months-Years',
    description: 'Big Hire - Enterprise transformation initiatives'
  },
  {
    id: 'solution' as JTBDLevel,
    name: 'Solution',
    serviceLayer: 'L4',
    duration: 'Weeks-Months',
    description: 'Capability delivery - Multi-week projects'
  },
  {
    id: 'workflow' as JTBDLevel,
    name: 'Workflow',
    serviceLayer: 'L3',
    duration: 'Hours-Days',
    description: 'Process Job - Multi-step workflows'
  },
  {
    id: 'task' as JTBDLevel,
    name: 'Task',
    serviceLayer: 'L1-L2',
    duration: 'Minutes-Hours',
    description: 'Little Hire - Atomic operations'
  },
] as const;

// =============================================================================
// Constants: Job Steps (Ulwick's 8 Universal Steps)
// =============================================================================

export const JOB_STEPS = [
  { id: 'define' as JobStep, name: 'Define', description: 'Determine objectives and plan approach' },
  { id: 'locate' as JobStep, name: 'Locate', description: 'Gather items and information needed' },
  { id: 'prepare' as JobStep, name: 'Prepare', description: 'Set up environment to do the job' },
  { id: 'confirm' as JobStep, name: 'Confirm', description: 'Verify ready to perform the job' },
  { id: 'execute' as JobStep, name: 'Execute', description: 'Carry out the job' },
  { id: 'monitor' as JobStep, name: 'Monitor', description: 'Verify job is being successfully executed' },
  { id: 'modify' as JobStep, name: 'Modify', description: 'Make alterations to improve execution' },
  { id: 'conclude' as JobStep, name: 'Conclude', description: 'Finish the job or prepare for next' },
] as const;

// =============================================================================
// Utility Types
// =============================================================================

export interface RunnerFilter {
  runner_type?: RunnerType;
  category?: RunnerCategory;
  family?: FamilyType;
  ai_intervention?: AIIntervention;
}

export interface RunnerExecutionMetrics {
  execution_id: string;
  runner_id: string;
  execution_time_ms: number;
  tokens_used: number;
  cost_usd: number;
  confidence_score: number;
  quality_score: number;
  success: boolean;
}

// =============================================================================
// Type Guards
// =============================================================================

export function isTaskRunner(runner: RunnerInfo): boolean {
  return runner.runner_type === 'task';
}

export function isFamilyRunner(runner: RunnerInfo): boolean {
  return runner.runner_type === 'family';
}

export function isValidCategory(category: string): category is RunnerCategory {
  return RUNNER_CATEGORIES.includes(category as RunnerCategory);
}

export function isValidJTBDLevel(level: string): level is JTBDLevel {
  return ['strategic', 'solution', 'workflow', 'task'].includes(level);
}

export function isValidJobStep(step: string): step is JobStep {
  return ['define', 'locate', 'prepare', 'confirm', 'execute', 'monitor', 'modify', 'conclude'].includes(step);
}
