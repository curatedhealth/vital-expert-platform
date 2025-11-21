/**
 * Check if org_departments and org_roles have their foreign key references populated
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkOrgForeignKeys() {
  console.log('🔍 Checking Org Table Foreign Keys...\n');

  try {
    // Check departments
    const { data: departments } = await supabase
      .from('org_departments')
      .select('id, department_name, function_id');

    console.log('📂 Departments:');
    console.log(`   Total: ${departments?.length || 0}`);
    const deptsWithFunc = departments?.filter(d => d.function_id).length || 0;
    console.log(`   With function_id: ${deptsWithFunc} (${Math.round(deptsWithFunc / (departments?.length || 1) * 100)}%)`);

    if (departments && departments.length > 0) {
      console.log('\n   Sample data:');
      departments.slice(0, 3).forEach(d => {
        console.log(`   - ${d.department_name}: function_id=${d.function_id ? '✓' : '✗ NULL'}`);
      });
    }

    // Check roles
    const { data: roles } = await supabase
      .from('org_roles')
      .select('id, role_name, department_id, function_id')
      .eq('is_active', true);

    console.log('\n👤 Roles:');
    console.log(`   Total: ${roles?.length || 0}`);
    const rolesWithDept = roles?.filter(r => r.department_id).length || 0;
    const rolesWithFunc = roles?.filter(r => r.function_id).length || 0;
    console.log(`   With department_id: ${rolesWithDept} (${Math.round(rolesWithDept / (roles?.length || 1) * 100)}%)`);
    console.log(`   With function_id: ${rolesWithFunc} (${Math.round(rolesWithFunc / (roles?.length || 1) * 100)}%)`);

    if (roles && roles.length > 0) {
      console.log('\n   Sample data:');
      roles.slice(0, 3).forEach(r => {
        console.log(`   - ${r.role_name}: dept_id=${r.department_id ? '✓' : '✗ NULL'}, func_id=${r.function_id ? '✓' : '✗ NULL'}`);
      });
    }

    console.log('\n');

    // Diagnose the issue
    if (deptsWithFunc === 0) {
      console.log('⚠️  ISSUE FOUND: Departments have no function_id references!');
      console.log('   Need to run department function mapping migration.');
    }

    if (rolesWithFunc === 0) {
      console.log('⚠️  ISSUE FOUND: Roles have no function_id references!');
      console.log('   Need to run roles function mapping migration.');
    }

    if (rolesWithDept === 0) {
      console.log('⚠️  ISSUE FOUND: Roles have no department_id references!');
      console.log('   Need to run roles department mapping migration.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkOrgForeignKeys();
