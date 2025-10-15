#!/usr/bin/env node

/**
 * Apply Schema Fix Migration Directly
 * This script applies the missing tables fix directly to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xazinxsiglqokwfmogyk.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function applySchemaFix() {
  console.log('\n🔧 Applying Schema Fix for Missing Tables\n');

  try {
    // Read the fix migration
    const fixMigrationPath = path.join(__dirname, '../database/sql/migrations/2025/20250927004000_fix_missing_tables.sql');
    const fixSql = fs.readFileSync(fixMigrationPath, 'utf8');

    console.log('📝 Applying fix migration directly...');

    // Apply the fix migration using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: fixSql });

    if (error) {
      console.error('❌ Error applying fix migration:', error);
      return;
    }

    console.log('✅ Fix migration applied successfully!');

    // Verify the missing tables now exist
    console.log('\n🔍 Verifying table existence...\n');

    const tablesToCheck = [
      'agent_prompts',
      'prompt_capabilities'
    ];

    for (const tableName of tablesToCheck) {
      try {
        const { count, error: tableError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(1);

        if (tableError && tableError.code === '42P01') {
          console.log(`❌ Table '${tableName}' still does not exist`);
        } else if (tableError) {
          console.log(`⚠️  Table '${tableName}' - Error: ${tableError.message}`);
        } else {
          console.log(`✅ Table '${tableName}' exists (${count || 0} rows)`);
        }
      } catch (error) {
        console.log(`❌ Table '${tableName}' - Connection error: ${error.message}`);
      }
    }

    // Test the functions
    console.log('\n⚙️  Testing Database Functions...\n');

    try {
      const { data: testData, error: funcError } = await supabase
        .rpc('get_agent_prompt_starters', { agent_name_param: 'fda-regulatory-strategist' });

      if (funcError) {
        console.log('⚠️  Function test warning:', funcError.message);
      } else {
        console.log(`✅ get_agent_prompt_starters function working (${testData?.length || 0} results)`);
      }
    } catch (error) {
      console.log('⚠️  Function test error:', error.message);
    }

    console.log('\n🎉 Schema fix completed!\n');

  } catch (error) {
    console.error('\n❌ Schema fix failed:', error);
  }
}

// Alternative: Apply fix using direct SQL execution
async function applySchemaFixDirect() {
  console.log('\n🔧 Applying Schema Fix via Direct SQL Execution\n');

  const fixSqls = [
    // Create missing agent_prompts table
    `CREATE TABLE IF NOT EXISTS agent_prompts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
      is_default BOOLEAN DEFAULT false,
      customizations JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(agent_id, prompt_id)
    );`,

    // Create missing prompt_capabilities table
    `CREATE TABLE IF NOT EXISTS prompt_capabilities (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
      capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
      is_required BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(prompt_id, capability_id)
    );`,

    // Add missing columns to prompts table
    `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS prompt_starter TEXT;`,
    `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft'));`,

    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_agent_prompts_agent_id ON agent_prompts(agent_id);`,
    `CREATE INDEX IF NOT EXISTS idx_agent_prompts_prompt_id ON agent_prompts(prompt_id);`,
    `CREATE INDEX IF NOT EXISTS idx_prompt_capabilities_prompt ON prompt_capabilities(prompt_id);`,

    // Enable RLS
    `ALTER TABLE agent_prompts ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE prompt_capabilities ENABLE ROW LEVEL SECURITY;`
  ];

  for (let i = 0; i < fixSqls.length; i++) {
    const sql = fixSqls[i];
    console.log(`Executing step ${i + 1}/${fixSqls.length}...`);

    try {
      // Use rpc to execute raw SQL
      const { error } = await supabase.rpc('exec_sql', { sql });

      if (error) {
        console.log(`⚠️  Step ${i + 1} warning:`, error.message);
      } else {
        console.log(`✅ Step ${i + 1} completed`);
      }
    } catch (error) {
      console.log(`❌ Step ${i + 1} error:`, error.message);
    }
  }

  console.log('\n🎉 Direct schema fix completed!\n');
}

// Execute the fix
if (process.argv.includes('--direct')) {
  applySchemaFixDirect();
} else {
  applySchemaFix();
}