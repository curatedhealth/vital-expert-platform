import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Mode 3 Drafts API
 *
 * Provides draft persistence for the 4-checkpoint HITL journey.
 * Users can save their progress at any checkpoint and resume later.
 *
 * GET /api/mode3/drafts - List user's drafts
 * POST /api/mode3/drafts - Create a new draft
 */

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEW_SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Fetch user's drafts
    let query = supabase
      .from('mode3_drafts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data: drafts, error } = await query;

    if (error) {
      console.error('[Mode3 Drafts] List error:', error);
      return NextResponse.json({ drafts: [] });
    }

    return NextResponse.json({ drafts: drafts || [] });
  } catch (error: any) {
    console.error('[Mode3 Drafts] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, config, checkpoint, agent_id } = body;

    if (!name || !checkpoint) {
      return NextResponse.json(
        { error: 'Name and checkpoint are required' },
        { status: 400 }
      );
    }

    // Create draft
    const draftData = {
      user_id: userId,
      tenant_id: tenantId,
      agent_id,
      name,
      config: config || {},
      checkpoint,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: draft, error } = await supabase
      .from('mode3_drafts')
      .insert(draftData)
      .select()
      .single();

    if (error) {
      console.error('[Mode3 Drafts] Create error:', error);
      return NextResponse.json(
        { error: 'Failed to create draft', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ draft_id: draft.id, draft });
  } catch (error: any) {
    console.error('[Mode3 Drafts] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
