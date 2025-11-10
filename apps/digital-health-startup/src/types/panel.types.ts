/**
 * Panel Types - Centralized Type Definitions
 * Maps to Supabase schema: panel_templates, panel_management_patterns
 */

// ============================================================================
// DATABASE ENUMS (must match migration exactly)
// ============================================================================

export type PanelType =
  | 'structured'   // Sequential, moderated discussion
  | 'open'         // Parallel exploration
  | 'socratic'     // Iterative questioning
  | 'adversarial'  // Structured debate
  | 'delphi'       // Anonymous iterative rounds
  | 'hybrid';      // Combined human-AI

export type ManagementType =
  | 'ai_only'           // Fully AI-orchestrated
  | 'human_moderated'   // Human moderator with AI experts
  | 'hybrid_facilitated'// Mixed human-AI facilitation
  | 'human_expert';     // Human experts with AI support

export type FacilitationPattern =
  | 'sequential'        // One at a time
  | 'parallel'          // All at once
  | 'round_robin'       // Rotating order
  | 'consensus_driven'  // Continue until agreement
  | 'time_boxed';       // Fixed duration

export type PanelStatus =
  | 'created'      // Panel configured, not started
  | 'running'      // Currently executing
  | 'completed'    // Successfully finished
  | 'failed'       // Error occurred
  | 'cancelled';   // User cancelled

// ============================================================================
// DATABASE SCHEMA TYPES
// ============================================================================

export interface PanelTemplateRow {
  id: string;
  tenant_id: string | null;

  // Template Identity
  name: string;
  description: string;
  category: string;

  // Panel Configuration
  panel_type: PanelType;
  management_type: ManagementType;
  facilitation_pattern: FacilitationPattern;

  // Expert Configuration
  suggested_agents: string[];
  min_experts: number;
  max_experts: number;
  optimal_experts: number;

  // Timing Configuration
  duration_min: number | null;
  duration_typical: number | null;
  duration_max: number | null;
  max_rounds: number | null;

  // Behavior Configuration
  requires_moderator: boolean;
  parallel_execution: boolean;
  enable_consensus: boolean;
  consensus_threshold: number | null;

  // Use Cases & Examples
  use_cases: string[];
  example_scenarios: ExampleScenario[];

  // Metadata
  is_public: boolean;
  is_preset: boolean;
  tags: string[];
  industry_id: string | null;

  // Usage Stats
  usage_count: number;
  avg_rating: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface PanelManagementPatternRow {
  id: string;
  name: string;
  description: string;
  management_type: ManagementType;
  requires_human_moderator: boolean;
  requires_human_experts: boolean;
  ai_orchestration_level: 'none' | 'low' | 'medium' | 'high' | 'full' | null;
  capabilities: Record<string, any>;
  limitations: Record<string, any>;
  best_use_cases: string[];
  example_implementations: any[];
  created_at: string;
  updated_at: string;
}

export interface UserPanelCustomizationRow {
  id: string;
  user_id: string;
  tenant_id: string | null;
  template_id: string | null;
  custom_name: string;
  custom_description: string | null;
  custom_agents: string[];
  custom_configuration: Record<string, any>;
  is_favorite: boolean;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FRONTEND TYPES (UI Models)
// ============================================================================

export interface ExampleScenario {
  scenario: string;
  context: string;
  expectedOutcome?: string;
  expected_outcome?: string;
  duration?: number;
  durationMinutes?: number;
  panelComposition?: string[] | Record<string, string[]>;
  panel_composition?: string[] | Record<string, string[]>;
  keyQuestions?: string[];
}

export interface PanelTemplate {
  id: string;
  name: string;
  description: string;
  category: string;

  // Panel Configuration
  panelType: PanelType;
  managementType: ManagementType;
  facilitationPattern: FacilitationPattern;

  // Expert Configuration
  suggestedAgents: string[];
  minExperts: number;
  maxExperts: number;
  optimalExperts: number;

  // Timing Configuration
  durationMin: number;
  durationTypical: number;
  durationMax: number;
  maxRounds: number;

  // Behavior Configuration
  requiresModerator: boolean;
  parallelExecution: boolean;
  enableConsensus: boolean;
  consensusThreshold?: number;

  // Use Cases & Examples
  useCases: string[];
  exampleScenarios?: ExampleScenario[];

  // Metadata
  tags: string[];
  usageCount: number;
  avgRating: number;
  isPreset: boolean;
  isFavorite?: boolean;
}

export interface PanelManagementPattern {
  type: ManagementType;
  name: string;
  tagline: string;
  description: string;
  icon: any; // LucideIcon
  color: string;
  gradient: string;

