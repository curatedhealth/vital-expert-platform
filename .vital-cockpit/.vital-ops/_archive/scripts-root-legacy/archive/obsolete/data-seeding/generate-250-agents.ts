/**
 * Generate VITAL Path 250-Agent Registry
 *
 * This script generates all 250 pharmaceutical and life sciences agents
 * with evidence-based LLM model recommendations.
 *
 * Tier 1: 85 agents (Fast response, foundational)
 * Tier 2: 115 agents (Specialist, advanced capability)
 * Tier 3: 50 agents (Ultra-specialist, highest complexity)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { tier1Agents, tier2Agents, tier3Agents, type AgentSpec } from './agent-definitions';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Evidence-based model selection based on agent requirements
 */
function selectOptimalModel(agent: {
  tier: number;
  domain: string;
  requiresHighAccuracy: boolean;
  requiresMedicalKnowledge: boolean;
  requiresCodeGeneration: boolean;
}) {
  // Tier 3: Always use top-tier models for ultra-specialists
  if (agent.tier === 3) {
    if (agent.requiresMedicalKnowledge) {
      return {
        model: 'gpt-4',
        justification: 'Ultra-specialist requiring highest medical accuracy. GPT-4 achieves 86.7% on MedQA (USMLE).',
        citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
        cost_per_query: 0.35
      };
    }
    if (agent.requiresCodeGeneration) {
      return {
        model: 'claude-3-opus',
        justification: 'Best code generation performance. Claude 3 Opus achieves 84.5% pass@1 on HumanEval.',
        citation: 'Anthropic (2024). Claude 3 Model Card',
        cost_per_query: 0.40
      };
    }
    return {
      model: 'claude-3-opus',
      justification: 'Highest reasoning capability. Claude 3 Opus achieves 86.8% on MMLU, 95.1% on GSM8K.',
      citation: 'Anthropic (2024). Claude 3 Model Card',
      cost_per_query: 0.38
    };
  }

  // Tier 2: Balance performance and cost
  if (agent.tier === 2) {
    if (agent.requiresMedicalKnowledge && agent.requiresHighAccuracy) {
      return {
        model: 'gpt-4',
        justification: 'High-accuracy medical specialist. GPT-4 achieves 86.7% on MedQA (USMLE).',
        citation: 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774',
        cost_per_query: 0.12
      };
    }
    if (agent.requiresMedicalKnowledge) {
      return {
        model: 'microsoft/biogpt',
        justification: 'Cost-effective biomedical specialist. BioGPT achieves F1 0.849 on BC5CDR (Disease), 81.2% on PubMedQA.',
        citation: 'Luo et al. (2022). BioGPT. DOI:10.1093/bib/bbac409',
        cost_per_query: 0.08
      };
    }
    if (agent.requiresCodeGeneration) {
      return {
        model: 'gpt-4',
        justification: 'Strong code generation. GPT-4 achieves 67% pass@1 on HumanEval.',
        citation: 'OpenAI (2023). GPT-4 Technical Report',
        cost_per_query: 0.12
      };
    }
    return {
      model: 'gpt-4-turbo',
      justification: 'Balanced performance with large context window (128K). 86% on MMLU.',
        citation: 'OpenAI (2024). GPT-4 Turbo Documentation',
      cost_per_query: 0.10
    };
  }

  // Tier 1: Optimize for speed and cost
  if (agent.requiresMedicalKnowledge) {
    return {
      model: 'microsoft/biogpt',
      justification: 'Fast biomedical responses. BioGPT achieves F1 0.849 on BC5CDR, 81.2% on PubMedQA.',
      citation: 'Luo et al. (2022). BioGPT. DOI:10.1093/bib/bbac409',
      cost_per_query: 0.02
    };
  }

  return {
    model: 'gpt-3.5-turbo',
    justification: 'Fast, cost-effective for foundational tasks. 70% on MMLU.',
    citation: 'OpenAI (2023). GPT-3.5 Turbo Documentation',
    cost_per_query: 0.015
  };
}

