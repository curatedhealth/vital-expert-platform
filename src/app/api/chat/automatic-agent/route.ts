import { NextRequest, NextResponse } from 'next/server';
import { AutomaticAgentOrchestrator } from '@/features/chat/services/automatic-orchestrator';
import { PerformanceTracker } from '@/features/chat/services/performance-tracker';

const orchestrator = new AutomaticAgentOrchestrator();
const performanceTracker = new PerformanceTracker();

export async function POST(request: NextRequest) {
  try {
    const { query, userId, conversationId } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🤖 Processing automatic agent selection for query:', query.substring(0, 100));

    // Orchestrate the query
    const orchestrationResult = await orchestrator.orchestrate(query);

    // Track the query for performance monitoring
    const tracking = await performanceTracker.trackQuery(
      `query-${Date.now()}-${userId || 'anonymous'}`,
      orchestrationResult
    );

    // Return the orchestration result
    return NextResponse.json({
      success: true,
      data: {
        orchestrationResult,
        trackingId: `query-${Date.now()}-${userId || 'anonymous'}`
      }
    });

  } catch (error) {
    console.error('❌ Automatic agent selection error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process automatic agent selection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { trackingId, success, responseTime, userRating, escalationRequired } = await request.json();

    if (!trackingId) {
      return NextResponse.json(
        { error: 'Tracking ID is required' },
        { status: 400 }
      );
    }

    // Update performance tracking
    // In a real implementation, you'd update the specific tracking record
    console.log('📊 Updating performance tracking:', {
      trackingId,
      success,
      responseTime,
      userRating,
      escalationRequired
    });

    return NextResponse.json({
      success: true,
      message: 'Performance tracking updated'
    });

  } catch (error) {
    console.error('❌ Performance tracking update error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update performance tracking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
