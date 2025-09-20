import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // First check if agents table is empty
    const { data: existingAgents, error: checkError } = await supabaseAdmin
      .from('agents')
      .select('id')
      .limit(1);

    if (checkError) {
      return NextResponse.json({
        error: 'Failed to check existing agents',
        details: checkError.message
      }, { status: 500 });
    }

    if (existingAgents && existingAgents.length > 0) {
      return NextResponse.json({
        message: 'Agents already exist',
        count: existingAgents.length
      });
    }

    // Create a test agent using admin privileges
    const testAgent = {
      name: 'test_agent_1',
      display_name: 'Test Agent 1',
      description: 'A test agent for debugging purposes',
      system_prompt: 'You are a helpful test agent.',
      model: 'gpt-4',
      avatar: '',
      color: '#6366f1',
      capabilities: ['general_assistance'],
      rag_enabled: false,
      temperature: 0.7,
      max_tokens: 2000,
      is_custom: true,
      status: 'active',
      tier: 1,
      priority: 1,
      implementation_phase: 1,
      knowledge_domains: ['general'],
      business_function: 'regulatory_affairs',
      role: 'assistant'
    };

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('agents')
      .insert([testAgent])
      .select();

    if (insertError) {
      console.error('Error inserting test agent:', insertError);
      return NextResponse.json({
        error: 'Failed to insert test agent',
        details: insertError.message,
        code: insertError.code
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Test agent created successfully with admin privileges',
      agent: insertData[0]
    });

  } catch (error) {
    console.error('Seed agents admin error:', error);
    return NextResponse.json(
      { error: 'Failed to seed agents', details: String(error) },
      { status: 500 }
    );
  }
}