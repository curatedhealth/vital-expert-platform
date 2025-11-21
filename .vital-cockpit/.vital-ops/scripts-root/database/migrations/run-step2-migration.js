#!/usr/bin/env node
/**
 * Run Step 2 Migration: Map Critical Domains
 * 
 * Usage:
 *   node scripts/run-step2-migration.js
 * 
 * Environment:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('');
  console.error('For local: Set SUPABASE_ANON_KEY from Supabase dashboard');
  console.error('For production: Set SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running Step 2 Migration: Map Critical Domains...\n');
  
  const migrationFile = path.join(__dirname, '../database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql');
  
  if (!fs.existsSync(migrationFile)) {
    console.error(`❌ Migration file not found: ${migrationFile}`);
    process.exit(1);
  }
  
  try {
    // Read SQL file
    const sql = fs.readFileSync(migrationFile, 'utf8');
    console.log(`📄 Loaded migration file: ${migrationFile}`);
    console.log(`   Size: ${sql.length} characters\n`);
    
    // Split SQL into statements (by semicolon, but keep DO blocks together)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📊 Executing ${statements.length} SQL statements...\n`);
    
    // Execute each statement
    let executed = 0;
    let errors = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty or comment-only statements
      if (!statement || statement.match(/^[\s--]*$/)) {
        continue;
      }
      
      // For DO blocks and complex statements, execute the whole SQL
      // Actually, better to execute the entire SQL file as one query
      if (i === 0) {
        try {
          // Execute entire SQL using RPC or raw query
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql_query: sql 
          });
          
          if (error) {
            // If exec_sql doesn't exist, try direct execution
            console.log('⚠️  exec_sql RPC not available, trying direct execution...');
            
            // Split and execute statements one by one
            const parts = sql.split(/;\s*(?=DO|CREATE|INSERT|UPDATE|ALTER|DROP|SELECT)/gi);
            
            for (const part of parts) {
              const cleanPart = part.trim();
              if (!cleanPart || cleanPart.startsWith('--')) continue;
              
              try {
                const { error: partError } = await supabase
                  .from('_migrations_temp')  // Dummy query to test connection
                  .select('1')
                  .limit(0);
                
                // Actually, Supabase JS client doesn't support raw SQL execution
                // We need to use the REST API or SQL Editor
                console.log('ℹ️  Supabase JS client cannot execute raw SQL');
                console.log('   Please use Supabase Dashboard SQL Editor instead');
                console.log('');
                console.log('📋 Steps:');
                console.log('   1. Open Supabase Dashboard → SQL Editor');
                console.log('   2. Copy the entire SQL from:');
                console.log(`      ${migrationFile}`);
                console.log('   3. Paste and Run');
                process.exit(1);
                
              } catch (err) {
                errors++;
              }
            }
          } else {
            console.log('✅ Migration executed successfully!');
            executed = statements.length;
          }
        } catch (err) {
          console.error(`❌ Error executing migration: ${err.message}`);
          errors++;
        }
        break; // Only try once
      }
    }
    
    if (executed > 0) {
      console.log(`\n✅ Migration completed: ${executed} statements executed`);
    }
    
    if (errors > 0) {
      console.log(`\n⚠️  Errors encountered: ${errors}`);
    }
    
  } catch (error) {
    console.error('❌ Error reading migration file:', error.message);
    process.exit(1);
  }
}

// Run migration
runMigration();

