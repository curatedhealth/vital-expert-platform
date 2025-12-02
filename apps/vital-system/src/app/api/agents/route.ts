import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEW_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEW_SUPABASE_SERVICE_KEY;

// Only create client if credentials are available
let supabaseAdmin: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * GET /api/agents - Fetch all agents from the agents table
 * Used for agent selection and display
 */
export async function GET(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();

  try {
    // Check if Supabase is configured
    if (!supabaseAdmin || !supabaseUrl || !supabaseServiceKey) {
      console.warn(`[${requestId}] Supabase not configured, returning empty agents list`);
      return NextResponse.json(
        {
          success: true,
          agents: [],
          count: 0,
          warning: 'Supabase not configured',
          requestId,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=300',
            'X-Request-ID': requestId,
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const tenantId = searchParams.get('tenant_id');
    const noFilters = searchParams.get('no_filters') === 'true'; // Allow bypassing all filters

    // Default tenant ID if not provided (only use if no_filters is false)
    const DEFAULT_TENANT_ID = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';
    const effectiveTenantId = tenantId || DEFAULT_TENANT_ID;

    console.log(`[${requestId}] Fetching agents from Supabase`, {
      url: supabaseUrl,
      status,
      tenant_id: effectiveTenantId,
      no_filters: noFilters,
      filtering_by_tenant: !noFilters && (!!tenantId || true),
    });

    // Build query - Include organizational structure IDs and names
    // Note: Only select columns that actually exist in the agents table
    let query = supabaseAdmin
      .from('agents')
      .select(`
        id,
        name,
        slug,
        description,
        tagline,
        title,
        expertise_level,
        avatar_url,
        avatar_description,
        system_prompt,
        base_model,
        temperature,
        max_tokens,
        communication_style,
        status,
        metadata,
        created_at,
        updated_at,
        role_name,
        role_id,
        function_name,
        function_id,
        department_name,
        department_id,
        tenant_id
      `);

    // Only apply filters if no_filters is not set
    if (!noFilters) {
      // Filter by tenant_id (use default if not provided)
      // Note: Using service role key should bypass RLS, but we filter explicitly for consistency
      query = query.eq('tenant_id', effectiveTenantId);

    // Only filter by status if not "all"
    if (status !== 'all') {
      query = query.eq('status', status);
      }
    } else {
      // When no_filters=true, only apply status filter if explicitly requested and not "all"
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
    }

    query = query.order('name', { ascending: true });

    let { data, error } = await query;

    // If we got 0 results and we're filtering by default tenant (and no_filters is not set), try without tenant filter
    // This handles cases where agents might have NULL or different tenant_id
    if ((!data || data.length === 0) && !noFilters && !tenantId && effectiveTenantId === DEFAULT_TENANT_ID) {
      console.log(`[${requestId}] No agents found with tenant_id=${effectiveTenantId}, trying without tenant filter`);
      
      // Retry query without tenant_id filter
      let fallbackQuery = supabaseAdmin
        .from('agents')
        .select(`
          id,
          name,
          slug,
          description,
          tagline,
          title,
          expertise_level,
          avatar_url,
          avatar_description,
          system_prompt,
          base_model,
          temperature,
          max_tokens,
          communication_style,
          status,
          metadata,
          created_at,
          updated_at,
          role_name,
          role_id,
          function_name,
          function_id,
          department_name,
          department_id,
          tenant_id
        `);

      if (status !== 'all') {
        fallbackQuery = fallbackQuery.eq('status', status);
      }

      const fallbackResult = await fallbackQuery.order('name', { ascending: true });
      
      if (fallbackResult.data && fallbackResult.data.length > 0) {
        console.log(`[${requestId}] Found ${fallbackResult.data.length} agents without tenant filter`);
        data = fallbackResult.data;
        error = fallbackResult.error;
      }
    }

    if (error) {
      console.error(`[${requestId}] Failed to fetch agents:`, error);
      
      // If agents table doesn't exist, return empty array
      if (error.code === '42P01') {
        console.warn(`[${requestId}] agents table does not exist`);
        return NextResponse.json(
          {
            success: true,
            agents: [],
            count: 0,
            warning: 'agents table not initialized',
            requestId,
          },
          {
            status: 200,
            headers: {
              'Cache-Control': 'public, max-age=300', // 5 minutes cache
              'X-Request-ID': requestId,
            },
          }
        );
      }

      // If column doesn't exist, return empty array with warning
      if (error.message && error.message.includes('does not exist')) {
        console.warn(`[${requestId}] Column error: ${error.message}`);
        return NextResponse.json(
          {
            success: true,
            agents: [],
            count: 0,
            warning: `Database schema mismatch: ${error.message}`,
            requestId,
          },
          {
            status: 200,
            headers: {
              'Cache-Control': 'public, max-age=300',
              'X-Request-ID': requestId,
            },
          }
        );
      }

      throw new Error(error.message);
    }

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Fetched ${data?.length || 0} agents in ${duration}ms`);

    return NextResponse.json(
      {
        success: true,
        agents: data || [],
        count: data?.length || 0,
        requestId,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutes cache
          'X-Request-ID': requestId,
        },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error fetching agents:`, error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch agents',
        agents: [],
        count: 0,
        requestId,
      },
      {
        status: 500,
        headers: {
          'X-Request-ID': requestId,
        },
      }
    );
  }
}


