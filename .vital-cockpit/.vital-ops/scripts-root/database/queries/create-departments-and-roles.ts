/**
 * Create Departments and Roles, then Assign to Agents
 * - Create comprehensive department list
 * - Create role hierarchy
 * - Assign department and role to each agent based on function and tier
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Pharmaceutical departments
const DEPARTMENTS = [
  { name: 'Regulatory Affairs', code: 'REG', description: 'Regulatory submissions and compliance' },
  { name: 'Clinical Development', code: 'CLIN', description: 'Clinical trial design and operations' },
  { name: 'Quality Assurance', code: 'QA', description: 'Quality systems and GMP compliance' },
  { name: 'Pharmacovigilance', code: 'PV', description: 'Drug safety and surveillance' },
  { name: 'Medical Affairs', code: 'MA', description: 'Medical writing and publications' },
  { name: 'Market Access', code: 'MARK', description: 'Payer relations and reimbursement' },
  { name: 'Manufacturing', code: 'MFG', description: 'Production and process development' },
  { name: 'Research & Development', code: 'RND', description: 'Drug discovery and development' },
  { name: 'Commercial Operations', code: 'COM', description: 'Sales and marketing' },
  { name: 'Supply Chain', code: 'SC', description: 'Logistics and distribution' },
  { name: 'Data Science', code: 'DS', description: 'Analytics and AI/ML' },
  { name: 'Compliance & Ethics', code: 'COMP', description: 'Legal and regulatory compliance' },
];

// Role hierarchy
const ROLES = [
  { name: 'Specialist', level: 1, description: 'Individual contributor, foundational tasks' },
  { name: 'Senior Specialist', level: 2, description: 'Experienced specialist, complex tasks' },
  { name: 'Expert', level: 3, description: 'Subject matter expert, strategic guidance' },
  { name: 'Lead', level: 2, description: 'Team lead, coordination role' },
  { name: 'Manager', level: 3, description: 'People manager, department oversight' },
  { name: 'Director', level: 4, description: 'Senior leadership, strategic direction' },
  { name: 'Advisor', level: 2, description: 'Advisory role, consultation' },
  { name: 'Consultant', level: 2, description: 'Independent expert, project-based' },
  { name: 'Coordinator', level: 1, description: 'Coordination and logistics' },
  { name: 'Analyst', level: 1, description: 'Analysis and reporting' },
  { name: 'Strategist', level: 3, description: 'Strategic planning and execution' },
  { name: 'Architect', level: 3, description: 'System design and architecture' },
];

async function createDepartmentsAndRoles() {
  console.log('🔄 Creating Departments and Roles\n');

  // Check if tables have department/role columns
  const { data: sampleAgent } = await supabase
    .from('agents')
    .select('*')
    .limit(1)
    .single();

  const hasOrgColumns = sampleAgent && ('department' in sampleAgent || 'role' in sampleAgent);

  console.log('='.repeat(80));
  console.log('STEP 1: CREATING DEPARTMENTS');
  console.log('='.repeat(80) + '\n');

  const createdDepartments = new Map<string, string>();

  for (const dept of DEPARTMENTS) {
    const { data, error } = await supabase
      .from('org_departments')
      .insert([{
        name: dept.name,
        code: dept.code,
        description: dept.description,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('org_departments')
        .select('*')
        .eq('name', dept.name)
        .single();

      if (existing) {
        createdDepartments.set(dept.name, existing.id);
        console.log(`   ✅ ${dept.name} (already exists)`);
      } else {
        console.log(`   ❌ Failed to create ${dept.name}: ${error.message}`);
      }
    } else if (data) {
      createdDepartments.set(dept.name, data.id);
      console.log(`   ✅ Created ${dept.name}`);
    }
  }

  console.log(`\n📊 Departments created/found: ${createdDepartments.size}\n`);

  console.log('='.repeat(80));
  console.log('STEP 2: CREATING ROLES');
  console.log('='.repeat(80) + '\n');

  const createdRoles = new Map<string, string>();

  for (const role of ROLES) {
    const { data, error } = await supabase
      .from('org_roles')
      .insert([{
        name: role.name,
        level: role.level,
        description: role.description,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('org_roles')
        .select('*')
        .eq('name', role.name)
        .single();

      if (existing) {
        createdRoles.set(role.name, existing.id);
        console.log(`   ✅ ${role.name} (already exists)`);
      } else {
        console.log(`   ❌ Failed to create ${role.name}: ${error.message}`);
      }
    } else if (data) {
      createdRoles.set(role.name, data.id);
      console.log(`   ✅ Created ${role.name}`);
    }
  }

  console.log(`\n📊 Roles created/found: ${createdRoles.size}\n`);

  console.log('='.repeat(80));
  console.log('STEP 3: ASSIGNING DEPARTMENTS AND ROLES TO AGENTS');
  console.log('='.repeat(80) + '\n');

  // Get all agents with their business functions
  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, display_name, tier, business_function')
    .eq('status', 'active');

  if (!agents || agents.length === 0) {
    console.error('❌ No agents found');
    return;
  }

  // Get business functions
  const { data: businessFunctions } = await supabase
    .from('business_functions')
    .select('*');

  const funcIdToName: Record<string, string> = {};
  businessFunctions?.forEach(f => {
    funcIdToName[f.id] = f.name;
  });

  // Department mapping from business function
  const deptMapping: Record<string, string> = {
    'regulatory_affairs': 'Regulatory Affairs',
    'clinical_development': 'Clinical Development',
    'quality_assurance': 'Quality Assurance',
    'safety_pharmacovigilance': 'Pharmacovigilance',
    'medical_writing': 'Medical Affairs',
    'market_access': 'Market Access',
  };

  // Role extraction from display name
  const extractRole = (displayName: string): string => {
    const rolePriority = ['Director', 'Manager', 'Strategist', 'Architect', 'Lead', 'Expert', 'Advisor', 'Consultant', 'Senior Specialist', 'Specialist', 'Coordinator', 'Analyst'];

    for (const role of rolePriority) {
      if (displayName.includes(role)) {
        return role;
      }
    }

    // Default based on tier
    return 'Specialist';
  };

  let departmentsAssigned = 0;
  let rolesAssigned = 0;

  for (const agent of agents) {
    const funcName = funcIdToName[agent.business_function];
    const deptName = deptMapping[funcName] || 'Clinical Development';
    const deptId = createdDepartments.get(deptName);

    const roleName = extractRole(agent.display_name);
    const roleId = createdRoles.get(roleName);

    if (hasOrgColumns) {
      const updates: any = {};
      if (deptId) {
        updates.department = deptId;
        departmentsAssigned++;
      }
      if (roleId) {
        updates.role = roleId;
        rolesAssigned++;
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('agents')
          .update(updates)
          .eq('id', agent.id);
      }
    } else {
      console.log(`   ⚠️  Agent schema doesn't have department/role columns`);
      console.log(`   Suggested: ${agent.display_name} → ${deptName}, ${roleName}`);
    }
  }

  if (hasOrgColumns) {
    console.log(`✅ Departments assigned: ${departmentsAssigned} agents`);
    console.log(`✅ Roles assigned: ${rolesAssigned} agents\n`);
  } else {
    console.log(`\n⚠️  Department and Role columns not found in agents table`);
    console.log(`   Created ${createdDepartments.size} departments and ${createdRoles.size} roles`);
    console.log(`   To use them, add 'department' and 'role' UUID columns to agents table\n`);
  }

  return {
    departmentsCreated: createdDepartments.size,
    rolesCreated: createdRoles.size,
    departmentsAssigned,
    rolesAssigned,
    hasOrgColumns
  };
}

createDepartmentsAndRoles()
  .then((result) => {
    if (result) {
      console.log('✅ Departments and roles setup complete!\n');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
