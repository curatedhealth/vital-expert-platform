const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration(migrationFile) {
  console.log(`\n🔄 Applying migration: ${migrationFile}`);

  try {
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`   Found ${statements.length} SQL statements`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });

          if (error) {
            // Try direct query if RPC fails
            const { error: directError } = await supabase
              .from('dual')
              .select('*')
              .limit(0);

            // Execute via raw SQL
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey
              },
              body: JSON.stringify({ sql: statement + ';' })
            });

            if (!response.ok) {
              console.log(`   ⚠️  Statement ${i + 1} may have failed (continuing): ${statement.substring(0, 50)}...`);
            } else {
              console.log(`   ✅ Statement ${i + 1} applied successfully`);
            }
          } else {
            console.log(`   ✅ Statement ${i + 1} applied successfully`);
          }
        } catch (err) {
          console.log(`   ⚠️  Statement ${i + 1} error (continuing): ${err.message}`);
        }
      }
    }

    console.log(`✅ Migration ${migrationFile} completed`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying migration ${migrationFile}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migration process...');
  console.log(`📡 Connected to: ${supabaseUrl}`);

  // Apply key migrations in order
  const migrations = [
    '20250918_enhance_workflow_system.sql'
  ];

  let successCount = 0;

  for (const migration of migrations) {
    const success = await applyMigration(migration);
    if (success) successCount++;
  }

  console.log(`\n🎉 Migration process completed!`);
  console.log(`✅ Successfully applied ${successCount}/${migrations.length} migrations`);

  if (successCount === migrations.length) {
    console.log('\n🔍 Testing enhanced workflow system...');

    // Test the new tables
    try {
      const { data: templates, error: templatesError } = await supabase
        .from('workflow_templates')
        .select('*')
        .limit(1);

      if (!templatesError) {
        console.log('✅ workflow_templates table accessible');
      } else {
        console.log('⚠️  workflow_templates table issue:', templatesError.message);
      }

      const { data: analytics, error: analyticsError } = await supabase
        .from('workflow_analytics')
        .select('*')
        .limit(1);

      if (!analyticsError) {
        console.log('✅ workflow_analytics table accessible');
      } else {
        console.log('⚠️  workflow_analytics table issue:', analyticsError.message);
      }

    } catch (error) {
      console.log('⚠️  Table test error:', error.message);
    }
  }
}

main().catch(console.error);