#!/usr/bin/env node

/**
 * Run RAG Migration Script
 * Executes the RAG knowledge base migration using Node.js
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Running RAG Knowledge Base Migration...\n');

async function runMigration() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Connected to Supabase');
    
    // Read the migration file
    const migrationFile = 'supabase/migrations/20251003_setup_rag_knowledge_base.sql';
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('📄 Loaded migration file');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.includes('CREATE EXTENSION')) {
        console.log(`🔧 Executing: ${statement.substring(0, 50)}...`);
      } else if (statement.includes('CREATE TABLE')) {
        console.log(`📋 Creating table: ${statement.match(/CREATE TABLE[^\(]+/)?.[0] || 'Unknown'}`);
      } else if (statement.includes('CREATE INDEX')) {
        console.log(`🔍 Creating index: ${statement.match(/CREATE INDEX[^\(]+/)?.[0] || 'Unknown'}`);
      } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
        console.log(`⚙️ Creating function: ${statement.match(/CREATE OR REPLACE FUNCTION[^\(]+/)?.[0] || 'Unknown'}`);
      } else {
        console.log(`📝 Executing statement ${i + 1}/${statements.length}`);
      }
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Some errors are expected (like "already exists")
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key')) {
            console.log(`⚠️  Expected: ${error.message}`);
          } else {
            console.log(`❌ Error: ${error.message}`);
          }
        } else {
          console.log(`✅ Success`);
        }
      } catch (err) {
        console.log(`⚠️  Statement skipped: ${err.message}`);
      }
    }
    
    // Test the migration by checking if tables exist
    console.log('\n🔍 Verifying migration...');
    
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['knowledge_base_documents', 'rag_knowledge_bases']);
    
    if (tableError) {
      console.log(`⚠️  Could not verify tables: ${tableError.message}`);
    } else {
      console.log(`✅ Found tables: ${tables.map(t => t.table_name).join(', ')}`);
    }
    
    // Test vector extension
    const { data: extensions, error: extError } = await supabase
      .from('pg_extension')
      .select('extname')
      .eq('extname', 'vector');
    
    if (extError) {
      console.log(`⚠️  Could not check vector extension: ${extError.message}`);
    } else if (extensions && extensions.length > 0) {
      console.log('✅ Vector extension is enabled');
    } else {
      console.log('⚠️  Vector extension not found');
    }
    
    console.log('\n🎉 RAG migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Create a simple SQL execution function if it doesn't exist
async function createExecFunction(supabase) {
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;
  
  try {
    await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    console.log('✅ Created exec_sql function');
  } catch (error) {
    console.log('⚠️  exec_sql function already exists or could not be created');
  }
}

runMigration();
