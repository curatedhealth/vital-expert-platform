/**
 * Redistribute avatars to use only available avatar files (0001-0119)
 * Each avatar will be used maximum 6 times
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Available avatars in /public/icons/png/avatars/
const AVAILABLE_AVATARS = 119; // avatar_0001.png to avatar_0119.png
const MAX_USAGE_PER_AVATAR = 6;

async function fixAvatarsToAvailable() {
  console.log('🎨 Redistributing avatars to use only available files (0001-0119)...\n');

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
  console.log(`📦 Available avatar files: ${AVAILABLE_AVATARS} (avatar_0001 to avatar_0119)`);
  console.log(`🎯 Max usage per avatar: ${MAX_USAGE_PER_AVATAR}`);
  console.log(`📈 Total capacity: ${AVAILABLE_AVATARS * MAX_USAGE_PER_AVATAR} agents\n`);

  if (agents.length > AVAILABLE_AVATARS * MAX_USAGE_PER_AVATAR) {
    console.warn(`⚠️  Warning: ${agents.length} agents exceeds capacity of ${AVAILABLE_AVATARS * MAX_USAGE_PER_AVATAR}`);
    console.warn(`   Some avatars will be used more than ${MAX_USAGE_PER_AVATAR} times\n`);
  }

  // Create avatar pool - each avatar can be used up to MAX_USAGE_PER_AVATAR times
  const avatarPool = [];
  for (let i = 1; i <= AVAILABLE_AVATARS; i++) {
    const avatarId = `avatar_${String(i).padStart(4, '0')}`;
    for (let j = 0; j < MAX_USAGE_PER_AVATAR; j++) {
      avatarPool.push(avatarId);
    }
  }

  // If we need more, cycle through again
  while (avatarPool.length < agents.length) {
    for (let i = 1; i <= AVAILABLE_AVATARS && avatarPool.length < agents.length; i++) {
      const avatarId = `avatar_${String(i).padStart(4, '0')}`;
      avatarPool.push(avatarId);
    }
  }

  // Shuffle the avatar pool for random distribution
  for (let i = avatarPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [avatarPool[i], avatarPool[j]] = [avatarPool[j], avatarPool[i]];
  }

  console.log('🔄 Assigning avatars to all agents...\n');

  // Update all agents
  let updated = 0;
  let errors = 0;
  const batchSize = 50;

  for (let i = 0; i < agents.length; i += batchSize) {
    const batch = agents.slice(i, i + batchSize);

    for (let j = 0; j < batch.length; j++) {
      const agent = batch[j];
      const newAvatar = avatarPool[i + j];

      const { error } = await supabase
        .from('agents')
        .update({ avatar: newAvatar })
        .eq('id', agent.id);

      if (error) {
        console.error(`❌ Error updating agent ${agent.id}:`, error.message);
        errors++;
      } else {
        updated++;
      }
    }

    console.log(`   Updated ${Math.min(i + batchSize, agents.length)}/${agents.length}...`);
  }

  console.log(`\n✅ Avatar redistribution complete!`);
  console.log(`   Successfully updated: ${updated} agents`);
  console.log(`   Errors: ${errors}`);

  // Verify final distribution
  const { data: verifyAgents } = await supabase
    .from('agents')
    .select('avatar')
    .order('id');

  const avatarCounts = {};
  verifyAgents.forEach(agent => {
    if (agent.avatar) {
      avatarCounts[agent.avatar] = (avatarCounts[agent.avatar] || 0) + 1;
    }
  });

  // Check if all avatars are within available range
  const outOfRange = Object.keys(avatarCounts).filter(av => {
    const num = parseInt(av.replace('avatar_', ''));
    return num > AVAILABLE_AVATARS;
  });

  const distribution = {};
  Object.values(avatarCounts).forEach(count => {
    distribution[count] = (distribution[count] || 0) + 1;
  });

  console.log(`\n📊 Final Statistics:`);
  console.log(`   Total unique avatars used: ${Object.keys(avatarCounts).length}`);
  console.log(`   Avatars out of range: ${outOfRange.length}`);
  console.log(`\n   Usage distribution:`);
  Object.entries(distribution).sort((a, b) => parseInt(b[0]) - parseInt(a[0])).forEach(([count, numAvatars]) => {
    console.log(`      ${count} times: ${numAvatars} avatars`);
  });

  const maxUsage = Math.max(...Object.values(avatarCounts));
  console.log(`\n   ✅ Maximum usage per avatar: ${maxUsage}`);

  if (outOfRange.length === 0) {
    console.log(`   ✅ All avatars are within available range (1-${AVAILABLE_AVATARS})!`);
  } else {
    console.log(`   ❌ ${outOfRange.length} avatars are still out of range`);
  }
}

fixAvatarsToAvailable().catch(console.error);
