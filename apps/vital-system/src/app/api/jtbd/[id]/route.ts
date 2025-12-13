import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { z } from 'zod';

// Validation schema for JTBD updates
const updateJtbdSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  code: z.string().max(50).optional(),
  job_statement: z.string().optional(),
  when_situation: z.string().optional(),
  circumstance: z.string().optional(),
  desired_outcome: z.string().optional(),
  job_type: z.enum(['functional', 'emotional', 'social', 'consumption']).optional(),
  job_category: z.string().optional(),
  complexity: z.enum(['low', 'medium', 'high', 'very_high']).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'ad_hoc']).optional(),
  status: z.enum(['active', 'planned', 'completed', 'draft']).optional(),
  strategic_priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  impact_level: z.enum(['high', 'medium', 'low']).optional(),
  compliance_sensitivity: z.enum(['high', 'medium', 'low']).optional(),
  recommended_service_layer: z.string().optional(),
  importance_score: z.number().min(0).max(10).optional(),
  satisfaction_score: z.number().min(0).max(10).optional(),
  opportunity_score: z.number().min(0).max(20).optional(),
  validation_score: z.number().min(0).max(100).optional(),
  work_pattern: z.string().optional(),
  jtbd_type: z.string().optional(),
});

// GET single JTBD by ID
export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const { id } = await params;
  const operationId = `jtbd_get_${id}_${Date.now()}`;
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { profile } = context;

    logger.info('jtbd_get_started', {
      operation: 'GET /api/jtbd/[id]',
      operationId,
      jtbdId: id,
      userId: context.user.id,
      tenantId: profile.tenant_id,
    });

    // Fetch JTBD
    const { data: jtbd, error } = await supabase
      .from('jtbd')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !jtbd) {
      logger.warn('jtbd_not_found', { operationId, jtbdId: id, error: error?.message });
      return NextResponse.json(
        { error: 'JTBD not found', details: error?.message },
        { status: 404 }
      );
    }

    // Check tenant access (skip in dev or for admins)
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && profile.role !== 'super_admin' && profile.role !== 'admin') {
      if (jtbd.tenant_id && jtbd.tenant_id !== profile.tenant_id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Calculate ODI tier
    const opportunityScore = parseFloat(jtbd.opportunity_score) || 0;
    let odiTier = 'low';
    if (opportunityScore >= 15) odiTier = 'extreme';
    else if (opportunityScore >= 12) odiTier = 'high';
    else if (opportunityScore >= 10) odiTier = 'medium';

    // Transform to frontend format
    const transformedJtbd = {
      id: jtbd.id,
      code: jtbd.code,
      name: jtbd.name,
      job_statement: jtbd.job_statement,
      description: jtbd.job_statement,
      when_situation: jtbd.when_situation,
      circumstance: jtbd.circumstance,
      desired_outcome: jtbd.desired_outcome,
      job_type: jtbd.job_type,
      job_category: jtbd.job_category,
      category: jtbd.job_category,
      complexity: jtbd.complexity,
      frequency: jtbd.frequency,
      status: jtbd.status || 'active',
      priority: mapStrategicPriorityToPriority(jtbd.strategic_priority),
      strategic_priority: jtbd.strategic_priority,
      impact_level: jtbd.impact_level,
      compliance_sensitivity: jtbd.compliance_sensitivity,
      recommended_service_layer: jtbd.recommended_service_layer,
      importance_score: jtbd.importance_score,
      satisfaction_score: jtbd.satisfaction_score,
      opportunity_score: jtbd.opportunity_score,
      odi_tier: odiTier,
      validation_score: jtbd.validation_score,
      work_pattern: jtbd.work_pattern,
      jtbd_type: jtbd.jtbd_type,
      tenant_id: jtbd.tenant_id,
      created_at: jtbd.created_at,
      updated_at: jtbd.updated_at,
    };

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('jtbd_get_completed', duration, {
      operation: 'GET /api/jtbd/[id]',
      operationId,
      jtbdId: id,
    });

    return NextResponse.json({ success: true, jtbd: transformedJtbd });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('jtbd_get_error', error instanceof Error ? error : new Error(String(error)), {
      operation: 'GET /api/jtbd/[id]',
      operationId,
      jtbdId: id,
      duration,
    });

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

// PUT update JTBD
export const PUT = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const { id } = await params;
  const operationId = `jtbd_update_${id}_${Date.now()}`;
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { profile } = context;
    const body = await request.json();

    logger.info('jtbd_update_started', {
      operation: 'PUT /api/jtbd/[id]',
      operationId,
      jtbdId: id,
      userId: context.user.id,
      tenantId: profile.tenant_id,
    });

    // Validate input
    const validationResult = updateJtbdSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Check JTBD exists and user has access
    const { data: existingJtbd, error: fetchError } = await supabase
      .from('jtbd')
      .select('id, tenant_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (fetchError || !existingJtbd) {
      return NextResponse.json({ error: 'JTBD not found' }, { status: 404 });
    }

    // Check tenant access
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && profile.role !== 'super_admin' && profile.role !== 'admin') {
      if (existingJtbd.tenant_id && existingJtbd.tenant_id !== profile.tenant_id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Auto-calculate opportunity score if importance and satisfaction are provided
    let opportunityScore = validationResult.data.opportunity_score;
    if (
      opportunityScore === undefined &&
      validationResult.data.importance_score !== undefined &&
      validationResult.data.satisfaction_score !== undefined
    ) {
      // ODI formula: Opportunity = Importance + (Importance - Satisfaction)
      const imp = validationResult.data.importance_score;
      const sat = validationResult.data.satisfaction_score;
      opportunityScore = imp + Math.max(0, imp - sat);
    }

    // Update JTBD
    const updateData = {
      ...validationResult.data,
      ...(opportunityScore !== undefined && { opportunity_score: opportunityScore }),
      updated_at: new Date().toISOString(),
    };

    const { data: updatedJtbd, error: updateError } = await supabase
      .from('jtbd')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('jtbd_update_failed', new Error(updateError.message), {
        operationId,
        jtbdId: id,
      });
      return NextResponse.json(
        { error: 'Failed to update JTBD', details: updateError.message },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('jtbd_update_completed', duration, {
      operation: 'PUT /api/jtbd/[id]',
      operationId,
      jtbdId: id,
    });

    return NextResponse.json({ success: true, jtbd: updatedJtbd });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('jtbd_update_error', error instanceof Error ? error : new Error(String(error)), {
      operation: 'PUT /api/jtbd/[id]',
      operationId,
      jtbdId: id,
      duration,
    });

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

// DELETE JTBD (soft delete)
export const DELETE = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const { id } = await params;
  const operationId = `jtbd_delete_${id}_${Date.now()}`;
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { profile } = context;

    logger.info('jtbd_delete_started', {
      operation: 'DELETE /api/jtbd/[id]',
      operationId,
      jtbdId: id,
      userId: context.user.id,
      tenantId: profile.tenant_id,
    });

    // Check JTBD exists and user has access
    const { data: existingJtbd, error: fetchError } = await supabase
      .from('jtbd')
      .select('id, tenant_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (fetchError || !existingJtbd) {
      return NextResponse.json({ error: 'JTBD not found' }, { status: 404 });
    }

    // Check tenant access
    const isDev = process.env.NODE_ENV === 'development';
    const isAdmin = profile.role === 'super_admin' || profile.role === 'admin';

    if (!isDev && !isAdmin) {
      if (existingJtbd.tenant_id && existingJtbd.tenant_id !== profile.tenant_id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Soft delete - set deleted_at timestamp
    const { error: deleteError } = await supabase
      .from('jtbd')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (deleteError) {
      logger.error('jtbd_delete_failed', new Error(deleteError.message), {
        operationId,
        jtbdId: id,
      });
      return NextResponse.json(
        { error: 'Failed to delete JTBD', details: deleteError.message },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('jtbd_delete_completed', duration, {
      operation: 'DELETE /api/jtbd/[id]',
      operationId,
      jtbdId: id,
    });

    return NextResponse.json({ success: true, message: 'JTBD deleted successfully' });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('jtbd_delete_error', error instanceof Error ? error : new Error(String(error)), {
      operation: 'DELETE /api/jtbd/[id]',
      operationId,
      jtbdId: id,
      duration,
    });

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
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
