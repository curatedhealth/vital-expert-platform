/**
 * Mode 1 Metrics API
 * 
 * Provides metrics and health check endpoints for Mode 1
 */

import { NextRequest, NextResponse } from 'next/server';
import { mode1MetricsService } from '../../../../../features/ask-expert/mode-1/services/mode1-metrics';

/**
 * GET /api/ask-expert/mode1/metrics
 * Get Mode 1 statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const windowMinutes = parseInt(searchParams.get('windowMinutes') || '60', 10);
    const endpoint = searchParams.get('endpoint') || 'stats';

    switch (endpoint) {
      case 'stats':
        const stats = mode1MetricsService.getStats(windowMinutes);
        return NextResponse.json({
          success: true,
          data: stats,
          windowMinutes,
        });

      case 'health':
        const health = mode1MetricsService.getHealthCheck();
        return NextResponse.json({
          success: true,
          data: health,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid endpoint' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [Mode 1 Metrics API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

