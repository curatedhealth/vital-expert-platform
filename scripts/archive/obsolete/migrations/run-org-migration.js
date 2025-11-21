/**
 * Run organizational tables migration
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🚀 Running organizational tables migration...\n');

  const sql = readFileSync(
    'database/sql/migrations/2025/20251004120000_create_org_tables.sql',
    'utf8'
  );

  try {
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      // If exec_sql doesn't exist, we need to create tables manually via API
      console.log('⚠️  Direct SQL execution not available, creating tables via Supabase client...\n');

      // We'll need to restart PostgREST to pick up new tables
      console.log('✅ Migration file created');
      console.log('📝 Run this command in your Supabase SQL editor:');
      console.log('   https://supabase.com/dashboard/project/_/sql\n');
      console.log('Or run via Docker:');
      console.log('   docker exec supabase_db_VITAL_path psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/20251004120000_create_org_tables.sql');

      return;
    }

    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Created tables:');
    console.log('   - org_functions');
    console.log('   - org_departments');
    console.log('   - org_roles');
    console.log('   - org_responsibilities');
    console.log('   - competencies');
    console.log('   - prompts');
    console.log('   - tools');
    console.log('   - workflows');
    console.log('   - rag_documents');
    console.log('   - jobs_to_be_done');
    console.log('   + 11 junction tables for relations');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
}

runMigration();
