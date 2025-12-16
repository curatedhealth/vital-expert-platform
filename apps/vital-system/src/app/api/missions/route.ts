import { NextResponse, NextRequest } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';

// Mission template schema for validation
interface MissionTemplateInput {
  id: string;
  name: string;
  family: 'DEEP_RESEARCH' | 'MONITORING' | 'EVALUATION' | 'STRATEGY' | 'INVESTIGATION' | 'PROBLEM_SOLVING' | 'PREPARATION' | 'GENERIC';
  category: string;
  description: string;
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
 * GET /api/missions - List all mission templates
 */
export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `missions_get_${Date.now()}`;

  try {
    const supabase = getServiceSupabaseClient();
    const { profile } = context;

    const { searchParams } = new URL(request.url);
    const family = searchParams.get('family');
    const category = searchParams.get('category');
    const complexity = searchParams.get('complexity');
    const isActive = searchParams.get('is_active');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    logger.info('missions_get_started', {
      operation: 'GET /api/missions',
      operationId,
      userId: context.user.id,
      tenantId: profile.tenant_id,
      family,
      category,
      complexity,
      isActive,
      limit,
      offset,
    });

    // Build query
    let query = supabase
      .from('mission_templates')
      .select('*', { count: 'exact' });

    // Apply filters
    if (family) {
      query = query.eq('family', family);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (complexity) {
      query = query.eq('complexity', complexity);
    }
    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    }

    // Apply pagination and ordering
    query = query
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: missions, error, count } = await query;

    if (error) {
      logger.error('missions_get_error', new Error(error.message), {
        operationId,
        code: error.code,
      });
      return NextResponse.json(
        { error: 'Failed to fetch mission templates', details: error.message },
        { status: 500 }
      );
    }

    logger.info('missions_get_success', {
      operationId,
      count: missions?.length || 0,
      totalCount: count,
    });

    return NextResponse.json({
      missions: missions || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('missions_get_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/missions - Create a new mission template (admin only)
 */
export const POST = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `missions_create_${Date.now()}`;

  try {
    const { profile } = context;

    // Check if user is superadmin or admin
    if (profile.role !== 'super_admin' && profile.role !== 'admin') {
      logger.warn('missions_create_unauthorized', {
        operationId,
        userId: context.user.id,
        role: profile.role,
      });
      return NextResponse.json(
        { error: 'Unauthorized. Only super_admin or admin can create mission templates.' },
        { status: 403 }
      );
    }

    const body: MissionTemplateInput = await request.json();

    // Validate required fields
    if (!body.id || !body.name || !body.family || !body.category || !body.description) {
      return NextResponse.json(
        { error: 'id, name, family, category, and description are required' },
        { status: 400 }
      );
    }

    // Validate id format (lowercase alphanumeric with underscores)
    if (!/^[a-z0-9_]+$/.test(body.id)) {
      return NextResponse.json(
        { error: 'ID must be lowercase alphanumeric with underscores only' },
        { status: 400 }
      );
    }

    // Validate family
    const validFamilies = ['DEEP_RESEARCH', 'MONITORING', 'EVALUATION', 'STRATEGY', 'INVESTIGATION', 'PROBLEM_SOLVING', 'PREPARATION', 'GENERIC'];
    if (!validFamilies.includes(body.family)) {
      return NextResponse.json(
        { error: `Family must be one of: ${validFamilies.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate complexity
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

    logger.info('missions_create_started', {
      operationId,
      userId: context.user.id,
      missionId: body.id,
      missionName: body.name,
    });

    // Create the mission template
    const { data: mission, error } = await supabase
      .from('mission_templates')
      .insert({
        id: body.id,
        name: body.name,
        family: body.family,
        category: body.category,
        description: body.description,
        long_description: body.long_description || null,
        complexity: body.complexity || 'medium',
        estimated_duration_min: body.estimated_duration_min || 30,
        estimated_duration_max: body.estimated_duration_max || 60,
        estimated_cost_min: body.estimated_cost_min || 1.00,
        estimated_cost_max: body.estimated_cost_max || 5.00,
        required_agent_tiers: body.required_agent_tiers || [],
        recommended_agents: body.recommended_agents || [],
        min_agents: body.min_agents || 1,
        max_agents: body.max_agents || 5,
        tasks: body.tasks || [],
        checkpoints: body.checkpoints || [],
        required_inputs: body.required_inputs || [],
        optional_inputs: body.optional_inputs || [],
        outputs: body.outputs || [],
        tags: body.tags || [],
        use_cases: body.use_cases || [],
        example_queries: body.example_queries || [],
        workflow_config: body.workflow_config || {},
        tool_requirements: body.tool_requirements || [],
        mode_4_constraints: body.mode_4_constraints || {
          max_cost: 5.00,
          max_iterations: 10,
          max_wall_time_minutes: 30,
          max_api_calls: 100,
          allow_auto_continue: false,
        },
        is_active: body.is_active ?? true,
        version: body.version || '1.0',
      })
      .select()
      .single();

    if (error) {
      logger.error('missions_create_error', new Error(error.message), {
        operationId,
        code: error.code,
      });

      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A mission template with this ID already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create mission template', details: error.message },
        { status: 500 }
      );
    }

    logger.info('missions_create_success', {
      operationId,
      missionId: mission.id,
    });

    return NextResponse.json({ mission }, { status: 201 });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('missions_create_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
