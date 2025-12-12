/**
 * Canonical Agent Types - @vital/ui
 *
 * SINGLE SOURCE OF TRUTH for Agent types across the VITAL platform.
 * This file consolidates fragmented agent type definitions.
 *
 * Migration from:
 * - apps/vital-system/src/features/agents/types/agent.types.ts (comprehensive)
 * - apps/vital-system/src/types/agent.types.ts (mid-level)
 * - packages/types/src/agents/agent.types.ts (minimal)
 */

// ============================================================================
// ENUMS - Database-aligned values
// ============================================================================

export type AgentStatus = 'active' | 'inactive' | 'draft' | 'development' | 'testing' | 'deprecated';

export type ValidationStatus = 'validated' | 'pending' | 'in_review' | 'expired' | 'not_required';

export type DomainExpertise =
  | 'medical'
  | 'regulatory'
  | 'legal'
  | 'financial'
  | 'business'
  | 'technical'
  | 'commercial'
  | 'access'
  | 'general';

export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// AGENT LEVEL TYPES (L1-L5 Hierarchy)
// ============================================================================

export type AgentLevelNumber = 1 | 2 | 3 | 4 | 5;
export type AgentLevelCode = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type AgentLevelName = 'MASTER' | 'EXPERT' | 'SPECIALIST' | 'WORKER' | 'TOOL';

export interface AgentLevel {
  id: string;
  level_number: AgentLevelNumber;
  level_code: AgentLevelCode;
  level_name: AgentLevelName;
  description?: string;
}

// ============================================================================
// PERSONA ARCHETYPE TYPES
// ============================================================================

export type PersonaArchetypeCode =
  | 'clinical_expert'
  | 'regulatory_authority'
  | 'data_analyst'
  | 'safety_officer'
  | 'research_specialist'
  | 'business_strategist'
  | 'operations_manager'
  | 'compliance_guardian'
  | 'innovation_advisor'
  | 'patient_advocate';

export interface PersonaArchetype {
  id: string;
  archetype_code: PersonaArchetypeCode;
  archetype_name: string;
  description?: string;
  default_tone: string;
  default_formality: number;
  default_empathy: number;
  default_directness: number;
  typical_functions?: string[];
  display_order: number;
  is_active: boolean;
}

// ============================================================================
// COMMUNICATION STYLE TYPES
// ============================================================================

export type CommunicationStyleCode =
  | 'concise_technical'
  | 'detailed_technical'
  | 'concise_accessible'
  | 'detailed_accessible'
  | 'balanced'
  | 'executive_summary'
  | 'educational'
  | 'data_driven';

export type ResponseFormat = 'bullet_points' | 'narrative' | 'tables' | 'balanced';

export interface CommunicationStyle {
  id: string;
  style_code: CommunicationStyleCode;
  style_name: string;
  description?: string;
  verbosity_level: number;
  technical_level: number;
  structure_preference: ResponseFormat;
  display_order: number;
  is_active: boolean;
}

// ============================================================================
// AGENT INTERFACE - THE CANONICAL TYPE
// ============================================================================

/**
 * Canonical Agent interface - USE THIS throughout the application.
 *
 * Supports both:
 * - Legacy `tier` (1-3) for backwards compatibility
 * - Modern `agent_level_id` with L1-L5 hierarchy
 *
 * Field naming follows database conventions with aliases for compatibility.
 */
export interface Agent {
  // ─────────────────────────────────────────────────────────────────────────
  // CORE IDENTITY
  // ─────────────────────────────────────────────────────────────────────────
  id: string;
  name: string;
  slug?: string;
  /** Primary display name (preferred over `name` in UI) */
  display_name?: string;
  /** Short marketing tagline */
  tagline?: string;
  /** Full description */
  description?: string;
  /** Version string (e.g., "1.0.0") */
  version?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // VISUAL IDENTITY
  // ─────────────────────────────────────────────────────────────────────────
  /** Avatar URL (preferred) */
  avatar_url?: string;
  /** Avatar URL alias for backwards compat */
  avatar?: string;
  /** Avatar accessibility description */
  avatar_description?: string;
  /** Brand color hex */
  color?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // AGENT HIERARCHY
  // ─────────────────────────────────────────────────────────────────────────
  /** Modern L1-L5 level (foreign key to agent_levels) */
  agent_level_id?: string;
  /** Populated agent level data from join */
  agent_levels?: AgentLevel;
  /** Computed level number (1-5) for UI display */
  level?: AgentLevelNumber;

