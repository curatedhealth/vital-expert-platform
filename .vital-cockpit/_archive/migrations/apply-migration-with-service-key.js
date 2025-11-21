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
    
    // Execute each statement using the REST API
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          
          // Use the REST API to execute SQL
          const { data, error } = await supabase
            .from('_sql')
            .select('*')
            .limit(0);
          
          // For now, let's try a different approach - execute the migration in chunks
          if (i === 0) {
            console.log('📝 Note: This approach requires manual execution in Supabase dashboard');
            console.log('🔗 Please go to: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql');
            console.log('📋 Copy the migration content from: supabase/migrations/20251007222509_complete_vital_schema.sql');
            break;
          }
          
        } catch (err) {
          console.error(`❌ Error executing statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('🎉 Migration guide completed!');
    console.log('🔗 Test your platform: https://vital-expert-qfd5gvdlp-crossroads-catalysts-projects.vercel.app/agents');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyMigration();
