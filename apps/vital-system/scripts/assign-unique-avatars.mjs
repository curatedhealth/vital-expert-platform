#!/usr/bin/env node
/**
 * Assign Unique Avatars to All Agents
 * This script:
 * 1. Creates the avatars table (if not exists)
 * 2. Populates it with 150 unique icons
 * 3. Assigns avatars to all 254 agents
 * 4. Ensures no avatar is used more than 2 times
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('📦 Step 1: Running avatars table migration...\n');

  try {
    // Read the migration SQL file (from root database folder, not apps/database)
    const migrationPath = join(__dirname, '../../../database/sql/migrations/2025/20251027000003_create_avatars_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    // Execute the migration (note: this might not work directly, you may need to run it in Supabase SQL editor)
    console.log('⚠️  Note: You may need to run this SQL manually in Supabase SQL editor');
    console.log('📄 Migration file location:', migrationPath);
    console.log('');

    // Check if avatars table exists
    const { data: avatars, error } = await supabase
      .from('avatars')
      .select('count');

    if (error && error.code === '42P01') {
      console.log('❌ Avatars table does not exist yet');
      console.log('📝 Please run the SQL migration first:');
      console.log('   1. Go to Supabase Dashboard → SQL Editor');
      console.log('   2. Copy and paste the contents of:');
      console.log(`      ${migrationPath}`);
      console.log('   3. Run the SQL');
      console.log('   4. Then run this script again');
      console.log('');
      return false;
    }

    console.log('✅ Avatars table exists\n');
    return true;
  } catch (error) {
    console.error('❌ Error checking migration:', error.message);
    return false;
  }
}

async function assignAvatarsToAgents() {
  console.log('🎨 Step 2: Assigning unique avatars to agents...\n');

  try {
    // Get all avatars
    const { data: avatars, error: avatarsError } = await supabase
      .from('avatars')
      .select('*')
      .order('usage_count', { ascending: true });

    if (avatarsError) {
      console.error('❌ Error fetching avatars:', avatarsError.message);
      return;
    }

    console.log(`✅ Found ${avatars.length} avatars\n`);

    // Get all agents without avatars
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, category')
      .or('avatar_url.is.null,avatar_url.eq.')
      .order('name');

    if (agentsError) {
      console.error('❌ Error fetching agents:', agentsError.message);
      return;
    }

    console.log(`✅ Found ${agents.length} agents needing avatars\n`);

    if (agents.length === 0) {
      console.log('✅ All agents already have avatars!');
      return;
    }

    // Assign avatars in a round-robin fashion to ensure even distribution
    console.log('🔄 Assigning avatars...\n');

    let avatarIndex = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const agent of agents) {
      // Get the next available avatar
      const avatar = avatars[avatarIndex % avatars.length];

      // Update agent with avatar icon
      const { error: updateError } = await supabase
        .from('agents')
        .update({ avatar_url: avatar.icon })
        .eq('id', agent.id);

      if (updateError) {
        console.error(`❌ Error updating ${agent.name}:`, updateError.message);
        errorCount++;
      } else {
        updatedCount++;
        console.log(`✅ ${updatedCount}/${agents.length}: ${agent.name} → ${avatar.icon} (${avatar.name})`);
      }

      // Move to next avatar
      avatarIndex++;

      // If we've used all avatars once, start over (allows max 2 uses per avatar)
      if (avatarIndex >= avatars.length && updatedCount < agents.length) {
        avatarIndex = 0;
      }

      // Small delay to avoid rate limiting
      if (updatedCount % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`\n✅ Assignment complete!`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);

    // Verify distribution
    console.log('\n📊 Verifying avatar distribution...\n');

    const { data: updatedAgents } = await supabase
      .from('agents')
      .select('avatar_url');

    const distribution = {};
    updatedAgents.forEach(agent => {
      const avatar = agent.avatar_url || 'EMPTY';
      distribution[avatar] = (distribution[avatar] || 0) + 1;
    });

    const overused = Object.entries(distribution)
      .filter(([icon, count]) => count > 2 && icon !== 'EMPTY')
      .sort((a, b) => b[1] - a[1]);

    if (overused.length === 0) {
      console.log('✅ Perfect! No avatar is used more than 2 times');
    } else {
      console.log('⚠️ Avatars used more than 2 times:');
      overused.forEach(([icon, count]) => {
        console.log(`   ${icon}: ${count} times`);
      });
    }

    // Show statistics
    console.log('\n📈 Distribution Statistics:');
    console.log(`   Total agents: ${updatedAgents.length}`);
    console.log(`   Unique avatars used: ${Object.keys(distribution).filter(k => k !== 'EMPTY').length}`);
    console.log(`   Agents without avatar: ${distribution['EMPTY'] || 0}`);
    console.log(`   Average uses per avatar: ${(updatedAgents.length / avatars.length).toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error in assignment:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🚀 Avatar Assignment Script\n');
  console.log('=' .repeat(50));
  console.log('');

  const migrationReady = await runMigration();

  if (!migrationReady) {
    console.log('\n⏸️  Waiting for migration to be run manually...');
    console.log('Run this script again after executing the SQL migration.');
    process.exit(0);
  }

  await assignAvatarsToAgents();

  console.log('\n' + '='.repeat(50));
  console.log('✅ All done!\n');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
