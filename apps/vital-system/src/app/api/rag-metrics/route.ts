/**
 * RAG Metrics API Endpoint
 * Provides access to RAG monitoring metrics
 *
 * Endpoints:
 * - GET /api/rag-metrics - Get dashboard metrics
 * - GET /api/rag-metrics/latency - Get latency metrics
 * - GET /api/rag-metrics/cost - Get cost metrics
 * - GET /api/rag-metrics/health - Get service health
 * - GET /api/rag-metrics/realtime - Get real-time metrics
 * - GET /api/rag-metrics/slo - Get SLO compliance
 * - GET /api/rag-metrics/export - Export metrics data
 * - POST /api/rag-metrics/circuit-breaker/reset - Reset circuit breakers
 */

import { NextRequest, NextResponse } from 'next/server';
import { ragMetricsDashboard } from '@/lib/services/monitoring/rag-metrics-dashboard';
import { ragLatencyTracker } from '@/lib/services/monitoring/rag-latency-tracker';
import { ragCostTracker } from '@/lib/services/monitoring/rag-cost-tracker';
import { circuitBreakerManager } from '@/lib/services/monitoring/circuit-breaker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/rag-metrics
 * Returns comprehensive dashboard metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'dashboard';
    const windowMinutes = parseInt(searchParams.get('window') || '60', 10);
    const format = searchParams.get('format') || 'json';

    switch (endpoint) {
      case 'dashboard': {
        const dashboard = await ragMetricsDashboard.getDashboard(windowMinutes);

        if (format === 'console') {
          const summary = await ragMetricsDashboard.getConsoleSummary(windowMinutes);
          return new NextResponse(summary, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
          });
        }

        return NextResponse.json(dashboard);
      }

      case 'latency': {
        const latency = ragLatencyTracker.getLatencyBreakdown(windowMinutes);
        const byStrategy = ragLatencyTracker.getLatencyByStrategy(windowMinutes);
        const slowQueries = ragLatencyTracker.getSlowQueries(windowMinutes, 10);
        const alerts = ragLatencyTracker.getAlertStatus(windowMinutes);

        return NextResponse.json({
          overall: latency,
          byStrategy,
          slowQueries,
          alerts,
        });
      }

      case 'cost': {
        const stats = ragCostTracker.getCostStats(windowMinutes);
        const byUser = ragCostTracker.getCostsByUser(windowMinutes);
        const byAgent = ragCostTracker.getCostsByAgent(windowMinutes);
        const expensiveQueries = ragCostTracker.getMostExpensiveQueries(windowMinutes, 10);
        const budget = ragCostTracker.checkBudget();

        return NextResponse.json({
          stats,
          byUser,
          byAgent,
          expensiveQueries,
          budget,
        });
      }

      case 'health': {
        const allStats = circuitBreakerManager.getAllStats();
        const unhealthyServices = circuitBreakerManager.getUnhealthyServices();

        return NextResponse.json({
          circuitBreakers: allStats,
          unhealthyServices,
          overallStatus: unhealthyServices.length === 0 ? 'healthy' : 'degraded',
        });
      }

      case 'realtime': {
        const realtime = await ragMetricsDashboard.getRealTimeMetrics();
        return NextResponse.json(realtime);
      }

      case 'slo': {
        const slo = await ragMetricsDashboard.getSLOCompliance(windowMinutes);
        return NextResponse.json(slo);
      }

      case 'export': {
        const data = await ragMetricsDashboard.exportData(windowMinutes);
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid endpoint. Valid options: dashboard, latency, cost, health, realtime, slo, export' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('RAG Metrics API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve RAG metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rag-metrics/circuit-breaker/reset
 * Resets circuit breakers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceName } = body;

    if (serviceName) {
      // Reset specific circuit breaker
      circuitBreakerManager.reset(serviceName);
      return NextResponse.json({
        success: true,
        message: `Circuit breaker for ${serviceName} reset`,
      });
    } else {
      // Reset all circuit breakers
      circuitBreakerManager.resetAll();
      return NextResponse.json({
        success: true,
        message: 'All circuit breakers reset',
      });
    }
  } catch (error) {
    console.error('Circuit Breaker Reset Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset circuit breakers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
