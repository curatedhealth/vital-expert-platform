/**
 * VITAL Platform - Mission Runner Types
 *
 * Comprehensive type definitions for the Mission Runner system.
 * Aligned with: services/ai-engine/docs/FRONTEND_INTEGRATION_REFERENCE.md
 *
 * This file contains all TypeScript interfaces for:
 * - Runner categories and domains
 * - Mission templates and execution
 * - SSE event types for streaming
 * - Gallery display types
 * - Filter types
 *
 * Phase 3 Implementation - December 11, 2025
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

/**
 * Runner Categories (22 Core Types)
 * Cognitive capabilities that runners can perform
 */
export type RunnerCategory =
  | 'understand'    // Comprehension, interpretation
  | 'evaluate'      // Assessment, scoring, grading
  | 'decide'        // Decision support, recommendations
  | 'investigate'   // Research, evidence gathering
  | 'watch'         // Monitoring, surveillance
  | 'solve'         // Problem-solving
  | 'prepare'       // Preparation, planning
  | 'create'        // Content generation
  | 'refine'        // Improvement, optimization
  | 'validate'      // Verification, compliance
  | 'synthesize'    // Integration, summarization
  | 'plan'          // Strategic planning, decomposition
  | 'predict'       // Forecasting, anticipation
  | 'engage'        // Stakeholder engagement
  | 'align'         // Alignment, coordination
  | 'influence'     // Persuasion, advocacy
  | 'adapt'         // Adaptation, flexibility
  | 'discover'      // Discovery, exploration
  | 'design'        // Design thinking, UX
  | 'govern'        // Governance, policies
  | 'secure'        // Security, compliance
  | 'execute';      // Execution, implementation

/**
 * Pharmaceutical Domains (6 Families)
 * Industry-specific specializations
 */
export type PharmaDomain =
  | 'foresight'        // Trend analysis, competitive intelligence
  | 'brand_strategy'   // Commercial positioning, messaging
  | 'digital_health'   // DTx, RWE, patient engagement
  | 'medical_affairs'  // KOL engagement, MSL, scientific comms
  | 'market_access'    // HEOR, pricing, reimbursement
  | 'design_thinking'; // Human-centered design

/**
 * Knowledge Layers for context retrieval
 */
export type KnowledgeLayer =
  | 'industry'    // L0: Cross-industry knowledge
  | 'function'    // L1: Function-specific (Medical Affairs, Commercial)
  | 'specialty';  // L2: Deep specialty (Oncology, Rare Disease)

/**
 * Quality Metrics for runner output evaluation
 */
export type QualityMetric =
  | 'relevance'
  | 'accuracy'
  | 'comprehensiveness'
  | 'expression'
  | 'faithfulness'
  | 'coverage'
  | 'timeliness'
  | 'confidence';

/**
 * Mission Families (8 Categories)
 */
export type MissionFamily =
  | 'DEEP_RESEARCH'    // Comprehensive research missions
  | 'EVALUATION'       // Assessment and benchmarking
  | 'INVESTIGATION'    // Due diligence, forensics
  | 'STRATEGY'         // Strategic planning and decisions
  | 'PREPARATION'      // Case building, document prep
  | 'MONITORING'       // Ongoing surveillance
  | 'PROBLEM_SOLVING'  // Finding alternatives, solutions
  | 'GENERIC';         // Fallback for unmatched queries

/**
 * Mission Complexity Levels
 */
export type MissionComplexity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Checkpoint Types for HITL control
 * Aligned with v5 spec: 5 canonical checkpoint types
 *
 * - plan_approval: Before executing generated plan
 * - tool_approval: Before using sensitive tools (e.g., external API calls)
 * - sub_agent_approval: Before spawning L3/L4 subagents
 * - critical_decision: At important decision junctures
 * - final_review: Before completing mission with final deliverables
 */
export type CheckpointType =
  | 'plan_approval'
  | 'tool_approval'
  | 'sub_agent_approval'
  | 'critical_decision'
  | 'final_review';

