/**
 * Temporary No-Auth Agents Endpoint for Debugging
 * GET /api/agents-crud-noauth
 *
 * This bypasses authentication to test if RLS policies are working
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    console.log('[agents-crud-noauth] Fetching agents with service role (bypassing RLS)...');

    const supabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .in('status', ['active', 'testing'])
      .order('name');

    if (error) {
      console.error('[agents-crud-noauth] Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log(`[agents-crud-noauth] Found ${agents?.length || 0} agents`);

    return NextResponse.json({
      success: true,
      agents: agents || [],
      count: agents?.length || 0,
      message: 'Using service role (no RLS)'
    });

  } catch (error: any) {
    console.error('[agents-crud-noauth] Exception:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
