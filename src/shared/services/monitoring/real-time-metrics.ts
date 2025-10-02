/**
 * Real-time Metrics and Monitoring Service
 * Part of VITAL AI Master Orchestrator System
 */

interface MetricEvent {
  timestamp: string;
  type: 'query' | 'response' | 'agent_selection' | 'error' | 'session_start' | 'session_end';
  sessionId: string;
  userId?: string;
  data: {
    query?: string;
    agent?: string;
    responseTime?: number;
    confidence?: number;
    success?: boolean;
    error?: string;
    mode?: string;
    digitalHealth?: boolean;
    complexity?: string;
    agentCount?: number;
  };
}

interface SystemMetrics {
  timestamp: string;
  activeSessions: number;
  totalQueries: number;
  avgResponseTime: number;
  avgConfidence: number;
  successRate: number;
  digitalHealthUsage: number;
  multiAgentUsage: number;
  errorRate: number;
  agentUtilization: Record<string, number>;
  domainDistribution: Record<string, number>;
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

interface PerformanceAlert {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'response_time' | 'error_rate' | 'confidence' | 'system_load' | 'agent_failure';
  message: string;
  data: Record<string, unknown>;
  resolved: boolean;
}

export class RealTimeMetrics {
  private events: MetricEvent[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private listeners: Map<string, (data: unknown) => void> = new Map();
  private metricsInterval: NodeJS.Timeout | null = null;
  private readonly MAX_EVENTS = 1000;
  private readonly METRICS_INTERVAL = 10000; // 10 seconds

  constructor() {
    this.startMetricsCollection();
  }

  // Event recording
  recordEvent(event: Omit<MetricEvent, 'timestamp'>): void {
    const metricEvent: MetricEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    this.events.push(metricEvent);

    // Maintain event buffer size
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Emit to listeners
    this.emit('event', metricEvent);

    // Check for alerts
    this.checkForAlerts(metricEvent);

    // }

  // Query tracking
  trackQuery(sessionId: string, query: string, userId?: string, digitalHealth = false): void {
    this.recordEvent({
      type: 'query',
      sessionId,
      userId,
      data: {
        query: query.substring(0, 100), // Truncate for storage
        digitalHealth,
        complexity: this.assessQueryComplexity(query)
      }
    });
  }

  trackResponse(
    sessionId: string,
    agent: string,
    responseTime: number,
    confidence: number,
    success: boolean,
    error?: string
  ): void {
    this.recordEvent({
      type: 'response',
      sessionId,
      data: {
        agent,
        responseTime,
        confidence,
        success,
        error
      }
    });
  }

  trackAgentSelection(sessionId: string, agents: string[], mode: string): void {
    this.recordEvent({
      type: 'agent_selection',
      sessionId,
      data: {
        agentCount: agents.length,
        mode,
        agent: agents.join(',')
      }
    });
  }

  trackSessionStart(sessionId: string, userId?: string, mode?: string): void {
    this.recordEvent({
      type: 'session_start',
      sessionId,
      userId,
      data: { mode }
    });
  }

  trackSessionEnd(sessionId: string): void {
    this.recordEvent({
      type: 'session_end',
      sessionId,
      data: { /* TODO: implement */ }
    });
  }

  trackError(sessionId: string, error: string, context?: Record<string, unknown>): void {
    this.recordEvent({
      type: 'error',
      sessionId,
      data: {
        error,
        success: false,
        ...context
      }
    });
  }

  // Metrics calculation
  private calculateCurrentMetrics(): SystemMetrics {

    // Filter recent events (last hour)

      new Date(event.timestamp) > oneHourAgo
    );

    // Response time calculation

      .map(e => e.data.responseTime)
      .filter(Boolean) as number[];

      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Confidence calculation

      .map(e => e.data.confidence)
      .filter(Boolean) as number[];

      ? confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length
      : 0;

    // Success rate

      ? (successfulResponses / responseEvents.length) * 100
      : 100;

    // Digital health usage

      ? (digitalHealthQueries / queryEvents.length) * 100
      : 0;

    // Multi-agent usage

      .filter(e => e.type === 'agent_selection' && (e.data.agentCount || 0) > 1).length;

      ? (multiAgentQueries / queryEvents.length) * 100
      : 0;

    // Error rate

      ? (errorEvents.length / recentEvents.length) * 100
      : 0;

    // Agent utilization
    const agentUtilization: Record<string, number> = { /* TODO: implement */ };
    responseEvents.forEach(event => {
      if (event.data.agent) {
        agentUtilization[event.data.agent] = (agentUtilization[event.data.agent] || 0) + 1;
      }
    });

    // Domain distribution (simplified)
    const domainDistribution: Record<string, number> = {
      'regulatory': responseEvents.filter(e => e.data.agent?.includes('regulatory')).length,
      'clinical': responseEvents.filter(e => e.data.agent?.includes('clinical')).length,
      'digital_health': responseEvents.filter(e => e.data.agent?.includes('digital')).length,
      'compliance': responseEvents.filter(e => e.data.agent?.includes('compliance')).length
    };

    // System health assessment
    let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (errorRate > 20 || avgResponseTime > 5000 || avgConfidence < 60) {
      systemHealth = 'critical';
    } else if (errorRate > 10 || avgResponseTime > 3000 || avgConfidence < 75) {
      systemHealth = 'degraded';
    }

    return {
      timestamp: now.toISOString(),
      activeSessions,
      totalQueries: queryEvents.length,
      avgResponseTime: Math.round(avgResponseTime),
      avgConfidence: Math.round(avgConfidence),
      successRate: Math.round(successRate),
      digitalHealthUsage: Math.round(digitalHealthUsage),
      multiAgentUsage: Math.round(multiAgentUsage),
      errorRate: Math.round(errorRate * 100) / 100,
      agentUtilization,
      domainDistribution,
      systemHealth
    };
  }

  // Alert system
  private checkForAlerts(event: MetricEvent): void {
    const alerts: PerformanceAlert[] = [];

    // Response time alert
    if (event.data.responseTime && event.data.responseTime > 5000) {
      alerts.push({
        id: `rt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: event.data.responseTime > 10000 ? 'critical' : 'high',
        type: 'response_time',
        message: `High response time detected: ${event.data.responseTime}ms for agent ${event.data.agent}`,
        data: { responseTime: event.data.responseTime, agent: event.data.agent },
        resolved: false
      });
    }

    // Low confidence alert
    if (event.data.confidence && event.data.confidence < 50) {
      alerts.push({
        id: `conf-${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: event.data.confidence < 30 ? 'critical' : 'medium',
        type: 'confidence',
        message: `Low confidence response: ${event.data.confidence}% from agent ${event.data.agent}`,
        data: { confidence: event.data.confidence, agent: event.data.agent },
        resolved: false
      });
    }

    // Error alert
    if (event.type === 'error') {
      alerts.push({
        id: `err-${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: 'high',
        type: 'agent_failure',
        message: `Agent error: ${event.data.error}`,
        data: { error: event.data.error, sessionId: event.sessionId },
        resolved: false
      });
    }

    // Add alerts
    this.alerts.push(...alerts);

    // Emit alerts
    alerts.forEach(alert => {
      this.emit('alert', alert);
      // console.warn(`🚨 Performance Alert [${alert.severity}]: ${alert.message}`);
    });
  }

  // Event listeners
  on(event: string, callback: (data: unknown) => void): void {
    this.listeners.set(event, callback);
  }

  off(event: string): void {
    this.listeners.delete(event);
  }

  private emit(event: string, data: unknown): void {

    if (callback) {
      callback(data);
    }
  }

  // Metrics collection
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {

      this.systemMetrics.push(metrics);

      // Keep only last 24 hours of metrics (144 entries at 10-minute intervals)
      if (this.systemMetrics.length > 144) {
        this.systemMetrics = this.systemMetrics.slice(-144);
      }

      this.emit('metrics', metrics);

      // }, this.METRICS_INTERVAL);
  }

  private stopMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  // Utility methods
  private assessQueryComplexity(query: string): string {

      query.toLowerCase().includes(domain)
    ).length;

    if (length > 200 || wordCount > 30 || hasMultipleDomains > 1) {
      return 'high';
    } else if (length > 100 || wordCount > 15) {
      return 'medium';
    }
    return 'low';
  }

  // Public getters
  getCurrentMetrics(): SystemMetrics | null {
    return this.systemMetrics[this.systemMetrics.length - 1] || null;
  }

  getMetricsHistory(hours = 24): SystemMetrics[] {

    return this.systemMetrics.filter(metrics =>
      new Date(metrics.timestamp) > cutoff
    );
  }

  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  getAllAlerts(hours = 24): PerformanceAlert[] {

    return this.alerts.filter(alert =>
      new Date(alert.timestamp) > cutoff
    );
  }

  getRecentEvents(count = 50): MetricEvent[] {
    return this.events.slice(-count);
  }

  resolveAlert(alertId: string): void {

    if (alert) {
      alert.resolved = true;
      // }
  }

  // Health check
  healthCheck(): {
    status: string;
    metrics: SystemMetrics | null;
    alerts: number;
    uptime: string;
  } {

    return {
      status: currentMetrics?.systemHealth || 'unknown',
      metrics: currentMetrics,
      alerts: activeAlerts,
      uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'unknown'
    };
  }

  // Export data
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportMetricsAsCSV();
    }

    return JSON.stringify({
      systemMetrics: this.systemMetrics,
      events: this.events,
      alerts: this.alerts,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  private exportMetricsAsCSV(): string {

      'timestamp', 'activeSessions', 'totalQueries', 'avgResponseTime',
      'avgConfidence', 'successRate', 'errorRate', 'systemHealth'
    ];

      metrics.timestamp,
      metrics.activeSessions,
      metrics.totalQueries,
      metrics.avgResponseTime,
      metrics.avgConfidence,
      metrics.successRate,
      metrics.errorRate,
      metrics.systemHealth
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Cleanup
  destroy(): void {
    this.stopMetricsCollection();
    this.listeners.clear();
    // }
}