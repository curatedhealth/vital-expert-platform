import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('⚠️ Supabase configuration missing, returning comprehensive mock data');
      
      // Load comprehensive mock data
      let mockAgents = [];
      try {
        const fs = require('fs');
        const path = require('path');
        const mockDataPath = path.join(process.cwd(), 'data', 'agents-comprehensive.json');
        const mockData = fs.readFileSync(mockDataPath, 'utf8');
        mockAgents = JSON.parse(mockData);
        console.log(`✅ Loaded ${mockAgents.length} agents from comprehensive mock data`);
      } catch (error) {
        console.log('⚠️ Could not load comprehensive mock data, using fallback');
        // Fallback to basic mock data
        mockAgents = [
          {
            id: 'mock-agent-1',
            name: 'Regulatory Affairs Expert',
            display_name: 'Regulatory Affairs Expert',
            description: 'Expert in FDA regulations and compliance',
            status: 'active',
            tier: 'premium',
            business_function: 'Regulatory Affairs',
            department: 'Compliance',
            role: 'Senior Regulatory Specialist'
          },
          {
            id: 'mock-agent-2', 
            name: 'Clinical Research Advisor',
            display_name: 'Clinical Research Advisor',
            description: 'Specialist in clinical trial design and execution',
            status: 'active',
            tier: 'premium',
            business_function: 'Clinical Development',
            department: 'Research',
            role: 'Clinical Research Director'
          }
        ];
      }
      
      return NextResponse.json({
        success: true,
        agents: mockAgents
      });
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
        created_by,
        status,
        tier,
        priority,
        implementation_phase,
        knowledge_domains,
        business_function,
        role,
        domain_expertise,
        medical_specialty,
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

    // Transform agents (no organizational structure mapping needed since columns don't exist)
    const transformedAgents = (data || []).map(agent => ({
      ...agent,
      department: null, // Column doesn't exist
      organizational_role: agent.role // Use existing role field
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
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('⚠️ Supabase configuration missing, returning mock response');
      return NextResponse.json({
        success: true,
        agent: {
          id: 'mock-agent-' + Date.now(),
          ...agentData,
          is_custom: true,
          created_at: new Date().toISOString()
        }
      });
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
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