/**
 * RAG Latency Tracker
 * Tracks and analyzes latency breakdown for RAG operations
 *
 * Key Metrics:
 * - Query embedding time
 * - Vector search time
 * - Reranking time
 * - Total retrieval time
 * - Cache hit/miss rates
 *
 * Industry Standard: P95 < 2s, P99 < 5s for retrieval
 */

export interface LatencyMetrics {
  queryEmbeddingMs: number;
  vectorSearchMs: number;
  rerankingMs: number;
  cacheCheckMs: number;
  totalRetrievalMs: number;
  cacheHit: boolean;
  timestamp: string;
  queryId: string;
  strategy: string;
}

export interface LatencyStats {
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  count: number;
  cacheHitRate: number;
}

export interface LatencyBreakdown {
  embedding: LatencyStats;
  vectorSearch: LatencyStats;
  reranking: LatencyStats;
  total: LatencyStats;
  cacheStats: {
    hitRate: number;
    avgHitLatencyMs: number;
    avgMissLatencyMs: number;
    totalChecks: number;
  };
}

export class RAGLatencyTracker {
  private metrics: LatencyMetrics[] = [];
  private readonly maxMetricsSize: number;
  private readonly alertThresholds: {
    p95MaxMs: number;
    p99MaxMs: number;
    cacheHitRateMin: number;
  };

  constructor(
    maxMetricsSize: number = 10000,
    alertThresholds?: Partial<typeof RAGLatencyTracker.prototype.alertThresholds>
  ) {
    this.maxMetricsSize = maxMetricsSize;
    this.alertThresholds = {
      p95MaxMs: alertThresholds?.p95MaxMs || 2000, // 2 seconds
      p99MaxMs: alertThresholds?.p99MaxMs || 5000, // 5 seconds
      cacheHitRateMin: alertThresholds?.cacheHitRateMin || 0.5, // 50%
    };
  }

  /**
   * Track a RAG operation's latency metrics
   */
  trackOperation(metrics: LatencyMetrics): void {
    this.metrics.push(metrics);

    // Trim metrics if exceeding max size
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics = this.metrics.slice(-this.maxMetricsSize);
    }

