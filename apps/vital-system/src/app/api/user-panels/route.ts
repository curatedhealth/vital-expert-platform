import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { createServerClient } from '@supabase/ssr';

/**
 * GET /api/user-panels
 * Get all custom panels for the current user
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
    
    // Fetch user's custom panels
    const { data: panels, error } = await serviceSupabase
      .from('user_panels')
      .select('*')
      .eq('user_id', user.id)
      .order('is_favorite', { ascending: false })
      .order('last_used_at', { ascending: false, nullsFirst: false })
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
 * Create a new custom panel for the current user
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

    // Get template panel data if based on template
    let suggested_agents: string[] = [];
    let default_settings: Record<string, any> = {};

    if (base_panel_slug) {
      const { data: templatePanel } = await serviceSupabase
        .from('panels')
        .select('suggested_agents, default_settings')
        .eq('slug', base_panel_slug)
        .single();

      if (templatePanel) {
        suggested_agents = templatePanel.suggested_agents || [];
        default_settings = templatePanel.default_settings || {};
      }
    }

    // Use extracted agents if selected_agents is empty
    const finalAgents = (selected_agents && selected_agents.length > 0)
      ? selected_agents
      : extractedAgents;

    // Create the custom panel
    const { data: panel, error } = await serviceSupabase
      .from('user_panels')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        category: category || 'panel',
        base_panel_slug: base_panel_slug || null,
        is_template_based: !!base_panel_slug,
        mode,
        framework,
        selected_agents: finalAgents,
        suggested_agents,
        custom_settings: custom_settings || {},
        default_settings,
        metadata: {
          ...(metadata || {}),
          created_via: 'workflow_designer',
          node_count: workflow_definition?.nodes?.length || 0,
          edge_count: workflow_definition?.edges?.length || 0,
          expert_count: extractedAgents.length,
        },
        icon: icon || null,
        tags: tags || [],
        workflow_definition: workflow_definition || null,
      })
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
      
      // Check if it's a "table not found" error
      if (error.message?.includes('Could not find the table') || 
          error.message?.includes('does not exist') ||
          error.code === '42P01') {
        return NextResponse.json(
          { 
            error: 'Database schema not initialized', 
            message: 'The user_panels table does not exist. You need to run a migration to create it.',
            details: 'Get the migration SQL at /api/user-panels/migration or run scripts/create-user-panels-table.sql in Supabase SQL Editor',
            code: error.code,
            migration_required: true,
            migration_url: '/api/user-panels/migration',
            quick_fix: {
              step1: 'Go to: https://supabase.com/dashboard → Your Project → SQL Editor',
              step2: 'Click "New Query"',
              step3: 'Copy the SQL from: scripts/create-user-panels-table.sql',
              step4: 'Paste and click "Run"',
            },
          },
          { status: 503 }
        );
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

