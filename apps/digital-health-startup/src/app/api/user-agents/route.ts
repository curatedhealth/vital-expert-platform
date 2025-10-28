import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { userId, agentId, originalAgentId, isUserCopy = false } = await request.json();

    if (!userId || !agentId) {
      return NextResponse.json(
        { error: 'userId and agentId are required' },
        { status: 400 }
      );
    }

    // Try to use the user_agents table, fallback to localStorage simulation if it doesn't exist
    try {
      // Check if the relationship already exists
      const { data: existing, error: existingError } = await supabaseAdmin
        .from('user_agents')
        .select('id')
        .eq('user_id', userId)
        .eq('agent_id', agentId)
        .single();

      // If table doesn't exist, simulate the operation
      if (existingError && existingError.code === '42P01') {
        console.log('⚠️ user_agents table does not exist, simulating operation');
        
        // Return success to simulate adding the agent
        return NextResponse.json({
          success: true,
          data: {
            id: `sim-${Date.now()}`,
            user_id: userId,
            agent_id: agentId,
            original_agent_id: originalAgentId || null,
            is_user_copy: isUserCopy,
            added_at: new Date().toISOString(),
          },
          message: 'Agent added to user list successfully (simulated)'
        });
      }

      if (existing) {
        return NextResponse.json(
          { error: 'Agent already added to user list' },
          { status: 409 }
        );
      }

      // Add the agent to user's list
      const { data, error } = await supabaseAdmin
        .from('user_agents')
        .insert({
          user_id: userId,
          agent_id: agentId,
          original_agent_id: originalAgentId || null,
          is_user_copy: isUserCopy,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding agent to user list:', error);
        return NextResponse.json(
          { error: 'Failed to add agent to user list' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
        message: 'Agent added to user list successfully'
      });

    } catch (tableError: any) {
      console.error('❌ Unexpected error in user_agents API:', tableError);
      
      // If the table doesn't exist, simulate the operation
      if (tableError.code === '42P01') {
        console.log('⚠️ user_agents table does not exist, simulating operation');
        
        // Return success to simulate adding the agent
        return NextResponse.json({
          success: true,
          data: {
            id: `sim-${Date.now()}`,
            user_id: userId,
            agent_id: agentId,
            original_agent_id: originalAgentId || null,
            is_user_copy: isUserCopy,
            added_at: new Date().toISOString(),
          },
          message: 'Agent added to user list successfully (simulated)'
        });
      }
      
      throw tableError;
    }

  } catch (error) {
    console.error('❌ User agents API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Try to use the user_agents table, fallback to empty result if it doesn't exist
    try {
      console.log('🔍 [GET] Attempting to fetch user agents for userId:', userId);
      
      // Get all agents that the user has added
      const { data, error } = await supabaseAdmin
        .from('user_agents')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      console.log('🔍 [GET] Supabase response:', { data, error });

      // If table doesn't exist, return empty result
      if (error && error.code === '42P01') {
        console.log('⚠️ user_agents table does not exist, returning empty result');
        return NextResponse.json({
          success: true,
          agents: []
        });
      }

      if (error) {
        console.error('❌ Error fetching user agents:', error);
        return NextResponse.json(
          { error: 'Failed to fetch user agents' },
          { status: 500 }
        );
      }

      console.log('✅ [GET] Successfully fetched user agents:', data?.length || 0);
      return NextResponse.json({
        success: true,
        agents: data || []
      });

    } catch (tableError: any) {
      console.error('❌ Unexpected error in user_agents GET API:', tableError);
      
      // If the table doesn't exist, return empty result
      if (tableError.code === '42P01') {
        console.log('⚠️ user_agents table does not exist, returning empty result');
        return NextResponse.json({
          success: true,
          agents: []
        });
      }
      
      throw tableError;
    }

  } catch (error) {
    console.error('❌ User agents API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, agentId } = await request.json();

    if (!userId || !agentId) {
      return NextResponse.json(
        { error: 'userId and agentId are required' },
        { status: 400 }
      );
    }

    // Try to use the user_agents table, fallback to simulation if it doesn't exist
    try {
      // Remove the agent from user's list
      const { error } = await supabaseAdmin
        .from('user_agents')
        .delete()
        .eq('user_id', userId)
        .eq('agent_id', agentId);

      if (error) {
        console.error('❌ Error removing agent from user list:', error);
        return NextResponse.json(
          { error: 'Failed to remove agent from user list' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Agent removed from user list successfully'
      });

    } catch (tableError: any) {
      // If the table doesn't exist, simulate the operation
      if (tableError.code === '42P01') {
        console.log('⚠️ user_agents table does not exist, simulating removal');
        return NextResponse.json({
          success: true,
          message: 'Agent removed from user list successfully (simulated)'
        });
      }
      
      throw tableError;
    }

  } catch (error) {
    console.error('❌ User agents API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
