/**
 * Run the organizational columns migration using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

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

async function runMigration() {
  console.log('🚀 Running organizational columns migration...\n');

  try {
    // Execute each SQL statement separately
    console.log('Step 1: Adding function_id column...');
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE agents ADD COLUMN IF NOT EXISTS function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL;'
    });

    if (error1 && !error1.message.includes('already exists')) {
      console.error('Error adding function_id:', error1);
    } else {
      console.log('   ✓ function_id column added\n');
    }

    console.log('Step 2: Adding department_id column...');
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE agents ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL;'
    });

    if (error2 && !error2.message.includes('already exists')) {
      console.error('Error adding department_id:', error2);
    } else {
      console.log('   ✓ department_id column added\n');
    }

    console.log('Step 3: Adding role_id column...');
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE agents ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL;'
    });

    if (error3 && !error3.message.includes('already exists')) {
      console.error('Error adding role_id:', error3);
    } else {
      console.log('   ✓ role_id column added\n');
    }

    console.log('Step 4: Adding indexes...');
    await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_agents_function_id ON agents(function_id);'
    });
    await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_agents_department_id ON agents(department_id);'
    });
    await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_agents_role_id ON agents(role_id);'
    });
    console.log('   ✓ Indexes created\n');

    console.log('✅ Migration completed successfully!\n');

  } catch (error: any) {
    console.error('❌ Migration failed:', error);

    if (error.code === '42883') {
      console.log('\n⚠️  The exec_sql function does not exist.');
      console.log('Please run this SQL manually in the Supabase SQL Editor:\n');
      console.log('═══════════════════════════════════════════════════════════════');

      const sqlPath = path.resolve(__dirname, '../database/sql/migrations/2025/20251002003500_add_org_columns_to_agents.sql');
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      console.log(sql);
      console.log('═══════════════════════════════════════════════════════════════\n');
    }

    process.exit(1);
  }
}

// Run the migration
runMigration();
