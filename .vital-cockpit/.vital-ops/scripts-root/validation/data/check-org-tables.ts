/**
 * Check organizational tables structure
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTables() {
  console.log('🔍 Checking Organizational Tables\n');

  // Check org_departments
  console.log('🏢 ORG_DEPARTMENTS:');
  console.log('='.repeat(80));
  const { data: depts, error: deptError } = await supabase
    .from('org_departments')
    .select('*')
    .order('name')
    .limit(20);

  if (deptError) {
    console.error('❌ Error:', deptError.message);
  } else if (depts) {
    console.log(`Found ${depts.length} departments:`);
    depts.forEach((dept: any, i: number) => {
      console.log(`${i + 1}. ${dept.name} (ID: ${dept.id})`);
      console.log(`   Business Function ID: ${dept.business_function_id || 'NULL'}`);
    });
  }
  console.log('');

  // Check org_roles
  console.log('👤 ORG_ROLES:');
  console.log('='.repeat(80));
  const { data: roles, error: rolesError } = await supabase
    .from('org_roles')
    .select('*')
    .order('name')
    .limit(20);

  if (rolesError) {
    console.error('❌ Error:', rolesError.message);
  } else if (roles) {
    console.log(`Found ${roles.length} roles:`);
    roles.forEach((role: any, i: number) => {
      console.log(`${i + 1}. ${role.name} (ID: ${role.id})`);
      console.log(`   Department ID: ${role.department_id || 'NULL'}`);
      console.log(`   Level: ${role.level || 'N/A'}`);
    });
  }
  console.log('');

  // Check agents table schema for business_function and role columns
  console.log('🤖 AGENTS TABLE - ORGANIZATIONAL COLUMNS:');
  console.log('='.repeat(80));
  const { data: agentSample, error: agentError } = await supabase
    .from('agents')
    .select('id, name, display_name, business_function, role, department')
    .eq('status', 'active')
    .limit(5);

  if (agentError) {
    console.error('❌ Error:', agentError.message);
  } else if (agentSample) {
    console.log('Sample agents showing org columns:');
    agentSample.forEach((agent: any, i: number) => {
      console.log(`\n${i + 1}. ${agent.display_name}`);
      console.log(`   business_function: ${JSON.stringify(agent.business_function)}`);
      console.log(`   department: ${JSON.stringify(agent.department)}`);
      console.log(`   role: ${JSON.stringify(agent.role)}`);
    });
  }
  console.log('\n');

  // Count unique business_function values
  const { data: allAgents } = await supabase
    .from('agents')
    .select('business_function')
    .eq('status', 'active');

  if (allAgents) {
    const uniqueFunctions = new Set(allAgents.map((a: any) => a.business_function).filter(Boolean));
    console.log(`\n📊 Unique business_function values in agents: ${uniqueFunctions.size}`);
    console.log('Values:', Array.from(uniqueFunctions).sort().join(', '));
  }
}

checkTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
