import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface FeedbackRequest {
  messageId: string;
  vote: 'up' | 'down';
  rating?: number;
  category?: string;
  comment?: string;
  queryText: string;
  responseText: string;
  agentId?: string;
  timestamp: string;

  // Optional metadata
  responseTimeMs?: number;
  tokensUsed?: number;
  costUsd?: number;
  modelName?: string;
  retrievalStrategy?: string;
  numSourcesCited?: number;
  sessionId?: string;
  conversationId?: string;
  messagePosition?: number;
}

/**
 * POST /api/feedback
 * Submit user feedback on RAG responses
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user (optional - feedback can be anonymous)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get tenant ID from headers or cookie
    const tenantId =
      request.headers.get('x-tenant-id') ||
      request.cookies.get('tenant_id')?.value;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body: FeedbackRequest = await request.json();

    // Validate required fields
    if (!body.messageId || !body.vote || !body.queryText || !body.responseText) {
      return NextResponse.json(
        { error: 'Missing required fields: messageId, vote, queryText, responseText' },
        { status: 400 }
      );
    }

    // Validate vote
    if (!['up', 'down'].includes(body.vote)) {
      return NextResponse.json(
        { error: 'Invalid vote. Must be "up" or "down"' },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (body.rating !== undefined && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get user agent for device tracking
    const userAgent = request.headers.get('user-agent') || '';
    const deviceType = getDeviceType(userAgent);

    // Insert feedback into database
    const { data, error } = await supabase
      .from('rag_user_feedback')
      .insert({
        message_id: body.messageId,
        user_id: user?.id || null,
        tenant_id: tenantId,
        agent_id: body.agentId || null,
        query_text: body.queryText,
        response_text: body.responseText,
        vote: body.vote,
        rating: body.rating || null,
        category: body.category || null,
        comment: body.comment || null,
        response_time_ms: body.responseTimeMs || null,
        tokens_used: body.tokensUsed || null,
        cost_usd: body.costUsd || null,
        model_name: body.modelName || null,
        retrieval_strategy: body.retrievalStrategy || null,
        num_sources_cited: body.numSourcesCited || null,
        session_id: body.sessionId || null,
        conversation_id: body.conversationId || null,
        message_position: body.messagePosition || null,
        user_agent: userAgent,
        device_type: deviceType,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting feedback:', error);
      return NextResponse.json(
        { error: 'Failed to save feedback', details: error.message },
        { status: 500 }
      );
    }

    // Track in monitoring (if available)
    try {
      // Increment feedback counter
      await fetch(`${request.nextUrl.origin}/api/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metric: 'rag_feedback_total',
          value: 1,
          labels: {
            vote: body.vote,
            category: body.category || 'none',
            tenant_id: tenantId,
          },
        }),
      });
    } catch (metricsError) {
      // Non-critical - don't fail feedback submission if metrics fail
      console.warn('Failed to track feedback metrics:', metricsError);
    }

    return NextResponse.json({
      success: true,
      feedbackId: data.id,
      message: 'Thank you for your feedback!',
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feedback
 * Retrieve feedback analytics for current tenant
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get tenant ID from headers or cookie
    const tenantId =
      request.headers.get('x-tenant-id') ||
      request.cookies.get('tenant_id')?.value;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID required' },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = request.nextUrl;
    const view = searchParams.get('view') || 'summary';
    const agentId = searchParams.get('agentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Query based on view type
    if (view === 'analytics') {
      // Get analytics view
      let query = supabase
        .from('vw_feedback_analytics')
        .select('*')
        .eq('tenant_id', tenantId);

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
          { error: 'Failed to fetch analytics' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data });
    } else if (view === 'daily') {
      // Get daily summary
      let query = supabase
        .from('vw_daily_feedback_summary')
        .select('*')
        .eq('tenant_id', tenantId);

      if (startDate) {
        query = query.gte('feedback_date', startDate);
      }

      if (endDate) {
        query = query.lte('feedback_date', endDate);
      }

      query = query.order('feedback_date', { ascending: false }).limit(30);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching daily summary:', error);
        return NextResponse.json(
          { error: 'Failed to fetch daily summary' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data });
    } else if (view === 'problems') {
      // Get problem queries using function
      const { data, error } = await supabase.rpc('get_problem_queries', {
        p_tenant_id: tenantId,
        p_min_rating: 2,
        p_limit: 50,
      });

      if (error) {
        console.error('Error fetching problem queries:', error);
        return NextResponse.json(
          { error: 'Failed to fetch problem queries' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data });
    } else {
      // Default: get summary stats
      const { data, error } = await supabase
        .from('rag_user_feedback')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json(
          { error: 'Failed to fetch feedback' },
          { status: 500 }
        );
      }

      // Calculate summary stats
      const totalFeedback = data.length;
      const thumbsUp = data.filter((f) => f.vote === 'up').length;
      const thumbsDown = data.filter((f) => f.vote === 'down').length;
      const satisfactionRate =
        totalFeedback > 0 ? (thumbsUp / totalFeedback) * 100 : 0;

      const ratings = data.filter((f) => f.rating !== null).map((f) => f.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

      return NextResponse.json({
        summary: {
          totalFeedback,
          thumbsUp,
          thumbsDown,
          satisfactionRate: Math.round(satisfactionRate * 100) / 100,
          avgRating: Math.round(avgRating * 100) / 100,
        },
        recentFeedback: data.slice(0, 10),
      });
    }
  } catch (error) {
    console.error('Feedback retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to determine device type from user agent
 */
function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) {
    return 'mobile';
  } else if (/tablet|ipad/i.test(userAgent)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}
