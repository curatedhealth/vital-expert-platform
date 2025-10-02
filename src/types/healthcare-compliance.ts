// Healthcare Compliance Types for VITALpath Agent Library
// Implements SCAFFOLD Framework Phase 3 requirements with HIPAA and FDA compliance

// PHARMA Protocol Framework
export interface PHARMAProtocol {
  purpose: string; // Purpose alignment with medical objectives
  hypothesis: string; // Hypothesis generation for clinical questions
  audience: string; // Audience-specific formatting (clinician vs regulator)
  requirements: string; // Requirements compliance checking
  metrics: string; // Metrics for medical accuracy
  actions: string; // Actionable medical insights
}

// VERIFY Protocol Framework
export interface VERIFYProtocol {
  min_impact_factor: number; // Minimum impact factor for sources (>3.0)
  guidelines: string[]; // Clinical guidelines to reference
  expert_threshold: number; // Confidence threshold for expert review (0.8)
  citation_format: string; // Required citation format
  evidence_requirements: string; // Evidence quality requirements
}

// Medical Capability with Healthcare Compliance
export interface MedicalCapability {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;

  // Medical Domain Information
  medical_domain: string; // 'Regulatory Affairs', 'Clinical Research', etc.
  accuracy_threshold: number; // Minimum accuracy requirement (0-1)
  citation_required: boolean; // Medical facts need citations

  // Protocol Integration
  pharma_protocol: PHARMAProtocol | null;
  verify_protocol: VERIFYProtocol | null;

  // Regulatory Classification
  fda_classification?: string; // SaMD classification if applicable
  hipaa_relevant: boolean;

  // System Prompt Configuration
  system_prompt_template: string;

  // Validation Status
  clinical_validation_status: 'pending' | 'validated' | 'expired' | 'under_review';
  last_clinical_review?: string;
  validation_rules: Record<string, unknown>;

  // Performance
  complexity_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  usage_count: number;
  success_rate: number;

  // Audit Trail (FDA 21 CFR Part 11)
  audit_trail: Record<string, unknown>;

  created_at: string;
  updated_at: string;
}

// Medical Competency (sub-capability)
export interface MedicalCompetency {
  id: string;
  capability_id: string;
  name: string;
  description: string;
  prompt_snippet: string; // Snippet to inject into system prompt

  // Medical Requirements
  medical_accuracy_requirement: number; // 0-1 scale
  evidence_level: string; // 'Level I', 'Level II', 'Expert Opinion'
  clinical_guidelines_reference: string[]; // Array of guideline references
  required_knowledge: Record<string, unknown>; // Required medical knowledge domains

  // Medical Coding
  icd_codes?: string[]; // Relevant ICD-10 codes
  snomed_codes?: string[]; // Relevant SNOMED CT codes

  // Configuration
  order_priority: number;
  is_required: boolean;
  requires_medical_review: boolean;

  // Quality Metrics
  quality_metrics: Record<string, unknown>;

  created_at: string;
  updated_at: string;
  audit_log: Record<string, unknown>;
}