  /**
   * @deprecated REMOVED - Use agent_level_id + level (1-5) instead.
   *
   * The old tier system (1-3) has been replaced with the L1-L5 hierarchy:
   * - Old Tier 1 (Foundational) → L4 Worker, L5 Tool
   * - Old Tier 2 (Specialist) → L2 Expert, L3 Specialist
   * - Old Tier 3 (Ultra-Specialist) → L1 Master
   *
   * Migration: Query agent_levels table to get level_number.
   */
  tier?: never;

  // ─────────────────────────────────────────────────────────────────────────
  // ORGANIZATIONAL CONTEXT
  // ─────────────────────────────────────────────────────────────────────────
  /** Function (L1 org hierarchy) */
  function_id?: string;
  function_name?: string;
  /** @deprecated Use function_name */
  business_function?: string;

  /** Department (L2 org hierarchy) */
  department_id?: string;
  department_name?: string;

  /** Role (L3 org hierarchy) */
  role_id?: string;
  role_name?: string;
  /** @deprecated Use role_name */
  role?: string;

  /** Persona ID */
  persona_id?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // AI CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────
  /** Model identifier (database column name) */
  base_model?: string;
  /** @alias base_model for backwards compatibility */
  model?: string;
  /** System prompt content */
  system_prompt?: string;
  /** Template ID for prompt generation */
  system_prompt_template_id?: string;
  /** Override for template */
  system_prompt_override?: string;
  /** Variables for prompt template */
  prompt_variables?: Record<string, unknown>;

  /** LLM temperature (0-2) */
  temperature?: number;
  /** Max response tokens */
  max_tokens?: number;
  /** Context window size */
  context_window?: number;
  /** Response format */
  response_format?: 'markdown' | 'json' | 'text' | 'html';
  /** Cost per query in USD */
  cost_per_query?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // FEATURE FLAGS
  // ─────────────────────────────────────────────────────────────────────────
  /** Enable RAG retrieval */
  rag_enabled?: boolean;
  /** Enable web search */
  websearch_enabled?: boolean;
  /** Enabled tool IDs */
  tools_enabled?: string[];
  /** Knowledge base namespaces */
  knowledge_namespaces?: string[];

  // ─────────────────────────────────────────────────────────────────────────
  // AUTONOMOUS CONFIG (Mode 3)
  // ─────────────────────────────────────────────────────────────────────────
  /** Minimum confidence to proceed */
  confidence_threshold?: number;
  /** Max goal-seeking iterations */
  max_goal_iterations?: number;
  /** Human-in-the-loop enabled */
  hitl_enabled?: boolean;
  /** HITL safety level */
  hitl_safety_level?: 'minimal' | 'balanced' | 'strict';

  // ─────────────────────────────────────────────────────────────────────────
  // TOKEN BUDGET
  // ─────────────────────────────────────────────────────────────────────────
  token_budget_min?: number;
  token_budget_max?: number;
  token_budget_recommended?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // MODEL EVIDENCE
  // ─────────────────────────────────────────────────────────────────────────
  /** Why this model was chosen */
  model_justification?: string;
  /** Academic/docs citation */
  model_citation?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // 6-SECTION PROMPT BUILDER
  // ─────────────────────────────────────────────────────────────────────────
  prompt_section_you_are?: string;
  prompt_section_you_do?: string;
  prompt_section_you_never?: string;
  prompt_section_success_criteria?: string;
  prompt_section_when_unsure?: string;
  prompt_section_evidence?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // AGENT HIERARCHY & SPAWNING
  // ─────────────────────────────────────────────────────────────────────────
  /** Parent agent ID for hierarchy */
  parent_agent_id?: string;
  /** Reports to agent ID */
  reports_to_agent_id?: string;
  /** Escalation target (agent ID or 'HITL') */
  can_escalate_to?: string;
  /** Can spawn L2 experts */
  can_spawn_l2?: boolean;
  /** Can spawn L3 specialists */
  can_spawn_l3?: boolean;
  /** Can spawn L4 workers */
  can_spawn_l4?: boolean;
  /** Can use worker pool */
  can_use_worker_pool?: boolean;

