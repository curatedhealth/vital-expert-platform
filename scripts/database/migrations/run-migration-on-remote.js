const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzU5NzI0MSwiZXhwIjoyMDQzMTczMjQxfQ.L2k6xgN3-BaI6L9t5PjdFZH_8hIWgP2rqEKjGgV3ZEI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration(migrationNumber, migrationName) {
  console.log('═'.repeat(80));
  console.log(`🚀 RUNNING MIGRATION ${migrationNumber}: ${migrationName}`);
  console.log('═'.repeat(80));
  console.log(`Target: ${supabaseUrl}`);
  console.log('═'.repeat(80), '\n');

  try {
    // Load migration file
    const migrationFile = path.join(
      __dirname,
      `../database/sql/migrations/2025/2025102600000${migrationNumber}_${migrationName}.sql`
    );

    if (!fs.existsSync(migrationFile)) {
      console.error(`❌ Migration file not found: ${migrationFile}`);
      return false;
    }

    const sqlContent = fs.readFileSync(migrationFile, 'utf8');
    console.log(`✅ Loaded migration file (${sqlContent.length} bytes)\n`);

    // Execute SQL via RPC (using Supabase SQL editor equivalent)
    console.log('⚙️  Executing SQL...\n');

    // We need to use Supabase's SQL execution capability
    // Note: This requires a custom RPC function or direct PostgreSQL connection
    // For now, we'll output the SQL for manual execution

    console.log('📄 SQL CONTENT TO EXECUTE:');
    console.log('─'.repeat(80));
    console.log(sqlContent.substring(0, 1000) + '...\n');
    console.log('─'.repeat(80), '\n');

    console.log('⚠️  MANUAL EXECUTION REQUIRED:');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log(`   2. Copy the migration file: ${migrationFile}`);
    console.log('   3. Paste and execute the SQL');
    console.log('   4. Verify no errors\n');

    return true;
  } catch (err) {
    console.error('❌ Migration failed:', err);
    return false;
  }
}

// Get migration number from command line
const migrationNum = process.argv[2] || '1';
const migrationNames = {
  '1': 'create_tenants_table',
  '2': 'add_tenant_columns_to_resources',
  '3': 'update_rls_policies',
  '4': 'seed_mvp_tenants'
};

const migrationName = migrationNames[migrationNum];

if (!migrationName) {
  console.error('❌ Invalid migration number. Use: 1, 2, 3, or 4');
  process.exit(1);
}

runMigration(migrationNum, migrationName);
