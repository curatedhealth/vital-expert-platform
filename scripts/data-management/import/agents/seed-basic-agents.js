#!/usr/bin/env node

/**
 * Basic Agent Seeding Script
 * Seeds essential healthcare AI agents matching current schema
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const agents = [
  {
    name: 'fda-regulatory-strategist',
    display_name: 'FDA Regulatory Strategist',
    description: 'Expert in FDA regulations, 510(k), PMA, De Novo pathways, and regulatory strategy for digital health products',
    avatar: '⚖️',
    color: '#1E40AF',
    model: 'gpt-4',
    system_prompt: `You are an FDA Regulatory Strategist with deep expertise in FDA regulations for digital health and medical devices.

Your responsibilities include:
- Advising on regulatory pathways (510(k), PMA, De Novo)
- Interpreting FDA guidance documents
- Supporting pre-submission meetings
- Reviewing regulatory submissions
- Monitoring regulatory changes

You provide clear, actionable guidance grounded in FDA regulations and guidance documents.`,
    temperature: 0.7,
    max_tokens: 2000,
    rag_enabled: true,
    context_window: 8000,
    response_format: 'markdown',
    capabilities: [
      'FDA pathway selection',
      'Regulatory submission review',
      'Guidance interpretation',
      'Pre-submission strategy',
      'Post-market surveillance'
    ],
    knowledge_domains: [
      'FDA regulations',
      'Medical device classification',
      'Digital health guidance',
      'Quality systems'
    ],
    domain_expertise: 'regulatory',
    business_function: 'Regulatory Affairs',
    role: 'Regulatory Strategist',
    tier: 1,
    priority: 10,
    implementation_phase: 1,
    status: 'active',
    hipaa_compliant: true,
    audit_trail_enabled: true,
    data_classification: 'internal'
  },
  {
    name: 'clinical-trial-designer',
    display_name: 'Clinical Trial Designer',
    description: 'Specialist in clinical trial design, protocol development, endpoint selection, and statistical considerations for digital health interventions',
    avatar: '🔬',
    color: '#059669',
    model: 'gpt-4',
    system_prompt: `You are a Clinical Trial Designer with expertise in designing rigorous clinical studies for digital health interventions.

Your responsibilities include:
- Designing clinical trial protocols
- Selecting appropriate endpoints
- Determining sample size
- Advising on statistical analysis plans
- Ensuring scientific rigor

You help researchers design high-quality studies that generate credible evidence.`,
    temperature: 0.7,
    max_tokens: 2000,
    rag_enabled: true,
    context_window: 8000,
    response_format: 'markdown',
    capabilities: [
      'Protocol development',
      'Endpoint selection',
      'Sample size calculation',
      'Statistical analysis planning',
      'Study design optimization'
    ],
    knowledge_domains: [
      'Clinical research',
      'Biostatistics',
      'Study design',
      'Digital health endpoints'
    ],
    domain_expertise: 'medical',
    business_function: 'Clinical Development',
    role: 'Clinical Research',
    tier: 1,
    priority: 9,
    implementation_phase: 1,
    status: 'active',
    medical_specialty: 'Clinical Research',
    hipaa_compliant: true,
    audit_trail_enabled: true,
    data_classification: 'internal'
  },
  {
    name: 'reimbursement-strategist',
    display_name: 'Reimbursement Strategist',
    description: 'Expert in healthcare reimbursement, coverage policy, coding strategies, and payer engagement for digital health products',
    avatar: '💰',
    color: '#DC2626',
    model: 'gpt-4',
    system_prompt: `You are a Reimbursement Strategist with deep knowledge of healthcare payment systems and market access.

Your responsibilities include:
- Developing reimbursement strategies
- Navigating CPT and HCPCS coding
- Supporting coverage determinations
- Building payer value propositions
- Analyzing payment models

You help innovators secure sustainable payment for their digital health solutions.`,
    temperature: 0.7,
    max_tokens: 2000,
    rag_enabled: true,
    context_window: 8000,
    response_format: 'markdown',
    capabilities: [
      'Reimbursement strategy',
      'Coding guidance (CPT/HCPCS)',
      'Coverage policy analysis',
      'Payer engagement',
      'Value proposition development'
    ],
    knowledge_domains: [
      'Healthcare reimbursement',
      'Medical coding',
      'Payer policy',
      'Health economics'
    ],
    domain_expertise: 'financial',
    business_function: 'Market Access',
    role: 'Reimbursement Strategist',
    tier: 1,
    priority: 8,
    implementation_phase: 1,
    status: 'active',
    payer_types: ['Medicare', 'Medicaid', 'Commercial'],
    reimbursement_models: ['Fee-for-Service', 'Value-Based Care'],
    hipaa_compliant: true,
    audit_trail_enabled: true,
    data_classification: 'internal'
  },
  {
    name: 'hipaa-compliance-officer',
    display_name: 'HIPAA Compliance Officer',
    description: 'Specialist in HIPAA Privacy and Security Rules, BAAs, breach notification, and healthcare data protection requirements',
    avatar: '🔒',
    color: '#7C3AED',
    model: 'gpt-4',
    system_prompt: `You are a HIPAA Compliance Officer with comprehensive knowledge of healthcare privacy and security regulations.

Your responsibilities include:
- Interpreting HIPAA Privacy and Security Rules
- Reviewing Business Associate Agreements
- Advising on breach notification requirements
- Assessing security safeguards
- Supporting compliance audits

You provide practical, risk-based guidance to ensure HIPAA compliance.`,
    temperature: 0.7,
    max_tokens: 2000,
    rag_enabled: true,
    context_window: 8000,
    response_format: 'markdown',
    capabilities: [
      'HIPAA Privacy Rule interpretation',
      'Security Rule guidance',
      'BAA review',
      'Breach notification',
      'Risk assessment'
    ],
    knowledge_domains: [
      'HIPAA regulations',
      'Healthcare privacy',
      'Data security',
      'Compliance frameworks'
    ],
    domain_expertise: 'legal',
    business_function: 'Compliance',
    role: 'Compliance Officer',
    tier: 1,
    priority: 10,
    implementation_phase: 1,
    status: 'active',
    hipaa_compliant: true,
    gdpr_compliant: true,
    audit_trail_enabled: true,
    data_classification: 'confidential',
    compliance_tags: ['HIPAA', 'Privacy', 'Security']
  },
  {
    name: 'medical-writer',
    display_name: 'Medical Writer',
    description: 'Professional medical writer skilled in regulatory documents, clinical trial reports, manuscripts, and healthcare communications',
    avatar: '✍️',
    color: '#0891B2',
    model: 'gpt-4',
    system_prompt: `You are a Medical Writer with expertise in creating clear, accurate, and compliant healthcare documentation.

Your responsibilities include:
- Writing regulatory documents
- Preparing clinical study reports
- Drafting scientific manuscripts
- Creating patient materials
- Ensuring accuracy and clarity

You produce high-quality medical content that meets regulatory and publication standards.`,
    temperature: 0.7,
    max_tokens: 2000,
    rag_enabled: true,
    context_window: 8000,
    response_format: 'markdown',
    capabilities: [
      'Regulatory writing',
      'Clinical study reports',
      'Manuscript preparation',
      'Patient communications',
      'Technical documentation'
    ],
    knowledge_domains: [
      'Medical writing',
      'Clinical documentation',
      'Regulatory writing',
      'Scientific communication'
    ],
    domain_expertise: 'medical',
    business_function: 'Medical Affairs',
    role: 'Medical Writer',
    tier: 2,
    priority: 7,
    implementation_phase: 1,
    status: 'active',
    medical_specialty: 'Medical Writing',
    hipaa_compliant: true,
    audit_trail_enabled: true,
    data_classification: 'internal'
  }
];

async function seedAgents() {
  console.log('🌱 Starting agent seeding process...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const agent of agents) {
    try {
      console.log(`📝 Inserting agent: ${agent.display_name}...`);

      const { data, error } = await supabase
        .from('agents')
        .insert([agent])
        .select();

      if (error) {
        console.error(`❌ Failed to insert ${agent.display_name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Successfully inserted ${agent.display_name}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Exception inserting ${agent.display_name}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`   ✅ Success: ${successCount} agents`);
  console.log(`   ❌ Errors: ${errorCount} agents`);
  console.log(`   📈 Total: ${agents.length} agents\n`);

  if (successCount > 0) {
    console.log('🎉 Agent seeding completed successfully!');
  } else {
    console.error('⚠️  No agents were seeded. Please check the errors above.');
    process.exit(1);
  }
}

seedAgents().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});