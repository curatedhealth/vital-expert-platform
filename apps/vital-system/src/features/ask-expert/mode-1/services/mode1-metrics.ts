/**
 * Mode 1 Metrics Service
 * 
 * Tracks Mode 1 specific metrics for observability:
 * - Request latency and throughput
 * - Error rates by type
 * - Tool execution metrics
 * - RAG performance per agent
 * - Cost tracking per request
 */
import { logger } from '@vital/utils';

export interface Mode1Metrics {
  requestId: string;
  agentId: string;
  executionPath: 'direct' | 'rag' | 'tools' | 'rag+tools';
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  errorCode?: string;
  
  // Latency breakdown
  latency: {
    agentFetchMs?: number;
    ragRetrievalMs?: number;
    toolExecutionMs?: number;
    llmCallMs?: number;
    totalMs: number;
  };
  
  // Tool metrics
  tools?: {
    calls: number;
    successCount: number;
    failureCount: number;
    toolsUsed: string[];
    totalToolTimeMs: number;
  };
  
  // RAG metrics
  rag?: {
    sourcesFound: number;
    domainsSearched: string[];
    strategy: string;
    cacheHit: boolean;
    retrievalTimeMs?: number;
  };
  
  // Cost tracking
  cost?: {
    llmTokens?: {
      prompt: number;
      completion: number;
      total: number;
    };
    estimatedCostUsd?: number;
  };
  
  // Metadata
  metadata?: {
    model?: string;
    temperature?: number;
    enableRAG?: boolean;
    enableTools?: boolean;
  };
}

export interface Mode1Stats {
  totalRequests: number;
  successRate: number;
  errorRate: number;
  averageLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  
  // By execution path
  byPath: {
    direct: PathStats;
    rag: PathStats;
    tools: PathStats;
    'rag+tools': PathStats;
  };
  
  // By agent
  byAgent: Map<string, AgentStats>;
  
  // Error breakdown
  errors: {
    [errorCode: string]: number;
  };
}

export interface PathStats {
  count: number;
  successRate: number;
  averageLatency: number;
  p95Latency: number;
}

export interface AgentStats {
  agentId: string;
  requestCount: number;
  successRate: number;
  averageLatency: number;
  mostUsedPath: string;
  errorCount: number;
}

export class Mode1MetricsService {
  private metrics: Mode1Metrics[] = [];
  private readonly maxMetricsSize = 10000;
  private readonly windowMinutes = 60; // 1 hour window for stats

  /**
   * Track a Mode 1 request
   */
  trackRequest(metrics: Mode1Metrics): void {
    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    
    this.metrics.push(metrics);

    // Trim metrics if exceeding max size
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics = this.metrics.slice(-this.maxMetricsSize);
    }

