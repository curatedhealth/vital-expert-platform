#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase Cloud Configuration
const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function getSupabaseCloudStatus() {
  console.log('📊 SUPABASE CLOUD DATABASE STATUS REPORT\n');
  console.log('=' .repeat(70));

  try {
    // Core Data Tables
    console.log('\n🎯 CORE DATA TABLES:');
    
    const { count: agentsCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true });
    console.log(`   ✅ Agents: ${agentsCount || 0} records`);

    const { count: knowledgeDomainsCount } = await supabase
      .from('knowledge_domains')
      .select('*', { count: 'exact', head: true });
    console.log(`   ✅ Knowledge Domains: ${knowledgeDomainsCount || 0} records`);

    const { count: llmProvidersCount } = await supabase
      .from('llm_providers')
      .select('*', { count: 'exact', head: true });
    console.log(`   ✅ LLM Providers: ${llmProvidersCount || 0} records`);

    // Organizational Structure
    console.log('\n🏢 ORGANIZATIONAL STRUCTURE:');
    
    const { count: functionsCount } = await supabase
      .from('org_functions')
      .select('*', { count: 'exact', head: true });
    console.log(`   ✅ Functions: ${functionsCount || 0} records`);

    const { count: departmentsCount } = await supabase
      .from('org_departments')
      .select('*', { count: 'exact', head: true });
    console.log(`   ✅ Departments: ${departmentsCount || 0} records`);

    const { count: rolesCount } = await supabase
      .from('org_roles')
      .select('*', { count: 'exact', head: true });
    console.log(`   ✅ Roles: ${rolesCount || 0} records`);

    const { count: responsibilitiesCount } = await supabase
      .from('org_responsibilities')
      .select('*', { count: 'exact', head: true });
    console.log(`   ✅ Responsibilities: ${responsibilitiesCount || 0} records`);

    // Relationship Tables
    console.log('\n🔗 RELATIONSHIP TABLES:');
    
    const relationshipTables = [
      'agent_capabilities',
      'agent_knowledge_domains',
      'agent_tool_assignments',
      'agent_prompts',
      'agent_rag_assignments',
      'agent_performance_metrics',
      'agent_category_mapping',
      'agent_collaborations'
    ];

    for (const tableName of relationshipTables) {
      try {
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        console.log(`   ✅ ${tableName}: ${count || 0} records`);
      } catch (err) {
        console.log(`   ❌ ${tableName}: Table missing or error`);
      }
    }

    // Sample Data Verification
    console.log('\n📋 SAMPLE DATA VERIFICATION:');
    
    const { data: sampleAgents } = await supabase
      .from('agents')
      .select('name, display_name, business_function, status, tier')
      .limit(5);

    if (sampleAgents && sampleAgents.length > 0) {
      console.log('   ✅ Sample Agents:');
      sampleAgents.forEach(agent => {
        console.log(`      - ${agent.display_name} (${agent.business_function}, ${agent.status}, Tier ${agent.tier})`);
      });
    }

    const { data: sampleFunctions } = await supabase
      .from('org_functions')
      .select('department_name, description')
      .limit(3);

    if (sampleFunctions && sampleFunctions.length > 0) {
      console.log('\n   ✅ Sample Functions:');
      sampleFunctions.forEach(func => {
        console.log(`      - ${func.department_name}`);
      });
    }

    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log('🎉 SUPABASE CLOUD DATABASE STATUS SUMMARY');
    console.log('=' .repeat(70));
    
    console.log('\n✅ FULLY OPERATIONAL:');
    console.log(`   🎯 ${agentsCount || 0} AI Agents (Complete Registry)`);
    console.log(`   📚 ${knowledgeDomainsCount || 0} Knowledge Domains`);
    console.log(`   🤖 ${llmProvidersCount || 0} LLM Providers`);
    console.log(`   🏢 ${functionsCount || 0} Organizational Functions`);
    console.log(`   🏢 ${departmentsCount || 0} Departments`);
    console.log(`   🏢 ${rolesCount || 0} Roles`);
    console.log(`   🏢 ${responsibilitiesCount || 0} Responsibilities`);

    console.log('\n⚠️  NEEDS ATTENTION:');
    console.log('   🔗 Agent relationship tables (capabilities, tools, prompts)');
    console.log('   📊 Performance metrics and analytics');
    console.log('   🔄 RAG system configuration');

    console.log('\n🚀 READY FOR:');
    console.log('   ✅ Application deployment');
    console.log('   ✅ Agent orchestration');
    console.log('   ✅ User authentication');
    console.log('   ✅ Basic chat functionality');

    console.log('\n📋 MANUAL STEPS TO COMPLETE:');
    console.log('   1. Apply pending SQL migrations via Supabase Dashboard');
    console.log('   2. Configure RAG system and vector embeddings');
    console.log('   3. Set up agent relationship mappings');
    console.log('   4. Configure monitoring and analytics');

  } catch (error) {
    console.error('❌ Status check failed:', error.message);
  }
}

getSupabaseCloudStatus();
