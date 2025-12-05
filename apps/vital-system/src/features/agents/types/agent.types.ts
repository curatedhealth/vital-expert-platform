// Enum types matching database
export enum AgentStatus {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  ACTIVE = 'active',
  DEPRECATED = 'deprecated'
}

export enum ValidationStatus {
  VALIDATED = 'validated',
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  EXPIRED = 'expired',
  NOT_REQUIRED = 'not_required'
}

export enum DomainExpertise {
  MEDICAL = 'medical',
  REGULATORY = 'regulatory',
  LEGAL = 'legal',
  FINANCIAL = 'financial',
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  COMMERCIAL = 'commercial',
  ACCESS = 'access',
  GENERAL = 'general'
}

export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ============================================================================
// Agent Level Types (L1-L5 Hierarchy)
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
// Persona & Communication Style Types
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
  default_formality: number; // 0-100
  default_empathy: number; // 0-100
  default_directness: number; // 0-100
  typical_functions?: string[];
  display_order: number;
  is_active: boolean;
}

export type CommunicationStyleCode =
  | 'concise_technical'
  | 'detailed_technical'
  | 'concise_accessible'
  | 'detailed_accessible'
  | 'balanced'
  | 'executive_summary'
  | 'educational'
  | 'data_driven';

export interface CommunicationStyle {
  id: string;
  style_code: CommunicationStyleCode;
  style_name: string;
  description?: string;
  verbosity_level: number; // 0-100
  technical_level: number; // 0-100
  structure_preference: 'bullet_points' | 'narrative' | 'tables' | 'balanced';
  display_order: number;
  is_active: boolean;
}

export type ToneModifierCode =
  | 'urgent'
  | 'reassuring'
  | 'educational'
  | 'analytical'
  | 'collaborative'
  | 'advisory'
  | 'compliance_focused'
  | 'patient_facing';

export interface ToneModifier {
  id: string;
  modifier_code: ToneModifierCode;
  modifier_name: string;
  description?: string;
  formality_adjustment: number; // -50 to +50
  empathy_adjustment: number; // -50 to +50
  directness_adjustment: number; // -50 to +50
  display_order: number;
  is_active: boolean;
}

// ============================================================================
// Success Criteria Types
// ============================================================================

export interface SuccessCriteriaTemplate {
  id: string;
  agent_level: AgentLevelNumber;
  metric_code: string;
  metric_name: string;
  metric_description?: string;
  default_target: number; // 0-100
  default_min_acceptable?: number; // 0-100
  measurement_unit: string;
  measurement_method?: string;
  display_order: number;
  is_required: boolean;
}

export interface AgentSuccessCriteria {
  id: string;
  agent_id: string;
  metric_code: string;
  metric_name: string;
  metric_description?: string;
  target_value: number; // 0-100 (slider-adjustable)
  min_acceptable?: number; // 0-100 (slider-adjustable)
  measurement_unit: string;
  measurement_method?: string;
  display_order: number;
  is_active: boolean;
}

// ============================================================================
// Token Budget Types
// ============================================================================

export interface TokenBudget {
  min: number;
  max: number;
  recommended: number;
}

// ============================================================================
// Agent Level Defaults (for UI suggestions)
// ============================================================================

export interface AgentLevelDefaults {
  level_number: AgentLevelNumber;
  level_name: AgentLevelName;
  level_code: AgentLevelCode;
  default_model: string;
  default_temperature: number;
  default_max_tokens: number;
  default_context_window: number;
  default_cost_per_query: number;
  default_token_budget_min: number;
  default_token_budget_max: number;
  default_token_budget_recommended: number;
  default_can_spawn_l2: boolean;
  default_can_spawn_l3: boolean;
  default_can_spawn_l4: boolean;
  default_can_use_worker_pool: boolean;
  default_can_escalate_to?: string;
  description?: string;
}

// ============================================================================
// Expertise Level Types
// ============================================================================

export type ExpertiseLevel = 'entry' | 'mid' | 'senior' | 'expert' | 'thought_leader';
export type GeographicScope = 'local' | 'regional' | 'national' | 'global';
export type ResponseFormat = 'bullet_points' | 'narrative' | 'tables' | 'balanced';

// Main Agent interface
export interface Agent {
  // Core Identity
  id?: string;
  name: string;
  slug?: string;
  tagline?: string;
  description: string;
  title?: string;
  avatar_url?: string;
  avatar_description?: string;
  color?: string;
  version?: string;

  // Agent Level (L1-L5 Hierarchy) - Replaces legacy "tier"
  agent_level_id?: string;
  agent_levels?: AgentLevel; // Populated via join

