#!/usr/bin/env node

/**
 * Apply Phase 1 Database Schema to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySchema() {
  try {
    console.log('🚀 Starting Phase 1 database schema application...');

    // Read the SQL file
    const sqlFile = path.join(__dirname, '../database/sql/migrations/2025/20250925000000_phase1_complete_schema.sql');

    if (!fs.existsSync(sqlFile)) {
      console.error('❌ SQL file not found:', sqlFile);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 SQL file loaded, applying schema...');

    // Split SQL into individual statements (simple approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip empty statements and comments
      if (!statement || statement.startsWith('--')) continue;

      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}`);

        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

        if (error) {
          // Try direct SQL execution if RPC doesn't work
          const { error: directError } = await supabase
            .from('_dummy')
            .select('1')
            .limit(0); // This will fail but establish connection

          // Execute SQL directly using the REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ sql: statement + ';' })
          });

          if (!response.ok) {
            console.warn(`⚠️  Statement ${i + 1} may have failed: ${statement.substring(0, 50)}...`);
            console.warn(`Error: ${error?.message || 'Unknown error'}`);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.warn(`⚠️  Statement ${i + 1} failed: ${err.message}`);
        console.warn(`Statement: ${statement.substring(0, 100)}...`);
        errorCount++;
      }

      // Add small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Schema application results:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);

    // Test the schema by checking if tables exist
    console.log('\n🔍 Verifying table creation...');

    const tablesToCheck = [
      'knowledge_documents',
      'document_chunks',
      'audit_events',
      'metrics',
      'traces',
      'health_checks',
      'alerts',
      'consent_records',
      'retention_actions'
    ];

    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    console.log('\n🎉 Phase 1 schema application completed!');
    console.log('You can now run the development server with: npm run dev');

  } catch (error) {
    console.error('❌ Fatal error applying schema:', error);
    process.exit(1);
  }
}

applySchema();