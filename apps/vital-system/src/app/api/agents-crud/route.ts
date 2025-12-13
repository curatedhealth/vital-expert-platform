/**
 * GET /api/agents-crud
 * Service-role read of agents with optional status filter.
 * Query params:
 *   - showAll=true to disable status filter
 *   - status=active|testing|development|inactive (default active/testing)
 *   - limit (default 10000, capped at 10000)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request: NextRequest) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Supabase credentials missing' },
      { status: 500 }
    );
  }

  try {
    const supabase = createAdminClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';
    const statusParam = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10000', 10), 10000);

    let query = supabase.from('agents').select('*');

    if (!showAll) {
      const statuses = statusParam ? [statusParam] : ['active', 'testing'];
      query = query.in('status', statuses);
    }

    query = query.order('name', { ascending: true }).limit(limit);

    const { data: agents, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      agents: agents || [],
      count: agents?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}

