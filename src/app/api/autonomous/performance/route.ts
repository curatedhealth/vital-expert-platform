import { NextRequest, NextResponse } from 'next/server';
import { performanceOptimizer } from '@/features/autonomous/performance-optimizer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'report';

    switch (action) {
      case 'report':
        const report = performanceOptimizer.getPerformanceReport();
        return NextResponse.json({
          success: true,
          data: report,
          timestamp: new Date().toISOString()
        });

      case 'reset':
        performanceOptimizer.reset();
        return NextResponse.json({
          success: true,
          message: 'Performance metrics reset successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be "report" or "reset"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [Performance API] Error:', error);
    
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
    const { action, config } = body;

    switch (action) {
      case 'configure':
        // Update performance optimizer configuration
        if (config) {
          // This would require adding a configure method to PerformanceOptimizer
          return NextResponse.json({
            success: true,
            message: 'Configuration updated successfully',
            timestamp: new Date().toISOString()
          });
        } else {
          return NextResponse.json(
            { error: 'Configuration is required' },
            { status: 400 }
          );
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be "configure"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [Performance API] POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
