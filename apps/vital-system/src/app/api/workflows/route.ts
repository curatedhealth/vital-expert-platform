/**
 * Workflows API - List and Create
 * GET /api/workflows - List workflows
 * POST /api/workflows - Create workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { WorkflowDefinition } from '@/features/workflow-designer/types/workflow';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const framework = searchParams.get('framework');
    const tags = searchParams.get('tags')?.split(',');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('workflows')
      .select('*')
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .order('updated_at', { ascending: false });

    if (framework) {
      query = query.eq('framework', framework);
    }

    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: workflows, error } = await query;

    if (error) {
      console.error('Error fetching workflows:', error);
      // If table doesn't exist, return empty array instead of error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('[Workflows API] Workflows table does not exist yet, returning empty array');
        return NextResponse.json({ workflows: [] });
      }
      return NextResponse.json({ error: 'Failed to fetch workflows', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ workflows: workflows || [] });
  } catch (error) {
    console.error('Error in GET /api/workflows:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workflow } = body as { workflow: WorkflowDefinition };

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow definition is required' }, { status: 400 });
    }

    // Validate workflow
    if (!workflow.name || !workflow.framework) {
      return NextResponse.json({ error: 'Workflow name and framework are required' }, { status: 400 });
    }

    // Insert workflow
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        user_id: user.id,
        name: workflow.name,
        description: workflow.description,
        framework: workflow.framework,
        workflow_definition: workflow,
        tags: workflow.metadata?.tags || [],
        is_template: workflow.metadata?.isTemplate || false,
        is_public: workflow.metadata?.isPublic || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow:', error);
      return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
    }

    // Audit log
    await supabase.from('workflow_audit_log').insert({
      workflow_id: data.id,
      user_id: user.id,
      action: 'create',
      changes: { workflow: data },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/workflows:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
