#!/usr/bin/env node

/**
 * Deploy migrations to Supabase Cloud
 * This script applies the basic schema migration directly to the cloud database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_ROLE_KEY);
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});

async function executeSQL(sql) {
  try {
    console.log('📝 Executing SQL...');
    
    // Try using the REST API directly for DDL statements
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ SQL execution error:', errorText);
      return false;
    }
    
    console.log('✅ SQL executed successfully');
    return true;
  } catch (err) {
    console.error('❌ SQL execution failed:', err.message);
    return false;
  }
}

async function deployBasicSchema() {
  console.log('🚀 Deploying basic schema to Supabase Cloud...');
  console.log('📍 Project URL:', SUPABASE_URL);
  
  // Read the basic schema migration
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250101_basic_schema.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }
  
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  // Split the migration into individual statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`📊 Found ${statements.length} SQL statements to execute`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (statement.trim()) {
      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`);
      console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
      
      const success = await executeSQL(statement + ';');
      if (success) {
        successCount++;
      } else {
        errorCount++;
        // Continue with other statements even if one fails
      }
    }
  }
  
  console.log('\n📊 Deployment Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📈 Total: ${statements.length}`);
  
  if (errorCount === 0) {
    console.log('\n🎉 All migrations deployed successfully!');
  } else {
    console.log('\n⚠️  Some migrations failed. Check the logs above.');
  }
}

async function testConnection() {
  console.log('🔍 Testing connection to Supabase Cloud...');
  
  try {
    // Test with a simple query to auth.users
    const { data, error } = await supabase
      .from('auth.users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful');
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    return false;
  }
}

async function main() {
  console.log('🌟 VITAL Path - Supabase Cloud Deployment');
  console.log('==========================================\n');
  
  // Skip connection test and go straight to deployment
  console.log('🚀 Proceeding with deployment...');
  
  // Deploy the schema
  await deployBasicSchema();
}

// Run the deployment
main().catch(console.error);
