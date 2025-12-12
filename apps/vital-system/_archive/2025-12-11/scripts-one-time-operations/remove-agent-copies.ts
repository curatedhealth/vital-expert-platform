/**
 * Script to remove all agent copies from the database
 * This removes:
 * 1. All agents with is_user_copy = true
 * 2. All agents with "(My Copy)" or "(Copy)" in display_name
 * 3. Related entries in user_agents table
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeAgentCopies() {
  try {
    console.log('🔍 Finding agent copies...');

    // Find all agent copies
    const { data: copyAgents, error: findError } = await supabase
      .from('agents')
      .select('id, name, display_name, is_user_copy')
      .or('is_user_copy.eq.true,display_name.ilike.%My Copy%,display_name.ilike.%(Copy)%');

    if (findError) {
      console.error('❌ Error finding agent copies:', findError);
      return;
    }

    if (!copyAgents || copyAgents.length === 0) {
      console.log('✅ No agent copies found to delete');
      return;
    }

    console.log(`📋 Found ${copyAgents.length} agent copy(ies) to delete:`);
    copyAgents.forEach((agent) => {
      console.log(`  - ${agent.display_name || agent.name} (ID: ${agent.id})`);
    });

    const agentIds = copyAgents.map((a) => a.id);

    // Step 1: Delete from user_agents table first (foreign key constraint)
    console.log('\n🗑️  Deleting from user_agents table...');
    const { error: userAgentsError } = await supabase
      .from('user_agents')
      .delete()
      .in('agent_id', agentIds);

    if (userAgentsError) {
      console.warn('⚠️  Warning deleting from user_agents:', userAgentsError.message);
    } else {
      console.log('✅ Deleted from user_agents table');
    }

    // Step 2: Delete from agents table
    console.log('\n🗑️  Deleting from agents table...');
    const { error: deleteError } = await supabase
      .from('agents')
      .delete()
      .in('id', agentIds);

    if (deleteError) {
      console.error('❌ Error deleting agents:', deleteError);
      return;
    }

    console.log(`\n✅ Successfully deleted ${copyAgents.length} agent copy(ies)`);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
removeAgentCopies()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
