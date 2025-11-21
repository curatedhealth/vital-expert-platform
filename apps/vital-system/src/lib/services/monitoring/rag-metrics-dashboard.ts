/**
 * RAG Metrics Dashboard Service
 * Unified dashboard for RAG observability
 *
 * Aggregates:
 * - Latency metrics
 * - Cost metrics
 * - Circuit breaker status
 * - Cache performance
 * - Quality metrics
 *
 * Industry Standard: Single pane of glass monitoring
 */

import { ragLatencyTracker, LatencyBreakdown } from './rag-latency-tracker';
import { ragCostTracker, CostStats } from './rag-cost-tracker';
import { circuitBreakerManager } from './circuit-breaker';

export interface RAGMetricsDashboard {
  timestamp: string;
  timeWindow: string;

  // Latency Metrics
  latency: {
    overall: LatencyBreakdown;
    byStrategy: Record<string, LatencyBreakdown>;
    slowQueries: Array<{
      queryId: string;
      totalMs: number;
      strategy: string;
      cacheHit: boolean;
    }>;
    alerts: string[];
  };

  // Cost Metrics
  cost: {
    stats: CostStats;
    byUser: Record<string, number>;
    byAgent: Record<string, number>;
    expensiveQueries: Array<{
      queryId: string;
      totalCost: number;
      operations: number;
    }>;
    budget: {
      hasAlerts: boolean;
      alerts: string[];
      daily: { used: number; limit: number; percent: number };
      monthly: { used: number; limit: number; percent: number };
    };
  };

  // Service Health
  health: {
    circuitBreakers: Record<string, {
      state: string;
      failures: number;
      successes: number;
      lastFailure?: string;
    }>;
    unhealthyServices: string[];
    overallStatus: 'healthy' | 'degraded' | 'critical';
  };

  // Quality Metrics (if available)
  quality?: {
    avgContextPrecision: number;
    avgContextRecall: number;
    avgFaithfulness: number;
    avgAnswerRelevancy: number;
    queriesEvaluated: number;
  };

  // Cache Performance
  cache: {
    hitRate: number;
    avgHitLatencyMs: number;
    avgMissLatencyMs: number;
    totalChecks: number;
    savingsEstimateUsd: number;
  };

  // System Recommendations
  recommendations: string[];
}

export class RAGMetricsDashboardService {
  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboard(timeWindowMinutes: number = 60): Promise<RAGMetricsDashboard> {
    const timestamp = new Date().toISOString();
    const timeWindow = `${timeWindowMinutes} minutes`;

    // Gather all metrics
    const latency = this.getLatencyMetrics(timeWindowMinutes);
    const cost = this.getCostMetrics(timeWindowMinutes);
    const health = this.getHealthMetrics();
    const cache = this.getCacheMetrics(timeWindowMinutes);
    const recommendations = this.generateRecommendations(latency, cost, health, cache);

    return {
      timestamp,
      timeWindow,
      latency,
      cost,
      health,
      cache,
      recommendations,
    };
  }

  /**
   * Get latency metrics
   */
  private getLatencyMetrics(windowMinutes: number) {
    const overall = ragLatencyTracker.getLatencyBreakdown(windowMinutes);
    const byStrategy = ragLatencyTracker.getLatencyByStrategy(windowMinutes);
    const slowQueriesRaw = ragLatencyTracker.getSlowQueries(windowMinutes, 10);
    const alertStatus = ragLatencyTracker.getAlertStatus(windowMinutes);

    const slowQueries = slowQueriesRaw.map((q) => ({
      queryId: q.queryId,
      totalMs: q.totalRetrievalMs,
      strategy: q.strategy,
      cacheHit: q.cacheHit,
    }));

    return {
      overall,
      byStrategy,
      slowQueries,
      alerts: alertStatus.alerts,
    };
  }

  /**
   * Get cost metrics
   */
  private getCostMetrics(windowMinutes: number) {
    const stats = ragCostTracker.getCostStats(windowMinutes);
    const byUser = ragCostTracker.getCostsByUser(windowMinutes);
    const byAgent = ragCostTracker.getCostsByAgent(windowMinutes);
    const expensiveQueries = ragCostTracker.getMostExpensiveQueries(windowMinutes, 10);
    const budget = ragCostTracker.checkBudget();

    return {
      stats,
      byUser,
      byAgent,
      expensiveQueries,
      budget,
    };
  }

  /**
   * Get service health metrics
   */
  private getHealthMetrics() {
    const allStats = circuitBreakerManager.getAllStats();
    const unhealthyServices = circuitBreakerManager.getUnhealthyServices();

    const circuitBreakers: Record<string, any> = {};
    for (const [name, stats] of Object.entries(allStats)) {
      circuitBreakers[name] = {
        state: stats.state,
        failures: stats.failures,
        successes: stats.successes,
        lastFailure: stats.lastFailureTime,
      };
    }

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (unhealthyServices.length > 0) {
      const criticalServices = ['openai', 'pinecone', 'supabase'];
      const hasCriticalFailure = unhealthyServices.some((s) =>
        criticalServices.includes(s)
      );
      overallStatus = hasCriticalFailure ? 'critical' : 'degraded';
    }

    return {
      circuitBreakers,
      unhealthyServices,
      overallStatus,
    };
  }