  configuration: {
    humanModerator: boolean;
    humanExperts: boolean;
    aiOrchestration: 'none' | 'low' | 'medium' | 'high' | 'full';
  };

  capabilities: {
    name: string;
    available: boolean;
  }[];

  advantages: string[];
  limitations: string[];
  bestUseCases: string[];
  pricing: {
    tier: string;
    description: string;
  };
}

export interface PanelTypeInfo {
  type: PanelType;
  name: string;
  tagline: string;
  description: string;
  icon: any; // LucideIcon
  color: string;
  gradient: string;
  characteristics: string[];
  useCases: string[];
  examples: ExampleScenario[];
  configuration: {
    duration: string;
    experts: string;
    rounds: string;
    style: string;
  };
  bestFor: string[];
}

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

/**
 * Convert database row to frontend template
 */
export function mapTemplateRowToTemplate(row: PanelTemplateRow): PanelTemplate {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    panelType: row.panel_type,
    managementType: row.management_type,
    facilitationPattern: row.facilitation_pattern,
    suggestedAgents: row.suggested_agents,
    minExperts: row.min_experts,
    maxExperts: row.max_experts,
    optimalExperts: row.optimal_experts,
    durationMin: row.duration_min || 10,
    durationTypical: row.duration_typical || 15,
    durationMax: row.duration_max || 30,
    maxRounds: row.max_rounds || 3,
    requiresModerator: row.requires_moderator,
    parallelExecution: row.parallel_execution,
    enableConsensus: row.enable_consensus,
    consensusThreshold: row.consensus_threshold || undefined,
    useCases: row.use_cases,
    exampleScenarios: row.example_scenarios,
    tags: row.tags,
    usageCount: row.usage_count,
    avgRating: row.avg_rating,
    isPreset: row.is_preset,
    isFavorite: false, // Set by frontend
  };
}

/**
 * Convert frontend template to database row (for insert/update)
 */
export function mapTemplateToTemplateRow(
  template: PanelTemplate,
  userId?: string,
  tenantId?: string
): Omit<PanelTemplateRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    tenant_id: tenantId || null,
    name: template.name,
    description: template.description,
    category: template.category,
    panel_type: template.panelType,
    management_type: template.managementType,
    facilitation_pattern: template.facilitationPattern,
    suggested_agents: template.suggestedAgents,
    min_experts: template.minExperts,
    max_experts: template.maxExperts,
    optimal_experts: template.optimalExperts,
    duration_min: template.durationMin,
    duration_typical: template.durationTypical,
    duration_max: template.durationMax,
    max_rounds: template.maxRounds,
    requires_moderator: template.requiresModerator,
    parallel_execution: template.parallelExecution,
    enable_consensus: template.enableConsensus,
    consensus_threshold: template.consensusThreshold || null,
    use_cases: template.useCases,
    example_scenarios: template.exampleScenarios || [],
    is_public: false,
    is_preset: template.isPreset,
    tags: template.tags,
    industry_id: null,
    usage_count: template.usageCount,
    avg_rating: template.avgRating,
    created_by: userId || null,
  };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isPanelType(value: string): value is PanelType {
  return ['structured', 'open', 'socratic', 'adversarial', 'delphi', 'hybrid'].includes(value);
}

export function isManagementType(value: string): value is ManagementType {
  return ['ai_only', 'human_moderated', 'hybrid_facilitated', 'human_expert'].includes(value);
}

export function isFacilitationPattern(value: string): value is FacilitationPattern {
  return ['sequential', 'parallel', 'round_robin', 'consensus_driven', 'time_boxed'].includes(value);
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const PANEL_TYPE_LABELS: Record<PanelType, string> = {
  structured: 'Structured Panel',
  open: 'Open Panel',
  socratic: 'Socratic Panel',
  adversarial: 'Adversarial Panel',
  delphi: 'Delphi Panel',
  hybrid: 'Hybrid Panel',
};

export const MANAGEMENT_TYPE_LABELS: Record<ManagementType, string> = {
  ai_only: 'AI Only',
  human_moderated: 'Human Moderated',
  hybrid_facilitated: 'Hybrid Facilitated',
  human_expert: 'Human Expert',
};

export const PANEL_TYPE_COLORS: Record<PanelType, string> = {
  structured: 'blue',
  open: 'purple',
  socratic: 'amber',
  adversarial: 'red',
  delphi: 'green',
  hybrid: 'violet',
};
