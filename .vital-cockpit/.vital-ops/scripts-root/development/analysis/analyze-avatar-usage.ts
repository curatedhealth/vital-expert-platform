/**
 * Analyze avatar/icon usage across all agents
 * Identify which avatars are overused (>5 times)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function analyzeAvatars() {
  console.log('🎨 Analyzing Avatar Usage Across All Agents\n');

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

  console.log(`📊 Total Active Agents: ${agents.length}\n`);

  // Count avatar usage
  const avatarUsage: Record<string, { count: number; agents: any[] }> = {};

  agents.forEach((agent) => {
    const avatar = agent.avatar || 'NULL';
    if (!avatarUsage[avatar]) {
      avatarUsage[avatar] = { count: 0, agents: [] };
    }
    avatarUsage[avatar].count++;
    avatarUsage[avatar].agents.push(agent);
  });

  // Sort by usage count
  const sortedAvatars = Object.entries(avatarUsage).sort((a, b) => b[1].count - a[1].count);

  console.log('🔍 AVATAR USAGE ANALYSIS');
  console.log('='.repeat(80));

  let overusedCount = 0;
  let totalOverused = 0;

  sortedAvatars.forEach(([avatar, data]) => {
    if (data.count > 5) {
      overusedCount++;
      totalOverused += data.count;
      console.log(`\n❌ ${avatar}: ${data.count} agents (OVERUSED - max is 5)`);
      console.log('   Agents using this avatar:');
      data.agents.slice(0, 10).forEach((agent, i) => {
        console.log(`   ${i + 1}. ${agent.display_name} (Tier ${agent.tier})`);
      });
      if (data.count > 10) {
        console.log(`   ... and ${data.count - 10} more`);
      }
    }
  });

  if (overusedCount === 0) {
    console.log('✅ No avatars are overused! All avatars used ≤5 times.');
  } else {
    console.log('\n' + '='.repeat(80));
    console.log(`⚠️  OVERUSED AVATARS SUMMARY:`);
    console.log(`   ${overusedCount} different avatars used more than 5 times`);
    console.log(`   ${totalOverused} total agents need avatar reassignment`);
  }

  // Show usage distribution
  console.log('\n' + '='.repeat(80));
  console.log('📈 USAGE DISTRIBUTION:');
  console.log('='.repeat(80));

  const distribution: Record<string, number> = {
    '1 agent': 0,
    '2-5 agents': 0,
    '6-10 agents': 0,
    '11-20 agents': 0,
    '20+ agents': 0,
  };

  sortedAvatars.forEach(([_, data]) => {
    if (data.count === 1) distribution['1 agent']++;
    else if (data.count <= 5) distribution['2-5 agents']++;
    else if (data.count <= 10) distribution['6-10 agents']++;
    else if (data.count <= 20) distribution['11-20 agents']++;
    else distribution['20+ agents']++;
  });

  Object.entries(distribution).forEach(([range, count]) => {
    if (count > 0) {
      console.log(`  ${range.padEnd(15)} ${count} avatars`);
    }
  });

  // Show unique avatars
  console.log('\n' + '='.repeat(80));
  console.log(`📊 STATISTICS:`);
  console.log('='.repeat(80));
  console.log(`  Total unique avatars: ${sortedAvatars.length}`);
  console.log(`  Avatars within limit (≤5): ${sortedAvatars.filter(([_, d]) => d.count <= 5).length}`);
  console.log(`  Avatars overused (>5): ${overusedCount}`);
  console.log(`  Total agents: ${agents.length}`);
  console.log(`  Agents needing reassignment: ${totalOverused - (overusedCount * 5)}`);

  // Show all avatar usage (first 50)
  console.log('\n' + '='.repeat(80));
  console.log('📋 ALL AVATAR USAGE (first 50):');
  console.log('='.repeat(80));

  sortedAvatars.slice(0, 50).forEach(([avatar, data]) => {
    const status = data.count > 5 ? '❌' : data.count === 5 ? '⚠️ ' : '✅';
    console.log(`${status} ${avatar.padEnd(20)} ${String(data.count).padStart(3)} agents`);
  });

  if (sortedAvatars.length > 50) {
    console.log(`\n... and ${sortedAvatars.length - 50} more avatars`);
  }

  return { avatarUsage, overusedCount, totalOverused };
}

analyzeAvatars()
  .then((result) => {
    if (result && result.overusedCount > 0) {
      console.log('\n⚠️  Action Required: Run avatar reassignment script');
      console.log('   npx tsx scripts/reassign-avatars.ts\n');
    } else {
      console.log('\n✅ All avatars are properly distributed!\n');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
