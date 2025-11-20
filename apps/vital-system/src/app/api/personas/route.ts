import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';

export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `personas_get_${Date.now()}`;
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { profile } = context;

    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10000');
    const offset = parseInt(searchParams.get('offset') || '0');

    logger.info('personas_get_started', {
      operation: 'GET /api/personas',
      operationId,
      userId: context.user.id,
      tenantId: profile.tenant_id,
      role: profile.role,
      showAll,
      limit,
      offset,
    });

    // Build query using actual database column names
    // Note: We'll fetch counts separately for performance
    // The personas table already has normalized foreign keys: role_id, department_id, function_id
    let query = supabase
      .from('personas')
      .select(`
        id,
        slug,
        name,
        title,
        one_liner,
        tagline,
        archetype,
        persona_type,
        persona_number,
        section,
        segment,
        organization_type,
        typical_organization_size,
        seniority_level,
        department_id,
        department_slug,
        function_id,
        function_slug,
        role_id,
        role_slug,
        years_of_experience,
        years_in_function,
        years_in_industry,
        years_in_current_role,
        education_level,
        budget_authority,
        key_responsibilities,
        technology_adoption,
        risk_tolerance,
        decision_making_style,
        learning_style,
        work_style,
        work_style_preference,
        work_arrangement,
        location_type,
        geographic_scope,
        team_size,
        team_size_typical,
        direct_reports,
        reporting_to,
        span_of_control,
        salary_min_usd,
        salary_median_usd,
        salary_max_usd,
        metadata,
        tags,
        is_active,
        tenant_id,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Apply tenant filtering using allowed_tenants array
    if (showAll && (profile.role === 'super_admin' || profile.role === 'admin')) {
      logger.debug('personas_get_admin_view_all_tenants', { operationId });
    } else {
      query = query.contains('allowed_tenants', [profile.tenant_id]);
      logger.debug('personas_get_tenant_filtered', { operationId, tenantId: profile.tenant_id });
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    // Add ordering
    query = query.order('name', { ascending: true });

    const { data: personas, error, count } = await query;

    if (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'personas_get_failed',
        new Error(error.message),
        {
          operation: 'GET /api/personas',
          operationId,
          duration,
          errorCode: error.code,
        }
      );

      return NextResponse.json(
        { error: 'Failed to fetch personas from database', details: error.message },
        { status: 500 }
      );
    }

    // Fetch org structure data separately using normalized foreign keys
    // The personas table has normalized schema with foreign keys: role_id, department_id, function_id
    const uniqueRoleIds = [...new Set((personas || []).map((p: any) => p.role_id).filter(Boolean))];
    const uniqueDepartmentIds = [...new Set((personas || []).map((p: any) => p.department_id).filter(Boolean))];
    const uniqueFunctionIds = [...new Set((personas || []).map((p: any) => p.function_id).filter(Boolean))];

    // Fetch roles, departments, and functions in parallel using normalized foreign keys
    const [rolesResult, departmentsResult, functionsResult] = await Promise.all([
      uniqueRoleIds.length > 0
        ? supabase.from('org_roles').select('id, name, role_code').in('id', uniqueRoleIds)
        : Promise.resolve({ data: [], error: null }),
      uniqueDepartmentIds.length > 0
        ? supabase.from('org_departments').select('id, name, department_code').in('id', uniqueDepartmentIds)
        : Promise.resolve({ data: [], error: null }),
      uniqueFunctionIds.length > 0
        ? supabase.from('org_functions').select('id, name, function_code').in('id', uniqueFunctionIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    // Create lookup maps for O(1) access - normalized data lookup
    const rolesMap = new Map((rolesResult.data || []).map((r: any) => [r.id, r.name]));
    const departmentsMap = new Map((departmentsResult.data || []).map((d: any) => [d.id, d.name]));
    const functionsMap = new Map((functionsResult.data || []).map((f: any) => [f.id, f.name]));

    // Transform personas to add normalized org structure names
    const transformedPersonas = (personas || []).map((persona: any) => {
      const transformed: any = { ...persona };
      
      // Add role name from normalized lookup using role_id foreign key
      if (persona.role_id && rolesMap.has(persona.role_id)) {
        transformed.role_name = rolesMap.get(persona.role_id);
      }
      
      // Add department name from normalized lookup using department_id foreign key
      if (persona.department_id && departmentsMap.has(persona.department_id)) {
        transformed.department_name = departmentsMap.get(persona.department_id);
      }
      
      // Add function name from normalized lookup using function_id foreign key
      if (persona.function_id && functionsMap.has(persona.function_id)) {
        transformed.function_name = functionsMap.get(persona.function_id);
      }
      
      return transformed;
    });

    // Fetch counts for pain points and JTBDs for all personas
    const personaIds = transformedPersonas.map(p => p.id) || [];
    let personasWithCounts = transformedPersonas || [];

    if (personaIds.length > 0) {
      // Get pain points counts
      const { data: painPointsData } = await supabase
        .from('persona_pain_points')
        .select('persona_id')
        .in('persona_id', personaIds);

      // Get JTBD counts
      const { data: jtbdsData } = await supabase
        .from('jtbd_personas')
        .select('persona_id')
        .in('persona_id', personaIds);

      // Get goals counts
      const { data: goalsData } = await supabase
        .from('persona_goals')
        .select('persona_id')
        .in('persona_id', personaIds);

      // Get challenges counts
      const { data: challengesData } = await supabase
        .from('persona_challenges')
        .select('persona_id')
        .in('persona_id', personaIds);

      // Count by persona_id
      const painPointsCounts = (painPointsData || []).reduce((acc, item) => {
        acc[item.persona_id] = (acc[item.persona_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const jtbdsCounts = (jtbdsData || []).reduce((acc, item) => {
        acc[item.persona_id] = (acc[item.persona_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const goalsCounts = (goalsData || []).reduce((acc, item) => {
        acc[item.persona_id] = (acc[item.persona_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const challengesCounts = (challengesData || []).reduce((acc, item) => {
        acc[item.persona_id] = (acc[item.persona_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Add counts to personas
      personasWithCounts = personas.map((persona: any) => ({
        ...persona,
        pain_points_count: painPointsCounts[persona.id] || 0,
        jtbds_count: jtbdsCounts[persona.id] || 0,
        goals_count: goalsCounts[persona.id] || 0,
        challenges_count: challengesCounts[persona.id] || 0,
      }));
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('personas_get_completed', duration, {
      operation: 'GET /api/personas',
      operationId,
      personaCount: personasWithCounts.length,
      totalCount: count,
    });

    // Fetch actual counts from org tables for accurate statistics
    const [rolesCountResult, departmentsCountResult, functionsCountResult] = await Promise.all([
      supabase
        .from('org_roles')
        .select('id', { count: 'exact', head: true })
        .contains('allowed_tenants', [profile.tenant_id]),
      supabase
        .from('org_departments')
        .select('id', { count: 'exact', head: true })
        .contains('allowed_tenants', [profile.tenant_id]),
      supabase
        .from('org_functions')
        .select('id', { count: 'exact', head: true })
        .contains('allowed_tenants', [profile.tenant_id]),
    ]);

    return NextResponse.json({
      success: true,
      personas: personasWithCounts,
      count: count || 0,
      limit,
      offset,
      stats: {
        totalPersonas: count || 0,
        totalRoles: rolesCountResult.count || 0,
        totalDepartments: departmentsCountResult.count || 0,
        totalFunctions: functionsCountResult.count || 0,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'personas_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/personas',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
