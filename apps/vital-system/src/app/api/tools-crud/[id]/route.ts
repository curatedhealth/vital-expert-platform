import { NextResponse, NextRequest } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface ToolUpdate {
  name?: string;
  code?: string;
  tool_description?: string;
  llm_description?: string;
  category?: string;
  category_parent?: string;
  tool_type?: 'function' | 'api' | 'workflow' | 'mcp';
  implementation_type?: string;
  function_name?: string;
  implementation_path?: string;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  documentation_url?: string;
  vendor?: string;
  version?: string;
  tags?: string[];
  capabilities?: string[];
  max_execution_time_seconds?: number;
  access_level?: 'public' | 'premium' | 'restricted';
  is_active?: boolean;
  langgraph_compatible?: boolean;
  lifecycle_stage?: string;
  health_status?: string;
  business_impact?: string;
  usage_guide?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * GET /api/tools-crud/[id] - Get a specific tool by ID or code
 */
export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: RouteParams
) => {
  const logger = createLogger();
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const operationId = `tool_get_${Date.now()}`;

  try {
    const supabase = getServiceSupabaseClient();

    logger.info('tool_get_started', {
      operationId,
      toolId: id,
      userId: context.user.id,
    });

    // Try to find by ID first, then by code
    let query = supabase
      .from('dh_tool')
      .select('*')
      .eq('tenant_id', STARTUP_TENANT_ID);

    // UUID regex to determine if id is UUID or code
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('code', id);
    }

    const { data: tool, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('tool_not_found', { operationId, toolId: id });
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        );
      }

      logger.error('tool_get_error', new Error(error.message), {
        operationId,
        code: error.code,
      });
      return NextResponse.json(
        { error: 'Failed to fetch tool', details: error.message },
        { status: 500 }
      );
    }

    logger.info('tool_get_success', {
      operationId,
      toolId: tool.id,
      toolCode: tool.code,
    });

    return NextResponse.json({ tool });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('tool_get_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/tools-crud/[id] - Update a tool (admin only)
 */
export const PUT = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: RouteParams
) => {
  const logger = createLogger();
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const operationId = `tool_update_${Date.now()}`;

  try {
    const { profile } = context;

    // Check if user is superadmin or admin
    if (profile.role !== 'super_admin' && profile.role !== 'admin') {
      logger.warn('tool_update_unauthorized', {
        operationId,
        userId: context.user.id,
        role: profile.role,
      });
      return NextResponse.json(
        { error: 'Unauthorized. Only super_admin or admin can update tools.' },
        { status: 403 }
      );
    }

    const body: ToolUpdate = await request.json();

    // Validate code format if provided
    if (body.code && !/^[a-z0-9_-]+$/.test(body.code)) {
      return NextResponse.json(
        { error: 'Code must be lowercase alphanumeric with hyphens/underscores only' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabaseClient();

    logger.info('tool_update_started', {
      operationId,
      toolId: id,
      userId: context.user.id,
      updateFields: Object.keys(body),
    });

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.code !== undefined) updateData.code = body.code;
    if (body.tool_description !== undefined) updateData.tool_description = body.tool_description;
    if (body.llm_description !== undefined) updateData.llm_description = body.llm_description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.category_parent !== undefined) updateData.category_parent = body.category_parent;
    if (body.tool_type !== undefined) updateData.tool_type = body.tool_type;
    if (body.implementation_type !== undefined) updateData.implementation_type = body.implementation_type;
    if (body.function_name !== undefined) updateData.function_name = body.function_name;
    if (body.implementation_path !== undefined) updateData.implementation_path = body.implementation_path;
    if (body.input_schema !== undefined) updateData.input_schema = body.input_schema;
    if (body.output_schema !== undefined) updateData.output_schema = body.output_schema;
    if (body.documentation_url !== undefined) updateData.documentation_url = body.documentation_url;
    if (body.vendor !== undefined) updateData.vendor = body.vendor;
    if (body.version !== undefined) updateData.version = body.version;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.capabilities !== undefined) updateData.capabilities = body.capabilities;
    if (body.max_execution_time_seconds !== undefined) updateData.max_execution_time_seconds = body.max_execution_time_seconds;
    if (body.access_level !== undefined) updateData.access_level = body.access_level;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.langgraph_compatible !== undefined) updateData.langgraph_compatible = body.langgraph_compatible;
    if (body.lifecycle_stage !== undefined) updateData.lifecycle_stage = body.lifecycle_stage;
    if (body.health_status !== undefined) updateData.health_status = body.health_status;
    if (body.business_impact !== undefined) updateData.business_impact = body.business_impact;
    if (body.usage_guide !== undefined) updateData.usage_guide = body.usage_guide;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // UUID regex to determine if id is UUID or code
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase
      .from('dh_tool')
      .update(updateData)
      .eq('tenant_id', STARTUP_TENANT_ID);

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('code', id);
    }

    const { data: tool, error } = await query.select().single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('tool_update_not_found', { operationId, toolId: id });
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        );
      }

      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A tool with this code already exists' },
          { status: 409 }
        );
      }

      logger.error('tool_update_error', new Error(error.message), {
        operationId,
        code: error.code,
      });
      return NextResponse.json(
        { error: 'Failed to update tool', details: error.message },
        { status: 500 }
      );
    }

    logger.info('tool_update_success', {
      operationId,
      toolId: tool.id,
      toolCode: tool.code,
    });

    return NextResponse.json({ tool });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('tool_update_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/tools-crud/[id] - Delete a tool (admin only)
 */
export const DELETE = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: RouteParams
) => {
  const logger = createLogger();
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const operationId = `tool_delete_${Date.now()}`;

  try {
    const { profile } = context;

    // Check if user is superadmin or admin
    if (profile.role !== 'super_admin' && profile.role !== 'admin') {
      logger.warn('tool_delete_unauthorized', {
        operationId,
        userId: context.user.id,
        role: profile.role,
      });
      return NextResponse.json(
        { error: 'Unauthorized. Only super_admin or admin can delete tools.' },
        { status: 403 }
      );
    }

    const supabase = getServiceSupabaseClient();

    logger.info('tool_delete_started', {
      operationId,
      toolId: id,
      userId: context.user.id,
    });

    // UUID regex to determine if id is UUID or code
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase
      .from('dh_tool')
      .delete()
      .eq('tenant_id', STARTUP_TENANT_ID);

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('code', id);
    }

    const { data, error } = await query.select().single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('tool_delete_not_found', { operationId, toolId: id });
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        );
      }

      logger.error('tool_delete_error', new Error(error.message), {
        operationId,
        code: error.code,
      });
      return NextResponse.json(
        { error: 'Failed to delete tool', details: error.message },
        { status: 500 }
      );
    }

    logger.info('tool_delete_success', {
      operationId,
      toolId: id,
    });

    return NextResponse.json({
      message: 'Tool deleted successfully',
      deletedTool: data,
    });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('tool_delete_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
