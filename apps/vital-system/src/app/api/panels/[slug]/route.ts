import { NextResponse, NextRequest } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /api/panels/[slug]
 * Fetch complete panel data including template, agents, and configuration
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = getServiceSupabaseClient();

    console.log(`[API] Fetching panel data for: ${slug}`);
    const startTime = Date.now();

    // Step 1: Fetch panel template by slug
    const { data: panel, error: panelError } = await supabase
      .from('panels')
      .select('*')
      .eq('slug', slug)
      .single();

    if (panelError) {
      console.error('[API] Panel fetch error:', panelError);
      
      if (panelError.code === 'PGRST116' || panelError.code === '42P01') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Panel not found',
            details: `No panel with slug "${slug}" exists.`,
            debugInfo: {
              message: panelError.message,
              code: panelError.code,
            }
          },
          { status: 404 }
        );
      }
      
      throw panelError;
    }

    if (!panel) {
      return NextResponse.json(
        { success: false, error: 'Panel not found' },
        { status: 404 }
      );
    }

    // Step 2: Fetch agents from multiple sources (priority order):
    // 1. user_panels.selected_agents (for saved user panels)
    // 2. panel.metadata.selected_agents (for template panels with metadata)
    // 3. Extract from workflow_definition.nodes (fallback)
    let selectedAgentIds: string[] = [];
    
    // First, try to get from user_panels (most recent saved version)
    try {
      const { data: userPanels } = await supabase
        .from('user_panels')
        .select('selected_agents, updated_at')
        .eq('base_panel_slug', slug)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (userPanels && userPanels.length > 0 && userPanels[0].selected_agents) {
        selectedAgentIds = userPanels[0].selected_agents as string[];
        console.log(`[API] Found ${selectedAgentIds.length} agent IDs from user_panels`);
      }
    } catch (userPanelError: any) {
      console.warn('[API] Could not fetch from user_panels (table may not exist):', userPanelError?.message);
    }
    
    // Fallback to panel.metadata.selected_agents
    if (selectedAgentIds.length === 0 && panel.metadata?.selected_agents) {
      selectedAgentIds = Array.isArray(panel.metadata.selected_agents) 
        ? panel.metadata.selected_agents 
        : [];
      console.log(`[API] Found ${selectedAgentIds.length} agent IDs from panel.metadata.selected_agents`);
    }
    
    // Last resort: extract from workflow_definition.nodes
    if (selectedAgentIds.length === 0 && panel.metadata?.workflow_definition?.nodes) {
      const nodes = panel.metadata.workflow_definition.nodes;
      const extractedIds: string[] = [];
      nodes.forEach((node: any) => {
        if (node.type === 'agent' && node.config?.agentId) {
          const agentId = node.config.agentId;
          if (typeof agentId === 'string' && !extractedIds.includes(agentId)) {
            extractedIds.push(agentId);
          }
        }
      });
      if (extractedIds.length > 0) {
        selectedAgentIds = extractedIds;
        console.log(`[API] Extracted ${selectedAgentIds.length} agent IDs from workflow_definition.nodes`);
      }
    }
    
    console.log(`[API] Total selected agent IDs:`, selectedAgentIds);
    let agents: any[] = [];

    // Fetch agents from database if we have IDs
    if (selectedAgentIds.length > 0 && Array.isArray(selectedAgentIds)) {
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('id, name, display_name, description, category, specializations, avatar, status, tier')
        .in('id', selectedAgentIds)
        .eq('status', 'active')
        .order('name');

      if (agentsError) {
        console.error('[API] Error fetching agents:', agentsError);
      } else if (agentsData && agentsData.length > 0) {
        agents = agentsData.map(agent => ({
          id: agent.id,
          name: agent.name,
          display_name: agent.display_name || agent.name,
          description: agent.description || '',
          category: agent.category || '',
          specializations: agent.specializations || [],
          avatar: agent.avatar,
          tier: agent.tier,
        }));
        console.log(`[API] Successfully fetched ${agents.length} agents from database`);
      } else {
        console.warn(`[API] No agents found in database for IDs:`, selectedAgentIds);

        // Fallback: build lightweight agent stubs from workflow metadata so UI can reflect the expected count
        try {
          const nodes = panel.metadata?.workflow_definition?.nodes || [];
          const fallbackAgents: any[] = [];
          nodes.forEach((node: any) => {
            const agentId = node?.config?.agentId;
            if (agentId && typeof agentId === 'string' && agentId.length > 0 && selectedAgentIds.includes(agentId)) {
              fallbackAgents.push({
                id: agentId,
                name: node?.config?.agentName || node?.label || 'Agent',
                display_name: node?.config?.agentDisplayName || node?.config?.agentName || node?.label || agentId,
                description: node?.config?.agentDescription || '',
                category: 'panel',
                specializations: node?.config?.context?.expertise || [],
                avatar: node?.config?.agentAvatar,
                tier: node?.config?.tier,
                _fallback: true,
              });
            }
          });

          if (fallbackAgents.length > 0) {
            agents = fallbackAgents;
            console.log(`[API] Using ${fallbackAgents.length} fallback agents from workflow metadata`);
          }
        } catch (metaErr) {
          console.warn('[API] Failed to build fallback agents from metadata:', metaErr);
        }
      }
    } else {
      console.log(`[API] No agent IDs found in any source`);
    }

    // Step 3: Build complete panel response with only real database data
    const panelData = {
      id: panel.id,
      slug: panel.slug,
      name: panel.name,
      description: panel.description,
      category: panel.category,
      mode: panel.mode,
      framework: panel.framework,
      metadata: panel.metadata || {},
      agents: agents, // Only agents from user_panels.selected_agents
      created_at: panel.created_at,
      updated_at: panel.updated_at,
    };

    const elapsed = Date.now() - startTime;
    console.log(`[API] ✅ Fetched panel "${slug}" with ${agents.length} agents from database in ${elapsed}ms`);

    return NextResponse.json({
      success: true,
      data: {
        panel: panelData,
      },
      stats: {
        agents: agents.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] ❌ Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch panel',
        details: error instanceof Error ? error.message : 'Unknown error',
        debugInfo: {
          message: error instanceof Error ? error.message : 'Unknown',
          code: (error as any)?.code,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/panels/[slug]
 * Save/update panel configuration to panels table (globally accessible)
 * TODO: Later migrate to user_panels for user-specific customizations
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Wrap everything in a try-catch to ensure we always return a proper response
  try {
    console.log('[API] POST /api/panels/[slug] - Starting request');
    let slug: string;
    try {
      const resolvedParams = await params;
      slug = resolvedParams.slug;
    } catch (paramError: any) {
      console.error('[API] Failed to resolve params:', paramError);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request parameters',
          details: paramError?.message || 'Failed to parse route parameters',
          message: paramError?.message || 'Invalid request parameters'
        },
        { status: 400 }
      );
    }
    console.log('[API] Panel slug:', slug);

    let body;
    try {
      body = await request.json();
      console.log('[API] Request body received:', {
        name: body?.name,
        mode: body?.mode,
        framework: body?.framework,
        selected_agents_count: body?.selected_agents?.length || 0,
        has_workflow_definition: !!body?.workflow_definition,
      });
    } catch (parseError: any) {
      console.error('[API] Failed to parse request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid request body', details: parseError.message },
        { status: 400 }
      );
    }

    // Use service client for database operations (bypasses RLS)
    let serviceSupabase;
    try {
      serviceSupabase = getServiceSupabaseClient();
    } catch (serviceError: any) {
      console.error('[API] Service Supabase client required for global panel saves:', serviceError?.message);
      return NextResponse.json(
        { success: false, error: 'Server configuration error', details: 'Unable to initialize database client' },
        { status: 500 }
      );
    }

    console.log(`[API] Saving panel configuration for: ${slug}`);

    // Extract panel configuration from body
    const {
      name,
      description,
      category,
      mode,
      framework,
      selected_agents,
      workflow_definition,
      metadata,
    } = body;

    // Clean workflow_definition: Remove nodes/edges not present in the designer
    let cleanedWorkflowDefinition = workflow_definition || {};
    let cleanedSelectedAgents = selected_agents || [];
    
    if (cleanedWorkflowDefinition.nodes && Array.isArray(cleanedWorkflowDefinition.nodes)) {
      // Get all node IDs that actually exist
      const existingNodeIds = new Set(cleanedWorkflowDefinition.nodes.map((n: any) => n.id));
      
      // Filter edges to only include those that reference existing nodes
      if (cleanedWorkflowDefinition.edges && Array.isArray(cleanedWorkflowDefinition.edges)) {
        cleanedWorkflowDefinition.edges = cleanedWorkflowDefinition.edges.filter((edge: any) => 
          existingNodeIds.has(edge.source) && existingNodeIds.has(edge.target)
        );
        console.log(`[API] Cleaned edges: removed ${(workflow_definition?.edges?.length || 0) - cleanedWorkflowDefinition.edges.length} edges referencing non-existent nodes`);
      }
      
      // Extract agent IDs only from nodes that exist in the workflow
      const agentIdsFromWorkflow = new Set<string>();
      cleanedWorkflowDefinition.nodes.forEach((node: any) => {
        // Check various locations for agent ID
        const agentId = node.config?.agentId || node.data?.config?.agentId || node.agentId;
        if (agentId && typeof agentId === 'string' && agentId.length === 36) {
          // Check UUID format (36 chars with 4 dashes)
          const dashCount = (agentId.match(/-/g) || []).length;
          if (dashCount === 4) {
            agentIdsFromWorkflow.add(agentId);
          }
        }
      });
      
      // Filter selected_agents to only include agents referenced in the workflow
      if (agentIdsFromWorkflow.size > 0 && Array.isArray(selected_agents)) {
        const originalAgentCount = selected_agents.length;
        cleanedSelectedAgents = selected_agents.filter((id: string) => agentIdsFromWorkflow.has(id));
        const removedAgents = originalAgentCount - cleanedSelectedAgents.length;
        if (removedAgents > 0) {
          console.log(`[API] Cleaned selected_agents: kept ${cleanedSelectedAgents.length} agents that exist in workflow (removed ${removedAgents})`);
        }
      } else if (Array.isArray(selected_agents) && selected_agents.length > 0 && agentIdsFromWorkflow.size === 0) {
        // If no agents found in workflow but selected_agents provided, clear it
        console.log(`[API] Warning: No agent IDs found in workflow nodes, but ${selected_agents.length} agents provided. Clearing selected_agents.`);
        cleanedSelectedAgents = [];
      }
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // Validate that selected_agents is provided and is an array
    // Use cleanedSelectedAgents if it was created, otherwise use original selected_agents
    const finalSelectedAgents = (cleanedSelectedAgents && cleanedSelectedAgents.length > 0) ? cleanedSelectedAgents : selected_agents;
    if (!Array.isArray(finalSelectedAgents) || finalSelectedAgents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one agent is required' },
        { status: 400 }
      );
    }

    // Validate required fields from database
    if (!mode || !framework) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: mode and framework must be provided' },
        { status: 400 }
      );
    }

    // Prepare panel data for global panels table
    // Store workflow and selected_agents in metadata since panels table doesn't have these columns
    const panelData: any = {
      name: name.trim(),
      description: description?.trim() || null,
      category: category || 'panel',
      mode: mode,
      framework: framework,
      metadata: {
        ...(metadata || {}),
        selected_agents: cleanedSelectedAgents || selected_agents, // Use cleaned agent list
        workflow_definition: cleanedWorkflowDefinition, // Use cleaned workflow
        last_modified: new Date().toISOString(),
      },
    };

    console.log('[API] Prepared panelData:', {
      slug: slug,
      name: panelData.name,
      mode: panelData.mode,
      framework: panelData.framework,
      selected_agents_in_metadata: panelData.metadata.selected_agents,
      selected_agents_count: panelData.metadata.selected_agents?.length || 0,
      workflow_nodes_count: panelData.metadata.workflow_definition?.nodes?.length || 0,
    });

    // Check if panel with this slug already exists
    const { data: existingPanel } = await serviceSupabase
      .from('panels')
      .select('id, slug, name')
      .eq('slug', slug)
      .maybeSingle();

    let result;
    if (existingPanel) {
      // Update existing panel
      const { data, error } = await serviceSupabase
        .from('panels')
        .update(panelData)
        .eq('slug', slug)
        .select()
        .single();

      if (error) {
        console.error('[API] Error updating panel:', error);
        console.error('[API] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        // Preserve the Supabase error structure so we can handle it properly
        const supabaseError = error as any;
        throw {
          ...supabaseError,
          message: supabaseError.message || 'Failed to update panel',
          code: supabaseError.code,
          details: supabaseError.details,
          hint: supabaseError.hint,
        };
      }
      result = data;
      console.log(`[API] ✅ Updated panel: ${result.id} (slug: ${slug})`);
    } else {
      // Create new panel - this shouldn't happen as we're updating via slug
      // but keeping for safety
      const newPanelData = {
        ...panelData,
        slug: slug,
      };

      const { data, error } = await serviceSupabase
        .from('panels')
        .insert(newPanelData)
        .select()
        .single();

      if (error) {
        console.error('[API] Error creating panel:', error);
        console.error('[API] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        // Preserve the Supabase error structure so we can handle it properly
        const supabaseError = error as any;
        throw {
          ...supabaseError,
          message: supabaseError.message || 'Failed to create panel',
          code: supabaseError.code,
          details: supabaseError.details,
          hint: supabaseError.hint,
        };
      }
      result = data;
      console.log(`[API] ✅ Created new panel: ${result.id} (slug: ${slug})`);
    }

    return NextResponse.json({
      success: true,
      data: {
        panel: result,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] ❌ Error saving panel:', error);
    console.error('[API] Error type:', typeof error);
    console.error('[API] Error constructor:', error?.constructor?.name);
    
    // Try to extract error information from various possible structures
    let errorMessage = 'Unknown error';
    let errorCode: string | undefined;
    let errorDetails: string | undefined;
    let errorHint: string | undefined;
    
    // Handle different error types
    if (error instanceof Error) {
      errorMessage = error.message || 'An error occurred';
      errorCode = (error as any).code;
      errorDetails = (error as any).details;
      errorHint = (error as any).hint;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      errorMessage = error.message || error.error || error.toString() || 'An error occurred';
      errorCode = error.code;
      errorDetails = error.details || error.hint;
      errorHint = error.hint;
      
      // Try to stringify for logging
      try {
        console.error('[API] Error object:', JSON.stringify(error, null, 2));
      } catch (e) {
        console.error('[API] Error object (non-serializable):', error);
        // Try to extract what we can
        if (error.message) errorMessage = String(error.message);
        if (error.code) errorCode = String(error.code);
        if (error.details) errorDetails = String(error.details);
      }
    }
    
    // Check for Supabase-specific error structure
    if (error?.code) {
      errorCode = String(error.code);
    }
    if (error?.details) {
      errorDetails = String(error.details);
    }
    if (error?.hint) {
      errorHint = String(error.hint);
    }
    
    // Ensure we have at least some error message
    if (!errorMessage || errorMessage === 'Unknown error') {
      errorMessage = error?.message || error?.error || String(error) || 'Failed to save panel';
    }
    
    // Check for common database errors
    let statusCode = 500;
    let userFriendlyMessage = 'Failed to save panel';
    
    if (errorCode === '23505') {
      // Unique constraint violation
      statusCode = 409;
      userFriendlyMessage = 'A panel with this name already exists';
    } else if (errorCode === '23503') {
      // Foreign key violation
      statusCode = 400;
      userFriendlyMessage = 'Invalid reference (e.g., agent ID does not exist)';
    } else if (errorCode === '23514') {
      // Check constraint violation (e.g., user_panels_has_agents)
      statusCode = 400;
      userFriendlyMessage = 'Validation failed: ' + (errorDetails || 'At least one agent is required');
    } else if (errorCode === '42P01') {
      // Table does not exist
      statusCode = 500;
      userFriendlyMessage = 'Database table not found. Please run migrations.';
    } else if (errorMessage.includes('permission denied') || errorMessage.includes('RLS')) {
      statusCode = 403;
      userFriendlyMessage = 'Permission denied. Please check your access rights.';
    } else if (errorMessage.includes('user_panels_has_agents')) {
      statusCode = 400;
      userFriendlyMessage = 'At least one agent is required to save a panel';
    } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('No user session')) {
      statusCode = 401;
      userFriendlyMessage = 'Authentication required. Please log in and try again.';
    }
    
    // Always return a properly structured error response
    const errorResponse = {
      success: false,
      error: userFriendlyMessage,
      details: errorMessage,
      message: errorMessage, // Also include as 'message' for compatibility
      debugInfo: {
        message: errorMessage,
        code: errorCode || undefined,
        details: errorDetails || undefined,
        hint: errorHint || undefined,
        errorType: error?.constructor?.name || typeof error,
      }
    };
    
    console.error('[API] Returning error response:', JSON.stringify(errorResponse, null, 2));
    
    // Ensure we always return a proper JSON response
    try {
      return NextResponse.json(
        errorResponse,
        { status: statusCode }
      );
    } catch (jsonError: any) {
      // If even JSON.stringify fails, return a minimal error response
      console.error('[API] Failed to serialize error response:', jsonError);
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          details: 'Failed to process error response',
          message: 'An unexpected error occurred'
        },
        { status: 500 }
      );
    }
  }
}

