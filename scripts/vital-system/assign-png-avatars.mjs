#!/usr/bin/env node
/**
 * Assign PNG Avatar Icons to All Agents
 * Uses the 201 PNG avatar files from /public/avatars/
 * Each avatar used max 2 times for 254 agents
 */

import { createClient } from '@supabase/supabase-js';
import { readdirSync } from 'fs';
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

async function assignAvatarsToAgents() {
  console.log('🎨 Assigning PNG Avatar Icons to Agents\n');
  console.log('=' .repeat(60));
  console.log('');

  try {
    // Get all PNG avatar files
    const avatarsDir = join(__dirname, '../public/avatars');
    const avatarFiles = readdirSync(avatarsDir)
      .filter(file => file.endsWith('.png'))
      .sort();

    console.log(`✅ Found ${avatarFiles.length} PNG avatar icons\n`);

    // Get all agents (without display_name since it doesn't exist)
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name')
      .order('name');

    if (agentsError) {
      console.error('❌ Error fetching agents:', agentsError.message);
      return;
    }

    console.log(`✅ Found ${agents.length} agents needing avatars\n`);

    if (agents.length === 0) {
      console.log('ℹ️ No agents found in database');
      return;
    }

    // Assign avatars in round-robin fashion
    console.log('🔄 Assigning PNG avatars...\n');

    let avatarIndex = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const agent of agents) {
      // Get the next available avatar file
      const avatarFile = avatarFiles[avatarIndex % avatarFiles.length];
      const avatarUrl = `/avatars/${avatarFile}`;

      // Update agent with PNG avatar URL
      const { error: updateError } = await supabase
        .from('agents')
        .update({ avatar_url: avatarUrl })
        .eq('id', agent.id);

      if (updateError) {
        console.error(`❌ Error updating ${agent.name}:`, updateError.message);
        errorCount++;
      } else {
        updatedCount++;
        console.log(`✅ ${updatedCount}/${agents.length}: ${agent.name} → ${avatarFile}`);
      }

      // Move to next avatar
      avatarIndex++;

      // If we've used all avatars once, start over (allows max 2 uses per avatar)
      if (avatarIndex >= avatarFiles.length && updatedCount < agents.length) {
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
      .filter(([avatar, count]) => count > 2 && avatar !== 'EMPTY')
      .sort((a, b) => b[1] - a[1]);

    if (overused.length === 0) {
      console.log('✅ Perfect! No avatar is used more than 2 times');
    } else {
      console.log('⚠️ Avatars used more than 2 times:');
      overused.forEach(([avatar, count]) => {
        console.log(`   ${avatar}: ${count} times`);
      });
    }

    // Show statistics
    console.log('\n📈 Distribution Statistics:');
    console.log(`   Total agents: ${updatedAgents.length}`);
    console.log(`   Unique avatars used: ${Object.keys(distribution).filter(k => k !== 'EMPTY').length}`);
    console.log(`   Agents without avatar: ${distribution['EMPTY'] || 0}`);
    console.log(`   Total PNG avatars available: ${avatarFiles.length}`);
    console.log(`   Average uses per avatar: ${(updatedAgents.length / avatarFiles.length).toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error in assignment:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🚀 PNG Avatar Assignment Script\n');
  console.log('=' .repeat(60));
  console.log('');

  await assignAvatarsToAgents();

  console.log('\n' + '='.repeat(60));
  console.log('✅ All done!\n');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
