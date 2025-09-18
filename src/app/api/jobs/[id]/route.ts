import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types for MA01 Jobs (same as in route.ts)
interface MA01Job {
  job_id?: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  configuration: Record<string, any>;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  started_at?: string;
  completed_at?: string;
  query_text?: string;
  result_data?: Record<string, any>;
  ai_agent_used?: string;
  processing_time_ms?: number;
  confidence_score?: number;
}

/**
 * GET /api/jobs/[id] - Get a single job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    const { data, error } = await supabase
      .from('ma01_jobs')
      .select('*')
      .eq('job_id', id)
      .eq('created_by', userId) // Ensure user can only access their own jobs
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching job:', error);
      return NextResponse.json(
        { error: 'Failed to fetch job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      job: data
    });

  } catch (error) {
    console.error('GET /api/jobs/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/jobs/[id] - Update a job
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const updates: Partial<MA01Job> = body;

    // Remove fields that shouldn't be updated via API
    delete updates.job_id;
    delete updates.created_by;
    delete updates.created_at;

    // Validate required fields if provided
    if (updates.name !== undefined && (!updates.name || !updates.name.trim())) {
      return NextResponse.json(
        { error: 'Job name cannot be empty' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Handle status transitions
    if (updates.status) {
      if (updates.status === 'running' && !updateData.started_at) {
        updateData.started_at = new Date().toISOString();
      }
      if (['completed', 'failed', 'cancelled'].includes(updates.status) && !updateData.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('ma01_jobs')
      .update(updateData)
      .eq('job_id', id)
      .eq('created_by', userId) // Ensure user can only update their own jobs
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      console.error('Error updating job:', error);
      return NextResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job: data,
      message: 'Job updated successfully'
    });

  } catch (error) {
    console.error('PUT /api/jobs/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to update job',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/jobs/[id] - Delete a job
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    const { error } = await supabase
      .from('ma01_jobs')
      .delete()
      .eq('job_id', id)
      .eq('created_by', userId); // Ensure user can only delete their own jobs

    if (error) {
      console.error('Error deleting job:', error);
      return NextResponse.json(
        { error: 'Failed to delete job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/jobs/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to delete job',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}