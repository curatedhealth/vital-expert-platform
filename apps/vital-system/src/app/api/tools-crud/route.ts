import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';

export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `tools_get_${Date.now()}`;
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { profile } = context;

    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    logger.info('tools_get_started', {
      operation: 'GET /api/tools-crud',
      operationId,
      userId: context.user.id,
      tenantId: profile.tenant_id,
      role: profile.role,
      showAll,
      limit,
      offset,
    });

    // Build query with category JOIN
    let query = supabase
      .from('tools')
      .select(`
        id,
        slug,
        name,
        description,
        category_id,
        tool_categories!inner(
          name
        ),
        implementation_type,
        function_signature,
        parameters_schema,
        response_schema,
        usage_examples,
        error_handling,
        rate_limits,
        authentication_required,
        api_endpoint,
        api_method,
        api_headers,
        timeout_ms,
        retry_policy,
        metadata,
        tags,
        status,
        tenant_id,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Apply tenant filtering
    if (showAll && (profile.role === 'super_admin' || profile.role === 'admin')) {
      logger.debug('tools_get_admin_view_all_tenants', { operationId });
    } else {
      query = query.eq('tenant_id', profile.tenant_id);
      logger.debug('tools_get_tenant_filtered', { operationId, tenantId: profile.tenant_id });
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    // Add ordering
    query = query.order('name', { ascending: true });

    const { data: tools, error, count } = await query;

    if (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'tools_get_failed',
        new Error(error.message),
        {
          operation: 'GET /api/tools-crud',
          operationId,
          duration,
          errorCode: error.code,
        }
      );

      return NextResponse.json(
        { error: 'Failed to fetch tools from database', details: error.message },
        { status: 500 }
      );
    }

    // Transform tools to flatten category
    const transformedTools = tools?.map(tool => ({
      ...tool,
      category: tool.tool_categories?.name || 'Uncategorized',
      tool_categories: undefined, // Remove nested object
    })) || [];

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('tools_get_completed', duration, {
      operation: 'GET /api/tools-crud',
      operationId,
      toolCount: transformedTools.length,
      totalCount: count,
    });

    return NextResponse.json({
      success: true,
      tools: transformedTools,
      count: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'tools_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/tools-crud',
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
