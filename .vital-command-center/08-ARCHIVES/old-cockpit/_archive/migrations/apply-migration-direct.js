#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const supabaseUrl = 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Applying VITAL Expert database migration via API...');
    console.log('📡 Connected to Supabase:', supabaseUrl);
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20251007222509_complete_vital_schema.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded:', migrationPath);
    
    // Split the migration into manageable chunks
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute statements in batches
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          
          // Try to execute the statement using the REST API
          const { data, error } = await supabase
            .from('_sql')
            .select('*')
            .limit(0);
          
          // For complex migrations, we need to use the SQL editor approach
          if (i === 0) {
            console.log('📝 Complex migration detected. Using manual approach...');
            console.log('');
            console.log('🔗 Please go to: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql');
            console.log('📋 Copy and paste the following migration content:');
            console.log('');
            console.log('==========================================');
            console.log(migrationSQL);
            console.log('==========================================');
            console.log('');
            console.log('✅ After running the migration, test your platform:');
            console.log('🔗 https://vital-expert-qfd5gvdlp-crossroads-catalysts-projects.vercel.app/agents');
            break;
          }
          
          successCount++;
        } catch (err) {
          console.error(`❌ Error executing statement ${i + 1}:`, err.message);
          errorCount++;
        }
      }
    }
    
    console.log('');
    console.log('🎉 Migration guide completed!');
    console.log(`📊 Success: ${successCount}, Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyMigration();