  // AI Configuration
  base_model?: string; // Database column name
  model?: string; // Alias for compatibility
  system_prompt?: string;
  system_prompt_template_id?: string;
  system_prompt_override?: string;
  prompt_variables?: Record<string, unknown>;
  temperature?: number;
  max_tokens?: number;
  rag_enabled?: boolean;
  context_window?: number;
  response_format?: 'markdown' | 'json' | 'text' | 'html';
  cost_per_query?: number;

  // Mode 3 Autonomous Configuration (normalized columns)
  websearch_enabled?: boolean;
  tools_enabled?: string[];
  knowledge_namespaces?: string[];
  confidence_threshold?: number;
  max_goal_iterations?: number;
  hitl_enabled?: boolean;
  hitl_safety_level?: 'minimal' | 'balanced' | 'strict';

  // Token Budget (normalized columns)
  token_budget_min?: number;
  token_budget_max?: number;
  token_budget_recommended?: number;

  // Model Evidence (for AI-suggested configuration)
  model_justification?: string;
  model_citation?: string;

  // 6-Section Prompt Builder Fields
  prompt_section_you_are?: string;
  prompt_section_you_do?: string;
  prompt_section_you_never?: string;
  prompt_section_success_criteria?: string;
  prompt_section_when_unsure?: string;
  prompt_section_evidence?: string;

  // Agent Hierarchy & Spawning
  reports_to_agent_id?: string;
  can_escalate_to?: string;
  can_spawn_l2?: boolean;
  can_spawn_l3?: boolean;
  can_spawn_l4?: boolean;
  can_use_worker_pool?: boolean;

  // Persona & Communication Style (Foreign Keys)
  persona_archetype_id?: string;
  persona_archetype?: PersonaArchetype; // Populated via join
  communication_style_id?: string;
  communication_style?: CommunicationStyle; // Populated via join

  // Personality Sliders (0-100 scale) - Cursor-adjustable
  personality_formality?: number;
  personality_empathy?: number;
  personality_directness?: number;
  personality_detail_orientation?: number;
  personality_proactivity?: number;
  personality_risk_tolerance?: number;

  // Communication Sliders (0-100 scale) - Cursor-adjustable
  comm_verbosity?: number;
  comm_technical_level?: number;
  comm_warmth?: number;

  // Response Preferences
  preferred_response_format?: ResponseFormat;
  include_citations?: boolean;
  include_confidence_scores?: boolean;
  include_limitations?: boolean;

  // Experience & Expertise
  expertise_level?: ExpertiseLevel;
  expertise_years?: number;
  years_of_experience?: number; // Alias
  geographic_scope?: GeographicScope;
  industry_specialization?: string;

  // Safety Flags (normalized columns)
  hipaa_compliant?: boolean;
  gdpr_compliant?: boolean;
  audit_trail_enabled?: boolean;
  data_classification?: DataClassification;

  // Capabilities & Knowledge
  capabilities?: string[];
  knowledge_domains?: string[];
  domain_expertise?: DomainExpertise;
  competency_levels?: Record<string, unknown>;
  knowledge_sources?: Record<string, unknown>;
  tool_configurations?: Record<string, unknown>;

  // Organizational Context
  function_id?: string;
  function_name?: string;
  department_id?: string;
  department_name?: string;
  role_id?: string;
  role_name?: string;
  business_function?: string;
  role?: string;
  persona_id?: string;

  // Legacy Fields (deprecated - use agent_level_id instead)
  tier?: 1 | 2 | 3 | 4 | 5;
  priority?: number;
  implementation_phase?: 1 | 2 | 3;
  is_custom?: boolean;
  target_users?: string[];

  // Validation & Performance
  validation_status?: ValidationStatus;
  validation_metadata?: ValidationMetadata;
  performance_metrics?: PerformanceMetrics;
  accuracy_score?: number;
  evidence_required?: boolean;

  // Compliance
  regulatory_context?: RegulatoryContext;
  compliance_tags?: string[];
  hipaa_compliant?: boolean;
  gdpr_compliant?: boolean;
  audit_trail_enabled?: boolean;
  data_classification?: DataClassification;

  // Domain-Specific Optional - Medical
  medical_specialty?: string;
  pharma_enabled?: boolean;
  verify_enabled?: boolean;

  // Legal Domain Fields
  jurisdiction_coverage?: string[];
  legal_domains?: string[];
  bar_admissions?: string[];
  legal_specialties?: LegalSpecialties;

  // Commercial Domain Fields
  market_segments?: string[];
  customer_segments?: string[];
  sales_methodology?: string;
  geographic_focus?: string[];

  // Market Access Domain Fields
  payer_types?: string[];
  reimbursement_models?: string[];
  coverage_determination_types?: string[];
  hta_experience?: string[];

  // Operational
  status?: AgentStatus;
  availability_status?: string;
  error_rate?: number;
  average_response_time?: number;
  total_interactions?: number;
  last_interaction?: Date | string;
  last_health_check?: Date | string;

