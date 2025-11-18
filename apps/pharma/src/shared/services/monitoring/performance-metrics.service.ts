/**
 * Performance Metrics Collection Service
 * Comprehensive monitoring for VITAL AI platform performance
 */

interface MetricEvent {
  timestamp: number;
  sessionId: string;
  userId?: string;
  eventType: 'orchestrator' | 'agent' | 'rag' | 'api' | 'ui';
  operation: string;
  duration: number;
  success: boolean;
  metadata?: any;
  error?: string;
}

interface PerformanceSnapshot {
  timestamp: number;
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  topAgents: Array<{ agentId: string; requests: number; avgTime: number }>;
  ragPerformance: {
    queries: number;
    avgTime: number;
    successRate: number;
  };
  orchestratorPerformance: {
    decisions: number;
    avgDecisionTime: number;
    collaborationRate: number;
  };
}

interface AlertThreshold {
  metric: string;
  threshold: number;
  condition: 'greater_than' | 'less_than';
  enabled: boolean;
}

class PerformanceMetricsService {
  private metrics: MetricEvent[] = [];
  private activeOperations = new Map<string, { startTime: number; metadata: unknown }>();
  private alertThresholds: AlertThreshold[] = [
    { metric: 'response_time', threshold: 5000, condition: 'greater_than', enabled: true },
    { metric: 'error_rate', threshold: 0.05, condition: 'greater_than', enabled: true },
    { metric: 'rag_success_rate', threshold: 0.95, condition: 'less_than', enabled: true }
  ];
  private subscribers: Array<(alert: unknown) => void> = [];

  // Metric collection methods
  startOperation(operationId: string, type: MetricEvent['eventType'], operation: string, metadata?: unknown): void {
    this.activeOperations.set(operationId, {
      startTime: Date.now(),
      metadata: { type, operation, ...metadata }
    });
  }

  endOperation(
    operationId: string,
    sessionId: string,
    success: boolean = true,
    error?: string,
    userId?: string
  ): void {

    if (!activeOp) {
      // console.warn(`No active operation found for ID: ${operationId}`);
      return;
    }

    const metric: MetricEvent = {
      timestamp: Date.now(),
      sessionId,
      userId,
      eventType: activeOp.metadata.type,
      operation: activeOp.metadata.operation,
      duration,
      success,
      metadata: activeOp.metadata,
      error
    };

    this.metrics.push(metric);
    this.activeOperations.delete(operationId);

    // Check for alerts
    this.checkAlerts();

    // Cleanup old metrics (keep last 1000)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  // Orchestrator-specific metrics
  trackOrchestratorDecision(
    sessionId: string,
    agentSelectionTime: number,
    selectedAgents: string[],
    collaborationType: string
  ): void {

    this.startOperation(operationId, 'orchestrator', 'agent_selection', {
      selectedAgents,
      collaborationType,
      agentCount: selectedAgents.length
    });

    setTimeout(() => {
      this.endOperation(operationId, sessionId, true);
    }, agentSelectionTime);
  }

  trackAgentExecution(
    sessionId: string,
    agentId: string,
    operation: string,
    startTime: number,
    endTime: number,
    success: boolean,
    error?: string
  ): void {
    const metric: MetricEvent = {
      timestamp: endTime,
      sessionId,
      eventType: 'agent',
      operation,
      duration: endTime - startTime,
      success,
      metadata: { agentId },
      error
    };

    this.metrics.push(metric);
    this.checkAlerts();
  }

  trackRAGQuery(
    sessionId: string,
    ragSystem: string,
    queryType: string,
    duration: number,
    documentsFound: number,
    success: boolean,
    error?: string
  ): void {
    const metric: MetricEvent = {
      timestamp: Date.now(),
      sessionId,
      eventType: 'rag',
      operation: queryType,
      duration,
      success,
      metadata: {
        ragSystem,
        documentsFound,
        queryType
      },
      error
    };

    this.metrics.push(metric);
    this.checkAlerts();
  }

  // Analytics methods
  getPerformanceSnapshot(timeWindow: number = 3600000): PerformanceSnapshot {
    const cutoff = Date.now() - timeWindow;
    const recentMetrics = this.metrics.filter((m: any) => m.timestamp >= cutoff);

    // Agent performance analysis
    const agentMetrics = recentMetrics.filter((m: any) => m.type === 'agent_execution');
    const agentStats = new Map<string, { count: number; totalTime: number }>();

    agentMetrics.forEach((m: any) => {
      const agentId = m.metadata?.agentId || 'unknown';
      const current = agentStats.get(agentId) || { count: 0, totalTime: 0 };
      agentStats.set(agentId, {
        count: current.count + 1,
        totalTime: current.totalTime + m.duration
      });
    });

    const topAgents = Array.from(agentStats.entries())
      .map(([agentId, stats]) => ({
        agentId,
        requests: stats.count,
        avgTime: stats.totalTime / stats.count
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5);

    // RAG performance analysis
    const ragMetrics = recentMetrics.filter((m: any) => m.type === 'rag_query');
    const ragQueries = ragMetrics.length;
    const ragAvgTime = ragMetrics.reduce((sum, m) => sum + m.duration, 0) / ragQueries || 0;
    const ragSuccessRate = ragMetrics.filter((m: any) => !m.error).length / ragQueries || 0;

    // Orchestrator performance analysis
    const orchestratorMetrics = recentMetrics.filter((m: any) => m.type === 'orchestration');
    const orchestratorDecisions = orchestratorMetrics.length;
    const multiAgentRate = orchestratorMetrics.filter((m: any) =>
      m.metadata?.agentCount > 1
    ).length / orchestratorDecisions || 0;

    const totalRequests = recentMetrics.length;
    const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests || 0;
    const errorRate = recentMetrics.filter((m: any) => m.error).length / totalRequests || 0;

    return {
      timestamp: Date.now(),
      totalRequests,
      averageResponseTime,
      errorRate,
      topAgents,
      ragPerformance: {
        queries: ragQueries,
        avgTime: ragAvgTime,
        successRate: ragSuccessRate
      },
      orchestratorPerformance: {
        decisions: orchestratorDecisions,
        avgDecisionTime,
        collaborationRate
      }
    };
  }

  getMetricsByType(eventType: MetricEvent['eventType'], timeWindow: number = 3600000): MetricEvent[] {

    return this.metrics.filter((m: any) => m.eventType === eventType && m.timestamp >= cutoff);
  }

  getErrorMetrics(timeWindow: number = 3600000): Array<{ operation: string; count: number; lastError: string }> {

    errorMetrics.forEach((m: any) => {

      errorsByOperation.set(key, {
        count: current.count + 1,
        lastError: m.error || 'Unknown error'
      });
    });

    return Array.from(errorsByOperation.entries()).map(([operation, data]) => ({
      operation,
      ...data
    }));
  }

  // Alert system
  private checkAlerts(): void {

    this.alertThresholds.forEach(threshold => {
      if (!threshold.enabled) return;

      let value: number;
      let alertData: unknown = { /* TODO: implement */ };

      switch (threshold.metric) {
        case 'response_time':
          value = snapshot.averageResponseTime;
          alertData = { responseTime: value, threshold: threshold.threshold };
          break;
        case 'error_rate':
          value = snapshot.errorRate;
          alertData = { errorRate: value, threshold: threshold.threshold };
          break;
        case 'rag_success_rate':
          value = snapshot.ragPerformance.successRate;
          alertData = { successRate: value, threshold: threshold.threshold };
          break;
        default:
          return;
      }

      const shouldAlert = threshold.direction === 'above'
        ? value > threshold.threshold
        : value < threshold.threshold;

      if (shouldAlert) {
        this.notifySubscribers({
          metric: threshold.metric,
          value,
          threshold: threshold.threshold,
          condition: threshold.condition,
          timestamp: Date.now(),
          severity: this.calculateSeverity(threshold.metric, value, threshold.threshold),
          data: alertData
        });
      }
    });
  }

  private calculateSeverity(metric: string, value: number, threshold: number): 'low' | 'medium' | 'high' {

    if (deviation > 0.5) return 'high';
    if (deviation > 0.2) return 'medium';
    return 'low';
  }

  subscribeToAlerts(callback: (alert: unknown) => void): () => void {
    this.subscribers.push(callback);
    return () => {

      if (index > -1) this.subscribers.splice(index, 1);
    };
  }

  private notifySubscribers(alert: unknown): void {
    this.subscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        // console.error('Error in alert subscriber:', error);
      }
    });
  }

