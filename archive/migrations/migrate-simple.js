#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Supabase Cloud Configuration
const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🚀 Starting VITAL Expert data migration to Supabase Cloud...');

// Function to make HTTP requests
async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
      'Prefer': 'return=minimal',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  const text = await response.text();
  return text === '' ? null : JSON.parse(text);
}

// Function to upload data in batches
async function uploadTableData(tableName, data, batchSize = 50) {
  if (!data || data.length === 0) {
    console.log(`⚠️  No data to upload for ${tableName}`);
    return;
  }

  console.log(`📤 Uploading ${data.length} records to ${tableName}...`);

  try {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      console.log(`   📦 Uploading batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(data.length/batchSize)}...`);

      await makeRequest(`${SUPABASE_URL}/rest/v1/${tableName}`, {
        method: 'POST',
        body: JSON.stringify(batch)
      });
    }

    console.log(`✅ Successfully uploaded ${data.length} records to ${tableName}`);
  } catch (error) {
    console.error(`❌ Error uploading to ${tableName}:`, error.message);
    throw error;
  }
}

// Function to read CSV file
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Function to safely parse JSON
function safeJsonParse(str, defaultValue = {}) {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
}

// Function to safely parse number
function safeParseNumber(str, defaultValue = 0) {
  if (!str) return defaultValue;
  const parsed = parseFloat(str);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Function to safely parse integer
function safeParseInt(str, defaultValue = 0) {
  if (!str) return defaultValue;
  const parsed = parseInt(str);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Function to process agents from CSV
async function processAgentsFromCSV() {
  console.log('📊 Processing agents from CSV...');
  
  const csvPath = path.join(__dirname, '🤖 AI Agents Registry 65d441afe2f24fbbad9465ee79e513ae_all.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('⚠️  CSV file not found, skipping agents');
    return [];
  }

  const agents = await readCSV(csvPath);
  console.log(`📋 Found ${agents.length} agents in CSV`);

  return agents.map((agent, index) => {
    return {
      name: agent.Name || `Agent ${index + 1}`,
      display_name: agent.Display_Name || agent.Name || `Agent ${index + 1}`,
      description: agent.Description || 'AI agent for healthcare applications',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${(agent.Name || `agent${index}`).replace(/\s+/g, '')}`,
      color: '#3B82F6',
      system_prompt: agent.System_Prompt || `You are ${agent.Name || 'an AI agent'} specialized in healthcare applications.`,
      model: agent.Model || agent.Primary_Model || 'gpt-4',
      temperature: safeParseNumber(agent.Temperature, 0.7),
      max_tokens: safeParseInt(agent.Max_Tokens, 2000),
      capabilities: safeJsonParse(agent.Capabilities, {"general": true}),
      specializations: agent.Domain ? {"domain": agent.Domain} : {"general": true},
      tools: {"basic": true},
      tier: safeParseInt(agent.Tier, 2),
      priority: safeParseInt(agent.Priority, 1),
      implementation_phase: 1,
      rag_enabled: agent.RAG_Enabled === 'Yes' || agent.RAG_Enabled === 'true',
      knowledge_domains: agent.Domain ? {"domains": [agent.Domain.toLowerCase().replace(/\s+/g, '-')]} : {"domains": ["general"]},
      data_sources: {"general": true},
      roi_metrics: {"cost_savings": "medium"},
      use_cases: {"general": true},
      target_users: {"healthcare_professionals": true},
      required_integrations: {"basic": true},
      security_level: agent.HIPAA_Compliant === 'Yes' ? 'high' : 'medium',
      compliance_requirements: {
        "HIPAA": agent.HIPAA_Compliant === 'Yes',
        "GDPR": agent.GDPR_Compliant === 'Yes'
      },
      status: agent.Status || 'active',
      is_custom: false,
      business_function: agent.Domain || 'General',
      role: agent.Type || 'AI Agent',
      medical_specialty: agent.Medical_Specialty || 'General',
      hipaa_compliant: agent.HIPAA_Compliant === 'Yes',
      pharma_enabled: agent.PHARMA_Enabled === 'Yes',
      verify_enabled: agent.VERIFY_Enabled === 'Yes',
      domain_expertise: agent.Domain_Expertise || agent.Domain || 'General',
      cost_per_query: safeParseNumber(agent.Cost_Per_Execution, 0.05),
      validation_status: agent.Validation_Status || 'pending',
      performance_metrics: {
        "accuracy": safeParseNumber(agent.Accuracy_Score, 0.85),
        "response_time": safeParseInt(agent.Response_Time, 2000)
      },
      accuracy_score: safeParseNumber(agent.Accuracy_Score, 0.85),
      evidence_required: true,
      regulatory_context: {"general": true},
      compliance_tags: agent.HIPAA_Compliant === 'Yes' ? ['HIPAA'] : [],
      gdpr_compliant: agent.GDPR_Compliant === 'Yes',
      audit_trail_enabled: true,
      data_classification: 'confidential',
      is_public: true,
      clinical_validation_status: 'pending',
      medical_accuracy_score: safeParseNumber(agent.Accuracy_Score, 0.85),
      citation_accuracy: 0.90,
      hallucination_rate: 0.05,
      medical_error_rate: 0.02,
      average_latency_ms: safeParseInt(agent.Response_Time, 2000),
      regulatory_pathway: 'general',
      submission_type: 'general',
      regulatory_risk_level: 'medium',
      clinical_trial_phase: 'general',
      patient_population: 'general',
      therapeutic_area: agent.Medical_Specialty || 'General',
      endpoint_types: {"general": true},
      statistical_methods: {"basic": true},
      clinical_standards: {"general": true},
      validation_method: 'automated',
      validation_scope: 'general',
      success_metrics: {"accuracy": 0.85},
      usage_analytics: {"usage_count": 0},
      feedback_score: 0.85,
      user_satisfaction: 0.85,
      recommendation_score: 0.85,
      regulatory_intelligence: {"general": true},
      market_authorization_status: 'pending',
      submission_timeline: {"estimated": "3_months"},
      regulatory_milestones: {"general": true},
      clinical_intelligence: {"general": true},
      study_design_expertise: {"general": true},
      protocol_templates: {"general": true},
      biostatistics_capabilities: {"basic": true}
    };
  });
}

// Function to process knowledge domains
async function processKnowledgeDomains() {
  console.log('📚 Processing knowledge domains...');
  
  const domains = [
    { code: 'REG_AFF', name: 'Regulatory Affairs', slug: 'regulatory-affairs', description: 'FDA, EMA, and global regulatory requirements', tier: 1, priority: 1, keywords: ['FDA', 'EMA', 'regulatory', 'compliance'], sub_domains: ['FDA Submissions', 'EMA Procedures', 'Global Regulations'], agent_count_estimate: 25, color: '#3B82F6' },
    { code: 'CLIN_DEV', name: 'Clinical Development', slug: 'clinical-development', description: 'Clinical trial design and execution', tier: 1, priority: 2, keywords: ['clinical trials', 'protocols', 'study design'], sub_domains: ['Protocol Design', 'Trial Management', 'Data Analysis'], agent_count_estimate: 30, color: '#10B981' },
    { code: 'MED_AFF', name: 'Medical Affairs', slug: 'medical-affairs', description: 'Medical information and scientific communications', tier: 1, priority: 3, keywords: ['medical information', 'scientific', 'communications'], sub_domains: ['Medical Information', 'Scientific Communications', 'KOL Management'], agent_count_estimate: 20, color: '#8B5CF6' },
    { code: 'QA_COMP', name: 'Quality Assurance', slug: 'quality-assurance', description: 'Quality systems and compliance', tier: 1, priority: 4, keywords: ['quality', 'compliance', 'systems'], sub_domains: ['Quality Systems', 'Compliance', 'Audits'], agent_count_estimate: 15, color: '#F59E0B' },
    { code: 'DRUG_DEV', name: 'Drug Development', slug: 'drug-development', description: 'Pharmaceutical drug development lifecycle', tier: 1, priority: 5, keywords: ['drug development', 'pharmaceutical', 'R&D'], sub_domains: ['Discovery', 'Preclinical', 'Clinical'], agent_count_estimate: 35, color: '#EF4444' },
    { code: 'SAFETY', name: 'Drug Safety', slug: 'drug-safety', description: 'Pharmacovigilance and safety monitoring', tier: 1, priority: 6, keywords: ['safety', 'pharmacovigilance', 'adverse events'], sub_domains: ['Safety Monitoring', 'Risk Management', 'Signal Detection'], agent_count_estimate: 20, color: '#F97316' },
    { code: 'MANUF', name: 'Manufacturing', slug: 'manufacturing', description: 'Pharmaceutical manufacturing and GMP', tier: 2, priority: 7, keywords: ['manufacturing', 'GMP', 'production'], sub_domains: ['Production', 'Quality Control', 'Supply Chain'], agent_count_estimate: 18, color: '#84CC16' },
    { code: 'BIOSTAT', name: 'Biostatistics', slug: 'biostatistics', description: 'Statistical analysis for clinical trials', tier: 2, priority: 8, keywords: ['statistics', 'clinical trials', 'analysis'], sub_domains: ['Statistical Analysis', 'Trial Design', 'Data Management'], agent_count_estimate: 12, color: '#06B6D4' },
    { code: 'PHARMA', name: 'Pharmacology', slug: 'pharmacology', description: 'Drug mechanisms and pharmacokinetics', tier: 2, priority: 9, keywords: ['pharmacology', 'PK/PD', 'drug mechanisms'], sub_domains: ['Pharmacokinetics', 'Pharmacodynamics', 'Drug Interactions'], agent_count_estimate: 15, color: '#8B5CF6' },
    { code: 'ONCO', name: 'Oncology', slug: 'oncology', description: 'Cancer research and treatment', tier: 2, priority: 10, keywords: ['oncology', 'cancer', 'tumor'], sub_domains: ['Solid Tumors', 'Hematology', 'Immunotherapy'], agent_count_estimate: 25, color: '#DC2626' },
    { code: 'CARDIO', name: 'Cardiology', slug: 'cardiology', description: 'Cardiovascular medicine and research', tier: 2, priority: 11, keywords: ['cardiology', 'cardiovascular', 'heart'], sub_domains: ['Heart Disease', 'Vascular', 'Interventional'], agent_count_estimate: 20, color: '#EA580C' },
    { code: 'NEURO', name: 'Neurology', slug: 'neurology', description: 'Neurological disorders and treatments', tier: 2, priority: 12, keywords: ['neurology', 'brain', 'nervous system'], sub_domains: ['Alzheimer\'s', 'Parkinson\'s', 'Multiple Sclerosis'], agent_count_estimate: 18, color: '#7C3AED' },
    { code: 'DIAB', name: 'Diabetes', slug: 'diabetes', description: 'Diabetes research and management', tier: 2, priority: 13, keywords: ['diabetes', 'glucose', 'insulin'], sub_domains: ['Type 1', 'Type 2', 'Complications'], agent_count_estimate: 15, color: '#059669' },
    { code: 'IMMUNO', name: 'Immunology', slug: 'immunology', description: 'Immune system and autoimmune diseases', tier: 2, priority: 14, keywords: ['immunology', 'immune system', 'autoimmune'], sub_domains: ['Autoimmune', 'Immunotherapy', 'Vaccines'], agent_count_estimate: 16, color: '#0891B2' },
    { code: 'PEDS', name: 'Pediatrics', slug: 'pediatrics', description: 'Children\'s health and medicine', tier: 2, priority: 15, keywords: ['pediatrics', 'children', 'pediatric'], sub_domains: ['Neonatal', 'Adolescent', 'Rare Diseases'], agent_count_estimate: 12, color: '#BE185D' },
    { code: 'GERI', name: 'Geriatrics', slug: 'geriatrics', description: 'Elderly care and aging research', tier: 2, priority: 16, keywords: ['geriatrics', 'aging', 'elderly'], sub_domains: ['Aging', 'Cognitive Decline', 'Polypharmacy'], agent_count_estimate: 10, color: '#B45309' },
    { code: 'MENTAL', name: 'Mental Health', slug: 'mental-health', description: 'Psychiatry and mental health disorders', tier: 2, priority: 17, keywords: ['mental health', 'psychiatry', 'depression'], sub_domains: ['Depression', 'Anxiety', 'Bipolar'], agent_count_estimate: 14, color: '#7C2D12' },
    { code: 'INFECT', name: 'Infectious Diseases', slug: 'infectious-diseases', description: 'Infectious disease research and treatment', tier: 2, priority: 18, keywords: ['infectious diseases', 'pathogens', 'antibiotics'], sub_domains: ['Bacterial', 'Viral', 'Antimicrobial Resistance'], agent_count_estimate: 16, color: '#166534' },
    { code: 'RARE', name: 'Rare Diseases', slug: 'rare-diseases', description: 'Orphan diseases and rare conditions', tier: 3, priority: 19, keywords: ['rare diseases', 'orphan', 'genetic'], sub_domains: ['Genetic Disorders', 'Orphan Drugs', 'Patient Advocacy'], agent_count_estimate: 8, color: '#92400E' },
    { code: 'DIGITAL', name: 'Digital Health', slug: 'digital-health', description: 'Digital therapeutics and health technology', tier: 3, priority: 20, keywords: ['digital health', 'telemedicine', 'mHealth'], sub_domains: ['Telemedicine', 'Wearables', 'AI Diagnostics'], agent_count_estimate: 12, color: '#1E40AF' },
    { code: 'PRECISION', name: 'Precision Medicine', slug: 'precision-medicine', description: 'Personalized medicine and genomics', tier: 3, priority: 21, keywords: ['precision medicine', 'genomics', 'personalized'], sub_domains: ['Genomics', 'Biomarkers', 'Targeted Therapy'], agent_count_estimate: 10, color: '#7C3AED' },
    { code: 'REGEN', name: 'Regenerative Medicine', slug: 'regenerative-medicine', description: 'Stem cells and tissue engineering', tier: 3, priority: 22, keywords: ['regenerative medicine', 'stem cells', 'tissue engineering'], sub_domains: ['Stem Cells', 'Tissue Engineering', 'Gene Therapy'], agent_count_estimate: 8, color: '#059669' },
    { code: 'NANOTECH', name: 'Nanotechnology', slug: 'nanotechnology', description: 'Nanomedicine and drug delivery', tier: 3, priority: 23, keywords: ['nanotechnology', 'nanomedicine', 'drug delivery'], sub_domains: ['Drug Delivery', 'Imaging', 'Therapeutics'], agent_count_estimate: 6, color: '#DC2626' },
    { code: 'AI_ML', name: 'AI/ML in Healthcare', slug: 'ai-ml-healthcare', description: 'Artificial intelligence in medical applications', tier: 3, priority: 24, keywords: ['AI', 'machine learning', 'healthcare'], sub_domains: ['Diagnostics', 'Drug Discovery', 'Clinical Decision Support'], agent_count_estimate: 15, color: '#1F2937' },
    { code: 'BIG_DATA', name: 'Big Data Analytics', slug: 'big-data-analytics', description: 'Healthcare data analytics and insights', tier: 3, priority: 25, keywords: ['big data', 'analytics', 'healthcare data'], sub_domains: ['Data Mining', 'Predictive Analytics', 'Real World Evidence'], agent_count_estimate: 10, color: '#374151' },
    { code: 'BLOCKCHAIN', name: 'Blockchain in Healthcare', slug: 'blockchain-healthcare', description: 'Blockchain applications in healthcare', tier: 3, priority: 26, keywords: ['blockchain', 'healthcare', 'security'], sub_domains: ['Data Security', 'Supply Chain', 'Patient Records'], agent_count_estimate: 5, color: '#059669' },
    { code: 'IOT', name: 'IoT in Healthcare', slug: 'iot-healthcare', description: 'Internet of Things medical devices', tier: 3, priority: 27, keywords: ['IoT', 'medical devices', 'connected health'], sub_domains: ['Wearables', 'Remote Monitoring', 'Smart Devices'], agent_count_estimate: 8, color: '#0891B2' },
    { code: 'VR_AR', name: 'VR/AR in Healthcare', slug: 'vr-ar-healthcare', description: 'Virtual and augmented reality in medicine', tier: 3, priority: 28, keywords: ['VR', 'AR', 'virtual reality', 'augmented reality'], sub_domains: ['Medical Training', 'Surgery Planning', 'Patient Therapy'], agent_count_estimate: 6, color: '#7C3AED' },
    { code: 'ROBOTICS', name: 'Medical Robotics', slug: 'medical-robotics', description: 'Robotic systems in healthcare', tier: 3, priority: 29, keywords: ['robotics', 'surgical robots', 'medical robots'], sub_domains: ['Surgical Robots', 'Rehabilitation', 'Assistive Devices'], agent_count_estimate: 7, color: '#DC2626' },
    { code: 'QUANTUM', name: 'Quantum Computing', slug: 'quantum-computing', description: 'Quantum computing in drug discovery', tier: 3, priority: 30, keywords: ['quantum computing', 'drug discovery', 'molecular simulation'], sub_domains: ['Drug Discovery', 'Molecular Simulation', 'Optimization'], agent_count_estimate: 4, color: '#1F2937' }
  ];

  return domains;
}

// Function to process LLM providers
async function processLLMProviders() {
  console.log('🤖 Processing LLM providers...');
  
  return [
    {
      provider_name: 'OpenAI GPT-4',
      provider_type: 'openai',
      api_endpoint: 'https://api.openai.com/v1',
      model_id: 'gpt-4',
      model_version: 'gpt-4-1106-preview',
      capabilities: '{"text_generation": true, "chat": true, "embeddings": true}',
      cost_per_1k_input_tokens: 0.03,
      cost_per_1k_output_tokens: 0.06,
      max_tokens: 4096,
      temperature_default: 0.7,
      rate_limit_rpm: 500,
      rate_limit_tpm: 150000,
      priority_level: 1,
      weight: 1.0,
      status: 'active',
      is_active: true,
      is_hipaa_compliant: false,
      is_production_ready: true,
      medical_accuracy_score: 0.95,
      average_latency_ms: 1200,
      uptime_percentage: 99.9,
      health_check_enabled: true,
      health_check_interval_minutes: 5,
      health_check_timeout_seconds: 30,
      metadata: '{"description": "OpenAI GPT-4 for general medical assistance"}',
      tags: ['general', 'medical', 'gpt-4']
    },
    {
      provider_name: 'Anthropic Claude',
      provider_type: 'anthropic',
      api_endpoint: 'https://api.anthropic.com/v1',
      model_id: 'claude-3-5-sonnet',
      model_version: 'claude-3-5-sonnet-20241022',
      capabilities: '{"text_generation": true, "chat": true, "analysis": true}',
      cost_per_1k_input_tokens: 0.015,
      cost_per_1k_output_tokens: 0.075,
      max_tokens: 8192,
      temperature_default: 0.7,
      rate_limit_rpm: 1000,
      rate_limit_tpm: 200000,
      priority_level: 1,
      weight: 1.0,
      status: 'active',
      is_active: true,
      is_hipaa_compliant: true,
      is_production_ready: true,
      medical_accuracy_score: 0.98,
      average_latency_ms: 800,
      uptime_percentage: 99.8,
      health_check_enabled: true,
      health_check_interval_minutes: 5,
      health_check_timeout_seconds: 30,
      metadata: '{"description": "Anthropic Claude for medical analysis and compliance"}',
      tags: ['medical', 'compliance', 'claude']
    }
  ];
}

// Main migration function
async function migrateAllData() {
  try {
    console.log('🚀 Starting comprehensive data migration...\n');

    // Step 1: Process and upload LLM providers
    console.log('📋 Step 1: Processing LLM providers...');
    const llmProviders = await processLLMProviders();
    await uploadTableData('llm_providers', llmProviders);
    console.log('✅ LLM providers uploaded\n');

    // Step 2: Process and upload knowledge domains
    console.log('📋 Step 2: Processing knowledge domains...');
    const knowledgeDomains = await processKnowledgeDomains();
    await uploadTableData('knowledge_domains', knowledgeDomains);
    console.log('✅ Knowledge domains uploaded\n');

    // Step 3: Process and upload agents
    console.log('📋 Step 3: Processing agents...');
    const agents = await processAgentsFromCSV();
    await uploadTableData('agents', agents, 25); // Smaller batches for agents
    console.log('✅ Agents uploaded\n');

    console.log('🎉 Migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - LLM Providers: ${llmProviders.length}`);
    console.log(`   - Knowledge Domains: ${knowledgeDomains.length}`);
    console.log(`   - Agents: ${agents.length}`);
    console.log('\n🚀 Your VITAL Expert platform is now fully migrated to Supabase Cloud!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
migrateAllData();
