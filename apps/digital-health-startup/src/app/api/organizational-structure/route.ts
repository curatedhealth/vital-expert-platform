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
      // If table doesn't exist, return mock data
      if (functionsError.code === '42P01') {
        console.log('[Org Structure API] Table not found, returning mock data');
        return NextResponse.json({
          success: true,
          data: {
            functions: [
              { id: 'mock-func-1', code: 'REG', name: 'Regulatory Affairs', description: 'FDA compliance and regulatory strategy' },
              { id: 'mock-func-2', code: 'CLIN', name: 'Clinical Development', description: 'Clinical trial design and execution' },
              { id: 'mock-func-3', code: 'QUAL', name: 'Quality Assurance', description: 'Quality management and compliance' },
              { id: 'mock-func-4', code: 'MKT', name: 'Market Access', description: 'Reimbursement and market strategy' }
            ],
            departments: [
              { id: 'mock-dept-1', name: 'FDA Compliance', description: 'FDA regulatory compliance', business_function_id: 'mock-func-1' },
              { id: 'mock-dept-2', name: 'Clinical Operations', description: 'Clinical trial management', business_function_id: 'mock-func-2' },
              { id: 'mock-dept-3', name: 'Quality Control', description: 'Quality control and testing', business_function_id: 'mock-func-3' },
              { id: 'mock-dept-4', name: 'Reimbursement Strategy', description: 'Payer relations', business_function_id: 'mock-func-4' }
            ],
            roles: [
              { id: 'mock-role-1', name: 'Senior Regulatory Specialist', description: 'Senior regulatory expert', department_id: 'mock-dept-1', business_function_id: 'mock-func-1' },
              { id: 'mock-role-2', name: 'Clinical Research Director', description: 'Clinical trial leadership', department_id: 'mock-dept-2', business_function_id: 'mock-func-2' },
              { id: 'mock-role-3', name: 'Quality Manager', description: 'Quality management', department_id: 'mock-dept-3', business_function_id: 'mock-func-3' },
              { id: 'mock-role-4', name: 'Market Access Manager', description: 'Reimbursement strategy', department_id: 'mock-dept-4', business_function_id: 'mock-func-4' }
            ],
            departmentsByFunction: {
              'mock-func-1': [{ id: 'mock-dept-1', name: 'FDA Compliance', business_function_id: 'mock-func-1' }],
              'mock-func-2': [{ id: 'mock-dept-2', name: 'Clinical Operations', business_function_id: 'mock-func-2' }],
              'mock-func-3': [{ id: 'mock-dept-3', name: 'Quality Control', business_function_id: 'mock-func-3' }],
              'mock-func-4': [{ id: 'mock-dept-4', name: 'Reimbursement Strategy', business_function_id: 'mock-func-4' }]
            },
            rolesByDepartment: {
              'mock-dept-1': [{ id: 'mock-role-1', name: 'Senior Regulatory Specialist', department_id: 'mock-dept-1' }],
              'mock-dept-2': [{ id: 'mock-role-2', name: 'Clinical Research Director', department_id: 'mock-dept-2' }],
              'mock-dept-3': [{ id: 'mock-role-3', name: 'Quality Manager', department_id: 'mock-dept-3' }],
              'mock-dept-4': [{ id: 'mock-role-4', name: 'Market Access Manager', department_id: 'mock-dept-4' }]
            },
            rolesByFunction: {
              'mock-func-1': [{ id: 'mock-role-1', name: 'Senior Regulatory Specialist', business_function_id: 'mock-func-1' }],
              'mock-func-2': [{ id: 'mock-role-2', name: 'Clinical Research Director', business_function_id: 'mock-func-2' }],
              'mock-func-3': [{ id: 'mock-role-3', name: 'Quality Manager', business_function_id: 'mock-func-3' }],
              'mock-func-4': [{ id: 'mock-role-4', name: 'Market Access Manager', business_function_id: 'mock-func-4' }]
            },
            stats: {
              totalFunctions: 4,
              totalDepartments: 4,
              totalRoles: 4
            }
          }
        });
      }
      throw functionsError;
    }

    console.log('[Org Structure API] Fetched', functions?.length || 0, 'functions');
    if (functions && functions.length > 0) {
      console.log('[Org Structure API] Sample:', functions.slice(0, 3).map((f: any) => f.name));
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
