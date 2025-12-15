import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { createServerClient } from '@supabase/ssr';

/**
 * GET /api/user-panels
 * Get all panels for the current user (from panels table)
 */
export async function GET(request: NextRequest) {
  try {
    // Create server-side Supabase client that can read cookies from request
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to view your panels' },
        { status: 401 }
      );
    }

    // Try to get service Supabase client, but handle gracefully if not configured
    let serviceSupabase;
    try {
      serviceSupabase = getServiceSupabaseClient();
    } catch (configError: any) {
      console.warn('[User Panels API] Supabase service not configured:', configError.message);
      // Return empty array if service client can't be created
      return NextResponse.json({
        success: true,
        panels: [],
        count: 0,
        fallback: true,
      });
    }

    // Fetch user's panels from panels table (filter by metadata.created_by)
    const { data: panels, error } = await serviceSupabase
      .from('panels')
      .select('*')
      .eq('metadata->>created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[User Panels API] Error fetching panels:', error);
      // Return empty array instead of error to prevent UI breakage
      return NextResponse.json({
        success: true,
        panels: [],
        count: 0,
        fallback: true,
      });
    }

    return NextResponse.json({
      success: true,
      panels: panels || [],
      count: panels?.length || 0,
    });

  } catch (error: any) {
    console.error('[User Panels API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user-panels
 * Create a new panel directly in the panels table
 */
export async function POST(request: NextRequest) {
  try {
    // Create server-side Supabase client that can read cookies from request
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to create panels' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      base_panel_slug,
      mode,
      framework,
      selected_agents,
      custom_settings,
      metadata,
      icon,
      tags,
      workflow_definition,
    } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Panel name is required' },
        { status: 400 }
      );
    }

    // Extract agents from workflow if not provided
    const extractedAgents = workflow_definition
      ? extractExpertAgentsFromWorkflow(workflow_definition)
      : [];

    // Validate agents - either provided or extracted from workflow
    if ((!selected_agents || !Array.isArray(selected_agents) || selected_agents.length === 0) &&
        extractedAgents.length === 0) {
      return NextResponse.json(
        { error: 'Validation error', message: 'At least one agent must be selected or present in the workflow' },
        { status: 400 }
      );
    }

    if (!mode || !['sequential', 'collaborative', 'hybrid'].includes(mode)) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Invalid mode' },
        { status: 400 }
      );
    }

    if (!framework || !['langgraph', 'autogen', 'crewai'].includes(framework)) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Invalid framework' },
        { status: 400 }
      );
    }

    // Try to get service Supabase client, but handle gracefully if not configured
    let serviceSupabase;
    try {
      serviceSupabase = getServiceSupabaseClient();
    } catch (configError: any) {
      console.error('[User Panels API] Supabase service not configured:', configError.message);
      return NextResponse.json(
        { error: 'Database not configured', message: 'Unable to create panel. Please configure Supabase service.' },
        { status: 503 }
      );
    }

    // Use extracted agents if selected_agents is empty
    const finalAgents = (selected_agents && selected_agents.length > 0)
      ? selected_agents
      : extractedAgents;

    // Generate a unique slug from name
    const baseSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    const timestamp = Date.now().toString(36);
    const slug = `${baseSlug}_${timestamp}`;

    // Build insert object for panels table
    // Panels table schema: id, slug, name, description, category, mode, framework, suggested_agents, default_settings, metadata
    const insertData: Record<string, any> = {
      slug,
      name: name.trim(),
      description: description?.trim() || null,
      category: category || 'custom',
      mode,
      framework,
      suggested_agents: finalAgents,
      default_settings: custom_settings || {},
      metadata: {
        ...(metadata || {}),
        created_by: user.id,
        created_via: 'workflow_designer',
        is_user_created: true,
        base_panel_slug: base_panel_slug || null,
        icon: icon || null,
        tags: tags || [],
        workflow_definition: workflow_definition || null,
        node_count: workflow_definition?.nodes?.length || 0,
        edge_count: workflow_definition?.edges?.length || 0,
        expert_count: finalAgents.length,
      },
    };

    // Create the panel in panels table
    const { data: panel, error } = await serviceSupabase
      .from('panels')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[User Panels API] Error creating panel:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      // Check for duplicate slug
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        // Try with a more unique slug
        const retrySlug = `${baseSlug}_${user.id.slice(0, 8)}_${timestamp}`;
        insertData.slug = retrySlug;

        const { data: retryPanel, error: retryError } = await serviceSupabase
          .from('panels')
          .insert(insertData)
          .select()
          .single();

        if (!retryError) {
          console.log('[User Panels API] Retry with unique slug successful');
          return NextResponse.json({
            success: true,
            panel: retryPanel,
          }, { status: 201 });
        }

        console.error('[User Panels API] Retry also failed:', retryError);
      }

      return NextResponse.json(
        {
          error: 'Failed to create panel',
          message: error.message || 'Database error occurred',
          details: error.details || error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      panel,
    }, { status: 201 });

  } catch (error: any) {
    console.error('[User Panels API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Extract expert agent IDs from workflow definition
 */
function extractExpertAgentsFromWorkflow(workflowDefinition: any): string[] {
  const expertAgents: string[] = [];

  if (!workflowDefinition.nodes || !Array.isArray(workflowDefinition.nodes)) {
    return expertAgents;
  }

  for (const node of workflowDefinition.nodes) {
    // Check if node is an agent type (expertAgent or agent)
    const nodeType = node.data?.type || node.type;
    if (nodeType === 'expertAgent' || nodeType === 'agent') {
      // Extract agent ID from node config
      const agentId = node.data?.config?.agentId ||
                     node.config?.agentId ||
                     node.data?.expertConfig?.id ||
                     node.expertConfig?.id ||
                     node.id;
      if (agentId && !expertAgents.includes(agentId)) {
        expertAgents.push(agentId);
      }
    }
  }

  return expertAgents;
}
