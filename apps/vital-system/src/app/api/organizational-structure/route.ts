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

    // Get business functions from org_functions
    let functions: any[] = [];
    try {
      const { data: functionsData, error: functionsError } = await supabase
        .from('org_functions')
        .select('id, name, slug, description')
        .order('name');

      if (functionsError) {
        if (functionsError.code === '42P01' || functionsError.code === '42501' || functionsError.code === '42703') {
          console.warn('[Org Structure API] org_functions unavailable:', functionsError.code);
        } else {
          throw functionsError;
        }
      } else {
        functions = functionsData || [];
        console.log('[Org Structure API] Loaded', functions.length, 'functions from org_functions');
      }
    } catch (error) {
      console.warn('[Org Structure API] org_functions query failed:', error);
    }

    // Get departments from org_departments
    let departments: any[] = [];
    try {
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('org_departments')
        .select('id, name, slug, description, function_id')
        .order('name');

      if (departmentsError) {
        if (departmentsError.code === '42P01' || departmentsError.code === '42501' || departmentsError.code === '42703') {
          console.warn('[Org Structure API] org_departments unavailable:', departmentsError.code);
        } else {
          throw departmentsError;
        }
      } else {
        departments = departmentsData || [];
        console.log('[Org Structure API] Loaded', departments.length, 'departments from org_departments');
      }
    } catch (error) {
      console.warn('[Org Structure API] org_departments query failed:', error);
    }

    // Get roles from org_roles (includes both function_id and department_id)
    let roles: any[] = [];
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('org_roles')
        .select('id, name, slug, description, function_id, department_id, seniority_level, geographic_scope')
        .order('name');

      if (rolesError) {
        if (rolesError.code === '42P01' || rolesError.code === '42501' || rolesError.code === '42703') {
          console.warn('[Org Structure API] org_roles unavailable:', rolesError.code);
        } else {
          throw rolesError;
        }
      } else {
        roles = rolesData || [];
        console.log('[Org Structure API] Loaded', roles.length, 'roles from org_roles');
      }
    } catch (error) {
      console.warn('[Org Structure API] org_roles query failed:', error);
    }

    // Build departmentsByFunction mapping
    const departmentsByFunction: Record<string, any[]> = {};
    departments?.forEach(dept => {
      if (!dept.function_id) return;
      if (!departmentsByFunction[dept.function_id]) {
        departmentsByFunction[dept.function_id] = [];
      }
      departmentsByFunction[dept.function_id].push(dept);
    });

    // Build rolesByDepartment and rolesByFunction mappings
    const rolesByDepartment: Record<string, any[]> = {};
    const rolesByFunction: Record<string, any[]> = {};

    roles?.forEach(role => {
      if (role.department_id) {
        if (!rolesByDepartment[role.department_id]) {
          rolesByDepartment[role.department_id] = [];
        }
        rolesByDepartment[role.department_id].push(role);
      }

      if (role.function_id) {
        if (!rolesByFunction[role.function_id]) {
          rolesByFunction[role.function_id] = [];
        }
        rolesByFunction[role.function_id].push(role);
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
