#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase Cloud Configuration
const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyKeyUpdates() {
  console.log('🔧 Applying key Supabase Cloud updates...\n');

  try {
    // Step 1: Populate agent capabilities
    console.log('📋 Step 1: Populating agent capabilities...');
    
    const { data: agents } = await supabase
      .from('agents')
      .select('id, name, display_name, business_function')
      .limit(20);

    if (agents && agents.length > 0) {
      const capabilities = [
        'general_consultation',
        'data_analysis',
        'report_generation',
        'regulatory_guidance',
        'clinical_support'
      ];

      let capabilitiesAdded = 0;
      for (const agent of agents) {
        for (const capability of capabilities) {
          const { error } = await supabase
            .from('agent_capabilities')
            .insert({
              agent_id: agent.id,
              capability_name: capability,
              description: `Capability: ${capability}`,
              proficiency_level: 1
            });

          if (!error) {
            capabilitiesAdded++;
          }
        }
      }
      console.log(`   ✅ Added ${capabilitiesAdded} agent capabilities`);
    }

    // Step 2: Populate agent knowledge domains
    console.log('\n📋 Step 2: Populating agent knowledge domains...');
    
    const { data: knowledgeDomains } = await supabase
      .from('knowledge_domains')
      .select('id, name, slug')
      .limit(10);

    if (knowledgeDomains && knowledgeDomains.length > 0) {
      let knowledgeAccessAdded = 0;
      
      for (const agent of agents.slice(0, 10)) {
        for (const domain of knowledgeDomains.slice(0, 3)) {
          const { error } = await supabase
            .from('agent_knowledge_domains')
            .insert({
              agent_id: agent.id,
              domain_name: domain.name,
              expertise_level: 1
            });

          if (!error) {
            knowledgeAccessAdded++;
          }
        }
      }
      console.log(`   ✅ Added ${knowledgeAccessAdded} knowledge domain assignments`);
    }

    // Step 3: Populate agent tool assignments
    console.log('\n📋 Step 3: Populating agent tool assignments...');
    
    const basicTools = [
      'Web Search',
      'Document Analysis',
      'Data Query',
      'Report Generation'
    ];

    let toolAssignmentsAdded = 0;
    for (const agent of agents.slice(0, 10)) {
      for (const toolName of basicTools) {
        const { error } = await supabase
          .from('agent_tool_assignments')
          .insert({
            agent_id: agent.id,
            tool_name: toolName,
            is_active: true
          });

        if (!error) {
          toolAssignmentsAdded++;
        }
      }
    }
    console.log(`   ✅ Added ${toolAssignmentsAdded} tool assignments`);

    // Step 4: Populate agent prompts
    console.log('\n📋 Step 4: Populating agent prompts...');
    
    let promptsAdded = 0;
    for (const agent of agents.slice(0, 10)) {
      const { error } = await supabase
        .from('agent_prompts')
        .insert({
          agent_id: agent.id,
          prompt_type: 'system',
          title: 'System Prompt',
          content: `You are ${agent.display_name}, an AI agent specialized in ${agent.business_function || 'healthcare'}. Provide accurate, evidence-based responses.`,
          is_active: true
        });

      if (!error) {
        promptsAdded++;
      }
    }
    console.log(`   ✅ Added ${promptsAdded} agent prompts`);

    // Step 5: Final verification
    console.log('\n📋 Step 5: Final verification...');
    
    const { count: finalCapabilities } = await supabase
      .from('agent_capabilities')
      .select('*', { count: 'exact', head: true });
    
    const { count: finalKnowledge } = await supabase
      .from('agent_knowledge_domains')
      .select('*', { count: 'exact', head: true });
    
    const { count: finalTools } = await supabase
      .from('agent_tool_assignments')
      .select('*', { count: 'exact', head: true });
    
    const { count: finalPrompts } = await supabase
      .from('agent_prompts')
      .select('*', { count: 'exact', head: true });

    console.log('\n🎉 Key updates applied successfully!');
    console.log('\n📊 FINAL STATUS:');
    console.log(`   ✅ Agent Capabilities: ${finalCapabilities || 0}`);
    console.log(`   ✅ Knowledge Domain Assignments: ${finalKnowledge || 0}`);
    console.log(`   ✅ Tool Assignments: ${finalTools || 0}`);
    console.log(`   ✅ Agent Prompts: ${finalPrompts || 0}`);

  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
}

applyKeyUpdates();
