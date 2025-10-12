import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
}

// Create Supabase client with service role key
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Returning mock agents data...');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';
    const limit = searchParams.get('limit');

    // Generate mock agents data (372 agents total)
    const mockAgents = [];
    const agentTypes = [
      { name: 'Digital Health Strategy Director', businessFunction: 'Strategy', avatar: '🎯', description: 'Strategic planning and digital transformation expert' },
      { name: 'Clinical Trial Designer', businessFunction: 'Clinical Research', avatar: '🧪', description: 'Clinical trial design and methodology specialist' },
      { name: 'FDA Regulatory Strategist', businessFunction: 'Regulatory', avatar: '📋', description: 'FDA compliance and regulatory affairs expert' },
      { name: 'Statistical Programmer', businessFunction: 'Data Science', avatar: '📊', description: 'Statistical analysis and data modeling specialist' },
      { name: 'Promotional Material Developer', businessFunction: 'Marketing', avatar: '📢', description: 'Marketing content and promotional material creator' },
      { name: 'Medical Affairs Specialist', businessFunction: 'Medical Affairs', avatar: '👩‍⚕️', description: 'Medical information and scientific communication expert' },
      { name: 'Quality Assurance Manager', businessFunction: 'Quality', avatar: '✅', description: 'Quality control and assurance specialist' },
      { name: 'Pharmacovigilance Expert', businessFunction: 'Safety', avatar: '⚠️', description: 'Drug safety monitoring and adverse event specialist' },
      { name: 'Market Access Strategist', businessFunction: 'Market Access', avatar: '🌐', description: 'Market access and pricing strategy expert' },
      { name: 'Clinical Data Manager', businessFunction: 'Data Management', avatar: '💾', description: 'Clinical data collection and management specialist' },
      { name: 'Biostatistician', businessFunction: 'Statistics', avatar: '📈', description: 'Biostatistical analysis and study design expert' },
      { name: 'Regulatory Writer', businessFunction: 'Regulatory', avatar: '📝', description: 'Regulatory document preparation and submission specialist' },
      { name: 'Health Economics Expert', businessFunction: 'Health Economics', avatar: '💰', description: 'Health economic evaluation and outcomes research specialist' },
      { name: 'Patient Engagement Specialist', businessFunction: 'Patient Engagement', avatar: '🤝', description: 'Patient advocacy and engagement strategy expert' },
      { name: 'Digital Marketing Manager', businessFunction: 'Marketing', avatar: '📱', description: 'Digital marketing and social media strategy specialist' },
      { name: 'Clinical Operations Manager', businessFunction: 'Operations', avatar: '⚙️', description: 'Clinical trial operations and project management expert' },
      { name: 'Regulatory Affairs Associate', businessFunction: 'Regulatory', avatar: '📄', description: 'Regulatory submission and compliance specialist' },
      { name: 'Medical Writer', businessFunction: 'Medical Writing', avatar: '✍️', description: 'Scientific and medical content writing specialist' },
      { name: 'Clinical Research Coordinator', businessFunction: 'Clinical Research', avatar: '🔬', description: 'Clinical trial coordination and site management expert' },
      { name: 'Health Technology Assessor', businessFunction: 'Health Technology', avatar: '🔍', description: 'Health technology assessment and evaluation specialist' }
    ];
    
    const statuses = ['active', 'testing', 'development'];
    const tiers = [1, 2, 3];
    const departments = ['Clinical', 'Regulatory', 'Medical Affairs', 'Marketing', 'Data Science', 'Quality', 'Operations', 'Strategy'];
    const roles = ['Director', 'Manager', 'Specialist', 'Coordinator', 'Analyst', 'Expert', 'Associate', 'Lead'];
    const capabilities = [
      ['Analysis', 'Research', 'Strategy'],
      ['Data Science', 'Statistics', 'Modeling'],
      ['Regulatory', 'Compliance', 'Documentation'],
      ['Clinical', 'Trial Design', 'Operations'],
      ['Marketing', 'Communication', 'Content'],
      ['Quality', 'Assurance', 'Validation'],
      ['Technology', 'Digital', 'Innovation'],
      ['Economics', 'Pricing', 'Access']
    ];

    // Generate 372 agents
    for (let i = 0; i < 372; i++) {
      const baseAgent = agentTypes[i % agentTypes.length];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
      const randomDepartment = departments[Math.floor(Math.random() * departments.length)];
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      const randomCapabilities = capabilities[Math.floor(Math.random() * capabilities.length)];
      
      // Create more realistic agent names with variations
      const agentNumber = i + 1;
      const nameVariation = agentNumber > 20 ? ` ${randomRole}` : '';
      const displayName = `${baseAgent.name}${nameVariation} ${agentNumber}`;
      
      mockAgents.push({
        id: `agent-${agentNumber}`,
        name: baseAgent.name.toLowerCase().replace(/\s+/g, '-') + `-${agentNumber}`,
        display_name: displayName,
        description: baseAgent.description,
        avatar: baseAgent.avatar,
        status: randomStatus,
        tier: randomTier,
        priority: Math.floor(agentNumber / 50) + 1,
        business_function: baseAgent.businessFunction,
        department: randomDepartment,
        organizational_role: randomRole,
        capabilities: randomCapabilities,
        specializations: { 
          primary: baseAgent.businessFunction.toLowerCase(),
          secondary: randomDepartment.toLowerCase()
        },
        tools: { 
          basic: true,
          advanced: randomTier <= 2,
          premium: randomTier === 1
        },
        rag_enabled: true,
        is_custom: false,
        color: `hsl(${(i * 137.5) % 360}, 70%, 50%)`, // Generate diverse colors
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Filter by status if not showing all
    let filteredAgents = mockAgents;
    if (!showAll) {
      filteredAgents = mockAgents.filter(agent => 
        ['active', 'testing', 'development'].includes(agent.status)
      );
    }

    // Apply pagination if specified
    if (limit) {
      filteredAgents = filteredAgents.slice(0, parseInt(limit));
    }

    console.log(`✅ API: Returning ${filteredAgents.length} mock agents`);
    console.log(`📊 API: Total count: ${mockAgents.length}`);

    return NextResponse.json({
      agents: filteredAgents,
      count: mockAgents.length,
      success: true
    });

  } catch (error) {
    console.error('❌ API: Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('agents')
      .insert([body])
      .select();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create agent: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update agent: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete agent: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
