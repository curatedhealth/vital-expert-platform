import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `tools_get_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use service client to bypass RLS for reading tools (auth is already verified by withAgentAuth)
    const supabase = getServiceSupabaseClient();
    const { profile } = context;

    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10000');
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

    // Query both tools and dh_tool tables to get all tools
    // The dh_tool table contains tenant-specific tools with more detailed data
    
    // First, try to get tools from dh_tool (tenant-specific tools)
    const { data: dhTools, error: dhError, count: dhCount } = await supabase
      .from('dh_tool')
      .select('*', { count: 'exact' })
      .eq('tenant_id', STARTUP_TENANT_ID)
      .order('name', { ascending: true });

    // Also get tools from the public.tools table (general tools registry)
    const { data: publicTools, error: publicError, count: publicCount } = await supabase
      .from('tools')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true });

    // Log results from both tables
    console.log('🔧 Tools API Debug:', {
      dhToolsCount: dhTools?.length || 0,
      dhCount,
      dhError: dhError?.message,
      publicToolsCount: publicTools?.length || 0,
      publicCount,
      publicError: publicError?.message,
    });

    logger.info('tools_get_query_result', {
      operationId,
      dhToolsCount: dhTools?.length || 0,
      publicToolsCount: publicTools?.length || 0,
      dhError: dhError?.message,
      publicError: publicError?.message,
      tenantId: profile.tenant_id,
    });

    // Use dh_tool if it has data, otherwise fallback to public.tools
    // This ensures we always return tools even if one table is empty
    let rawTools: any[] = [];
    let error: any = null;
    let count = 0;

    if (dhTools && dhTools.length > 0) {
      // Use dh_tool data (tenant-specific tools)
      rawTools = dhTools;
      error = dhError;
      count = dhCount || dhTools.length;
      console.log('🔧 Using dh_tool table:', rawTools.length, 'tools');
    } else if (publicTools && publicTools.length > 0) {
      // Fallback to public.tools table
      rawTools = publicTools;
      error = publicError;
      count = publicCount || publicTools.length;
      console.log('🔧 Using public.tools table:', rawTools.length, 'tools');
    } else {
      // Both tables are empty or errored
      error = dhError || publicError;
      console.log('🔧 No tools found in either table');
    }
    
    // Map tool columns to the format expected by the frontend
    // Handle both dh_tool and public.tools schemas
    const tools = (rawTools || []).map((tool: any) => {
      // Determine which schema we're dealing with based on available fields
      const isDhTool = 'code' in tool || 'unique_id' in tool;
      
      // Get category from available fields
      const category = tool.category || tool.category_parent || tool.category_name || 'General';
      const metadata = tool.metadata || {};
      
      if (isDhTool) {
        // dh_tool schema mapping
        return {
          id: tool.id,
          slug: tool.code || tool.unique_id,
          name: tool.name,
          description: tool.tool_description || tool.llm_description || tool.notes,
          tool_description: tool.tool_description || tool.llm_description,
          category: category,
          category_parent: tool.category_parent || category,
          tool_type: tool.tool_type || 'function',
          implementation_type: tool.implementation_type || tool.tool_type || 'function',
          integration_name: tool.function_name || tool.implementation_path,
          endpoint_url: tool.documentation_url,
          function_spec: tool.input_schema,
          configuration: tool.output_schema,
          metadata: {
            vendor: tool.vendor,
            version: tool.version,
            license: metadata.license,
            tier: metadata.tier,
            use_cases: metadata.use_cases,
            key_packages: metadata.key_packages,
            ...metadata,
          },
          tags: tool.tags || tool.capabilities || [],
          average_response_time_ms: tool.max_execution_time_seconds ? tool.max_execution_time_seconds * 1000 : null,
          is_active: tool.is_active !== false,
          requires_approval: tool.access_level === 'premium' || tool.access_level === 'restricted',
          usage_count: tool.usage_count || 0,
          success_rate: tool.success_rate,
          tenant_id: tool.tenant_id,
          created_at: tool.created_at,
          updated_at: tool.updated_at,
          deleted_at: null,
          lifecycle_stage: tool.lifecycle_stage || 'production',
          langgraph_compatible: tool.langgraph_compatible !== false,
          documentation_url: tool.documentation_url,
          health_status: tool.health_status || 'healthy',
          business_impact: tool.business_impact,
          usage_guide: tool.usage_guide,
          vendor: tool.vendor,
          version: tool.version,
          unique_id: tool.unique_id,
          code: tool.code,
        };
      } else {
        // public.tools schema mapping
        return {
          id: tool.id,
          slug: tool.tool_key || tool.slug,
          name: tool.name,
          description: tool.description,
          tool_description: tool.description,
          category: category,
          category_parent: category,
          tool_type: tool.tool_type || 'function',
          implementation_type: tool.tool_type || 'function',
          integration_name: tool.implementation_path,
          endpoint_url: tool.api_endpoint || tool.documentation_url,
          function_spec: tool.input_schema,
          configuration: tool.usage_examples,
          metadata: {
            requires_api_key: tool.requires_api_key,
            api_key_env_var: tool.api_key_env_var,
            is_premium: tool.is_premium,
            output_format: tool.output_format,
            best_practices: tool.best_practices,
            limitations: tool.limitations,
            ...metadata,
          },
          tags: tool.best_practices || [],
          average_response_time_ms: tool.avg_response_time_ms,
          is_active: tool.is_active !== false,
          requires_approval: tool.requires_approval,
          usage_count: tool.total_calls || 0,
          success_rate: tool.success_rate,
          tenant_id: null,
          created_at: tool.created_at,
          updated_at: tool.updated_at,
          deleted_at: null,
          lifecycle_stage: 'production',
          langgraph_compatible: true,
          documentation_url: tool.documentation_url,
          health_status: 'healthy',
          business_impact: null,
          usage_guide: null,
          vendor: null,
          version: '1.0.0',
          unique_id: tool.tool_key,
          code: tool.tool_key,
        };
      }
    });

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

      // If table doesn't exist, return empty array instead of error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        logger.warn('tools_get_table_missing', { operationId });
        return NextResponse.json({
          success: true,
          tools: [],
          count: 0,
          limit,
          offset,
        });
      }

      // For other errors, return empty array gracefully
      logger.warn('tools_get_error_graceful', { operationId, error: error.message });
      return NextResponse.json({
        success: true,
        tools: [],
        count: 0,
        limit,
        offset,
      });
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('tools_get_completed', duration, {
      operation: 'GET /api/tools-crud',
      operationId,
      toolCount: tools.length,
      totalCount: count,
    });

    return NextResponse.json({
      success: true,
      tools,
      count: count || tools.length,
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

    // Return empty array instead of error to prevent UI breakage
    return NextResponse.json({
      success: true,
      tools: [],
      count: 0,
      limit: parseInt(request.nextUrl.searchParams.get('limit') || '10000'),
      offset: parseInt(request.nextUrl.searchParams.get('offset') || '0'),
    });
  }
});
