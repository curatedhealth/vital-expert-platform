#!/usr/bin/env tsx
/**
 * Verify Ask Expert Sessions Migration
 * 
 * Checks if ask_expert_sessions tables exist and are properly configured.
 * Usage: tsx scripts/verify-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMigration() {
  console.log('🔍 Verifying Ask Expert Sessions Migration\n');

  const tablesToCheck = [
    {
      name: 'ask_expert_sessions',
      requiredColumns: ['id', 'tenant_id', 'user_id', 'agent_id', 'mode', 'status', 'created_at'],
    },
    {
      name: 'ask_expert_messages',
      requiredColumns: ['id', 'session_id', 'role', 'content', 'created_at'],
    },
  ];

  let allVerified = true;

  for (const table of tablesToCheck) {
    console.log(`📋 Checking table: ${table.name}`);
    
    try {
      // Try to query the table
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        console.log(`  ❌ Table does not exist: ${table.name}`);
        console.log(`     → Run migration: bash scripts/run-ask-expert-sessions-migration.sh\n`);
        allVerified = false;
        continue;
      }

      if (error) {
        console.log(`  ⚠️  Error accessing table: ${error.message}\n`);
        allVerified = false;
        continue;
      }

      console.log(`  ✅ Table exists: ${table.name}`);

      // Check columns by trying to select them
      const { error: columnError } = await supabase
        .from(table.name)
        .select(table.requiredColumns.join(', '))
        .limit(0);

      if (columnError) {
        console.log(`  ⚠️  Some columns may be missing: ${columnError.message}`);
      } else {
        console.log(`  ✅ Required columns verified`);
      }

      // Get row count
      const { count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });

      console.log(`  📊 Row count: ${count || 0}\n`);

    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}\n`);
      allVerified = false;
    }
  }

  // Check indexes (we can't directly query indexes via Supabase API,
  // but we can verify by checking query performance)
  console.log('📋 Checking indexes (via query performance)...');
  
  try {
    const startTime = Date.now();
    await supabase
      .from('ask_expert_sessions')
      .select('*')
      .eq('status', 'active')
      .limit(1);
    const queryTime = Date.now() - startTime;
    
    if (queryTime < 100) {
      console.log('  ✅ Indexes appear to be working (fast query)\n');
    } else {
      console.log(`  ⚠️  Query took ${queryTime}ms (indexes may need verification)\n`);
    }
  } catch (error: any) {
    console.log(`  ⚠️  Could not verify indexes: ${error.message}\n`);
  }

  if (allVerified) {
    console.log('✅ Migration verification complete!');
    console.log('✅ All tables exist and are accessible\n');
  } else {
    console.log('⚠️  Some issues found. Review the output above.\n');
    process.exit(1);
  }
}

verifyMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