/**
 * Mission Status
 */
export type MissionStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed';

/**
 * Agent Level (Hierarchy)
 */
export type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

// =============================================================================
// RUNNER TYPES
// =============================================================================

/**
 * Runner Definition
 */
export interface Runner {
  id: string;               // e.g., "investigate_basic"
  name: string;             // e.g., "Investigate Runner"
  category: RunnerCategory;
  domain?: PharmaDomain;    // Only for pharma runners
  description: string;
  requiredKnowledgeLayers?: KnowledgeLayer[];
  qualityMetrics?: QualityMetric[];
  version: string;
  isActive: boolean;
}

/**
 * Runner Input for execution
 */
export interface RunnerInput {
  task: string;
  context: Record<string, unknown>;
  personaId?: string;
  knowledgeLayers: KnowledgeLayer[];
  constraints: Record<string, unknown>;
  previousResults: RunnerResult[];
  maxIterations: number;    // default: 3
  qualityThreshold: number; // default: 0.80
  streamTokens: boolean;
}

/**
 * Runner Result
 */
export interface RunnerResult {
  runnerId: string;
  result: unknown;
  confidence: number;
  qualityScores: Record<QualityMetric, number>;
  iterationsUsed: number;
  tokensUsed: number;
  durationMs: number;
}

/**
 * Runner Output (full response)
 */
export interface RunnerOutput {
  result: unknown;
  confidence: number;
  qualityScores: Record<QualityMetric, number>;
  sources: Source[];
  artifacts: Artifact[];
  iterationsUsed: number;
  tokensUsed: number;
  costUsd: number;
  durationMs: number;
  metadata: Record<string, unknown>;
}

// =============================================================================
// MISSION TYPES
// =============================================================================

/**
 * Mission Template (from database)
 */
export interface MissionTemplate {
  id: string;               // e.g., "deep_dive"
  name: string;             // e.g., "Deep Dive Analysis"
  family: MissionFamily;
  category: string;
  description: string;
  longDescription?: string;
  complexity: MissionComplexity;
  estimatedDurationMin: number;
  estimatedDurationMax: number;
  estimatedCostMin: number;
  estimatedCostMax: number;
  requiredAgentTiers: AgentLevel[];
  recommendedAgents: string[];
  minAgents: number;
  maxAgents: number;
  tasks: MissionTask[];
  checkpoints: Checkpoint[];
  requiredInputs: InputField[];
  optionalInputs: InputField[];
  outputs: OutputField[];
  tags: string[];
  useCases: string[];
  exampleQueries: string[];
  workflowConfig: Record<string, unknown>;
  toolRequirements: ToolRequirement[];
  mode4Constraints: Mode4Constraints;
  isActive: boolean;
  version: string;
}

/**
 * Mission Task (step within a mission)
 */
