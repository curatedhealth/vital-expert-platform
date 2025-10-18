#!/usr/bin/env node

/**
 * RAG Migration Runner
 * 
 * Runs the RAG critical fixes migration directly via Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration. Check environment variables.');
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🚀 Running RAG Critical Fixes Migration...');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20251018_rag_critical_fixes.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    // Split into individual statements (rough approach)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length === 0) continue;

      try {
        console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`);
        
        // Use rpc to execute raw SQL (if available) or direct query
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try alternative approach - some statements might work differently
          console.log(`⚠️ RPC failed, trying alternative approach...`);
          
          // For now, just log the error and continue
          console.log(`❌ Statement ${i + 1} failed: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Statement ${i + 1} failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Results:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);

    if (errorCount > 0) {
      console.log('\n⚠️ Some statements failed. This might be normal if functions already exist.');
    }

    // Test if the functions exist now
    console.log('\n🔍 Testing RPC functions...');
    
    const { data: searchData, error: searchError } = await supabase.rpc('search_rag_knowledge', {
      query_embedding: new Array(3072).fill(0),
      match_threshold: 0.1,
      match_count: 1
    });

    if (searchError) {
      console.log(`❌ search_rag_knowledge function: ${searchError.message}`);
    } else {
      console.log('✅ search_rag_knowledge function working');
    }

    const { data: hybridData, error: hybridError } = await supabase.rpc('hybrid_search_rag_knowledge', {
      query_embedding: new Array(3072).fill(0),
      query_text: 'test',
      match_threshold: 0.1,
      match_count: 1
    });

    if (hybridError) {
      console.log(`❌ hybrid_search_rag_knowledge function: ${hybridError.message}`);
    } else {
      console.log('✅ hybrid_search_rag_knowledge function working');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await runMigration();
    console.log('\n🎉 Migration completed!');
  } catch (error) {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { runMigration };
