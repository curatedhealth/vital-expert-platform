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
    const limit = parseInt(searchParams.get('limit') || '100');
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

    // Build query
    let query = supabase
      .from('personas')
      .select(`
        id,
        slug,
        name,
        title,
        description,
        organization_type,
        company_size,
        seniority_level,
        department,
        industry,
        location,
        years_experience,
        education_level,
        budget_authority,
        primary_goals,
        pain_points,
        motivations,
        challenges,
        success_metrics,
        key_responsibilities,
        decision_criteria,
        preferred_channels,
        content_preferences,
        technology_adoption,
        risk_tolerance,
        metadata,
        tags,
        status,
        tenant_id,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Apply tenant filtering
    if (showAll && (profile.role === 'super_admin' || profile.role === 'admin')) {
      logger.debug('personas_get_admin_view_all_tenants', { operationId });
    } else {
      query = query.eq('tenant_id', profile.tenant_id);
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

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('personas_get_completed', duration, {
      operation: 'GET /api/personas',
      operationId,
      personaCount: personas?.length || 0,
      totalCount: count,
    });

    return NextResponse.json({
      success: true,
      personas: personas || [],
      count: count || 0,
      limit,
      offset,
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
