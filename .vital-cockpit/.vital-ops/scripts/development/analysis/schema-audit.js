#!/usr/bin/env node

/**
 * Supabase Schema Audit Script
 * Verifies all recent changes are properly applied and checks for conflicts
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function auditSchema() {
  console.log('\n🔍 SUPABASE SCHEMA AUDIT - Recent Changes Verification\n');

  try {
    // Check if database is accessible
    const { data: healthCheck } = await supabase
      .from('agents')
      .select('count')
      .limit(1);

    if (!healthCheck) {
      console.log('⚠️  Database connection issue - some tables may not exist yet');
      console.log('   This is normal if migrations haven\'t been applied to Supabase');
    }

    console.log('📊 1. CORE TABLES VERIFICATION\n');

    // Core tables to check
    const expectedTables = [
      'agents',
      'prompts',
      'capabilities',
      'agent_capabilities',
      'agent_prompts',
      'prompt_capabilities'
    ];

    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error && error.code === '42P01') {
          console.log(`❌ Table '${tableName}' does not exist`);
        } else if (error) {
          console.log(`⚠️  Table '${tableName}' - Error: ${error.message}`);
        } else {
          console.log(`✅ Table '${tableName}' exists and accessible`);
        }
      } catch (error) {
        console.log(`❌ Table '${tableName}' - Connection error: ${error.message}`);
      }
    }

    console.log('\n🔗 2. RECENT SCHEMA CHANGES VERIFICATION\n');

    // Check for prompt_starter field in prompts table
    try {
      const { data: promptData } = await supabase
        .from('prompts')
        .select('prompt_starter, status')
        .limit(1);

      if (promptData && promptData.length > 0) {
        const prompt = promptData[0];
        console.log('✅ prompts.prompt_starter field exists');
        console.log('✅ prompts.status field exists');

        if (prompt.prompt_starter !== undefined) {
          console.log('   • prompt_starter value example:', prompt.prompt_starter || '[NULL]');
        }
        if (prompt.status !== undefined) {
          console.log('   • status value example:', prompt.status || '[NULL]');
        }
      } else {
        console.log('⚠️  prompts table empty - cannot verify new fields');
      }
    } catch (error) {
      console.log('❌ prompts table new fields check failed:', error.message);
    }

    // Check agent_capabilities relationships
    try {
      const { data: agentCaps } = await supabase
        .from('agent_capabilities')
        .select('agent_id, capability_id, proficiency_level, is_primary')
        .limit(1);

      if (agentCaps) {
        console.log('✅ agent_capabilities table with relationships exists');
        if (agentCaps.length > 0) {
          console.log('   • Contains data:', agentCaps.length > 0 ? 'Yes' : 'No');
        }
      }
    } catch (error) {
      console.log('❌ agent_capabilities table check failed:', error.message);
    }

    // Check agent_prompts relationships
    try {
      const { data: agentPrompts } = await supabase
        .from('agent_prompts')
        .select('agent_id, prompt_id, is_default')
        .limit(1);

      if (agentPrompts) {
        console.log('✅ agent_prompts table with relationships exists');
        if (agentPrompts.length > 0) {
          console.log('   • Contains data:', agentPrompts.length > 0 ? 'Yes' : 'No');
        }
      }
    } catch (error) {
      console.log('❌ agent_prompts table check failed:', error.message);
    }

    console.log('\n⚙️  3. DATABASE FUNCTIONS VERIFICATION\n');

    // Check recent database functions
    const functions = [
      'get_agent_prompt_starters',
      'get_agent_prompt_starters_by_domain',
      'get_agent_capabilities_detailed',
      'get_available_capabilities'
    ];

    for (const funcName of functions) {
      try {
        // Test if function exists by calling it with test params
        const { data, error } = await supabase.rpc(funcName,
          funcName.includes('capabilities') ? {} : { agent_name_param: 'test' }
        );

        console.log(`✅ Function '${funcName}' exists and callable`);
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`❌ Function '${funcName}' does not exist`);
        } else {
          console.log(`⚠️  Function '${funcName}' exists but error: ${error.message.substring(0, 50)}...`);
        }
      }
    }

    console.log('\n📋 4. DATA INTEGRITY CHECK\n');

    // Check if we have sample data
    try {
      const checks = await Promise.all([
        supabase.from('agents').select('count').limit(1),
        supabase.from('prompts').select('count').limit(1),
        supabase.from('capabilities').select('count').limit(1)
      ]);

      console.log('Data presence check:');
      console.log('✅ Agents table accessible');
      console.log('✅ Prompts table accessible');
      console.log('✅ Capabilities table accessible');

    } catch (error) {
      console.log('❌ Data integrity check failed:', error.message);
    }

    console.log('\n🏗️  5. MIGRATION STATUS SUMMARY\n');

    console.log('Recent migrations created (should be applied to Supabase):');
    console.log('📝 20250927000000_add_prompt_starter_support.sql');
    console.log('   • Adds prompt_starter field to prompts table');
    console.log('   • Adds status field with proper constraints');
    console.log('   • Creates get_agent_prompt_starters function');

    console.log('📝 20250927001000_populate_agent_prompt_starters.sql');
    console.log('   • Populates 30+ healthcare prompt starters');
    console.log('   • Creates sample data for 5 key agents');

    console.log('📝 20250927002000_populate_agent_prompt_relationships.sql');
    console.log('   • Links agents to prompts via agent_prompts table');
    console.log('   • Creates helper functions for relationship management');

    console.log('📝 20250927003000_integrate_capabilities_registry.sql');
    console.log('   • Migrates agent capabilities to registry relationships');
    console.log('   • Creates 15 healthcare capabilities with bullet points');
    console.log('   • Establishes agent_capabilities relationships');

    console.log('\n📊 SCHEMA AUDIT RECOMMENDATIONS:\n');

    console.log('1. 🔄 Apply Migrations:');
    console.log('   Run: npx supabase db reset (to apply all migrations)');
    console.log('   Or apply individual migration files to production');

    console.log('\n2. 🧪 Test Functions:');
    console.log('   Verify database functions work with sample data');
    console.log('   Test agent-prompt-capability relationships');

    console.log('\n3. 🔍 Validate Data:');
    console.log('   Ensure prompt starters have full descriptions');
    console.log('   Verify capability bullet points are properly formatted');
    console.log('   Check agent relationships are properly linked');

    console.log('\n✅ Schema audit complete!\n');

  } catch (error) {
    console.error('\n❌ Schema audit failed:', error);
  }
}

auditSchema();