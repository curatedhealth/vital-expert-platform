/**
 * Setup Departments and Roles - Simple Version
 * Works with existing table schema
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEPARTMENTS = [
  'Regulatory Affairs',
  'Clinical Development',
  'Quality Assurance',
  'Pharmacovigilance',
  'Medical Affairs',
  'Market Access',
  'Manufacturing',
  'Research & Development',
  'Commercial Operations',
  'Supply Chain',
  'Data Science',
  'Compliance & Ethics',
];

const ROLES = [
  'Specialist',
  'Senior Specialist',
  'Expert',
  'Lead',
  'Manager',
  'Director',
  'Advisor',
  'Consultant',
  'Coordinator',
  'Analyst',
  'Strategist',
  'Architect',
];

async function setupDepartmentsRoles() {
  console.log('🔄 Setting up Departments and Roles\n');

  // Check actual schema
  console.log('='.repeat(80));
  console.log('STEP 1: CHECKING EXISTING TABLES');
  console.log('='.repeat(80) + '\n');

  const { data: existingDepts } = await supabase
    .from('org_departments')
    .select('*')
    .limit(1);

  const { data: existingRoles } = await supabase
    .from('org_roles')
    .select('*')
    .limit(1);

  console.log('Sample department record:', existingDepts?.[0] || 'empty');
  console.log('Sample role record:', existingRoles?.[0] || 'empty');

  console.log('\n' + '='.repeat(80));
  console.log('STEP 2: CREATING DEPARTMENTS');
  console.log('='.repeat(80) + '\n');

  const createdDepts = new Map<string, string>();

  for (const deptName of DEPARTMENTS) {
    // Try simple insert with just name
    const { data, error } = await supabase
      .from('org_departments')
      .insert([{ name: deptName }])
      .select()
      .single();

    if (error) {
      // Check if exists
      const { data: existing } = await supabase
        .from('org_departments')
        .select('*')
        .eq('name', deptName)
        .maybeSingle();

      if (existing) {
        createdDepts.set(deptName, existing.id);
        console.log(`   ✅ ${deptName} (exists)`);
      } else {
        console.log(`   ❌ ${deptName}: ${error.message}`);
      }
    } else if (data) {
      createdDepts.set(deptName, data.id);
      console.log(`   ✅ ${deptName} (created)`);
    }
  }

  console.log(`\n📊 Departments: ${createdDepts.size}\n`);

  console.log('='.repeat(80));
  console.log('STEP 3: CREATING ROLES');
  console.log('='.repeat(80) + '\n');

  const createdRoles = new Map<string, string>();

  for (const roleName of ROLES) {
    const { data, error } = await supabase
      .from('org_roles')
      .insert([{ name: roleName }])
      .select()
      .single();

    if (error) {
      const { data: existing } = await supabase
        .from('org_roles')
        .select('*')
        .eq('name', roleName)
        .maybeSingle();

      if (existing) {
        createdRoles.set(roleName, existing.id);
        console.log(`   ✅ ${roleName} (exists)`);
      } else {
        console.log(`   ❌ ${roleName}: ${error.message}`);
      }
    } else if (data) {
      createdRoles.set(roleName, data.id);
      console.log(`   ✅ ${roleName} (created)`);
    }
  }

  console.log(`\n📊 Roles: ${createdRoles.size}\n`);

  console.log('='.repeat(80));
  console.log('STEP 4: ASSIGNING TO AGENTS');
  console.log('='.repeat(80) + '\n');

  // Get sample agent to check schema
  const { data: sampleAgent } = await supabase
    .from('agents')
    .select('*')
    .limit(1)
    .single();

  console.log('Agent columns include department/role?',
    sampleAgent && ('department' in sampleAgent || 'role' in sampleAgent));

  if (!sampleAgent || (!('department' in sampleAgent) && !('role' in sampleAgent))) {
    console.log('\n⚠️  Agents table does not have department/role columns yet.');
    console.log('   Use the role field (string) that exists, or add UUID foreign keys.\n');

    // Check if 'role' field exists as string
    if (sampleAgent && 'role' in sampleAgent) {
      console.log('   Using existing "role" string field for role assignment...\n');

      const { data: agents } = await supabase
        .from('agents')
        .select('id, display_name, business_function')
        .eq('status', 'active');

      const { data: businessFunctions } = await supabase
        .from('business_functions')
        .select('*');

      const funcIdToName: Record<string, string> = {};
      businessFunctions?.forEach(f => {
        funcIdToName[f.id] = f.name;
      });

      const deptMapping: Record<string, string> = {
        'regulatory_affairs': 'Regulatory Affairs',
        'clinical_development': 'Clinical Development',
        'quality_assurance': 'Quality Assurance',
        'safety_pharmacovigilance': 'Pharmacovigilance',
        'medical_writing': 'Medical Affairs',
        'market_access': 'Market Access',
      };

      const extractRole = (displayName: string): string => {
        const rolePriority = ['Director', 'Manager', 'Strategist', 'Architect', 'Lead',
                             'Expert', 'Advisor', 'Consultant', 'Specialist', 'Coordinator', 'Analyst'];

        for (const role of rolePriority) {
          if (displayName.includes(role)) {
            return role;
          }
        }
        return 'Specialist';
      };

      let updated = 0;
      for (const agent of agents || []) {
        const role = extractRole(agent.display_name);

        const { error } = await supabase
          .from('agents')
          .update({ role })
          .eq('id', agent.id);

        if (!error) updated++;
      }

      console.log(`   ✅ Assigned roles to ${updated} agents\n`);
    }
  }

  return {
    departments: createdDepts.size,
    roles: createdRoles.size
  };
}

setupDepartmentsRoles()
  .then((result) => {
    console.log('✅ Setup complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
