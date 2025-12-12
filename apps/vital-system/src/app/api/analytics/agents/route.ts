/**
 * Agent Analytics API
 * 
 * Provides agent operation metrics and analytics for admin dashboard
 * Integrates with:
 * - Prometheus metrics (real-time)
 * - Database agent_metrics table (historical)
 * - Mode 1 metrics endpoint
 * 
 * @module app/api/analytics/agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrometheusExporter } from '@/lib/services/observability/prometheus-exporter';
import { getAgentMetricsService } from '@/lib/services/observability/agent-metrics-service';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { createClient } from '@/lib/supabase/server';

export interface AgentAnalyticsResponse {
  summary: {
    totalSearches: number;
    averageLatency: number;
    p95Latency: number;
    errorRate: number;
    graphragHitRate: number;
    fallbackRate: number;
  };
  searchMetrics: {
    total: number;
    byMethod: Record<string, number>;
    errors: number;
    errorRate: number;
  };
  graphragMetrics: {
    hits: number;
    fallbacks: number;
    hitRate: number;
  };
  selectionMetrics: {
    total: number;
    byConfidence: {
      high: number;
      medium: number;
      low: number;
    };
    averageLatency: number;
  };
  modeMetrics: {
    mode1: {
      total: number;
      success: number;
      error: number;
      averageLatency: number;
      p95Latency: number;
    };
    mode2: {
      total: number;
      success: number;
      error: number;
      averageLatency: number;
      p95Latency: number;
    };
    mode3: {
      total: number;
      success: number;
      error: number;
      averageLatency: number;
      p95Latency: number;
      averageIterations: number;
    };
  };
  recentOperations: Array<{
    timestamp: string;
    operation: string;
    duration?: number;
    method?: string;
    status: 'success' | 'error';
  }>;
  timeRange: {
    from: string;
    to: string;
  };
}

/**
 * GET /api/analytics/agents
 * Get comprehensive agent operation analytics
 */