  // Relationships
  parent_agent_id?: string;
  compatible_agents?: string[];
  incompatible_agents?: string[];
  prerequisite_agents?: string[];
  workflow_positions?: string[];

  // Configuration
  escalation_rules?: Record<string, unknown>;
  confidence_thresholds?: ConfidenceThresholds;
  input_validation_rules?: Record<string, unknown>;
  output_format_rules?: Record<string, unknown>;
  citation_requirements?: Record<string, unknown>;
  rate_limits?: RateLimits;

  // Testing
  test_scenarios?: unknown[];
  validation_history?: ValidationHistoryEntry[];
  performance_benchmarks?: Record<string, unknown>;
  reviewer_id?: string;
  last_validation_date?: Date | string;
  validation_expiry_date?: Date | string;

  // Metadata
  created_at?: Date | string;
  updated_at?: Date | string;
  created_by?: string;
  updated_by?: string;
  metadata?: Record<string, unknown>;

  // Enriched Junction Table Data (from API joins)
  enriched_capabilities?: EnrichedCapability[];
  enriched_skills?: EnrichedSkill[];
  responsibilities?: AgentResponsibility[];
  prompt_starters?: AgentPromptStarter[];
  assigned_tools?: AgentToolAssignment[];
  enriched_knowledge_domains?: EnrichedKnowledgeDomain[];
}

// ============================================================================
// Enriched Junction Table Data Types
// ============================================================================

/**
 * Capability entity from capabilities table
 */
export interface CapabilityEntity {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  category?: string;
}

/**
 * Skill entity from skills table
 */
export interface SkillEntity {
  id: string;
  name: string;
  slug?: string;
  description?: string;
}

/**
 * Responsibility entity from org_responsibilities table
 */
export interface ResponsibilityEntity {
  id: string;
  name: string;
  description?: string;
}

/**
 * Tool entity from tools table
 */
export interface ToolEntity {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  tool_type?: string;
}

/**
 * Enriched capability from agent_capabilities junction
 */
export interface EnrichedCapability {
  id: string;
  proficiency_level?: 'familiar' | 'proficient' | 'expert';
  is_primary?: boolean;
  capability: CapabilityEntity | null;
}

/**
 * Enriched skill from agent_skill_assignments junction
 */
export interface EnrichedSkill {
  id: string;
  proficiency_level?: 'familiar' | 'proficient' | 'expert';
  is_primary?: boolean;
  skill: SkillEntity | null;
}

/**
 * Agent responsibility from agent_responsibilities junction
 */
export interface AgentResponsibility {
  id: string;
  is_primary?: boolean;
  weight?: number;
  responsibility: ResponsibilityEntity | null;
}

/**
 * Agent prompt starter from agent_prompt_starters table
 */
export interface AgentPromptStarter {
  id: string;
  text: string;
  icon?: string;
  category?: string;
  sequence_order?: number;
}

/**
 * Agent tool assignment from agent_tool_assignments junction
 */
export interface AgentToolAssignment {
  id: string;
  is_enabled?: boolean;
  priority?: number;
  tool: ToolEntity | null;
}

/**
 * Enriched knowledge domain from agent_knowledge_domains table
 */
export interface EnrichedKnowledgeDomain {
  id: string;
  domain_name: string;
  proficiency_level?: 'familiar' | 'proficient' | 'expert';
  is_primary_domain?: boolean;
  expertise_level?: string;
}

// Supporting interfaces
export interface ValidationMetadata {
  type: 'clinical' | 'regulatory' | 'technical' | 'business' | 'financial' | 'legal';
  validated_by: string;
  validation_date: string;
  expiry_date?: string;
  scope: string;
  notes?: string;
  evidence_links?: string[];
  certification_level?: 'basic' | 'intermediate' | 'advanced' | 'expert';
}

export interface PerformanceMetrics {
  accuracy: number;
  hallucination_rate?: number;
  citation_accuracy?: number;
  confidence_calibration?: number;
  domain_expertise_score?: number;
  response_quality?: number;
  response_time_p95?: number;
  error_recovery_rate?: number;
  user_satisfaction?: number;
  calculation_precision?: number; // For financial agents
  [key: string]: number | undefined;
}

export interface RegulatoryContext {
  is_regulated: boolean;
  risk_level?: RiskLevel;
  applicable_frameworks?: string[];
  classifications?: Array<{
    framework: string;
    class?: string;
    region?: string;
    authority?: string;
    effective_date?: string;
    expiry_date?: string;
  }>;
  compliance_requirements?: string[];
  audit_frequency?: 'monthly' | 'quarterly' | 'annually' | 'as_needed';
}

