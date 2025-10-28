// ===================================================================
// Metrics API - Phase 2 Enhanced Monitoring
// Prometheus-compatible metrics endpoint for system monitoring
// Now integrates with LangExtract metrics and cost tracking
// ===================================================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getMetricsCollector } from '@/lib/services/monitoring/langextract-metrics-collector'
import { getCostTracker } from '@/lib/services/monitoring/cost-tracker'
import { ragLatencyTracker } from '@/lib/services/monitoring/rag-latency-tracker'
import { ragCostTracker } from '@/lib/services/monitoring/rag-cost-tracker'
import { circuitBreakerManager } from '@/lib/services/monitoring/circuit-breaker'

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
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'prometheus';
    const startTime = Date.now();

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

    // Get LangExtract metrics
    const metricsCollector = getMetricsCollector();
    let langExtractMetrics = '';

    if (format === 'prometheus') {
      langExtractMetrics = await metricsCollector.exportPrometheusMetrics();
    }

    // Collect all metrics
    const metrics = await collectMetrics(supabase);

    if (format === 'json') {
      // Include LangExtract metrics in JSON format
      const langExtractJson = await metricsCollector.getCurrentMetrics();
      const costTracker = getCostTracker();
      const costBreakdown = await costTracker.getDailyCost();

      return NextResponse.json({
        platform_metrics: metrics,
        langextract_metrics: langExtractJson,
        cost_metrics: costBreakdown,
        collection_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      })
    }

    // Default: Prometheus format
    const platformMetrics = formatPrometheusMetrics(metrics);
    const prometheusOutput = `${langExtractMetrics}\n\n${platformMetrics}`;

    return new NextResponse(prometheusOutput, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Metrics collection error:', error)
    return NextResponse.json({
      error: 'Failed to collect metrics'
    }, { status: 500 })
  }
}

