import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const emptyStructure = {
  functions: [] as any[],
  departments: [] as any[],
  roles: [] as any[],
  departmentsByFunction: {} as Record<string, any[]>,
  rolesByDepartment: {} as Record<string, any[]>,
  rolesByFunction: {} as Record<string, any[]>,
  stats: {
    totalFunctions: 0,
    totalDepartments: 0,
    totalRoles: 0,
  },
};

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[Org Structure API] Supabase configuration missing');
      return NextResponse.json({ success: true, data: emptyStructure });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to get business functions, but handle missing table/columns gracefully
    let functions: any[] = [];
    try {
      const { data: functionsData, error: functionsError } = await supabase
        .from('business_functions')
        .select('id, name, description')
        .order('name');

      if (functionsError) {
        if (functionsError.code === '42P01' || functionsError.code === '42501' || functionsError.code === '42703') {
          console.warn('[Org Structure API] business_functions unavailable:', functionsError.code);
        } else {
          throw functionsError;
        }
      } else {
        functions = functionsData || [];
      }
    } catch (error) {
      console.warn('[Org Structure API] business_functions query failed:', error);
    }

    // Try to get departments, but handle missing table/columns gracefully
    let departments: any[] = [];
    try {
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('id, name, description, business_function_id')
        .order('name');

      if (departmentsError) {
        if (departmentsError.code === '42P01' || departmentsError.code === '42501' || departmentsError.code === '42703') {
          console.warn('[Org Structure API] departments unavailable:', departmentsError.code);
        } else {
          throw departmentsError;
        }
      } else {
        departments = departmentsData || [];
      }
    } catch (error) {
      console.warn('[Org Structure API] departments query failed:', error);
    }

    // Try to get roles, but handle missing table/columns gracefully
    let roles: any[] = [];
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('organizational_roles')
        .select('id, name, description, department_id, business_function_id, level')
        .order('name');

      if (rolesError) {
        if (rolesError.code === '42P01' || rolesError.code === '42501' || rolesError.code === '42703') {
          console.warn('[Org Structure API] organizational_roles unavailable:', rolesError.code);
        } else {
          throw rolesError;
        }
      } else {
        roles = rolesData || [];
      }
    } catch (error) {
      console.warn('[Org Structure API] organizational_roles query failed:', error);
    }

    const departmentsByFunction: Record<string, any[]> = {};
    departments?.forEach(dept => {
      if (!dept.business_function_id) return;
      if (!departmentsByFunction[dept.business_function_id]) {
        departmentsByFunction[dept.business_function_id] = [];
      }
      departmentsByFunction[dept.business_function_id].push(dept);
    });

    const rolesByDepartment: Record<string, any[]> = {};
    const rolesByFunction: Record<string, any[]> = {};

    roles?.forEach(role => {
      if (role.department_id) {
        if (!rolesByDepartment[role.department_id]) {
          rolesByDepartment[role.department_id] = [];
        }
        rolesByDepartment[role.department_id].push(role);
      }

      if (role.business_function_id) {
        if (!rolesByFunction[role.business_function_id]) {
          rolesByFunction[role.business_function_id] = [];
        }
        rolesByFunction[role.business_function_id].push(role);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        functions: functions || [],
        departments: departments || [],
        roles: roles || [],
        departmentsByFunction,
        rolesByDepartment,
        rolesByFunction,
        stats: {
          totalFunctions: functions?.length || 0,
          totalDepartments: departments?.length || 0,
          totalRoles: roles?.length || 0,
        },
      },
    });
  } catch (error) {
    console.error('[Org Structure API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organizational structure',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
