const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? '✅ Present' : '❌ Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n🧪 Testing database access...');
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.log('Auth test result:', error.message);
    } else {
      console.log('✅ Connection successful');
    }

    // Test direct table access
    console.log('\n🔍 Checking available tables...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_schema_info')
      .single();

    if (tablesError) {
      console.log('Tables check failed:', tablesError.message);
    } else {
      console.log('✅ Database accessible');
    }

  } catch (error) {
    console.error('💥 Connection test failed:', error.message);
  }
}

testConnection();