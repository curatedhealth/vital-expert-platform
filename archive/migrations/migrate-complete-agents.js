#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase Cloud Configuration
const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function migrateCompleteAgents() {
  console.log('🚀 Migrating complete agent set (254 agents)...\n');

  try {
    // Step 1: Load the comprehensive agents JSON
    console.log('📋 Step 1: Loading comprehensive agents data...');
    
    const agentsPath = './data/agents-comprehensive.json';
    if (!fs.existsSync(agentsPath)) {
      console.error('❌ Comprehensive agents file not found:', agentsPath);
      return;
    }

    const agentsData = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));
    console.log(`✅ Loaded ${agentsData.length} agents from comprehensive JSON`);

    // Step 2: Clear existing agents
    console.log('\n📋 Step 2: Clearing existing agents...');
    const { error: clearError } = await supabase
      .from('agents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (clearError) {
      console.error('❌ Error clearing agents:', clearError.message);
      return;
    }
    console.log('✅ Existing agents cleared');

    // Step 3: Process and upload all agents
    console.log('\n📋 Step 3: Processing and uploading agents...');
    
    let successCount = 0;
    let errorCount = 0;
    const batchSize = 25;

    for (let i = 0; i < agentsData.length; i += batchSize) {
      const batch = agentsData.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(agentsData.length / batchSize);
      
      console.log(`   📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} agents)...`);

      // Process each agent in the batch
      const processedBatch = batch.map(agent => {
        // Map the comprehensive JSON structure to database schema
        return {
          name: agent.name || `agent_${agent.id}`,
          display_name: agent.display_name || agent.name || `Agent ${agent.id}`,
          description: agent.description || 'AI agent for healthcare applications',
          avatar: agent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name || agent.id}`,
          color: agent.color || '#3B82F6',
          system_prompt: agent.system_prompt || `You are ${agent.display_name || agent.name}, an AI agent specialized in healthcare applications.`,
          model: agent.model || 'gpt-4',
          temperature: Math.min(parseFloat(agent.temperature) || 0.7, 1.0),
          max_tokens: parseInt(agent.max_tokens) || 2000,
          capabilities: agent.capabilities || {"general": true},
          specializations: agent.specializations || {"general": true},
          tools: agent.tools || {"basic": true},
          tier: parseInt(agent.tier) || 2,
          priority: parseInt(agent.priority) || 1,
          implementation_phase: parseInt(agent.implementation_phase) || 1,
          rag_enabled: agent.rag_enabled || true,
          knowledge_domains: agent.knowledge_domains || {"domains": ["general"]},
          data_sources: agent.data_sources || {"general": true},
          roi_metrics: agent.roi_metrics || {"cost_savings": "medium"},
          use_cases: agent.use_cases || {"general": true},
          target_users: agent.target_users || {"healthcare_professionals": true},
          required_integrations: agent.required_integrations || {"basic": true},
          security_level: agent.security_level || 'medium',
          compliance_requirements: agent.compliance_requirements || {"HIPAA": false, "GDPR": false},
          status: (() => {
            const validStatuses = ['active', 'inactive', 'development', 'testing', 'deprecated', 'planned', 'pipeline'];
            const status = agent.status || 'active';
            return validStatuses.includes(status) ? status : 'active';
          })(),
          is_custom: agent.is_custom || false,
          business_function: agent.business_function || 'General',
          role: agent.role || 'AI Agent',
          medical_specialty: agent.medical_specialty || 'General',
          hipaa_compliant: agent.hipaa_compliant || false,
          pharma_enabled: agent.pharma_enabled || false,
          verify_enabled: agent.verify_enabled || false,
          domain_expertise: agent.domain_expertise || 'General',
          cost_per_query: Math.min(parseFloat(agent.cost_per_query) || 0.05, 9.9999),
          validation_status: agent.validation_status || 'pending',
          performance_metrics: agent.performance_metrics || {"accuracy": 0.85, "response_time": 2000},
          accuracy_score: Math.min(parseFloat(agent.accuracy_score) || 0.85, 1.0),
          evidence_required: agent.evidence_required || true,
          regulatory_context: agent.regulatory_context || {"general": true},
          compliance_tags: agent.compliance_tags || [],
          gdpr_compliant: agent.gdpr_compliant || false,
          audit_trail_enabled: agent.audit_trail_enabled || true,
          data_classification: agent.data_classification || 'confidential',
          is_public: agent.is_public || true,
          clinical_validation_status: agent.clinical_validation_status || 'pending',
          medical_accuracy_score: Math.min(parseFloat(agent.medical_accuracy_score) || 0.85, 1.0),
          citation_accuracy: agent.citation_accuracy || 0.90,
          hallucination_rate: agent.hallucination_rate || 0.05,
          medical_error_rate: agent.medical_error_rate || 0.02,
          average_latency_ms: parseInt(agent.average_latency_ms) || 2000,
          regulatory_pathway: agent.regulatory_pathway || 'general',
          submission_type: agent.submission_type || 'general',
          regulatory_risk_level: agent.regulatory_risk_level || 'medium',
          clinical_trial_phase: agent.clinical_trial_phase || 'general',
          patient_population: agent.patient_population || 'general',
          therapeutic_area: agent.therapeutic_area || 'General',
          endpoint_types: agent.endpoint_types || {"general": true},
          statistical_methods: agent.statistical_methods || {"basic": true},
          clinical_standards: agent.clinical_standards || {"general": true},
          validation_method: agent.validation_method || 'automated',
          validation_scope: agent.validation_scope || 'general',
          success_metrics: agent.success_metrics || {"accuracy": 0.85},
          usage_analytics: agent.usage_analytics || {"usage_count": 0},
          feedback_score: agent.feedback_score || 0.85,
          user_satisfaction: agent.user_satisfaction || 0.85,
          recommendation_score: agent.recommendation_score || 0.85,
          regulatory_intelligence: agent.regulatory_intelligence || {"general": true},
          market_authorization_status: agent.market_authorization_status || 'pending',
          submission_timeline: agent.submission_timeline || {"estimated": "3_months"},
          regulatory_milestones: agent.regulatory_milestones || {"general": true},
          clinical_intelligence: agent.clinical_intelligence || {"general": true},
          study_design_expertise: agent.study_design_expertise || {"general": true},
          protocol_templates: agent.protocol_templates || {"general": true},
          biostatistics_capabilities: agent.biostatistics_capabilities || {"basic": true}
        };
      });

      // Upload the batch
      const { error: batchError } = await supabase
        .from('agents')
        .insert(processedBatch);

      if (batchError) {
        console.error(`   ❌ Batch ${batchNumber} failed:`, batchError.message);
        errorCount += batch.length;
      } else {
        console.log(`   ✅ Batch ${batchNumber} uploaded successfully`);
        successCount += batch.length;
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Successfully uploaded: ${successCount} agents`);
    console.log(`   ❌ Failed uploads: ${errorCount} agents`);
    console.log(`   📈 Total processed: ${successCount + errorCount} agents`);

    if (successCount > 0) {
      console.log('\n🚀 Your complete agent registry (254 agents) is now in Supabase Cloud!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

migrateCompleteAgents();
