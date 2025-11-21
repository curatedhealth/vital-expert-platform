import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mapping of business functions to departments
const functionToDepartment: Record<string, string> = {
  'regulatory_affairs': 'Global Regulatory',
  'clinical_development': 'Clinical Development',
  'quality_assurance': 'Quality Assurance',
  'safety_pharmacovigilance': 'Drug Safety',
  'medical_writing': 'Medical Information',
  'market_access': 'Market Access',
  'manufacturing': 'Quality Assurance',
  'medical-affairs': 'Medical Science Liaison'
};

async function fixMissingOrgData() {
  console.log('\n🔧 FIXING AGENTS WITH MISSING ORGANIZATIONAL DATA\n');
  console.log('='.repeat(80));

  // Find agents missing department or role
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, display_name, business_function, department, role')
    .eq('status', 'active')
    .or('department.is.null,role.is.null');

  if (error || !agents) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`\n📋 Found ${agents.length} agents with missing data:`);

  for (const agent of agents) {
    console.log(`\n📌 ${agent.display_name}`);
    console.log(`   Function: ${agent.business_function}`);
    console.log(`   Department: ${agent.department || '❌ MISSING'}`);
    console.log(`   Role: ${agent.role || '❌ MISSING'}`);

    const updates: any = {};

    // Fix missing department
    if (!agent.department && agent.business_function) {
      const department = functionToDepartment[agent.business_function];
      if (department) {
        updates.department = department;
        console.log(`   ✅ Setting department: ${department}`);
      }
    }

    // Fix missing role - extract from display_name or default to 'specialist'
    if (!agent.role) {
      const rolePatterns = [
        'Director', 'Manager', 'Lead', 'Expert', 'Specialist',
        'Coordinator', 'Analyst', 'Strategist', 'Advisor', 'Designer',
        'Developer', 'Scientist', 'Reviewer', 'Writer', 'Monitor',
        'Planner', 'Architect', 'Consultant', 'Liaison', 'Engineer'
      ];

      let roleName = 'specialist'; // default
      for (const pattern of rolePatterns) {
        if (agent.display_name.toLowerCase().includes(pattern.toLowerCase())) {
          roleName = pattern.toLowerCase();
          break;
        }
      }

      updates.role = roleName;
      console.log(`   ✅ Setting role: ${roleName}`);
    }

    // Update the agent
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', agent.id);

      if (updateError) {
        console.error(`   ❌ Error updating: ${updateError.message}`);
      } else {
        console.log(`   ✅ Updated successfully`);
      }
    }
  }

  // Verify the fix
  const { data: verifyAgents } = await supabase
    .from('agents')
    .select('business_function, department, role')
    .eq('status', 'active');

  const missingDept = verifyAgents?.filter(a => !a.department).length || 0;
  const missingRole = verifyAgents?.filter(a => !a.role).length || 0;

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 VERIFICATION:');
  console.log(`  ✅ Agents with department: ${(verifyAgents?.length || 0) - missingDept}/${verifyAgents?.length || 0}`);
  console.log(`  ✅ Agents with role: ${(verifyAgents?.length || 0) - missingRole}/${verifyAgents?.length || 0}`);
  console.log(`  ❌ Still missing department: ${missingDept}`);
  console.log(`  ❌ Still missing role: ${missingRole}`);

  console.log('\n' + '='.repeat(80));
  console.log('✅ Fix Complete!\n');
}

fixMissingOrgData();
