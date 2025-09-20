import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Agents CRUD API: Loading active agents...');

    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
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

    console.log(`✅ Agents CRUD API: Loaded ${data?.length || 0} agents`);

    return NextResponse.json({
      success: true,
      agents: data || []
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

    console.log('🔧 Agents CRUD API: Creating agent...');
    console.log('- Agent data:', agentData);

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

    console.log('✅ Agents CRUD API: Agent created successfully:', data);

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