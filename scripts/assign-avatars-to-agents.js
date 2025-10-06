#!/usr/bin/env node

/**
 * Assign Unique Avatars to Agents
 *
 * This script assigns avatars from Supabase Storage to all agents,
 * ensuring no avatar is used more than 2 times.
 *
 * Strategy:
 * - Get all 201 avatars from the avatars table
 * - Get all agents from the agents table
 * - Distribute avatars evenly, max 2 agents per avatar
 * - Update agents with their assigned avatars
 *
 * Usage: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/assign-avatars-to-agents.js
 */

const { createClient } = require('@supabase/supabase-js');

// =====================================================
// CONFIGURATION
// =====================================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MAX_USES_PER_AVATAR = 2;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get all avatars from the database
 */
async function getAllAvatars() {
  console.log('\n📦 Fetching avatars from database...');

  const { data: avatars, error } = await supabase
    .from('avatars')
    .select('id, icon, name, category')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('❌ Error fetching avatars:', error);
    throw error;
  }

  console.log(`✅ Found ${avatars.length} avatars`);
  return avatars;
}

/**
 * Get all agents from the database
 */
async function getAllAgents() {
  console.log('\n👥 Fetching agents from database...');

  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, display_name, avatar, tier, status')
    .order('created_at');

  if (error) {
    console.error('❌ Error fetching agents:', error);
    throw error;
  }

  console.log(`✅ Found ${agents.length} agents`);
  return agents;
}

/**
 * Create avatar assignment pool
 * Each avatar can be used up to MAX_USES_PER_AVATAR times (max 2)
 */
function createAvatarPool(avatars) {
  const pool = [];

  avatars.forEach(avatar => {
    for (let i = 0; i < MAX_USES_PER_AVATAR; i++) {
      pool.push(avatar);
    }
  });

  // Shuffle the pool for random distribution
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool;
}

/**
 * Assign avatars to agents strategically
 */
function assignAvatars(agents, avatars) {
  console.log('\n🎯 Assigning avatars to agents...');

  // Create avatar pool (each avatar appears 2 times)
  const avatarPool = createAvatarPool(avatars);

  // Group agents by tier and status for smart assignment
  const activeAgents = agents.filter(a => a.status === 'active');
  const inactiveAgents = agents.filter(a => a.status !== 'active');

  const assignments = [];
  let poolIndex = 0;

  // Assign to active agents first
  console.log(`   Assigning to ${activeAgents.length} active agents...`);
  activeAgents.forEach(agent => {
    if (poolIndex < avatarPool.length) {
      const avatar = avatarPool[poolIndex];
      assignments.push({
        agentId: agent.id,
        agentName: agent.display_name || agent.name,
        avatarUrl: avatar.icon,
        avatarName: avatar.name,
        tier: agent.tier,
        status: agent.status
      });
      poolIndex++;
    }
  });

  // Assign to inactive agents
  console.log(`   Assigning to ${inactiveAgents.length} inactive agents...`);
  inactiveAgents.forEach(agent => {
    if (poolIndex < avatarPool.length) {
      const avatar = avatarPool[poolIndex];
      assignments.push({
        agentId: agent.id,
        agentName: agent.display_name || agent.name,
        avatarUrl: avatar.icon,
        avatarName: avatar.name,
        tier: agent.tier,
        status: agent.status
      });
      poolIndex++;
    } else {
      // If we run out of avatars, cycle back to start
      poolIndex = poolIndex % avatarPool.length;
      const avatar = avatarPool[poolIndex];
      assignments.push({
        agentId: agent.id,
        agentName: agent.display_name || agent.name,
        avatarUrl: avatar.icon,
        avatarName: avatar.name,
        tier: agent.tier,
        status: agent.status
      });
      poolIndex++;
    }
  });

  console.log(`✅ Created ${assignments.length} avatar assignments`);
  return assignments;
}

/**
 * Update agents with their assigned avatars
 */
async function updateAgentAvatars(assignments) {
  console.log('\n💾 Updating agent avatars in database...');

  let successCount = 0;
  let errorCount = 0;

  // Update in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < assignments.length; i += batchSize) {
    const batch = assignments.slice(i, i + batchSize);

    const updatePromises = batch.map(async (assignment) => {
      const { error } = await supabase
        .from('agents')
        .update({ avatar: assignment.avatarUrl })
        .eq('id', assignment.agentId);

      if (error) {
        console.error(`   ❌ Failed to update ${assignment.agentName}:`, error.message);
        errorCount++;
        return false;
      } else {
        successCount++;
        return true;
      }
    });

    await Promise.all(updatePromises);

    // Progress indicator
    const progress = Math.min(i + batchSize, assignments.length);
    process.stdout.write(`\r   Progress: ${progress}/${assignments.length} agents updated`);

    // Small delay between batches
    if (i + batchSize < assignments.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`\n\n   ✅ Successfully updated: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   ❌ Failed updates: ${errorCount}`);
  }

  return { successCount, errorCount };
}

