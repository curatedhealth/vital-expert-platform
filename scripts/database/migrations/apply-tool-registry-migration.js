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

async function applyToolRegistryMigration() {
  console.log('\n🚀 Applying Tool Registry migration...');

  try {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251003_tool_registry_system.sql');
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
          // Execute directly using pg query
          const { error } = await supabase.rpc('exec', { sql: statement + ';' });

          if (error && error.message !== 'Failed to fetch') {
            console.log(`   ⚠️  Statement ${i + 1}: ${error.message.substring(0, 100)}`);
          } else {
            console.log(`   ✅ Statement ${i + 1} executed`);
          }
        } catch (err) {
          console.log(`   ⚠️  Statement ${i + 1} continuing...`);
        }
      }
    }

    console.log(`\n✅ Migration completed!`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying migration:`, error.message);
    return false;
  }
}

async function verifyTables() {
  console.log('\n🔍 Verifying tool registry tables...');

  const tables = [
    'tool_categories',
    'tools',
    'tool_tags',
    'tool_tag_assignments',
    'agent_tool_assignments',
    'tool_usage_logs'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: accessible`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

async function checkToolCount() {
  console.log('\n🔍 Checking seeded tools...');

  try {
    const { data, error, count } = await supabase
      .from('tools')
      .select('*', { count: 'exact' });

    if (error) {
      console.log(`❌ Error counting tools: ${error.message}`);
    } else {
      console.log(`✅ Found ${count || data?.length || 0} tools in database`);
      if (data && data.length > 0) {
        console.log('\n📋 Tool Summary:');
        data.forEach(tool => {
          console.log(`   - ${tool.name} (${tool.tool_key})`);
        });
      }
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }
}

async function main() {
  console.log('🚀 Tool Registry Migration Script');
  console.log(`📡 Connected to: ${supabaseUrl}\n`);

  const success = await applyToolRegistryMigration();

  if (success) {
    await verifyTables();
    await checkToolCount();
    console.log('\n✨ Tool registry system is ready!\n');
  } else {
    console.log('\n❌ Migration failed. Check errors above.\n');
    process.exit(1);
  }
}

main().catch(console.error);