    // Check for alerts
    this.checkAlerts(metrics);
  }

  /**
   * Get latency breakdown for a time window
   */
  getLatencyBreakdown(
    windowMinutes: number = 60
  ): LatencyBreakdown {
    const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(
      (m) => new Date(m.timestamp) >= cutoffTime
    );

    if (recentMetrics.length === 0) {
      return this.getEmptyBreakdown();
    }

    const embedding = this.calculateStats(
      recentMetrics.map((m) => m.queryEmbeddingMs)
    );
    const vectorSearch = this.calculateStats(
      recentMetrics.map((m) => m.vectorSearchMs)
    );
    const reranking = this.calculateStats(
      recentMetrics.map((m) => m.rerankingMs)
    );
    const total = this.calculateStats(
      recentMetrics.map((m) => m.totalRetrievalMs)
    );

    const cacheHits = recentMetrics.filter((m) => m.cacheHit);
    const cacheMisses = recentMetrics.filter((m) => !m.cacheHit);

    const cacheStats = {
      hitRate: recentMetrics.length > 0 ? cacheHits.length / recentMetrics.length : 0,
      avgHitLatencyMs:
        cacheHits.length > 0
          ? cacheHits.reduce((sum, m) => sum + m.totalRetrievalMs, 0) / cacheHits.length
          : 0,
      avgMissLatencyMs:
        cacheMisses.length > 0
          ? cacheMisses.reduce((sum, m) => sum + m.totalRetrievalMs, 0) / cacheMisses.length
          : 0,
      totalChecks: recentMetrics.length,
    };

    // Calculate cache hit rate for stats
    const cacheHitRate = cacheHits.length / recentMetrics.length;
    embedding.cacheHitRate = cacheHitRate;
    vectorSearch.cacheHitRate = cacheHitRate;
    reranking.cacheHitRate = cacheHitRate;
    total.cacheHitRate = cacheHitRate;

    return {
      embedding,
      vectorSearch,
      reranking,
      total,
      cacheStats,
    };
  }

  /**
   * Get latency breakdown by strategy
   */
  getLatencyByStrategy(
    windowMinutes: number = 60
  ): Record<string, LatencyBreakdown> {
    const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(
      (m) => new Date(m.timestamp) >= cutoffTime
    );

    const strategies = [...new Set(recentMetrics.map((m) => m.strategy))];
    const breakdowns: Record<string, LatencyBreakdown> = {};

    for (const strategy of strategies) {
      const strategyMetrics = recentMetrics.filter((m) => m.strategy === strategy);

      if (strategyMetrics.length === 0) {
        continue;
      }

      const embedding = this.calculateStats(
        strategyMetrics.map((m) => m.queryEmbeddingMs)
      );
      const vectorSearch = this.calculateStats(
        strategyMetrics.map((m) => m.vectorSearchMs)
      );
      const reranking = this.calculateStats(
        strategyMetrics.map((m) => m.rerankingMs)
      );
      const total = this.calculateStats(
        strategyMetrics.map((m) => m.totalRetrievalMs)
      );

      const cacheHits = strategyMetrics.filter((m) => m.cacheHit);
      const cacheMisses = strategyMetrics.filter((m) => !m.cacheHit);

      const cacheStats = {
        hitRate: cacheHits.length / strategyMetrics.length,
        avgHitLatencyMs:
          cacheHits.length > 0
            ? cacheHits.reduce((sum, m) => sum + m.totalRetrievalMs, 0) / cacheHits.length
            : 0,
        avgMissLatencyMs:
          cacheMisses.length > 0
            ? cacheMisses.reduce((sum, m) => sum + m.totalRetrievalMs, 0) / cacheMisses.length
            : 0,
        totalChecks: strategyMetrics.length,
      };

      const cacheHitRate = cacheHits.length / strategyMetrics.length;
      embedding.cacheHitRate = cacheHitRate;
      vectorSearch.cacheHitRate = cacheHitRate;
      reranking.cacheHitRate = cacheHitRate;
      total.cacheHitRate = cacheHitRate;

      breakdowns[strategy] = {
        embedding,
        vectorSearch,
        reranking,
        total,
        cacheStats,
      };
    }

    return breakdowns;
  }

  /**
   * Get alert status based on thresholds
   */
  getAlertStatus(windowMinutes: number = 60): {
    hasAlerts: boolean;
    alerts: string[];
  } {
    const breakdown = this.getLatencyBreakdown(windowMinutes);
    const alerts: string[] = [];

    if (breakdown.total.p95 > this.alertThresholds.p95MaxMs) {
      alerts.push(
        `P95 latency (${breakdown.total.p95.toFixed(0)}ms) exceeds threshold (${this.alertThresholds.p95MaxMs}ms)`
      );
    }

    if (breakdown.total.p99 > this.alertThresholds.p99MaxMs) {
      alerts.push(
        `P99 latency (${breakdown.total.p99.toFixed(0)}ms) exceeds threshold (${this.alertThresholds.p99MaxMs}ms)`
      );
    }

    if (breakdown.cacheStats.hitRate < this.alertThresholds.cacheHitRateMin) {
      alerts.push(
        `Cache hit rate (${(breakdown.cacheStats.hitRate * 100).toFixed(1)}%) below threshold (${(this.alertThresholds.cacheHitRateMin * 100).toFixed(1)}%)`
      );
    }

    return {
      hasAlerts: alerts.length > 0,
      alerts,
    };
  }

  /**
   * Get recent slow queries (> P95)
   */
  getSlowQueries(
    windowMinutes: number = 60,
    limit: number = 10
  ): LatencyMetrics[] {
    const breakdown = this.getLatencyBreakdown(windowMinutes);
    const p95Threshold = breakdown.total.p95;

    const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(
      (m) => new Date(m.timestamp) >= cutoffTime
    );

    return recentMetrics
      .filter((m) => m.totalRetrievalMs > p95Threshold)
      .sort((a, b) => b.totalRetrievalMs - a.totalRetrievalMs)
      .slice(0, limit);
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(windowMinutes?: number): LatencyMetrics[] {
    if (!windowMinutes) {
      return [...this.metrics];
    }

    const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000);
    return this.metrics.filter((m) => new Date(m.timestamp) >= cutoffTime);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Calculate percentile statistics
   */
  private calculateStats(values: number[]): LatencyStats {
    if (values.length === 0) {
      return { p50: 0, p95: 0, p99: 0, mean: 0, count: 0, cacheHitRate: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;

    const p50Index = Math.floor(count * 0.5);
    const p95Index = Math.floor(count * 0.95);
    const p99Index = Math.floor(count * 0.99);

    const mean = sorted.reduce((sum, val) => sum + val, 0) / count;

    return {
      p50: sorted[p50Index] || 0,
      p95: sorted[p95Index] || 0,
      p99: sorted[p99Index] || 0,
      mean,
      count,
      cacheHitRate: 0, // Will be set by caller
    };
  }

  /**
   * Check and log alerts for a single operation
   */
  private checkAlerts(metrics: LatencyMetrics): void {
    const alerts: string[] = [];

    if (metrics.totalRetrievalMs > this.alertThresholds.p95MaxMs) {
      alerts.push(
        `Slow query detected: ${metrics.totalRetrievalMs.toFixed(0)}ms (queryId: ${metrics.queryId})`
      );
    }

    if (alerts.length > 0) {
      console.warn('🚨 RAG Latency Alert:', alerts.join(', '));
    }
  }

  /**
   * Get empty breakdown for when no metrics exist
   */
  private getEmptyBreakdown(): LatencyBreakdown {
    const emptyStats: LatencyStats = {
      p50: 0,
      p95: 0,
      p99: 0,
      mean: 0,
      count: 0,
      cacheHitRate: 0,
    };

    return {
      embedding: emptyStats,
      vectorSearch: emptyStats,
      reranking: emptyStats,
      total: emptyStats,
      cacheStats: {
        hitRate: 0,
        avgHitLatencyMs: 0,
        avgMissLatencyMs: 0,
        totalChecks: 0,
      },
    };
  }
}

// Singleton instance
export const ragLatencyTracker = new RAGLatencyTracker();
