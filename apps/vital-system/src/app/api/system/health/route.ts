/**
 * System Health Monitoring API
 * GET /api/system/health - Get system health status
 */

import { NextResponse } from 'next/server';

import { SystemHealth } from '@/types/digital-health-agent.types';

/**
 * GET /api/system/health
 * Returns comprehensive system health information
 */
export async function GET() {
  try {
    // Note: ComplianceAwareOrchestrator is archived, using simplified health check
    // Mock performance metrics (in production, gather from actual monitoring)
    const mockMetrics = {
      error_rate_5min: Math.random() * 5, // 0-5% error rate
      response_time_p95: 1500 + Math.random() * 500, // 1.5-2s response time
      memory_usage: 40 + Math.random() * 20, // 40-60% memory usage
      cpu_usage: 20 + Math.random() * 30 // 20-50% CPU usage
    };

    const systemHealth: SystemHealth = {
      status: 'healthy',
      agents_loaded: 0,
      agents_active: 0,
      capabilities_loaded: 0,
      prompts_loaded: 0,
      compliance_active: true,
      last_health_check: new Date().toISOString(),
      error_rate_5min: mockMetrics.error_rate_5min,
      response_time_p95: mockMetrics.response_time_p95,
      memory_usage: mockMetrics.memory_usage,
      cpu_usage: mockMetrics.cpu_usage
    };

    return NextResponse.json({
      success: true,
      data: {
        system_health: systemHealth,
        detailed_metrics: {
          agents: [],
          active_executions: {
            count: 0,
            workflows_running: 0,
            average_completion_time: 0
          },
          compliance_summary: {
            total_accesses: 0,
            compliant_rate: 100,
            phi_exposure_events: 0,
            risk_score: 0
          }
        },
        recommendations: [
          ...(mockMetrics.error_rate_5min > 3 ? ['High error rate detected - review logs'] : []),
          ...(mockMetrics.response_time_p95 > 2000 ? ['Response times elevated - check performance'] : [])
        ]
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking system health:', error);

    // Return unhealthy status if we can't even check health
    const errorHealth: SystemHealth = {
      status: 'unhealthy',
      agents_loaded: 0,
      agents_active: 0,
      capabilities_loaded: 0,
      prompts_loaded: 0,
      compliance_active: false,
      last_health_check: new Date().toISOString(),
      error_rate_5min: 100,
      response_time_p95: 0,
      memory_usage: 0,
      cpu_usage: 0
    };

    return NextResponse.json(
      {
        success: false,
        data: {
          system_health: errorHealth,
          error: 'System health check failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}