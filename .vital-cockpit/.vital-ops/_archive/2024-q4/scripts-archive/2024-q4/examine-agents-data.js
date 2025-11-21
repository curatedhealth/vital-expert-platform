const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function examineAgentsData() {
  console.log('🤖 Examining Agents as Knowledge Source...');

  try {
    // Get all agents with their knowledge-related fields
    const { data: agents } = await supabase
      .from('agents')
      .select(`
        id, name, display_name, description,
        knowledge_domains, knowledge_sources, domain_expertise,
        capabilities, system_prompt,
        medical_specialty, pharma_enabled,
        created_at, updated_at
      `);

    if (agents && agents.length > 0) {
      console.log(`\n📊 Found ${agents.length} agents with potential knowledge content:`);

      agents.forEach((agent, index) => {
        console.log(`\n${index + 1}. ${agent.name} (${agent.display_name || 'No display name'})`);
        console.log(`   Description: ${agent.description?.substring(0, 150)}...`);
        console.log(`   Medical Specialty: ${agent.medical_specialty || 'General'}`);
        console.log(`   Domain Expertise: ${JSON.stringify(agent.domain_expertise)}`);
        console.log(`   Knowledge Domains: ${JSON.stringify(agent.knowledge_domains)}`);
        console.log(`   Knowledge Sources: ${JSON.stringify(agent.knowledge_sources)}`);
        console.log(`   Capabilities: ${JSON.stringify(agent.capabilities)?.substring(0, 100)}...`);
        console.log(`   System Prompt: ${agent.system_prompt?.substring(0, 100)}...`);
        console.log(`   Pharma Enabled: ${agent.pharma_enabled}`);
        console.log(`   Created: ${agent.created_at}`);
      });

      // Analyze what types of knowledge domains we have
      const domains = agents.map(a => a.domain_expertise).filter(Boolean).flat();
      const specialties = agents.map(a => a.medical_specialty).filter(Boolean);

      console.log(`\n📋 Knowledge Analysis:`);
      console.log(`   Unique Medical Specialties: ${[...new Set(specialties)].join(', ')}`);
      console.log(`   Domain Expertise Areas: ${[...new Set(domains)].join(', ')}`);

      return agents;
    } else {
      console.log('❌ No agents found');
      return [];
    }
  } catch (error) {
    console.error('❌ Error examining agents:', error);
    return [];
  }
}

examineAgentsData().then(agents => {
  if (agents.length > 0) {
    console.log('\n✅ Agents can be used as knowledge sources for the Knowledge Management system');
    console.log('   We should update the API to present agents as "knowledge documents"');
  }
}).catch(console.error);