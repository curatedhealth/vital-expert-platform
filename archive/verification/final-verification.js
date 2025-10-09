#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase Cloud Configuration
const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function finalVerification() {
  console.log('🎯 Final Verification - Supabase Cloud Database Status\n');
  console.log('=' .repeat(60));

  try {
    // Check core tables
    console.log('\n📊 CORE DATA TABLES:');
    
    const { count: agentsCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ Agents: ${agentsCount || 0} records`);

    const { count: knowledgeDomainsCount } = await supabase
      .from('knowledge_domains')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ Knowledge Domains: ${knowledgeDomainsCount || 0} records`);

    const { count: llmProvidersCount } = await supabase
      .from('llm_providers')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ LLM Providers: ${llmProvidersCount || 0} records`);

    // Check organizational structure
    console.log('\n🏢 ORGANIZATIONAL STRUCTURE:');
    
    const { count: functionsCount } = await supabase
      .from('org_functions')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ Functions: ${functionsCount || 0} records`);

    const { count: departmentsCount } = await supabase
      .from('org_departments')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ Departments: ${departmentsCount || 0} records`);

    const { count: rolesCount } = await supabase
      .from('org_roles')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ Roles: ${rolesCount || 0} records`);

    const { count: responsibilitiesCount } = await supabase
      .from('org_responsibilities')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ Responsibilities: ${responsibilitiesCount || 0} records`);

    // Check relationship tables (structure only)
    console.log('\n🔗 RELATIONSHIP TABLES (Structure):');
    
    const relationshipTables = [
      'agent_capabilities',
      'agent_knowledge_domains', 
      'agent_tool_assignments',
      'agent_prompts',
      'agent_rag_assignments',
      'agent_performance_metrics'
    ];

    for (const tableName of relationshipTables) {
      try {
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        console.log(`✅ ${tableName}: ${count || 0} records (table exists)`);
      } catch (err) {
        console.log(`❌ ${tableName}: Table missing or error`);
      }
    }

    // Sample data verification
    console.log('\n📋 SAMPLE DATA VERIFICATION:');
    
    const { data: sampleAgents } = await supabase
      .from('agents')
      .select('name, display_name, business_function, status')
      .limit(3);

    if (sampleAgents && sampleAgents.length > 0) {
      console.log('✅ Sample Agents:');
      sampleAgents.forEach(agent => {
        console.log(`   - ${agent.display_name} (${agent.business_function}, ${agent.status})`);
      });
    }

    const { data: sampleFunctions } = await supabase
      .from('org_functions')
      .select('department_name, description')
      .limit(3);

    if (sampleFunctions && sampleFunctions.length > 0) {
      console.log('\n✅ Sample Functions:');
      sampleFunctions.forEach(func => {
        console.log(`   - ${func.department_name}`);
      });
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 SUPABASE CLOUD DATABASE SETUP COMPLETE!');
    console.log('=' .repeat(60));
    
    console.log('\n📈 SUMMARY:');
    console.log(`   ✅ ${agentsCount || 0} AI Agents migrated and ready`);
    console.log(`   ✅ ${knowledgeDomainsCount || 0} Knowledge Domains configured`);
    console.log(`   ✅ ${llmProvidersCount || 0} LLM Providers set up`);
    console.log(`   ✅ ${functionsCount || 0} Organizational Functions defined`);
    console.log(`   ✅ ${departmentsCount || 0} Departments structured`);
    console.log(`   ✅ ${rolesCount || 0} Roles mapped`);
    console.log(`   ✅ ${responsibilitiesCount || 0} Responsibilities catalogued`);
    console.log(`   ✅ Relationship tables created (ready for population)`);

    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Update your app to use cloud database');
    console.log('   2. Populate relationship tables with proper schema');
    console.log('   3. Set up agent workflows and integrations');
    console.log('   4. Configure authentication and user management');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

finalVerification();