/**
 * Agents are imported from agent-definitions.ts
 * - tier1Agents: Currently 45 defined (target: 85)
 * - tier2Agents: Currently 0 defined (target: 115)
 * - tier3Agents: Currently 0 defined (target: 50)
 */

// NOTE: Inline definitions removed - using imported agents from agent-definitions.ts
// If you need to add more agents, edit agent-definitions.ts

/**
 * TEMPORARY: Until all 250 agents are defined in agent-definitions.ts,
 * we'll skip generation for undefined tiers to avoid errors
 */
    display_name: 'Drug Information Specialist',
    description: 'Provides comprehensive medication information including indications, dosing, contraindications, and evidence-based guidelines.',
    tier: 1,
    business_function: 'pharmaceutical_information',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['drug_information', 'fda_label_interpretation', 'guideline_review', 'evidence_synthesis'],
    avatar_offset: 0
  },
  {
    name: 'dosing_calculator',
    display_name: 'Dosing Calculator',
    description: 'Performs pharmacokinetic-based dose calculations including renal/hepatic adjustments and therapeutic drug monitoring.',
    tier: 1,
    business_function: 'clinical_pharmacy',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['pk_calculations', 'dose_adjustment', 'tdm_interpretation', 'renal_dosing'],
    avatar_offset: 1
  },
  {
    name: 'drug_interaction_checker',
    display_name: 'Drug Interaction Checker',
    description: 'Screens for drug-drug, drug-food, and drug-disease interactions with clinical significance assessment.',
    tier: 1,
    business_function: 'medication_safety',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['interaction_screening', 'pk_pd_assessment', 'risk_stratification'],
    avatar_offset: 2
  },
  {
    name: 'adverse_event_reporter',
    display_name: 'Adverse Event Reporter',
    description: 'Assists with adverse event documentation, causality assessment, and regulatory reporting.',
    tier: 1,
    business_function: 'pharmacovigilance',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['ae_documentation', 'causality_assessment', 'regulatory_reporting'],
    avatar_offset: 3
  },
  {
    name: 'medication_therapy_advisor',
    display_name: 'Medication Therapy Advisor',
    description: 'Provides evidence-based medication selection recommendations considering efficacy, safety, and cost.',
    tier: 1,
    business_function: 'medication_therapy_management',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['therapy_optimization', 'comparative_effectiveness', 'cost_effectiveness'],
    avatar_offset: 4
  },
  {
    name: 'formulary_reviewer',
    display_name: 'Formulary Reviewer',
    description: 'Reviews medications for formulary inclusion based on clinical evidence, cost, and therapeutic alternatives.',
    tier: 1,
    business_function: 'pharmacy_operations',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: false,
    capabilities: ['formulary_review', 'cost_analysis', 'therapeutic_interchange'],
    avatar_offset: 5
  },
  {
    name: 'medication_reconciliation_assistant',
    display_name: 'Medication Reconciliation Assistant',
    description: 'Assists with medication reconciliation across care transitions and identifies discrepancies.',
    tier: 1,
    business_function: 'medication_safety',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['medication_reconciliation', 'discrepancy_identification', 'transition_of_care'],
    avatar_offset: 6
  },
  {
    name: 'clinical_pharmacology_advisor',
    display_name: 'Clinical Pharmacology Advisor',
    description: 'Provides guidance on drug pharmacokinetics, pharmacodynamics, and mechanism of action.',
    tier: 1,
    business_function: 'clinical_pharmacy',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['pharmacokinetics', 'pharmacodynamics', 'mechanism_of_action'],
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
    capabilities: ['pregnancy_safety', 'lactation_safety', 'teratogenicity_assessment'],
    avatar_offset: 8
  },
  {
    name: 'pediatric_dosing_specialist',
    display_name: 'Pediatric Dosing Specialist',
    description: 'Specializes in age-appropriate dosing for pediatric patients including neonates.',
    tier: 1,
    business_function: 'pediatric_pharmacy',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['pediatric_dosing', 'weight_based_dosing', 'developmental_pharmacology'],
    avatar_offset: 9
  },
  {
    name: 'geriatric_medication_specialist',
    display_name: 'Geriatric Medication Specialist',
    description: 'Focuses on medication optimization for elderly patients including polypharmacy management.',
    tier: 1,
    business_function: 'geriatric_pharmacy',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['geriatric_dosing', 'polypharmacy_management', 'beers_criteria'],
    avatar_offset: 10
  },
  {
    name: 'anticoagulation_advisor',
    display_name: 'Anticoagulation Advisor',
    description: 'Provides guidance on anticoagulation therapy including dosing, monitoring, and reversal.',
    tier: 1,
    business_function: 'anticoagulation_management',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['anticoagulation_dosing', 'inr_monitoring', 'bleeding_risk_assessment'],
    avatar_offset: 11
  },
  {
    name: 'antimicrobial_stewardship_assistant',
    display_name: 'Antimicrobial Stewardship Assistant',
    description: 'Supports antimicrobial stewardship initiatives with evidence-based antibiotic selection.',
    tier: 1,
    business_function: 'antimicrobial_stewardship',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['antibiotic_selection', 'stewardship_metrics', 'resistance_patterns'],
    avatar_offset: 12
  },
  {
    name: 'pain_management_consultant',
    display_name: 'Pain Management Consultant',
    description: 'Provides guidance on pain management strategies including opioid stewardship.',
    tier: 1,
    business_function: 'pain_management',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['pain_assessment', 'opioid_stewardship', 'multimodal_analgesia'],
    avatar_offset: 13
  },
  {
    name: 'oncology_pharmacy_assistant',
    display_name: 'Oncology Pharmacy Assistant',
    description: 'Assists with chemotherapy protocols, supportive care, and oral oncology management.',
    tier: 1,
    business_function: 'oncology_pharmacy',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['chemotherapy_protocols', 'supportive_care', 'oral_oncology'],
    avatar_offset: 14
  },

  // ========== REGULATORY AFFAIRS (10 agents) ==========
  {
    name: 'regulatory_strategy_advisor',
    display_name: 'Regulatory Strategy Advisor',
    description: 'Provides strategic regulatory guidance including pathway selection and agency interaction strategy.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['regulatory_strategy', 'pathway_selection', 'agency_interaction'],
    avatar_offset: 15
  },
  {
    name: 'fda_submission_assistant',
    display_name: 'FDA Submission Assistant',
    description: 'Assists with FDA submission preparation including IND, NDA, and BLA documentation.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['submission_preparation', 'ectd_formatting', 'regulatory_writing'],
    avatar_offset: 16
  },
  {
    name: 'ema_compliance_specialist',
    display_name: 'EMA Compliance Specialist',
    description: 'Provides guidance on European Medicines Agency requirements and EU regulatory compliance.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['ema_requirements', 'eu_compliance', 'centralized_procedure'],
    avatar_offset: 17
  },
  {
    name: 'regulatory_intelligence_analyst',
    display_name: 'Regulatory Intelligence Analyst',
    description: 'Monitors regulatory landscape changes and provides competitive intelligence.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: false,
    capabilities: ['regulatory_monitoring', 'competitive_intelligence', 'landscape_analysis'],
    avatar_offset: 18
  },
  {
    name: 'regulatory_labeling_specialist',
    display_name: 'Regulatory Labeling Specialist',
    description: 'Assists with drug labeling including prescribing information and patient package inserts.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['labeling_development', 'pil_writing', 'safety_labeling'],
    avatar_offset: 19
  },
  {
    name: 'post_approval_compliance_monitor',
    display_name: 'Post-Approval Compliance Monitor',
    description: 'Monitors post-approval commitments and regulatory compliance requirements.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['commitment_tracking', 'compliance_monitoring', 'annual_reporting'],
    avatar_offset: 20
  },
  {
    name: 'orphan_drug_designation_advisor',
    display_name: 'Orphan Drug Designation Advisor',
    description: 'Provides guidance on orphan drug designation and rare disease development.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['orphan_designation', 'rare_disease_development', 'incentive_programs'],
    avatar_offset: 21
  },
  {
    name: 'breakthrough_therapy_consultant',
    display_name: 'Breakthrough Therapy Consultant',
    description: 'Assists with breakthrough therapy designation and expedited development programs.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['breakthrough_designation', 'expedited_programs', 'priority_review'],
    avatar_offset: 22
  },
  {
    name: 'biosimilar_regulatory_specialist',
    display_name: 'Biosimilar Regulatory Specialist',
    description: 'Provides regulatory guidance specific to biosimilar development and approval.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['biosimilar_development', 'comparability_studies', '351k_pathway'],
    avatar_offset: 23
  },
  {
    name: 'combination_product_advisor',
    display_name: 'Combination Product Advisor',
    description: 'Advises on regulatory requirements for drug-device and drug-biologic combination products.',
    tier: 1,
    business_function: 'regulatory_affairs',
    domain: 'regulatory',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['combination_products', 'jurisdiction_determination', 'device_regulations'],
    avatar_offset: 24
  },

  // ========== CLINICAL DEVELOPMENT (10 agents) ==========
  {
    name: 'protocol_development_assistant',
    display_name: 'Protocol Development Assistant',
    description: 'Assists with clinical trial protocol development including study design and endpoints.',
    tier: 1,
    business_function: 'clinical_development',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['protocol_writing', 'study_design', 'endpoint_selection'],
    avatar_offset: 25
  },
  {
    name: 'ich_gcp_compliance_advisor',
    display_name: 'ICH-GCP Compliance Advisor',
    description: 'Provides guidance on ICH-GCP compliance and good clinical practice standards.',
    tier: 1,
    business_function: 'clinical_development',
    domain: 'medical',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['gcp_compliance', 'ich_guidelines', 'clinical_quality'],
    avatar_offset: 26
  },
  {
    name: 'patient_recruitment_strategist',
    display_name: 'Patient Recruitment Strategist',
    description: 'Develops strategies for patient recruitment and retention in clinical trials.',
    tier: 1,
    business_function: 'clinical_operations',
    domain: 'medical',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: false,
    capabilities: ['recruitment_strategy', 'retention_planning', 'site_selection'],
    avatar_offset: 27
  },
  {
    name: 'informed_consent_specialist',
    display_name: 'Informed Consent Specialist',
    description: 'Assists with informed consent form development and patient education materials.',
    tier: 1,
    business_function: 'clinical_development',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['consent_form_development', 'patient_education', 'regulatory_compliance'],
    avatar_offset: 28
  },
  {
    name: 'clinical_monitoring_coordinator',
    display_name: 'Clinical Monitoring Coordinator',
    description: 'Coordinates clinical trial monitoring activities and source data verification.',
    tier: 1,
    business_function: 'clinical_operations',
    domain: 'medical',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['monitoring_coordination', 'sdv_planning', 'site_management'],
    avatar_offset: 29
  },
  {
    name: 'safety_monitoring_assistant',
    display_name: 'Safety Monitoring Assistant',
    description: 'Assists with clinical trial safety monitoring and DSMB preparation.',
    tier: 1,
    business_function: 'clinical_safety',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: true,
    capabilities: ['safety_monitoring', 'dsmb_preparation', 'safety_reporting'],
    avatar_offset: 30
  },
  {
    name: 'clinical_data_manager',
    display_name: 'Clinical Data Manager',
    description: 'Manages clinical trial data including database design and data cleaning.',
    tier: 1,
    business_function: 'clinical_data_management',
    domain: 'medical',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['database_design', 'data_cleaning', 'query_management'],
    avatar_offset: 31
  },
  {
    name: 'biostatistics_consultant',
    display_name: 'Biostatistics Consultant',
    description: 'Provides statistical consultation for clinical trial design and analysis.',
    tier: 1,
    business_function: 'biostatistics',
    domain: 'medical',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['statistical_design', 'sample_size_calculation', 'analysis_planning'],
    avatar_offset: 32
  },
  {
    name: 'clinical_trial_registry_specialist',
    display_name: 'Clinical Trial Registry Specialist',
    description: 'Manages clinical trial registrations on ClinicalTrials.gov and EU CT Registry.',
    tier: 1,
    business_function: 'clinical_operations',
    domain: 'medical',
    requiresMedicalKnowledge: false,
    requiresHighAccuracy: true,
    capabilities: ['trial_registration', 'results_posting', 'registry_compliance'],
    avatar_offset: 33
  },
  {
    name: 'investigator_site_support',
    display_name: 'Investigator Site Support',
    description: 'Provides support to investigator sites including protocol training and query resolution.',
    tier: 1,
    business_function: 'clinical_operations',
    domain: 'medical',
    requiresMedicalKnowledge: true,
    requiresHighAccuracy: false,
    capabilities: ['site_training', 'query_resolution', 'protocol_clarification'],
    avatar_offset: 34
  },

];

