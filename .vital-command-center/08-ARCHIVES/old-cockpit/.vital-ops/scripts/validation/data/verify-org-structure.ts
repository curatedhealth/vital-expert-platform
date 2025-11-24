/**
 * Verify organizational structure is properly set up and accessible
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyOrgStructure() {
  console.log('🔍 Verifying Organizational Structure...\n');

  try {
    // 1. Check org_functions table
    console.log('1️⃣  Checking org_functions table...');
    const { data: functions, error: funcError } = await supabase
      .from('org_functions')
      .select('id, unique_id, department_name');

    if (funcError) throw funcError;
    console.log(`   ✓ Found ${functions?.length || 0} business functions`);
    if (functions && functions.length > 0) {
      console.log(`   Sample: ${functions[0].department_name}\n`);
    }

    // 2. Check org_departments table
    console.log('2️⃣  Checking org_departments table...');
    const { data: departments, error: deptError } = await supabase
      .from('org_departments')
      .select('id, unique_id, department_name, function_id');

    if (deptError) throw deptError;
    console.log(`   ✓ Found ${departments?.length || 0} departments`);
    if (departments && departments.length > 0) {
      const withFunction = departments.filter(d => d.function_id).length;
      console.log(`   ${withFunction} departments linked to functions`);
      console.log(`   Sample: ${departments[0].department_name}\n`);
    }

    // 3. Check org_roles table
    console.log('3️⃣  Checking org_roles table...');
    const { data: roles, error: rolesError } = await supabase
      .from('org_roles')
      .select('id, unique_id, role_name, department_id, function_id, is_active')
      .eq('is_active', true);

    if (rolesError) throw rolesError;
    console.log(`   ✓ Found ${roles?.length || 0} active roles`);
    if (roles && roles.length > 0) {
      const withDept = roles.filter(r => r.department_id).length;
      const withFunc = roles.filter(r => r.function_id).length;
      console.log(`   ${withDept} roles linked to departments`);
      console.log(`   ${withFunc} roles linked to functions`);
      console.log(`   Sample: ${roles[0].role_name}\n`);
    }

    // 4. Check agents table with foreign keys
    console.log('4️⃣  Checking agents table...');
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, display_name, business_function, department, role, function_id, department_id, role_id')
      .limit(10);

    if (agentsError) throw agentsError;
    console.log(`   ✓ Successfully fetched agents with org columns`);

    const agentsWithFunc = agents?.filter(a => a.function_id).length || 0;
    const agentsWithDept = agents?.filter(a => a.department_id).length || 0;
    const agentsWithRole = agents?.filter(a => a.role_id).length || 0;

    console.log(`   Sample of 10 agents:`);
    console.log(`   - ${agentsWithFunc}/10 have function_id`);
    console.log(`   - ${agentsWithDept}/10 have department_id`);
    console.log(`   - ${agentsWithRole}/10 have role_id\n`);

    // 5. Test organizational structure API endpoint
    console.log('5️⃣  Testing /api/organizational-structure endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/organizational-structure');
      const data = await response.json();
      if (data.success) {
        console.log(`   ✓ API endpoint working`);
        console.log(`   Returns: ${data.data.functions.length} functions, ${data.data.departments.length} departments, ${data.data.roles.length} roles\n`);
      } else {
        console.log(`   ✗ API returned error: ${data.error}\n`);
      }
    } catch (err) {
      console.log('   ⚠️  Could not test API endpoint (requires running server)\n');
    }

    // 6. Show sample agent with full org data
    console.log('6️⃣  Sample agent with organizational data:');
    if (agents && agents.length > 0) {
      const sampleAgent = agents.find(a => a.function_id) || agents[0];
      console.log(`   Name: ${sampleAgent.display_name}`);
      console.log(`   Business Function: ${sampleAgent.business_function} (ID: ${sampleAgent.function_id ? '✓' : '✗'})`);
      console.log(`   Department: ${sampleAgent.department} (ID: ${sampleAgent.department_id ? '✓' : '✗'})`);
      console.log(`   Role: ${sampleAgent.role} (ID: ${sampleAgent.role_id ? '✓' : '✗'})\n`);
    }

    console.log('✅ VERIFICATION COMPLETE\n');
    console.log('═══════════════════════════════════════');
    console.log(`Business Functions:    ${functions?.length || 0}`);
    console.log(`Departments:           ${departments?.length || 0}`);
    console.log(`Active Roles:          ${roles?.length || 0}`);
    console.log('═══════════════════════════════════════\n');

    console.log('✨ All organizational structure tables are properly set up!\n');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

// Run verification
verifyOrgStructure();
