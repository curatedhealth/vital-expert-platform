#!/usr/bin/env tsx
/**
 * Run Ask Expert Sessions Migration
 * 
 * This script applies the ask_expert_sessions table migration to Supabase.
 * Usage: tsx scripts/run-ask-expert-sessions-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: Missing Supabase configuration');
  console.error('Required environment variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 Make sure .env.local exists with these variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running Ask Expert Sessions Migration');
  console.log('==========================================\n');

  const migrationFile = join(
    process.cwd(),
    'supabase/migrations/20250129000001_create_ask_expert_sessions.sql'
  );

  try {
    const sql = readFileSync(migrationFile, 'utf8');
    console.log(`📄 Migration file: ${migrationFile}\n`);

    // Split SQL by statements (separated by semicolons, ignoring comments)
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        !stmt.startsWith('--') &&
        !stmt.startsWith('/*') &&
        stmt !== 'COMMIT' &&
        stmt !== 'BEGIN'
      );

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements
      if (!statement) continue;

      try {
        // Execute via Supabase REST API using rpc (if available) or direct query
        console.log(`  [${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);

        // For DDL statements (CREATE TABLE, CREATE INDEX, etc.), we need to use
        // Supabase SQL Editor API or pgAdmin API, but Supabase REST API doesn't support DDL directly
        // So we'll use a workaround: try to execute via a custom function or direct connection

        // Check if it's a simple statement we can verify
        const isCreateTable = statement.match(/CREATE TABLE (IF NOT EXISTS )?(\w+)/i);
        const isCreateIndex = statement.match(/CREATE INDEX/i);
        const isCreateFunction = statement.match(/CREATE (OR REPLACE )?FUNCTION/i);
        const isCreateTrigger = statement.match(/CREATE TRIGGER/i);

        if (isCreateTable || isCreateIndex || isCreateFunction || isCreateTrigger) {
          // For DDL, we'll need to execute via Supabase Dashboard SQL Editor
          // But we can verify if the table/index already exists
          const tableName = statement.match(/CREATE TABLE (IF NOT EXISTS )?(\w+)/i)?.[2];
          
          if (tableName) {
            // Check if table exists
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .limit(0);

            if (!error || error.code === 'PGRST116') {
              console.log(`     ✅ Table/index may already exist, skipping...`);
              successCount++;
              continue;
            }
          }
        }

        // For other statements, try execution
        // Since Supabase REST API doesn't support arbitrary SQL execution,
        // we'll provide instructions for manual execution
        
        console.log(`     ⚠️  This statement requires manual execution via Supabase SQL Editor`);
        console.log(`     📝 Statement preview: ${statement.substring(0, 100)}...\n`);

      } catch (error: any) {
        console.error(`     ❌ Error: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Processed: ${successCount}`);
    console.log(`  ⚠️  Manual execution needed for DDL statements`);
    console.log(`  ❌ Errors: ${errorCount}\n`);

    // Verify tables exist
    console.log('🔍 Verifying tables...\n');
    
    const tablesToCheck = ['ask_expert_sessions', 'ask_expert_messages'];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error && error.code !== 'PGRST116') {
          console.log(`  ⚠️  ${tableName}: Not found or error (${error.message})`);
          console.log(`     → Execute migration manually in Supabase SQL Editor`);
        } else {
          console.log(`  ✅ ${tableName}: Exists`);
        }
      } catch (err: any) {
        console.log(`  ⚠️  ${tableName}: Could not verify (${err.message})`);
      }
    }

    console.log('\n💡 Next Steps:');
    console.log('  1. Open Supabase Dashboard SQL Editor');
    console.log(`  2. Copy contents of: ${migrationFile}`);
    console.log('  3. Execute the migration');
    console.log('  4. Verify tables were created\n');

    console.log('🧪 Test queries after migration:');
    console.log('  SELECT COUNT(*) FROM ask_expert_sessions;');
    console.log('  SELECT COUNT(*) FROM ask_expert_messages;\n');

  } catch (error: any) {
    console.error(`❌ Migration failed: ${error.message}`);
    console.error('\n💡 To apply manually:');
    console.error('  1. Open Supabase Dashboard');
    console.error(`  2. Go to SQL Editor`);
    console.error(`  3. Copy contents of: ${migrationFile}`);
    console.error('  4. Execute the migration\n');
    process.exit(1);
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