export async function GET(request: NextRequest) {
  const logger = createLogger();
  const operationId = `analytics_agents_get_${Date.now()}`;
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') || '24h') as
      | '1h'
      | '6h'
      | '24h'
      | '7d';
    const agentId = searchParams.get('agentId') || undefined;

    logger.info('analytics_agents_get_started', {
      operation: 'GET /api/analytics/agents',
      operationId,
      timeRange,
      agentId,
    });

    // Convert timeRange to period for metrics service
    const period = timeRange;

    // Get user session for tenant ID
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let tenantId: string | undefined;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      tenantId = profile?.tenant_id || undefined;
    }

    // Get aggregated metrics from database
    const metricsService = getAgentMetricsService();
    const aggregatedMetrics = await metricsService.getAggregatedMetrics(
      agentId,
      tenantId,
      period
    );

    // Get detailed metrics for recent operations
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '6h':
        startDate.setHours(startDate.getHours() - 6);
        break;
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
    }

    const detailedMetrics = await metricsService.getMetrics({
      agentId,
      tenantId,
      startDate,
      endDate,
      limit: 100, // Last 100 operations for recent operations
    });

    // Get Prometheus metrics for real-time stats (complementary)
    let prometheusMetrics: any = null;
    try {
      const exporter = getPrometheusExporter();
      prometheusMetrics = await exporter.getMetricsAsJSON();
    } catch (err) {
      logger.warn('analytics_prometheus_fetch_failed', {
        operationId,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    // Calculate summary from aggregated metrics + Prometheus
    const summary = aggregatedMetrics
      ? {
          totalSearches: aggregatedMetrics.totalOperations,
          averageLatency: aggregatedMetrics.averageLatencyMs,
          p95Latency: aggregatedMetrics.p95LatencyMs,
          errorRate: aggregatedMetrics.errorRate,
          graphragHitRate: aggregatedMetrics.graphragHitRate,
          fallbackRate: 100 - aggregatedMetrics.graphragHitRate, // Inverse of hit rate
        }
      : {
          totalSearches: 0,
          averageLatency: 0,
          p95Latency: 0,
          errorRate: 0,
          graphragHitRate: 0,
          fallbackRate: 0,
        };

    // Calculate search metrics
    const searchMetrics = aggregatedMetrics
      ? {
          total: aggregatedMetrics.totalOperations,
          byMethod: aggregatedMetrics.operationsBySearchMethod,
          errors: aggregatedMetrics.failedOperations,
          errorRate: aggregatedMetrics.errorRate,
        }
      : {
          total: 0,
          byMethod: {},
          errors: 0,
          errorRate: 0,
        };

    // Calculate GraphRAG metrics from detailed metrics
    const graphragOps = detailedMetrics.filter(
      (m) => m.operation_type === 'search'
    );
    const graphragHits = graphragOps.filter((m) => m.graphrag_hit === true)
      .length;
    const graphragFallbacks = graphragOps.filter(
      (m) => m.graphrag_fallback === true
    ).length;
    const graphragTotal = graphragHits + graphragFallbacks;

    const graphragMetrics = {
      hits: graphragHits,
      fallbacks: graphragFallbacks,
      hitRate: graphragTotal > 0 ? (graphragHits / graphragTotal) * 100 : 0,
    };

    // Calculate selection metrics from detailed metrics
    const selectionOps = detailedMetrics.filter(
      (m) => m.operation_type === 'selection'
    );
    const highConfidence = selectionOps.filter(
      (m) => m.confidence_score && m.confidence_score >= 0.8
    ).length;
    const mediumConfidence = selectionOps.filter(
      (m) =>
        m.confidence_score &&
        m.confidence_score >= 0.5 &&
        m.confidence_score < 0.8
    ).length;
    const lowConfidence = selectionOps.filter(
      (m) => m.confidence_score && m.confidence_score < 0.5
    ).length;

    const avgSelectionLatency =
      selectionOps.length > 0
        ? selectionOps.reduce(
            (sum, m) => sum + (m.response_time_ms || 0),
            0
          ) / selectionOps.length
        : 0;

    const selectionMetrics = {
      total: selectionOps.length,
      byConfidence: {
        high: highConfidence,
        medium: mediumConfidence,
        low: lowConfidence,
      },
      averageLatency: Math.round(avgSelectionLatency),
    };

    // Calculate mode metrics from detailed metrics
    const mode1Ops = detailedMetrics.filter((m) => {
      if (m.operation_type === 'mode1') {
        return true;
      }
      if (m.operation_type !== 'execution') {
        return false;
      }

      const payload = m.metadata;
      if (!payload) {
        return false;
      }

      if (typeof payload === 'string') {
        try {
          const parsed = JSON.parse(payload);
          return parsed?.mode === 'mode1';
        } catch {
          return false;
        }
      }

      if (typeof payload === 'object') {
        return (payload as Record<string, unknown>)?.mode === 'mode1';
      }

      return false;
    });
    const mode2Ops = detailedMetrics.filter(
      (m) => m.operation_type === 'mode2'
    );
    const mode3Ops = detailedMetrics.filter(
      (m) => m.operation_type === 'mode3'
    );

    const calculateModeStats = (ops: any[]) => {
      if (ops.length === 0) {
        return {
          total: 0,
          success: 0,
          error: 0,
          averageLatency: 0,
          p95Latency: 0,
        };
      }

      const latencies = ops
        .map((m) => m.response_time_ms)
        .filter((l) => l && l > 0)
        .sort((a, b) => a - b);

      const avgLatency =
        latencies.length > 0
          ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length
          : 0;

      const p95Index = Math.floor(latencies.length * 0.95);
      const p95Latency = latencies[p95Index] || 0;

      return {
        total: ops.length,
        success: ops.filter((m) => m.success === true).length,
        error: ops.filter((m) => m.success === false || m.error_occurred === true).length,
        averageLatency: Math.round(avgLatency),
        p95Latency: Math.round(p95Latency),
      };
    };

    const modeMetrics = {
      mode1: calculateModeStats(mode1Ops),
      mode2: calculateModeStats(mode2Ops),
      mode3: {
        ...calculateModeStats(mode3Ops),
        averageIterations: mode3Ops.length > 0
          ? Math.round(
              mode3Ops.reduce((sum, m) => sum + (m.metadata?.iterations || 0), 0) /
                mode3Ops.length
            )
          : 0,
      },
    };

    // Also try to get Mode 1 metrics from separate endpoint (as fallback/enhancement)
    const timeRangeMinutes =
      period === '1h' ? 60 : period === '6h' ? 360 : period === '24h' ? 1440 : 10080;

    const mode1Response = await fetch(
      `${request.nextUrl.origin}/api/ask-expert/mode1/metrics?endpoint=stats&windowMinutes=${timeRangeMinutes}`
    ).catch(() => null);

    const mode1Data = mode1Response?.ok
      ? await mode1Response.json().catch(() => null)
      : null;

    // Build recent operations list from detailed metrics
    const recentOperations = detailedMetrics.slice(0, 20).map((m) => ({
      timestamp: m.created_at as string,
      operation: m.operation_type as string,
      duration: m.response_time_ms as number | undefined,
      method: (m.search_method || undefined) as string | undefined,
      status: (m.success ? 'success' : 'error') as 'success' | 'error',
    }));

    const response: AgentAnalyticsResponse = {
      summary,
      searchMetrics,
      graphragMetrics,
      selectionMetrics,
            modeMetrics: {
              // Use database metrics as primary source, enhance with separate endpoint if available
              mode1: mode1Data?.success && modeMetrics.mode1.total === 0
                ? {
                    total: mode1Data.data.totalRequests || modeMetrics.mode1.total,
                    success: mode1Data.data.successfulRequests || modeMetrics.mode1.success,
                    error:
                      (mode1Data.data.totalRequests || 0) -
                      (mode1Data.data.successfulRequests || 0) || modeMetrics.mode1.error,
                    averageLatency: mode1Data.data.averageLatency || modeMetrics.mode1.averageLatency,
                    p95Latency: mode1Data.data.p95Latency || modeMetrics.mode1.p95Latency,
                  }
                : modeMetrics.mode1, // Use database metrics
              mode2: modeMetrics.mode2,
              mode3: modeMetrics.mode3,
            },
      recentOperations,
      timeRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
    };

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('analytics_agents_get_completed', duration, {
      operation: 'GET /api/analytics/agents',
      operationId,
      timeRange: period,
      totalOperations: summary.totalSearches,
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'analytics_agents_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/analytics/agents',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate summary statistics
 */
function calculateSummary(metrics: any[], timeRangeMinutes: number): AgentAnalyticsResponse['summary'] {
  const searchDuration = metrics.find(m => m.name === 'agent_search_duration_ms');
  const searchTotal = metrics.find(m => m.name === 'agent_search_total');
  const searchErrors = metrics.find(m => m.name === 'agent_search_errors_total');
  const graphragHits = metrics.find(m => m.name === 'graphrag_search_hits_total');
  const graphragFallbacks = metrics.find(m => m.name === 'graphrag_search_fallback_total');

  const totalSearches = getMetricValue(searchTotal) || 0;
  const errors = getMetricValue(searchErrors) || 0;
  const hits = getMetricValue(graphragHits) || 0;
  const fallbacks = getMetricValue(graphragFallbacks) || 0;

  // Calculate P95 latency from histogram
  const p95Latency = calculateHistogramP95(searchDuration) || 0;
  const averageLatency = calculateHistogramMean(searchDuration) || 0;

  const errorRate = totalSearches > 0 ? errors / totalSearches : 0;
  const graphragHitRate = (hits + fallbacks) > 0 ? hits / (hits + fallbacks) : 0;
  const fallbackRate = (hits + fallbacks) > 0 ? fallbacks / (hits + fallbacks) : 0;

  return {
    totalSearches,
    averageLatency: Math.round(averageLatency),
    p95Latency: Math.round(p95Latency),
    errorRate: Math.round(errorRate * 10000) / 100, // Percentage with 2 decimals
    graphragHitRate: Math.round(graphragHitRate * 10000) / 100,
    fallbackRate: Math.round(fallbackRate * 10000) / 100,
  };
}

/**
 * Calculate search metrics
 */
function calculateSearchMetrics(metrics: any[]): AgentAnalyticsResponse['searchMetrics'] {
  const searchTotal = metrics.find(m => m.name === 'agent_search_total');
  const searchErrors = metrics.find(m => m.name === 'agent_search_errors_total');

  const total = getMetricValue(searchTotal) || 0;
  const errors = getMetricValue(searchErrors) || 0;

  // Group by method
  const byMethod: Record<string, number> = {};
  if (searchTotal?.values) {
    for (const value of searchTotal.values) {
      const method = value.labels?.method || 'unknown';
      byMethod[method] = (byMethod[method] || 0) + (value.value || 0);
    }
  }

  return {
    total,
    byMethod,
    errors,
    errorRate: total > 0 ? (errors / total) * 100 : 0,
  };
}

/**
 * Calculate GraphRAG metrics
 */
function calculateGraphragMetrics(metrics: any[]): AgentAnalyticsResponse['graphragMetrics'] {
  const hits = metrics.find(m => m.name === 'graphrag_search_hits_total');
  const fallbacks = metrics.find(m => m.name === 'graphrag_search_fallback_total');

  const hitsCount = getMetricValue(hits) || 0;
  const fallbacksCount = getMetricValue(fallbacks) || 0;
  const total = hitsCount + fallbacksCount;

  return {
    hits: hitsCount,
    fallbacks: fallbacksCount,
    hitRate: total > 0 ? (hitsCount / total) * 100 : 0,
  };
}

/**
 * Calculate selection metrics
 */
function calculateSelectionMetrics(metrics: any[]): AgentAnalyticsResponse['selectionMetrics'] {
  const selectionTotal = metrics.find(m => m.name === 'agent_selection_total');
  const selectionDuration = metrics.find(m => m.name === 'agent_selection_duration_ms');

  const total = getMetricValue(selectionTotal) || 0;
  const averageLatency = calculateHistogramMean(selectionDuration) || 0;

  // Count by confidence level
  const byConfidence = { high: 0, medium: 0, low: 0 };
  if (selectionTotal?.values) {
    for (const value of selectionTotal.values) {
      const level = value.labels?.confidence_level || 'low';
      if (level === 'high') byConfidence.high += value.value || 0;
      else if (level === 'medium') byConfidence.medium += value.value || 0;
      else byConfidence.low += value.value || 0;
    }
  }

  return {
    total,
    byConfidence,
    averageLatency: Math.round(averageLatency),
  };
}

/**
 * Calculate mode execution metrics
 */
function calculateModeMetrics(metrics: any[]): Omit<AgentAnalyticsResponse['modeMetrics'], 'mode1'> {
  const mode2Total = metrics.find(m => m.name === 'mode2_executions_total');
  const mode2Duration = metrics.find(m => m.name === 'mode2_execution_duration_ms');
  const mode3Total = metrics.find(m => m.name === 'mode3_executions_total');
  const mode3Duration = metrics.find(m => m.name === 'mode3_execution_duration_ms');
  const mode3Iterations = metrics.find(m => m.name === 'mode3_react_iterations');

  const mode2Stats = {
    total: getMetricValue(mode2Total) || 0,
    success: getMetricValueByLabel(mode2Total, 'status', 'success') || 0,
    error: getMetricValueByLabel(mode2Total, 'status', 'error') || 0,
    averageLatency: calculateHistogramMean(mode2Duration) || 0,
    p95Latency: calculateHistogramP95(mode2Duration) || 0,
  };

  const mode3Stats = {
    total: getMetricValue(mode3Total) || 0,
    success: getMetricValueByLabel(mode3Total, 'status', 'success') || 0,
    error: getMetricValueByLabel(mode3Total, 'status', 'error') || 0,
    averageLatency: calculateHistogramMean(mode3Duration) || 0,
    p95Latency: calculateHistogramP95(mode3Duration) || 0,
    averageIterations: calculateHistogramMean(mode3Iterations) || 0,
  };

  return {
    mode2: {
      ...mode2Stats,
      averageLatency: Math.round(mode2Stats.averageLatency),
      p95Latency: Math.round(mode2Stats.p95Latency),
    },
    mode3: {
      ...mode3Stats,
      averageLatency: Math.round(mode3Stats.averageLatency),
      p95Latency: Math.round(mode3Stats.p95Latency),
      averageIterations: Math.round(mode3Stats.averageIterations * 10) / 10,
    },
  };
}

// Helper functions
function getMetricValue(metric: any): number {
  if (!metric?.values || metric.values.length === 0) return 0;
  return metric.values.reduce((sum: number, v: any) => sum + (v.value || 0), 0);
}

function getMetricValueByLabel(metric: any, labelKey: string, labelValue: string): number {
  if (!metric?.values) return 0;
  const matching = metric.values.filter((v: any) => v.labels?.[labelKey] === labelValue);
  return matching.reduce((sum: number, v: any) => sum + (v.value || 0), 0);
}

function calculateHistogramMean(metric: any): number {
  if (!metric?.values) return 0;
  const sum = metric.values.find((v: any) => v.metricName?.endsWith('_sum'));
  const count = metric.values.find((v: any) => v.metricName?.endsWith('_count'));
  if (sum?.value && count?.value && count.value > 0) {
    return sum.value / count.value;
  }
  return 0;
}

function calculateHistogramP95(metric: any): number {
  if (!metric?.values) return 0;
  // Simple approximation: find bucket that contains 95th percentile
  // For production, would use proper Prometheus query with histogram_quantile
  // This is a simplified version for the API
  const count = metric.values.find((v: any) => v.metricName?.endsWith('_count'));
  if (!count?.value || count.value === 0) return 0;
  
  // Get buckets sorted by le (less than or equal)
  const buckets = metric.values
    .filter((v: any) => v.labels?.le !== undefined)
    .sort((a: any, b: any) => parseFloat(a.labels.le) - parseFloat(b.labels.le));

  if (buckets.length === 0) return 0;

  let cumulative = 0;
  const p95Threshold = count.value * 0.95;

  for (const bucket of buckets) {
    cumulative += bucket.value || 0;
    if (cumulative >= p95Threshold) {
      return parseFloat(bucket.labels.le) * 1000; // Convert to milliseconds
    }
  }

  // If not found, return max bucket
  return parseFloat(buckets[buckets.length - 1].labels.le) * 1000;
}