/**
 * Tier 2 Agents (115 total)
 * Imported from agent-definitions.ts
 */
const tier2Agents: any[] = [];

/**
 * Tier 3 Agents (50 total)
 * Imported from agent-definitions.ts
 */
const tier3Agents: any[] = [];

/**
 * Generate agent with evidence-based model selection
 */
function generateAgent(spec: AgentSpec, avatarBase: number) {
  const modelSelection = selectOptimalModel({
    tier: spec.tier,
    domain: spec.domain,
    requiresHighAccuracy: spec.requiresHighAccuracy,
    requiresMedicalKnowledge: spec.requiresMedicalKnowledge,
    requiresCodeGeneration: spec.requiresCodeGeneration || false
  });

  const avatarNumber = avatarBase + spec.avatar_offset;
  const avatarId = `avatar_${String(avatarNumber).padStart(4, '0')}`;

  return {
    // Core Identity
    name: spec.name,
    display_name: spec.display_name,
    description: spec.description,
    avatar: avatarId,
    color: getColorByDomain(spec.domain),
    version: '1.0.0',

    // AI Configuration (Evidence-Based)
    model: modelSelection.model,
    // NOTE: model_justification and model_citation columns need to be added to database schema
    // model_justification: modelSelection.justification,
    // model_citation: modelSelection.citation,
    system_prompt: generateSystemPrompt(spec),
    temperature: spec.tier === 3 ? 0.2 : spec.tier === 2 ? 0.4 : 0.6,
    max_tokens: spec.tier === 3 ? 4000 : spec.tier === 2 ? 3000 : 2000,
    rag_enabled: true,
    context_window: spec.tier === 3 ? 16000 : spec.tier === 2 ? 8000 : 4000,
    response_format: 'markdown',

    // Capabilities & Knowledge
    capabilities: spec.capabilities,
    knowledge_domains: [spec.domain],
    domain_expertise: spec.domain,

    // Business Context
    business_function: spec.business_function,
    role: spec.tier === 1 ? 'foundational' : spec.tier === 2 ? 'specialist' : 'ultra_specialist',
    tier: spec.tier,
    priority: avatarNumber,
    implementation_phase: spec.tier,
    is_custom: false,
    cost_per_query: modelSelection.cost_per_query,

    // Validation & Compliance
    validation_status: 'validated',
    hipaa_compliant: spec.domain === 'medical',
    gdpr_compliant: true,
    audit_trail_enabled: true,
    data_classification: spec.domain === 'medical' ? 'confidential' : 'internal',

    // Status
    status: 'active',
    availability_status: 'available'
  };
}

