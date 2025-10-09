import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const updates = await request.json();
    
    // Filter out columns that don't exist in the agents table
    const allowedColumns = [
      'name', 'display_name', 'description', 'system_prompt', 'model', 
      'avatar', 'status', 'tier', 'priority', 'color', 'domain_expertise',
      'capabilities', 'tools', 'knowledge_domains', 'prompt_starters',
      'reasoning_style', 'safety_guidelines', 'validation_status',
      'created_at', 'updated_at'
    ];
    
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedColumns.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);
    
    console.log('🔧 Agent API: Filtered updates:', Object.keys(filteredUpdates));
    
    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('agents')
      .update(filteredUpdates)
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