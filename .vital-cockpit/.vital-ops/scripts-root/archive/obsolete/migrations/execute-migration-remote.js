#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Remote Supabase connection details
const connectionString = 'postgresql://postgres.xazinxsiglqokwfmogyk:Pca7tZaaK9yqQ8WHAG2u1xuGBEOSi7GG2UT9X60YpKdGWBPgYpeXDmXPKIYHZ8j@aws-0-us-west-1.pooler.supabase.com:6543/postgres';

async function executeMigration(migrationNumber) {
  const migrationNames = {
    '1': 'create_tenants_table',
    '2': 'add_tenant_columns_to_resources',
    '3': 'update_rls_policies',
    '4': 'seed_mvp_tenants'
  };

  const migrationName = migrationNames[migrationNumber];

  if (!migrationName) {
    console.error('❌ Invalid migration number. Use: 1, 2, 3, or 4');
    process.exit(1);
  }

  console.log('═'.repeat(80));
  console.log(`🚀 EXECUTING MIGRATION ${migrationNumber}: ${migrationName.toUpperCase()}`);
  console.log('═'.repeat(80));
  console.log(`Target: Remote Supabase (xazinxsiglqokwfmogyk)`);
  console.log('═'.repeat(80), '\n');

  const client = new Client({ connectionString });

  try {
    // Connect to database
    console.log('🔌 Connecting to remote database...');
    await client.connect();
    console.log('✅ Connected\n');

    // Load migration file
    const migrationFile = path.join(
      __dirname,
      `../database/sql/migrations/2025/2025102600000${migrationNumber}_${migrationName}.sql`
    );

    if (!fs.existsSync(migrationFile)) {
      console.error(`❌ Migration file not found: ${migrationFile}`);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(migrationFile, 'utf8');
    console.log(`📂 Loaded migration file: ${path.basename(migrationFile)}`);
    console.log(`📊 Size: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);

    // Execute migration
    console.log('⚙️  Executing SQL migration...\n');

    const result = await client.query(sqlContent);

    console.log('✅ Migration executed successfully!\n');

    // Show some results if available
    if (result.rows && result.rows.length > 0) {
      console.log(`📋 Result rows: ${result.rows.length}`);
    }

    console.log('═'.repeat(80));
    console.log(`✅ MIGRATION ${migrationNumber} COMPLETE`);
    console.log('═'.repeat(80), '\n');

  } catch (err) {
    console.error('\n❌ MIGRATION FAILED:');
    console.error('═'.repeat(80));
    console.error('Error:', err.message);
    if (err.position) {
      console.error('Position:', err.position);
    }
    if (err.detail) {
      console.error('Detail:', err.detail);
    }
    if (err.hint) {
      console.error('Hint:', err.hint);
    }
    console.error('═'.repeat(80), '\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Get migration number from command line
const migrationNum = process.argv[2] || '1';
executeMigration(migrationNum);