export interface ConfidenceThresholds {
  low: number;
  medium: number;
  high: number;
}

export interface RateLimits {
  per_minute?: number;
  per_hour?: number;
  per_day?: number;
  burst_limit?: number;
}

export interface LegalSpecialties {
  practice_areas: string[];
  years_experience: Record<string, number>;
  certifications?: string[];
  court_admissions?: string[];
}

export interface ValidationHistoryEntry {
  date: string;
  validator: string;
  status: ValidationStatus;
  notes?: string;
  metrics?: Record<string, number>;
  recommendations?: string[];
}

// Bulk import interface
export interface AgentBulkImport {
  agents: Agent[];
  metadata: ImportMetadata;
}

export interface ImportMetadata {
  version: string;
  created_date: string;
  created_by: string;
  last_modified?: string;
  total_agents: number;
  deployment_phase?: string;
  validation_status?: string;
  import_mode?: 'create' | 'update' | 'upsert';
  domain_focus?: DomainExpertise[];
  target_environment?: 'development' | 'staging' | 'production';
  rollback_enabled?: boolean;
  dependencies?: string[];
}

// API Response types
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

export interface BulkImportResponse {
  success: boolean;
  imported: number;
  total: number;
  errors: ImportError[];
  warnings?: ImportWarning[];
  summary: ImportSummary;
}

export interface ImportError {
  agent: string;
  error: string;
  field?: string;
  severity: 'error' | 'warning';
}

export interface ImportWarning {
  agent: string;
  warning: string;
  field?: string;
  recommendation?: string;
}

export interface ImportSummary {
  by_domain: Record<DomainExpertise, number>;
  by_tier: Record<string, number>;
  validation_status: Record<ValidationStatus, number>;
  compliance_summary: {
    hipaa_compliant: number;
    gdpr_compliant: number;
    regulated: number;
  };
}

// Filter interfaces
export interface AgentFilters {
  status?: AgentStatus[];
  domain_expertise?: DomainExpertise[];
  tier?: number[];
  business_function?: string[];
  validation_status?: ValidationStatus[];
  search?: string;
  compliance_tags?: string[];
  created_after?: string;
  created_before?: string;
  accuracy_min?: number;
  is_custom?: boolean;
}

export interface AgentSort {
  field: keyof Agent;
  direction: 'asc' | 'desc';
}

// Audit log interface
export interface AgentAuditLog {
  id: string;
  agent_id: string;
  action: string;
  changed_by?: string;
  changed_at: Date | string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

// Domain-specific configuration interfaces
export interface MedicalAgentConfig {
  medical_specialty: string;
  pharma_enabled: boolean;
  verify_enabled: boolean;
  clinical_validation_required: boolean;
  accuracy_threshold: number; // >= 0.95
  citation_requirements: {
    peer_reviewed_sources: boolean;
    clinical_guidelines: boolean;
    regulatory_guidance: boolean;
  };
}

export interface LegalAgentConfig {
  jurisdiction_coverage: string[];
  legal_domains: string[];
  bar_admissions: string[];
  accuracy_threshold: number; // >= 0.98
  citation_requirements: {
    case_law: boolean;
    statutes: boolean;
    regulations: boolean;
    bar_opinions: boolean;
  };
}

export interface FinancialAgentConfig {
  calculation_precision_required: boolean;
  audit_trail_enabled: boolean;
  accuracy_threshold: number; // >= 0.95
  regulatory_reporting: boolean;
}

export interface CommercialAgentConfig {
  market_segments: string[];
  sales_methodology: string;
  geographic_focus: string[];
  accuracy_threshold: number; // >= 0.90
}

// Utility types
export type AgentCreateInput = Omit<Agent, 'id' | 'created_at' | 'updated_at'>;
export type AgentUpdateInput = Partial<Omit<Agent, 'id' | 'name' | 'created_at' | 'updated_at'>>;

// Constants
export const DOMAIN_COLORS: Record<DomainExpertise, string> = {
  [DomainExpertise.MEDICAL]: '#10B981',      // Green - Health/Clinical
  [DomainExpertise.REGULATORY]: '#3B82F6',   // Blue - Compliance/Rules
  [DomainExpertise.LEGAL]: '#7C3AED',        // Purple - Law/Legal
  [DomainExpertise.FINANCIAL]: '#8B5CF6',    // Violet - Finance/Economics
  [DomainExpertise.BUSINESS]: '#F59E0B',     // Amber - Strategy/Business
  [DomainExpertise.TECHNICAL]: '#06B6D4',    // Cyan - Technology/IT
  [DomainExpertise.COMMERCIAL]: '#EC4899',   // Pink - Sales/Commercial
  [DomainExpertise.ACCESS]: '#14B8A6',       // Teal - Market Access/Reimbursement
  [DomainExpertise.GENERAL]: '#6B7280'       // Gray - General/Default
};

export const ACCURACY_THRESHOLDS: Record<DomainExpertise, number> = {
  [DomainExpertise.MEDICAL]: 0.95,
  [DomainExpertise.REGULATORY]: 0.97,
  [DomainExpertise.LEGAL]: 0.98,
  [DomainExpertise.FINANCIAL]: 0.95,
  [DomainExpertise.BUSINESS]: 0.85,
  [DomainExpertise.TECHNICAL]: 0.90,
  [DomainExpertise.COMMERCIAL]: 0.90,
  [DomainExpertise.ACCESS]: 0.95,
  [DomainExpertise.GENERAL]: 0.80
};

// ============================================================================
// Agent Relationship Types
// ============================================================================

export interface AgentPeerRelationship {
  agent_id: string;
  peer_agent_id: string;
  relationship_type: 'peer' | 'collaborator' | 'advisor';
  created_at?: Date | string;
  peer_agent?: Agent; // Populated via join
}

export interface AgentManagementRelationship {
  manager_agent_id: string;
  managed_agent_id: string;
  delegation_type: 'direct' | 'on_demand' | 'supervised';
  created_at?: Date | string;
  managed_agent?: Agent; // Populated via join
}

export interface AgentToneModifierAssignment {
  agent_id: string;
  tone_modifier_id: string;
  is_default: boolean;
  context_trigger?: string;
  tone_modifier?: ToneModifier; // Populated via join
}

export interface AgentEscalationTrigger {
  id: string;
  agent_id: string;
  trigger_condition: string;
  trigger_type: 'automatic' | 'manual' | 'conditional';
  priority: number;
  display_order: number;
  is_active: boolean;
}

export interface AgentRegulatoryJurisdiction {
  id: string;
  agent_id: string;
  jurisdiction_code: string;
  jurisdiction_name: string;
  is_primary: boolean;
}

export interface RegulatoryJurisdiction {
  jurisdiction_code: string;
  jurisdiction_name: string;
  region?: string;
  display_order: number;
  is_active: boolean;
}

// ============================================================================
// Agent Form State Types (for UI)
// ============================================================================

/**
 * Form state for editing agents with comprehensive configuration.
 * Organized by UI tab structure for the enhanced edit form.
 */
export interface AgentEditFormState {
  // Tab 1: Basic Info
  name: string;
  tagline: string;
  description: string;
  avatar_url: string;
  avatar_description: string;
  version: string;

