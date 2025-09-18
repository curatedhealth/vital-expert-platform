import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types for MA01 Jobs
export interface MA01Job {
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
 * GET /api/jobs - List all jobs with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('ma01_jobs')
      .select('*', { count: 'exact' })
      .eq('created_by', userId); // Only show user's own jobs

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,query_text.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobs: data || [],
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit
    });

  } catch (error) {
    console.error('GET /api/jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs - Create a new job
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const job: MA01Job = body;

    // Validate required fields
    if (!job.name || !job.name.trim()) {
      return NextResponse.json(
        { error: 'Job name is required' },
        { status: 400 }
      );
    }

    // Prepare job data
    const jobData = {
      name: job.name.trim(),
      description: job.description || null,
      status: job.status || 'pending',
      configuration: job.configuration || {},
      created_by: userId,
      query_text: job.query_text || null,
      ai_agent_used: job.ai_agent_used || null
    };

    const { data, error } = await supabase
      .from('ma01_jobs')
      .insert([jobData])
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job: data,
      message: 'Job created successfully'
    });

  } catch (error) {
    console.error('POST /api/jobs error:', error);
    return NextResponse.json({
      error: 'Failed to create job',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}