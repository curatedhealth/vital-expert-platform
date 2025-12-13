import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Validation schema for creating a persona
const createPersonaSchema = z.object({
  persona_name: z.string().min(1).max(255),
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  persona_type: z.enum(['AUTOMATOR', 'ORCHESTRATOR', 'LEARNER', 'SKEPTIC']).optional(),
  source_role_id: z.string().uuid().optional().nullable(),
  age_range: z.string().optional(),
  experience_level: z.string().optional(),
  education_level: z.string().optional(),
  department: z.string().optional(),
  function_area: z.string().optional(),
  geographic_scope: z.string().optional(),
  goals: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  motivations: z.array(z.string()).optional(),
  frustrations: z.array(z.string()).optional(),
  daily_activities: z.array(z.string()).optional(),
  tools_used: z.array(z.string()).optional(),
  communication_preferences: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  competencies: z.array(z.string()).optional(),
  success_metrics: z.array(z.string()).optional(),
  gxp_requirements: z.array(z.string()).optional(),
  regulatory_context: z.string().optional(),
  therapeutic_areas: z.array(z.string()).optional(),
  ai_readiness_score: z.number().min(0).max(1).optional(),
  work_complexity_score: z.number().min(0).max(1).optional(),
  derived_archetype: z.enum(['AUTOMATOR', 'ORCHESTRATOR', 'LEARNER', 'SKEPTIC']).optional(),
  preferred_service_layer: z.string().optional(),
  project_work_ratio: z.number().min(0).max(100).optional(),
  bau_work_ratio: z.number().min(0).max(100).optional(),
});

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
    // The personas table has MECE persona attributes and normalized foreign keys
    let query = supabase
      .from('personas')
      .select(`
        id,
        unique_id,
        persona_name,
        persona_type,
        source_role_id,
        title,
        description,
        is_active,
        age_range,
        experience_level,
        education_level,
        department,
        function_area,
        geographic_scope,
        goals,
        challenges,
        motivations,
        frustrations,
        daily_activities,
        tools_used,
        communication_preferences,
        skills,
        competencies,
        success_metrics,
        gxp_requirements,
        regulatory_context,
        therapeutic_areas,
        data_quality_score,
        ai_readiness_score,
        work_complexity_score,
        derived_archetype,
        preferred_service_layer,
        project_work_ratio,
        bau_work_ratio,
        work_dominance,
        owned_okr_count,
        contributed_okr_count,
        validated_by,
        last_validated,
        tenant_id,
        created_by,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Apply tenant filtering using tenant_id
    // In development or for admins with showAll, show all personas
    const isDev = process.env.NODE_ENV === 'development';
    if (showAll || isDev || profile.role === 'super_admin' || profile.role === 'admin') {
      logger.debug('personas_get_all_tenants', { operationId, isDev, showAll, role: profile.role });
    } else if (profile.tenant_id) {
      query = query.eq('tenant_id', profile.tenant_id);
      logger.debug('personas_get_tenant_filtered', { operationId, tenantId: profile.tenant_id });
    }
    
    // Only fetch active personas
    query = query.eq('is_active', true);

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    // Add ordering
    query = query.order('persona_name', { ascending: true });

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

    // Fetch org structure data separately using source_role_id
    const uniqueRoleIds = [...new Set((personas || []).map((p: any) => p.source_role_id).filter(Boolean))];

    // Fetch roles with their departments and functions
    const rolesResult = uniqueRoleIds.length > 0
      ? await supabase
          .from('org_roles')
          .select(`
            id, 
            name, 
            role_code,
            department_id,
            org_departments (
              id,
              name,
              department_code,
              function_id,
              org_functions (
                id,
                name,
                function_code
              )
            )
          `)
          .in('id', uniqueRoleIds)
      : { data: [], error: null };

    // Create lookup map for roles with full org structure
    const rolesMap = new Map((rolesResult.data || []).map((r: any) => [r.id, r]));

    // Transform personas to add org structure names and normalize field names for frontend
    const transformedPersonas = (personas || []).map((persona: any) => {
      const role = persona.source_role_id ? rolesMap.get(persona.source_role_id) : null;
      const dept = role?.org_departments;
      const func = dept?.org_functions;
      
      return {
        // Map to frontend expected field names
        id: persona.id,
        slug: persona.unique_id,
        name: persona.persona_name,
        title: persona.title,
        tagline: persona.description,
        one_liner: persona.description?.substring(0, 100),
        archetype: persona.derived_archetype,
        persona_type: persona.persona_type,
        seniority_level: persona.experience_level,
        
        // Org structure
        role_id: persona.source_role_id,
        role_name: role?.name || null,
        role_slug: role?.role_code || null,
        department_id: dept?.id || null,
        department_name: persona.department || dept?.name || null,
        department_slug: dept?.department_code || null,
        function_id: func?.id || null,
        function_name: persona.function_area || func?.name || null,
        function_slug: func?.function_code || null,
        
        // Demographics
        age_range: persona.age_range,
        years_of_experience: persona.experience_level,
        education_level: persona.education_level,
        geographic_scope: persona.geographic_scope,
        
        // MECE Archetype attributes
        ai_readiness_score: persona.ai_readiness_score,
        work_complexity_score: persona.work_complexity_score,
        derived_archetype: persona.derived_archetype,
        preferred_service_layer: persona.preferred_service_layer,
        
        // Work mix
        project_work_ratio: persona.project_work_ratio,
        bau_work_ratio: persona.bau_work_ratio,
        work_dominance: persona.work_dominance,
        
        // OKR ownership
        owned_okr_count: persona.owned_okr_count,
        contributed_okr_count: persona.contributed_okr_count,
        
        // Goals & Challenges (JSONB arrays)
        goals: persona.goals,
        challenges: persona.challenges,
        motivations: persona.motivations,
        frustrations: persona.frustrations,
        
        // Professional context
        daily_activities: persona.daily_activities,
        tools_used: persona.tools_used,
        skills: persona.skills,
        competencies: persona.competencies,
        success_metrics: persona.success_metrics,
        
        // Pharma-specific
        gxp_requirements: persona.gxp_requirements,
        regulatory_context: persona.regulatory_context,
        therapeutic_areas: persona.therapeutic_areas,
        
        // Quality
        data_quality_score: persona.data_quality_score,
        
        // Metadata
        is_active: persona.is_active,
        tenant_id: persona.tenant_id,
        created_at: persona.created_at,
        updated_at: persona.updated_at,
      };
    });

    // Calculate counts from JSONB arrays and add JTBD mapping counts
    const personaIds = transformedPersonas.map((p: any) => p.id) || [];
    let personasWithCounts = transformedPersonas || [];

    if (personaIds.length > 0) {
      // Get JTBD mapping counts
      const { data: jtbdMappingData } = await supabase
        .from('jtbd_persona_mapping')
        .select('persona_id')
        .in('persona_id', personaIds);

      const jtbdsCounts = (jtbdMappingData || []).reduce((acc: Record<string, number>, item: any) => {
        acc[item.persona_id] = (acc[item.persona_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Add counts to personas (goals/challenges are from JSONB arrays)
      personasWithCounts = transformedPersonas.map((persona: any) => ({
        ...persona,
        goals_count: Array.isArray(persona.goals) ? persona.goals.length : 
                     (typeof persona.goals === 'string' ? JSON.parse(persona.goals || '[]').length : 0),
        challenges_count: Array.isArray(persona.challenges) ? persona.challenges.length :
                         (typeof persona.challenges === 'string' ? JSON.parse(persona.challenges || '[]').length : 0),
        motivations_count: Array.isArray(persona.motivations) ? persona.motivations.length :
                          (typeof persona.motivations === 'string' ? JSON.parse(persona.motivations || '[]').length : 0),
        frustrations_count: Array.isArray(persona.frustrations) ? persona.frustrations.length :
                           (typeof persona.frustrations === 'string' ? JSON.parse(persona.frustrations || '[]').length : 0),
        jtbds_count: jtbdsCounts[persona.id] || 0,
      }));
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('personas_get_completed', duration, {
      operation: 'GET /api/personas',
      operationId,
      personaCount: personasWithCounts.length,
      totalCount: count,
    });

    // Calculate archetype distribution stats
    const archetypeStats = personasWithCounts.reduce((acc: Record<string, number>, p: any) => {
      const archetype = p.derived_archetype || 'Unknown';
      acc[archetype] = (acc[archetype] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const serviceLayerStats = personasWithCounts.reduce((acc: Record<string, number>, p: any) => {
      const layer = p.preferred_service_layer || 'Unknown';
      acc[layer] = (acc[layer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average scores
    const avgAiReadiness = personasWithCounts.length > 0
      ? personasWithCounts.reduce((sum: number, p: any) => sum + (parseFloat(p.ai_readiness_score) || 0), 0) / personasWithCounts.length
      : 0;
    
    const avgWorkComplexity = personasWithCounts.length > 0
      ? personasWithCounts.reduce((sum: number, p: any) => sum + (parseFloat(p.work_complexity_score) || 0), 0) / personasWithCounts.length
      : 0;

    // Fetch actual counts from org tables for accurate statistics
    const [rolesCountResult, departmentsCountResult, functionsCountResult] = await Promise.all([
      supabase
        .from('org_roles')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', profile.tenant_id),
      supabase
        .from('org_departments')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', profile.tenant_id),
      supabase
        .from('org_functions')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', profile.tenant_id),
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
        byArchetype: archetypeStats,
        byServiceLayer: serviceLayerStats,
        avgAiReadiness: Math.round(avgAiReadiness * 100) / 100,
        avgWorkComplexity: Math.round(avgWorkComplexity * 100) / 100,
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

// POST - Create new persona
export const POST = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `persona_create_${Date.now()}`;
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { profile } = context;
    const body = await request.json();

    logger.info('persona_create_started', {
      operation: 'POST /api/personas',
      operationId,
      userId: context.user.id,
      tenantId: profile.tenant_id,
    });

    // Validate input
    const validationResult = createPersonaSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Generate unique_id (slug) from persona_name
    const slug = data.persona_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    // Auto-calculate derived_archetype if not provided
    let derivedArchetype = data.derived_archetype;
    if (!derivedArchetype && data.ai_readiness_score !== undefined && data.work_complexity_score !== undefined) {
      const highAi = data.ai_readiness_score >= 0.5;
      const highWork = data.work_complexity_score >= 0.5;
      if (highAi && highWork) derivedArchetype = 'ORCHESTRATOR';
      else if (highAi && !highWork) derivedArchetype = 'AUTOMATOR';
      else if (!highAi && highWork) derivedArchetype = 'SKEPTIC';
      else derivedArchetype = 'LEARNER';
    }

    // Create persona
    const personaData = {
      unique_id: `${slug}-${uuidv4().substring(0, 8)}`,
      persona_name: data.persona_name,
      title: data.title,
      description: data.description,
      persona_type: data.persona_type || derivedArchetype,
      source_role_id: data.source_role_id,
      age_range: data.age_range,
      experience_level: data.experience_level,
      education_level: data.education_level,
      department: data.department,
      function_area: data.function_area,
      geographic_scope: data.geographic_scope,
      goals: data.goals || [],
      challenges: data.challenges || [],
      motivations: data.motivations || [],
      frustrations: data.frustrations || [],
      daily_activities: data.daily_activities || [],
      tools_used: data.tools_used || [],
      communication_preferences: data.communication_preferences || [],
      skills: data.skills || [],
      competencies: data.competencies || [],
      success_metrics: data.success_metrics || [],
      gxp_requirements: data.gxp_requirements || [],
      regulatory_context: data.regulatory_context,
      therapeutic_areas: data.therapeutic_areas || [],
      ai_readiness_score: data.ai_readiness_score,
      work_complexity_score: data.work_complexity_score,
      derived_archetype: derivedArchetype,
      preferred_service_layer: data.preferred_service_layer,
      project_work_ratio: data.project_work_ratio,
      bau_work_ratio: data.bau_work_ratio,
      is_active: true,
      tenant_id: profile.tenant_id,
      created_by: context.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newPersona, error: createError } = await supabase
      .from('personas')
      .insert(personaData)
      .select()
      .single();

    if (createError) {
      logger.error('persona_create_failed', new Error(createError.message), {
        operationId,
        errorCode: createError.code,
      });
      return NextResponse.json(
        { error: 'Failed to create persona', details: createError.message },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('persona_create_completed', duration, {
      operation: 'POST /api/personas',
      operationId,
      personaId: newPersona.id,
    });

    // Transform to frontend format
    return NextResponse.json({
      success: true,
      persona: {
        id: newPersona.id,
        slug: newPersona.unique_id,
        name: newPersona.persona_name,
        title: newPersona.title,
        tagline: newPersona.description,
        archetype: newPersona.derived_archetype,
        persona_type: newPersona.persona_type,
        seniority_level: newPersona.experience_level,
        role_id: newPersona.source_role_id,
        department_name: newPersona.department,
        function_name: newPersona.function_area,
        ai_readiness_score: newPersona.ai_readiness_score,
        work_complexity_score: newPersona.work_complexity_score,
        derived_archetype: newPersona.derived_archetype,
        preferred_service_layer: newPersona.preferred_service_layer,
        goals: newPersona.goals,
        challenges: newPersona.challenges,
        is_active: newPersona.is_active,
        tenant_id: newPersona.tenant_id,
        created_at: newPersona.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('persona_create_error', error instanceof Error ? error : new Error(String(error)), {
      operation: 'POST /api/personas',
      operationId,
      duration,
    });

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});
