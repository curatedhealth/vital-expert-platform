/**
 * Run SQL Migration Script
 * Executes SQL file directly against Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'sql-migration-script',
    },
  },
  db: {
    schema: 'public',
  },
});

async function runSqlFile(sqlFilePath) {
  console.log(`\n📄 Reading SQL file: ${sqlFilePath}`);

  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  console.log('📝 SQL content:');
  console.log('-'.repeat(70));
  console.log(sql.substring(0, 500) + (sql.length > 500 ? '...' : ''));
  console.log('-'.repeat(70));

  console.log('\n⏳ Executing SQL...');

  // Execute using RPC (raw SQL execution)
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // If exec_sql function doesn't exist, try alternative approach
    if (error.code === '42883') {
      console.log('\n⚠️  exec_sql function not found, trying alternative approach...');
      return await runSqlStatements(sql);
    }

    console.error('\n❌ SQL execution failed:', error);
    throw error;
  }

  console.log('\n✅ SQL executed successfully!');
  if (data) {
    console.log('Result:', data);
  }

  return data;
}

async function runSqlStatements(sql) {
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

  console.log(`\n📋 Executing ${statements.length} SQL statements...`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    if (!statement) continue;

    console.log(`\n[${i + 1}/${statements.length}] Executing:`);
    console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));

    try {
      // Use REST API to execute raw SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
          apikey: supabaseServiceKey,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseServiceKey}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ query: statement }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Failed: ${error}`);
        throw new Error(error);
      }

      console.log('✅ Success');
    } catch (error) {
      console.error(`❌ Statement ${i + 1} failed:`, error.message);
      throw error;
    }
  }

  console.log('\n✅ All SQL statements executed successfully!');
}

async function main() {
  console.log('='.repeat(70));
  console.log('🔧 SQL Migration Runner');
  console.log('='.repeat(70));

  const sqlFile = process.argv[2] || 'create-user-panels-table.sql';
  const sqlPath = path.join(__dirname, sqlFile);

  if (!fs.existsSync(sqlPath)) {
    console.error(`\n❌ SQL file not found: ${sqlPath}`);
    console.error('\nUsage: node run-sql-migration.js <sql-file.sql>');
    process.exit(1);
  }

  try {
    await runSqlFile(sqlPath);

    console.log('\n' + '='.repeat(70));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(70));

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ Migration failed');
    console.error('='.repeat(70));
    console.error('\nError:', error.message);

    console.log('\n💡 Alternative: Run this SQL directly in Supabase SQL Editor:');
    console.log(`   1. Go to: ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}`);
    console.log('   2. Navigate to: SQL Editor');
    console.log('   3. Create new query');
    console.log(`   4. Paste contents of: ${sqlFile}`);
    console.log('   5. Click "Run"');

    process.exit(1);
  }
}

main();
