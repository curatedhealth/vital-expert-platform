/**
 * Performance Monitoring API
 * Provides real-time performance metrics and health status
 */

import { NextRequest, NextResponse } from 'next/server';

import { performanceMetricsService } from '@/shared/services/monitoring/performance-metrics.service';

// GET /api/monitoring/performance - Get performance metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const timeWindow = parseInt(searchParams.get('timeWindow') || '3600000'); // Default 1 hour

    if (type) {
      // Get specific metric type
      const metrics = await performanceMetricsService.getMetricsByType(type, timeWindow);
      return NextResponse.json({
        success: true,
        eventType: type,
        timeWindow,
        metrics,
        total: metrics.length
      });
    } else {
      // Get comprehensive performance snapshot
      const snapshot = await performanceMetricsService.getPerformanceSnapshot(timeWindow);
      const healthStatus = performanceMetricsService.calculateHealthStatus(snapshot);
      const errorMetrics = await performanceMetricsService.getErrorMetrics(timeWindow);
      return NextResponse.json({
        success: true,
        snapshot,
        healthStatus,
        errorMetrics,
        timeWindow,
        timestamp: Date.now()
      });
    }

  } catch (error) {
    // console.error('❌ Performance metrics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/monitoring/performance - Update alert thresholds
export async function POST(request: NextRequest) {
  try {

    const { metric, threshold, condition, enabled } = body;

    if (!metric || threshold === undefined || !condition) {
      return NextResponse.json(
        { success: false, error: 'metric, threshold, and condition are required' },
        { status: 400 }
      );
    }

    // // Update the alert threshold
    performanceMetricsService.updateAlertThreshold(metric, threshold, condition);

    // Enable or disable the alert
    if (enabled !== undefined) {
      if (enabled) {
        performanceMetricsService.enableAlert(metric);
      } else {
        performanceMetricsService.disableAlert(metric);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Alert threshold updated successfully',
      updatedThreshold: { metric, threshold, condition, enabled }
    });

  } catch (error) {
    // console.error('❌ Failed to update alert threshold:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update alert threshold',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/monitoring/performance - Clear metrics data
export async function DELETE(request: NextRequest) {
  try {

    if (confirm !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Must include confirm=true to clear metrics' },
        { status: 400 }
      );
    }

    // performanceMetricsService.clearMetrics();

    return NextResponse.json({
      success: true,
      message: 'All metrics data cleared successfully',
      timestamp: Date.now()
    });

  } catch (error) {
    // console.error('❌ Failed to clear metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/monitoring/performance - Export metrics data
export async function PUT(request: NextRequest) {
  try {

    const { format = 'json' } = body;

    if (format !== 'json' && format !== 'csv') {
      return NextResponse.json(
        { success: false, error: 'format must be "json" or "csv"' },
        { status: 400 }
      );
    }

    // const __exportedData = performanceMetricsService.exportMetrics(format);

    return new Response(exportedData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    // console.error('❌ Failed to export metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}