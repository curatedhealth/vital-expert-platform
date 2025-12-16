import { NextResponse, NextRequest } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface DuplicateOptions {
  newId?: string;
  newName?: string;
}

/**
 * POST /api/missions/[id]/duplicate - Duplicate a mission template (admin only)
 */
export const POST = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: RouteParams
) => {
  const logger = createLogger();
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const operationId = `mission_duplicate_${Date.now()}`;

  try {
    const { profile } = context;

    // Check if user is superadmin or admin
    if (profile.role !== 'super_admin' && profile.role !== 'admin') {
      logger.warn('mission_duplicate_unauthorized', {
        operationId,
        userId: context.user.id,
        role: profile.role,
      });
      return NextResponse.json(
        { error: 'Unauthorized. Only super_admin or admin can duplicate mission templates.' },
        { status: 403 }
      );
    }

    // Parse optional body for customization
    let options: DuplicateOptions = {};
    try {
      options = await request.json();
    } catch {
      // Body is optional, use defaults
    }

    const supabase = getServiceSupabaseClient();

    logger.info('mission_duplicate_started', {
      operationId,
      sourceMissionId: id,
      userId: context.user.id,
    });

    // First, fetch the source mission template
    const { data: source, error: fetchError } = await supabase
      .from('mission_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        logger.info('mission_duplicate_source_not_found', { operationId, missionId: id });
        return NextResponse.json(
          { error: 'Source mission template not found' },
          { status: 404 }
        );
      }

      logger.error('mission_duplicate_fetch_error', new Error(fetchError.message), {
        operationId,
        code: fetchError.code,
      });
      return NextResponse.json(
        { error: 'Failed to fetch source mission template', details: fetchError.message },
        { status: 500 }
      );
    }

    // Generate new ID if not provided
    const timestamp = Date.now();
    const newId = options.newId || `${source.id}_copy_${timestamp}`;
    const newName = options.newName || `${source.name} (Copy)`;

    // Validate new ID format
    if (!/^[a-z0-9_]+$/.test(newId)) {
      return NextResponse.json(
        { error: 'New ID must be lowercase alphanumeric with underscores only' },
        { status: 400 }
      );
    }

    // Create the duplicate
    const { data: duplicate, error: createError } = await supabase
      .from('mission_templates')
      .insert({
        id: newId,
        name: newName,
        family: source.family,
        category: source.category,
        description: source.description,
        long_description: source.long_description,
        complexity: source.complexity,
        estimated_duration_min: source.estimated_duration_min,
        estimated_duration_max: source.estimated_duration_max,
        estimated_cost_min: source.estimated_cost_min,
        estimated_cost_max: source.estimated_cost_max,
        required_agent_tiers: source.required_agent_tiers,
        recommended_agents: source.recommended_agents,
        min_agents: source.min_agents,
        max_agents: source.max_agents,
        tasks: source.tasks,
        checkpoints: source.checkpoints,
        required_inputs: source.required_inputs,
        optional_inputs: source.optional_inputs,
        outputs: source.outputs,
        tags: source.tags,
        use_cases: source.use_cases,
        example_queries: source.example_queries,
        workflow_config: source.workflow_config,
        tool_requirements: source.tool_requirements,
        mode_4_constraints: source.mode_4_constraints,
        is_active: false, // Start as inactive
        version: '1.0',
      })
      .select()
      .single();

    if (createError) {
      if (createError.code === '23505') {
        return NextResponse.json(
          { error: 'A mission template with this ID already exists' },
          { status: 409 }
        );
      }

      logger.error('mission_duplicate_create_error', new Error(createError.message), {
        operationId,
        code: createError.code,
      });
      return NextResponse.json(
        { error: 'Failed to create duplicate mission template', details: createError.message },
        { status: 500 }
      );
    }

    logger.info('mission_duplicate_success', {
      operationId,
      sourceMissionId: id,
      newMissionId: duplicate.id,
    });

    return NextResponse.json({
      message: 'Mission template duplicated successfully',
      mission: duplicate,
      sourceId: id,
    }, { status: 201 });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('mission_duplicate_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
