/**
 * Map Agents to Organizational Roles
 * Creates support relationships between agents and the human organizational roles they support
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapping logic based on agent attributes
async function createAgentOrgRoleMappings() {
  console.log('🔗 Creating agent-organizational role support mappings...\n');

  // Get all agents with their attributes
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('id, display_name, agent_role_id, business_function_id, department_id, tier, domain_expertise');

  if (agentsError) {
    console.error('❌ Error fetching agents:', agentsError);
    return;
  }

  // Get all organizational roles
  const { data: orgRoles, error: rolesError } = await supabase
    .from('organizational_roles')
    .select('id, name, level, business_function_id, department_id');

  if (rolesError) {
    console.error('❌ Error fetching organizational roles:', rolesError);
    return;
  }

  console.log(`📊 Found ${agents.length} agents and ${orgRoles.length} organizational roles\n`);

  const mappings = [];

  // For each agent, find matching organizational roles
  for (const agent of agents) {
    const agentMatches = [];

    for (const orgRole of orgRoles) {
      let score = 0;
      let supportType = 'secondary';

      // Exact business function match
      if (agent.business_function_id && agent.business_function_id === orgRole.business_function_id) {
        score += 3;
      }

      // Department match
      if (agent.department_id && agent.department_id === orgRole.department_id) {
        score += 2;
        supportType = 'primary';
      }

      // Name/role similarity
      const agentNameLower = agent.display_name.toLowerCase();
      const orgRoleNameLower = orgRole.name.toLowerCase();

      // Check for key word matches
      const agentWords = agentNameLower.split(/\s+/);
      const orgRoleWords = orgRoleNameLower.split(/\s+/);

      const commonWords = agentWords.filter(word =>
        word.length > 3 && orgRoleWords.includes(word)
      );

      if (commonWords.length > 0) {
        score += commonWords.length * 2;
        if (commonWords.length >= 2) {
          supportType = 'primary';
        }
      }

      // Tier-based proficiency
      let proficiency = 'basic';
      if (agent.tier === 1) proficiency = 'expert';
      else if (agent.tier === 2) proficiency = 'advanced';
      else if (agent.tier === 3) proficiency = 'intermediate';

      // Level-based matching
      if (orgRole.level === 'Executive' && agent.tier === 1) {
        score += 2;
        supportType = 'primary';
      } else if (orgRole.level === 'Director' && agent.tier <= 2) {
        score += 1;
      } else if (orgRole.level === 'Manager' && agent.tier <= 2) {
        score += 1;
      }

      // Create mapping if score is high enough
      if (score >= 2) {
        agentMatches.push({
          agent_id: agent.id,
          organizational_role_id: orgRole.id,
          support_type: supportType,
          proficiency_level: proficiency,
          score
        });
      }
    }

    // Sort by score and take top matches
    agentMatches.sort((a, b) => b.score - a.score);

    // Add top 5 matches (or fewer if not enough good matches)
    const topMatches = agentMatches.slice(0, 5).map(({ score, ...mapping }) => mapping);
    mappings.push(...topMatches);

    if (topMatches.length > 0) {
      console.log(`✅ ${agent.display_name}: ${topMatches.length} role(s)`);
    }
  }

  console.log(`\n📊 Created ${mappings.length} support mappings\n`);

  // Bulk insert mappings
  if (mappings.length > 0) {
    const { data, error } = await supabase
      .from('agent_organizational_role_support')
      .upsert(mappings, { onConflict: 'agent_id,organizational_role_id' })
      .select();

    if (error) {
      console.error('❌ Error inserting mappings:', error);
      return;
    }

    console.log(`✅ Successfully created ${data.length} agent-role support relationships\n`);
  }

  // Show statistics
  const { data: stats } = await supabase
    .from('agent_organizational_role_support')
    .select('support_type, proficiency_level');

  if (stats) {
    console.log('📈 Support Statistics:');

    const supportTypes = stats.reduce((acc, s) => {
      acc[s.support_type] = (acc[s.support_type] || 0) + 1;
      return acc;
    }, {});

    console.log('\n   By Support Type:');
    Object.entries(supportTypes).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });

    const proficiencyLevels = stats.reduce((acc, s) => {
      acc[s.proficiency_level] = (acc[s.proficiency_level] || 0) + 1;
      return acc;
    }, {});

    console.log('\n   By Proficiency:');
    Object.entries(proficiencyLevels).forEach(([level, count]) => {
      console.log(`   - ${level}: ${count}`);
    });
  }

  // Show sample mappings using the view
  const { data: sampleView } = await supabase
    .from('agent_support_overview')
    .select('*')
    .gt('supported_org_roles_count', 0)
    .limit(5);

  if (sampleView && sampleView.length > 0) {
    console.log('\n📋 Sample Agent Support Overview:');
    sampleView.forEach(agent => {
      console.log(`\n   ${agent.agent_name} (${agent.agent_role})`);
      console.log(`   Supports ${agent.supported_org_roles_count} roles: ${agent.supported_org_roles?.slice(0, 3).join(', ')}${agent.supported_org_roles?.length > 3 ? '...' : ''}`);
    });
  }
}

async function main() {
  console.log('🚀 Starting agent-organizational role mapping...\n');

  await createAgentOrgRoleMappings();

  console.log('\n✅ Mapping complete!');
}

main().catch(console.error);
