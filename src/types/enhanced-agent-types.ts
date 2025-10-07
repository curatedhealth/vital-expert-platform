/**
 * Enhanced Agent Types
 * Based on Enhanced AI Agent Template v2.0
 * Supports comprehensive agent configuration with reasoning frameworks,
 * behavioral directives, safety compliance, and advanced features
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type ArchitecturePattern = 'REACTIVE' | 'HYBRID' | 'DELIBERATIVE' | 'MULTI_AGENT';
export type ReasoningMethod = 'DIRECT' | 'COT' | 'REACT' | 'HYBRID' | 'MULTI_PATH';
export type CostProfile = 'LOW' | 'MEDIUM' | 'HIGH';
export type Urgency = 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Compatibility = 'BREAKING' | 'BACKWARD_COMPATIBLE';
export type RetentionStrategy = 'FIFO' | 'LIFO' | 'PRIORITY';
export type ConsensusMechanism = 'MAJORITY' | 'UNANIMOUS' | 'WEIGHTED';
export type FeedbackMode = 'REALTIME' | 'BATCH' | 'MANUAL' | 'DISABLED';

// ============================================================================
// CAPABILITIES DETAIL
// ============================================================================

export interface ExpertCapability {
  name: string;
  proficiency: number; // 0.0 to 1.0
  proficiency_description?: string; // e.g., "Expert", "Advanced"
  application: string;
  years_experience_equivalent?: number;
}

export interface CapabilitiesDetail {
  expert: ExpertCapability[];
  competent: string[];
  limitations: string[];
}

// ============================================================================
// BEHAVIORAL DIRECTIVES
// ============================================================================

export interface OperatingPrinciple {
  name: string;
  description: string;
  priority: number;
}

export interface DecisionFramework {
  scenario: string;
  always: string;
  never: string;
  consider: string;
}

export interface CommunicationProtocol {
  tone: string;
  style: string;
  complexity_level: string;
  language_constraints?: string;
  response_structure?: string[];
}

export interface BehavioralDirectives {
  operating_principles: OperatingPrinciple[];
  decision_framework: DecisionFramework[];
  communication_protocol: CommunicationProtocol;
}

// ============================================================================
// REASONING FRAMEWORKS
// ============================================================================

export interface CoTConfig {
  enabled: boolean;
  activation_triggers: string[];
  steps_template?: string[];
  max_steps?: number;
  confidence_threshold?: number;
}

export interface ReActConfig {
  enabled: boolean;
  max_iterations: number;
  loop_pattern: string;
  timeout_ms?: number;
}

export interface SelfConsistencyVerification {
  enabled: boolean;
  num_paths: number;
  consensus_threshold: number;
  divergence_handling?: string;
}

export interface MetacognitiveMonitoring {
  enabled: boolean;
  check_questions: string[];
  frequency?: string;
}

export interface ReasoningFrameworks {
  primary_method: ReasoningMethod;
  cot_config: CoTConfig;
  react_config: ReActConfig;
  self_consistency_verification?: SelfConsistencyVerification;
  metacognitive_monitoring: MetacognitiveMonitoring;
}

// ============================================================================
// TOOL INTEGRATION
// ============================================================================

export interface ToolDetail {
  name: string;
  display_name?: string;
  purpose: string;
  when_to_use: string;
  rate_limit_per_hour?: number;
  rate_limit_per_minute?: number;
  cost_profile: CostProfile;
  cost_per_call?: number;
  safety_checks: string[];
  expected_output: string;
  timeout_ms?: number;
  retry_policy?: string;
  max_retries?: number;
}

export interface ToolChaining {
  sequential_patterns?: string[];
  parallel_patterns?: string[];
  conditional_patterns?: string[];
}

// ============================================================================
// SAFETY & COMPLIANCE
// ============================================================================

export interface SafetyCompliance {
  prohibitions: string[];
  mandatory_protections: string[];
  regulatory_standards: string[];
  compliance_frameworks: string[];
  data_handling_policy?: string;
  privacy_framework?: string;
  audit_requirements?: string;
}

// ============================================================================
// ESCALATION
// ============================================================================

export interface EscalationTrigger {
  trigger: string;
  condition: string;
  route_to_tier: number;
  route_to_role: string;
  urgency: Urgency;
  sla_hours?: number;
}

export interface UncertaintyHandling {
  low_confidence_threshold: number;
  medium_confidence_threshold: number;
  high_confidence_threshold: number;
  action_below_threshold: string;
}

export interface EscalationConfig {
  triggers: EscalationTrigger[];
  uncertainty_handling: UncertaintyHandling;
}

// ============================================================================
// OUTPUT SPECIFICATIONS
// ============================================================================

export interface StandardFormat {
  include_confidence: boolean;
  include_reasoning_trace: boolean;
  include_evidence: boolean;
  include_recommendations: boolean;
  include_caveats: boolean;
  include_metadata: boolean;
}

export interface CitationRequirements {
  minimum_sources?: number;
  prefer_peer_reviewed?: boolean;
  include_publication_date?: boolean;
  include_relevance_score?: boolean;
}

export interface ConfidenceScale {
  [range: string]: string;
}

export interface OutputSpecifications {
  standard_format: StandardFormat;
  citation_format: string;
  citation_requirements?: CitationRequirements;
  confidence_scale?: ConfidenceScale;
}

// ============================================================================
// QUALITY METRICS
// ============================================================================

export interface QualityMetrics {
  accuracy_target: number;
  response_time_target_ms: number;
  completeness_target: number;
  user_satisfaction_target: number;
  reasoning_efficiency_target?: number;
  tool_utilization_efficiency?: number;
  escalation_appropriateness?: number;
}

export interface SuccessCriteria {
  task_completion: string[];
  user_outcomes: string[];
  compliance: string[];
}

// ============================================================================
// MEMORY & CONTEXT (Future)
// ============================================================================

export interface ShortTermMemory {
  enabled: boolean;
  capacity_tokens: number;
  retention_strategy: RetentionStrategy;
  pruning_policy: string;
  critical_items: string[];
}

export interface LongTermMemory {
  enabled: boolean;
  storage_backend: string;
  indexing_strategy: string;
  retrieval_method: string;
  update_frequency: string;
}

export interface MemoryConfig {
  short_term_memory: ShortTermMemory;
  long_term_memory: LongTermMemory;
}

// ============================================================================
// MULTI-AGENT COORDINATION (Future)
// ============================================================================

export interface SpecialistAgent {
  agent_id: string;
  specialty: string;
  triggers: string[];
}

export interface MultiAgentConfig {
  enabled: boolean;
  architecture_pattern: string;
  coordinator_agent_id?: string;
  communication_protocol: string;
  specialist_agents: SpecialistAgent[];
  consensus_mechanism: ConsensusMechanism;
  conflict_resolution: string;
}

// ============================================================================
// LEARNING & IMPROVEMENT (Future)
// ============================================================================

export interface LearningConfig {
  feedback_incorporation: FeedbackMode;
  knowledge_base_updates: string;
  reasoning_pattern_refinement: boolean;
  error_pattern_analysis: string;
  self_assessment_enabled: boolean;
  learning_rate?: number;
}

// ============================================================================
// VERSION CONTROL
// ============================================================================

export interface VersionControl {
  current_version: string;
  previous_version?: string;
  change_log: string;
  compatibility: Compatibility;
  migration_path?: string;
  deprecated_features?: string[];
  new_features?: string[];
}

// ============================================================================
// ENHANCED AGENT METADATA
// ============================================================================

export interface EnhancedAgentMetadata {
  // ========== Existing fields (keep) ==========
  tools?: string[];
  tool_keys?: string[];
  fitness_score?: number;
  responsibilities?: string[];
  fitness_dimensions?: Record<string, number>;
  model_justification?: string;
  model_citation?: string;
  safety_critical?: boolean;
  medical_model?: boolean;
  guidance?: string;

  // ========== NEW: Enhanced Template Fields ==========
  capabilities_detail?: CapabilitiesDetail;
  behavioral_directives?: BehavioralDirectives;
  reasoning_frameworks?: ReasoningFrameworks;
  tools_detail?: ToolDetail[];
  tool_chaining?: ToolChaining;
  safety_compliance?: SafetyCompliance;
  escalation_config?: EscalationConfig;
  output_specifications?: OutputSpecifications;
  quality_metrics?: QualityMetrics;
  success_criteria?: SuccessCriteria;

  // ========== Future Features ==========
  memory_config?: MemoryConfig;
  multi_agent_config?: MultiAgentConfig;
  learning_config?: LearningConfig;
  version_control?: VersionControl;

  // Allow any additional metadata
  [key: string]: any;
}

// ============================================================================
// ENHANCED AGENT TYPE
// ============================================================================

export interface EnhancedAgent {
  // ========== Core Identity ==========
  id: string;
  name: string;
  display_name: string;
  description: string;
  tier: number;

  // ========== NEW: Architecture & Reasoning ==========
  architecture_pattern: ArchitecturePattern;
  reasoning_method: ReasoningMethod;
  communication_tone?: string;
  communication_style?: string;
  complexity_level?: string;
  primary_mission?: string;
  value_proposition?: string;

  // ========== Organization ==========
  business_function?: string;
  business_function_id?: string;
  department?: string;
  department_id?: string;
  role?: string;
  role_id?: string;
  agent_role?: string;
  agent_role_id?: string;

  // ========== Model Configuration ==========
  model: string;
  temperature?: number;
  max_tokens?: number;
  context_window?: number;
  response_format?: string;

  // ========== Capabilities & Tools ==========
  capabilities: string[];
  tools?: string[];
  rag_enabled?: boolean;
  knowledge_sources?: Record<string, any>;
  knowledge_domains?: string[];

  // ========== Compliance & Safety ==========
  hipaa_compliant?: boolean;
  gdpr_compliant?: boolean;
  compliance_tags?: string[];
  regulatory_context?: Record<string, any>;
  data_classification?: string;
  audit_trail_enabled?: boolean;

  // ========== Performance & Monitoring ==========
  performance_metrics?: Record<string, any>;
  accuracy_score?: number;
  error_rate?: number;
  average_response_time?: number;
  total_interactions?: number;
  confidence_thresholds?: {
    low: number;
    medium: number;
    high: number;
  };

  // ========== Escalation & Coordination ==========
  parent_agent_id?: string;
  compatible_agents?: string[];
  incompatible_agents?: string[];
  escalation_rules?: Record<string, any>;
  workflow_positions?: Record<string, any>;

  // ========== Status & Lifecycle ==========
  status: string;
  availability_status?: string;
  validation_status?: string;

  // ========== Enhanced Metadata ==========
  metadata: EnhancedAgentMetadata;

  // ========== Timestamps ==========
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// ============================================================================
// FORM DATA TYPES (for UI)
// ============================================================================

export interface AgentFormData {
  // Basic Info
  name: string;
  displayName: string;
  description: string;
  tier: number;
  avatar?: string;
  color?: string;

  // Architecture & Reasoning
  architecturePattern: ArchitecturePattern;
  reasoningMethod: ReasoningMethod;
  communicationTone?: string;
  communicationStyle?: string;
  complexityLevel?: string;
  primaryMission?: string;
  valueProposition?: string;

  // Organization
  businessFunction?: string;
  department?: string;
  role?: string;

  // Model Configuration
  model: string;
  temperature?: number;
  maxTokens?: number;
  contextWindow?: number;

  // Capabilities
  capabilities: string[];
  expertCapabilities?: ExpertCapability[];
  competentCapabilities?: string[];
  limitations?: string[];

  // Behavioral Directives
  operatingPrinciples?: OperatingPrinciple[];
  decisionFramework?: DecisionFramework[];
  communicationProtocol?: CommunicationProtocol;

  // Reasoning Frameworks
  reasoningFrameworks?: ReasoningFrameworks;

  // Tools
  tools?: string[];
  toolsDetail?: ToolDetail[];
  toolChaining?: ToolChaining;

  // Knowledge & RAG
  ragEnabled?: boolean;
  knowledgeSources?: Record<string, any>;
  knowledgeDomains?: string[];

  // Safety & Compliance
  prohibitions?: string[];
  mandatoryProtections?: string[];
  regulatoryStandards?: string[];
  complianceFrameworks?: string[];
  hipaaCompliant?: boolean;
  gdprCompliant?: boolean;

  // Escalation
  escalationTriggers?: EscalationTrigger[];
  confidenceThresholds?: UncertaintyHandling;

  // Output & Quality
  outputSpecifications?: OutputSpecifications;
  qualityMetrics?: QualityMetrics;
  successCriteria?: SuccessCriteria;

  // System Prompt
  systemPrompt: string;

  // Metadata
  metadata?: EnhancedAgentMetadata;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AgentTier = 1 | 2 | 3;

export interface TierConfiguration {
  tier: AgentTier;
  label: string;
  architecturePattern: ArchitecturePattern;
  reasoningMethod: ReasoningMethod;
  accuracyTarget: number;
  responseTimeTarget: number;
  reactEnabled: boolean;
  selfConsistencyEnabled: boolean;
}

export const TIER_CONFIGS: Record<AgentTier, TierConfiguration> = {
  1: {
    tier: 1,
    label: 'Foundational Specialist',
    architecturePattern: 'REACTIVE',
    reasoningMethod: 'DIRECT',
    accuracyTarget: 0.90,
    responseTimeTarget: 2000,
    reactEnabled: false,
    selfConsistencyEnabled: false
  },
  2: {
    tier: 2,
    label: 'Advanced Specialist',
    architecturePattern: 'HYBRID',
    reasoningMethod: 'COT',
    accuracyTarget: 0.92,
    responseTimeTarget: 3000,
    reactEnabled: true,
    selfConsistencyEnabled: false
  },
  3: {
    tier: 3,
    label: 'Ultra-Specialist',
    architecturePattern: 'DELIBERATIVE',
    reasoningMethod: 'REACT',
    accuracyTarget: 0.95,
    responseTimeTarget: 5000,
    reactEnabled: true,
    selfConsistencyEnabled: true
  }
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateProficiency(proficiency: number): boolean {
  return proficiency >= 0 && proficiency <= 1;
}

export function validateEscalationTrigger(trigger: EscalationTrigger): boolean {
  return !!(
    trigger.trigger &&
    trigger.condition &&
    trigger.route_to_tier &&
    trigger.route_to_role &&
    trigger.urgency
  );
}

export function validateToolDetail(tool: ToolDetail): boolean {
  return !!(
    tool.name &&
    tool.purpose &&
    tool.when_to_use &&
    tool.cost_profile &&
    Array.isArray(tool.safety_checks)
  );
}

export function getTierConfig(tier: number): TierConfiguration {
  return TIER_CONFIGS[tier as AgentTier] || TIER_CONFIGS[1];
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_COT_CONFIG: CoTConfig = {
  enabled: true,
  activation_triggers: [
    'Complex problems requiring step-by-step decomposition',
    'Confidence below threshold (<0.75)',
    'Multi-criteria decision making'
  ],
  max_steps: 6,
  confidence_threshold: 0.75
};

export const DEFAULT_REACT_CONFIG: ReActConfig = {
  enabled: false,
  max_iterations: 5,
  loop_pattern: 'THOUGHT → ACTION → OBSERVATION → REFLECTION → ANSWER',
  timeout_ms: 30000
};

export const DEFAULT_UNCERTAINTY_HANDLING: UncertaintyHandling = {
  low_confidence_threshold: 0.70,
  medium_confidence_threshold: 0.85,
  high_confidence_threshold: 0.95,
  action_below_threshold: 'Apply CoT reasoning, present options, request clarification'
};

export const DEFAULT_QUALITY_METRICS: QualityMetrics = {
  accuracy_target: 0.90,
  response_time_target_ms: 2000,
  completeness_target: 0.85,
  user_satisfaction_target: 4.3,
  reasoning_efficiency_target: 5,
  tool_utilization_efficiency: 0.85,
  escalation_appropriateness: 0.95
};

export const DEFAULT_STANDARD_FORMAT: StandardFormat = {
  include_confidence: true,
  include_reasoning_trace: true,
  include_evidence: true,
  include_recommendations: true,
  include_caveats: true,
  include_metadata: true
};
