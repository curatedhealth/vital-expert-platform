// ===================================================================
// Metrics API - Phase 2 Enhanced Monitoring
// Prometheus-compatible metrics endpoint for system monitoring
// ===================================================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface MetricValue {
  name: string
  help: string
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
  value: number
  labels?: Record<string, string>
  timestamp?: number
}

// GET /api/metrics - Prometheus-compatible metrics endpoint
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);



    // Collect all metrics

    if (format === 'json') {
      return NextResponse.json({
        metrics,
        collection_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      })
    }

    // Default: Prometheus format

    return new NextResponse(prometheusOutput, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    // console.error('Metrics collection error')
    return NextResponse.json({
      error: 'Failed to collect metrics'
    }, { status: 500 })
  }
}

async function collectMetrics(): Promise<MetricValue[]> {
  const metrics: MetricValue[] = []

  // System metrics
  metrics.push({
    name: 'vital_path_uptime_seconds',
    help: 'VITAL Path application uptime in seconds',
    type: 'counter',
    value: process.uptime()
  })

  metrics.push({
    name: 'vital_path_memory_usage_bytes',
    help: 'VITAL Path memory usage in bytes',
    type: 'gauge',
    value: process.memoryUsage().heapUsed
  })

  // Database metrics

  metrics.push(...dbMetrics)

  // API usage metrics

  metrics.push(...apiMetrics)

  // Service health metrics

  metrics.push(...healthMetrics)

  // Business metrics

  metrics.push(...businessMetrics)

  return metrics
}

async function collectDatabaseMetrics(): Promise<MetricValue[]> {
  const metrics: MetricValue[] = []

  try {
    // Query database for various counts
    const [
      { count: totalAgents },
      { count: activeUsers },
      { count: totalOrganizations }
    ] = await Promise.all([
      supabase.from('agents').select('*', { count: 'exact', head: true }).then(r => r),
      supabase.from('users').select('*', { count: 'exact', head: true }).then(r => r),
      supabase.from('organizations').select('*', { count: 'exact', head: true }).then(r => r)
    ])

    metrics.push(
      {
        name: 'vital_path_agents_total',
        help: 'Total number of agents in the system',
        type: 'gauge',
        value: totalAgents || 0
      },
      {
        name: 'vital_path_users_total',
        help: 'Total number of users in the system',
        type: 'gauge',
        value: activeUsers || 0
      },
      {
        name: 'vital_path_organizations_total',
        help: 'Total number of organizations in the system',
        type: 'gauge',
        value: totalOrganizations || 0
      }
    )

  } catch (error) {
    // console.error('Database metrics collection failed')
    metrics.push({
      name: 'vital_path_database_errors_total',
      help: 'Total number of database errors',
      type: 'counter',
      value: 1
    })
  }

  return metrics
}

async function collectAPIUsageMetrics(): Promise<MetricValue[]> {
  const metrics: MetricValue[] = []

  try {
    // Get usage analytics from the last hour

    const { data: usageData } = await supabase
      .from('usage_analytics')
      .select('event_type, resource_type')
      .gte('timestamp', oneHourAgo)

    if (usageData) {
      // Group by event type
      const eventsByType = usageData.reduce((acc: Record<string, number>, event: any) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {});

      // Group by resource type
      const eventsByResource = usageData.reduce((acc: Record<string, number>, event: any) => {
        acc[event.resource_type] = (acc[event.resource_type] || 0) + 1;
        return acc;
      }, {});

      // Add metrics for each event type
      Object.entries(eventCounts).forEach(([eventType, count]) => {
        metrics.push({
          name: 'vital_path_api_requests_total',
          help: 'Total number of API requests',
          type: 'counter',
          value: count,
          labels: { event_type: eventType }
        })
      })

      // Add metrics for each resource type
      Object.entries(resourceCounts).forEach(([resourceType, count]) => {
        metrics.push({
          name: 'vital_path_resource_usage_total',
          help: 'Total resource usage by type',
          type: 'counter',
          value: count,
          labels: { resource_type: resourceType }
        })
      })

      metrics.push({
        name: 'vital_path_api_requests_hourly',
        help: 'Total API requests in the last hour',
        type: 'gauge',
        value: usageData.length
      })
    }

  } catch (error) {
    // console.error('API usage metrics collection failed')
  }

  return metrics
}

async function collectHealthMetrics(): Promise<MetricValue[]> {
  const metrics: MetricValue[] = [];
  const services = [
    'orchestrator', 'prompt_management', 'agent_registry',
    'advisory_board', 'clinical_safety', 'monitoring_service'
  ];

  for (const service of services) {
    try {
      const serviceUrl = process.env[`${service.toUpperCase()}_SERVICE_URL`];
      if (!serviceUrl) continue;

      const response = await fetch(`${serviceUrl}/health`, {
        signal: AbortSignal.timeout(5000)
      })

      metrics.push(
        {
          name: 'vital_path_service_up',
          help: 'Service availability (1 = up, 0 = down)',
          type: 'gauge',
          value: response.ok ? 1 : 0,
          labels: { service }
        },
        {
          name: 'vital_path_service_response_time_seconds',
          help: 'Service response time in seconds',
          type: 'gauge',
          value: responseTime / 1000,
          labels: { service }
        }
      )

    } catch (error) {
      metrics.push({
        name: 'vital_path_service_up',
        help: 'Service availability (1 = up, 0 = down)',
        type: 'gauge',
        value: 0,
        labels: { service }
      })
    }
  }

  return metrics
}

