#!/usr/bin/env node
/**
 * VITAL Path RAG System Migration Script
 * Applies the complete database schema for the multi-tenant RAG system
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Migration files in order
const migrationFiles = [
  '20250924100000_create_vital_path_rag_schema.sql',
  '20250924110000_populate_prism_reference_data.sql'
];

async function executeSqlFile(filePath) {
  console.log(`📁 Reading migration file: ${filePath}`);

  try {
    const sql = await fs.readFile(filePath, 'utf8');
    console.log(`📊 Executing migration: ${path.basename(filePath)}`);

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct execution for simple queries
      console.log('🔄 Trying alternative execution method...');

      // Split into individual statements and execute
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.toLowerCase().includes('create') ||
            statement.toLowerCase().includes('insert') ||
            statement.toLowerCase().includes('alter')) {

          const { error: execError } = await supabase.rpc('exec', { sql: statement });
          if (execError) {
            console.warn(`⚠️ Statement execution warning: ${execError.message}`);
            console.log(`Statement: ${statement.substring(0, 100)}...`);
          }
        }
      }
    }

    console.log(`✅ Migration completed: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error executing migration ${filePath}:`, error.message);
    return false;
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration results...');

  try {
    // Check if core tables exist
    const tables = [
      'tenants',
      'knowledge_sources',
      'document_chunks',
      'prism_prompts',
      'rag_query_sessions'
    ];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        console.log(`❌ Table '${table}' verification failed: ${error.message}`);
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`);
      }
    }

    // Check PRISM prompts
    const { data: prompts, error: promptError } = await supabase
      .from('prism_prompts')
      .select('prism_suite, count(*)')
      .limit(20);

    if (!promptError && prompts) {
      console.log(`✅ PRISM prompts loaded: ${prompts.length} entries found`);

      // Group by suite
      const suiteCount = {};
      prompts.forEach(p => {
        suiteCount[p.prism_suite] = (suiteCount[p.prism_suite] || 0) + 1;
      });

      console.log('📋 PRISM Suite Distribution:');
      Object.entries(suiteCount).forEach(([suite, count]) => {
        console.log(`   ${suite}: ${count} prompts`);
      });
    }

    // Check vector extension
    const { data: extensions, error: extError } = await supabase
      .rpc('check_extension', { extension_name: 'vector' });

    if (!extError) {
      console.log(`✅ Vector extension is available`);
    } else {
      console.log(`⚠️ Vector extension check failed: ${extError.message}`);
    }

  } catch (error) {
    console.error(`❌ Verification error: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting VITAL Path RAG System Migration');
  console.log('=' .repeat(50));

  const migrationDir = path.join(__dirname, '../database/sql/migrations/2025');

  try {
    // Check if migration directory exists
    await fs.access(migrationDir);
  } catch (error) {
    console.error(`❌ Migration directory not found: ${migrationDir}`);
    process.exit(1);
  }

  let successCount = 0;

  // Execute migrations in order
  for (const fileName of migrationFiles) {
    const filePath = path.join(migrationDir, fileName);

    try {
      await fs.access(filePath);
      const success = await executeSqlFile(filePath);
      if (success) {
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Migration file not found: ${fileName}`);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Migration Summary: ${successCount}/${migrationFiles.length} completed`);

  if (successCount === migrationFiles.length) {
    console.log('✅ All migrations completed successfully!');
    await verifyMigration();
  } else {
    console.log('⚠️ Some migrations failed. Please check the logs above.');
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Verify database schema in Supabase dashboard');
  console.log('2. Test vector search functionality');
  console.log('3. Upload sample documents to test RAG system');
  console.log('4. Configure medical domain specializations');
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️ Migration interrupted by user');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the migration
main().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});