// Healthcare Business Function
export interface HealthcareBusinessFunction {
  id: string;
  name?: string; // Legacy field for backward compatibility
  department?: string; // Legacy field
  department_name?: string; // New field from org_functions
  unique_id?: string; // From org_functions
  description?: string; // From org_functions
  migration_ready?: boolean; // From org_functions
  healthcare_category?: string; // 'Patient Care', 'Research', 'Compliance'
  regulatory_requirements?: string[]; // FDA, EMA, etc.
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

// Healthcare Role
export interface HealthcareRole {
  id: string;
  name?: string; // Legacy field
  role_name?: string; // New field from org_roles
  role_title?: string; // New field from org_roles
  unique_id?: string; // From org_roles
  clinical_title?: string; // 'Physician', 'Clinical Research Coordinator'
  seniority_level?: string; // 'Junior', 'Senior', 'Mid', 'Executive', 'Entry'
  department?: string; // Legacy
  department_name?: string; // From org_roles
  department_id?: string; // Foreign key from org_roles
  function_area?: string; // From org_roles
  function_id?: string; // Foreign key from org_roles
  description?: string; // From org_roles
  requires_medical_license?: boolean;
  required_skills?: string[]; // From org_roles
  required_certifications?: string[]; // From org_roles
  years_experience_min?: number; // From org_roles
  years_experience_max?: number; // From org_roles
  default_capabilities?: string[];
  compliance_requirements?: string[]; // HIPAA training, GCP, etc.
  migration_ready?: boolean; // From org_roles
  is_active?: boolean; // From org_roles
  reports_to_role_id?: string; // From org_roles
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  metadata?: Record<string, unknown>; // From org_roles
}

// Medical Tool
export interface MedicalTool {
  id: string;
  name: string;
  tool_type: string; // 'clinical_search', 'regulatory_database', 'medical_calculator'
  api_endpoint?: string;
  configuration: Record<string, unknown>;

  // Medical Database Information
  medical_database: string; // 'PubMed', 'ClinicalTrials.gov', 'FDA'
  data_classification: string; // 'PHI', 'Public', 'Confidential'
  hipaa_compliant: boolean;

  // Access Control
  required_permissions: Record<string, unknown>;
  rate_limits: Record<string, unknown>;
  validation_endpoint?: string; // For medical fact checking

  // Status
  is_active: boolean;
  last_validation_check?: string;

  created_at: string;
  updated_at: string;
}

// Agent Capability Configuration with Medical Compliance
export interface AgentCapabilityConfig {
  agent_id: string;
  capability_id: string;
  competency_ids: string[]; // Array of selected competency IDs
  configuration: Record<string, unknown>;

  // Medical Validation
  medical_validation_required: boolean;
  clinical_accuracy_threshold: number; // 0-1 scale
  pharma_config?: Record<string, unknown>; // PHARMA protocol configuration
  verify_config?: Record<string, unknown>; // VERIFY protocol configuration

  // Validation Status
  is_primary: boolean;
  validated_by?: string; // Medical professional who validated
  validation_date?: string;

  // Performance
  proficiency_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  usage_count: number;
  success_rate: number;
  last_used_at?: string;

  created_at: string;
  updated_at: string;
}

// System Prompt Generation Audit (HIPAA/FDA Compliant)
export interface SystemPromptAudit {
  id: string;
  agent_id: string;
  generated_prompt: string;
  capability_contributions: Record<string, unknown>; // Track which capabilities contributed
  tool_configurations: Record<string, unknown>;

  // Protocol Compliance
  pharma_protocol_included: boolean;
  verify_protocol_included: boolean;
  medical_disclaimers: string[];

  // Version Control
  version: number;
  clinical_validation_status: 'pending' | 'validated' | 'expired';
  is_active: boolean;

  // Approval Workflow
  generated_at: string;
  generated_by?: string; // User who generated
  approved_by?: string; // Medical professional who approved
  approval_date?: string;

  // FDA 21 CFR Part 11 Compliance
  audit_log: Record<string, unknown>; // Complete change history
}

// Medical Validation Record
export interface MedicalValidation {
  id: string;
  entity_type: 'agent' | 'capability' | 'competency';
  entity_id: string;
  validation_type: string; // 'accuracy', 'safety', 'compliance'
  validation_result: Record<string, unknown>;
  accuracy_score?: number;

  // Validator Information
  validator_id?: string; // Medical professional ID
  validator_credentials: string;
  validation_date: string;
  expiration_date?: string;
  notes?: string;