async function collectBusinessMetrics(): Promise<MetricValue[]> {
  const metrics: MetricValue[] = []

  try {

    // Orchestration requests
    const { data: orchestrationData } = await supabase
      .from('usage_analytics')
      .select('*')
      .eq('event_type', 'orchestration_request')
      .gte('timestamp', last24Hours)

    if (orchestrationData) {
      metrics.push({
        name: 'vital_path_orchestration_requests_24h',
        help: 'Orchestration requests in the last 24 hours',
        type: 'gauge',
        value: orchestrationData.length
      })

      // Group by triage level
      const triageCounts = orchestrationData.reduce((acc: Record<string, number>, item: any) => {
        const triageLevel = item.metadata?.triage_level || 'unknown';
        // eslint-disable-next-line security/detect-object-injection
        acc[triageLevel] = (acc[triageLevel] || 0) + 1
        return acc
      }, { /* TODO: implement */ } as Record<string, number>)

      Object.entries(triageCounts).forEach(([triageLevel, count]) => {
        metrics.push({
          name: 'vital_path_orchestration_by_triage_total',
          help: 'Orchestration requests by triage level',
          type: 'counter',
          value: Number(count),
          labels: { triage_level: triageLevel }
        })
      })
    }

    // Clinical validations
    const { data: validationData } = await supabase
      .from('usage_analytics')
      .select('*')
      .like('event_type', '%clinical_validation%')
      .gte('timestamp', last24Hours)

    if (validationData) {
      metrics.push({
        name: 'vital_path_clinical_validations_24h',
        help: 'Clinical validations in the last 24 hours',
        type: 'gauge',
        value: validationData.length
      })
    }

    // Agent registrations
    const { data: agentData } = await supabase
      .from('usage_analytics')
      .select('*')
      .eq('event_type', 'agent_registration')
      .gte('timestamp', last24Hours)

    if (agentData) {
      metrics.push({
        name: 'vital_path_agent_registrations_24h',
        help: 'Agent registrations in the last 24 hours',
        type: 'gauge',
        value: agentData.length
      })
    }

    // Advisory sessions
    const { data: advisoryData } = await supabase
      .from('usage_analytics')
      .select('*')
      .like('event_type', '%advisory%')
      .gte('timestamp', last24Hours)

    if (advisoryData) {
      metrics.push({
        name: 'vital_path_advisory_sessions_24h',
        help: 'Advisory sessions in the last 24 hours',
        type: 'gauge',
        value: advisoryData.length
      })
    }

  } catch (error) {
    // console.error('Business metrics collection failed')
  }

  return metrics
}

function getServiceURL(serviceName: string): string | null {
  const urlMap: Record<string, string> = {
    orchestrator: process.env.ORCHESTRATOR_SERVICE_URL || 'http://localhost:8001',
    prompt_management: process.env.PROMPT_MANAGEMENT_SERVICE_URL || 'http://localhost:8002',
    agent_registry: process.env.AGENT_REGISTRY_SERVICE_URL || 'http://localhost:8003',
    advisory_board: process.env.ADVISORY_BOARD_SERVICE_URL || 'http://localhost:8004',
    clinical_safety: process.env.CLINICAL_SAFETY_SERVICE_URL || 'http://localhost:8005',
    monitoring_service: process.env.MONITORING_SERVICE_URL || 'http://localhost:8006'
  }

  // eslint-disable-next-line security/detect-object-injection
  return urlMap[serviceName] || null
}

function formatPrometheusMetrics(metrics: MetricValue[]): string {
  const output: string[] = []

  // Group metrics by name for proper formatting
  const metricGroups = metrics.reduce((acc: Record<string, MetricValue[]>, metric: MetricValue) => {
    if (!acc[metric.name]) {
      acc[metric.name] = []
    }
    acc[metric.name].push(metric)
    return acc
  }, { /* TODO: implement */ } as Record<string, MetricValue[]>)

  Object.entries(metricGroups).forEach(([metricName, metricList]) => {
    // Add HELP comment (use first metric's help text)
    output.push(`# HELP ${metricName} ${metricList[0].help}`)

    // Add TYPE comment (use first metric's type)
    output.push(`# TYPE ${metricName} ${metricList[0].type}`)

    // Add metric values
    metricList.forEach(metric => {

      // Add labels if present
      if (metric.labels && Object.keys(metric.labels).length > 0) {
        const labelPairs = Object.entries(metric.labels)
          .map(([key, value]) => `${key}="${value}"`)
          .join(',')
        metricLine += `{${labelPairs}}`
      }

      // Add value and optional timestamp
      metricLine += ` ${metric.value}`
      if (metric.timestamp) {
        metricLine += ` ${metric.timestamp}`
      }

      output.push(metricLine)
    })

    // Add blank line between metric groups
    output.push('')
  })

  return output.join('\n')
}