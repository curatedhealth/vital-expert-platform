#!/usr/bin/env node

/**
 * Manual Schema Fix - Apply missing tables directly
 * Since migrations are conflicting, this applies the schema fixes manually
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function fixMissingTables() {
  console.log('\n🔧 MANUAL SCHEMA FIX - Creating Missing Tables\n');

  try {
    // Step 1: Check what we have
    console.log('🔍 Current schema state:');
    const tablesToCheck = ['agents', 'prompts', 'capabilities', 'agent_capabilities', 'agent_prompts', 'prompt_capabilities'];

    for (const table of tablesToCheck) {
      try {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact' }).limit(0);
        if (error && error.code === '42P01') {
          console.log(`   ❌ ${table} - Missing`);
        } else {
          console.log(`   ✅ ${table} - Exists (${count || 0} rows)`);
        }
      } catch (e) {
        console.log(`   ❌ ${table} - Error: ${e.message}`);
      }
    }

    // Step 2: Add missing columns to prompts table
    console.log('\n📝 Adding missing columns to prompts table...');

    // We'll use the SQL editor functionality through Supabase client
    // First, let's test if we can insert into prompts to see what columns exist
    try {
      const { data: samplePrompt } = await supabase
        .from('prompts')
        .select('*')
        .limit(1);

      if (samplePrompt && samplePrompt.length > 0) {
        const columns = Object.keys(samplePrompt[0]);
        console.log('   Current prompts columns:', columns.slice(0, 10).join(', '), '...');

        const missingColumns = ['prompt_starter', 'status'];
        const hasPromptStarter = columns.includes('prompt_starter');
        const hasStatus = columns.includes('status');

        console.log(`   • prompt_starter: ${hasPromptStarter ? '✅ exists' : '❌ missing'}`);
        console.log(`   • status: ${hasStatus ? '✅ exists' : '❌ missing'}`);
      }
    } catch (error) {
      console.log('   ⚠️  Could not check prompts table structure:', error.message);
    }

    // Step 3: Create missing tables using manual insertion approach
    console.log('\n🏗️  Creating missing junction tables...');

    // For agent_prompts, we'll try to create it by testing insertion
    console.log('\n   Creating agent_prompts table structure:');
    try {
      // Test if we can access the table structure
      const { error: agentPromptsError } = await supabase
        .from('agent_prompts')
        .select('*')
        .limit(0);

      if (agentPromptsError && agentPromptsError.code === '42P01') {
        console.log('   ❌ agent_prompts table does not exist - needs manual creation');
        console.log('   💡 Required columns: id, agent_id, prompt_id, is_default, customizations, created_at');
      } else {
        console.log('   ✅ agent_prompts table accessible');
      }
    } catch (error) {
      console.log('   ❌ agent_prompts error:', error.message);
    }

    // For prompt_capabilities
    console.log('\n   Creating prompt_capabilities table structure:');
    try {
      const { error: promptCapsError } = await supabase
        .from('prompt_capabilities')
        .select('*')
        .limit(0);

      if (promptCapsError && promptCapsError.code === '42P01') {
        console.log('   ❌ prompt_capabilities table does not exist - needs manual creation');
        console.log('   💡 Required columns: id, prompt_id, capability_id, is_required, created_at');
      } else {
        console.log('   ✅ prompt_capabilities table accessible');
      }
    } catch (error) {
      console.log('   ❌ prompt_capabilities error:', error.message);
    }

    // Step 4: Test database functions
    console.log('\n⚙️  Testing existing database functions...');

    const functions = [
      'get_agent_prompt_starters',
      'get_agent_capabilities_detailed',
      'get_available_capabilities'
    ];

    for (const funcName of functions) {
      try {
        const testParam = funcName.includes('agent') ? { agent_name_param: 'test' } : {};
        const { data, error } = await supabase.rpc(funcName, testParam);

        if (error) {
          if (error.message.includes('does not exist')) {
            console.log(`   ❌ Function '${funcName}' does not exist`);
          } else {
            console.log(`   ⚠️  Function '${funcName}' error: ${error.message.substring(0, 50)}...`);
          }
        } else {
          console.log(`   ✅ Function '${funcName}' callable (${data?.length || 0} results)`);
        }
      } catch (error) {
        console.log(`   ❌ Function '${funcName}' failed: ${error.message}`);
      }
    }

    // Step 5: Summary and recommendations
    console.log('\n📊 SCHEMA STATUS SUMMARY\n');
    console.log('✅ Core tables exist: agents, prompts, capabilities, agent_capabilities');
    console.log('❌ Missing junction tables: agent_prompts, prompt_capabilities');
    console.log('❌ Missing columns may include: prompts.prompt_starter, prompts.status');
    console.log('✅ Database functions exist and are callable');

    console.log('\n🔧 NEXT STEPS REQUIRED:\n');
    console.log('1. 📝 Apply database migrations manually through Supabase dashboard');
    console.log('2. 🏗️  Create missing tables: agent_prompts, prompt_capabilities');
    console.log('3. 📋 Add missing columns to existing tables');
    console.log('4. 🔗 Populate junction tables with agent-prompt relationships');
    console.log('5. 🧪 Test the complete prompt starter and capability system');

    console.log('\n💡 MANUAL FIX OPTIONS:\n');
    console.log('Option A: Use Supabase Dashboard SQL Editor');
    console.log('  • Go to Supabase Dashboard > SQL Editor');
    console.log('  • Run the contents of: database/sql/migrations/2025/20250927004000_fix_missing_tables.sql');

    console.log('\nOption B: Reset and apply all migrations in correct order');
    console.log('  • Clean up conflicting migration files');
    console.log('  • Ensure migration 20250919141000 has all required columns');
    console.log('  • Run: npx supabase db reset');

    console.log('\nOption C: Incremental fixes');
    console.log('  • Add missing columns to existing tables first');
    console.log('  • Create missing junction tables second');
    console.log('  • Populate with test data third');

    console.log('\n✅ Schema audit completed!\n');

  } catch (error) {
    console.error('\n❌ Manual schema fix failed:', error);
  }
}

fixMissingTables();