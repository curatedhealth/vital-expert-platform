import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';

export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `jtbd_get_${Date.now()}`;
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { profile } = context;

    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    logger.info('jtbd_get_started', {
      operation: 'GET /api/jtbd',
      operationId,
      userId: context.user.id,
      tenantId: profile.tenant_id,
      role: profile.role,
      showAll,
      limit,
      offset,
    });

    // Build query - using the correct 'jtbd' table with verified columns
    // Schema from: 20251129_029_jtbd_gold_standard_phase2.sql + 20251201_042_digital_health_jtbd_complete.sql
    let query = supabase
      .from('jtbd')
      .select(`
        id,
        code,
        name,
        tenant_id,
        job_statement,
        when_situation,
        circumstance,
        desired_outcome,
        job_type,
        job_category,
        complexity,
        frequency,
        status,
        validation_score,
        work_pattern,
        jtbd_type,
        active_okr_count,
        okr_alignment_score,
        strategic_priority,
        impact_level,
        compliance_sensitivity,
        recommended_service_layer,
        importance_score,
        satisfaction_score,
        opportunity_score,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Apply tenant filtering - in development show all
    const isDev = process.env.NODE_ENV === 'development';
    if (showAll || isDev || profile.role === 'super_admin' || profile.role === 'admin') {
      logger.debug('jtbd_get_all_tenants', { operationId, isDev, showAll, role: profile.role });
    } else if (profile.tenant_id) {
      query = query.eq('tenant_id', profile.tenant_id);
      logger.debug('jtbd_get_tenant_filtered', { operationId, tenantId: profile.tenant_id });
    }

    // Only fetch non-deleted JTBDs
    query = query.is('deleted_at', null);

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    // Add ordering by name
    query = query.order('name', { ascending: true });

    const { data: jtbds, error, count } = await query;

    if (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'jtbd_get_failed',
        new Error(error.message),
        {
          operation: 'GET /api/jtbd',
          operationId,
          duration,
          errorCode: error.code,
        }
      );

      return NextResponse.json(
        { error: 'Failed to fetch JTBD from database', details: error.message },
        { status: 500 }
      );
    }

    // Transform JTBDs to match frontend expected format
    const transformedJtbds = (jtbds || []).map((jtbd: any) => {
      // Calculate ODI tier from opportunity score
      const opportunityScore = parseFloat(jtbd.opportunity_score) || 0;
      let odiTier = 'low';
      if (opportunityScore >= 15) odiTier = 'extreme';
      else if (opportunityScore >= 12) odiTier = 'high';
      else if (opportunityScore >= 10) odiTier = 'medium';

      return {
        id: jtbd.id,
        code: jtbd.code,
        job_statement: jtbd.name || jtbd.job_statement,
        description: jtbd.job_statement || jtbd.name,
        category: jtbd.job_category,
        job_type: jtbd.job_type,
        job_category: jtbd.job_category,
        complexity: jtbd.complexity,
        frequency: jtbd.frequency,
        priority: mapStrategicPriorityToPriority(jtbd.strategic_priority),
        status: jtbd.status || 'active',
        // ODI scores
        importance_score: jtbd.importance_score,
        satisfaction_score: jtbd.satisfaction_score,
        opportunity_score: jtbd.opportunity_score,
        odi_tier: odiTier,
        // Additional attributes
        work_pattern: jtbd.work_pattern,
        jtbd_type: jtbd.jtbd_type,
        impact_level: jtbd.impact_level,
        compliance_sensitivity: jtbd.compliance_sensitivity,
        recommended_service_layer: jtbd.recommended_service_layer,
        validation_score: jtbd.validation_score,
        // Metadata
        tenant_id: jtbd.tenant_id,
        created_at: jtbd.created_at,
        updated_at: jtbd.updated_at,
      };
    });

    // Calculate stats
    const stats = calculateJtbdStats(transformedJtbds);

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('jtbd_get_completed', duration, {
      operation: 'GET /api/jtbd',
      operationId,
      jtbdCount: transformedJtbds.length,
      totalCount: count,
    });

    return NextResponse.json({
      success: true,
      jtbd: transformedJtbds,
      count: count || 0,
      limit,
      offset,
      stats,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'jtbd_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/jtbd',
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

// Helper to map strategic_priority to simple priority
function mapStrategicPriorityToPriority(strategicPriority?: string): 'high' | 'medium' | 'low' {
  switch (strategicPriority?.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'high';
    case 'medium':
    case 'moderate':
      return 'medium';
    case 'low':
    default:
      return 'low';
  }
}

// Calculate JTBD statistics
function calculateJtbdStats(jtbds: any[]) {
  const byCategory: Record<string, number> = {};
  const byPriority = { high: 0, medium: 0, low: 0 };
  const byStatus = { active: 0, planned: 0, completed: 0, draft: 0 };
  const byComplexity: Record<string, number> = {};
  const byJobCategory: Record<string, number> = {};
  const byOdiTier: Record<string, number> = {};
  
  let totalOpportunityScore = 0;
  let opportunityCount = 0;

  jtbds.forEach((jtbd: any) => {
    // By category/functional area
    const category = jtbd.category || jtbd.functional_area || 'Uncategorized';
    byCategory[category] = (byCategory[category] || 0) + 1;

    // By priority
    if (jtbd.priority) {
      byPriority[jtbd.priority as keyof typeof byPriority]++;
    }

    // By status
    const status = jtbd.status?.toLowerCase() || 'active';
    if (status in byStatus) {
      byStatus[status as keyof typeof byStatus]++;
    }

    // By complexity
    if (jtbd.complexity) {
      byComplexity[jtbd.complexity] = (byComplexity[jtbd.complexity] || 0) + 1;
    }

    // By job category
    if (jtbd.job_category) {
      byJobCategory[jtbd.job_category] = (byJobCategory[jtbd.job_category] || 0) + 1;
    }

    // By ODI tier
    if (jtbd.odi_tier) {
      byOdiTier[jtbd.odi_tier] = (byOdiTier[jtbd.odi_tier] || 0) + 1;
    }

    // Opportunity score average
    if (jtbd.opportunity_score) {
      totalOpportunityScore += parseFloat(jtbd.opportunity_score);
      opportunityCount++;
    }
  });

  return {
    total: jtbds.length,
    byCategory,
    byPriority,
    byStatus,
    byComplexity,
    byJobCategory,
    byOdiTier,
    avgOpportunityScore: opportunityCount > 0 ? Math.round((totalOpportunityScore / opportunityCount) * 100) / 100 : 0,
  };
}
