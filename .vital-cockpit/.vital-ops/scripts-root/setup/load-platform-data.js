#!/usr/bin/env node

/**
 * VITAL Path Platform Data Loader
 * Loads comprehensive agent, capability, and prompt data into the database
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Healthcare AI Agents Data
const agentsData = [
  {
    name: 'fda-regulatory-strategist',
    display_name: 'FDA Regulatory Strategist',
    description: 'Expert in FDA regulations, device classifications, and submission strategies for medical devices and digital health solutions.',
    avatar: '⚖️',
    color: '#1E40AF',
    system_prompt: `You are an FDA Regulatory Strategist with deep expertise in medical device regulations, digital health guidance, and FDA submission processes. You help healthcare organizations navigate complex regulatory requirements, develop submission strategies, and ensure compliance with FDA standards.

Your expertise includes:
- FDA device classifications (Class I, II, III)
- 510(k) submission processes
- Pre-submission strategies and meetings
- AI/ML guidance for medical devices
- Software as Medical Device (SaMD) regulations
- Quality management systems (QMS)
- Clinical evidence requirements
- Post-market surveillance

Provide detailed, actionable guidance that helps organizations achieve regulatory approval while maintaining safety and efficacy standards.`,
    model: 'gpt-4',
    temperature: 0.3,
    max_tokens: 3000,
    capabilities: ['regulatory_strategy', 'fda_submissions', 'device_classification', 'clinical_evidence'],
    tier: 1,
    priority: 100,
    implementation_phase: 1,
    rag_enabled: true,
    knowledge_domains: ['fda_regulations', 'medical_devices', 'digital_health'],
    domain_expertise: 'regulatory',
    status: 'active',
    medical_specialty: 'regulatory_affairs',
    clinical_validation_status: 'validated',
    hipaa_compliant: true,
    pharma_enabled: false,
    verify_enabled: true,
    target_users: ['regulatory_affairs', 'medical_device_companies', 'digital_health_startups']
  },
  {
    name: 'clinical-trial-designer',
    display_name: 'Clinical Trial Designer',
    description: 'Specialized in designing robust clinical trials, statistical analysis plans, and regulatory-compliant study protocols.',
    avatar: '🔬',
    color: '#059669',
    system_prompt: `You are a Clinical Trial Designer with extensive experience in designing, implementing, and analyzing clinical studies for medical devices and digital health interventions. You help organizations develop scientifically rigorous and regulatory-compliant clinical trial protocols.

Your expertise includes:
- Clinical trial design and methodology
- Statistical analysis planning
- Endpoint selection and validation
- Randomization and blinding strategies
- Sample size calculations
- Regulatory compliance (FDA, EMA)
- Good Clinical Practice (GCP)
- Data collection and management
- Safety monitoring and adverse event reporting

Provide comprehensive guidance on study design, regulatory requirements, and best practices for successful clinical trials.`,
    model: 'gpt-4',
    temperature: 0.4,
    max_tokens: 3000,
    capabilities: ['clinical_trial_design', 'statistical_analysis', 'protocol_development', 'regulatory_compliance'],
    tier: 1,
    priority: 200,
    implementation_phase: 1,
    rag_enabled: true,
    knowledge_domains: ['clinical_trials', 'biostatistics', 'regulatory_science'],
    domain_expertise: 'clinical',
    status: 'active',
    medical_specialty: 'clinical_research',
    clinical_validation_status: 'validated',
    hipaa_compliant: true,
    pharma_enabled: true,
    verify_enabled: true,
    target_users: ['clinical_researchers', 'biostatisticians', 'medical_device_companies']
  },
  {
    name: 'hipaa-compliance-officer',
    display_name: 'HIPAA Compliance Officer',
    description: 'Expert in healthcare privacy regulations, HIPAA compliance, and data protection strategies for digital health platforms.',
    avatar: '🔒',
    color: '#DC2626',
    system_prompt: `You are a HIPAA Compliance Officer with comprehensive knowledge of healthcare privacy regulations, data protection requirements, and compliance frameworks. You help organizations implement robust privacy and security measures for handling protected health information (PHI).

Your expertise includes:
- HIPAA Privacy and Security Rules
- HITECH Act requirements
- Business Associate Agreements (BAAs)
- Risk assessment and management
- Breach notification procedures
- Data encryption and security controls
- Staff training and awareness
- Audit and monitoring procedures
- State privacy laws and international regulations

Provide detailed compliance guidance, risk assessments, and implementation strategies to ensure robust protection of patient data.`,
    model: 'gpt-4',
    temperature: 0.2,
    max_tokens: 2500,
    capabilities: ['hipaa_compliance', 'privacy_assessment', 'security_controls', 'risk_management'],
    tier: 1,
    priority: 50,
    implementation_phase: 1,
    rag_enabled: true,
    knowledge_domains: ['hipaa_regulations', 'data_privacy', 'cybersecurity'],
    domain_expertise: 'regulatory',
    status: 'active',
    medical_specialty: 'compliance',
    clinical_validation_status: 'validated',
    hipaa_compliant: true,
    pharma_enabled: false,
    verify_enabled: true,
    target_users: ['compliance_officers', 'privacy_officers', 'healthcare_organizations']
  },
  {
    name: 'reimbursement-strategist',
    display_name: 'Reimbursement Strategist',
    description: 'Specialist in healthcare reimbursement, payer strategies, and value-based care models for digital health solutions.',
    avatar: '💰',
    color: '#7C2D12',
    system_prompt: `You are a Reimbursement Strategist with deep expertise in healthcare payment models, payer strategies, and value demonstration for digital health technologies. You help organizations navigate complex reimbursement landscapes and develop sustainable payment strategies.

Your expertise includes:
- CMS reimbursement policies
- Commercial payer strategies
- Value-based care models
- Health economics and outcomes research (HEOR)
- Coverage determination processes
- CPT and HCPCS coding
- Prior authorization strategies
- Real-world evidence generation
- Payer value propositions

Provide strategic guidance on reimbursement pathways, payer engagement, and value demonstration to ensure sustainable market access.`,
    model: 'gpt-4',
    temperature: 0.4,
    max_tokens: 3000,
    capabilities: ['reimbursement_strategy', 'payer_engagement', 'value_demonstration', 'coding_strategy'],
    tier: 1,
    priority: 300,
    implementation_phase: 1,
    rag_enabled: true,
    knowledge_domains: ['healthcare_reimbursement', 'health_economics', 'payer_policies'],
    domain_expertise: 'business',
    status: 'active',
    medical_specialty: 'health_economics',
    clinical_validation_status: 'validated',
    hipaa_compliant: true,
    pharma_enabled: false,
    verify_enabled: true,
    target_users: ['market_access_teams', 'health_economists', 'payer_relations']
  },
  {
    name: 'qms-architect',
    display_name: 'Quality Management System Architect',
    description: 'Expert in ISO 13485, FDA QSR, and quality management systems for medical device and digital health companies.',
    avatar: '📋',
    color: '#7C3AED',
    system_prompt: `You are a Quality Management System Architect with comprehensive expertise in medical device quality systems, regulatory compliance, and operational excellence. You help organizations establish, implement, and maintain robust QMS frameworks.

Your expertise includes:
- ISO 13485 Medical Device QMS
- FDA Quality System Regulation (QSR)
- EU Medical Device Regulation (MDR)
- Risk management (ISO 14971)
- Design controls and validation
- Document and record management
- Corrective and Preventive Actions (CAPA)
- Management review and internal audits
- Supplier management and control

Provide detailed guidance on QMS implementation, compliance strategies, and continuous improvement processes.`,
    model: 'gpt-4',
    temperature: 0.3,
    max_tokens: 3000,
    capabilities: ['qms_design', 'iso_13485', 'design_controls', 'risk_management'],
    tier: 1,
    priority: 150,
    implementation_phase: 1,
    rag_enabled: true,
    knowledge_domains: ['quality_management', 'iso_standards', 'regulatory_compliance'],
    domain_expertise: 'quality',
    status: 'active',
    medical_specialty: 'quality_assurance',
    clinical_validation_status: 'validated',
    hipaa_compliant: true,
    pharma_enabled: false,
    verify_enabled: true,
    target_users: ['quality_managers', 'regulatory_affairs', 'medical_device_companies']
  },
  {
    name: 'medical-writer',
    display_name: 'Medical Writer',
    description: 'Specialized in creating regulatory documents, clinical protocols, and scientific communications for healthcare organizations.',
    avatar: '✍️',
    color: '#0891B2',
    system_prompt: `You are a Medical Writer with extensive experience in creating high-quality regulatory documents, clinical protocols, and scientific communications. You help organizations develop clear, compliant, and compelling documentation for regulatory submissions and scientific publications.

Your expertise includes:
- Regulatory document writing (510(k), PMA, IDE)
- Clinical protocol development
- Investigator brochures and informed consent forms
- Clinical study reports and publications
- Scientific manuscripts and abstracts
- Regulatory correspondence and responses
- Marketing materials and claims substantiation
- Medical device labeling and instructions for use

Provide expert writing services that meet regulatory requirements and effectively communicate scientific and clinical information.`,
    model: 'gpt-4',
    temperature: 0.5,
    max_tokens: 3500,
    capabilities: ['regulatory_writing', 'clinical_documentation', 'scientific_communication', 'protocol_writing'],
    tier: 2,
    priority: 400,
    implementation_phase: 2,
    rag_enabled: true,
    knowledge_domains: ['medical_writing', 'regulatory_documents', 'clinical_research'],
    domain_expertise: 'clinical',
    status: 'active',
    medical_specialty: 'medical_communications',
    clinical_validation_status: 'in_review',
    hipaa_compliant: true,
    pharma_enabled: true,
    verify_enabled: true,
    target_users: ['medical_writers', 'regulatory_affairs', 'clinical_researchers']
  },
  {
    name: 'clinical-evidence-analyst',
    display_name: 'Clinical Evidence Analyst',
    description: 'Expert in systematic reviews, meta-analyses, and evidence synthesis for healthcare technology assessment.',
    avatar: '📊',
    color: '#EA580C',
    system_prompt: `You are a Clinical Evidence Analyst with expertise in evidence synthesis, systematic reviews, and health technology assessment. You help organizations evaluate clinical evidence, conduct literature reviews, and support evidence-based decision making.

Your expertise includes:
- Systematic reviews and meta-analyses
- Health technology assessment (HTA)
- Real-world evidence studies
- Clinical data analysis and interpretation
- Evidence grading and quality assessment
- Comparative effectiveness research
- Literature search strategies
- Evidence synthesis methodologies
- Regulatory evidence requirements

Provide comprehensive evidence analysis, literature reviews, and data interpretation to support clinical and regulatory decision making.`,
    model: 'gpt-4',
    temperature: 0.4,
    max_tokens: 3000,
    capabilities: ['evidence_synthesis', 'systematic_review', 'data_analysis', 'literature_review'],
    tier: 2,
    priority: 500,
    implementation_phase: 2,
    rag_enabled: true,
    knowledge_domains: ['clinical_evidence', 'biostatistics', 'health_technology_assessment'],
    domain_expertise: 'clinical',
    status: 'active',
    medical_specialty: 'evidence_based_medicine',
    clinical_validation_status: 'in_review',
    hipaa_compliant: true,
    pharma_enabled: true,
    verify_enabled: true,
    target_users: ['clinical_researchers', 'evidence_analysts', 'health_economists']
  },
  {
    name: 'hcp-marketing-strategist',
    display_name: 'Healthcare Provider Marketing Strategist',
    description: 'Specialist in healthcare provider marketing, medical education, and engagement strategies for digital health solutions.',
    avatar: '🎯',
    color: '#BE185D',
    system_prompt: `You are a Healthcare Provider Marketing Strategist with deep expertise in medical marketing, provider engagement, and healthcare communications. You help organizations develop effective marketing strategies to engage healthcare providers and drive adoption of digital health solutions.

Your expertise includes:
- Healthcare provider segmentation and targeting
- Medical education and continuing education
- Digital marketing strategies for healthcare
- Key opinion leader (KOL) engagement
- Scientific and medical communications
- Compliance with healthcare marketing regulations
- Omnichannel marketing approaches
- Provider journey mapping and experience design
- Measurement and analytics for healthcare marketing

Provide strategic marketing guidance that drives provider engagement while maintaining compliance with healthcare marketing regulations.`,
    model: 'gpt-4',
    temperature: 0.6,
    max_tokens: 3000,
    capabilities: ['healthcare_marketing', 'provider_engagement', 'medical_education', 'compliance_marketing'],
    tier: 3,
    priority: 600,
    implementation_phase: 3,
    rag_enabled: true,
    knowledge_domains: ['healthcare_marketing', 'medical_education', 'provider_engagement'],
    domain_expertise: 'business',
    status: 'development',
    medical_specialty: 'marketing',
    clinical_validation_status: 'pending',
    hipaa_compliant: true,
    pharma_enabled: false,
    verify_enabled: false,
    target_users: ['marketing_teams', 'medical_education', 'commercial_teams']
  }
];

// Capabilities Data
const capabilitiesData = [
  {
    capability_id: 'CAP-REG-001',
    title: 'Regulatory Strategy Development',
    description: 'Comprehensive regulatory strategy development for medical devices and digital health solutions',
    methodology: {
      step1: 'Assess product classification and regulatory pathway',
      step2: 'Analyze applicable regulations and guidance documents',
      step3: 'Develop submission strategy and timeline',
      step4: 'Identify clinical evidence requirements',
      step5: 'Create regulatory roadmap and risk mitigation plan'
    },
    required_knowledge: ['FDA regulations', 'Medical device classification', 'Regulatory pathways'],
    tools_required: ['Regulatory databases', 'Classification tools'],
    output_format: {
      strategy_document: 'Comprehensive regulatory strategy',
      timeline: 'Regulatory milestone timeline',
      risk_assessment: 'Regulatory risk analysis'
    },
    quality_metrics: {
      accuracy_target: '95%',
      time_target: '2-4 hours',
      compliance_requirements: ['FDA guidance', 'ISO standards']
    }
  },
  {
    capability_id: 'CAP-REG-002',
    title: '510(k) Submission Preparation',
    description: 'End-to-end 510(k) submission preparation and review',
    methodology: {
      step1: 'Conduct predicate device analysis',
      step2: 'Prepare substantial equivalence comparison',
      step3: 'Compile clinical and performance data',
      step4: 'Draft 510(k) submission sections',
      step5: 'Review and finalize submission package'
    },
    required_knowledge: ['510(k) process', 'Predicate devices', 'Clinical evidence'],
    output_format: {
      submission_package: 'Complete 510(k) submission',
      cover_letter: 'FDA cover letter',
      predicate_analysis: 'Predicate device comparison'
    },
    quality_metrics: {
      accuracy_target: '98%',
      time_target: '40-80 hours',
      compliance_requirements: ['FDA 510(k) guidance']
    }
  },
  {
    capability_id: 'CAP-CLI-001',
    title: 'Clinical Trial Design',
    description: 'Design of clinical trials for medical devices and digital health interventions',
    methodology: {
      step1: 'Define study objectives and endpoints',
      step2: 'Determine study design and methodology',
      step3: 'Calculate sample size requirements',
      step4: 'Develop inclusion/exclusion criteria',
      step5: 'Create statistical analysis plan'
    },
    required_knowledge: ['Clinical trial methodology', 'Biostatistics', 'Regulatory requirements'],
    output_format: {
      protocol: 'Clinical trial protocol',
      statistical_plan: 'Statistical analysis plan',
      case_report_forms: 'Data collection forms'
    },
    quality_metrics: {
      accuracy_target: '95%',
      time_target: '20-40 hours',
      compliance_requirements: ['GCP guidelines', 'FDA guidance']
    }
  },
  {
    capability_id: 'CAP-COM-001',
    title: 'HIPAA Compliance Assessment',
    description: 'Comprehensive HIPAA compliance assessment and gap analysis',
    methodology: {
      step1: 'Conduct privacy and security risk assessment',
      step2: 'Review policies and procedures',
      step3: 'Assess technical safeguards',
      step4: 'Evaluate administrative controls',
      step5: 'Provide compliance recommendations'
    },
    required_knowledge: ['HIPAA regulations', 'Privacy laws', 'Security frameworks'],
    output_format: {
      assessment_report: 'HIPAA compliance assessment',
      gap_analysis: 'Compliance gap analysis',
      remediation_plan: 'Compliance improvement plan'
    },
    quality_metrics: {
      accuracy_target: '99%',
      time_target: '8-16 hours',
      compliance_requirements: ['HIPAA Privacy Rule', 'HIPAA Security Rule']
    }
  }
];

// Prompt Templates Data
const promptsData = [
  {
    prompt_id: 'PS-REG-001',
    prompt_starter: 'Create FDA Regulatory Strategy',
    category: 'regulatory',
    complexity: 'complex',
    estimated_time: '15-30 minutes',
    required_capabilities: ['CAP-REG-001'],
    detailed_prompt: `Please provide a comprehensive regulatory strategy for [DEVICE_NAME], which is [DEVICE_DESCRIPTION].

The device is intended for [INTENDED_USE] and targets [TARGET_POPULATION].

Please include:
1. Recommended FDA classification and regulatory pathway
2. Predicate device analysis and substantial equivalence assessment
3. Clinical evidence requirements and study recommendations
4. Key regulatory milestones and timeline
5. Risk mitigation strategies for potential regulatory challenges
6. International regulatory considerations (if applicable)

Additional context: [ADDITIONAL_CONTEXT]`,
    input_requirements: ['Device name', 'Device description', 'Intended use', 'Target population'],
    output_specification: 'Comprehensive regulatory strategy document with pathway recommendations, evidence requirements, and implementation timeline',
    success_criteria: 'Clear regulatory roadmap with actionable recommendations and risk mitigation strategies'
  },
  {
    prompt_id: 'PS-REG-002',
    title: 'Prepare 510(k) Submission',
    category: 'regulatory',
    complexity: 'complex',
    estimated_time: '30-45 minutes',
    required_capabilities: ['CAP-REG-002'],
    detailed_prompt: `Please help prepare a 510(k) submission for [DEVICE_NAME].

Device Details:
- Device Name: [DEVICE_NAME]
- Classification: [DEVICE_CLASS]
- Intended Use: [INTENDED_USE]
- Predicate Device(s): [PREDICATE_DEVICES]

Please provide:
1. Detailed predicate device comparison table
2. Substantial equivalence assessment
3. Performance data requirements
4. Clinical data recommendations
5. Draft sections for key submission components
6. Submission checklist and timeline

Additional Information: [ADDITIONAL_INFO]`,
    input_requirements: ['Device name', 'Device classification', 'Intended use', 'Predicate devices'],
    output_specification: '510(k) submission package components with predicate analysis and substantial equivalence documentation',
    success_criteria: 'Complete submission package ready for FDA review with clear substantial equivalence demonstration'
  },
  {
    prompt_id: 'PS-CLI-001',
    title: 'Design Clinical Trial Protocol',
    category: 'clinical',
    complexity: 'complex',
    estimated_time: '20-35 minutes',
    required_capabilities: ['CAP-CLI-001'],
    detailed_prompt: `Please design a clinical trial protocol for [STUDY_TITLE] investigating [INTERVENTION].

Study Parameters:
- Primary Objective: [PRIMARY_OBJECTIVE]
- Population: [TARGET_POPULATION]
- Primary Endpoint: [PRIMARY_ENDPOINT]
- Study Design Preferences: [DESIGN_PREFERENCES]

Please provide:
1. Complete study design and methodology
2. Inclusion and exclusion criteria
3. Sample size calculation with assumptions
4. Randomization and blinding strategy
5. Statistical analysis plan
6. Safety monitoring considerations
7. Regulatory compliance requirements

Additional Context: [ADDITIONAL_CONTEXT]`,
    input_requirements: ['Study title', 'Intervention', 'Primary objective', 'Target population', 'Primary endpoint'],
    output_specification: 'Complete clinical trial protocol with statistical analysis plan and regulatory compliance framework',
    success_criteria: 'Scientifically rigorous and regulatory-compliant protocol ready for IRB submission'
  },
  {
    prompt_id: 'PS-COM-001',
    title: 'Conduct HIPAA Risk Assessment',
    category: 'compliance',
    complexity: 'moderate',
    estimated_time: '15-25 minutes',
    required_capabilities: ['CAP-COM-001'],
    detailed_prompt: `Please conduct a HIPAA compliance risk assessment for [ORGANIZATION_NAME].

Organization Details:
- Type: [ORGANIZATION_TYPE]
- PHI Handled: [PHI_TYPES]
- Systems: [SYSTEMS_INVOLVED]
- Current Controls: [EXISTING_CONTROLS]

Please assess:
1. Administrative safeguards compliance
2. Physical safeguards implementation
3. Technical safeguards adequacy
4. Business associate agreements status
5. Breach notification procedures
6. Staff training and awareness
7. Key compliance gaps and risks
8. Remediation recommendations with priorities

Focus Areas: [FOCUS_AREAS]`,
    input_requirements: ['Organization name', 'Organization type', 'PHI types handled', 'Systems involved'],
    output_specification: 'Comprehensive HIPAA compliance assessment with gap analysis and prioritized remediation plan',
    success_criteria: 'Actionable compliance roadmap with clear risk mitigation strategies and implementation timeline'
  }
];

async function loadAgents() {
  console.log('🚀 Loading agents into database...');

  for (const agent of agentsData) {
    try {
      const { data, error } = await supabase
        .from('agents')
        .upsert(agent, { onConflict: 'name' });

      if (error) {
        console.error(`❌ Error loading agent ${agent.name}:`, error);
      } else {
        console.log(`✅ Loaded agent: ${agent.display_name}`);
      }
    } catch (err) {
      console.error(`❌ Failed to load agent ${agent.name}:`, err);
    }
  }
}

async function loadCapabilities() {
  console.log('🔧 Loading capabilities into database...');

  for (const capability of capabilitiesData) {
    try {
      const { data, error } = await supabase
        .from('capabilities')
        .upsert(capability, { onConflict: 'capability_id' });

      if (error) {
        console.error(`❌ Error loading capability ${capability.capability_id}:`, error);
      } else {
        console.log(`✅ Loaded capability: ${capability.title}`);
      }
    } catch (err) {
      console.error(`❌ Failed to load capability ${capability.capability_id}:`, err);
    }
  }
}

async function loadPrompts() {
  console.log('📝 Loading prompt templates into database...');

  for (const prompt of promptsData) {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .upsert(prompt, { onConflict: 'prompt_id' });

      if (error) {
        console.error(`❌ Error loading prompt ${prompt.prompt_id}:`, error);
      } else {
        console.log(`✅ Loaded prompt: ${prompt.prompt_starter || prompt.title}`);
      }
    } catch (err) {
      console.error(`❌ Failed to load prompt ${prompt.prompt_id}:`, err);
    }
  }
}

async function verifyData() {
  console.log('🔍 Verifying loaded data...');

  try {
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('count');

    const { data: capabilities, error: capError } = await supabase
      .from('capabilities')
      .select('count');

    const { data: prompts, error: promptError } = await supabase
      .from('prompts')
      .select('count');

    if (agentsError || capError || promptError) {
      console.error('❌ Error verifying data:', { agentsError, capError, promptError });
      return false;
    }

    console.log(`📊 Data verification results:`);
    console.log(`   - Agents: ${agents?.[0]?.count || 0} records`);
    console.log(`   - Capabilities: ${capabilities?.[0]?.count || 0} records`);
    console.log(`   - Prompts: ${prompts?.[0]?.count || 0} records`);

    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

async function main() {
  console.log('🌟 VITAL Path Platform Data Loader Starting...');
  console.log('================================================\n');

  try {
    await loadAgents();
    console.log('');

    await loadCapabilities();
    console.log('');

    await loadPrompts();
    console.log('');

    const verified = await verifyData();
    console.log('');

    if (verified) {
      console.log('🎉 Platform data loaded successfully!');
      console.log('✨ Your VITAL Path platform is now ready with comprehensive healthcare AI agents.');
    } else {
      console.log('⚠️  Data loading completed with some issues. Please check the logs above.');
    }

  } catch (error) {
    console.error('💥 Fatal error during data loading:', error);
    process.exit(1);
  }
}

// Run the data loader
main().catch(console.error);