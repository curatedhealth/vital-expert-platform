import { NextResponse, NextRequest } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface SkillUpdate {
  name?: string;
  slug?: string;
  description?: string;
  implementation_type?: 'prompt' | 'tool' | 'workflow' | 'agent_graph';
  implementation_ref?: string;
  category?: string;
  complexity_score?: number;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * GET /api/skills/[id] - Get a specific skill by ID or slug
 */
export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: RouteParams
) => {
  const logger = createLogger();
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const operationId = `skill_get_${Date.now()}`;

  try {
    const supabase = getServiceSupabaseClient();

    logger.info('skill_get_started', {
      operationId,
      skillId: id,
      userId: context.user.id,
    });

    // Try to find by ID first, then by slug
    let query = supabase.from('skills').select('*');

    // UUID regex to determine if id is UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data: skill, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('skill_not_found', { operationId, skillId: id });
        return NextResponse.json(
          { error: 'Skill not found' },
          { status: 404 }
        );
      }

      logger.error('skill_get_error', new Error(error.message), {
        operationId,
        code: error.code,
      });
      return NextResponse.json(
        { error: 'Failed to fetch skill', details: error.message },
        { status: 500 }
      );
    }

    logger.info('skill_get_success', {
      operationId,
      skillId: skill.id,
      skillSlug: skill.slug,
    });

    return NextResponse.json({ skill });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('skill_get_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/skills/[id] - Update a skill (superadmin only)
 */
export const PUT = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: RouteParams
) => {
  const logger = createLogger();
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const operationId = `skill_update_${Date.now()}`;

  try {
    const { profile } = context;

    // Check if user is superadmin or admin
    if (profile.role !== 'super_admin' && profile.role !== 'admin') {
      logger.warn('skill_update_unauthorized', {
        operationId,
        userId: context.user.id,
        role: profile.role,
      });
      return NextResponse.json(
        { error: 'Unauthorized. Only super_admin or admin can update skills.' },
        { status: 403 }
      );
    }

    const body: SkillUpdate = await request.json();

    // Validate slug format if provided
    if (body.slug && !/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        { error: 'Slug must be lowercase alphanumeric with hyphens only' },
        { status: 400 }
      );
    }

    // Validate complexity score if provided
    if (body.complexity_score !== undefined &&
        (body.complexity_score < 1 || body.complexity_score > 10)) {
      return NextResponse.json(
        { error: 'Complexity score must be between 1 and 10' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabaseClient();

    logger.info('skill_update_started', {
      operationId,
      skillId: id,
      userId: context.user.id,
      updateFields: Object.keys(body),
    });

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.implementation_type !== undefined) updateData.implementation_type = body.implementation_type;
    if (body.implementation_ref !== undefined) updateData.implementation_ref = body.implementation_ref;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.complexity_score !== undefined) updateData.complexity_score = body.complexity_score;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // UUID regex to determine if id is UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase.from('skills').update(updateData);

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data: skill, error } = await query.select().single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('skill_update_not_found', { operationId, skillId: id });
        return NextResponse.json(
          { error: 'Skill not found' },
          { status: 404 }
        );
      }

      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A skill with this slug already exists' },
          { status: 409 }
        );
      }

      logger.error('skill_update_error', new Error(error.message), {
        operationId,
        code: error.code,
      });
      return NextResponse.json(
        { error: 'Failed to update skill', details: error.message },
        { status: 500 }
      );
    }

    logger.info('skill_update_success', {
      operationId,
      skillId: skill.id,
      skillSlug: skill.slug,
    });

    return NextResponse.json({ skill });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('skill_update_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/skills/[id] - Delete a skill (superadmin only)
 */
export const DELETE = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: RouteParams
) => {
  const logger = createLogger();
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const operationId = `skill_delete_${Date.now()}`;

  try {
    const { profile } = context;

    // Check if user is superadmin or admin
    if (profile.role !== 'super_admin' && profile.role !== 'admin') {
      logger.warn('skill_delete_unauthorized', {
        operationId,
        userId: context.user.id,
        role: profile.role,
      });
      return NextResponse.json(
        { error: 'Unauthorized. Only super_admin or admin can delete skills.' },
        { status: 403 }
      );
    }

    const supabase = getServiceSupabaseClient();

    logger.info('skill_delete_started', {
      operationId,
      skillId: id,
      userId: context.user.id,
    });

    // UUID regex to determine if id is UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase.from('skills').delete();

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data, error } = await query.select().single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('skill_delete_not_found', { operationId, skillId: id });
        return NextResponse.json(
          { error: 'Skill not found' },
          { status: 404 }
        );
      }

      logger.error('skill_delete_error', new Error(error.message), {
        operationId,
        code: error.code,
      });
      return NextResponse.json(
        { error: 'Failed to delete skill', details: error.message },
        { status: 500 }
      );
    }

    logger.info('skill_delete_success', {
      operationId,
      skillId: id,
    });

    return NextResponse.json({
      message: 'Skill deleted successfully',
      deletedSkill: data,
    });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('skill_delete_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
