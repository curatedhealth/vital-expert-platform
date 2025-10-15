#!/usr/bin/env node

/**
 * Import Agents from Remote Supabase
 *
 * This script imports agents from a remote/production Supabase instance
 * to your local development database.
 *
 * Usage:
 *   REMOTE_SUPABASE_URL=https://xxx.supabase.co \
 *   REMOTE_SUPABASE_KEY=eyJxxx... \
 *   node scripts/import-agents-from-remote.js
 */

const { createClient } = require('@supabase/supabase-js');

// Remote Supabase (source)
const remoteUrl = process.env.REMOTE_SUPABASE_URL;
const remoteKey = process.env.REMOTE_SUPABASE_KEY || process.env.REMOTE_SUPABASE_SERVICE_ROLE_KEY;

// Cloud Supabase (destination) - Local Supabase deprecated
const localUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xazinxsiglqokwfmogyk.supabase.co';
const localKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!remoteUrl || !remoteKey) {
  console.error('❌ Missing remote Supabase credentials!');
  console.error('\nUsage:');
  console.error('  REMOTE_SUPABASE_URL=https://xxx.supabase.co \\');
  console.error('  REMOTE_SUPABASE_KEY=eyJxxx... \\');
  console.error('  node scripts/import-agents-from-remote.js\n');
  process.exit(1);
}

if (!localKey) {
  console.error('❌ Missing cloud Supabase service role key!');
  console.error('   Set SUPABASE_SERVICE_ROLE_KEY in your .env.local\n');
  process.exit(1);
}

const remoteSupabase = createClient(remoteUrl, remoteKey);
const localSupabase = createClient(localUrl, localKey);

async function importAgents() {
  console.log('🔄 Starting agent import process...\n');
  console.log(`📡 Remote: ${remoteUrl}`);
  console.log(`💾 Local:  ${localUrl}\n`);

  try {
    // Fetch all agents from remote
    console.log('📥 Fetching agents from remote Supabase...');
    const { data: remoteAgents, error: fetchError } = await remoteSupabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching remote agents:', fetchError.message);
      throw fetchError;
    }

    console.log(`✅ Found ${remoteAgents.length} agents on remote\n`);

    if (remoteAgents.length === 0) {
      console.log('⚠️  No agents found on remote. Nothing to import.');
      return;
    }

    // Check existing agents in local
    console.log('🔍 Checking existing agents in local database...');
    const { data: localAgents, error: localError } = await localSupabase
      .from('agents')
      .select('id, name');

    if (localError) {
      console.error('❌ Error fetching local agents:', localError.message);
      throw localError;
    }

    const existingNames = new Set(localAgents?.map(a => a.name) || []);
    console.log(`   Found ${existingNames.size} existing agents locally\n`);

    // Import agents
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    console.log('📦 Importing agents...\n');

    for (const agent of remoteAgents) {
      const agentName = agent.name;

      // Skip if already exists
      if (existingNames.has(agentName)) {
        console.log(`⏭️  Skipped: ${agent.display_name || agentName} (already exists)`);
        skipped++;
        continue;
      }

      try {
        // Remove id and timestamp fields to let local DB generate new ones
        const { id, created_at, updated_at, ...agentData } = agent;

        // Insert into local database
        const { error: insertError } = await localSupabase
          .from('agents')
          .insert([agentData]);

        if (insertError) {
          console.error(`❌ Failed to import ${agent.display_name || agentName}:`, insertError.message);
          errors++;
        } else {
          console.log(`✅ Imported: ${agent.display_name || agentName}`);
          imported++;
        }
      } catch (err) {
        console.error(`❌ Exception importing ${agentName}:`, err.message);
        errors++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Import Summary:');
    console.log('='.repeat(60));
    console.log(`   Total remote agents: ${remoteAgents.length}`);
    console.log(`   ✅ Imported:         ${imported}`);
    console.log(`   ⏭️  Skipped:          ${skipped} (already exist)`);
    console.log(`   ❌ Errors:           ${errors}`);
    console.log('='.repeat(60) + '\n');

    if (imported > 0) {
      console.log('🎉 Import completed successfully!');
      console.log(`   ${imported} new agent${imported !== 1 ? 's' : ''} added to local database.\n`);
    } else if (skipped > 0 && errors === 0) {
      console.log('ℹ️  All remote agents already exist locally. No new imports needed.\n');
    } else if (errors > 0) {
      console.error('⚠️  Import completed with errors. Check the log above.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Fatal error during import:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the import
importAgents().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});