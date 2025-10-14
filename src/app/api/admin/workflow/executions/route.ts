import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Get workflow executions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const sessionId = searchParams.get('sessionId');

    console.log('🔍 [Admin] Fetching workflow executions...');

    let query = supabaseAdmin
      .from('workflow_executions')
      .select(`
        id,
        session_id,
        user_id,
        status,
        current_node,
        start_time,
        end_time,
        duration,
        error,
        metadata,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: executions, error } = await query;

    if (error) {
      console.error('❌ [Admin] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch workflow executions', details: error.message },
        { status: 500 }
      );
    }

    // Transform data for frontend
    const transformedExecutions = (executions || []).map(execution => ({
      id: execution.id,
      sessionId: execution.session_id,
      userId: execution.user_id,
      status: execution.status,
      currentNode: execution.current_node,
      startTime: new Date(execution.start_time),
      endTime: execution.end_time ? new Date(execution.end_time) : null,
      duration: execution.duration,
      error: execution.error,
      metadata: execution.metadata || {}
    }));

    console.log(`✅ [Admin] Successfully fetched ${transformedExecutions.length} executions`);

    return NextResponse.json({
      success: true,
      executions: transformedExecutions
    });

  } catch (error) {
    console.error('❌ [Admin] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Create new workflow execution
export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId, workflowId = 'main', metadata = {} } = await request.json();

    console.log('🚀 [Admin] Creating new workflow execution...');

    const { data: execution, error } = await supabaseAdmin
      .from('workflow_executions')
      .insert({
        session_id: sessionId,
        user_id: userId,
        workflow_id: workflowId,
        status: 'running',
        current_node: 'start',
        start_time: new Date().toISOString(),
        metadata: metadata
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [Admin] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create workflow execution', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ [Admin] Workflow execution created successfully');

    return NextResponse.json({
      success: true,
      execution: {
        id: execution.id,
        sessionId: execution.session_id,
        userId: execution.user_id,
        status: execution.status,
        currentNode: execution.current_node,
        startTime: new Date(execution.start_time),
        metadata: execution.metadata
      }
    });

  } catch (error) {
    console.error('❌ [Admin] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
