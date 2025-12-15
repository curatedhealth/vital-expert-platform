const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/digital-health-startup/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment variables:');
console.log('- SUPABASE_URL:', supabaseUrl ? 'SET (' + supabaseUrl.substring(0, 30) + '...)' : 'NOT SET');
console.log('- SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET (length: ' + (supabaseServiceKey || '').length + ')' : 'NOT SET');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('\n🔄 Testing query to user_agents table...\n');

supabase
  .from('user_agents')
  .select('*, agents(*)')
  .eq('user_id', '1d85f8b8-dcf0-4cdb-b697-0fcf174472eb')
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Query failed:');
      console.error('   Code:', error.code);
      console.error('   Message:', error.message);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
      process.exit(1);
    }
    console.log('✅ Query succeeded!');
    console.log('📊 Results:', JSON.stringify(data, null, 2));
    console.log('📊 Count:', data.length);
  })
  .catch(err => {
    console.error('❌ Exception:', err);
    process.exit(1);
  });