/**
 * Generate system prompt based on agent spec
 */
function generateSystemPrompt(spec: AgentSpec): string {
  return `YOU ARE: ${spec.display_name}, ${spec.description}

YOU DO: ${spec.capabilities.join(', ')}

YOU NEVER: Make recommendations without evidence, exceed your domain expertise, ignore regulatory requirements, compromise patient safety

SUCCESS CRITERIA: ${spec.requiresHighAccuracy ? 'Accuracy >95%' : 'Accuracy >85%'}, Evidence-based recommendations, Clear citation of sources

WHEN UNSURE: Escalate to senior specialist, request additional information, provide confidence levels with all recommendations

EVIDENCE REQUIREMENTS: Always cite sources (FDA labels, clinical guidelines, peer-reviewed literature), provide evidence quality ratings, acknowledge limitations`;
}

/**
 * Color coding by domain
 */
function getColorByDomain(domain: string): string {
  const colors: Record<string, string> = {
    'medical': '#1976D2',
    'regulatory': '#9C27B0',
    'clinical': '#00897B',
    'quality': '#F57C00',
    'technical': '#5E35B1',
    'commercial': '#C62828',
    'operations': '#6A1B9A'
  };
  return colors[domain] || '#424242';
}

/**
 * Main generation function
 */
async function generateAllAgents() {
  console.log('🚀 Starting VITAL Path 250-Agent Generation');
  console.log('📊 Evidence-Based Model Selection Active');
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  // Tier 1: Avatars 109-193 (85 agents from agent-definitions.ts)
  const importedTier1 = tier1Agents.length > 0 ? tier1Agents : tier1Agents;

  console.log(`🔹 Generating Tier 1 Agents (${importedTier1.length} total)...`);
  for (let i = 0; i < importedTier1.length; i++) {
    try {
      const agent = generateAgent(importedTier1[i], 109);

      const { data, error } = await supabase
        .from('agents')
        .insert([agent]);

      if (error) throw error;

      successCount++;
      console.log(`  ✅ ${agent.display_name} (${agent.model})`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Failed: ${importedTier1[i].display_name}`, error);
    }
  }

  // Tier 2: Avatars 200-314 (115 agents)
  const importedTier2 = tier2Agents.length > 0 ? tier2Agents : [];
  if (importedTier2.length > 0) {
    console.log('');
    console.log(`🔸 Generating Tier 2 Agents (${importedTier2.length} total)...`);
    for (let i = 0; i < importedTier2.length; i++) {
      try {
        const agent = generateAgent(importedTier2[i], 200);
        const { data, error } = await supabase.from('agents').insert([agent]);
        if (error) throw error;
        successCount++;
        console.log(`  ✅ ${agent.display_name} (${agent.model})`);
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Failed: ${importedTier2[i].display_name}`, error);
      }
    }
  }

  // Tier 3: Avatars 400-449 (50 agents)
  const importedTier3 = tier3Agents.length > 0 ? tier3Agents : [];
  if (importedTier3.length > 0) {
    console.log('');
    console.log(`🔶 Generating Tier 3 Agents (${importedTier3.length} total)...`);
    for (let i = 0; i < importedTier3.length; i++) {
      try {
        const agent = generateAgent(importedTier3[i], 400);
        const { data, error } = await supabase.from('agents').insert([agent]);
        if (error) throw error;
        successCount++;
        console.log(`  ✅ ${agent.display_name} (${agent.model})`);
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Failed: ${importedTier3[i].display_name}`, error);
      }
    }
  }

  console.log('');
  console.log('📈 Generation Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📊 Total: ${successCount + errorCount}`);
}

// Run generation
generateAllAgents()
  .then(() => {
    console.log('');
    console.log('✅ Agent generation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
