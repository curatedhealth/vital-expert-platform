import { NextRequest, NextResponse } from 'next/server';
import { monitoringSystem } from '@/features/autonomous/monitoring-system';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'health';
    const limit = parseInt(searchParams.get('limit') || '50');

    switch (action) {
      case 'health':
        const health = monitoringSystem.getSystemHealth();
        return NextResponse.json({
          success: true,
          data: health,
          timestamp: new Date().toISOString()
        });

      case 'metrics':
        const executionId = searchParams.get('executionId');
        const metrics = monitoringSystem.getPerformanceMetrics(executionId || undefined);
        return NextResponse.json({
          success: true,
          data: metrics,
          count: metrics.length,
          timestamp: new Date().toISOString()
        });

      case 'alerts':
        const alerts = monitoringSystem.getRecentAlerts(limit);
        return NextResponse.json({
          success: true,
          data: alerts,
          count: alerts.length,
          timestamp: new Date().toISOString()
        });

      case 'statistics':
        const alertStats = monitoringSystem.getAlertStatistics();
        return NextResponse.json({
          success: true,
          data: alertStats,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be "health", "metrics", "alerts", or "statistics"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [Monitoring API] Error:', error);
    
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
    const { action, alertId, config } = body;

    switch (action) {
      case 'resolve-alert':
        if (!alertId) {
          return NextResponse.json(
            { error: 'Alert ID is required' },
            { status: 400 }
          );
        }

        const resolved = monitoringSystem.resolveAlert(alertId);
        if (resolved) {
          return NextResponse.json({
            success: true,
            message: 'Alert resolved successfully',
            timestamp: new Date().toISOString()
          });
        } else {
          return NextResponse.json(
            { error: 'Alert not found' },
            { status: 404 }
          );
        }

      case 'create-alert':
        const { type, severity, title, message, source, metadata } = body;
        
        if (!type || !severity || !title || !message || !source) {
          return NextResponse.json(
            { error: 'Missing required fields: type, severity, title, message, source' },
            { status: 400 }
          );
        }

        const alertId = monitoringSystem.createAlert({
          type,
          severity,
          title,
          message,
          source,
          metadata
        });

        return NextResponse.json({
          success: true,
          data: { alertId },
          message: 'Alert created successfully',
          timestamp: new Date().toISOString()
        });

      case 'cleanup':
        monitoringSystem.cleanup();
        return NextResponse.json({
          success: true,
          message: 'Cleanup completed successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be "resolve-alert", "create-alert", or "cleanup"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [Monitoring API] POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
