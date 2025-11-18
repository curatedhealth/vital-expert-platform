#!/usr/bin/env node
/**
 * Check Avatar Distribution in Agents
 * This script analyzes the avatars table and agents table to:
 * 1. List all available avatars
 * 2. Show current avatar distribution in agents
 * 3. Identify avatars used more than 2 times
 * 4. Suggest avatar assignments for unique distribution
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'apps/digital-health-startup/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAvatars() {
  console.log('🔍 Checking Avatar Distribution...\n');

  // 1. Get all avatars from avatars table
  console.log('📋 Step 1: Fetching available avatars from avatars table...');
  const { data: avatars, error: avatarsError } = await supabase
    .from('avatars')
    .select('*')
    .order('name');

  if (avatarsError) {
    console.error('❌ Error fetching avatars:', avatarsError.message);
    console.log('\n⚠️ The avatars table may not exist. Let me check the agents table directly...\n');
  } else {
    console.log(`✅ Found ${avatars.length} avatars in avatars table`);
    console.log('\nAvailable Avatars:');
    avatars.forEach((avatar, idx) => {
      console.log(`  ${idx + 1}. ${avatar.name} - ${avatar.icon} (${avatar.category || 'general'})`);
    });
    console.log('');
  }

  // 2. Get all agents and their current avatars
  console.log('📋 Step 2: Fetching agents and their current avatars...');
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('id, name, avatar_url, category')
    .order('name');

  if (agentsError) {
    console.error('❌ Error fetching agents:', agentsError.message);
    process.exit(1);
  }

  console.log(`✅ Found ${agents.length} agents\n`);

  // 3. Analyze avatar distribution
  console.log('📊 Step 3: Analyzing avatar distribution...');
  const avatarUsage = {};
  let emptyAvatars = 0;

  agents.forEach(agent => {
    const avatar = agent.avatar_url || 'EMPTY';
    if (avatar === 'EMPTY' || !avatar) {
      emptyAvatars++;
    }
    avatarUsage[avatar] = (avatarUsage[avatar] || 0) + 1;
  });

  console.log(`\n📈 Avatar Usage Statistics:`);
  console.log(`   Total agents: ${agents.length}`);
  console.log(`   Agents without avatar: ${emptyAvatars}`);
  console.log(`   Unique avatars used: ${Object.keys(avatarUsage).length - (avatarUsage['EMPTY'] ? 1 : 0)}`);

  // 4. Find overused avatars (used more than 2 times)
  console.log('\n⚠️ Avatars used more than 2 times:');
  const overusedAvatars = Object.entries(avatarUsage)
    .filter(([avatar, count]) => count > 2 && avatar !== 'EMPTY')
    .sort((a, b) => b[1] - a[1]);

  if (overusedAvatars.length === 0) {
    console.log('   ✅ No avatars are overused!');
  } else {
    overusedAvatars.forEach(([avatar, count]) => {
      console.log(`   ❌ ${avatar}: used ${count} times`);
    });
  }

  // 5. Show sample of current agents
  console.log('\n📝 Sample of first 10 agents:');
  agents.slice(0, 10).forEach((agent, idx) => {
    console.log(`   ${idx + 1}. ${agent.name}: ${agent.avatar_url || '(empty)'} [${agent.category}]`);
  });

  // 6. Summary and recommendations
  console.log('\n💡 Recommendations:');
  if (emptyAvatars > 0) {
    console.log(`   - ${emptyAvatars} agents need avatars assigned`);
  }
  if (overusedAvatars.length > 0) {
    console.log(`   - ${overusedAvatars.length} avatars are overused and need redistribution`);
  }
  if (avatars && avatars.length > 0) {
    console.log(`   - ${avatars.length} avatars available in the avatars table`);
    if (avatars.length < agents.length) {
      console.log(`   ⚠️ WARNING: Only ${avatars.length} avatars for ${agents.length} agents`);
      console.log(`   Some agents will need to share avatars (max 2 per avatar)`);
    }
  } else {
    console.log('   - No avatars table found - agents are using emoji or URLs directly');
  }

  return {
    totalAgents: agents.length,
    totalAvatars: avatars?.length || 0,
    emptyAvatars,
    overusedAvatars: overusedAvatars.length,
    agents,
    avatars,
    avatarUsage
  };
}

// Run the check
checkAvatars()
  .then(result => {
    console.log('\n✅ Avatar check complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
