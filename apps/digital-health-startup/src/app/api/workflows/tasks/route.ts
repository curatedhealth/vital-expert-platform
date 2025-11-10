import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

export async function GET() {
  try {
    const supabase = getServiceSupabaseClient();
    
    console.log('Fetching all tasks from library...');
    
    // Fetch all tasks - only select existing columns
    const { data: tasks, error } = await supabase
      .from('dh_task')
      .select(`
        id,
        unique_id,
        code,
        title,
        objective,
        extra,
        position,
        workflow_id,
        created_at
      `)
      .order('title');

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tasks', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${tasks?.length || 0} tasks for library`);

    // Extract metadata from extra field
    const tasksWithMeta = tasks?.map(task => {
      const extra = task.extra || {};
      
      return {
        ...task,
        complexity: extra.complexity || 'INTERMEDIATE',
        estimated_duration_minutes: extra.estimated_duration_minutes || null,
        user_prompt: extra.userPrompt || '',
        // Extract protocol settings from extra (they might be nested)
        hitl: extra.guardrails?.humanInLoop || extra.humanInLoop || false,
        pharma_protocol: extra.run_policy?.pharmaProtocol || extra.pharmaProtocol || false,
        verify_protocol: extra.run_policy?.verifyProtocol || extra.verifyProtocol || false,
      };
    }) || [];

    return NextResponse.json({
      success: true,
      tasks: tasksWithMeta,
      count: tasksWithMeta.length,
    });
  } catch (error) {
    console.error('Error in tasks API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

