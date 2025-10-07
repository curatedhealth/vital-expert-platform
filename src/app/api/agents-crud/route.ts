import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    // Check for special action parameter
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const showAll = searchParams.get('showAll') === 'true'; // New parameter for showing all agents

    // Get organizational structure for filters
    if (action === 'get_org_structure') {
      // Fetch business functions
      const { data: functionsData } = await supabaseAdmin
        .from('business_functions')
        .select('id, name, description, code, icon, color');

      // Fetch departments
      const { data: departmentsData } = await supabaseAdmin
        .from('departments')
        .select('id, name, description, business_function_id');

      // Fetch agent roles
      const { data: agentRolesData } = await supabaseAdmin
        .from('agent_roles')
        .select('id, name, description, category');

      // Fetch organizational roles
      const { data: orgRolesData } = await supabaseAdmin
        .from('organizational_roles')
        .select('id, name, description, level, business_function_id, department_id');

      return NextResponse.json({
        success: true,
        organizationalStructure: {
          businessFunctions: functionsData || [],
          departments: departmentsData || [],
          agentRoles: agentRolesData || [],
          organizationalRoles: orgRolesData || []
        }
      });
    }

    // Get agent with supported organizational roles
    if (action === 'get_agent_org_roles') {
      const agentId = searchParams.get('agentId');

      if (!agentId) {
        return NextResponse.json(
          { error: 'agentId parameter required' },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from('agent_organizational_role_support')
        .select(`
          id,
          support_type,
          proficiency_level,
          organizational_roles (
            id,
            name,
            description,
            level,
            business_function_id,
            department_id
          )
        `)
        .eq('agent_id', agentId);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch agent organizational roles', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        supportedRoles: data || []
      });
    }

    // Build query for agent fetch
    let query = supabaseAdmin
      .from('agents')
      .select(`
        id,
        name,
        display_name,
        description,
        system_prompt,
        model,
        avatar,
        color,
        capabilities,
        rag_enabled,
        temperature,
        max_tokens,
        is_custom,
        is_library_agent,
        created_by,
        status,
        tier,
        priority,
        implementation_phase,
        knowledge_domains,
        business_function,
        business_function_id,
        role,
        role_id,
        domain_expertise,
        medical_specialty,
        department,
        department_id,
        validation_status,
        hipaa_compliant,
        gdpr_compliant,
        pharma_enabled,
        verify_enabled,
        regulatory_context,
        metadata,
        created_at,
        updated_at
      `);

    // Apply status filter based on showAll parameter
    // If showAll=true: return all agents (for agents management page)
    // If showAll=false: return only active/testing agents (for chat/services)
    if (!showAll) {
      query = query.in('status', ['active', 'testing']);
    }

    const { data, error } = await query
      .order('tier', { ascending: true })
      .order('priority', { ascending: true })
      .limit(1000);

    if (error) {
      console.error('❌ Agents CRUD API: Supabase error:', error);
      return NextResponse.json({
        error: 'Failed to fetch agents',
        details: error.message
      }, { status: 500 });
    }

    // Get organizational structure to map UUIDs to names
    const { data: businessFunctions } = await supabaseAdmin
      .from('business_functions')
      .select('id, name');

    const { data: departments } = await supabaseAdmin
      .from('departments')
      .select('id, name');

    const { data: organizationalRoles } = await supabaseAdmin
      .from('organizational_roles')
      .select('id, name');

    const functionMap = new Map(
      (businessFunctions || []).map(f => [f.id, f.name])
    );

    const departmentMap = new Map(
      (departments || []).map(d => [d.id, d.name])
    );

    const roleMap = new Map(
      (organizationalRoles || []).map(r => [r.id, r.name])
    );

    // Transform agents to include readable organizational structure names
    const transformedAgents = (data || []).map(agent => ({
      ...agent,
      business_function: functionMap.get(agent.business_function_id) || agent.business_function,
      department: departmentMap.get(agent.department_id) || agent.department,
      organizational_role: roleMap.get(agent.role_id) || agent.role
    }));

    return NextResponse.json({
      success: true,
      agents: transformedAgents
    });

  } catch (error) {
    console.error('❌ Agents CRUD API: Request error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const agentData = await request.json();
    const { data, error } = await supabaseAdmin
      .from('agents')
      .insert([{
        ...agentData,
        is_custom: true
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Agents CRUD API: Create error:', error);

      let errorMessage = 'Failed to create agent';
      if (error.code === '23505') {
        errorMessage = 'Agent name or display name already exists';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return NextResponse.json({
        error: errorMessage,
        code: error.code,
        details: error.details
      }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      agent: data
    });

  } catch (error) {
    console.error('❌ Agents CRUD API: Request error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    );
  }
}