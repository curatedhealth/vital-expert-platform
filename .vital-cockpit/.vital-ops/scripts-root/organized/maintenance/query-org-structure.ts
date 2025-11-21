import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryOrgStructure() {
  console.log('\n=== ORGANIZATIONAL STRUCTURE ===\n');

  // Query org_functions
  const { data: functions, error: funcError } = await supabase
    .from('org_functions')
    .select('*')
    .order('department_name');

  if (funcError) {
    console.error('Error fetching org_functions:', funcError);
  } else {
    console.log('ORG_FUNCTIONS:');
    console.log(JSON.stringify(functions, null, 2));
  }

  // Query org_departments
  const { data: departments, error: deptError } = await supabase
    .from('org_departments')
    .select('*')
    .order('department_name');

  if (deptError) {
    console.error('\nError fetching org_departments:', deptError);
  } else {
    console.log('\n\nORG_DEPARTMENTS:');
    console.log(JSON.stringify(departments, null, 2));
  }

  // Query org_roles
  const { data: roles, error: rolesError } = await supabase
    .from('org_roles')
    .select('*')
    .eq('is_active', true)
    .order('function_area, department_name, role_name');

  if (rolesError) {
    console.error('\nError fetching org_roles:', rolesError);
  } else {
    console.log('\n\nORG_ROLES:');
    console.log(JSON.stringify(roles, null, 2));
  }

  // Also query the old business_functions table for comparison
  const { data: oldFunctions, error: oldFuncError } = await supabase
    .from('business_functions')
    .select('*')
    .order('department');

  if (!oldFuncError && oldFunctions) {
    console.log('\n\nOLD BUSINESS_FUNCTIONS (for reference):');
    console.log(JSON.stringify(oldFunctions, null, 2));
  }

  // Query old roles table
  const { data: oldRoles, error: oldRolesError } = await supabase
    .from('roles')
    .select('*')
    .order('department, name');

  if (!oldRolesError && oldRoles) {
    console.log('\n\nOLD ROLES (for reference):');
    console.log(JSON.stringify(oldRoles, null, 2));
  }
}

queryOrgStructure().then(() => {
  console.log('\n\nDone!');
  process.exit(0);
}).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
