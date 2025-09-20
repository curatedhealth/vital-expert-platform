/**
 * System Health Monitoring API
 * GET /api/system/health - Get system health status
 */

import { NextResponse } from 'next/server';
import { ComplianceAwareOrchestrator } from '@/agents/core/ComplianceAwareOrchestrator';
import { SystemHealth } from '@/types/digital-health-agent.types';

// Initialize orchestrator
let orchestrator: ComplianceAwareOrchestrator | null = null;

async function getOrchestrator(): Promise<ComplianceAwareOrchestrator> {
  if (!orchestrator) {
    orchestrator = new ComplianceAwareOrchestrator();
    await orchestrator.initializeWithCompliance();
  }
  return orchestrator;
}

/**
 * GET /api/system/health
 * Returns comprehensive system health information
 */
export async function GET() {
  try {
    const orch = await getOrchestrator();

    // Get agent statuses
    const agentStatuses = orch.getAgentStatus();
    const activeAgents = agentStatuses.filter(agent => agent.status === 'active').length;

    // Get active executions
    const activeExecutions = orch.getActiveExecutions();

    // Calculate system metrics
    const totalCapabilities = agentStatuses.reduce((sum, agent) => sum + agent.capabilities_loaded, 0);
    const totalPrompts = agentStatuses.reduce((sum, agent) => sum + agent.prompts_loaded, 0);

    // Mock performance metrics (in production, gather from actual monitoring)
    const mockMetrics = {
      error_rate_5min: Math.random() * 5, // 0-5% error rate
      response_time_p95: 1500 + Math.random() * 500, // 1.5-2s response time
      memory_usage: 40 + Math.random() * 20, // 40-60% memory usage
      cpu_usage: 20 + Math.random() * 30 // 20-50% CPU usage
    };

    const systemHealth: SystemHealth = {
      status: activeAgents === agentStatuses.length ? 'healthy' :
              activeAgents > agentStatuses.length * 0.7 ? 'degraded' : 'unhealthy',
      agents_loaded: agentStatuses.length,
      agents_active: activeAgents,
      capabilities_loaded: totalCapabilities,
      prompts_loaded: totalPrompts,
      compliance_active: true, // Compliance is always active in this implementation
      last_health_check: new Date().toISOString(),
      error_rate_5min: mockMetrics.error_rate_5min,
      response_time_p95: mockMetrics.response_time_p95,
      memory_usage: mockMetrics.memory_usage,
      cpu_usage: mockMetrics.cpu_usage
    };

    // Get compliance dashboard for additional health metrics
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 1); // Last hour

    const complianceDashboard = orch.getComplianceDashboard({
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });

    return NextResponse.json({
      success: true,
      data: {
        system_health: systemHealth,
        detailed_metrics: {
          agents: agentStatuses.map(agent => ({
            name: agent.name,
            display_name: agent.display_name,
            status: agent.status,
            capabilities_loaded: agent.capabilities_loaded,
            prompts_loaded: agent.prompts_loaded,
            total_executions: (agent as any).total_executions || 0,
            last_execution: (agent as any).last_execution || null
          })),
          active_executions: {
            count: activeExecutions.length,
            workflows_running: activeExecutions.filter(exec => exec.status === 'running').length,
            average_completion_time: activeExecutions.length > 0
              ? activeExecutions
                  .filter(exec => exec.completed_at)
                  .reduce((sum, exec) => {
                    const duration = new Date(exec.completed_at!).getTime() - new Date(exec.started_at).getTime();
                    return sum + duration;
                  }, 0) / activeExecutions.filter(exec => exec.completed_at).length
              : 0
          },
          compliance_summary: {
            total_accesses: complianceDashboard.overview.totalAccesses,
            compliant_rate: complianceDashboard.overview.totalAccesses > 0
              ? (complianceDashboard.overview.compliantAccesses / complianceDashboard.overview.totalAccesses) * 100
              : 100,
            phi_exposure_events: complianceDashboard.overview.phiExposureEvents,
            risk_score: complianceDashboard.overview.riskScore
          }
        },
        recommendations: [
          ...(systemHealth.status !== 'healthy' ? ['Investigate agent health issues'] : []),
          ...(mockMetrics.error_rate_5min > 3 ? ['High error rate detected - review logs'] : []),
          ...(mockMetrics.response_time_p95 > 2000 ? ['Response times elevated - check performance'] : []),
          ...(complianceDashboard.overview.riskScore > 30 ? ['Compliance risk elevated - review recent activities'] : [])
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