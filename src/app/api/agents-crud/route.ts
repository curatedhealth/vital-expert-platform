import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Use service role key for server-side operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Check for special action parameter
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Get organizational structure for filters
    if (action === 'get_org_structure') {
      // Fetch unique departments and roles from agents
      const { data: agentsData } = await supabaseAdmin
        .from('agents')
        .select('department, role')
        .eq('status', 'active');

      // Fetch business functions
      const { data: functionsData } = await supabaseAdmin
        .from('business_functions')
        .select('id, name, description');

      // Extract unique departments and roles
      const departments = [...new Set(
        (agentsData || [])
          .map(a => a.department)
          .filter(Boolean)
      )].sort();

      const roles = [...new Set(
        (agentsData || [])
          .map(a => a.role)
          .filter(Boolean)
      )].sort();

      return NextResponse.json({
        success: true,
        organizationalStructure: {
          businessFunctions: functionsData || [],
          departments,
          roles
        }
      });
    }

    // Regular agent fetch - explicitly select columns to avoid schema cache issues
    const { data, error } = await supabaseAdmin
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
        is_public,
        status,
        tier,
        priority,
        implementation_phase,
        knowledge_domains,
        business_function,
        role,
        department,
        function_id,
        department_id,
        role_id,
        domain_expertise,
        medical_specialty,
        validation_status,
        accuracy_score,
        hipaa_compliant,
        pharma_enabled,
        verify_enabled,
        cost_per_query,
        created_at,
        updated_at
      `)
      .eq('status', 'active')
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

    // Get business functions to map UUIDs to names
    const { data: businessFunctions } = await supabaseAdmin
      .from('business_functions')
      .select('id, name');

    const functionMap = new Map(
      (businessFunctions || []).map(f => [f.id, f.name])
    );

    // Transform agents to include readable business_function name
    const transformedAgents = (data || []).map(agent => ({
      ...agent,
      business_function: functionMap.get(agent.business_function) || agent.business_function
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