  // Audit Trail
  audit_trail: Record<string, unknown>;
}

// PHI Access Log (HIPAA Requirement)
export interface PHIAccessLog {
  id: string;
  agent_id?: string;
  user_id?: string;
  access_type: 'read' | 'write' | 'process';
  data_classification: 'PHI' | 'De-identified' | 'Public';
  purpose: string;
  patient_id_hash?: string; // Hashed patient ID if applicable
  timestamp: string;
  ip_address?: string;
  session_id?: string;
  audit_metadata: Record<string, unknown>;
}

// Agent Usage Mode
export enum AgentUsageMode {
  STANDALONE = 'standalone',        // Single agent in direct conversation
  ORCHESTRATED_TEAM = 'team',      // Multiple agents collaborating in chat
  WORKFLOW_COMPONENT = 'workflow'   // Agent as workflow building block
}

// Mode-Specific Configuration
export interface ModeSpecificConfig {
  mode: AgentUsageMode;

  // Standalone Configuration
  standalone?: {
    persistentContext: boolean;
    maxTurns: number;
    contextWindow: number;
    memoryRetention: 'session' | 'persistent';
  };

  // Team Configuration
  team?: {
    leadAgent: string;
    specialistAgents: string[];
    orchestrationStrategy: 'sequential' | 'parallel' | 'conditional' | 'dynamic';
    handoffProtocol: 'explicit' | 'implicit' | 'capability-triggered';
    contextSharing: 'full' | 'filtered' | 'summary';
  };

  // Workflow Configuration
  workflow?: {
    nodeType: 'processor' | 'decision' | 'generator' | 'validator';
    inputSchema: Record<string, unknown>;
    outputSchema: Record<string, unknown>;
    triggerConditions: Record<string, unknown>;
    errorHandling: Record<string, unknown>;
  };
}

// Healthcare Performance Metrics
export interface HealthcarePerformanceMetrics {
  // Clinical Performance
  medical_accuracy: number; // >95% required
  citation_accuracy: number; // 100% required for medical claims
  hallucination_rate: number; // <1% required
  clinical_validation_status: string;
  evidence_quality_score: number; // >90% from peer-reviewed sources

  // Compliance Metrics
  hipaa_compliance_score: number; // 100% required
  fda_cfr_21_part_11_compliance: number; // 100% required
  phi_access_compliance: number; // 100% of accesses logged
  audit_trail_completeness: number; // 100% required

  // Operational Metrics
  response_time_medical: number; // <2s with citations
  capability_loading_time: number; // <100ms with validation
  system_prompt_generation_time: number; // <500ms with protocols

  // Quality Metrics
  pharma_protocol_compliance: number; // 100% when enabled
  verify_protocol_compliance: number; // 100% when enabled
  medical_reviewer_approval_rate: number;
  clinical_guideline_adherence: number;
}

// Capability Selection with Medical Context
export interface CapabilitySelectionContext {
  businessFunction: HealthcareBusinessFunction;
  role: HealthcareRole;
  medicalSpecialty: string;
  complianceRequirements: string[];
  accuracyThreshold: number;
  hipaaRequired: boolean;
  fdaRegulated: boolean;
}

// Dynamic System Prompt Generation
export interface SystemPromptGenerationRequest {
  agentId: string;
  selectedCapabilities: string[];
  competencySelection: Record<string, string[]>;
  mode: AgentUsageMode;
  medicalContext: CapabilitySelectionContext;
  pharmaProtocolRequired: boolean;
  verifyProtocolRequired: boolean;
  includeTools: boolean;
  includeConstraints: boolean;
}

export interface SystemPromptGenerationResponse {
  content: string;
  metadata: {
    tokenCount: number;
    capabilities: MedicalCapability[];
    competencies: MedicalCompetency[];
    tools: MedicalTool[];
    pharmaProtocolIncluded: boolean;
    verifyProtocolIncluded: boolean;
    medicalDisclaimers: string[];
    complianceLevel: string;
  };
  contributions: {
    capabilities: Record<string, unknown>;
    competencies: Record<string, unknown>;
    tools: Record<string, unknown>;
  };
  version: number;
  validationRequired: boolean;
}

// Export commonly used types
export type {
  MedicalCapability as Capability,
  MedicalCompetency as Competency,
  MedicalTool as Tool,
  HealthcareBusinessFunction as BusinessFunction,
  HealthcareRole as Role
};