export interface MissionTask {
  id: string;
  name: string;
  description: string;
  assignedLevel: AgentLevel;
  assignedArchetype?: string;
  estimatedMinutes: number;
  required: boolean;
  tools?: string[];
  status?: 'pending' | 'active' | 'complete' | 'failed' | 'skipped';
  output?: unknown;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Checkpoint Definition
 */
export interface Checkpoint {
  id: string;
  name: string;
  type: CheckpointType;
  afterTask: string;
  description?: string;
  options?: string[];
  timeoutMinutes?: number;
  requiresApproval?: boolean;
}

/**
 * Input Field Definition
 */
export interface InputField {
  name: string;
  type: 'string' | 'array' | 'number' | 'boolean' | 'file' | 'object' | 'text' | 'textarea' | 'select' | 'multiselect';
  description: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: unknown;
}

/**
 * Output Field Definition
 */
export interface OutputField {
  name: string;
  type: 'markdown' | 'document' | 'table' | 'array' | 'structured_data' | 'file' | 'number' | 'object';
  description: string;
}

/**
 * Tool Requirement
 */
export interface ToolRequirement {
  toolId: string;
  required: boolean;
  purpose: string;
}

/**
 * Mode 4 (Background) Constraints
 */
export interface Mode4Constraints {
  maxCost: number;
  maxApiCalls: number;
  maxIterations: number;
  allowAutoContinue: boolean;
  maxWallTimeMinutes: number;
  budgetWarningThreshold?: number;
  qualityCheckpointInterval?: number;
}

/**
 * Source Reference
 */
export interface Source {
  id: string;
  title: string;
  url?: string;
  type: 'publication' | 'website' | 'database' | 'internal' | 'api';
  citation?: string;
  relevanceScore?: number;
  retrievedAt?: string;
}

/**
 * Artifact (generated output)
 */
export interface Artifact {
  id: string;
  name: string;
  type: 'document' | 'table' | 'chart' | 'summary' | 'analysis' | 'presentation' | 'data';
  format: string;
  content?: unknown;
  url?: string;
  size?: number;
  createdAt: string;
}

/**
 * Active Mission Instance
 */
export interface Mission {
  id: string;
  templateId: string;
  template?: MissionTemplate;
  agentId: string;
  tenantId: string;
  goal: string;
  inputs: Record<string, unknown>;
  status: MissionStatus;
  currentTaskId?: string;
  completedTasks: string[];
  outputs?: Record<string, unknown>;
  artifacts: Artifact[];
  sources: Source[];
  totalCost: number;
  totalTokens: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  createdAt: string;
}

/**
 * Mission Configuration (user-provided)
 */
export interface MissionConfig {
  inputs: Record<string, unknown>;
  autonomyBand: 'supervised' | 'guided' | 'autonomous';
  checkpointOverrides?: Record<string, boolean>;
  maxBudget?: number;
  deadline?: Date;
}

// =============================================================================
// SSE EVENT TYPES
// =============================================================================

/**
 * Mission SSE Events (15+ types)
 */
export type MissionEvent =
  | { event: 'mission_started'; missionId: string; templateId: string }
  | { event: 'task_started'; taskId: string; taskName: string; level: AgentLevel }
  | { event: 'task_progress'; taskId: string; progress: number; message: string }
  | { event: 'task_completed'; taskId: string; output: unknown; durationMs: number }
  | { event: 'checkpoint_reached'; checkpointId: string; type: CheckpointType; requiresApproval: boolean }
  | { event: 'checkpoint_resolved'; checkpointId: string; decision: string }
  | { event: 'delegation'; fromAgent: string; toAgent: string; reason: string }
  | { event: 'thinking'; agentId: string; content: string }
  | { event: 'reasoning'; step: number; content: string }
  | { event: 'artifact_created'; artifactId: string; type: string; name: string }
  | { event: 'source_found'; sourceId: string; title: string; url?: string }
  | { event: 'quality_score'; metric: QualityMetric; score: number }
  | { event: 'budget_warning'; currentCost: number; maxCost: number; percentage: number }
  | { event: 'mission_completed'; outputs: unknown; totalCost: number; totalDuration: number }
  | { event: 'mission_failed'; error: string; failedTask?: string }
  | { event: 'mission_paused'; reason: string; checkpointId?: string };

/**
 * Runner SSE Events
 */
export type RunnerEvent =
  | { event: 'start'; runnerId: string; category: RunnerCategory }
  | { event: 'iteration_start'; iteration: number }
  | { event: 'token'; content: string }
  | { event: 'iteration_complete'; iteration: number; quality: number }
  | { event: 'complete'; result: unknown; confidence: number; qualityScores: Record<string, number> };

// =============================================================================
// GALLERY DISPLAY TYPES
// =============================================================================

/**
 * Runner Card (for gallery display)
 */
export interface RunnerCard {
  id: string;
  name: string;
  category: RunnerCategory;
  domain?: PharmaDomain;
  description: string;
  icon: string;             // Icon path or emoji
  color: string;            // Tailwind color class
  variant: 'basic' | 'advanced';
  tags: string[];
}

/**
 * Mission Card (for gallery display)
 */
export interface MissionCard {
  id: string;
  name: string;
  family: MissionFamily;
  category: string;
  description: string;
  complexity: MissionComplexity;
  durationRange: string;    // "30-60 min"
  costRange: string;        // "$2-$5"
  tags: string[];
  popularityScore?: number;
}

// =============================================================================
// FILTER TYPES
// =============================================================================

/**
 * Runner Gallery Filters
 */
export interface RunnerFilters {
  categories?: RunnerCategory[];
  domains?: PharmaDomain[];
  variant?: 'basic' | 'advanced' | 'all';
  searchQuery?: string;
}

/**
 * Mission Gallery Filters
 */
export interface MissionFilters {
  families?: MissionFamily[];
  complexity?: MissionComplexity[];
  maxDuration?: number;
  maxCost?: number;
  searchQuery?: string;
  tags?: string[];
}

// =============================================================================
// COLOR SCHEMES
// =============================================================================

/**
 * Category Colors (Tailwind classes)
 */
export const CATEGORY_COLORS: Record<RunnerCategory, string> = {
  understand: 'bg-purple-500',
  evaluate: 'bg-violet-500',
  decide: 'bg-amber-500',
  investigate: 'bg-emerald-500',
  watch: 'bg-cyan-500',
  solve: 'bg-rose-500',
  prepare: 'bg-indigo-500',
  create: 'bg-pink-500',
  refine: 'bg-lime-500',
  validate: 'bg-green-500',
  synthesize: 'bg-teal-500',
  plan: 'bg-orange-500',
  predict: 'bg-fuchsia-500',
  engage: 'bg-fuchsia-600',
  align: 'bg-violet-600',
  influence: 'bg-red-500',
  adapt: 'bg-yellow-500',
  discover: 'bg-purple-600',
  design: 'bg-pink-600',
  govern: 'bg-stone-500',
  secure: 'bg-stone-600',
  execute: 'bg-emerald-600',
};

/**
 * Domain Colors (Gradient classes)
 */
export const DOMAIN_COLORS: Record<PharmaDomain, string> = {
  foresight: 'bg-gradient-to-r from-purple-500 to-indigo-500',
  brand_strategy: 'bg-gradient-to-r from-orange-500 to-red-500',
  digital_health: 'bg-gradient-to-r from-cyan-500 to-violet-500',
  medical_affairs: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  market_access: 'bg-gradient-to-r from-amber-500 to-yellow-500',
  design_thinking: 'bg-gradient-to-r from-pink-500 to-rose-500',
};

/**
 * Family Colors
 */
export const FAMILY_COLORS: Record<MissionFamily, string> = {
  DEEP_RESEARCH: 'bg-purple-600',
  EVALUATION: 'bg-violet-600',
  INVESTIGATION: 'bg-red-600',
  STRATEGY: 'bg-amber-600',
  PREPARATION: 'bg-indigo-600',
  MONITORING: 'bg-cyan-600',
  PROBLEM_SOLVING: 'bg-emerald-600',
  GENERIC: 'bg-stone-500',
};

/**
 * Complexity Badge Styles
 */
export const COMPLEXITY_BADGES: Record<MissionComplexity, { bg: string; text: string }> = {
  low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300' },
  critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
};

// =============================================================================
// MOCK DATA (24 Runners)
// =============================================================================

/**
 * All 24 Mission Runners
 * 12 Core Cognitive + 12 Pharmaceutical Domain
 */
export const RUNNERS: Runner[] = [
  // Core Cognitive Runners (12)
  { id: 'critique_basic', name: 'Critique Runner', category: 'evaluate', description: 'Critical analysis and gap identification', version: '1.0.0', isActive: true },
  { id: 'critique_advanced', name: 'Advanced Critique Runner', category: 'evaluate', description: 'In-depth critique with bias analysis', version: '1.0.0', isActive: true },
  { id: 'synthesize_basic', name: 'Synthesize Runner', category: 'synthesize', description: 'Information integration and summarization', version: '1.0.0', isActive: true },
  { id: 'synthesize_advanced', name: 'Advanced Synthesize Runner', category: 'synthesize', description: 'Multi-source synthesis with conflict resolution', version: '1.0.0', isActive: true },
  { id: 'decompose_basic', name: 'Decompose Runner', category: 'plan', description: 'Task breakdown into subtasks', version: '1.0.0', isActive: true },
  { id: 'decompose_advanced', name: 'Advanced Decompose Runner', category: 'plan', description: 'Complex decomposition with resource estimation', version: '1.0.0', isActive: true },
  { id: 'investigate_basic', name: 'Investigate Runner', category: 'investigate', description: 'Multi-source research with evidence validation', version: '1.0.0', isActive: true },
  { id: 'investigate_advanced', name: 'Advanced Investigate Runner', category: 'investigate', description: 'Deep search with cross-referencing', version: '1.0.0', isActive: true },
  { id: 'validate_basic', name: 'Validate Runner', category: 'validate', description: 'Verification and compliance checking', version: '1.0.0', isActive: true },
  { id: 'validate_advanced', name: 'Advanced Validate Runner', category: 'validate', description: 'Multi-standard validation', version: '1.0.0', isActive: true },
  { id: 'recommend_basic', name: 'Recommend Runner', category: 'decide', description: 'Actionable recommendations', version: '1.0.0', isActive: true },
  { id: 'recommend_advanced', name: 'Advanced Recommend Runner', category: 'decide', description: 'Strategic recommendations with scenario analysis', version: '1.0.0', isActive: true },

  // Pharmaceutical Domain Runners (12)
  { id: 'foresight_basic', name: 'Foresight Runner', category: 'investigate', domain: 'foresight', description: 'Trend analysis and signal detection', version: '1.0.0', isActive: true },
  { id: 'foresight_advanced', name: 'Advanced Foresight Runner', category: 'investigate', domain: 'foresight', description: 'Strategic forecasting with scenario planning', version: '1.0.0', isActive: true },
  { id: 'brand_strategy_basic', name: 'Brand Strategy Runner', category: 'create', domain: 'brand_strategy', description: 'Brand positioning and messaging', version: '1.0.0', isActive: true },
  { id: 'brand_strategy_advanced', name: 'Advanced Brand Strategy Runner', category: 'create', domain: 'brand_strategy', description: 'Omnichannel planning and lifecycle management', version: '1.0.0', isActive: true },
  { id: 'digital_health_basic', name: 'Digital Health Runner', category: 'design', domain: 'digital_health', description: 'DTx strategy and RWE generation', version: '1.0.0', isActive: true },
  { id: 'digital_health_advanced', name: 'Advanced Digital Health Runner', category: 'design', domain: 'digital_health', description: 'AI/ML integration and ecosystem strategy', version: '1.0.0', isActive: true },
  { id: 'medical_affairs_basic', name: 'Medical Affairs Runner', category: 'engage', domain: 'medical_affairs', description: 'KOL engagement and MSL activities', version: '1.0.0', isActive: true },
  { id: 'medical_affairs_advanced', name: 'Advanced Medical Affairs Runner', category: 'engage', domain: 'medical_affairs', description: 'Strategic medical planning', version: '1.0.0', isActive: true },
  { id: 'market_access_basic', name: 'Market Access Runner', category: 'evaluate', domain: 'market_access', description: 'HEOR strategy and reimbursement analysis', version: '1.0.0', isActive: true },
  { id: 'market_access_advanced', name: 'Advanced Market Access Runner', category: 'evaluate', domain: 'market_access', description: 'Multi-market access with value dossier', version: '1.0.0', isActive: true },
  { id: 'design_thinking_basic', name: 'Design Thinking Runner', category: 'design', domain: 'design_thinking', description: 'Human-centered design for healthcare', version: '1.0.0', isActive: true },
  { id: 'design_thinking_advanced', name: 'Advanced Design Thinking Runner', category: 'design', domain: 'design_thinking', description: 'Service design with innovation strategy', version: '1.0.0', isActive: true },
];

/**
 * Default Mission Templates (20+)
 */
export const DEFAULT_MISSION_TEMPLATES: Partial<MissionTemplate>[] = [
  {
    id: 'deep_dive',
    name: 'Deep Dive Analysis',
    family: 'DEEP_RESEARCH',
    category: 'Research',
    description: 'Comprehensive multi-source research with evidence synthesis',
    complexity: 'high',
    estimatedDurationMin: 45,
    estimatedDurationMax: 90,
    estimatedCostMin: 2.50,
    estimatedCostMax: 8.00,
    tags: ['research', 'analysis', 'evidence'],
  },
  {
    id: 'comprehensive_analysis',
    name: 'Comprehensive Analysis',
    family: 'DEEP_RESEARCH',
    category: 'Research',
    description: 'Full-spectrum analysis with cross-referencing and trend identification',
    complexity: 'critical',
    estimatedDurationMin: 90,
    estimatedDurationMax: 180,
    estimatedCostMin: 5.00,
    estimatedCostMax: 15.00,
    tags: ['research', 'comprehensive', 'critical'],
  },
  {
    id: 'benchmark',
    name: 'Benchmark Analysis',
    family: 'EVALUATION',
    category: 'Analysis',
    description: 'Competitive benchmarking and comparative analysis',
    complexity: 'medium',
    estimatedDurationMin: 30,
    estimatedDurationMax: 60,
    estimatedCostMin: 2.00,
    estimatedCostMax: 5.00,
    tags: ['benchmark', 'competitive', 'comparison'],
  },
  {
    id: 'critique',
    name: 'Critique & Review',
    family: 'EVALUATION',
    category: 'Quality',
    description: 'Critical review with quality assessment and gap identification',
    complexity: 'medium',
    estimatedDurationMin: 20,
    estimatedDurationMax: 45,
    estimatedCostMin: 1.50,
    estimatedCostMax: 4.00,
    tags: ['critique', 'review', 'quality'],
  },
  {
    id: 'feasibility_study',
    name: 'Feasibility Study',
    family: 'EVALUATION',
    category: 'Analysis',
    description: 'Feasibility assessment with risk and opportunity analysis',
    complexity: 'high',
    estimatedDurationMin: 60,
    estimatedDurationMax: 120,
    estimatedCostMin: 4.00,
    estimatedCostMax: 12.00,
    tags: ['feasibility', 'risk', 'opportunity'],
  },
  {
    id: 'evaluation_rubric',
    name: 'Evaluation: Rubric Scoring',
    family: 'EVALUATION',
    category: 'Analysis',
    description: 'Score alternatives against a rubric and synthesize recommendations.',
    complexity: 'medium',
    estimatedDurationMin: 30,
    estimatedDurationMax: 60,
    estimatedCostMin: 2.00,
    estimatedCostMax: 6.00,
    tags: ['evaluation', 'rubric', 'scoring'],
  },
  {
    id: 'due_diligence',
    name: 'Due Diligence',
    family: 'INVESTIGATION',
    category: 'Analysis',
    description: 'Comprehensive due diligence investigation',
    complexity: 'critical',
    estimatedDurationMin: 120,
    estimatedDurationMax: 240,
    estimatedCostMin: 8.00,
    estimatedCostMax: 25.00,
    tags: ['due-diligence', 'investigation', 'compliance'],
  },
  {
    id: 'failure_forensics',
    name: 'Failure Forensics',
    family: 'INVESTIGATION',
    category: 'Analysis',
    description: 'Root cause analysis and failure investigation',
    complexity: 'high',
    estimatedDurationMin: 45,
    estimatedDurationMax: 90,
    estimatedCostMin: 3.00,
    estimatedCostMax: 8.00,
    tags: ['forensics', 'root-cause', 'failure'],
  },
  {
    id: 'investigation_root_cause',
    name: 'Investigation: Root Cause Analysis',
    family: 'INVESTIGATION',
    category: 'Analysis',
    description: 'Generate hypotheses, gather evidence, and find root causes with recommendations.',
    complexity: 'high',
    estimatedDurationMin: 45,
    estimatedDurationMax: 90,
    estimatedCostMin: 3.00,
    estimatedCostMax: 9.00,
    tags: ['investigation', 'root-cause', 'rca'],
  },
  {
    id: 'decision_framing',
    name: 'Decision Framing',
    family: 'STRATEGY',
    category: 'Strategy',
    description: 'Structure complex decisions with options analysis',
    complexity: 'medium',
    estimatedDurationMin: 30,
    estimatedDurationMax: 60,
    estimatedCostMin: 2.00,
    estimatedCostMax: 5.00,
    tags: ['decision', 'strategy', 'options'],
  },
  {
    id: 'scenario_planning',
    name: 'Scenario Planning',
    family: 'STRATEGY',
    category: 'Strategy',
    description: 'Future scenario development and planning',
    complexity: 'high',
    estimatedDurationMin: 60,
    estimatedDurationMax: 120,
    estimatedCostMin: 4.00,
    estimatedCostMax: 10.00,
    tags: ['scenario', 'planning', 'future'],
  },
  {
    id: 'risk_assessment',
    name: 'Risk Assessment',
    family: 'STRATEGY',
    category: 'Analysis',
    description: 'Comprehensive risk identification and mitigation planning',
    complexity: 'high',
    estimatedDurationMin: 45,
    estimatedDurationMax: 90,
    estimatedCostMin: 3.00,
    estimatedCostMax: 8.00,
    tags: ['risk', 'assessment', 'mitigation'],
  },
  {
    id: 'scenario_planning',
    name: 'Scenario Planning & Roadmap',
    family: 'STRATEGY',
    category: 'Strategy',
    description: 'Develop scenarios, assess SWOT, and create a 90-day roadmap with mitigations.',
    complexity: 'high',
    estimatedDurationMin: 45,
    estimatedDurationMax: 90,
    estimatedCostMin: 3.00,
    estimatedCostMax: 8.00,
    tags: ['strategy', 'scenario', 'roadmap'],
  },
  {
    id: 'case_building',
    name: 'Case Building',
    family: 'PREPARATION',
    category: 'Preparation',
    description: 'Build compelling cases with evidence compilation',
    complexity: 'high',
    estimatedDurationMin: 40,
    estimatedDurationMax: 80,
    estimatedCostMin: 3.00,
    estimatedCostMax: 7.00,
    tags: ['case', 'evidence', 'preparation'],
  },
  {
    id: 'document_drafting',
    name: 'Document Drafting',
    family: 'PREPARATION',
    category: 'Content',
    description: 'Professional document creation and drafting',
    complexity: 'medium',
    estimatedDurationMin: 30,
    estimatedDurationMax: 60,
    estimatedCostMin: 2.00,
    estimatedCostMax: 5.00,
    tags: ['document', 'drafting', 'content'],
  },
  {
    id: 'presentation_creation',
    name: 'Presentation Creation',
    family: 'PREPARATION',
    category: 'Content',
    description: 'Create impactful presentations with key insights',
    complexity: 'medium',
    estimatedDurationMin: 25,
    estimatedDurationMax: 50,
    estimatedCostMin: 1.50,
    estimatedCostMax: 4.00,
    tags: ['presentation', 'slides', 'content'],
  },
  {
    id: 'communication_campaign',
    name: 'Communication: Campaign Plan',
    family: 'COMMUNICATION',
    category: 'Engagement',
    description: 'Segment audiences, craft tailored messages, and plan channels with KPIs.',
    complexity: 'medium',
    estimatedDurationMin: 30,
    estimatedDurationMax: 75,
    estimatedCostMin: 2.50,
    estimatedCostMax: 6.50,
    tags: ['communication', 'campaign', 'channels'],
  },
  {
    id: 'competitive_watch',
    name: 'Competitive Watch',
    family: 'MONITORING',
    category: 'Intelligence',
    description: 'Continuous competitive intelligence monitoring',
    complexity: 'medium',
    estimatedDurationMin: 20,
    estimatedDurationMax: 45,
    estimatedCostMin: 1.00,
    estimatedCostMax: 3.00,
    tags: ['competitive', 'intelligence', 'monitoring'],
  },
  {
    id: 'regulatory_watch',
    name: 'Regulatory Watch',
    family: 'MONITORING',
    category: 'Intelligence',
    description: 'Regulatory landscape monitoring and alerts',
    complexity: 'medium',
    estimatedDurationMin: 25,
    estimatedDurationMax: 50,
    estimatedCostMin: 1.50,
    estimatedCostMax: 4.00,
    tags: ['regulatory', 'compliance', 'monitoring'],
  },
  {
    id: 'alternative_finding',
    name: 'Alternative Finding',
    family: 'PROBLEM_SOLVING',
    category: 'Problem Solving',
    description: 'Identify and evaluate alternative solutions',
    complexity: 'medium',
    estimatedDurationMin: 25,
    estimatedDurationMax: 50,
    estimatedCostMin: 1.50,
    estimatedCostMax: 4.00,
    tags: ['alternatives', 'solutions', 'options'],
  },
  {
    id: 'gap_analysis',
    name: 'Gap Analysis',
    family: 'PROBLEM_SOLVING',
    category: 'Analysis',
    description: 'Identify gaps and opportunities for improvement',
    complexity: 'medium',
    estimatedDurationMin: 30,
    estimatedDurationMax: 60,
    estimatedCostMin: 2.00,
    estimatedCostMax: 5.00,
    tags: ['gap', 'analysis', 'improvement'],
  },
  {
    id: 'solution_design',
    name: 'Problem Solving: Solution Design',
    family: 'PROBLEM_SOLVING',
    category: 'Problem Solving',
    description: 'Generate and score solution options, then build an action plan.',
    complexity: 'medium',
    estimatedDurationMin: 30,
    estimatedDurationMax: 75,
    estimatedCostMin: 2.50,
    estimatedCostMax: 6.50,
    tags: ['solution', 'planning', 'action-plan'],
  },
  {
    id: 'stakeholder_analysis',
    name: 'Stakeholder Analysis',
    family: 'STRATEGY',
    category: 'Analysis',
    description: 'Map and analyze stakeholder landscape',
    complexity: 'medium',
    estimatedDurationMin: 30,
    estimatedDurationMax: 60,
    estimatedCostMin: 2.00,
    estimatedCostMax: 5.00,
    tags: ['stakeholder', 'mapping', 'analysis'],
  },
  {
    id: 'quick_answer',
    name: 'Quick Answer',
    family: 'GENERIC',
    category: 'General',
    description: 'Fast response to specific questions',
    complexity: 'low',
    estimatedDurationMin: 5,
    estimatedDurationMax: 15,
    estimatedCostMin: 0.25,
    estimatedCostMax: 1.00,
    tags: ['quick', 'answer', 'simple'],
  },
  {
    id: 'generic_query',
    name: 'Generic Query',
    family: 'GENERIC',
    category: 'General',
    description: 'General purpose query handling',
    complexity: 'low',
    estimatedDurationMin: 10,
    estimatedDurationMax: 30,
    estimatedCostMin: 0.50,
    estimatedCostMax: 2.00,
    tags: ['general', 'query', 'flexible'],
  },
  {
    id: 'generic_mission',
    name: 'Generic Mission',
    family: 'GENERIC',
    category: 'General',
    description: 'Fallback generic mission with simple plan, execution, and summary.',
    complexity: 'low',
    estimatedDurationMin: 15,
    estimatedDurationMax: 45,
    estimatedCostMin: 0.75,
    estimatedCostMax: 2.50,
    tags: ['generic', 'fallback', 'plan'],
  },
];
