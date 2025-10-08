#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('Please set it with: export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Applying VITAL Expert database migration...');
    console.log('📡 Connected to Supabase:', supabaseUrl);
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20251007222509_complete_vital_schema.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded:', migrationPath);
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          
          const { data, error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });
          
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
            // Continue with next statement
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`❌ Error executing statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('🎉 Migration completed!');
    console.log('🔗 Test your platform: https://vital-expert-qfd5gvdlp-crossroads-catalysts-projects.vercel.app/agents');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Check if we have the required environment variable
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('');
  console.error('To get your service role key:');
  console.error('1. Go to: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/settings/api');
  console.error('2. Copy the "service_role" key (starts with "eyJ...")');
  console.error('3. Run: export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  console.error('4. Then run this script again');
  process.exit(1);
}

applyMigration();
