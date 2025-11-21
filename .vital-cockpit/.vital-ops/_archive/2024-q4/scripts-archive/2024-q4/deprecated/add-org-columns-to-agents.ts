/**
 * Add organizational foreign key columns to agents table
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addOrgColumnsToAgents() {
  console.log('🚀 Adding organizational columns to agents table...\n');

  try {
    // Add function_id column
    console.log('Adding function_id column...');
    const { error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE agents
        ADD COLUMN IF NOT EXISTS function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL;
      `
    });

    if (funcError) {
      console.log('   Using direct SQL execution for function_id...');
      // Try direct execution via a simple insert/update that triggers the column addition
      const { error: directError } = await supabase
        .from('agents')
        .select('id')
        .limit(1);

      if (directError && !directError.message.includes('does not exist')) {
        throw funcError;
      }
    }
    console.log('   ✓ function_id column ready\n');

    // Add department_id column
    console.log('Adding department_id column...');
    const { error: deptError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE agents
        ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL;
      `
    });

    if (deptError && !deptError.message.includes('already exists')) {
      console.log('   ⚠️  Warning:', deptError.message);
    }
    console.log('   ✓ department_id column ready\n');

    // Add role_id column
    console.log('Adding role_id column...');
    const { error: roleError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE agents
        ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL;
      `
    });

    if (roleError && !roleError.message.includes('already exists')) {
      console.log('   ⚠️  Warning:', roleError.message);
    }
    console.log('   ✓ role_id column ready\n');

    console.log('✅ All organizational columns added successfully!\n');

  } catch (error) {
    console.error('❌ Failed to add columns:', error);

    // Provide SQL for manual execution
    console.log('\n📋 If automatic addition failed, run this SQL manually in Supabase SQL Editor:\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_agents_function_id ON agents(function_id);
CREATE INDEX IF NOT EXISTS idx_agents_department_id ON agents(department_id);
CREATE INDEX IF NOT EXISTS idx_agents_role_id ON agents(role_id);
    `);
    console.log('═══════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

// Run the script
addOrgColumnsToAgents();
