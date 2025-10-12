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
      { name: 'Digital Health Strategy Director', status: 'active', tier: 1, businessFunction: 'Strategy' },
      { name: 'Clinical Trial Designer', status: 'active', tier: 1, businessFunction: 'Clinical Research' },
      { name: 'FDA Regulatory Strategist', status: 'active', tier: 1, businessFunction: 'Regulatory' },
      { name: 'Statistical Programmer', status: 'development', tier: 2, businessFunction: 'Data Science' },
      { name: 'Promotional Material Developer', status: 'development', tier: 2, businessFunction: 'Marketing' },
      { name: 'Medical Affairs Specialist', status: 'testing', tier: 2, businessFunction: 'Medical Affairs' },
      { name: 'Quality Assurance Manager', status: 'active', tier: 3, businessFunction: 'Quality' },
      { name: 'Pharmacovigilance Expert', status: 'active', tier: 3, businessFunction: 'Safety' },
      { name: 'Market Access Strategist', status: 'testing', tier: 2, businessFunction: 'Market Access' },
      { name: 'Clinical Data Manager', status: 'development', tier: 3, businessFunction: 'Data Management' }
    ];
    
    const statuses = ['active', 'testing', 'development'];
    const tiers = [1, 2, 3];

    // Generate 372 agents
    for (let i = 0; i < 372; i++) {
      const baseAgent = agentTypes[i % agentTypes.length];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
      
      mockAgents.push({
        id: `agent-${i + 1}`,
        name: `${baseAgent.name} ${i + 1}`,
        display_name: `${baseAgent.name} ${i + 1}`,
        description: `AI agent specialized in ${baseAgent.businessFunction.toLowerCase()}`,
        avatar: '🤖',
        status: randomStatus,
        tier: randomTier,
        priority: Math.floor(i / 10) + 1,
        business_function: baseAgent.businessFunction,
        capabilities: ['Analysis', 'Research', 'Strategy'],
        specializations: { general: true },
        tools: { basic: true },
        rag_enabled: true,
        is_custom: false,
        created_at: new Date().toISOString(),
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
