/**
 * Redistribute avatars to ensure each avatar is used maximum 6 times
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Use service role key to bypass RLS for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function redistributeAvatars() {
  console.log('🎨 Starting avatar redistribution...\n');

  // Fetch all agents
  const { data: agents, error: fetchError } = await supabase
    .from('agents')
    .select('id, name, avatar')
    .order('id');

  if (fetchError) {
    console.error('❌ Error fetching agents:', fetchError);
    return;
  }

  console.log(`📊 Total agents: ${agents.length}`);

  // Count current avatar usage
  const avatarCounts = {};
  agents.forEach(agent => {
    if (agent.avatar) {
      avatarCounts[agent.avatar] = (avatarCounts[agent.avatar] || 0) + 1;
    }
  });

  // Find overused avatars
  const overused = Object.entries(avatarCounts)
    .filter(([_, count]) => count > 6)
    .sort((a, b) => b[1] - a[1]);

  console.log(`\n⚠️  Overused avatars (>6 times): ${overused.length}`);
  overused.forEach(([avatar, count]) => {
    console.log(`   ${avatar}: ${count} times`);
  });

  if (overused.length === 0) {
    console.log('\n✅ All avatars are properly distributed!');
    return;
  }

  // Generate available avatar pool (avatar_0001 to avatar_0999)
  const maxAvatarsNeeded = Math.ceil(agents.length / 6); // 530 agents / 6 = 89 avatars needed minimum
  const availableAvatars = [];

  for (let i = 1; i <= Math.max(999, maxAvatarsNeeded); i++) {
    const avatarId = `avatar_${String(i).padStart(4, '0')}`;
    const currentUsage = avatarCounts[avatarId] || 0;

    // Add avatar to pool if it's used less than 6 times
    for (let j = currentUsage; j < 6; j++) {
      availableAvatars.push(avatarId);
    }
  }

  console.log(`\n📦 Available avatar slots: ${availableAvatars.length}`);

  // Shuffle available avatars for even distribution
  for (let i = availableAvatars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableAvatars[i], availableAvatars[j]] = [availableAvatars[j], availableAvatars[i]];
  }

  let avatarIndex = 0;
  const updates = [];

  // Reassign avatars for overused ones
  for (const [overusedAvatar, count] of overused) {
    const agentsWithAvatar = agents.filter(a => a.avatar === overusedAvatar);

    // Keep first 6, reassign the rest
    const toReassign = agentsWithAvatar.slice(6);

    console.log(`\n🔄 Reassigning ${toReassign.length} agents from ${overusedAvatar}...`);

    for (const agent of toReassign) {
      if (avatarIndex >= availableAvatars.length) {
        console.warn('⚠️  Ran out of available avatars!');
        break;
      }

      const newAvatar = availableAvatars[avatarIndex++];
      updates.push({
        id: agent.id,
        oldAvatar: agent.avatar,
        newAvatar: newAvatar
      });
    }
  }

  console.log(`\n📝 Preparing to update ${updates.length} agents...`);

  // Apply updates in batches
  const batchSize = 50;
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);

    for (const update of batch) {
      const { error } = await supabase
        .from('agents')
        .update({ avatar: update.newAvatar })
        .eq('id', update.id);

      if (error) {
        console.error(`❌ Error updating agent ${update.id}:`, error.message);
        errors++;
      } else {
        updated++;
      }
    }

    console.log(`   Updated ${Math.min(i + batchSize, updates.length)}/${updates.length}...`);
  }

  console.log(`\n✅ Avatar redistribution complete!`);
  console.log(`   Successfully updated: ${updated} agents`);
  console.log(`   Errors: ${errors}`);

  // Verify final distribution
  const { data: verifyAgents } = await supabase
    .from('agents')
    .select('avatar')
    .order('id');

  const finalCounts = {};
  verifyAgents.forEach(agent => {
    if (agent.avatar) {
      finalCounts[agent.avatar] = (finalCounts[agent.avatar] || 0) + 1;
    }
  });

  const stillOverused = Object.entries(finalCounts)
    .filter(([_, count]) => count > 6);

  console.log(`\n📊 Final Statistics:`);
  console.log(`   Total unique avatars used: ${Object.keys(finalCounts).length}`);
  console.log(`   Avatars still overused: ${stillOverused.length}`);

  if (stillOverused.length > 0) {
    console.log(`\n⚠️  Still overused:`);
    stillOverused.forEach(([avatar, count]) => {
      console.log(`   ${avatar}: ${count} times`);
    });
  } else {
    console.log(`   ✅ All avatars now used 6 times or less!`);
  }
}

redistributeAvatars().catch(console.error);
