import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';

export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const logger = createLogger();
  const operationId = `persona_get_${Date.now()}`;
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { profile } = context;
    const { slug } = await params;

    logger.info('persona_get_started', {
      operation: 'GET /api/personas/[slug]',
      operationId,
      slug,
      userId: context.user.id,
      tenantId: profile.tenant_id,
    });

    // Build comprehensive query for single persona
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
        allowed_tenants,
        created_at,
        updated_at
      `)
      .eq('slug', slug)
      .single();

    // Apply tenant filtering using allowed_tenants array
    // Note: contains() may not be in TypeScript types but works at runtime
    if (profile.role !== 'super_admin' && profile.role !== 'admin') {
      (query as any).contains('allowed_tenants', [profile.tenant_id]);
    }

    const { data: persona, error } = await query;

    if (error) {
      const duration = Date.now() - startTime;
      logger.warn('persona_get_not_found', {
        operation: 'GET /api/personas/[slug]',
        operationId,
        slug,
        duration,
        errorCode: error.code,
      });

      return NextResponse.json(
        { error: 'Persona not found', details: error.message },
        { status: 404 }
      );
    }

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }

    // Fetch full data for pain points, goals, challenges, and related information
    const [
      painPointsResult,
      goalsResult,
      challengesResult,
      jtbdsResult,
      motivationsResult,
      valuesResult,
      personalityTraitsResult,
      internalStakeholdersResult,
      externalStakeholdersResult,
    ] = await Promise.all([
      supabase
        .from('persona_pain_points')
        .select('id, pain_point_text, pain_category, pain_description, severity, sequence_order')
        .eq('persona_id', persona.id)
        .order('sequence_order', { ascending: true }),
      supabase
        .from('persona_goals')
        .select('id, goal_text, goal_type, goal_category, priority, sequence_order')
        .eq('persona_id', persona.id)
        .order('sequence_order', { ascending: true }),
      supabase
        .from('persona_challenges')
        .select('id, challenge_text, challenge_type, challenge_description, impact_level, sequence_order')
        .eq('persona_id', persona.id)
        .order('sequence_order', { ascending: true }),
      supabase
        .from('jtbd_personas')
        .select('id, jtbd_id, relevance_score, is_primary, jobs_to_be_done(code, name, description)')
        .eq('persona_id', persona.id)
        .order('relevance_score', { ascending: false }),
      supabase
        .from('persona_motivations')
        .select('id, motivation_text, motivation_category, importance, sequence_order')
        .eq('persona_id', persona.id)
        .order('sequence_order', { ascending: true }),
      supabase
        .from('persona_values')
        .select('id, value_name, value_description, rank_order, sequence_order')
        .eq('persona_id', persona.id)
        .order('rank_order', { ascending: true }),
      supabase
        .from('persona_personality_traits')
        .select('id, trait_name, trait_description, strength, sequence_order')
        .eq('persona_id', persona.id)
        .order('sequence_order', { ascending: true }),
      supabase
        .from('persona_internal_stakeholders')
        .select('id, stakeholder_name, stakeholder_role, relationship_type, influence_level, personas!persona_internal_stakeholders_stakeholder_persona_id_fkey(id, slug, name, title)')
        .eq('persona_id', persona.id),
      supabase
        .from('persona_external_stakeholders')
        .select('id, stakeholder_name, stakeholder_type, relationship_importance, interaction_mode')
        .eq('persona_id', persona.id),
    ]);

    // Add full data to persona
    const personaWithData = {
      ...persona,
      pain_points_count: painPointsResult.data?.length || 0,
      jtbds_count: jtbdsResult.data?.length || 0,
      goals_count: goalsResult.data?.length || 0,
      challenges_count: challengesResult.data?.length || 0,
      pain_points: painPointsResult.data || [],
      goals: goalsResult.data || [],
      challenges: challengesResult.data || [],
      jtbds: jtbdsResult.data || [],
      motivations: motivationsResult.data || [],
      values: valuesResult.data || [],
      personality_traits: personalityTraitsResult.data || [],
      internal_stakeholders: internalStakeholdersResult.data || [],
      external_stakeholders: externalStakeholdersResult.data || [],
    };

    const duration = Date.now() - startTime;
    logger.info('persona_get_success', {
      operation: 'GET /api/personas/[slug]',
      operationId,
      slug,
      personaId: persona.id,
      duration,
    });

    return NextResponse.json({ persona: personaWithData });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'persona_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/personas/[slug]',
        operationId,
        duration,
      }
    );

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch persona', details: errorMessage },
      { status: 500 }
    );
  }
});