  // Configuration methods
  updateAlertThreshold(metric: string, threshold: number, condition: 'greater_than' | 'less_than'): void {

    if (existing) {
      existing.threshold = threshold;
      existing.condition = condition;
    } else {
      this.alertThresholds.push({ metric, threshold, condition, enabled: true });
    }
  }

  enableAlert(metric: string): void {

    if (threshold) threshold.enabled = true;
  }

  disableAlert(metric: string): void {

    if (threshold) threshold.enabled = false;
  }

  // Utility methods
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'sessionId', 'eventType', 'operation', 'duration', 'success', 'error'];
      const rows = this.metrics.map((m: any) => [
        m.timestamp,
        m.sessionId,
        m.eventType,
        m.operation,
        m.duration?.toString() || '',
        m.success?.toString() || '',
        m.error || ''
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(this.metrics, null, 2);
  }

  clearMetrics(): void {
    this.metrics = [];
    this.activeOperations.clear();
  }

  getHealthStatus(): { status: 'healthy' | 'degraded' | 'critical'; issues: string[] } {

    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

    if (snapshot.errorRate > 0.1) {
      issues.push(`High error rate: ${(snapshot.errorRate * 100).toFixed(1)}%`);
      status = 'critical';
    } else if (snapshot.errorRate > 0.05) {
      issues.push(`Elevated error rate: ${(snapshot.errorRate * 100).toFixed(1)}%`);
      status = status === 'healthy' ? 'degraded' : status;
    }

    if (snapshot.averageResponseTime > 10000) {
      issues.push(`Very slow response times: ${(snapshot.averageResponseTime / 1000).toFixed(1)}s`);
      status = 'critical';
    } else if (snapshot.averageResponseTime > 5000) {
      issues.push(`Slow response times: ${(snapshot.averageResponseTime / 1000).toFixed(1)}s`);
      status = status === 'healthy' ? 'degraded' : status;
    }

    if (snapshot.ragPerformance.successRate < 0.9) {
      issues.push(`RAG system degraded: ${(snapshot.ragPerformance.successRate * 100).toFixed(1)}% success rate`);
      status = status === 'healthy' ? 'degraded' : status;
    }

    return { status, issues };
  }
}

export const __performanceMetricsService = new PerformanceMetricsService();

// Export the service instance with the expected name
export const performanceMetricsService = __performanceMetricsService;

export type { MetricEvent, PerformanceSnapshot, AlertThreshold };