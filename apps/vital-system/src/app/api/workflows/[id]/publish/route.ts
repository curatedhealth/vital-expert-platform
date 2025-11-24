/**
 * Workflow Publications API
 * Publish workflows to services and modes
 * 
 * Routes:
 *   POST   /api/workflows/[id]/publish - Publish workflow
 *   GET    /api/workflows/[id]/publications - List publications
 *   DELETE /api/publications/[id] - Unpublish
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Params = {
  params: {
    id: string;
  };
};

/**
 * POST /api/workflows/[id]/publish
 * Publish workflow to service/mode
 */
export async function POST(
  request: NextRequest,
  { params }: Params
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id: workflowId } = params;
    const body = await request.json();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Check workflow ownership
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    if (workflow.created_by !== user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { service_mode_id, publication_type = 'mode', publish_notes } = body;

    if (!service_mode_id) {
      return NextResponse.json(
        { error: 'Missing required field: service_mode_id' },
        { status: 400 }
      );
    }

    // Get service from mode
    const { data: mode } = await supabase
      .from('service_modes')
      .select('service_id')
      .eq('id', service_mode_id)
      .single();

    if (!mode) {
      return NextResponse.json({ error: 'Service mode not found' }, { status: 404 });
    }

    // Create publication
    const { data, error } = await supabase
      .from('workflow_publications')
      .insert({
        workflow_id: workflowId,
        service_id: mode.service_id,
        service_mode_id,
        publication_type,
        publication_status: 'published',
        workflow_snapshot: workflow.definition,
        publish_notes,
        published_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint
        return NextResponse.json(
          { error: 'Workflow already published to this mode' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to publish workflow', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      publication: data,
      message: 'Workflow published successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Workflow publication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workflows/[id]/publications
 * List workflow publications
 */
export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id: workflowId } = params;

    const { data, error } = await supabase
      .from('workflow_publications')
      .select(`
        *,
        service:service_id(id, service_name, display_name),
        mode:service_mode_id(id, mode_code, display_name)
      `)
      .eq('workflow_id', workflowId)
      .order('published_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch publications', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ publications: data || [] });

  } catch (error) {
    console.error('Publications fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

