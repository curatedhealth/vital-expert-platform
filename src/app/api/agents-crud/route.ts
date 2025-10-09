import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Use anon key for read operations (RLS allows public read access)
    const supabaseKey = supabaseServiceKey || supabaseAnonKey;
    
    if (!supabaseUrl || !supabaseKey) {
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

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    // Check for special action parameter
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const showAll = searchParams.get('showAll') === 'true'; // New parameter for showing all agents

    // Get organizational structure for filters
    if (action === 'get_org_structure') {
      try {
        // Fetch business functions
        const { data: functionsData, error: functionsError } = await supabaseAdmin
          .from('business_functions')
          .select('id, name, description, code, icon, color');

        // Fetch departments
        const { data: departmentsData, error: departmentsError } = await supabaseAdmin
          .from('departments')
          .select('id, name, description, business_function_id');

        // Fetch agent roles
        const { data: agentRolesData, error: agentRolesError } = await supabaseAdmin
          .from('agent_roles')
          .select('id, name, description, category');

        // Fetch organizational roles
        const { data: orgRolesData, error: orgRolesError } = await supabaseAdmin
          .from('organizational_roles')
          .select('id, name, description, level, business_function_id, department_id');

        // If any table doesn't exist, return mock data
        if (functionsError?.code === '42P01' || departmentsError?.code === '42P01' || 
            agentRolesError?.code === '42P01' || orgRolesError?.code === '42P01') {
          console.log('⚠️ Some organizational tables missing, returning mock data');
          return NextResponse.json({
            success: true,
            organizationalStructure: {
              businessFunctions: [
                { id: 'mock-func-1', name: 'Regulatory Affairs', description: 'FDA compliance', code: 'REG', icon: 'shield-check', color: 'blue' },
                { id: 'mock-func-2', name: 'Clinical Development', description: 'Clinical trials', code: 'CLIN', icon: 'flask', color: 'green' }
              ],
              departments: [
                { id: 'mock-dept-1', name: 'Compliance', description: 'Regulatory compliance', business_function_id: 'mock-func-1' },
                { id: 'mock-dept-2', name: 'Research', description: 'Clinical research', business_function_id: 'mock-func-2' }
              ],
              agentRoles: [
                { id: 'mock-role-1', name: 'Senior Specialist', description: 'Senior level expert', category: 'senior' },
                { id: 'mock-role-2', name: 'Director', description: 'Director level', category: 'director' }
              ],
              organizationalRoles: [
                { id: 'mock-org-role-1', name: 'Regulatory Manager', description: 'Manages regulatory', level: 'manager', business_function_id: 'mock-func-1', department_id: 'mock-dept-1' }
              ]
            }
          });
        }

        return NextResponse.json({
          success: true,
          organizationalStructure: {
            businessFunctions: functionsData || [],
            departments: departmentsData || [],
            agentRoles: agentRolesData || [],
            organizationalRoles: orgRolesData || []
          }
        });
      } catch (error) {
        console.error('❌ Error fetching organizational structure:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch organizational structure',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
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
      
      // If agents table doesn't exist, return mock data
      if (error.code === '42P01') {
        console.log('⚠️ Agents table not found, returning mock data');
        return NextResponse.json({
          success: true,
          agents: [
            {
              id: 'mock-agent-1',
              name: 'fda-regulatory-strategist',
              display_name: 'FDA Regulatory Strategist',
              description: 'Expert in FDA regulations, 510(k), PMA, De Novo pathways, and regulatory strategy for digital health products',
              system_prompt: 'You are an FDA Regulatory Strategist...',
              model: 'gpt-4',
              avatar: 'avatar_0001.png',
              color: '#3B82F6',
              status: 'active',
              tier: 1,
              priority: 1,
              is_custom: false,
              department: null,
              organizational_role: 'Senior Regulatory Specialist'
            },
            {
              id: 'mock-agent-2',
              name: 'clinical-trial-specialist',
              display_name: 'Clinical Trial Specialist',
              description: 'Expert in clinical trial design, execution, and regulatory compliance',
              system_prompt: 'You are a Clinical Trial Specialist...',
              model: 'gpt-4',
              avatar: 'avatar_0002.png',
              color: '#10B981',
              status: 'active',
              tier: 1,
              priority: 2,
              is_custom: false,
              department: null,
              organizational_role: 'Clinical Research Director'
            }
          ]
        });
      }
      
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
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
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