// POST /api/metrics - Record metrics (internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    const metricsCollector = getMetricsCollector();
    const costTracker = getCostTracker();

    switch (type) {
      case 'extraction':
        await metricsCollector.recordExtraction(data);
        return NextResponse.json({ success: true }, { status: 200 });

      case 'cost':
        await costTracker.recordCost(data);
        return NextResponse.json({ success: true }, { status: 200 });

      case 'error':
        await metricsCollector.recordError(data.error_type);
        return NextResponse.json({ success: true }, { status: 200 });

      default:
        return NextResponse.json(
          { error: 'Invalid metric type' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error recording metrics:', error);
    return NextResponse.json(
      { error: 'Failed to record metrics', details: error.message },
      { status: 500 }
    );
  }
}

async function collectMetrics(supabase: any): Promise<MetricValue[]> {
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
  const dbMetrics = await collectDatabaseMetrics(supabase);
  metrics.push(...dbMetrics)

  // API usage metrics
  const apiMetrics = await collectAPIUsageMetrics(supabase);
  metrics.push(...apiMetrics)

  // Service health metrics
  const healthMetrics = await collectHealthMetrics();
  metrics.push(...healthMetrics)

  // Business metrics
  const businessMetrics = await collectBusinessMetrics(supabase);
  metrics.push(...businessMetrics)

  // Phase 1 RAG monitoring metrics
  const ragMetrics = await collectRAGMetrics();
  metrics.push(...ragMetrics)

  return metrics
}

async function collectDatabaseMetrics(supabase: ReturnType<typeof createClient>): Promise<MetricValue[]> {
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

async function collectAPIUsageMetrics(supabase: ReturnType<typeof createClient>): Promise<MetricValue[]> {
  const metrics: MetricValue[] = []

  try {
    // Get usage analytics from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

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
      Object.entries(eventsByType).forEach(([eventType, count]) => {
        metrics.push({
          name: 'vital_path_api_requests_total',
          help: 'Total number of API requests',
          type: 'counter',
          value: count,
          labels: { event_type: eventType }
        })
      })

      // Add metrics for each resource type
      Object.entries(eventsByResource).forEach(([resourceType, count]) => {
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

      const startTime = Date.now();
      const response = await fetch(`${serviceUrl}/health`, {
        signal: AbortSignal.timeout(5000)
      })
      const responseTime = Date.now() - startTime;

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

async function collectBusinessMetrics(supabase: ReturnType<typeof createClient>): Promise<MetricValue[]> {
  const metrics: MetricValue[] = []

  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

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

async function collectRAGMetrics(): Promise<MetricValue[]> {
  const metrics: MetricValue[] = [];

  try {
    // === LATENCY METRICS ===
    const latencyBreakdown = ragLatencyTracker.getLatencyBreakdown(60) as any; // Last 60 minutes

    // Overall latency percentiles (only if data exists)
    if (latencyBreakdown.overall?.total) {
      metrics.push(
        {
          name: 'rag_latency_p50_milliseconds',
          help: 'RAG query latency P50 (median) in milliseconds',
          type: 'gauge',
          value: latencyBreakdown.overall.total.p50 || 0
        },
        {
          name: 'rag_latency_p95_milliseconds',
          help: 'RAG query latency P95 in milliseconds',
          type: 'gauge',
          value: latencyBreakdown.overall.total.p95 || 0
        },
        {
          name: 'rag_latency_p99_milliseconds',
          help: 'RAG query latency P99 in milliseconds',
          type: 'gauge',
          value: latencyBreakdown.overall.total.p99 || 0
        },
        {
          name: 'rag_latency_mean_milliseconds',
          help: 'RAG query latency mean in milliseconds',
          type: 'gauge',
          value: latencyBreakdown.overall.total.mean || 0
        }
      );

      // Cache performance
      metrics.push({
        name: 'rag_cache_hit_rate',
        help: 'RAG cache hit rate (0-1)',
        type: 'gauge',
        value: latencyBreakdown.overall.cacheHitRate || 0
      });

      // Query count
      metrics.push({
        name: 'rag_queries_total',
        help: 'Total number of RAG queries',
        type: 'counter',
        value: latencyBreakdown.overall.total.count || 0
      });
    }

    // Latency by component (only if data exists)
    if (latencyBreakdown.byComponent?.queryEmbedding?.p95) {
      metrics.push({
        name: 'rag_component_latency_milliseconds',
        help: 'RAG component latency P95 in milliseconds',
        type: 'gauge',
        value: latencyBreakdown.byComponent.queryEmbedding.p95,
        labels: { component: 'query_embedding' }
      });
    }

    if (latencyBreakdown.byComponent?.vectorSearch?.p95) {
      metrics.push({
        name: 'rag_component_latency_milliseconds',
        help: 'RAG component latency P95 in milliseconds',
        type: 'gauge',
        value: latencyBreakdown.byComponent.vectorSearch.p95,
        labels: { component: 'vector_search' }
      });
    }

    if (latencyBreakdown.byComponent?.reranking?.p95) {
      metrics.push({
        name: 'rag_component_latency_milliseconds',
        help: 'RAG component latency P95 in milliseconds',
        type: 'gauge',
        value: latencyBreakdown.byComponent.reranking.p95,
        labels: { component: 'reranking' }
      });
    }

    // === COST METRICS ===
    const costStats = ragCostTracker.getCostStats(60); // Last 60 minutes

    metrics.push(
      {
        name: 'rag_cost_total_usd',
        help: 'Total RAG cost in USD',
        type: 'counter',
        value: costStats.totalCostUsd
      },
      {
        name: 'rag_cost_per_query_usd',
        help: 'Average RAG cost per query in USD',
        type: 'gauge',
        value: costStats.avgCostPerQuery
      },
      {
        name: 'rag_queries_count',
        help: 'Total number of queries processed',
        type: 'counter',
        value: costStats.queryCount
      }
    );

    // Cost breakdown by provider
    if (costStats.breakdown && typeof costStats.breakdown === 'object') {
      Object.entries(costStats.breakdown).forEach(([provider, cost]) => {
        metrics.push({
          name: 'rag_cost_by_provider_usd',
          help: 'RAG cost breakdown by provider in USD',
          type: 'counter',
          value: cost,
          labels: { provider }
        });
      });
    }

    // Budget status
    const budgetStatus = ragCostTracker.checkBudget();

    if (budgetStatus?.dailyStatus && budgetStatus?.monthlyStatus) {
      metrics.push(
        {
          name: 'rag_budget_daily_usage_percent',
          help: 'RAG daily budget usage percentage',
          type: 'gauge',
          value: budgetStatus.dailyStatus.percent || 0
        },
        {
          name: 'rag_budget_monthly_usage_percent',
          help: 'RAG monthly budget usage percentage',
          type: 'gauge',
          value: budgetStatus.monthlyStatus.percent || 0
        }
      );
    }

    // === CIRCUIT BREAKER METRICS ===
    const allCircuitBreakers = circuitBreakerManager.getAllStats();

    if (allCircuitBreakers && typeof allCircuitBreakers === 'object') {
      Object.entries(allCircuitBreakers).forEach(([service, stats]) => {
      // Circuit breaker state (CLOSED=0, HALF_OPEN=1, OPEN=2)
      const stateValue = stats.state === 'CLOSED' ? 0 : stats.state === 'HALF_OPEN' ? 1 : 2;

      metrics.push(
        {
          name: 'rag_circuit_breaker_state',
          help: 'Circuit breaker state (0=CLOSED, 1=HALF_OPEN, 2=OPEN)',
          type: 'gauge',
          value: stateValue,
          labels: { service }
        },
        {
          name: 'rag_circuit_breaker_failures_total',
          help: 'Total circuit breaker failures',
          type: 'counter',
          value: stats.failures,
          labels: { service }
        },
        {
          name: 'rag_circuit_breaker_successes_total',
          help: 'Total circuit breaker successes',
          type: 'counter',
          value: stats.successes,
          labels: { service }
        },
        {
          name: 'rag_circuit_breaker_requests_total',
          help: 'Total circuit breaker requests',
          type: 'counter',
          value: stats.totalRequests,
          labels: { service }
        },
        {
          name: 'rag_circuit_breaker_rejected_total',
          help: 'Total rejected requests (circuit open)',
          type: 'counter',
          value: stats.rejectedRequests,
          labels: { service }
        }
      );
      });
    }

  } catch (error) {
    console.error('RAG metrics collection failed:', error);
    metrics.push({
      name: 'rag_metrics_collection_errors_total',
      help: 'Total RAG metrics collection errors',
      type: 'counter',
      value: 1
    });
  }

  return metrics;
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

      let metricLine = metricName;

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