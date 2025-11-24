const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function linkAgentsToCapabilities() {
  console.log('🔗 Linking Agents to Existing Capabilities...\n');

  // Get the 5 existing capabilities
  const { data: capabilities, error: capError } = await supabase
    .from('capabilities')
    .select('*');

  if (capError) {
    console.log('❌ Error fetching capabilities:', capError.message);
    return;
  }

  console.log(`📚 Found ${capabilities.length} capabilities:\n`);
  capabilities.forEach(cap => {
    console.log(`  - ${cap.name} (${cap.category})`);
  });

  // Get all agents
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('*');

  if (agentsError) throw agentsError;

  console.log(`\n👥 Processing ${agents.length} agents...\n`);

  // Mapping logic for each capability
  const capabilityMatchers = {
    'Clinical Trial Design': (agent) => {
      const searchText = `${agent.display_name} ${agent.description}`.toLowerCase();
      return searchText.includes('clinical trial') ||
             searchText.includes('protocol') ||
             searchText.includes('study design') ||
             searchText.includes('trial design');
    },
    'Regulatory Submission Preparation': (agent) => {
      const searchText = `${agent.display_name} ${agent.description}`.toLowerCase();
      return searchText.includes('regulatory') ||
             searchText.includes('submission') ||
             searchText.includes('nda') ||
             searchText.includes('bla') ||
             searchText.includes('ind');
    },
    'Health Economic Analysis': (agent) => {
      const searchText = `${agent.display_name} ${agent.description}`.toLowerCase();
      return searchText.includes('economic') ||
             searchText.includes('heor') ||
             searchText.includes('reimbursement') ||
             searchText.includes('value') ||
             searchText.includes('pricing') ||
             searchText.includes('payer');
    },
    'Quality Management Systems': (agent) => {
      const searchText = `${agent.display_name} ${agent.description}`.toLowerCase();
      return searchText.includes('quality') ||
             searchText.includes('gmp') ||
             searchText.includes('audit') ||
             searchText.includes('validation') ||
             searchText.includes('compliance');
    },
    'Clinical Statistical Analysis': (agent) => {
      const searchText = `${agent.display_name} ${agent.description}`.toLowerCase();
      return searchText.includes('statistical') ||
             searchText.includes('biostatistic') ||
             searchText.includes('data analysis') ||
             searchText.includes('statistical analysis');
    }
  };

  let linksCreated = 0;
  const capabilityAssignments = {};

  for (const capability of capabilities) {
    const matcher = capabilityMatchers[capability.name];
    if (!matcher) {
      console.log(`⚠️  No matcher defined for: ${capability.name}`);
      continue;
    }

    console.log(`\n🔍 Matching agents for: ${capability.name}`);
    let matchCount = 0;

    for (const agent of agents) {
      if (matcher(agent)) {
        // Create the relationship
        const { error: linkError } = await supabase
          .from('agent_capabilities')
          .insert({
            agent_id: agent.id,
            capability_id: capability.id,
            proficiency_level: agent.tier === 3 ? 'expert' : agent.tier === 2 ? 'advanced' : 'intermediate',
            is_primary: true
          })
          .select();

        if (linkError && !linkError.message.includes('duplicate')) {
          console.log(`   ❌ Error linking ${agent.display_name}:`, linkError.message);
        } else if (!linkError) {
          matchCount++;
          linksCreated++;

          if (!capabilityAssignments[capability.name]) {
            capabilityAssignments[capability.name] = [];
          }
          capabilityAssignments[capability.name].push(agent.display_name);
        }
      }
    }

    console.log(`   ✅ Matched ${matchCount} agents`);
  }

  console.log('\n\n📊 SUMMARY:');
  console.log(`   ✅ Total links created: ${linksCreated}\n`);

  console.log('📈 CAPABILITY DISTRIBUTION:\n');
  for (const [capName, agentList] of Object.entries(capabilityAssignments)) {
    console.log(`   ${capName}: ${agentList.length} agents`);
    console.log(`     Examples: ${agentList.slice(0, 3).join(', ')}${agentList.length > 3 ? '...' : ''}`);
  }

  // Verify final state
  const { count } = await supabase
    .from('agent_capabilities')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✅ Total agent-capability relationships: ${count}`);

  // Show which capabilities are most/least assigned
  const { data: capCounts } = await supabase
    .rpc('get_capability_usage_counts')
    .catch(() => null);

  if (!capCounts) {
    // Fallback: manual count
    console.log('\n📊 Capability Usage:');
    for (const cap of capabilities) {
      const { count: capCount } = await supabase
        .from('agent_capabilities')
        .select('*', { count: 'exact', head: true })
        .eq('capability_id', cap.id);

      console.log(`   ${cap.name}: ${capCount} agents`);
    }
  }

  console.log('\n✅ Agent-capability linking complete!');
}

linkAgentsToCapabilities().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
