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
    
    // Get current agent to merge metadata properly
    const { data: currentAgent, error: fetchError } = await supabaseAdmin
      .from('agents')
      .select('metadata')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Agent API: Error fetching current agent:', fetchError);
    }

    // Prepare update payload
    const updatePayload: any = {};
    
    // Handle display_name - store in metadata if not already a column
    if (updates.display_name !== undefined) {
      // Check if display_name is a direct column or needs to go in metadata
      // For now, store in both places: direct column if exists, and metadata
      if (!updatePayload.metadata) {
        updatePayload.metadata = currentAgent?.metadata || {};
      }
      // Store in metadata.display_name (primary location)
      updatePayload.metadata = {
        ...updatePayload.metadata,
        display_name: updates.display_name,
      };
      // Also try to set direct column if it exists (some schemas have it)
      try {
        updatePayload.display_name = updates.display_name;
      } catch (e) {
        // Column might not exist, that's okay
      }
    }

    // Handle avatar - store in metadata.avatar
    if (updates.avatar !== undefined) {
      if (!updatePayload.metadata) {
        updatePayload.metadata = currentAgent?.metadata || {};
      }
      updatePayload.metadata = {
        ...updatePayload.metadata,
        avatar: updates.avatar,
      };
      // Also set avatar_url if column exists (for backward compatibility)
      try {
        updatePayload.avatar_url = updates.avatar;
      } catch (e) {
        // Column might not exist, that's okay
      }
    }

    // Handle other direct column updates (exclude display_name and avatar from top level if they were in updates)
    Object.keys(updates).forEach((key) => {
      if (key !== 'display_name' && key !== 'avatar') {
        updatePayload[key] = updates[key];
      }
    });

    // If metadata was updated, include it
    if (updatePayload.metadata && Object.keys(updatePayload.metadata).length > 0) {
      // Merge with existing metadata
      updatePayload.metadata = {
        ...(currentAgent?.metadata || {}),
        ...updatePayload.metadata,
      };
    }

    console.log(`🔧 [Agent API] Updating agent ${id}:`, {
      display_name: updatePayload.metadata?.display_name,
      avatar: updatePayload.metadata?.avatar,
      otherFields: Object.keys(updatePayload).filter(k => k !== 'metadata'),
    });
    
    // Use admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('agents')
      .update(updatePayload)
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

    // Normalize the returned agent data to match frontend expectations
    // (similar to what agents-crud does)
    const metadata = data.metadata || {};
    const normalizedAgent = {
      ...data,
      display_name: metadata.display_name || data.display_name || data.name,
      avatar: metadata.avatar || data.avatar || data.avatar_url || '🤖',
    };

    console.log('✅ [Agent API] Agent updated:', {
      id: normalizedAgent.id,
      name: normalizedAgent.name,
      display_name: normalizedAgent.display_name,
      avatar: normalizedAgent.avatar,
    });

    return NextResponse.json({
      success: true,
      agent: normalizedAgent
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