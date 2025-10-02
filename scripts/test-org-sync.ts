import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testOrgSync() {
  console.log('\n🔍 TESTING ORGANIZATIONAL DATA SYNC\n');
  console.log('='.repeat(80));

  // 1. Get business functions
  const { data: functions } = await supabase
    .from('business_functions')
    .select('*');

  console.log('\n📊 Business Functions from DB:');
  functions?.forEach(f => {
    console.log(`  ${f.name} -> ${f.id}`);
  });

  // 2. Get sample agents
  const { data: agents } = await supabase
    .from('agents')
    .select('name, display_name, business_function, department, role')
    .eq('status', 'active')
    .limit(5);

  console.log('\n📋 Sample Agents (with UUID business_function):');
  agents?.forEach(a => {
    const funcName = functions?.find(f => f.id === a.business_function)?.name;
    console.log(`\n  ${a.display_name}:`);
    console.log(`    business_function (UUID): ${a.business_function}`);
    console.log(`    business_function (Name): ${funcName}`);
    console.log(`    department: ${a.department}`);
    console.log(`    role: ${a.role}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ Test Complete!\n');
}

testOrgSync();
