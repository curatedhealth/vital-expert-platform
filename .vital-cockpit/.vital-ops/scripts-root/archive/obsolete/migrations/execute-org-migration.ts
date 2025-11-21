/**
 * Execute organizational columns migration using node-postgres (pg)
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL environment variable');
  process.exit(1);
}

// Determine if we need SSL based on the connection string
const needsSSL = connectionString.includes('supabase') || connectionString.includes('aws');

const pool = new Pool({
  connectionString,
  ...(needsSSL ? { ssl: { rejectUnauthorized: false } } : {})
});

async function executeMigration() {
  console.log('🚀 Executing organizational columns migration...\n');

  const client = await pool.connect();

  try {
    // Read the migration file
    const migrationPath = path.resolve(__dirname, '../database/sql/migrations/2025/20251002003500_add_org_columns_to_agents.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Running migration SQL...\n');

    // Execute the migration
    const result = await client.query(sql);

    console.log('✅ Migration executed successfully!\n');
    console.log('Result:', result);

    // Verify columns were added
    console.log('\n📊 Verifying columns...');
    const verifyResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'agents'
        AND column_name IN ('function_id', 'department_id', 'role_id')
      ORDER BY column_name;
    `);

    console.log('\nColumns added:');
    verifyResult.rows.forEach(row => {
      console.log(`   ✓ ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });

    console.log('\n✅ All done!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
executeMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
