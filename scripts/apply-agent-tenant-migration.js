#!/usr/bin/env node

/**
 * Apply Many-to-Many Agent-Tenant Migration
 * Executes: database/postgres/migrations/20241124110000_map_agents_to_tenants_many_to_many.sql
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://epdqcfltdxlnsbrsblxo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZHFjZmx0ZHhsbnNicnNibHhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTczNTE3MSwiZXhwIjoyMDQ1MzExMTcxfQ.4_r6KsJmkvwc2-CWyGx9dP93c_F9yGPFwW4tTzV0bI0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Starting Many-to-Many Agent-Tenant Migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20241124110000_map_agents_to_tenants_many_to_many.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded:', migrationPath);
    console.log('📊 SQL size:', sql.length, 'characters\n');

    // Execute the migration using RPC (for complex SQL with DO blocks)
    console.log('⚙️  Executing migration via Supabase RPC...\n');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.error('Details:', error);
      process.exit(1);
    }

    console.log('✅ Migration executed successfully!\n');
    console.log('📊 Result:', data);

    // Verify the migration by checking tenant_agents table
    const { data: verifyData, error: verifyError } = await supabase
      .from('tenant_agents')
      .select('tenant_id, agent_id', { count: 'exact', head: true });

    if (verifyError) {
      console.warn('⚠️  Could not verify migration:', verifyError.message);
    } else {
      console.log('\n✅ Verification: tenant_agents table has', verifyData?.length || 0, 'mappings');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

applyMigration();
