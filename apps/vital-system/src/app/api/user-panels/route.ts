import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { createServerClient } from '@supabase/ssr';

/**
 * GET /api/user-panels
 * Get all custom panels for the current user
 *
 * Uses the existing schema:
 * - panels: stores panel definitions (id, slug, name, description, category, mode, framework, suggested_agents, default_settings, metadata)
 * - user_panels: junction table linking users to panels (id, user_id, panel_id, role, tenant_id)
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

    // Fetch user's custom panels via junction table
    // Join user_panels with panels to get full panel data
    const { data: userPanelLinks, error: linkError } = await serviceSupabase
      .from('user_panels')
      .select('panel_id, role')
      .eq('user_id', user.id);

    if (linkError) {
      console.error('[User Panels API] Error fetching user panel links:', linkError);
      return NextResponse.json({
        success: true,
        panels: [],
        count: 0,
        fallback: true,
      });
    }

    if (!userPanelLinks || userPanelLinks.length === 0) {
      return NextResponse.json({
        success: true,
        panels: [],
        count: 0,
      });
    }

    // Get panel IDs
    const panelIds = userPanelLinks.map(link => link.panel_id);

    // Fetch actual panel data
    const { data: panels, error } = await serviceSupabase
      .from('panels')
      .select('*')
      .in('id', panelIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[User Panels API] Error fetching panels:', error);
      return NextResponse.json({
        success: true,
        panels: [],
        count: 0,
        fallback: true,
      });
    }

    // Merge panel data with user-specific info (role) and extract workflow from metadata
    const enrichedPanels = (panels || []).map(panel => {
      const link = userPanelLinks.find(l => l.panel_id === panel.id);
      return {
        ...panel,
        user_id: user.id,
        role: link?.role || 'owner',
        // Extract workflow_definition from metadata if stored there
        workflow_definition: panel.metadata?.workflow_definition || null,
        selected_agents: panel.suggested_agents || [],
        custom_settings: panel.default_settings || {},
        is_favorite: panel.metadata?.is_favorite || false,
        last_used_at: panel.metadata?.last_used_at || null,
      };
    });

    return NextResponse.json({
      success: true,
      panels: enrichedPanels,
      count: enrichedPanels.length,
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
 *
 * Uses the existing schema:
 * - panels: stores panel definitions (id, slug, name, description, category, mode, framework, suggested_agents, default_settings, metadata)
 * - user_panels: junction table linking users to panels (id, user_id, panel_id, role, tenant_id)
 *
 * Workflow definition is stored in the metadata JSONB column of the panels table.
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

    // Generate a unique slug for the panel
    const slug = `custom-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    // Create the panel in the panels table
    // Store workflow_definition and user-specific data in the metadata JSONB column
    const { data: panel, error: panelError } = await serviceSupabase
      .from('panels')
      .insert({
        slug,
        name: name.trim(),
        description: description?.trim() || null,
        category: category || 'custom',
        mode: mode || 'sequential',
        framework: framework || 'langgraph',
        suggested_agents: finalAgents,
        default_settings: custom_settings || {},
        metadata: {
          ...(metadata || {}),
          workflow_definition: workflow_definition || null,
          created_via: 'workflow_designer',
          created_by: user.id,
          node_count: workflow_definition?.nodes?.length || 0,
          edge_count: workflow_definition?.edges?.length || 0,
          expert_count: extractedAgents.length,
          icon: icon || null,
          tags: tags || [],
          is_favorite: false,
          last_used_at: null,
          base_panel_slug: base_panel_slug || null,
          is_template_based: !!base_panel_slug,
        },
      })
      .select()
      .single();

    if (panelError) {
      console.error('[User Panels API] Error creating panel:', {
        error: panelError,
        code: panelError.code,
        message: panelError.message,
        details: panelError.details,
        hint: panelError.hint,
      });

      return NextResponse.json(
        {
          error: 'Failed to create panel',
          message: panelError.message || 'Database error occurred',
          details: panelError.details || panelError.message,
          code: panelError.code,
        },
        { status: 500 }
      );
    }

    // Get user's tenant_id from user_tenants table
    // Default to VITAL Platform tenant if not found
    const PLATFORM_TENANT_ID = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';
    let tenantId = PLATFORM_TENANT_ID;

    const { data: userTenantData } = await serviceSupabase
      .from('user_tenants')
      .select('tenant_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (userTenantData?.tenant_id) {
      tenantId = userTenantData.tenant_id;
    }

    // Create the user-panel link in user_panels junction table
    const { error: linkError } = await serviceSupabase
      .from('user_panels')
      .insert({
        user_id: user.id,
        panel_id: panel.id,
        role: 'owner',
        tenant_id: tenantId,
      });

    if (linkError) {
      console.error('[User Panels API] Error creating user-panel link:', linkError);
      // Panel was created, but link failed - try to clean up
      await serviceSupabase.from('panels').delete().eq('id', panel.id);
      return NextResponse.json(
        {
          error: 'Failed to link panel to user',
          message: linkError.message || 'Database error occurred',
        },
        { status: 500 }
      );
    }

    // Return enriched panel with user-specific fields
    const enrichedPanel = {
      ...panel,
      user_id: user.id,
      role: 'owner',
      workflow_definition: panel.metadata?.workflow_definition || null,
      selected_agents: panel.suggested_agents || [],
      custom_settings: panel.default_settings || {},
      is_favorite: panel.metadata?.is_favorite || false,
      last_used_at: panel.metadata?.last_used_at || null,
    };

    return NextResponse.json({
      success: true,
      panel: enrichedPanel,
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