  // Tab 2: Organization
  function_id: string;
  department_id: string;
  role_id: string;

  // Tab 3: Level & Model (with AI suggestions)
  agent_level_id: string;
  base_model: string;
  temperature: number;
  max_tokens: number;
  context_window: number;
  cost_per_query: number;
  token_budget_min: number;
  token_budget_max: number;
  token_budget_recommended: number;
  model_justification: string;
  model_citation: string;

  // Tab 4: Personality & Style
  persona_archetype_id: string;
  communication_style_id: string;
  personality_formality: number;
  personality_empathy: number;
  personality_directness: number;
  personality_detail_orientation: number;
  personality_proactivity: number;
  personality_risk_tolerance: number;
  comm_verbosity: number;
  comm_technical_level: number;
  comm_warmth: number;

  // Tab 5: Response Preferences
  preferred_response_format: ResponseFormat;
  include_citations: boolean;
  include_confidence_scores: boolean;
  include_limitations: boolean;

  // Tab 6: 6-Section Prompt Builder
  prompt_section_you_are: string;
  prompt_section_you_do: string;
  prompt_section_you_never: string;
  prompt_section_success_criteria: string;
  prompt_section_when_unsure: string;
  prompt_section_evidence: string;

  // Tab 7: Hierarchy & Relationships
  reports_to_agent_id: string;
  can_escalate_to: string;
  can_spawn_l2: boolean;
  can_spawn_l3: boolean;
  can_spawn_l4: boolean;
  can_use_worker_pool: boolean;

  // Tab 8: Success Criteria (slider-adjustable)
  success_criteria: AgentSuccessCriteria[];

  // Tab 9: Safety & Compliance
  hipaa_compliant: boolean;
  audit_trail_enabled: boolean;
  data_classification: DataClassification;
  expertise_level: ExpertiseLevel;
  expertise_years: number;
  geographic_scope: GeographicScope;
  industry_specialization: string;

  // Tab 10: Capabilities & Skills
  capabilities: string[];
  skills: string[];
  responsibilities: string[];

  // Tab 11: Knowledge & RAG
  knowledge_domains: string[];
  rag_enabled: boolean;

  // Tab 12: Tools
  tools: string[];

