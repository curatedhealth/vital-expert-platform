/**
 * Check Supabase Database Schema
 * Verify all tables exist and their columns
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSchema() {
  console.log('🔍 Checking Supabase Database Schema\n');

  const tables = [
    'business_functions',
    'org_departments',
    'org_roles',
    'responsibilities',
    'agents'
  ];

  for (const table of tables) {
    console.log('='.repeat(80));
    console.log(`TABLE: ${table}`);
    console.log('='.repeat(80));

    // Try to get sample record to see columns
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ Error: ${error.message}\n`);
      continue;
    }

    if (!data || data.length === 0) {
      console.log('⚠️  Table exists but is empty');

      // Try to insert a test record to see what columns are expected
      const testRecord: any = { name: 'TEST' };
      const { error: insertError } = await supabase
        .from(table)
        .insert([testRecord])
        .select();

      if (insertError) {
        console.log(`Schema hint: ${insertError.message}`);
      }
    } else {
      console.log('✅ Table exists with data');
      console.log('Sample record columns:');
      Object.keys(data[0]).forEach(col => {
        console.log(`  - ${col}: ${typeof data[0][col]}`);
      });
    }

    // Get count
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    console.log(`\nRecord count: ${count || 0}\n`);
  }

  // Check agents columns specifically
  console.log('='.repeat(80));
  console.log('AGENTS TABLE - DETAILED SCHEMA CHECK');
  console.log('='.repeat(80));

  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .limit(1)
    .single();

  if (agent) {
    console.log('\nAgent record structure:');
    Object.entries(agent).forEach(([key, value]) => {
      const type = typeof value;
      const preview = value === null ? 'NULL' :
                     type === 'string' ? `"${String(value).substring(0, 50)}..."` :
                     String(value);
      console.log(`  ${key.padEnd(30)} ${type.padEnd(10)} ${preview}`);
    });
  }

  console.log('\n✅ Schema check complete\n');
}

checkSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
