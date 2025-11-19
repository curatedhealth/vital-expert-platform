/**
 * Analyze organizational structure in database
 * Shows business_functions, departments, and roles tables
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function analyzeStructure() {
  console.log('🔍 Analyzing Organizational Structure\n');

  // Check business_functions table
  console.log('📊 BUSINESS FUNCTIONS:');
  console.log('='.repeat(80));
  const { data: functions, error: funcError } = await supabase
    .from('business_functions')
    .select('*')
    .order('name');

  if (funcError) {
    console.error('❌ Error fetching business functions:', funcError);
  } else if (functions && functions.length > 0) {
    functions.forEach((func: any, i: number) => {
      console.log(`${i + 1}. ${func.name}`);
      console.log(`   ID: ${func.id}`);
      console.log(`   Display: ${func.display_name || 'N/A'}`);
      console.log(`   Description: ${func.description || 'N/A'}`);
      console.log('');
    });
    console.log(`Total: ${functions.length} business functions\n`);
  } else {
    console.log('⚠️  No business functions found\n');
  }

  // Check departments table
  console.log('🏢 DEPARTMENTS:');
  console.log('='.repeat(80));
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('*, business_function:business_functions(name)')
    .order('name');

  if (deptError) {
    console.error('❌ Error fetching departments:', deptError);
  } else if (departments && departments.length > 0) {
    departments.forEach((dept: any, i: number) => {
      console.log(`${i + 1}. ${dept.name}`);
      console.log(`   ID: ${dept.id}`);
      console.log(`   Function: ${dept.business_function?.name || 'N/A'}`);
      console.log(`   Description: ${dept.description || 'N/A'}`);
      console.log('');
    });
    console.log(`Total: ${departments.length} departments\n`);
  } else {
    console.log('⚠️  No departments found\n');
  }

  // Check roles table
  console.log('👤 ROLES:');
  console.log('='.repeat(80));
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*, department:departments(name)')
    .order('name')
    .limit(50);

  if (rolesError) {
    console.error('❌ Error fetching roles:', rolesError);
  } else if (roles && roles.length > 0) {
    roles.forEach((role: any, i: number) => {
      console.log(`${i + 1}. ${role.name}`);
      console.log(`   ID: ${role.id}`);
      console.log(`   Department: ${role.department?.name || 'N/A'}`);
      console.log(`   Level: ${role.level || 'N/A'}`);
      console.log('');
    });
    console.log(`Total: ${roles.length} roles (showing first 50)\n`);
  } else {
    console.log('⚠️  No roles found\n');
  }

  // Check current agent assignments
  console.log('🤖 CURRENT AGENT ASSIGNMENTS:');
  console.log('='.repeat(80));
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('name, display_name, business_function, role, tier')
    .eq('status', 'active')
    .limit(10);

  if (agentsError) {
    console.error('❌ Error fetching agents:', agentsError);
  } else if (agents && agents.length > 0) {
    console.log('Sample agents (first 10):');
    agents.forEach((agent: any, i: number) => {
      console.log(`${i + 1}. ${agent.display_name}`);
      console.log(`   business_function: ${agent.business_function || 'NULL'}`);
      console.log(`   role: ${agent.role || 'NULL'}`);
      console.log(`   tier: ${agent.tier}`);
      console.log('');
    });
  }

  // Count agents by business_function
  const { data: functionCounts, error: countError } = await supabase
    .from('agents')
    .select('business_function')
    .eq('status', 'active');

  if (!countError && functionCounts) {
    const counts: Record<string, number> = {};
    functionCounts.forEach((agent: any) => {
      const func = agent.business_function || 'NULL';
      counts[func] = (counts[func] || 0) + 1;
    });

    console.log('\n📈 Agents by business_function:');
    console.log('='.repeat(80));
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([func, count]) => {
        console.log(`${func.padEnd(40)} ${count} agents`);
      });
  }
}

analyzeStructure()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
