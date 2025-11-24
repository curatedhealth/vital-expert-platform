#!/usr/bin/env node

/**
 * VITAL Path Platform Data Loader - Simplified Version
 * Loads data using the existing database schema
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simplified Healthcare AI Agents Data - matching existing schema
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
    target_users: ['regulatory_affairs', 'medical_device_companies', 'digital_health_startups'],
    hipaa_compliant: true,
    pharma_enabled: false,
    verify_enabled: true
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
    target_users: ['clinical_researchers', 'biostatisticians', 'medical_device_companies'],
    hipaa_compliant: true,
    pharma_enabled: true,
    verify_enabled: true
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
    target_users: ['compliance_officers', 'privacy_officers', 'healthcare_organizations'],
    hipaa_compliant: true,
    pharma_enabled: false,
    verify_enabled: true
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
    target_users: ['market_access_teams', 'health_economists', 'payer_relations'],
    hipaa_compliant: true,
    pharma_enabled: false,
    verify_enabled: true
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
    target_users: ['quality_managers', 'regulatory_affairs', 'medical_device_companies'],
    hipaa_compliant: true,
    pharma_enabled: false,
    verify_enabled: true
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
    target_users: ['medical_writers', 'regulatory_affairs', 'clinical_researchers'],
    hipaa_compliant: true,
    pharma_enabled: true,
    verify_enabled: true
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
    target_users: ['clinical_researchers', 'evidence_analysts', 'health_economists'],
    hipaa_compliant: true,
    pharma_enabled: true,
    verify_enabled: true
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
    status: 'active',
    target_users: ['marketing_teams', 'medical_education', 'commercial_teams'],
    hipaa_compliant: true,
    pharma_enabled: false,
    verify_enabled: false
  }
];

// Capabilities data matching existing schema
const capabilitiesData = [
  {
    name: 'regulatory_strategy',
    display_name: 'Regulatory Strategy Development',
    description: 'Comprehensive regulatory strategy development for medical devices and digital health solutions',
    category: 'regulatory',
    icon: '⚖️',
    color: '#1E40AF',
    complexity_level: 'advanced',
    domain: 'regulatory',
    prerequisites: ['medical_device_knowledge', 'fda_regulations'],
    status: 'active',
    version: '1.0'
  },
  {
    name: 'fda_submissions',
    display_name: '510(k) Submission Preparation',
    description: 'End-to-end 510(k) submission preparation and review',
    category: 'regulatory',
    icon: '📋',
    color: '#1E40AF',
    complexity_level: 'expert',
    domain: 'regulatory',
    prerequisites: ['regulatory_strategy'],
    status: 'active',
    version: '1.0'
  },
  {
    name: 'clinical_trial_design',
    display_name: 'Clinical Trial Design',
    description: 'Design of clinical trials for medical devices and digital health interventions',
    category: 'clinical',
    icon: '🔬',
    color: '#059669',
    complexity_level: 'advanced',
    domain: 'clinical',
    prerequisites: ['biostatistics', 'clinical_research'],
    status: 'active',
    version: '1.0'
  },
  {
    name: 'hipaa_compliance',
    display_name: 'HIPAA Compliance Assessment',
    description: 'Comprehensive HIPAA compliance assessment and gap analysis',
    category: 'compliance',
    icon: '🔒',
    color: '#DC2626',
    complexity_level: 'intermediate',
    domain: 'regulatory',
    prerequisites: ['privacy_regulations'],
    status: 'active',
    version: '1.0'
  },
  {
    name: 'reimbursement_strategy',
    display_name: 'Reimbursement Strategy',
    description: 'Healthcare reimbursement and payer strategy development',
    category: 'business',
    icon: '💰',
    color: '#7C2D12',
    complexity_level: 'advanced',
    domain: 'business',
    prerequisites: ['health_economics'],
    status: 'active',
    version: '1.0'
  },
  {
    name: 'qms_design',
    display_name: 'Quality Management System Design',
    description: 'ISO 13485 and FDA QSR quality management system development',
    category: 'quality',
    icon: '📋',
    color: '#7C3AED',
    complexity_level: 'advanced',
    domain: 'quality',
    prerequisites: ['iso_standards', 'quality_management'],
    status: 'active',
    version: '1.0'
  },
  {
    name: 'medical_writing',
    display_name: 'Regulatory Medical Writing',
    description: 'Creation of regulatory documents and scientific communications',
    category: 'clinical',
    icon: '✍️',
    color: '#0891B2',
    complexity_level: 'intermediate',
    domain: 'clinical',
    prerequisites: ['regulatory_knowledge', 'scientific_writing'],
    status: 'active',
    version: '1.0'
  },
  {
    name: 'evidence_synthesis',
    display_name: 'Clinical Evidence Analysis',
    description: 'Systematic reviews and evidence synthesis for healthcare technology assessment',
    category: 'clinical',
    icon: '📊',
    color: '#EA580C',
    complexity_level: 'advanced',
    domain: 'clinical',
    prerequisites: ['biostatistics', 'literature_review'],
    status: 'active',
    version: '1.0'
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
        console.error(`❌ Error loading agent ${agent.name}:`, error.message);
      } else {
        console.log(`✅ Loaded agent: ${agent.display_name}`);
      }
    } catch (err) {
      console.error(`❌ Failed to load agent ${agent.name}:`, err.message);
    }
  }
}

async function loadCapabilities() {
  console.log('🔧 Loading capabilities into database...');

  for (const capability of capabilitiesData) {
    try {
      const { data, error } = await supabase
        .from('capabilities')
        .upsert(capability, { onConflict: 'name' });

      if (error) {
        console.error(`❌ Error loading capability ${capability.name}:`, error.message);
      } else {
        console.log(`✅ Loaded capability: ${capability.display_name}`);
      }
    } catch (err) {
      console.error(`❌ Failed to load capability ${capability.name}:`, err.message);
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

    if (agentsError || capError) {
      console.error('❌ Error verifying data:', { agentsError, capError });
      return false;
    }

    console.log(`📊 Data verification results:`);
    console.log(`   - Agents: ${agents?.[0]?.count || 0} records`);
    console.log(`   - Capabilities: ${capabilities?.[0]?.count || 0} records`);

    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
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

    const verified = await verifyData();
    console.log('');

    if (verified) {
      console.log('🎉 Platform data loaded successfully!');
      console.log('✨ Your VITAL Path platform is now ready with comprehensive healthcare AI agents.');
    } else {
      console.log('⚠️  Data loading completed with some issues. Please check the logs above.');
    }

  } catch (error) {
    console.error('💥 Fatal error during data loading:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);