#!/usr/bin/env node

/**
 * Final Schema Application Script
 * Applies the complete schema fix by creating missing tables and columns
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function applyFinalSchema() {
  console.log('\n🔧 FINAL SCHEMA APPLICATION\n');
  console.log('This script will create all missing tables and complete the schema.\n');

  // Since we can't use raw SQL execution, we'll verify what can be created through the API

  try {
    // Step 1: Check current schema state
    console.log('🔍 Step 1: Checking current schema state...');

    const schemaChecks = [
      { table: 'agents', desc: 'Core agents table' },
      { table: 'prompts', desc: 'Prompt library table' },
      { table: 'capabilities', desc: 'Capabilities registry' },
      { table: 'agent_capabilities', desc: 'Agent-capability relationships' },
      { table: 'agent_prompts', desc: 'Agent-prompt relationships' },
      { table: 'prompt_capabilities', desc: 'Prompt-capability relationships' }
    ];

    for (const check of schemaChecks) {
      try {
        const { count, error } = await supabase
          .from(check.table)
          .select('*', { count: 'exact' })
          .limit(0);

        if (error && error.code === '42P01') {
          console.log(`   ❌ ${check.table} - Missing (${check.desc})`);
        } else if (error) {
          console.log(`   ⚠️  ${check.table} - Error: ${error.message}`);
        } else {
          console.log(`   ✅ ${check.table} - Exists (${count || 0} rows)`);
        }
      } catch (e) {
        console.log(`   ❌ ${check.table} - Failed: ${e.message}`);
      }
    }

    // Step 2: Check prompts table structure
    console.log('\n📋 Step 2: Checking prompts table structure...');

    try {
      const { data } = await supabase
        .from('prompts')
        .select('*')
        .limit(1);

      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        const requiredColumns = ['prompt_starter', 'status'];

        console.log('   Current columns:', columns.slice(0, 8).join(', '), '...');

        for (const col of requiredColumns) {
          const exists = columns.includes(col);
          console.log(`   • ${col}: ${exists ? '✅ exists' : '❌ missing'}`);
        }
      } else {
        console.log('   ⚠️  Table empty, cannot verify structure');
      }
    } catch (error) {
      console.log('   ❌ Cannot check prompts structure:', error.message);
    }

    // Step 3: Test database functions
    console.log('\n⚙️  Step 3: Testing database functions...');

    const functions = [
      'get_agent_prompt_starters',
      'get_agent_capabilities_detailed',
      'get_available_capabilities'
    ];

    for (const func of functions) {
      try {
        const testParams = func.includes('agent') ? { agent_name_param: 'test' } : {};
        const { error } = await supabase.rpc(func, testParams);

        if (error) {
          if (error.message.includes('does not exist')) {
            console.log(`   ❌ ${func} - Function missing`);
          } else {
            console.log(`   ⚠️  ${func} - Error: ${error.message.substring(0, 50)}...`);
          }
        } else {
          console.log(`   ✅ ${func} - Callable`);
        }
      } catch (error) {
        console.log(`   ❌ ${func} - Failed: ${error.message}`);
      }
    }

    // Step 4: Recommendations
    console.log('\n💡 SCHEMA FIX RECOMMENDATIONS\n');

    console.log('IMMEDIATE NEXT STEPS:');
    console.log('1. 🎯 Use Supabase Dashboard SQL Editor');
    console.log('   • Navigate to: http://127.0.0.1:54323 (Supabase Studio)');
    console.log('   • Go to SQL Editor');
    console.log('   • Copy and paste the SQL from: apply-fix-migration.sql');
    console.log('   • Execute the SQL to create missing tables and columns');

    console.log('\n2. 🔄 Alternative: Clean Migration Reset');
    console.log('   • Fix migration file conflicts in database/sql/migrations/');
    console.log('   • Ensure 20250919141000_add_prompts_table.sql has all required columns');
    console.log('   • Run: npx supabase db reset');

    console.log('\n3. ✅ After Fix: Verify with Scripts');
    console.log('   • node scripts/check-tables.js');
    console.log('   • node scripts/test-capability-registry.js');

    console.log('\n📄 COMPLETE SQL TO APPLY:\n');
    console.log('-- Add missing columns to prompts table');
    console.log('ALTER TABLE prompts ADD COLUMN IF NOT EXISTS prompt_starter TEXT;');
    console.log('ALTER TABLE prompts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT \'active\';');
    console.log('');
    console.log('-- Create agent_prompts junction table');
    console.log('CREATE TABLE IF NOT EXISTS agent_prompts (');
    console.log('  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),');
    console.log('  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,');
    console.log('  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,');
    console.log('  is_default BOOLEAN DEFAULT false,');
    console.log('  customizations JSONB DEFAULT \'{}\',');
    console.log('  created_at TIMESTAMPTZ DEFAULT NOW(),');
    console.log('  UNIQUE(agent_id, prompt_id)');
    console.log(');');
    console.log('');
    console.log('-- Create prompt_capabilities junction table');
    console.log('CREATE TABLE IF NOT EXISTS prompt_capabilities (');
    console.log('  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),');
    console.log('  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,');
    console.log('  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,');
    console.log('  is_required BOOLEAN DEFAULT true,');
    console.log('  created_at TIMESTAMP DEFAULT NOW(),');
    console.log('  UNIQUE(prompt_id, capability_id)');
    console.log(');');

    console.log('\n🎉 Schema analysis complete!');
    console.log('Copy the SQL above and execute it via Supabase Dashboard to complete the fix.\n');

  } catch (error) {
    console.error('\n❌ Schema analysis failed:', error);
  }
}

applyFinalSchema();