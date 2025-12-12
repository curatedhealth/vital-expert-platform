/**
 * Template Details API
 * Get, update, or delete a specific template
 * 
 * Routes:
 *   GET    /api/templates/[id] - Get template details
 *   PUT    /api/templates/[id] - Update template
 *   DELETE /api/templates/[id] - Delete template
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Params = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/templates/[id]
 * Get template details
 */
export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id } = await params;

    const { data, error } = await supabase
      .from('template_library')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Increment usage count (fire and forget)
    supabase
      .from('template_library')
      .update({ 
        usage_count: (data.usage_count || 0) + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', id)
      .then(() => {});

    return NextResponse.json({ template: data });

  } catch (error) {
    console.error('Template fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/templates/[id]
 * Update template
 */
export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id } = await params;
    const body = await request.json();

    // Get user from auth header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Check ownership
    const { data: existing } = await supabase
      .from('template_library')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!existing || existing.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Update template
    const { data, error } = await supabase
      .from('template_library')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Template update error:', error);
      return NextResponse.json(
        { error: 'Failed to update template', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      template: data,
      message: 'Template updated successfully'
    });

  } catch (error) {
    console.error('Template update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates/[id]
 * Soft delete template
 */
export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { id } = await params;

    // Get user from auth header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Check ownership
    const { data: existing } = await supabase
      .from('template_library')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!existing || existing.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Soft delete
    const { error } = await supabase
      .from('template_library')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Template deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete template', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Template deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

