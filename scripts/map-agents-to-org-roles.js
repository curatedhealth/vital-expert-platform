const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function mapAgentsToOrgRoles() {
  console.log('🏢 Mapping Agents to Organizational Roles...\n');

  // Get all organizational roles
  const { data: roles, error: rolesError } = await supabase
    .from('organizational_roles')
    .select('*');

  if (rolesError) {
    console.log('❌ Error fetching roles:', rolesError.message);
    return;
  }

  console.log(`📋 Found ${roles.length} organizational roles\n`);

  // Get all agents
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('*');

  if (agentsError) throw agentsError;

  console.log(`👥 Processing ${agents.length} agents...\n`);

  let mapped = 0;
  let alreadyMapped = 0;

  for (const agent of agents) {
    // Skip if already mapped to a role
    if (agent.organizational_role_id || agent.role_id || agent.agent_role_id) {
      alreadyMapped++;
      continue;
    }

    // Find matching role based on agent name and capabilities
    const agentName = agent.display_name.toLowerCase();
    const capabilities = (agent.capabilities || []).map(c => c.toLowerCase());

    let matchedRole = null;

    // Try to find exact or partial match
    for (const role of roles) {
      const roleName = role.name.toLowerCase();
      const roleResponsibilities = (role.responsibilities || []).map(r => r.toLowerCase());

      // Check for direct name match
      if (agentName.includes(roleName) || roleName.includes(agentName.split(' ')[0])) {
        matchedRole = role;
        break;
      }

      // Check for capability/responsibility overlap
      const overlapCount = capabilities.filter(cap =>
        roleResponsibilities.some(resp => resp.includes(cap) || cap.includes(resp))
      ).length;

      if (overlapCount >= 2) {
        matchedRole = role;
        break;
      }
    }

    // If match found, update agent
    if (matchedRole) {
      const { error: updateError } = await supabase
        .from('agents')
        .update({
          organizational_role_id: matchedRole.id,
          role_id: matchedRole.id,
          agent_role_id: matchedRole.id
        })
        .eq('id', agent.id);

      if (updateError) {
        console.log(`❌ [${agent.display_name}] Error: ${updateError.message}`);
      } else {
        console.log(`✅ [${agent.display_name}] → ${matchedRole.name}`);
        mapped++;
      }
    }
  }

  console.log('\n📊 SUMMARY:');
  console.log(`   ✅ Newly mapped: ${mapped}`);
  console.log(`   ℹ️  Already mapped: ${alreadyMapped}`);
  console.log(`   ⏭️  Unmapped: ${agents.length - mapped - alreadyMapped}`);

  // Final stats
  const { data: finalAgents } = await supabase
    .from('agents')
    .select('organizational_role_id, role_id, agent_role_id');

  const withRole = finalAgents.filter(a =>
    a.organizational_role_id || a.role_id || a.agent_role_id
  ).length;

  console.log('\n📈 FINAL ORGANIZATIONAL MAPPING:');
  console.log(`   With Role: ${withRole}/${finalAgents.length} (${(withRole/finalAgents.length*100).toFixed(1)}%)`);

  console.log('\n✅ Organizational role mapping complete!');
}

mapAgentsToOrgRoles().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
