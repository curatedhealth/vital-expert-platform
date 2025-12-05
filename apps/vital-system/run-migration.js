/**
 * Run SQL Migration Directly
 * Uses node-postgres to execute SQL against Supabase
 */

const fs = require('fs');
const path = require('path');

// Try to use pg if available, otherwise provide instructions
let Client;
try {
  const { Client: PgClient } = require('pg');
  Client = PgClient;
} catch (e) {
  console.error('❌ pg module not found. Installing...');
  require('child_process').execSync('npm install pg', { stdio: 'inherit' });
  const { Client: PgClient } = require('pg');
  Client = PgClient;
}

const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function runMigration() {
  console.log('='.repeat(70));
  console.log('🔧 Running SQL Migration');
  console.log('='.repeat(70));
  console.log();

  // Read SQL file
  const sqlFile = path.join(__dirname, 'create-user-panels-table.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log('📄 SQL file loaded:', sqlFile);
  console.log('📝 SQL size:', sql.length, 'bytes');
  console.log();

  // Create PostgreSQL client
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('🔌 Connecting to database...');
  console.log('   URL:', connectionString.replace(/:[^:@]+@/, ':****@'));

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false, // Supabase requires SSL
    },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    console.log();

    console.log('⏳ Executing SQL migration...');
    console.log();

    // Execute SQL
    const result = await client.query(sql);

    console.log('✅ SQL executed successfully!');
    console.log();

    // Check if we got a result
    if (result.rows && result.rows.length > 0) {
      console.log('📊 Result:');
      result.rows.forEach(row => {
        console.log('  ', JSON.stringify(row));
      });
      console.log();
    }

    // Verify table was created
    console.log('🔍 Verifying table exists...');
    const verifyResult = await client.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'user_panels'
      ORDER BY ordinal_position
      LIMIT 5
    `);

    if (verifyResult.rows.length > 0) {
      console.log('✅ Table created successfully!');
      console.log('   Columns:', verifyResult.rows.length);
      console.log();
      console.log('   Sample columns:');
      verifyResult.rows.forEach(row => {
        console.log(`     - ${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log('⚠️  Could not verify table creation');
    }

    console.log();
    console.log('='.repeat(70));
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70));
    console.log();
    console.log('Next steps:');
    console.log('  1. Go to your app: http://localhost:3000/ask-panel/test-panel-drug-hash-jcnodk');
    console.log('  2. Make a change in the workflow designer');
    console.log('  3. Click "Save"');
    console.log('  4. Should work without errors! ✅');
    console.log();

  } catch (error) {
    console.error();
    console.error('='.repeat(70));
    console.error('❌ MIGRATION FAILED');
    console.error('='.repeat(70));
    console.error();
    console.error('Error:', error.message);

    if (error.code) {
      console.error('Code:', error.code);
    }

    if (error.detail) {
      console.error('Detail:', error.detail);
    }

    if (error.hint) {
      console.error('Hint:', error.hint);
    }

    console.error();
    console.error('Common issues:');
    console.error('  - SSL connection failed: Check DATABASE_URL includes ?sslmode=require');
    console.error('  - Permission denied: Check database credentials');
    console.error('  - Connection timeout: Check network connection');
    console.error();

    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

runMigration();