/**
 * Display assignment statistics
 */
async function displayStatistics(assignments) {
  console.log('\n📊 Avatar Distribution Statistics:');

  // Count usage per avatar
  const usageCount = {};
  assignments.forEach(assignment => {
    usageCount[assignment.avatarName] = (usageCount[assignment.avatarName] || 0) + 1;
  });

  // Calculate statistics
  const usageCounts = Object.values(usageCount);
  const avgUsage = usageCounts.reduce((a, b) => a + b, 0) / usageCounts.length;
  const maxUsage = Math.max(...usageCounts);
  const minUsage = Math.min(...usageCounts);

  console.log(`   Total assignments: ${assignments.length}`);
  console.log(`   Unique avatars used: ${Object.keys(usageCount).length}`);
  console.log(`   Average uses per avatar: ${avgUsage.toFixed(2)}`);
  console.log(`   Max uses per avatar: ${maxUsage}`);
  console.log(`   Min uses per avatar: ${minUsage}`);

  // Show most used avatars
  const sortedAvatars = Object.entries(usageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  console.log('\n   Top 5 most used avatars:');
  sortedAvatars.forEach(([name, count], index) => {
    console.log(`      ${index + 1}. ${name}: ${count} agents`);
  });

  // Verify max usage constraint
  const overused = Object.entries(usageCount).filter(([_, count]) => count > MAX_USES_PER_AVATAR);
  if (overused.length > 0) {
    console.log(`\n   ⚠️  Warning: ${overused.length} avatars used more than ${MAX_USES_PER_AVATAR} times:`);
    overused.forEach(([name, count]) => {
      console.log(`      - ${name}: ${count} times`);
    });
  } else {
    console.log(`\n   ✅ All avatars used ${MAX_USES_PER_AVATAR} times or less`);
  }
}

/**
 * Show sample assignments
 */
function showSampleAssignments(assignments) {
  console.log('\n📝 Sample Assignments (first 10):');
  assignments.slice(0, 10).forEach((assignment, index) => {
    console.log(`   ${index + 1}. ${assignment.agentName}`);
    console.log(`      Avatar: ${assignment.avatarName}`);
    console.log(`      Tier: ${assignment.tier}, Status: ${assignment.status}`);
  });
}

// =====================================================
// MAIN EXECUTION
// =====================================================
async function main() {
  console.log('\n🚀 Avatar Assignment to Agents');
  console.log('=====================================');
  console.log(`   Max uses per avatar: ${MAX_USES_PER_AVATAR}`);

  try {
    // Step 1: Get all avatars
    const avatars = await getAllAvatars();

    // Step 2: Get all agents
    const agents = await getAllAgents();

    // Calculate capacity
    const totalCapacity = avatars.length * MAX_USES_PER_AVATAR;
    console.log(`\n📐 Capacity check:`);
    console.log(`   Total avatars: ${avatars.length}`);
    console.log(`   Max uses per avatar: ${MAX_USES_PER_AVATAR}`);
    console.log(`   Total capacity: ${totalCapacity} agents`);
    console.log(`   Total agents: ${agents.length}`);

    if (agents.length > totalCapacity) {
      console.log(`   ⚠️  Warning: Not enough avatars! ${agents.length - totalCapacity} agents will reuse avatars.`);
    } else {
      console.log(`   ✅ Sufficient capacity: ${totalCapacity - agents.length} slots remaining`);
    }

    // Step 3: Create assignments
    const assignments = assignAvatars(agents, avatars);

    // Step 4: Show sample
    showSampleAssignments(assignments);

    // Step 5: Update database
    const { successCount, errorCount } = await updateAgentAvatars(assignments);

    // Step 6: Show statistics
    await displayStatistics(assignments);

    console.log('\n✅ Avatar assignment complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Refresh the agents page to see the new avatars');
    console.log('   2. Verify avatars display correctly on agent cards');
    console.log('   3. Check the icon picker shows the same avatars');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();
