import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { z } from 'zod';

// Validation schema for persona updates
const updatePersonaSchema = z.object({
  persona_name: z.string().min(1).max(255).optional(),
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
  is_active: z.boolean().optional(),
});

// Helper to check if string is a valid UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// GET single persona by ID or slug
// Supports both UUID (database ID) and slug (unique_id/persona_name) lookups
export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const { id: identifier } = await params;
  const operationId = `persona_get_${identifier}_${Date.now()}`;
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { profile } = context;

    logger.info('persona_get_started', {
      operation: 'GET /api/personas/[id]',
      operationId,
      identifier,
      isUUID: isUUID(identifier),
      userId: context.user.id,
      tenantId: profile.tenant_id,
    });

    // Determine lookup strategy based on identifier format
    let persona = null;
    let error = null;

    if (isUUID(identifier)) {
      // UUID lookup - direct ID match
      const result = await supabase
        .from('personas')
        .select(`
          *,
          org_roles:source_role_id (
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
          )
        `)
        .eq('id', identifier)
        .single();
      persona = result.data;
      error = result.error;
    } else {
      // Slug lookup - try unique_id first, then persona_name
      const result = await supabase
        .from('personas')
        .select(`
          *,
          org_roles:source_role_id (
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
          )
        `)
        .eq('unique_id', identifier)
        .maybeSingle();

      persona = result.data;
      error = result.error;

      // Fallback to persona_name if not found
      if (!persona && !error) {
        const fallback = await supabase
          .from('personas')
          .select(`
            *,
            org_roles:source_role_id (
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
            )
          `)
          .eq('persona_name', identifier)
          .maybeSingle();
        persona = fallback.data;
        error = fallback.error;
      }
    }

    if (error || !persona) {
      logger.warn('persona_not_found', { operationId, personaId: identifier, error: error?.message });
      return NextResponse.json(
        { error: 'Persona not found', details: error?.message },
        { status: 404 }
      );
    }

    // Check tenant access (skip in dev or for admins)
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && profile.role !== 'super_admin' && profile.role !== 'admin') {
      if (persona.tenant_id && persona.tenant_id !== profile.tenant_id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Transform to frontend format
    const role = persona.org_roles;
    const dept = role?.org_departments;
    const func = dept?.org_functions;

    const transformedPersona = {
      id: persona.id,
      slug: persona.unique_id,
      name: persona.persona_name,
      title: persona.title,
      tagline: persona.description,
      one_liner: persona.description?.substring(0, 100),
      archetype: persona.derived_archetype,
      persona_type: persona.persona_type,
      seniority_level: persona.experience_level,
      role_id: persona.source_role_id,
      role_name: role?.name || null,
      role_slug: role?.role_code || null,
      department_id: dept?.id || null,
      department_name: persona.department || dept?.name || null,
      department_slug: dept?.department_code || null,
      function_id: func?.id || null,
      function_name: persona.function_area || func?.name || null,
      function_slug: func?.function_code || null,
      age_range: persona.age_range,
      years_of_experience: persona.experience_level,
      education_level: persona.education_level,
      geographic_scope: persona.geographic_scope,
      ai_readiness_score: persona.ai_readiness_score,
      work_complexity_score: persona.work_complexity_score,
      derived_archetype: persona.derived_archetype,
      preferred_service_layer: persona.preferred_service_layer,
      project_work_ratio: persona.project_work_ratio,
      bau_work_ratio: persona.bau_work_ratio,
      work_dominance: persona.work_dominance,
      owned_okr_count: persona.owned_okr_count,
      contributed_okr_count: persona.contributed_okr_count,
      goals: persona.goals,
      challenges: persona.challenges,
      motivations: persona.motivations,
      frustrations: persona.frustrations,
      daily_activities: persona.daily_activities,
      tools_used: persona.tools_used,
      skills: persona.skills,
      competencies: persona.competencies,
      success_metrics: persona.success_metrics,
      gxp_requirements: persona.gxp_requirements,
      regulatory_context: persona.regulatory_context,
      therapeutic_areas: persona.therapeutic_areas,
      data_quality_score: persona.data_quality_score,
      is_active: persona.is_active,
      tenant_id: persona.tenant_id,
      created_at: persona.created_at,
      updated_at: persona.updated_at,
    };

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('persona_get_completed', duration, {
      operation: 'GET /api/personas/[id]',
      operationId,
      personaId: identifier,
    });

    return NextResponse.json({ success: true, persona: transformedPersona });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('persona_get_error', error instanceof Error ? error : new Error(String(error)), {
      operation: 'GET /api/personas/[id]',
      operationId,
      personaId: identifier,
      duration,
    });

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

// PUT update persona
export const PUT = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const { id } = await params;
  const operationId = `persona_update_${id}_${Date.now()}`;
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { profile } = context;
    const body = await request.json();

    logger.info('persona_update_started', {
      operation: 'PUT /api/personas/[id]',
      operationId,
      personaId: id,
      userId: context.user.id,
      tenantId: profile.tenant_id,
    });

    // Validate input
    const validationResult = updatePersonaSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Check persona exists and user has access
    const { data: existingPersona, error: fetchError } = await supabase
      .from('personas')
      .select('id, tenant_id, created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingPersona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    // Check tenant access
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && profile.role !== 'super_admin' && profile.role !== 'admin') {
      if (existingPersona.tenant_id && existingPersona.tenant_id !== profile.tenant_id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Update persona
    const updateData = {
      ...validationResult.data,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedPersona, error: updateError } = await supabase
      .from('personas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('persona_update_failed', new Error(updateError.message), {
        operationId,
        personaId: id,
      });
      return NextResponse.json(
        { error: 'Failed to update persona', details: updateError.message },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('persona_update_completed', duration, {
      operation: 'PUT /api/personas/[id]',
      operationId,
      personaId: id,
    });

    return NextResponse.json({ success: true, persona: updatedPersona });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('persona_update_error', error instanceof Error ? error : new Error(String(error)), {
      operation: 'PUT /api/personas/[id]',
      operationId,
      personaId: id,
      duration,
    });

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

// DELETE persona (soft delete)
export const DELETE = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const { id } = await params;
  const operationId = `persona_delete_${id}_${Date.now()}`;
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { profile } = context;

    logger.info('persona_delete_started', {
      operation: 'DELETE /api/personas/[id]',
      operationId,
      personaId: id,
      userId: context.user.id,
      tenantId: profile.tenant_id,
    });

    // Check persona exists and user has access
    const { data: existingPersona, error: fetchError } = await supabase
      .from('personas')
      .select('id, tenant_id, created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingPersona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    // Check tenant access (only admins or owners can delete)
    const isDev = process.env.NODE_ENV === 'development';
    const isAdmin = profile.role === 'super_admin' || profile.role === 'admin';
    const isOwner = existingPersona.created_by === context.user.id;

    if (!isDev && !isAdmin && !isOwner) {
      if (existingPersona.tenant_id && existingPersona.tenant_id !== profile.tenant_id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Soft delete - set is_active to false
    const { error: deleteError } = await supabase
      .from('personas')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (deleteError) {
      logger.error('persona_delete_failed', new Error(deleteError.message), {
        operationId,
        personaId: id,
      });
      return NextResponse.json(
        { error: 'Failed to delete persona', details: deleteError.message },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('persona_delete_completed', duration, {
      operation: 'DELETE /api/personas/[id]',
      operationId,
      personaId: id,
    });

    return NextResponse.json({ success: true, message: 'Persona deleted successfully' });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('persona_delete_error', error instanceof Error ? error : new Error(String(error)), {
      operation: 'DELETE /api/personas/[id]',
      operationId,
      personaId: id,
      duration,
    });

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});
