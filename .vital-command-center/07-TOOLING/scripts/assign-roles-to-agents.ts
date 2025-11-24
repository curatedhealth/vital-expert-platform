/**
 * Assign Roles to All Agents
 * Extract role from display name and assign to role field
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function extractRole(displayName: string): string {
  const rolePriority = [
    'Director',
    'Manager',
    'Strategist',
    'Architect',
    'Lead',
    'Expert',
    'Advisor',
    'Consultant',
    'Specialist',
    'Coordinator',
    'Analyst',
    'Monitor',
    'Designer',
    'Developer',
    'Engineer',
    'Scientist',
    'Writer',
    'Reviewer',
    'Planner',
    'Estimator',
    'Liaison'
  ];

  for (const role of rolePriority) {
    if (displayName.includes(role)) {
      return role.toLowerCase();
    }
  }

  return 'specialist';
}

async function assignRoles() {
  console.log('🔄 Assigning Roles to All Agents\n');

  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, display_name, role')
    .eq('status', 'active');

  if (error || !agents) {
    console.error('❌ Error fetching agents:', error);
    return;
  }

  console.log(`📊 Total agents: ${agents.length}\n`);

  let updated = 0;
  let alreadySet = 0;
  const roleDistribution = new Map<string, number>();

  for (const agent of agents) {
    const extractedRole = extractRole(agent.display_name);

    // Count distribution
    roleDistribution.set(extractedRole, (roleDistribution.get(extractedRole) || 0) + 1);

    if (agent.role !== extractedRole) {
      const { error: updateError } = await supabase
        .from('agents')
        .update({ role: extractedRole })
        .eq('id', agent.id);

      if (!updateError) {
        updated++;
      }
    } else {
      alreadySet++;
    }
  }

  console.log('='.repeat(80));
  console.log('ROLE ASSIGNMENT SUMMARY');
  console.log('='.repeat(80));
  console.log(`  Total agents: ${agents.length}`);
  console.log(`  Roles updated: ${updated}`);
  console.log(`  Already set: ${alreadySet}\n`);

  console.log('ROLE DISTRIBUTION:');
  console.log('='.repeat(80));

  const sortedRoles = Array.from(roleDistribution.entries())
    .sort((a, b) => b[1] - a[1]);

  sortedRoles.forEach(([role, count]) => {
    const percentage = ((count / agents.length) * 100).toFixed(1);
    console.log(`  ${role.padEnd(20)} ${count.toString().padStart(4)} (${percentage}%)`);
  });

  console.log('\n✅ Role assignment complete!\n');

  return {
    total: agents.length,
    updated,
    roleCount: roleDistribution.size
  };
}

assignRoles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
