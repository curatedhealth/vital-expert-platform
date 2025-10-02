import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Create a fresh Supabase client on each request to avoid schema caching
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'Prefer': 'return=representation'
          }
        }
      }
    );

    // Fetch all business functions
    const { data: functions, error: functionsError } = await supabaseAdmin
      .from('org_functions')
      .select('id, unique_id, department_name, description')
      .order('department_name');

    if (functionsError) {
      console.error('[Org Structure API] Error fetching functions:', functionsError);
      throw functionsError;
    }

    console.log('[Org Structure API] Fetched', functions?.length || 0, 'functions');
    if (functions && functions.length > 0) {
      console.log('[Org Structure API] Sample:', functions.slice(0, 3).map(f => f.department_name));
    }

    // Fetch all departments
    const { data: departments, error: departmentsError } = await supabaseAdmin
      .from('org_departments')
      .select('id, unique_id, department_name, description, function_id')
      .order('department_name');

    if (departmentsError) {
      console.error('[Org Structure API] Error fetching departments:', departmentsError);
      throw departmentsError;
    }

    // Fetch all active roles
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('org_roles')
      .select('id, unique_id, role_name, description, department_id, function_id')
      .eq('is_active', true)
      .order('role_name');

    if (rolesError) {
      console.error('[Org Structure API] Error fetching roles:', rolesError);
      throw rolesError;
    }

    // Group departments by function
    const departmentsByFunction: Record<string, any[]> = {};
    departments?.forEach(dept => {
      if (dept.function_id) {
        if (!departmentsByFunction[dept.function_id]) {
          departmentsByFunction[dept.function_id] = [];
        }
        departmentsByFunction[dept.function_id].push(dept);
      }
    });

    // Group roles by department and function
    const rolesByDepartment: Record<string, any[]> = {};
    const rolesByFunction: Record<string, any[]> = {};

    roles?.forEach(role => {
      // Group by department
      if (role.department_id) {
        if (!rolesByDepartment[role.department_id]) {
          rolesByDepartment[role.department_id] = [];
        }
        rolesByDepartment[role.department_id].push(role);
      }

      // Group by function
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
        // Hierarchical groupings
        departmentsByFunction,
        rolesByDepartment,
        rolesByFunction,
        // Statistics
        stats: {
          totalFunctions: functions?.length || 0,
          totalDepartments: departments?.length || 0,
          totalRoles: roles?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('[Org Structure API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organizational structure',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