  // ─────────────────────────────────────────────────────────────────────────
  // PERSONA & COMMUNICATION STYLE
  // ─────────────────────────────────────────────────────────────────────────
  persona_archetype_id?: string;
  persona_archetype?: PersonaArchetype;
  /** @deprecated Use persona_archetype_id */
  archetype_code?: PersonaArchetypeCode;

  communication_style_id?: string;
  communication_style?: CommunicationStyle;

  // ─────────────────────────────────────────────────────────────────────────
  // PERSONALITY SLIDERS (0-100)
  // ─────────────────────────────────────────────────────────────────────────
  personality_formality?: number;
  personality_empathy?: number;
  personality_directness?: number;
  personality_detail_orientation?: number;
  personality_proactivity?: number;
  personality_risk_tolerance?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // COMMUNICATION SLIDERS (0-100)
  // ─────────────────────────────────────────────────────────────────────────
  comm_verbosity?: number;
  comm_technical_level?: number;
  comm_warmth?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // RESPONSE PREFERENCES
  // ─────────────────────────────────────────────────────────────────────────
  preferred_response_format?: ResponseFormat;
  include_citations?: boolean;
  include_confidence_scores?: boolean;
  include_limitations?: boolean;

  // ─────────────────────────────────────────────────────────────────────────
  // CAPABILITIES & KNOWLEDGE
  // ─────────────────────────────────────────────────────────────────────────
  /** Simple capability strings (legacy) */
  capabilities?: string[];
  /** Knowledge domain strings (legacy) */
  knowledge_domains?: string[];
  /** Primary domain expertise */
  domain_expertise?: DomainExpertise;

  /** Enriched capabilities from junction table */
  enriched_capabilities?: EnrichedCapability[];
  /** Enriched skills from junction table */
  enriched_skills?: EnrichedSkill[];
  /** Agent responsibilities from junction table */
  responsibilities?: AgentResponsibility[];
  /** Prompt starters from junction table */
  prompt_starters?: AgentPromptStarter[];
  /** Tool assignments from junction table */
  assigned_tools?: AgentToolAssignment[];
  /** Enriched knowledge domains */
  enriched_knowledge_domains?: EnrichedKnowledgeDomain[];

  // ─────────────────────────────────────────────────────────────────────────
  // COMPLIANCE & SAFETY
  // ─────────────────────────────────────────────────────────────────────────
  status?: AgentStatus;
  validation_status?: ValidationStatus;
  hipaa_compliant?: boolean;
  gdpr_compliant?: boolean;
  audit_trail_enabled?: boolean;
  data_classification?: DataClassification;

  // ─────────────────────────────────────────────────────────────────────────
  // PERFORMANCE METRICS
  // ─────────────────────────────────────────────────────────────────────────
  accuracy_score?: number;
  error_rate?: number;
  average_response_time?: number;
  total_interactions?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // FLAGS
  // ─────────────────────────────────────────────────────────────────────────
  /** User-created agent */
  is_custom?: boolean;
  /** Evidence required for responses */
  evidence_required?: boolean;

  // ─────────────────────────────────────────────────────────────────────────
  // TIMESTAMPS
  // ─────────────────────────────────────────────────────────────────────────
  created_at?: string | Date;
  updated_at?: string | Date;
  last_interaction?: string | Date;

  // ─────────────────────────────────────────────────────────────────────────
  // METADATA (JSONB catch-all)
  // ─────────────────────────────────────────────────────────────────────────
  metadata?: Record<string, unknown>;
}

// ============================================================================
// ENRICHED JUNCTION TABLE TYPES
// ============================================================================

export interface CapabilityEntity {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  category?: string;
}

export interface SkillEntity {
  id: string;
  name: string;
  slug?: string;
  description?: string;
}

export interface ResponsibilityEntity {
  id: string;
  name: string;
  description?: string;
}

export interface ToolEntity {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  tool_type?: string;
}