  // Status
  status: AgentStatus;
  validation_status: ValidationStatus;
}

/**
 * Slider configuration for UI controls
 */
export interface SliderConfig {
  field: string;
  label: string;
  description?: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  leftLabel?: string;
  rightLabel?: string;
  showValue?: boolean;
  category: 'model' | 'personality' | 'communication' | 'success_criteria';
}

/**
 * Default slider configurations for agent form
 */
export const PERSONALITY_SLIDERS: SliderConfig[] = [
  {
    field: 'personality_formality',
    label: 'Formality',
    description: 'How formal vs. casual the communication style is',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 70,
    leftLabel: 'Casual',
    rightLabel: 'Formal',
    showValue: true,
    category: 'personality'
  },
  {
    field: 'personality_empathy',
    label: 'Empathy',
    description: 'How empathetic and emotionally supportive the agent is',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    leftLabel: 'Objective',
    rightLabel: 'Empathetic',
    showValue: true,
    category: 'personality'
  },
  {
    field: 'personality_directness',
    label: 'Directness',
    description: 'How direct vs. diplomatic the communication is',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 70,
    leftLabel: 'Diplomatic',
    rightLabel: 'Direct',
    showValue: true,
    category: 'personality'
  },
  {
    field: 'personality_detail_orientation',
    label: 'Detail Orientation',
    description: 'How much detail is included in responses',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 60,
    leftLabel: 'Concise',
    rightLabel: 'Detailed',
    showValue: true,
    category: 'personality'
  },
  {
    field: 'personality_proactivity',
    label: 'Proactivity',
    description: 'How proactive vs. reactive the agent is',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    leftLabel: 'Reactive',
    rightLabel: 'Proactive',
    showValue: true,
    category: 'personality'
  },
  {
    field: 'personality_risk_tolerance',
    label: 'Risk Tolerance',
    description: 'How risk-averse vs. risk-tolerant in recommendations',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 30,
    leftLabel: 'Risk-Averse',
    rightLabel: 'Risk-Tolerant',
    showValue: true,
    category: 'personality'
  }
];

export const COMMUNICATION_SLIDERS: SliderConfig[] = [
  {
    field: 'comm_verbosity',
    label: 'Verbosity',
    description: 'How verbose or concise responses are',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    leftLabel: 'Concise',
    rightLabel: 'Verbose',
    showValue: true,
    category: 'communication'
  },
  {
    field: 'comm_technical_level',
    label: 'Technical Level',
    description: 'How technical vs. accessible the language is',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    leftLabel: 'Accessible',
    rightLabel: 'Technical',
    showValue: true,
    category: 'communication'
  },
  {
    field: 'comm_warmth',
    label: 'Warmth',
    description: 'How warm and friendly vs. professional the tone is',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    leftLabel: 'Professional',
    rightLabel: 'Warm',
    showValue: true,
    category: 'communication'
  }
];

export const MODEL_SLIDERS: SliderConfig[] = [
  {
    field: 'temperature',
    label: 'Temperature',
    description: 'Controls randomness in responses (lower = more deterministic)',
    min: 0,
    max: 2,
    step: 0.1,
    defaultValue: 0.4,
    leftLabel: 'Deterministic',
    rightLabel: 'Creative',
    showValue: true,
    category: 'model'
  },
  {
    field: 'max_tokens',
    label: 'Max Tokens',
    description: 'Maximum response length',
    min: 500,
    max: 8000,
    step: 500,
    defaultValue: 3000,
    leftLabel: 'Short',
    rightLabel: 'Long',
    showValue: true,
    category: 'model'
  },
  {
    field: 'context_window',
    label: 'Context Window',
    description: 'Maximum context the model can use',
    min: 1000,
    max: 32000,
    step: 1000,
    defaultValue: 8000,
    leftLabel: 'Small',
    rightLabel: 'Large',
    showValue: true,
    category: 'model'
  }
];

export const TOKEN_BUDGET_SLIDERS: SliderConfig[] = [
  {
    field: 'token_budget_min',
    label: 'Minimum Budget',
    description: 'Minimum token budget for responses',
    min: 100,
    max: 3000,
    step: 100,
    defaultValue: 1000,
    leftLabel: '100',
    rightLabel: '3000',
    showValue: true,
    category: 'model'
  },
  {
    field: 'token_budget_max',
    label: 'Maximum Budget',
    description: 'Maximum token budget for responses',
    min: 500,
    max: 5000,
    step: 100,
    defaultValue: 2000,
    leftLabel: '500',
    rightLabel: '5000',
    showValue: true,
    category: 'model'
  },
  {
    field: 'token_budget_recommended',
    label: 'Recommended Budget',
    description: 'Ideal token budget for typical responses',
    min: 200,
    max: 4000,
    step: 100,
    defaultValue: 1500,
    leftLabel: '200',
    rightLabel: '4000',
    showValue: true,
    category: 'model'
  }
];

// ============================================================================
// Agent Level Constants
// ============================================================================

export const AGENT_LEVEL_DEFAULTS: Record<AgentLevelNumber, Partial<AgentLevelDefaults>> = {
  1: {
    level_number: 1,
    level_name: 'MASTER',
    level_code: 'L1',
    default_model: 'gpt-4',
    default_temperature: 0.2,
    default_max_tokens: 4000,
    default_context_window: 16000,
    default_cost_per_query: 0.35,
    default_token_budget_min: 2000,
    default_token_budget_max: 2500,
    default_token_budget_recommended: 2200,
    default_can_spawn_l2: true,
    default_can_spawn_l3: true,
    default_can_spawn_l4: true,
    default_can_use_worker_pool: true,
    default_can_escalate_to: 'HITL',
    description: 'Strategic coordinator agents that orchestrate complex multi-domain tasks'
  },
  2: {
    level_number: 2,
    level_name: 'EXPERT',
    level_code: 'L2',
    default_model: 'gpt-4',
    default_temperature: 0.4,
    default_max_tokens: 3000,
    default_context_window: 8000,
    default_cost_per_query: 0.12,
    default_token_budget_min: 1500,
    default_token_budget_max: 2000,
    default_token_budget_recommended: 1700,
    default_can_spawn_l2: false,
    default_can_spawn_l3: true,
    default_can_spawn_l4: true,
    default_can_use_worker_pool: true,
    default_can_escalate_to: 'L1',
    description: 'Domain experts providing deep specialized knowledge'
  },
  3: {
    level_number: 3,
    level_name: 'SPECIALIST',
    level_code: 'L3',
    default_model: 'gpt-4-turbo',
    default_temperature: 0.4,
    default_max_tokens: 2000,
    default_context_window: 8000,
    default_cost_per_query: 0.10,
    default_token_budget_min: 1000,
    default_token_budget_max: 1500,
    default_token_budget_recommended: 1200,
    default_can_spawn_l2: false,
    default_can_spawn_l3: false,
    default_can_spawn_l4: false,
    default_can_use_worker_pool: true,
    default_can_escalate_to: 'L2',
    description: 'Focused task specialists for specific domain work'
  },
  4: {
    level_number: 4,
    level_name: 'WORKER',
    level_code: 'L4',
    default_model: 'gpt-3.5-turbo',
    default_temperature: 0.6,
    default_max_tokens: 2000,
    default_context_window: 4000,
    default_cost_per_query: 0.015,
    default_token_budget_min: 300,
    default_token_budget_max: 500,
    default_token_budget_recommended: 400,
    default_can_spawn_l2: false,
    default_can_spawn_l3: false,
    default_can_spawn_l4: false,
    default_can_use_worker_pool: false,
    default_can_escalate_to: undefined,
    description: 'Stateless workers for high-volume data tasks'
  },
  5: {
    level_number: 5,
    level_name: 'TOOL',
    level_code: 'L5',
    default_model: 'none',
    default_temperature: 0,
    default_max_tokens: 200,
    default_context_window: 1000,
    default_cost_per_query: 0.001,
    default_token_budget_min: 100,
    default_token_budget_max: 200,
    default_token_budget_recommended: 150,
    default_can_spawn_l2: false,
    default_can_spawn_l3: false,
    default_can_spawn_l4: false,
    default_can_use_worker_pool: false,
    default_can_escalate_to: undefined,
    description: 'Deterministic tools with no LLM required'
  }
};

// ============================================================================
// Persona Archetype Constants
// ============================================================================

export const PERSONA_ARCHETYPE_LABELS: Record<PersonaArchetypeCode, string> = {
  clinical_expert: 'Clinical Expert',
  regulatory_authority: 'Regulatory Authority',
  data_analyst: 'Data Analyst',
  safety_officer: 'Safety Officer',
  research_specialist: 'Research Specialist',
  business_strategist: 'Business Strategist',
  operations_manager: 'Operations Manager',
  compliance_guardian: 'Compliance Guardian',
  innovation_advisor: 'Innovation Advisor',
  patient_advocate: 'Patient Advocate'
};

export const PERSONA_ARCHETYPE_DESCRIPTIONS: Record<PersonaArchetypeCode, string> = {
  clinical_expert: 'Medical/pharmaceutical specialists with evidence-focused, compassionate communication',
  regulatory_authority: 'FDA, EMA, compliance specialists with formal, precise communication',
  data_analyst: 'Metrics and analytics specialists with data-driven, objective communication',
  safety_officer: 'Risk and pharmacovigilance specialists with cautious, thorough communication',
  research_specialist: 'Clinical trials and R&D specialists with scientific, methodical communication',
  business_strategist: 'Commercial and market access specialists with strategic, ROI-oriented communication',
  operations_manager: 'Manufacturing and supply chain specialists with process-oriented, practical communication',
  compliance_guardian: 'Legal and regulatory compliance specialists with risk-averse, policy-focused communication',
  innovation_advisor: 'Digital health and technology specialists with forward-thinking, solution-oriented communication',
  patient_advocate: 'Patient engagement specialists with accessible, empathetic, health-literacy focused communication'
};

// ============================================================================
// Agent Hierarchy & Subagent Configuration Types
// ============================================================================

/**
 * Represents a recommended subagent based on domain matching
 */
export interface RecommendedSubagent {
  agent_id: string;
  agent_name: string;
  agent_level: AgentLevelNumber;
  domain_expertise?: DomainExpertise;
  match_score: number; // 0-1 confidence score
  match_reasons: string[]; // Why this agent was recommended
}

/**
 * Represents a configured subagent assignment
 */
export interface ConfiguredSubagent {
  agent_id: string;
  agent_name: string;
  agent_level: AgentLevelNumber;
  priority: number; // 1 = primary, 2+ = fallback
  is_enabled: boolean;
  assignment_type: 'recommended' | 'manual'; // How it was assigned
  configured_at?: string;
}

/**
 * Configuration for L4 Worker agents
 */
export interface L4WorkersConfig {
  recommended: RecommendedSubagent[];
  configured: ConfiguredSubagent[];
  use_pool: boolean; // Whether to use worker pool for load balancing
  max_concurrent: number; // Max concurrent worker invocations
}

/**
 * Configuration for L5 Tool agents
 */
export interface L5ToolsConfig {
  recommended: RecommendedSubagent[];
  configured: ConfiguredSubagent[];
}

/**
 * Context Engineer configuration for deep agent workflows
 */
export interface ContextEngineerConfig {
  agent_id?: string;
  agent_name?: string;
  is_enabled: boolean;
  context_strategy: 'full' | 'summarize' | 'selective'; // How context is managed
}

/**
 * Complete subagent hierarchy configuration stored in agent.metadata
 * This structure enables the modal UI to configure and LangGraph to read
 */
export interface SubagentHierarchyConfig {
  // L4 Worker agents this agent can spawn
  l4_workers: L4WorkersConfig;

