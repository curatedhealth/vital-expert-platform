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

    console.log(`[${requestId}] Fetching agents from Supabase`, {
      url: supabaseUrl,
      status,
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
        department_id
      `);

    // Only filter by status if not "all"
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    query = query.order('name', { ascending: true });

    const { data, error } = await query;

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


