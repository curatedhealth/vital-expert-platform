/**
 * Direct insert script to test if we can create records in panels table
 * This bypasses the table creation issue by working with existing tables
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { 'X-Client-Info': 'vital-migration-script' } },
  db: { schema: 'public' }
});

async function main() {
  console.log('='.repeat(70));
  console.log('🔧 Testing Panel Save');
  console.log('='.repeat(70));
  console.log();

  // First, let's verify what tables exist
  console.log('📋 Checking available tables...');

  // Try to query user_panels
  const { data: userPanelsTest, error: userPanelsError } = await supabase
    .from('user_panels')
    .select('id')
    .limit(1);

  if (userPanelsError) {
    console.log('❌ user_panels table does NOT exist');
    console.log('   Error:', userPanelsError.message);
    console.log();
    console.log('⚠️  This confirms the table needs to be created manually.');
    console.log();
    console.log('📋 MANUAL STEPS REQUIRED:');
    console.log('1. Open: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql/new');
    console.log('2. Copy SQL from: create-user-panels-table.sql');
    console.log('3. Paste into SQL Editor');
    console.log('4. Click "Run"');
    console.log();
  } else {
    console.log('✅ user_panels table EXISTS!');
    console.log('   Records:', userPanelsTest?.length || 0);
    console.log();

    // Try to insert a test record
    console.log('🧪 Testing insert...');

    const testPanel = {
      user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
      name: 'Test Panel - Connection Check',
      description: 'Testing if user_panels save works',
      mode: 'sequential',
      framework: 'langgraph',
      selected_agents: ['test-agent-1'],
      workflow_definition: {
        nodes: [],
        edges: []
      }
    };

    const { data: inserted, error: insertError } = await supabase
      .from('user_panels')
      .insert(testPanel)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
    } else {
      console.log('✅ Insert successful!');
      console.log('   Panel ID:', inserted.id);
      console.log();
      console.log('✅ SAVE FUNCTIONALITY IS WORKING!');
      console.log('   Your panel save should now work in the UI.');
    }
  }

  console.log();
  console.log('='.repeat(70));
}

main().catch(console.error);
