/**
 * Agent Analytics API
 * 
 * Provides agent operation metrics and analytics for admin dashboard
 * Integrates with Prometheus metrics and Mode 1 metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrometheusExporter } from '@/lib/services/observability/prometheus-exporter';

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
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '1h'; // 1h, 6h, 24h, 7d
    
    // Convert timeRange to minutes for Prometheus queries
    const timeRangeMinutes = {
      '1h': 60,
      '6h': 360,
      '24h': 1440,
      '7d': 10080,
    }[timeRange] || 60;

    // For now, return structured metrics based on Prometheus exporter
    // We'll need to query /api/metrics and parse it, or directly access the registry
    // Let's use the simpler approach: query our own metrics endpoint
    let metricsJson: any[] = [];
    
    try {
      const metricsResponse = await fetch(`${request.nextUrl.origin}/api/metrics?format=json`);
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        // Parse Prometheus text format from the response if needed
        // For now, we'll create a simplified structure
        metricsJson = []; // Will be populated from actual metrics
      }
    } catch (err) {
      console.warn('Could not fetch metrics:', err);
    }

    // For now, return mock/placeholder data until we have actual metrics
    // In production, this would parse from Prometheus metrics
    const summary = {
      totalSearches: 0,
      averageLatency: 0,
      p95Latency: 0,
      errorRate: 0,
      graphragHitRate: 0,
      fallbackRate: 0,
    };
    const searchMetrics = {
      total: 0,
      byMethod: {},
      errors: 0,
      errorRate: 0,
    };
    const graphragMetrics = {
      hits: 0,
      fallbacks: 0,
      hitRate: 0,
    };
    const selectionMetrics = {
      total: 0,
      byConfidence: { high: 0, medium: 0, low: 0 },
      averageLatency: 0,
    };
    const modeMetrics = {
      mode2: {
        total: 0,
        success: 0,
        error: 0,
        averageLatency: 0,
        p95Latency: 0,
      },
      mode3: {
        total: 0,
        success: 0,
        error: 0,
        averageLatency: 0,
        p95Latency: 0,
        averageIterations: 0,
      },
    };
    
    // TODO: Replace with actual Prometheus metrics parsing
    // For now return structured empty data - metrics will populate as operations occur

    // Get Mode 1 metrics if available
    const mode1Response = await fetch(`${request.nextUrl.origin}/api/ask-expert/mode1/metrics?endpoint=stats&windowMinutes=${timeRangeMinutes}`)
      .catch(() => null);
    
    const mode1Data = mode1Response?.ok 
      ? await mode1Response.json().catch(() => null)
      : null;

    const response: AgentAnalyticsResponse = {
      summary,
      searchMetrics,
      graphragMetrics,
      selectionMetrics,
      modeMetrics: {
        ...modeMetrics,
        // Include Mode 1 if available
        mode1: mode1Data?.success ? {
          total: mode1Data.data.totalRequests || 0,
          success: mode1Data.data.successfulRequests || 0,
          error: (mode1Data.data.totalRequests || 0) - (mode1Data.data.successfulRequests || 0),
          averageLatency: mode1Data.data.averageLatency || 0,
          p95Latency: mode1Data.data.p95Latency || 0,
        } : undefined,
      } as any,
      recentOperations: [], // Would need to fetch from logs/storage
      timeRange: {
        from: new Date(Date.now() - timeRangeMinutes * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('Agent analytics error:', error);
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

