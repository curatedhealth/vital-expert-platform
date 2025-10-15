#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('🚀 Applying organizational structure migration...\n');

  const sql = fs.readFileSync('database/sql/migrations/2025/20251001000000_create_organizational_structure.sql', 'utf-8');

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';

    // Skip comments
    if (statement.trim().startsWith('--')) continue;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        // If exec_sql doesn't exist, skip for now
        if (error.message && error.message.includes('exec_sql')) {
          console.log('⚠️  exec_sql function not available, applying via Supabase CLI instead...');
          console.log('Please run: npx supabase db push');
          process.exit(0);
        }

        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        errorCount++;
      } else {
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`   Executed ${successCount} statements...`);
        }
      }
    } catch (err) {
      console.error(`❌ Exception in statement ${i + 1}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n✅ Migration completed!`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);

  if (errorCount > 0) {
    console.log('\n⚠️  Some statements failed. You may need to apply the migration manually via Supabase SQL Editor.');
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

applyMigration();
