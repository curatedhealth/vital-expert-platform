import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAgents() {
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, display_name, business_function, department, role, status')
    .eq('status', 'active')
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📊 AGENT ORGANIZATIONAL DATA VERIFICATION\n');
  console.log('='.repeat(80));

  const withFunction = agents.filter(a => a.business_function);
  const withDepartment = agents.filter(a => a.department);
  const withRole = agents.filter(a => a.role);

  console.log(`\nTotal Active Agents: ${agents.length}`);
  console.log(`✅ With Business Function: ${withFunction.length}/${agents.length} (${Math.round(withFunction.length/agents.length*100)}%)`);
  console.log(`✅ With Department: ${withDepartment.length}/${agents.length} (${Math.round(withDepartment.length/agents.length*100)}%)`);
  console.log(`✅ With Role: ${withRole.length}/${agents.length} (${Math.round(withRole.length/agents.length*100)}%)`);

  // Check for any agents missing data
  const missingFunction = agents.filter(a => !a.business_function);
  const missingDepartment = agents.filter(a => !a.department);
  const missingRole = agents.filter(a => !a.role);

  if (missingFunction.length > 0) {
    console.log(`\n⚠️  Agents missing Business Function: ${missingFunction.length}`);
    console.log('First 5:', missingFunction.slice(0, 5).map(a => a.display_name || a.name).join(', '));
  }

  if (missingDepartment.length > 0) {
    console.log(`\n⚠️  Agents missing Department: ${missingDepartment.length}`);
    console.log('First 5:', missingDepartment.slice(0, 5).map(a => a.display_name || a.name).join(', '));
  }

  if (missingRole.length > 0) {
    console.log(`\n⚠️  Agents missing Role: ${missingRole.length}`);
    console.log('First 5:', missingRole.slice(0, 5).map(a => a.display_name || a.name).join(', '));
  }

  // Get unique values
  const uniqueFunctions = [...new Set(withFunction.map(a => a.business_function))].sort();
  const uniqueDepartments = [...new Set(withDepartment.map(a => a.department))].sort();
  const uniqueRoles = [...new Set(withRole.map(a => a.role))].sort();

  console.log(`\n📋 ORGANIZATIONAL STRUCTURE BREAKDOWN`);
  console.log('='.repeat(80));

  console.log(`\n🏢 Business Functions (${uniqueFunctions.length}):`);
  uniqueFunctions.forEach(func => {
    const count = agents.filter(a => a.business_function === func).length;
    console.log(`   • ${func}: ${count} agents`);
  });

  console.log(`\n🏛️  Departments (${uniqueDepartments.length}):`);
  uniqueDepartments.forEach(dept => {
    const count = agents.filter(a => a.department === dept).length;
    console.log(`   • ${dept}: ${count} agents`);
  });

  console.log(`\n👔 Roles (${uniqueRoles.length}):`);
  uniqueRoles.forEach(role => {
    const count = agents.filter(a => a.role === role).length;
    console.log(`   • ${role}: ${count} agents`);
  });

  // Sample of complete agents
  const completeAgents = agents.filter(a => a.business_function && a.department && a.role);
  console.log(`\n✨ SAMPLE OF COMPLETE AGENTS (First 10):`);
  console.log('='.repeat(80));
  completeAgents.slice(0, 10).forEach(agent => {
    console.log(`\n📌 ${agent.display_name || agent.name}`);
    console.log(`   Function: ${agent.business_function}`);
    console.log(`   Department: ${agent.department}`);
    console.log(`   Role: ${agent.role}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ Verification Complete!\n');
}

checkAgents();
