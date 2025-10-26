import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@vital/sdk';

const feedbackSchema = z.object({
  queryId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  feedback: z.string().max(1000).optional(),
  helpful: z.boolean().optional(),
  accurate: z.boolean().optional(),
  complete: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await request.json();
    const { queryId, rating, feedback, helpful, accurate, complete } =
      feedbackSchema.parse(body);

    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the query belongs to the user's organization
    const { data: query, error: queryError } = await supabase
      .from('queries')
      .select('id, organization_id, user_id')
      .eq('id', queryId)
      .single();

    if (queryError || !query) {
      return NextResponse.json({ error: 'Query not found' }, { status: 404 });
    }

    // Check if user has access to this query
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.organization_id !== query.organization_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update the query with feedback
    const { error: updateError } = await supabase
      .from('queries')
      .update({
        feedback_rating: rating,
        feedback_text: feedback,
      })
      .eq('id', queryId);

    if (updateError) {
      console.error('Error updating query feedback:', updateError);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    // Store detailed feedback metrics for analytics
    const feedbackMetrics = {
      query_id: queryId,
      user_id: user.id,
      rating,
      helpful,
      accurate,
      complete,
      feedback_text: feedback,
      created_at: new Date().toISOString(),
    };

    // You could store this in a separate feedback table for analytics
    // For now, we'll log it for monitoring
    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: query.organization_id,
        user_id: user.id,
        action: 'feedback_submitted',
        resource_type: 'query',
        resource_id: queryId,
        details: {
          rating,
          helpful,
          accurate,
          complete,
          has_text_feedback: !!feedback,
        },
      });

    return NextResponse.json({
      success: true,
      message: 'Feedback saved successfully',
    });

  } catch (error) {
    console.error('Feedback processing error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve query history with feedback
export async function GET(request: NextRequest) {
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const phase = searchParams.get('phase');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Build query filters
    let query = supabase
      .from('queries')
      .select(`
        id,
        query_text,
        query_type,
        phase,
        response,
        confidence_score,
        feedback_rating,
        feedback_text,
        processing_time_ms,
        models_used,
        created_at,
        projects:project_id(name)
      `)
      .eq('organization_id', userProfile.organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (phase) {
      query = query.eq('phase', phase);
    }

    const { data: queries, error: queriesError } = await query;

    if (queriesError) {
      console.error('Error fetching queries:', queriesError);
      return NextResponse.json(
        { error: 'Failed to fetch query history' },
        { status: 500 }
      );
    }

    // Calculate some basic statistics
    const totalQueries = queries?.length || 0;
    const averageRating = queries
      ?.filter(q => q.feedback_rating)
      .reduce((sum, q) => sum + q.feedback_rating!, 0) /
      (queries?.filter(q => q.feedback_rating).length || 1);

    const averageConfidence = queries
      ?.reduce((sum, q) => sum + (q.confidence_score || 0), 0) / totalQueries;

    return NextResponse.json({
      queries: queries || [],
      pagination: {
        limit,
        offset,
        total: totalQueries,
      },
      statistics: {
        totalQueries,
        averageRating: averageRating || null,
        averageConfidence: averageConfidence || null,
        queriesWithFeedback: queries?.filter(q => q.feedback_rating).length || 0,
      },
    });

  } catch (error) {
    console.error('Query history fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch query history' },
      { status: 500 }
    );
  }
}