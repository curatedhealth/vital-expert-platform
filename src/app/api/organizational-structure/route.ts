import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('⚠️ Supabase configuration missing, returning mock organizational structure');
      return NextResponse.json({
        success: true,
        data: {
          functions: [
            { id: 'mock-func-1', name: 'Regulatory Affairs', description: 'FDA compliance and regulatory strategy' },
            { id: 'mock-func-2', name: 'Clinical Development', description: 'Clinical trial design and execution' }
          ],
          departments: [
            { id: 'mock-dept-1', name: 'Compliance', business_function_id: 'mock-func-1' },
            { id: 'mock-dept-2', name: 'Research', business_function_id: 'mock-func-2' }
          ],
          roles: [
            { id: 'mock-role-1', name: 'Senior Regulatory Specialist', department_id: 'mock-dept-1' },
            { id: 'mock-role-2', name: 'Clinical Research Director', department_id: 'mock-dept-2' }
          ]
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    // Fetch all business functions
    const { data: functions, error: functionsError } = await supabase
      .from('business_functions')
      .select('id, code, name, description')
      .order('name');

    if (functionsError) {
      console.error('[Org Structure API] Error fetching functions:', functionsError);
      throw functionsError;
    }

    console.log('[Org Structure API] Fetched', functions?.length || 0, 'functions');
    if (functions && functions.length > 0) {
      console.log('[Org Structure API] Sample:', functions.slice(0, 3).map(f => f.name));
    }

    // Fetch all departments
    const { data: departments, error: departmentsError } = await supabase
      .from('departments')
      .select('id, name, description, business_function_id')
      .order('name');

    if (departmentsError) {
      console.error('[Org Structure API] Error fetching departments:', departmentsError);
      throw departmentsError;
    }

    // Fetch all organizational roles
    const { data: roles, error: rolesError } = await supabase
      .from('organizational_roles')
      .select('id, name, description, department_id, business_function_id, level')
      .order('name');

    if (rolesError) {
      console.error('[Org Structure API] Error fetching roles:', rolesError);
      throw rolesError;
    }

    // Group departments by function
    const departmentsByFunction: Record<string, any[]> = {};
    departments?.forEach(dept => {
      if (dept.business_function_id) {
        if (!departmentsByFunction[dept.business_function_id]) {
          departmentsByFunction[dept.business_function_id] = [];
        }
        departmentsByFunction[dept.business_function_id].push(dept);
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