  // L5 Tool agents this agent can use
  l5_tools: L5ToolsConfig;

  // Context Engineer for managing context in deep workflows
  context_engineer: ContextEngineerConfig;

  // Additional L2/L3 experts this agent can escalate to or consult
  expert_consultants?: {
    recommended: RecommendedSubagent[];
    configured: ConfiguredSubagent[];
  };

  // Metadata about when hierarchy was last configured
  last_configured_at?: string;
  configured_by?: string;
}

/**
 * Extended Agent interface with spawning relationships
 * Used when fetching agent with full hierarchy data
 */
export interface AgentWithRelationships extends Agent {
  // Parent relationships (agents that can spawn this one)
  spawning_relationships_parent?: SpawningRelationship[];

  // Child relationships (agents this one can spawn)
  spawning_relationships_child?: SpawningRelationship[];

  // Parsed hierarchy config from metadata
  hierarchy_config?: SubagentHierarchyConfig;
}

/**
 * Spawning relationship between agents
 */
export interface SpawningRelationship {
  id: string;
  parent_agent_id: string;
  child_agent_id: string;
  relationship_type: 'spawn' | 'delegate' | 'escalate' | 'consult';
  is_enabled: boolean;
  priority: number;
  created_at?: string;

  // Populated via join
  parent_agent?: Pick<Agent, 'id' | 'name' | 'agent_levels'>;
  child_agent?: Pick<Agent, 'id' | 'name' | 'agent_levels'>;
}

/**
 * Request to fetch recommended subagents based on parent agent's domain
 */
export interface RecommendSubagentsRequest {
  parent_agent_id: string;
  target_level: AgentLevelNumber;
  domain_expertise?: DomainExpertise;
  department_name?: string;
  function_name?: string;
  limit?: number;
}

/**
 * Response containing recommended subagents
 */
export interface RecommendSubagentsResponse {
  recommendations: RecommendedSubagent[];
  total_available: number;
  match_criteria: {
    domain_match: boolean;
    department_match: boolean;
    function_match: boolean;
  };
}

/**
 * Default hierarchy config for new agents
 */
export const DEFAULT_HIERARCHY_CONFIG: SubagentHierarchyConfig = {
  l4_workers: {
    recommended: [],
    configured: [],
    use_pool: true,
    max_concurrent: 3,
  },
  l5_tools: {
    recommended: [],
    configured: [],
  },
  context_engineer: {
    is_enabled: false,
    context_strategy: 'summarize',
  },
};