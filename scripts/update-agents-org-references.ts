/**
 * Update all agents with proper organizational structure foreign key references
 * Maps existing string values (business_function, department, role) to org table IDs
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

async function updateAgentOrgReferences() {
  console.log('🚀 Starting agent organizational reference update...\n');

  try {
    // Fetch all organizational data
    console.log('📊 Fetching organizational structure data...');

    const { data: functions, error: funcError } = await supabase
      .from('org_functions')
      .select('id, unique_id, department_name');

    if (funcError) throw funcError;
    console.log(`   ✓ Loaded ${functions?.length || 0} functions`);

    const { data: departments, error: deptError } = await supabase
      .from('org_departments')
      .select('id, unique_id, department_name, function_id');

    if (deptError) throw deptError;
    console.log(`   ✓ Loaded ${departments?.length || 0} departments`);

    const { data: roles, error: rolesError } = await supabase
      .from('org_roles')
      .select('id, unique_id, role_name, department_id, function_id')
      .eq('is_active', true);

    if (rolesError) throw rolesError;
    console.log(`   ✓ Loaded ${roles?.length || 0} active roles\n`);

    // Fetch all agents
    console.log('👥 Fetching agents...');
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, display_name, business_function, department, role, function_id, department_id, role_id');

    if (agentsError) throw agentsError;
    console.log(`   ✓ Loaded ${agents?.length || 0} agents\n`);

    // Helper function to normalize strings for comparison
    const normalize = (str: string | null | undefined): string => {
      if (!str) return '';
      return str.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9_]/g, '');
    };

    // Update counters
    let functionsUpdated = 0;
    let departmentsUpdated = 0;
    let rolesUpdated = 0;
    let errors = 0;

    console.log('🔄 Processing agents...\n');

    for (const agent of agents || []) {
      const updates: any = {};
      let needsUpdate = false;

      // Match function
      if (!agent.function_id && agent.business_function) {
        const normalizedBF = normalize(agent.business_function);
        const matchedFunction = functions?.find(f => {
          const normalizedFuncName = normalize(f.department_name);
          return normalizedFuncName === normalizedBF ||
                 normalizedFuncName.includes(normalizedBF) ||
                 normalizedBF.includes(normalizedFuncName);
        });

        if (matchedFunction) {
          updates.function_id = matchedFunction.id;
          needsUpdate = true;
        }
      }

      // Match department
      if (!agent.department_id && agent.department) {
        const normalizedDept = normalize(agent.department);
        const matchedDepartment = departments?.find(d => {
          const normalizedDeptName = normalize(d.department_name);
          return normalizedDeptName === normalizedDept ||
                 normalizedDeptName.includes(normalizedDept) ||
                 normalizedDept.includes(normalizedDeptName);
        });

        if (matchedDepartment) {
          updates.department_id = matchedDepartment.id;
          needsUpdate = true;

          // If we didn't find a function yet, use the department's function
          if (!updates.function_id && !agent.function_id && matchedDepartment.function_id) {
            updates.function_id = matchedDepartment.function_id;
          }
        }
      }

      // Match role
      if (!agent.role_id && agent.role) {
        const normalizedRole = normalize(agent.role);
        const matchedRole = roles?.find(r => {
          const normalizedRoleName = normalize(r.role_name);
          return normalizedRoleName === normalizedRole ||
                 normalizedRoleName.includes(normalizedRole) ||
                 normalizedRole.includes(normalizedRoleName);
        });

        if (matchedRole) {
          updates.role_id = matchedRole.id;
          needsUpdate = true;

          // If we didn't find department/function yet, use the role's references
          if (!updates.department_id && !agent.department_id && matchedRole.department_id) {
            updates.department_id = matchedRole.department_id;
          }
          if (!updates.function_id && !agent.function_id && matchedRole.function_id) {
            updates.function_id = matchedRole.function_id;
          }
        }
      }

      // Update agent if we found any matches
      if (needsUpdate) {
        updates.updated_at = new Date().toISOString();

        const { error: updateError } = await supabase
          .from('agents')
          .update(updates)
          .eq('id', agent.id);

        if (updateError) {
          console.error(`   ✗ Error updating agent ${agent.display_name}:`, updateError.message);
          errors++;
        } else {
          if (updates.function_id) functionsUpdated++;
          if (updates.department_id) departmentsUpdated++;
          if (updates.role_id) rolesUpdated++;

          console.log(`   ✓ Updated ${agent.display_name}`);
        }
      }
    }

    // Final verification
    console.log('\n📈 Verification...');

    const { data: updatedAgents, error: verifyError } = await supabase
      .from('agents')
      .select('id, function_id, department_id, role_id');

    if (verifyError) throw verifyError;

    const withFunction = updatedAgents?.filter(a => a.function_id).length || 0;
    const withDepartment = updatedAgents?.filter(a => a.department_id).length || 0;
    const withRole = updatedAgents?.filter(a => a.role_id).length || 0;

    console.log('\n✅ MIGRATION COMPLETE\n');
    console.log('═══════════════════════════════════════');
    console.log(`Total Agents:              ${agents?.length || 0}`);
    console.log(`Functions Updated:         ${functionsUpdated}`);
    console.log(`Departments Updated:       ${departmentsUpdated}`);
    console.log(`Roles Updated:             ${rolesUpdated}`);
    console.log(`Errors:                    ${errors}`);
    console.log('═══════════════════════════════════════');
    console.log(`Agents with Function:      ${withFunction} (${Math.round(withFunction / (agents?.length || 1) * 100)}%)`);
    console.log(`Agents with Department:    ${withDepartment} (${Math.round(withDepartment / (agents?.length || 1) * 100)}%)`);
    console.log(`Agents with Role:          ${withRole} (${Math.round(withRole / (agents?.length || 1) * 100)}%)`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
updateAgentOrgReferences();