    // Log metrics
    this.logMetrics(metrics);
  }

  /**
   * Track circuit breaker state changes
   */
  trackCircuitBreakerStateChange(event: {
    circuitName: string;
    state: string;
    timestamp: number;
    failureCount: number;
  }): void {
    const logData = {
      type: 'circuit_breaker_state_change',
      circuitName: event.circuitName,
      state: event.state,
      timestamp: event.timestamp,
      failureCount: event.failureCount,
    };

    // Use StructuredLogger if available (lazy import to avoid circular deps)
    import('../../../../lib/services/observability/structured-logger').then(({ StructuredLogger, LogLevel }) => {
      const logger = new StructuredLogger({ minLevel: LogLevel.INFO });
      logger.info('Circuit breaker state change', {
        operation: 'circuit_breaker_state_change',
        circuitName: event.circuitName,
        state: event.state,
        failureCount: event.failureCount,
      });
    }).catch(() => {
      // Fallback to shared logger if StructuredLogger not available
      logger.info('Circuit breaker state change', logData);
    });

    // In a production system, this could also:
    // - Send to monitoring service (DataDog, New Relic, etc.)
    // - Trigger alerts for critical state changes (OPEN state)
    // - Store in time-series database for analysis
  }

  /**
   * Get statistics for a time window
   */
  getStats(windowMinutes: number = this.windowMinutes): Mode1Stats {
    const cutoffTime = Date.now() - windowMinutes * 60 * 1000;
    const recentMetrics = this.metrics.filter(
      (m) => m.startTime >= cutoffTime
    );

    if (recentMetrics.length === 0) {
      return this.getEmptyStats();
    }

    const latencies = recentMetrics
      .map((m) => m.duration || 0)
      .sort((a, b) => a - b);

    const successful = recentMetrics.filter((m) => m.success);
    const errors = recentMetrics.filter((m) => !m.success);

    // Calculate percentiles
    const p50 = this.percentile(latencies, 0.5);
    const p95 = this.percentile(latencies, 0.95);
    const p99 = this.percentile(latencies, 0.99);

    // Group by path
    const byPath = {
      direct: this.calculatePathStats(recentMetrics, 'direct'),
      rag: this.calculatePathStats(recentMetrics, 'rag'),
      tools: this.calculatePathStats(recentMetrics, 'tools'),
      'rag+tools': this.calculatePathStats(recentMetrics, 'rag+tools'),
    };

    // Group by agent
    const agentMap = new Map<string, AgentStats>();
    for (const metric of recentMetrics) {
      const existing = agentMap.get(metric.agentId) || {
        agentId: metric.agentId,
        requestCount: 0,
        successCount: 0,
        totalLatency: 0,
        pathCounts: new Map<string, number>(),
        errorCount: 0,
      };

      existing.requestCount++;
      if (metric.success) {
        existing.successCount++;
      } else {
        existing.errorCount++;
      }
      existing.totalLatency += metric.duration || 0;

      const path = metric.executionPath;
      existing.pathCounts.set(path, (existing.pathCounts.get(path) || 0) + 1);

      agentMap.set(metric.agentId, existing);
    }

    const byAgent = new Map<string, AgentStats>();
    for (const [agentId, data] of agentMap.entries()) {
      const mostUsedPath = Array.from(data.pathCounts.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0][0];

      byAgent.set(agentId, {
        agentId,
        requestCount: data.requestCount,
        successRate: data.successCount / data.requestCount,
        averageLatency: data.totalLatency / data.requestCount,
        mostUsedPath,
        errorCount: data.errorCount,
      });
    }

    // Error breakdown
    const errorBreakdown: Record<string, number> = {};
    for (const error of errors) {
      const code = error.errorCode || 'UNKNOWN_ERROR';
      errorBreakdown[code] = (errorBreakdown[code] || 0) + 1;
    }

    return {
      totalRequests: recentMetrics.length,
      successRate: successful.length / recentMetrics.length,
      errorRate: errors.length / recentMetrics.length,
      averageLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      p50Latency: p50,
      p95Latency: p95,
      p99Latency: p99,
      byPath,
      byAgent,
      errors: errorBreakdown,
    };
  }

  /**
   * Calculate statistics for a specific execution path
   */
  private calculatePathStats(
    metrics: Mode1Metrics[],
    path: Mode1Metrics['executionPath']
  ): PathStats {
    const pathMetrics = metrics.filter((m) => m.executionPath === path);
    
    if (pathMetrics.length === 0) {
      return {
        count: 0,
        successRate: 0,
        averageLatency: 0,
        p95Latency: 0,
      };
    }

    const latencies = pathMetrics
      .map((m) => m.duration || 0)
      .sort((a, b) => a - b);
    const successful = pathMetrics.filter((m) => m.success);

    return {
      count: pathMetrics.length,
      successRate: successful.length / pathMetrics.length,
      averageLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      p95Latency: this.percentile(latencies, 0.95),
    };
  }

  /**
   * Calculate percentile
   */
  private percentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil(sortedArray.length * percentile) - 1;
    return sortedArray[Math.max(0, index)];
  }

  /**
   * Get empty stats
   */
  private getEmptyStats(): Mode1Stats {
    const emptyPath = {
      count: 0,
      successRate: 0,
      averageLatency: 0,
      p95Latency: 0,
    };

    return {
      totalRequests: 0,
      successRate: 0,
      errorRate: 0,
      averageLatency: 0,
      p50Latency: 0,
      p95Latency: 0,
      p99Latency: 0,
      byPath: {
        direct: emptyPath,
        rag: emptyPath,
        tools: emptyPath,
        'rag+tools': emptyPath,
      },
      byAgent: new Map(),
      errors: {},
    };
  }

  /**
   * Log metrics to console (structured logging)
   */
  private logMetrics(metrics: Mode1Metrics): void {
    const logData = {
      type: 'mode1_metrics',
      requestId: metrics.requestId,
      agentId: metrics.agentId,
      path: metrics.executionPath,
      duration: metrics.duration,
      success: metrics.success,
      errorCode: metrics.errorCode,
      latency: metrics.latency,
      tools: metrics.tools,
      rag: metrics.rag,
    };

    if (metrics.success) {
      logger.info('Mode 1 metrics', logData);
    } else {
      logger.error('Mode 1 metrics failure', logData);
    }
  }

  /**
   * Get health check status
   */
  getHealthCheck(): {
    healthy: boolean;
    status: string;
    metrics: {
      totalRequests: number;
      errorRate: number;
      averageLatency: number;
      p95Latency: number;
    };
  } {
    const stats = this.getStats(5); // Last 5 minutes

    const healthy =
      stats.errorRate < 0.1 && // Less than 10% error rate
      stats.p95Latency < 10000 && // P95 < 10 seconds
      stats.totalRequests > 0; // Has received requests

    return {
      healthy,
      status: healthy ? 'healthy' : 'degraded',
      metrics: {
        totalRequests: stats.totalRequests,
        errorRate: stats.errorRate,
        averageLatency: stats.averageLatency,
        p95Latency: stats.p95Latency,
      },
    };
  }
}

// Export singleton instance
export const mode1MetricsService = new Mode1MetricsService();
