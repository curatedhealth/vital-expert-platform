import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: stageId } = await params;
    const supabase = await createClient();

    console.log('Fetching tasks for stage:', stageId);

    // Fetch tasks from workflow_tasks table
    const { data: tasks, error: tasksError } = await supabase
      .from('workflow_tasks')
      .select('*')
      .eq('stage_id', stageId)
      .order('task_number', { ascending: true });

    if (tasksError) {
      console.error('Tasks fetch error:', tasksError);
      
      // If table doesn't exist, return empty result
      if (tasksError.code === '42P01' || tasksError.code === 'PGRST204' || tasksError.code === 'PGRST205') {
        console.warn('workflow_tasks table not found, returning empty result');
        return NextResponse.json({
          success: true,
          data: {
            tasks: [],
          },
          timestamp: new Date().toISOString(),
        });
      }
      throw tasksError;
    }

    console.log(`✅ Fetched ${tasks?.length || 0} tasks`);

    // Transform tasks to expected format
    const transformedTasks = (tasks || []).map(task => ({
      id: task.id,
      workflow_id: stageId,
      code: task.task_code || '',
      unique_id: task.task_code || task.id,
      title: task.task_name,
      objective: task.description || '',
      position: task.task_number || 1,
      extra: {
        task_type: task.task_type,
        estimated_duration_minutes: task.estimated_duration_minutes,
      },
      agents: [], // Agent assignments not available in workflow_tasks
      tools: [],  // Tool assignments not available in workflow_tasks
      rags: [],   // RAG assignments not available in workflow_tasks
    }));

    return NextResponse.json({
      success: true,
      data: {
        tasks: transformedTasks,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tasks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
