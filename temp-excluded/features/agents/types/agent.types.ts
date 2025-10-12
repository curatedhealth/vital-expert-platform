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

// Main Agent interface
export interface Agent {
  // Core Identity
  id?: string;
  name: string;
  display_name: string;
  description: string;
  avatar?: string;
  color?: string;
  version?: string;

  // AI Configuration
  model: string;
  system_prompt: string;
  temperature?: number;
  max_tokens?: number;
  rag_enabled?: boolean;
  context_window?: number;
  response_format?: 'markdown' | 'json' | 'text' | 'html';

  // Capabilities & Knowledge
  capabilities: string[];
  knowledge_domains?: string[];
  domain_expertise: DomainExpertise;
  competency_levels?: Record<string, unknown>;
  knowledge_sources?: Record<string, unknown>;
  tool_configurations?: Record<string, unknown>;

  // Business Context
  business_function?: string;
  role?: string;
  tier?: 1 | 2 | 3;
  priority?: number;
  implementation_phase?: 1 | 2 | 3;
  is_custom?: boolean;
  cost_per_query?: number;
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