export interface EnrichedCapability {
  id: string;
  proficiency_level?: 'familiar' | 'proficient' | 'expert';
  is_primary?: boolean;
  capability: CapabilityEntity | null;
}

export interface EnrichedSkill {
  id: string;
  proficiency_level?: 'familiar' | 'proficient' | 'expert';
  is_primary?: boolean;
  skill: SkillEntity | null;
}

export interface AgentResponsibility {
  id: string;
  is_primary?: boolean;
  weight?: number;
  responsibility: ResponsibilityEntity | null;
}

export interface AgentPromptStarter {
  id: string;
  text: string;
  icon?: string;
  category?: string;
  sequence_order?: number;
}

export interface AgentToolAssignment {
  id: string;
  is_enabled?: boolean;
  priority?: number;
  tool: ToolEntity | null;
}

export interface EnrichedKnowledgeDomain {
  id: string;
  domain_name: string;
  proficiency_level?: 'familiar' | 'proficient' | 'expert';
  is_primary_domain?: boolean;
  expertise_level?: string;
}

// ============================================================================
// UI-SPECIFIC TYPES
// ============================================================================

/**
 * Simplified agent data for card components.
 * Use this in list views where full Agent data is overkill.
 */
export interface AgentCardData {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  avatar?: string;
  avatar_url?: string;
  status?: AgentStatus;
  /** Agent level (1-5) from L1-L5 hierarchy */
  level?: AgentLevelNumber;
  model?: string;
  temperature?: number;
  is_custom?: boolean;
  function_name?: string;
  department_name?: string;
  role_name?: string;
  /** @deprecated Use function_name */
  business_function?: string;
  capabilities?: string[];
  knowledge_domains?: string[];
  metrics?: AgentMetrics;
}

export interface AgentMetrics {
  conversations?: number;
  successRate?: number;
  avgResponseTime?: number;
  rating?: number;
}

/**
 * Agent list filter options
 */
export interface AgentFilters {
  status?: AgentStatus[];
  /** Agent levels to filter by (1-5) */
  level?: AgentLevelNumber[];
  function_name?: string[];
  department_name?: string[];
  role_name?: string[];
  domain_expertise?: DomainExpertise[];
  search?: string;
  is_custom?: boolean;
}

/**
 * Agent sort options
 */
export interface AgentSort {
  field: keyof Agent;
  direction: 'asc' | 'desc';
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface AgentResponse {
  data: Agent;
  success: boolean;
  message?: string;
}

export interface AgentListResponse {
  data: Agent[];
  total: number;
  page?: number;
  limit?: number;
  success: boolean;
  message?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Input type for creating agents (omits auto-generated fields) */
export type AgentCreateInput = Omit<Agent, 'id' | 'created_at' | 'updated_at'>;

/** Input type for updating agents (partial, omits immutable fields) */
export type AgentUpdateInput = Partial<Omit<Agent, 'id' | 'name' | 'created_at' | 'updated_at'>>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const DOMAIN_COLORS: Record<DomainExpertise, string> = {
  medical: '#00CC88',
  regulatory: '#0066FF',
  legal: '#003399',
  financial: '#9933FF',
  business: '#FF6600',
  technical: '#00CCFF',
  commercial: '#FF6600',
  access: '#FFAA00',
  general: '#999999',
};

export const AGENT_LEVEL_LABELS: Record<AgentLevelNumber, string> = {
  1: 'L1 Master',
  2: 'L2 Expert',
  3: 'L3 Specialist',
  4: 'L4 Worker',
  5: 'L5 Tool',
};

/**
 * @deprecated Tier system removed. Use AGENT_LEVEL_LABELS instead.
 */
export const TIER_LABELS: Record<number, string> = {
  1: 'L4/L5 (Was: Foundational)',
  2: 'L2/L3 (Was: Specialist)',
  3: 'L1 (Was: Ultra-Specialist)',
};

export const STATUS_COLORS: Record<AgentStatus, string> = {
  active: '#22c55e',
  inactive: '#78716c',
  draft: '#f59e0b',
  development: '#3b82f6',
  testing: '#a855f7',
  deprecated: '#ef4444',
};
