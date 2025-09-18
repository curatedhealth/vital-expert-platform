const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testJTBDTables() {
  console.log('🧪 Testing JTBD tables...');

  try {
    // Test jtbd_library table
    console.log('\n1. Testing jtbd_library table...');
    const { data: jtbdData, error: jtbdError } = await supabase
      .from('jtbd_library')
      .select('id, title, function')
      .limit(5);

    if (jtbdError) {
      console.log('❌ jtbd_library table error:', jtbdError.message);
      if (jtbdError.message.includes('does not exist')) {
        console.log('\n📋 SETUP REQUIRED:');
        console.log('🔗 Go to: https://app.supabase.com/project/xazinxsiglqokwfmogyk/sql');
        console.log('📄 Run the schema: supabase/migrations/001_jtbd_core_schema.sql');
        console.log('📄 Run the data: supabase/migrations/002_sample_jtbd_data.sql');
        return false;
      }
    } else {
      console.log(`✅ jtbd_library table working! Found ${jtbdData?.length || 0} records`);
      if (jtbdData && jtbdData.length > 0) {
        console.log('   Sample records:');
        jtbdData.forEach(item =>
          console.log(`   - ${item.id}: ${item.title} (${item.function})`)
        );
      }
    }

    // Test API endpoint
    console.log('\n2. Testing JTBD API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/jtbd/catalog');
      if (response.ok) {
        const apiData = await response.json();
        console.log('✅ API endpoint working!');
        console.log(`   Found ${apiData.data?.length || 0} JTBDs via API`);
      } else {
        console.log('⚠️  API endpoint returned:', response.status, response.statusText);
      }
    } catch (apiError) {
      console.log('⚠️  API test failed (app may not be running):', apiError.message);
    }

    return true;

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    return false;
  }
}

async function main() {
  const success = await testJTBDTables();

  if (success) {
    console.log('\n🎉 JTBD system is ready!');
    console.log('🌐 You can now access: http://localhost:3000/dashboard/jtbd');
  } else {
    console.log('\n⚠️  JTBD system needs setup. Follow the instructions above.');
  }
}

main();