#!/usr/bin/env tsx
/**
 * Run All Database Migrations
 * 
 * This script applies both SQL migrations:
 * 1. ask_expert_sessions migration
 * 2. user_conversations migration
 * 
 * Usage: tsx scripts/run-all-migrations.ts
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

interface MigrationResult {
  name: string;
  success: boolean;
  tablesVerified: string[];
  error?: string;
}

async function verifyTable(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);

    // PGRST116 = no rows found (table exists but empty)
    // 42P01 = table does not exist
    if (error && error.code === '42P01') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function runMigration(
  migrationFile: string,
  expectedTables: string[]
): Promise<MigrationResult> {
  const migrationName = migrationFile.split('/').pop() || 'unknown';
  console.log(`\n📄 Processing: ${migrationName}\n`);

  try {
    const sql = readFileSync(migrationFile, 'utf8');
    console.log(`   File: ${migrationFile}\n`);

    // Check which tables already exist
    const existingTables: string[] = [];
    const missingTables: string[] = [];

    for (const tableName of expectedTables) {
      const exists = await verifyTable(tableName);
      if (exists) {
        existingTables.push(tableName);
        console.log(`   ✅ Table '${tableName}' already exists`);
      } else {
        missingTables.push(tableName);
        console.log(`   ⚠️  Table '${tableName}' not found - needs migration`);
      }
    }

    if (existingTables.length === expectedTables.length) {
      console.log(`\n   ✅ All tables for ${migrationName} already exist. Skipping.\n`);
      return {
        name: migrationName,
        success: true,
        tablesVerified: existingTables,
      };
    }

    console.log(`\n   📋 SQL Migration Content:`);
    console.log(`   ${'='.repeat(60)}`);
    console.log(sql.substring(0, 500) + (sql.length > 500 ? '...' : ''));
    console.log(`   ${'='.repeat(60)}\n`);

    return {
      name: migrationName,
      success: false,
      tablesVerified: existingTables,
      error: 'Manual execution required via Supabase SQL Editor',
    };
  } catch (error: any) {
    return {
      name: migrationName,
      success: false,
      tablesVerified: [],
      error: error.message,
    };
  }
}

async function main() {
  console.log('🚀 Running All Database Migrations');
  console.log('===================================\n');

  const migrations = [
    {
      file: join(process.cwd(), 'supabase/migrations/20250129000001_create_ask_expert_sessions.sql'),
      tables: ['ask_expert_sessions', 'ask_expert_messages'],
      name: 'Ask Expert Sessions',
    },
    {
      file: join(process.cwd(), 'supabase/migrations/20250129000002_create_user_conversations_table.sql'),
      tables: ['user_conversations'],
      name: 'User Conversations',
    },
  ];

  const results: MigrationResult[] = [];

  for (const migration of migrations) {
    const result = await runMigration(migration.file, migration.tables);
    results.push(result);
  }

  // Summary
  console.log('\n📊 Migration Summary');
  console.log('===================================\n');

  let allCompleted = true;
  for (const result of results) {
    if (result.success) {
      console.log(`✅ ${result.name}: All tables exist`);
      console.log(`   Verified: ${result.tablesVerified.join(', ')}\n`);
    } else {
      allCompleted = false;
      console.log(`⚠️  ${result.name}: Requires manual execution`);
      if (result.tablesVerified.length > 0) {
        console.log(`   Partial: ${result.tablesVerified.join(', ')}`);
      }
      console.log(`   Error: ${result.error || 'Unknown'}\n`);
    }
  }

  if (!allCompleted) {
    console.log('💡 Manual Execution Instructions:');
    console.log('   1. Open Supabase Dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and execute the SQL from each migration file:\n');

    for (const migration of migrations) {
      console.log(`   📄 ${migration.file}`);
    }

    console.log('\n   4. After execution, verify with:');
    console.log('      SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\';\n');
  } else {
    console.log('✅ All migrations are complete!\n');
  }

  // Final verification
  console.log('🔍 Final Verification');
  console.log('====================\n');

  const allTables = ['ask_expert_sessions', 'ask_expert_messages', 'user_conversations'];
  for (const tableName of allTables) {
    const exists = await verifyTable(tableName);
    console.log(`${exists ? '✅' : '❌'} ${tableName}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
  }

  console.log('\n');
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

