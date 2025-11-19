/**
 * Complete 250-Agent Registry Definitions
 * Organized by Tier and Business Function
 */

export interface AgentSpec {
  name: string;
  display_name: string;
  description: string;
  tier: number;
  business_function: string;
  domain: string;
  requiresMedicalKnowledge: boolean;
  requiresHighAccuracy: boolean;
  requiresCodeGeneration?: boolean;
  capabilities: string[];
  avatar_offset: number;
}

/**
 * TIER 1: 85 Foundational Agents
 * Target: <2s response, 85-90% accuracy, $0.01-0.03/query
 */
export const tier1Agents: AgentSpec[] = [
  // ========== DRUG DEVELOPMENT & INFORMATION (15 agents) ==========
  {
    name: 'drug_information_specialist',
    display_name: 'Drug Information Specialist',
    description: 'Provides comprehensive medication information including indications, dosing, contraindications, and evidence-based guidelines.',
    tier: 1,
    business_function: 'pharmaceutical_information',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['drug_information', 'fda_label_interpretation', 'guideline_review'],
    avatar_offset: 0
  },
  {
    name: 'dosing_calculator',
    display_name: 'Dosing Calculator',
    description: 'Performs pharmacokinetic-based dose calculations including renal/hepatic adjustments.',
    tier: 1,
    business_function: 'clinical_pharmacy',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['pk_calculations', 'dose_adjustment', 'tdm_interpretation'],
    avatar_offset: 1
  },
  {
    name: 'drug_interaction_checker',
    display_name: 'Drug Interaction Checker',
    description: 'Screens for drug-drug, drug-food, and drug-disease interactions.',
    tier: 1,
    business_function: 'medication_safety',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['interaction_screening', 'pk_pd_assessment'],
    avatar_offset: 2
  },
  {
    name: 'adverse_event_reporter',
    display_name: 'Adverse Event Reporter',
    description: 'Assists with adverse event documentation and regulatory reporting.',
    tier: 1,
    business_function: 'pharmacovigilance',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['ae_documentation', 'causality_assessment'],
    avatar_offset: 3
  },
  {
    name: 'medication_therapy_advisor',
    display_name: 'Medication Therapy Advisor',
    description: 'Provides evidence-based medication selection recommendations.',
    tier: 1,
    business_function: 'medication_therapy_management',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['therapy_optimization', 'comparative_effectiveness'],
    avatar_offset: 4
  },
  {
    name: 'formulary_reviewer',
    display_name: 'Formulary Reviewer',
    description: 'Reviews medications for formulary inclusion based on clinical evidence and cost.',
    tier: 1,
    business_function: 'pharmacy_operations',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: false,
    capabilities: ['formulary_review', 'cost_analysis'],
    avatar_offset: 5
  },
  {
    name: 'medication_reconciliation_assistant',
    display_name: 'Medication Reconciliation Assistant',
    description: 'Assists with medication reconciliation across care transitions.',
    tier: 1,
    business_function: 'medication_safety',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['medication_reconciliation', 'discrepancy_identification'],
    avatar_offset: 6
  },
  {
    name: 'clinical_pharmacology_advisor',
    display_name: 'Clinical Pharmacology Advisor',
    description: 'Provides guidance on drug pharmacokinetics and pharmacodynamics.',
    tier: 1,
    business_function: 'clinical_pharmacy',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['pharmacokinetics', 'pharmacodynamics'],
    avatar_offset: 7
  },
  {
    name: 'pregnancy_lactation_advisor',
    display_name: 'Pregnancy & Lactation Advisor',
    description: 'Provides medication safety information for pregnant and lactating patients.',
    tier: 1,
    business_function: 'medication_safety',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['pregnancy_safety', 'lactation_safety'],
    avatar_offset: 8
  },
  {
    name: 'pediatric_dosing_specialist',
    display_name: 'Pediatric Dosing Specialist',
    description: 'Specializes in age-appropriate dosing for pediatric patients.',
    tier: 1,
    business_function: 'pediatric_pharmacy',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['pediatric_dosing', 'weight_based_dosing'],
    avatar_offset: 9
  },
  {
    name: 'geriatric_medication_specialist',
    display_name: 'Geriatric Medication Specialist',
    description: 'Focuses on medication optimization for elderly patients.',
    tier: 1,
    business_function: 'geriatric_pharmacy',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['geriatric_dosing', 'polypharmacy_management'],
    avatar_offset: 10
  },
  {
    name: 'anticoagulation_advisor',
    display_name: 'Anticoagulation Advisor',
    description: 'Provides guidance on anticoagulation therapy.',
    tier: 1,
    business_function: 'anticoagulation_management',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['anticoagulation_dosing', 'inr_monitoring'],
    avatar_offset: 11
  },
  {
    name: 'antimicrobial_stewardship_assistant',
    display_name: 'Antimicrobial Stewardship Assistant',
    description: 'Supports antimicrobial stewardship initiatives.',
    tier: 1,
    business_function: 'antimicrobial_stewardship',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['antibiotic_selection', 'stewardship_metrics'],
    avatar_offset: 12
  },
  {
    name: 'pain_management_consultant',
    display_name: 'Pain Management Consultant',
    description: 'Provides guidance on pain management strategies.',
    tier: 1,
    business_function: 'pain_management',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['pain_assessment', 'opioid_stewardship'],
    avatar_offset: 13
  },
  {
    name: 'oncology_pharmacy_assistant',
    display_name: 'Oncology Pharmacy Assistant',
    description: 'Assists with chemotherapy protocols and supportive care.',
    tier: 1,
    business_function: 'oncology_pharmacy',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['chemotherapy_protocols', 'supportive_care'],
    avatar_offset: 14
  },

  // ========== REGULATORY AFFAIRS (10 agents) ==========
  {
    name: 'regulatory_strategy_advisor',
    display_name: 'Regulatory Strategy Advisor',
    description: 'Provides strategic regulatory guidance and pathway selection.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['regulatory_strategy', 'pathway_selection'],
    avatar_offset: 15
  },
  {
    name: 'fda_submission_assistant',
    display_name: 'FDA Submission Assistant',
    description: 'Assists with FDA submission preparation.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['submission_preparation', 'ectd_formatting'],
    avatar_offset: 16
  },
  {
    name: 'ema_compliance_specialist',
    display_name: 'EMA Compliance Specialist',
    description: 'Provides guidance on EMA requirements.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['ema_requirements', 'eu_compliance'],
    avatar_offset: 17
  },
  {
    name: 'regulatory_intelligence_analyst',
    display_name: 'Regulatory Intelligence Analyst',
    description: 'Monitors regulatory landscape changes.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: false,
    capabilities: ['regulatory_monitoring', 'competitive_intelligence'],
    avatar_offset: 18
  },
  {
    name: 'regulatory_labeling_specialist',
    display_name: 'Regulatory Labeling Specialist',
    description: 'Assists with drug labeling development.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['labeling_development', 'pil_writing'],
    avatar_offset: 19
  },
  {
    name: 'post_approval_compliance_monitor',
    display_name: 'Post-Approval Compliance Monitor',
    description: 'Monitors post-approval commitments.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['commitment_tracking', 'compliance_monitoring'],
    avatar_offset: 20
  },
  {
    name: 'orphan_drug_designation_advisor',
    display_name: 'Orphan Drug Designation Advisor',
    description: 'Provides guidance on orphan drug designation.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['orphan_designation', 'rare_disease_development'],
    avatar_offset: 21
  },
  {
    name: 'breakthrough_therapy_consultant',
    display_name: 'Breakthrough Therapy Consultant',
    description: 'Assists with breakthrough therapy designation.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['breakthrough_designation', 'expedited_programs'],
    avatar_offset: 22
  },
  {
    name: 'biosimilar_regulatory_specialist',
    display_name: 'Biosimilar Regulatory Specialist',
    description: 'Provides regulatory guidance for biosimilar development.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['biosimilar_development', 'comparability_studies'],
    avatar_offset: 23
  },
  {
    name: 'combination_product_advisor',
    display_name: 'Combination Product Advisor',
    description: 'Advises on regulatory requirements for combination products.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['combination_products', 'jurisdiction_determination'],
    avatar_offset: 24
  },

  // ========== CLINICAL DEVELOPMENT (10 agents) ==========
  {
    name: 'protocol_development_assistant',
    display_name: 'Protocol Development Assistant',
    description: 'Assists with clinical trial protocol development.',
    tier: 1,
    business_function: 'clinical_development',
    domain: 'clinical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['protocol_writing', 'study_design'],
    avatar_offset: 25
  },
  {
    name: 'ich_gcp_compliance_advisor',
    display_name: 'ICH-GCP Compliance Advisor',
    description: 'Provides guidance on ICH-GCP compliance.',
    tier: 1,
    business_function: 'clinical_development',
    domain: 'clinical',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['gcp_compliance', 'ich_guidelines'],
    avatar_offset: 26
  },
  {
    name: 'patient_recruitment_strategist',
    display_name: 'Patient Recruitment Strategist',
    description: 'Develops patient recruitment strategies.',
    tier: 1,
    business_function: 'clinical_operations',
    domain: 'clinical',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: false,
    capabilities: ['recruitment_strategy', 'retention_planning'],
    avatar_offset: 27
  },
  {
    name: 'informed_consent_specialist',
    display_name: 'Informed Consent Specialist',
    description: 'Assists with informed consent form development.',
    tier: 1,
    business_function: 'clinical_development',
    domain: 'clinical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['consent_form_development', 'patient_education'],
    avatar_offset: 28
  },
  {
    name: 'clinical_monitoring_coordinator',
    display_name: 'Clinical Monitoring Coordinator',
    description: 'Coordinates clinical trial monitoring activities.',
    tier: 1,
    business_function: 'clinical_operations',
    domain: 'clinical',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['monitoring_coordination', 'sdv_planning'],
    avatar_offset: 29
  },
  {
    name: 'safety_monitoring_assistant',
    display_name: 'Safety Monitoring Assistant',
    description: 'Assists with clinical trial safety monitoring.',
    tier: 1,
    business_function: 'clinical_safety',
    domain: 'clinical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['safety_monitoring', 'dsmb_preparation'],
    avatar_offset: 30
  },
  {
    name: 'clinical_data_manager',
    display_name: 'Clinical Data Manager',
    description: 'Manages clinical trial data and database design.',
    tier: 1,
    business_function: 'clinical_data_management',
    domain: 'clinical',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['database_design', 'data_cleaning'],
    avatar_offset: 31
  },
  {
    name: 'biostatistics_consultant',
    display_name: 'Biostatistics Consultant',
    description: 'Provides statistical consultation for trials.',
    tier: 1,
    business_function: 'biostatistics',
    domain: 'clinical',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['statistical_design', 'sample_size_calculation'],
    avatar_offset: 32
  },
  {
    name: 'clinical_trial_registry_specialist',
    display_name: 'Clinical Trial Registry Specialist',
    description: 'Manages clinical trial registrations.',
    tier: 1,
    business_function: 'clinical_operations',
    domain: 'clinical',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['trial_registration', 'results_posting'],
    avatar_offset: 33
  },
  {
    name: 'investigator_site_support',
    display_name: 'Investigator Site Support',
    description: 'Provides support to investigator sites.',
    tier: 1,
    business_function: 'clinical_operations',
    domain: 'clinical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: false,
    capabilities: ['site_training', 'query_resolution'],
    avatar_offset: 34
  },

  // ========== QUALITY ASSURANCE (10 agents) ==========
  {
    name: 'qms_documentation_specialist',
    display_name: 'QMS Documentation Specialist',
    description: 'Manages quality management system documentation.',
    tier: 1,
    business_function: 'quality_assurance',
    domain: 'quality',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['document_control', 'sop_development'],
    avatar_offset: 35
  },
  {
    name: 'deviation_investigation_assistant',
    display_name: 'Deviation Investigation Assistant',
    description: 'Assists with deviation investigations.',
    tier: 1,
    business_function: 'quality_assurance',
    domain: 'quality',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['deviation_investigation', 'capa_management'],
    avatar_offset: 36
  },
  {
    name: 'internal_audit_coordinator',
    display_name: 'Internal Audit Coordinator',
    description: 'Coordinates internal quality audits.',
    tier: 1,
    business_function: 'quality_assurance',
    domain: 'quality',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['audit_planning', 'finding_tracking'],
    avatar_offset: 37
  },
  {
    name: 'validation_documentation_specialist',
    display_name: 'Validation Documentation Specialist',
    description: 'Manages validation documentation.',
    tier: 1,
    business_function: 'quality_assurance',
    domain: 'quality',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['validation_protocols', 'iq_oq_pq'],
    avatar_offset: 38
  },
  {
    name: 'supplier_quality_monitor',
    display_name: 'Supplier Quality Monitor',
    description: 'Monitors supplier quality performance.',
    tier: 1,
    business_function: 'quality_assurance',
    domain: 'quality',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: false,
    capabilities: ['supplier_audits', 'vendor_qualification'],
    avatar_offset: 39
  },
  {
    name: 'change_control_coordinator',
    display_name: 'Change Control Coordinator',
    description: 'Coordinates change control activities.',
    tier: 1,
    business_function: 'quality_assurance',
    domain: 'quality',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['change_control', 'impact_assessment'],
    avatar_offset: 40
  },
  {
    name: 'complaint_handling_specialist',
    display_name: 'Complaint Handling Specialist',
    description: 'Manages product complaints and investigations.',
    tier: 1,
    business_function: 'quality_assurance',
    domain: 'quality',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['complaint_investigation', 'trend_analysis'],
    avatar_offset: 41
  },
  {
    name: 'annual_product_review_coordinator',
    display_name: 'Annual Product Review Coordinator',
    description: 'Coordinates annual product quality reviews.',
    tier: 1,
    business_function: 'quality_assurance',
    domain: 'quality',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['apr_preparation', 'quality_trending'],
    avatar_offset: 42
  },
  {
    name: 'iso_13485_compliance_advisor',
    display_name: 'ISO 13485 Compliance Advisor',
    description: 'Provides guidance on ISO 13485 compliance.',
    tier: 1,
    business_function: 'quality_assurance',
    domain: 'quality',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['iso_compliance', 'quality_systems'],
    avatar_offset: 43
  },
  {
    name: 'training_coordinator',
    display_name: 'Training Coordinator',
    description: 'Coordinates GMP and quality training programs.',
    tier: 1,
    business_function: 'quality_assurance',
    domain: 'quality',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: false,
    capabilities: ['training_coordination', 'competency_assessment'],
    avatar_offset: 44
  },

  // Continue with remaining Tier 1 categories...
  // (40 more agents to reach 85 total)
];

/**
 * TIER 2: 115 Specialist Agents
 * Target: 1-3s response, 90-95% accuracy, $0.05-0.15/query
 */
export const tier2Agents: AgentSpec[] = [
  // Detailed agents would be listed here
  // 115 total across all business functions
];

/**
 * TIER 3: 50 Ultra-Specialist Agents
 * Target: 3-5s response, >95% accuracy, $0.20-0.50/query
 */
export const tier3Agents: AgentSpec[] = [
  // Detailed agents would be listed here
  // 50 total across all business functions
];