  /**
   * Get cache performance metrics
   */
  private getCacheMetrics(windowMinutes: number) {
    const latency = ragLatencyTracker.getLatencyBreakdown(windowMinutes);
    const cost = ragCostTracker.getCostStats(windowMinutes);

    const hitRate = latency.cacheStats.hitRate;
    const avgHitLatencyMs = latency.cacheStats.avgHitLatencyMs;
    const avgMissLatencyMs = latency.cacheStats.avgMissLatencyMs;
    const totalChecks = latency.cacheStats.totalChecks;

    // Estimate cost savings from cache hits
    // Assume average query costs $0.01 without cache
    const avgQueryCost = cost.avgCostPerQuery || 0.01;
    const cacheHits = Math.floor(totalChecks * hitRate);
    const savingsEstimateUsd = cacheHits * avgQueryCost * 0.95; // 95% cost reduction

    return {
      hitRate,
      avgHitLatencyMs,
      avgMissLatencyMs,
      totalChecks,
      savingsEstimateUsd,
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    latency: any,
    cost: any,
    health: any,
    cache: any
  ): string[] {
    const recommendations: string[] = [];

    // Latency recommendations
    if (latency.overall.total.p95 > 2000) {
      recommendations.push(
        '⚠️ P95 latency exceeds 2s target. Consider optimizing vector search or enabling caching.'
      );
    }

    if (latency.overall.embedding.mean > 500) {
      recommendations.push(
        '⚠️ High embedding latency. Consider using text-embedding-3-small for faster responses.'
      );
    }

    // Cost recommendations
    if (cost.stats.avgCostPerQuery > 0.05) {
      recommendations.push(
        '💰 Average query cost exceeds $0.05. Review embedding model choice and chunk sizes.'
      );
    }

    if (cost.budget.hasAlerts) {
      recommendations.push(
        '💰 Budget alerts detected. Consider implementing query throttling or cost limits.'
      );
    }

    // Check if re-ranking is major cost driver
    if (cost.stats.breakdown.reranking > cost.stats.totalCostUsd * 0.3) {
      recommendations.push(
        '💰 Re-ranking costs exceed 30% of total. Consider reducing re-ranking frequency or document count.'
      );
    }

    // Health recommendations
    if (health.unhealthyServices.length > 0) {
      recommendations.push(
        `🚨 Unhealthy services detected: ${health.unhealthyServices.join(', ')}. Check service status and API keys.`
      );
    }

    // Cache recommendations
    if (cache.hitRate < 0.3) {
      recommendations.push(
        '📦 Cache hit rate below 30%. Consider increasing cache TTL or semantic similarity threshold.'
      );
    } else if (cache.hitRate > 0.7) {
      recommendations.push(
        '✅ Excellent cache performance! You\'re saving approximately $' + cache.savingsEstimateUsd.toFixed(2) + ' from cache hits.'
      );
    }

    if (cache.avgMissLatencyMs > cache.avgHitLatencyMs * 10) {
      recommendations.push(
        '⚡ Cache misses are 10x slower than hits. Ensure vector store is properly indexed.'
      );
    }

    // Slow query recommendations
    if (latency.slowQueries.length > 0) {
      const slowestQuery = latency.slowQueries[0];
      recommendations.push(
        `🐌 Slowest query took ${slowestQuery.totalMs.toFixed(0)}ms. Review query complexity and chunk sizes.`
      );
    }

    // If no issues, provide positive feedback
    if (recommendations.length === 0) {
      recommendations.push(
        '✅ System is performing optimally! No immediate action required.'
      );
      recommendations.push(
        '📊 Continue monitoring metrics to maintain performance standards.'
      );
    }

    return recommendations;
  }

  /**
   * Get real-time metrics (last 5 minutes)
   */
  async getRealTimeMetrics(): Promise<{
    latencyP95: number;
    costPerQuery: number;
    cacheHitRate: number;
    queryCount: number;
    errorRate: number;
  }> {
    const latency = ragLatencyTracker.getLatencyBreakdown(5);
    const cost = ragCostTracker.getCostStats(5);
    const health = circuitBreakerManager.getAllStats();

    // Calculate error rate from circuit breakers
    let totalRequests = 0;
    let totalErrors = 0;
    for (const stats of Object.values(health)) {
      totalRequests += stats.totalRequests;
      totalErrors += stats.rejectedRequests;
    }
    const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;

    return {
      latencyP95: latency.total.p95,
      costPerQuery: cost.avgCostPerQuery,
      cacheHitRate: latency.cacheStats.hitRate,
      queryCount: cost.queryCount,
      errorRate,
    };
  }

  /**
   * Get SLO compliance status
   */
  async getSLOCompliance(windowMinutes: number = 60): Promise<{
    latencySLO: { target: number; actual: number; compliant: boolean };
    availabilitySLO: { target: number; actual: number; compliant: boolean };
    costSLO: { target: number; actual: number; compliant: boolean };
  }> {
    const latency = ragLatencyTracker.getLatencyBreakdown(windowMinutes);
    const health = circuitBreakerManager.getAllStats();
    const cost = ragCostTracker.getCostStats(windowMinutes);

    // Latency SLO: P95 < 2000ms
    const latencySLO = {
      target: 2000,
      actual: latency.total.p95,
      compliant: latency.total.p95 < 2000,
    };

    // Availability SLO: > 99.9% uptime
    let totalRequests = 0;
    let successfulRequests = 0;
    for (const stats of Object.values(health)) {
      totalRequests += stats.totalRequests;
      successfulRequests += stats.totalRequests - stats.rejectedRequests;
    }
    const availability = totalRequests > 0 ? successfulRequests / totalRequests : 1;

    const availabilitySLO = {
      target: 0.999,
      actual: availability,
      compliant: availability >= 0.999,
    };

    // Cost SLO: < $0.05 per query
    const costSLO = {
      target: 0.05,
      actual: cost.avgCostPerQuery,
      compliant: cost.avgCostPerQuery < 0.05,
    };

    return {
      latencySLO,
      availabilitySLO,
      costSLO,
    };
  }

  /**
   * Export dashboard data for external analysis
   */
  async exportData(windowMinutes: number = 60): Promise<{
    latencyMetrics: any[];
    costEntries: any[];
    circuitBreakerStats: any;
  }> {
    return {
      latencyMetrics: ragLatencyTracker.exportMetrics(windowMinutes),
      costEntries: ragCostTracker.exportEntries(windowMinutes),
      circuitBreakerStats: circuitBreakerManager.getAllStats(),
    };
  }

  /**
   * Get formatted dashboard summary for console output
   */
  async getConsoleSummary(windowMinutes: number = 60): Promise<string> {
    const dashboard = await this.getDashboard(windowMinutes);

    const lines: string[] = [];
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('                  RAG METRICS DASHBOARD');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push(`Time Window: ${dashboard.timeWindow}`);
    lines.push(`Timestamp: ${dashboard.timestamp}`);
    lines.push('');

    // Latency
    lines.push('📊 LATENCY METRICS');
    lines.push(`  P50: ${dashboard.latency.overall.total.p50.toFixed(0)}ms`);
    lines.push(`  P95: ${dashboard.latency.overall.total.p95.toFixed(0)}ms ${dashboard.latency.overall.total.p95 > 2000 ? '⚠️' : '✅'}`);
    lines.push(`  P99: ${dashboard.latency.overall.total.p99.toFixed(0)}ms ${dashboard.latency.overall.total.p99 > 5000 ? '⚠️' : '✅'}`);
    lines.push(`  Queries: ${dashboard.latency.overall.total.count}`);
    lines.push('');

    // Cost
    lines.push('💰 COST METRICS');
    lines.push(`  Total: $${dashboard.cost.stats.totalCostUsd.toFixed(4)}`);
    lines.push(`  Per Query: $${dashboard.cost.stats.avgCostPerQuery.toFixed(4)}`);
    lines.push(`  Queries: ${dashboard.cost.stats.queryCount}`);
    lines.push(`  Daily Budget: ${dashboard.cost.budget.daily.percent.toFixed(1)}% used ${dashboard.cost.budget.daily.percent > 80 ? '⚠️' : '✅'}`);
    lines.push('');

    // Cache
    lines.push('📦 CACHE PERFORMANCE');
    lines.push(`  Hit Rate: ${(dashboard.cache.hitRate * 100).toFixed(1)}% ${dashboard.cache.hitRate > 0.5 ? '✅' : '⚠️'}`);
    lines.push(`  Hit Latency: ${dashboard.cache.avgHitLatencyMs.toFixed(0)}ms`);
    lines.push(`  Miss Latency: ${dashboard.cache.avgMissLatencyMs.toFixed(0)}ms`);
    lines.push(`  Est. Savings: $${dashboard.cache.savingsEstimateUsd.toFixed(2)}`);
    lines.push('');

    // Health
    lines.push('🏥 SERVICE HEALTH');
    lines.push(`  Status: ${dashboard.health.overallStatus.toUpperCase()} ${dashboard.health.overallStatus === 'healthy' ? '✅' : '⚠️'}`);
    if (dashboard.health.unhealthyServices.length > 0) {
      lines.push(`  Unhealthy: ${dashboard.health.unhealthyServices.join(', ')}`);
    }
    lines.push('');

    // Recommendations
    if (dashboard.recommendations.length > 0) {
      lines.push('💡 RECOMMENDATIONS');
      for (const rec of dashboard.recommendations) {
        lines.push(`  ${rec}`);
      }
      lines.push('');
    }

    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('');

    return lines.join('\n');
  }
}

// Singleton instance
export const ragMetricsDashboard = new RAGMetricsDashboardService();
