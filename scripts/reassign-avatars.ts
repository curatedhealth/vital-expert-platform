/**
 * Reassign avatars to ensure no avatar is used more than 5 times
 * Identifies overused avatars and reassigns excess agents to available avatars
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function reassignAvatars() {
  console.log('🔄 Starting Avatar Reassignment\n');

  // Get all agents with their avatars
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, display_name, avatar, tier')
    .eq('status', 'active')
    .order('avatar');

  if (error || !agents) {
    console.error('❌ Error fetching agents:', error);
    return;
  }

  // Count avatar usage
  const avatarUsage: Record<string, any[]> = {};
  agents.forEach((agent) => {
    const avatar = agent.avatar || 'NULL';
    if (!avatarUsage[avatar]) {
      avatarUsage[avatar] = [];
    }
    avatarUsage[avatar].push(agent);
  });

  // Find overused avatars (>5 uses)
  const overused = Object.entries(avatarUsage).filter(([_, agents]) => agents.length > 5);

  if (overused.length === 0) {
    console.log('✅ No avatars are overused! All avatars used ≤5 times.');
    return;
  }

  console.log(`Found ${overused.length} overused avatars:\n`);
  overused.forEach(([avatar, agents]) => {
    console.log(`  ❌ ${avatar}: ${agents.length} agents (${agents.length - 5} need reassignment)`);
  });

  // Find available avatars (used ≤4 times)
  const available = Object.entries(avatarUsage)
    .filter(([avatar, agents]) => avatar !== 'NULL' && agents.length <= 4)
    .sort((a, b) => a[1].length - b[1].length) // Prioritize least-used avatars
    .map(([avatar]) => avatar);

  console.log(`\n📊 Available avatars for reassignment: ${available.length}`);
  console.log(`   (avatars currently used ≤4 times)\n`);

  let totalReassigned = 0;
  let availableIndex = 0;

  // Process each overused avatar
  for (const [overusedAvatar, agentList] of overused) {
    const excess = agentList.length - 5;
    console.log(`\n🔄 Processing ${overusedAvatar}:`);
    console.log(`   Total agents: ${agentList.length}`);
    console.log(`   Keep first 5, reassign ${excess} agents\n`);

    // Keep first 5 agents, reassign the rest
    const agentsToReassign = agentList.slice(5);

    for (const agent of agentsToReassign) {
      if (availableIndex >= available.length) {
        console.error('⚠️  Ran out of available avatars!');
        break;
      }

      const newAvatar = available[availableIndex];
      availableIndex++;

      // Update agent with new avatar
      const { error: updateError } = await supabase
        .from('agents')
        .update({ avatar: newAvatar })
        .eq('id', agent.id);

      if (updateError) {
        console.error(`   ❌ Failed to update ${agent.display_name}:`, updateError.message);
      } else {
        console.log(`   ✅ ${agent.display_name}`);
        console.log(`      ${overusedAvatar} → ${newAvatar}`);
        totalReassigned++;
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 REASSIGNMENT SUMMARY:');
  console.log('='.repeat(80));
  console.log(`  Total agents reassigned: ${totalReassigned}`);
  console.log(`  Overused avatars fixed: ${overused.length}`);
  console.log(`  Available avatars used: ${availableIndex}`);
  console.log(`  Available avatars remaining: ${available.length - availableIndex}`);

  return { totalReassigned, overusedFixed: overused.length };
}

reassignAvatars()
  .then((result) => {
    if (result && result.totalReassigned > 0) {
      console.log('\n✅ Avatar reassignment complete!');
      console.log('   Run analysis script to verify:');
      console.log('   npx tsx scripts/analyze-avatar-usage.ts\n');
    } else {
      console.log('\n✅ No changes needed - all avatars properly distributed!\n');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
