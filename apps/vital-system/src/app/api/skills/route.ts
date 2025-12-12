import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';

// Skill schema for validation
interface SkillInput {
  name: string;
  slug: string;
  description?: string;
  implementation_type?: 'prompt' | 'tool' | 'workflow' | 'agent_graph';
  implementation_ref?: string;
  category?: string;
  complexity_score?: number;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * GET /api/skills - List all skills
 */
export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `skills_get_${Date.now()}`;

  try {
    const supabase = getServiceSupabaseClient();
    const { profile } = context;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('is_active');
    const implementationType = searchParams.get('implementation_type');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    logger.info('skills_get_started', {
      operation: 'GET /api/skills',
      operationId,
      userId: context.user.id,
      tenantId: profile.tenant_id,
      category,
      isActive,
      limit,
      offset,
    });

    // Build query
    let query = supabase
      .from('skills')
      .select('*', { count: 'exact' });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    }
    if (implementationType) {
      query = query.eq('implementation_type', implementationType);
    }

    // Apply pagination and ordering
    query = query
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: skills, error, count } = await query;

    if (error) {
      logger.error('skills_get_error', new Error(error.message), {
        operationId,
        code: error.code,
      });
      return NextResponse.json(
        { error: 'Failed to fetch skills', details: error.message },
        { status: 500 }
      );
    }

    logger.info('skills_get_success', {
      operationId,
      count: skills?.length || 0,
      totalCount: count,
    });

    return NextResponse.json({
      skills: skills || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('skills_get_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/skills - Create a new skill (superadmin only)
 */
export const POST = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `skills_create_${Date.now()}`;

  try {
    const { profile } = context;

    // Check if user is superadmin or admin
    if (profile.role !== 'super_admin' && profile.role !== 'admin') {
      logger.warn('skills_create_unauthorized', {
        operationId,
        userId: context.user.id,
        role: profile.role,
      });
      return NextResponse.json(
        { error: 'Unauthorized. Only super_admin or admin can create skills.' },
        { status: 403 }
      );
    }

    const body: SkillInput = await request.json();

    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        { error: 'Slug must be lowercase alphanumeric with hyphens only' },
        { status: 400 }
      );
    }

    // Validate complexity score
    if (body.complexity_score !== undefined &&
        (body.complexity_score < 1 || body.complexity_score > 10)) {
      return NextResponse.json(
        { error: 'Complexity score must be between 1 and 10' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabaseClient();

    logger.info('skills_create_started', {
      operationId,
      userId: context.user.id,
      skillName: body.name,
      skillSlug: body.slug,
    });

    // Create the skill
    const { data: skill, error } = await supabase
      .from('skills')
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        implementation_type: body.implementation_type || 'prompt',
        implementation_ref: body.implementation_ref || null,
        category: body.category || null,
        complexity_score: body.complexity_score || 5,
        is_active: body.is_active ?? true,
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (error) {
      logger.error('skills_create_error', new Error(error.message), {
        operationId,
        code: error.code,
      });

      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A skill with this slug already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create skill', details: error.message },
        { status: 500 }
      );
    }

    logger.info('skills_create_success', {
      operationId,
      skillId: skill.id,
      skillSlug: skill.slug,
    });

    return NextResponse.json({ skill }, { status: 201 });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('skills_create_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
