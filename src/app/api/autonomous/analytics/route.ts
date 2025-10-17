import { NextRequest, NextResponse } from 'next/server';
import { analyticsManager } from '@/features/autonomous/analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'insights';
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const days = parseInt(searchParams.get('days') || '7');

    switch (action) {
      case 'insights':
        const insights = await analyticsManager.getSystemInsights();
        return NextResponse.json({
          success: true,
          data: insights,
          timestamp: new Date().toISOString()
        });

      case 'realtime':
        const realtimeInsights = await analyticsManager.getRealTimeInsights();
        return NextResponse.json({
          success: true,
          data: realtimeInsights,
          timestamp: new Date().toISOString()
        });

      case 'user-behavior':
        if (!userId) {
          return NextResponse.json(
            { error: 'userId is required for user behavior analysis' },
            { status: 400 }
          );
        }
        const userBehavior = analyticsManager.getUserBehavior(userId);
        return NextResponse.json({
          success: true,
          data: userBehavior,
          timestamp: new Date().toISOString()
        });

      case 'performance-trends':
        const trends = analyticsManager.getPerformanceTrends(days);
        return NextResponse.json({
          success: true,
          data: trends,
          timestamp: new Date().toISOString()
        });

      case 'events':
        if (type) {
          const events = analyticsManager.getEventsByType(type, limit);
          return NextResponse.json({
            success: true,
            data: events,
            count: events.length,
            timestamp: new Date().toISOString()
          });
        } else if (userId) {
          const events = analyticsManager.getEventsByUser(userId, limit);
          return NextResponse.json({
            success: true,
            data: events,
            count: events.length,
            timestamp: new Date().toISOString()
          });
        } else {
          return NextResponse.json(
            { error: 'Either type or userId is required for events query' },
            { status: 400 }
          );
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be "insights", "realtime", "user-behavior", "performance-trends", or "events"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [Analytics API] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'track-event':
        analyticsManager.trackEvent(data);
        return NextResponse.json({
          success: true,
          message: 'Event tracked successfully',
          timestamp: new Date().toISOString()
        });

      case 'track-performance':
        analyticsManager.trackPerformance(data);
        return NextResponse.json({
          success: true,
          message: 'Performance metrics tracked successfully',
          timestamp: new Date().toISOString()
        });

      case 'track-usage':
        analyticsManager.trackUsage(data);
        return NextResponse.json({
          success: true,
          message: 'Usage analytics tracked successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be "track-event", "track-performance", or "track-usage"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [Analytics API] POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
