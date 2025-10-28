import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function normalizeAgent(agent: any) {
  if (!agent) return null;

  // Normalize capabilities
  let normalizedCapabilities: string[] = [];
  if (Array.isArray(agent.capabilities)) {
    normalizedCapabilities = agent.capabilities;
  } else if (typeof agent.capabilities === 'string') {
    const cleanString = agent.capabilities.replace(/[{}]/g, '');
    normalizedCapabilities = cleanString
      .split(',')
      .map((cap: string) => cap.trim())
      .filter((cap: string) => cap.length > 0);
  } else {
    normalizedCapabilities = ['General assistance'];
  }

  // Extract data from metadata
  const metadata = agent.metadata || {};
  
  return {
    id: agent.id,
    name: agent.name,
    display_name: metadata.display_name || agent.name,
    description: agent.description,
    system_prompt: agent.system_prompt,
    capabilities: normalizedCapabilities,
    knowledge_domains: metadata.knowledge_domains || [],
    tier: metadata.tier || 1,
    model: metadata.model || 'gpt-4',
    avatar: metadata.avatar || '🤖',
    color: metadata.color || '#3B82F6',
    temperature: metadata.temperature || 0.7,
    max_tokens: metadata.max_tokens || 2000,
    metadata: metadata,
    status: metadata.status || 'active',
    is_custom: metadata.is_custom || false,
    business_function: metadata.business_function || null,
    department: metadata.department || null,
    role: metadata.role || null,
    created_at: agent.created_at,
    updated_at: agent.updated_at,
  };
}

export async function GET(request: Request) {
  try {
    // Get tenant ID from headers (set by middleware)
    const tenantId = request.headers.get('x-tenant-id');
    const PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000001';

    console.log(`🔍 [Agents CRUD] Fetching agents for tenant: ${tenantId || 'unknown'}`);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';

    // Query agents - use minimal set of columns that definitely exist
    const query = supabase
      .from('agents')
      .select(`
        id,
        name,
        description,
        system_prompt,
        capabilities,
        metadata,
        created_at,
        updated_at
      `);

    // Add ordering by name
    query.order('name', { ascending: true });

    // No status filtering since status column doesn't exist

    // TENANT FILTERING: Show tenant-specific agents + global shared agents
    // For now, DISABLE tenant filtering to show all agents (superadmin view)
    // TODO: Re-enable once tenant_id column is properly populated and user roles are implemented
    console.log(`📊 [Agents CRUD] Showing all agents (tenant filtering disabled for superadmin)`);

    // FUTURE: When tenant filtering is ready, uncomment this:
    // if (tenantId && tenantId !== PLATFORM_TENANT_ID) {
    //   query.or(`tenant_id.eq.${tenantId},tenant_id.eq.${PLATFORM_TENANT_ID}`);
    // } else {
    //   query.eq('tenant_id', PLATFORM_TENANT_ID);
    // }

    const { data: agents, error } = await query;

    if (error) {
      console.error('❌ [Agents CRUD] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch agents from database', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [Agents CRUD] Successfully fetched ${agents?.length || 0} agents`);

    // Normalize agents data to match frontend expectations
    const normalizedAgents = (agents || [])
      .map((agent: any) => normalizeAgent(agent))
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      agents: normalizedAgents,
      count: normalizedAgents.length
    });
  } catch (error) {
    console.error('❌ [Agents CRUD] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const agentData = body?.agentData;
    const categoryIds: string[] = Array.isArray(body?.categoryIds) ? body.categoryIds : [];

    if (!agentData || !agentData.name || !agentData.system_prompt) {
      return NextResponse.json(
        { success: false, error: 'Missing required agent fields' },
        { status: 400 }
      );
    }

    const { id: _unusedId, display_name, is_custom, ...rest } = agentData;
    const payload = {
      ...rest,
      name: agentData.name.trim(),
      metadata: {
        display_name: display_name || agentData.name,
        is_custom: is_custom || false,
        ...rest.metadata,
      },
    };

    const { data, error } = await supabase
      .from('agents')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('❌ [Agents CRUD] Failed to create agent:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to create agent' },
        { status: 500 }
      );
    }

    if (categoryIds.length > 0) {
      const mappings = categoryIds.map(categoryId => ({
        agent_id: data.id,
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase
        .from('agent_category_mapping')
        .insert(mappings);

      if (categoryError) {
        console.error('❌ [Agents CRUD] Failed to link categories:', categoryError);
        return NextResponse.json(
          {
            success: false,
            error: categoryError.message || 'Failed to attach categories to agent',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      agent: data,
    });
  } catch (error) {
    console.error('❌ [Agents CRUD] Unexpected error (POST):', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
