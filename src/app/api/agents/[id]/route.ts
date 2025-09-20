import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();

    console.log('🔧 Agent API: Starting update...');
    console.log('- Agent ID:', id);
    console.log('- Updates:', updates);

    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Agent API: Supabase error:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to update agent';
      if (error.code === 'PGRST116') {
        errorMessage = 'Agent not found';
      } else if (error.code === '23505') {
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

    console.log('✅ Agent API: Update successful:', data);

    return NextResponse.json({
      success: true,
      agent: data
    });

  } catch (error) {
    console.error('❌ Agent API: Request error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Agent API: Get error:', error);
      return NextResponse.json({
        error: 'Agent not found',
        details: error.message
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      agent: data
    });

  } catch (error) {
    console.error('❌ Agent API: Request error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    );
  }
}