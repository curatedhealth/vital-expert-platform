import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';

export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `org_structure_get_${Date.now()}`;
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { profile } = context;

    logger.info('org_structure_get_started', {
      operation: 'GET /api/org-structure',
      operationId,
      userId: context.user.id,
      tenantId: profile.tenant_id,
      userRole: profile.role,
    });

    // Debug: Log tenant filtering details
    console.log('[org-structure] Tenant filtering:', {
      tenantId: profile.tenant_id,
      role: profile.role,
      willFilter: profile.role !== 'super_admin' && profile.role !== 'admin',
    });

    // Strategy: Derive org structure from personas (same approach as personas API)
    // This ensures we only show org structure that's actually used by tenant-filtered personas
    // Step 1: Fetch tenant-filtered personas to get their org structure IDs
    let personasQuery = supabase
      .from('personas')
      .select('role_id, department_id, function_id')
      .limit(10000); // Get all personas to extract unique IDs

    // Apply tenant filtering to personas (same as personas API)
    const showAll = request.nextUrl.searchParams.get('showAll') === 'true';
    if (!showAll && (profile.role !== 'super_admin' && profile.role !== 'admin')) {
      if (profile.tenant_id) {
        personasQuery = personasQuery.contains('allowed_tenants', [profile.tenant_id]);
      }
    }

    const { data: personas, error: personasError } = await personasQuery;

    if (personasError) {
      console.error('[org-structure] Failed to fetch personas for org structure extraction:', personasError);
      logger.error(
        'org_structure_personas_error',
        new Error(personasError.message),
        {
          operationId,
          code: personasError.code,
          details: personasError.details,
        }
      );
    }

    // Extract unique IDs from personas (same as personas API does)
    const uniqueRoleIds = [...new Set((personas || []).map((p: any) => p.role_id).filter(Boolean))];
    const uniqueDepartmentIds = [...new Set((personas || []).map((p: any) => p.department_id).filter(Boolean))];
    const uniqueFunctionIds = [...new Set((personas || []).map((p: any) => p.function_id).filter(Boolean))];

    console.log('[org-structure] Extracted unique IDs from personas:', {
      roles: uniqueRoleIds.length,
      departments: uniqueDepartmentIds.length,
      functions: uniqueFunctionIds.length,
    });

    // Step 2: Fetch org structure for the IDs found in personas (no tenant filtering needed - already filtered via personas)
    const [functionsResult, departmentsResult, rolesResult] = await Promise.all([
      uniqueFunctionIds.length > 0
        ? supabase
            .from('org_functions')
            .select('id, name, function_code, description')
            .in('id', uniqueFunctionIds)
            .order('name', { ascending: true, nullsFirst: false })
        : Promise.resolve({ data: [], error: null }),
      uniqueDepartmentIds.length > 0
        ? supabase
            .from('org_departments')
            .select('id, name, department_code, function_id, description')
            .in('id', uniqueDepartmentIds)
            .order('name', { ascending: true, nullsFirst: false })
        : Promise.resolve({ data: [], error: null }),
      uniqueRoleIds.length > 0
        ? supabase
            .from('org_roles')
            .select('id, name, role_code, department_id, function_id, level, description')
            .in('id', uniqueRoleIds)
            .order('name', { ascending: true, nullsFirst: false })
        : Promise.resolve({ data: [], error: null }),
    ]);

    const { data: functions, error: functionsError } = functionsResult;

    if (functionsError) {
      console.error('[org-structure] Functions query error:', {
        message: functionsError.message,
        code: functionsError.code,
        details: functionsError.details,
        hint: functionsError.hint,
        tenantId: profile.tenant_id,
      });
      logger.error(
        'org_structure_functions_error',
        new Error(functionsError.message),
        {
          operationId,
          code: functionsError.code,
          details: functionsError.details,
          hint: functionsError.hint,
          tenantId: profile.tenant_id,
        }
      );
    } else {
      console.log('[org-structure] Functions query success:', {
        count: functions?.length || 0,
        tenantId: profile.tenant_id,
        sample: functions?.slice(0, 3)?.map((f: any) => ({ id: f.id, name: f.name })),
      });
      logger.info('org_structure_functions_success', {
        operationId,
        count: functions?.length || 0,
        sampleFunctions: functions?.slice(0, 3)?.map((f: any) => ({ id: f.id, name: f.name })),
      });
    }

    const { data: departments, error: departmentsError } = departmentsResult;

    if (departmentsError) {
      logger.error(
        'org_structure_departments_error',
        new Error(departmentsError.message),
        {
          operationId,
          code: departmentsError.code,
          details: departmentsError.details,
          hint: departmentsError.hint,
        }
      );
    } else {
      logger.info('org_structure_departments_success', {
        operationId,
        count: departments?.length || 0,
        sampleDepartments: departments?.slice(0, 3)?.map((d: any) => ({ id: d.id, name: d.name })),
      });
    }

    const { data: roles, error: rolesError } = rolesResult;

    if (rolesError) {
      logger.error(
        'org_structure_roles_error',
        new Error(rolesError.message),
        {
          operationId,
          code: rolesError.code,
          details: rolesError.details,
          hint: rolesError.hint,
        }
      );
    } else {
      logger.info('org_structure_roles_success', {
        operationId,
        count: roles?.length || 0,
        sampleRoles: roles?.slice(0, 3)?.map((r: any) => ({ id: r.id, name: r.name })),
      });
    }


    // Build hierarchical mappings using IDs for keys
    const departmentsByFunction: Record<string, any[]> = {};
    (departments || []).forEach((dept: any) => {
      if (dept.function_id) {
        const funcKey = dept.function_id;
        if (!departmentsByFunction[funcKey]) {
          departmentsByFunction[funcKey] = [];
        }
        departmentsByFunction[funcKey].push(dept);
      }
    });

    const rolesByDepartment: Record<string, any[]> = {};
    (roles || []).forEach((role: any) => {
      if (role.department_id) {
        const deptKey = role.department_id;
        if (!rolesByDepartment[deptKey]) {
          rolesByDepartment[deptKey] = [];
        }
        rolesByDepartment[deptKey].push(role);
      }
    });

    const rolesByFunction: Record<string, any[]> = {};
    (roles || []).forEach((role: any) => {
      if (role.function_id) {
        const funcKey = role.function_id;
        if (!rolesByFunction[funcKey]) {
          rolesByFunction[funcKey] = [];
        }
        rolesByFunction[funcKey].push(role);
      }
    });

    const duration = Date.now() - startTime;
    logger.info('org_structure_get_success', {
      operation: 'GET /api/org-structure',
      operationId,
      duration,
      functionsCount: functions?.length || 0,
      departmentsCount: departments?.length || 0,
      rolesCount: roles?.length || 0,
    });

    // Log final counts before returning
    logger.info('org_structure_final_counts', {
      operationId,
      functionsCount: functions?.length || 0,
      departmentsCount: departments?.length || 0,
      rolesCount: roles?.length || 0,
      hasErrors: !!(functionsError || departmentsError || rolesError),
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
    const duration = Date.now() - startTime;
    logger.error(
      'org_structure_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/org-structure',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organizational structure',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

