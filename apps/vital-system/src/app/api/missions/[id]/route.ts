import { NextResponse, NextRequest } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface MissionTemplateUpdate {
  name?: string;
  family?: 'DEEP_RESEARCH' | 'MONITORING' | 'EVALUATION' | 'STRATEGY' | 'INVESTIGATION' | 'PROBLEM_SOLVING' | 'PREPARATION' | 'GENERIC';
  category?: string;
  description?: string;
  long_description?: string;
  complexity?: 'low' | 'medium' | 'high' | 'critical';
  estimated_duration_min?: number;
  estimated_duration_max?: number;
  estimated_cost_min?: number;
  estimated_cost_max?: number;
  required_agent_tiers?: string[];
  recommended_agents?: string[];
  min_agents?: number;
  max_agents?: number;
  tasks?: Record<string, unknown>[];
  checkpoints?: Record<string, unknown>[];
  required_inputs?: Record<string, unknown>[];
  optional_inputs?: Record<string, unknown>[];
  outputs?: Record<string, unknown>[];
  tags?: string[];
  use_cases?: string[];
  example_queries?: string[];
  workflow_config?: Record<string, unknown>;
  tool_requirements?: Record<string, unknown>[];
  mode_4_constraints?: Record<string, unknown>;
  is_active?: boolean;
  version?: string;
}

/**
 * GET /api/missions/[id] - Get a specific mission template by ID
 */
export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: RouteParams
) => {
  const logger = createLogger();
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const operationId = `mission_get_${Date.now()}`;

  try {
    const supabase = getServiceSupabaseClient();

    logger.info('mission_get_started', {
      operationId,
      missionId: id,
      userId: context.user.id,
    });

    const { data: mission, error } = await supabase
      .from('mission_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('mission_not_found', { operationId, missionId: id });
        return NextResponse.json(
          { error: 'Mission template not found' },
          { status: 404 }
        );
      }

      logger.error('mission_get_error', new Error(error.message), {
        operationId,
        code: error.code,
      });
      return NextResponse.json(
        { error: 'Failed to fetch mission template', details: error.message },
        { status: 500 }
      );
    }

    logger.info('mission_get_success', {
      operationId,
      missionId: mission.id,
    });

    return NextResponse.json({ mission });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('mission_get_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/missions/[id] - Update a mission template (admin only)
 */
export const PUT = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: RouteParams
) => {
  const logger = createLogger();
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const operationId = `mission_update_${Date.now()}`;

  try {
    const { profile } = context;

    // Check if user is superadmin or admin
    if (profile.role !== 'super_admin' && profile.role !== 'admin') {
      logger.warn('mission_update_unauthorized', {
        operationId,
        userId: context.user.id,
        role: profile.role,
      });
      return NextResponse.json(
        { error: 'Unauthorized. Only super_admin or admin can update mission templates.' },
        { status: 403 }
      );
    }

    const body: MissionTemplateUpdate = await request.json();

    // Validate family if provided
    if (body.family) {
      const validFamilies = ['DEEP_RESEARCH', 'MONITORING', 'EVALUATION', 'STRATEGY', 'INVESTIGATION', 'PROBLEM_SOLVING', 'PREPARATION', 'GENERIC'];
      if (!validFamilies.includes(body.family)) {
        return NextResponse.json(
          { error: `Family must be one of: ${validFamilies.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate complexity if provided
    if (body.complexity) {
      const validComplexities = ['low', 'medium', 'high', 'critical'];
      if (!validComplexities.includes(body.complexity)) {
        return NextResponse.json(
          { error: `Complexity must be one of: ${validComplexities.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const supabase = getServiceSupabaseClient();

    logger.info('mission_update_started', {
      operationId,
      missionId: id,
      userId: context.user.id,
      updateFields: Object.keys(body),
    });

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.family !== undefined) updateData.family = body.family;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.long_description !== undefined) updateData.long_description = body.long_description;
    if (body.complexity !== undefined) updateData.complexity = body.complexity;
    if (body.estimated_duration_min !== undefined) updateData.estimated_duration_min = body.estimated_duration_min;
    if (body.estimated_duration_max !== undefined) updateData.estimated_duration_max = body.estimated_duration_max;
    if (body.estimated_cost_min !== undefined) updateData.estimated_cost_min = body.estimated_cost_min;
    if (body.estimated_cost_max !== undefined) updateData.estimated_cost_max = body.estimated_cost_max;
    if (body.required_agent_tiers !== undefined) updateData.required_agent_tiers = body.required_agent_tiers;
    if (body.recommended_agents !== undefined) updateData.recommended_agents = body.recommended_agents;
    if (body.min_agents !== undefined) updateData.min_agents = body.min_agents;
    if (body.max_agents !== undefined) updateData.max_agents = body.max_agents;
    if (body.tasks !== undefined) updateData.tasks = body.tasks;
    if (body.checkpoints !== undefined) updateData.checkpoints = body.checkpoints;
    if (body.required_inputs !== undefined) updateData.required_inputs = body.required_inputs;
    if (body.optional_inputs !== undefined) updateData.optional_inputs = body.optional_inputs;
    if (body.outputs !== undefined) updateData.outputs = body.outputs;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.use_cases !== undefined) updateData.use_cases = body.use_cases;
    if (body.example_queries !== undefined) updateData.example_queries = body.example_queries;
    if (body.workflow_config !== undefined) updateData.workflow_config = body.workflow_config;
    if (body.tool_requirements !== undefined) updateData.tool_requirements = body.tool_requirements;
    if (body.mode_4_constraints !== undefined) updateData.mode_4_constraints = body.mode_4_constraints;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.version !== undefined) updateData.version = body.version;

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: mission, error } = await supabase
      .from('mission_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('mission_update_not_found', { operationId, missionId: id });
        return NextResponse.json(
          { error: 'Mission template not found' },
          { status: 404 }
        );
      }

      logger.error('mission_update_error', new Error(error.message), {
        operationId,
        code: error.code,
      });
      return NextResponse.json(
        { error: 'Failed to update mission template', details: error.message },
        { status: 500 }
      );
    }

    logger.info('mission_update_success', {
      operationId,
      missionId: mission.id,
    });

    return NextResponse.json({ mission });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('mission_update_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/missions/[id] - Delete a mission template (admin only)
 */
export const DELETE = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: RouteParams
) => {
  const logger = createLogger();
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const operationId = `mission_delete_${Date.now()}`;

  try {
    const { profile } = context;

    // Check if user is superadmin or admin
    if (profile.role !== 'super_admin' && profile.role !== 'admin') {
      logger.warn('mission_delete_unauthorized', {
        operationId,
        userId: context.user.id,
        role: profile.role,
      });
      return NextResponse.json(
        { error: 'Unauthorized. Only super_admin or admin can delete mission templates.' },
        { status: 403 }
      );
    }

    const supabase = getServiceSupabaseClient();

    logger.info('mission_delete_started', {
      operationId,
      missionId: id,
      userId: context.user.id,
    });

    const { data, error } = await supabase
      .from('mission_templates')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('mission_delete_not_found', { operationId, missionId: id });
        return NextResponse.json(
          { error: 'Mission template not found' },
          { status: 404 }
        );
      }

      logger.error('mission_delete_error', new Error(error.message), {
        operationId,
        code: error.code,
      });
      return NextResponse.json(
        { error: 'Failed to delete mission template', details: error.message },
        { status: 500 }
      );
    }

    logger.info('mission_delete_success', {
      operationId,
      missionId: id,
    });

    return NextResponse.json({
      message: 'Mission template deleted successfully',
      deletedMission: data,
    });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('mission_delete_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
