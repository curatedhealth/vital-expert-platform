import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Get Supabase credentials - EXPLICITLY USE NEW SUPABASE
const supabaseUrl = 'https://bomltkhixeatxuoxmolq.supabase.co';
const supabaseServiceKey = process.env.NEW_SUPABASE_SERVICE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/agents - Fetch all agents from the agents table
 * Used for Mode 1 agent selection
 */
export async function GET(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    console.log(`[${requestId}] Fetching agents from NEW SUPABASE`, {
      url: supabaseUrl,
      status,
    });

    // Build query - using actual schema from NEW SUPABASE
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
        function_name,
        department_name
      `)
      .eq('status', status)
      .order('name', { ascending: true });

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

