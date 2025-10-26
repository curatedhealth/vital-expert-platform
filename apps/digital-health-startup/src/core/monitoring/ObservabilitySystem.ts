/**
 * Comprehensive Monitoring and Observability System
 * Implements distributed tracing, metrics collection, and real-time monitoring
 */

import { EventEmitter } from 'events';

import { createClient } from '@supabase/supabase-js';

// Core Observability Types
export interface MetricPoint {
  timestamp: Date;
  value: number;
  labels: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
}

export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operation: string;
  service: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'ok' | 'error' | 'timeout';
  tags: Record<string, unknown>;
  logs: LogEntry[];
}

export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  service: string;
  traceId?: string;
  spanId?: string;
  metadata?: Record<string, unknown>;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  latency: number;
  details: Record<string, unknown>;
  dependencies: DependencyHealth[];
}

export interface DependencyHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  error?: string;
}

export interface Alert {
  id: string;
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  metadata: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: Record<string, MetricPoint[]>) => boolean;
  severity: Alert['severity'];
  description: string;
  cooldownMs: number;
  lastTriggered?: Date;
}

export interface PerformanceMetrics {
  service: string;
  endpoint?: string;
  timestamp: Date;
  requestCount: number;
  errorCount: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  throughput: number;
  errorRate: number;
}

// Metric Collection System
export class MetricsCollector extends EventEmitter {
  private metrics: Map<string, MetricPoint[]> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  constructor(private supabase: ReturnType<typeof createClient>) {
    super();
    this.startMetricsFlush();
  }

  // Counter Metrics
  incrementCounter(name: string, labels: Record<string, string> = { /* TODO: implement */ }, value = 1): void {

    this.counters.set(key, current + value);

    this.addMetricPoint(name, {
      timestamp: new Date(),
      value: current + value,
      labels,
      type: 'counter'
    });

    this.emit('metricUpdated', { name, type: 'counter', value: current + value, labels });
  }

  // Gauge Metrics
  setGauge(name: string, value: number, labels: Record<string, string> = { /* TODO: implement */ }): void {

    this.gauges.set(key, value);

    this.addMetricPoint(name, {
      timestamp: new Date(),
      value,
      labels,
      type: 'gauge'
    });

    this.emit('metricUpdated', { name, type: 'gauge', value, labels });
  }

  // Histogram Metrics
  recordHistogram(name: string, value: number, labels: Record<string, string> = { /* TODO: implement */ }): void {

    values.push(value);
    this.histograms.set(key, values);

    this.addMetricPoint(name, {
      timestamp: new Date(),
      value,
      labels,
      type: 'histogram'
    });

    this.emit('metricUpdated', { name, type: 'histogram', value, labels });
  }

  // Timing Helper
  startTimer(name: string, labels: Record<string, string> = { /* TODO: implement */ }) {

    return () => {

      this.recordHistogram(name, duration, labels);
      return duration;
    };
  }

  private createMetricKey(name: string, labels: Record<string, string>): string {

      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelString}}`;
  }

  private addMetricPoint(name: string, point: MetricPoint): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    points.push(point);

    // Keep only last 1000 points per metric
    if (points.length > 1000) {
      points.shift();
    }
  }

  private async startMetricsFlush(): Promise<void> {
    setInterval(async () => {
      try {
        await this.flushMetrics();
      } catch (error) {
        // console.error('Failed to flush metrics:', error);
      }
    }, 30000); // Flush every 30 seconds
  }

  private async flushMetrics(): Promise<void> {
    const allMetrics: unknown[] = [];

    for (const [name, points] of this.metrics) {
      for (const point of points) {
        allMetrics.push({
          metric_name: name,
          timestamp: point.timestamp.toISOString(),
          value: point.value,
          type: point.type,
          labels: point.labels,
          created_at: new Date().toISOString()
        });
      }
    }

    if (allMetrics.length > 0) {
      const { error } = await this.supabase
        .from('metrics')
        .insert(allMetrics as unknown);

      if (error) {
        // console.error('Failed to insert metrics:', error);
      } else {
        this.metrics.clear(); // Clear after successful flush
      }
    }
  }

  getMetrics(): Record<string, MetricPoint[]> {
    return Object.fromEntries(this.metrics);
  }
}

// Distributed Tracing System
export class TracingSystem extends EventEmitter {
  private activeSpans: Map<string, TraceSpan> = new Map();
  private traces: Map<string, TraceSpan[]> = new Map();

  constructor(private supabase: ReturnType<typeof createClient>) {
    super();
  }

  // Start a new trace
  startTrace(operation: string, service: string, parentSpanId?: string): string {

      this.getTraceIdFromSpan(parentSpanId) :
      this.generateId();

    const span: TraceSpan = {
      traceId,
      spanId,
      parentSpanId,
      operation,
      service,
      startTime: new Date(),
      status: 'ok',
      tags: { /* TODO: implement */ },
      logs: []
    };

    this.activeSpans.set(spanId, span);

    if (!this.traces.has(traceId)) {
      this.traces.set(traceId, []);
    }
    this.traces.get(traceId)?.push(span);

    this.emit('spanStarted', span);
    return spanId;
  }

  // Finish a span
  finishSpan(spanId: string, status: 'ok' | 'error' | 'timeout' = 'ok', error?: string): void {

    if (!span) return;

    span.endTime = new Date();
    span.duration = span.endTime.getTime() - span.startTime.getTime();
    span.status = status;

    if (error) {
      span.tags.error = error;
      this.addLog(spanId, 'error', error);
    }

    this.activeSpans.delete(spanId);
    this.emit('spanFinished', span);

    // Store in database
    this.storeSpan(span);
  }

  // Add tags to a span
  addTags(spanId: string, tags: Record<string, unknown>): void {

    if (span) {
      span.tags = { ...span.tags, ...tags };
    }
  }

  // Add log entry to a span
  addLog(spanId: string, level: LogEntry['level'], message: string, metadata?: Record<string, unknown>): void {

    if (span) {
      span.logs.push({
        timestamp: new Date(),
        level,
        message,
        service: span.service,
        traceId: span.traceId,
        spanId,
        metadata
      });
    }
  }

  // Helper for automatic span management
  async trace<T>(
    operation: string,
    service: string,
    fn: (spanId: string) => Promise<T>,
    parentSpanId?: string
  ): Promise<T> {

    try {

      this.finishSpan(spanId, 'ok');
      return result;
    } catch (error) {
      this.finishSpan(spanId, 'error', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async storeSpan(span: TraceSpan): Promise<void> {
    try {
      const { error } = await this.supabase.from('traces').insert({
        trace_id: span.traceId,
        span_id: span.spanId,
        parent_span_id: span.parentSpanId,
        operation: span.operation,
        service: span.service,
        start_time: span.startTime.toISOString(),
        end_time: span.endTime?.toISOString(),
        duration_ms: span.duration,
        status: span.status,
        tags: span.tags,
        logs: span.logs,
        created_at: new Date().toISOString()
      } as unknown);

      if (error) {
        // console.error('Failed to store span:', error);
      }
    } catch (error) {
      // console.error('Error storing span:', error);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getTraceIdFromSpan(spanId: string): string {

    return span?.traceId || this.generateId();
  }

  getTrace(traceId: string): TraceSpan[] | undefined {
    return this.traces.get(traceId);
  }

  getActiveSpans(): TraceSpan[] {
    return Array.from(this.activeSpans.values());
  }
}

// Health Check System
export class HealthCheckSystem extends EventEmitter {
  private healthChecks: Map<string, HealthCheck> = new Map();
  private checkIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private supabase: ReturnType<typeof createClient>,
    private metricsCollector: MetricsCollector
  ) {
    super();
  }

  // Register a health check
  registerHealthCheck(
    service: string,
    checker: () => Promise<Omit<HealthCheck, 'service' | 'timestamp'>>,
    intervalMs = 30000
  ): void {
    // Clear existing interval if any

    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Set up new health check interval

      await this.performHealthCheck(service, checker);
    }, intervalMs);

    this.checkIntervals.set(service, interval);

    // Perform initial check
    this.performHealthCheck(service, checker);
  }

  private async performHealthCheck(
    service: string,
    checker: () => Promise<Omit<HealthCheck, 'service' | 'timestamp'>>
  ): Promise<void> {

    try {

      const healthCheck: HealthCheck = {
        service,
        timestamp: new Date(),
        ...result,
        latency
      };

      this.healthChecks.set(service, healthCheck);

      // Record metrics
      this.metricsCollector.setGauge('health_check_status',
        healthCheck.status === 'healthy' ? 1 : 0,
        { service }
      );
      this.metricsCollector.recordHistogram('health_check_latency', latency, { service });

      this.emit('healthCheckCompleted', healthCheck);

      // Store in database
      await this.storeHealthCheck(healthCheck);

    } catch (error) {
      const healthCheck: HealthCheck = {
        service,
        status: 'unhealthy',
        timestamp: new Date(),
        latency: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        dependencies: []
      };

      this.healthChecks.set(service, healthCheck);
      this.metricsCollector.setGauge('health_check_status', 0, { service });
      this.emit('healthCheckFailed', healthCheck);

      await this.storeHealthCheck(healthCheck);
    }
  }

  private async storeHealthCheck(healthCheck: HealthCheck): Promise<void> {
    try {
      const { error } = await this.supabase.from('health_checks').insert({
        service: healthCheck.service,
        status: healthCheck.status,
        latency_ms: healthCheck.latency,
        details: healthCheck.details,
        dependencies: healthCheck.dependencies,
        timestamp: healthCheck.timestamp.toISOString(),
        created_at: new Date().toISOString()
      } as unknown);

      if (error) {
        // console.error('Failed to store health check:', error);
      }
    } catch (error) {
      // console.error('Error storing health check:', error);
    }
  }

  getHealthStatus(service?: string): HealthCheck | HealthCheck[] | undefined {
    if (service) {
      return this.healthChecks.get(service);
    }
    return Array.from(this.healthChecks.values());
  }

  getOverallHealth(): { status: 'healthy' | 'degraded' | 'unhealthy', services: HealthCheck[] } {

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (unhealthyCount > 0) {
      status = 'unhealthy';
    } else if (degradedCount > 0) {
      status = 'degraded';
    }

    return { status, services };
  }
}

// Alert System
export class AlertingSystem extends EventEmitter {
  private alerts: Map<string, Alert> = new Map();
  private rules: Map<string, AlertRule> = new Map();

  constructor(
    private supabase: ReturnType<typeof createClient>,
    private metricsCollector: MetricsCollector
  ) {
    super();
    this.setupDefaultRules();
  }

  private setupDefaultRules(): void {
    // High error rate alert
    this.addRule({
      id: 'high-error-rate',
      name: 'High Error Rate',
      condition: (metrics) => {

        return errorRate > 0.05; // 5% error rate
      },
      severity: 'high',
      description: 'Error rate exceeded 5%',
      cooldownMs: 300000 // 5 minutes
    });

    // High latency alert
    this.addRule({
      id: 'high-latency',
      name: 'High Latency',
      condition: (metrics) => {

        return avgLatency > 5000; // 5 seconds
      },
      severity: 'medium',
      description: 'Average latency exceeded 5 seconds',
      cooldownMs: 180000 // 3 minutes
    });

    // Health check failure alert
    this.addRule({
      id: 'service-unhealthy',
      name: 'Service Unhealthy',
      condition: (metrics) => {
        return this.hasUnhealthyServices(metrics);
      },
      severity: 'critical',
      description: 'One or more services are unhealthy',
      cooldownMs: 60000 // 1 minute
    });
  }

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  private calculateErrorRate(metrics: Record<string, MetricPoint[]>): number {

    if (requests.length === 0) return 0;

    return totalRequests > 0 ? totalErrors / totalRequests : 0;
  }

  private calculateAverageLatency(metrics: Record<string, MetricPoint[]>): number {

    if (latencies.length === 0) return 0;

    return sum / latencies.length;
  }

  private hasUnhealthyServices(metrics: Record<string, MetricPoint[]>): boolean {

    return healthMetrics.some(point => point.value === 0);
  }

  async evaluateRules(): Promise<void> {

    for (const rule of this.rules.values()) {
      // Check cooldown
      if (rule.lastTriggered) {

        if (timeSinceLastTrigger < rule.cooldownMs) {
          continue;
        }
      }

      // Evaluate condition
      if (rule.condition(metrics)) {
        await this.triggerAlert(rule);
      }
    }
  }

  private async triggerAlert(rule: AlertRule): Promise<void> {
    const alert: Alert = {
      id: this.generateAlertId(),
      rule: rule.id,
      severity: rule.severity,
      title: rule.name,
      description: rule.description,
      timestamp: new Date(),
      resolved: false,
      metadata: { /* TODO: implement */ }
    };

    this.alerts.set(alert.id, alert);
    rule.lastTriggered = new Date();

    this.emit('alertTriggered', alert);

    // Store in database
    await this.storeAlert(alert);

    // Record metric
    this.metricsCollector.incrementCounter('alerts_triggered', {
      rule: rule.id,
      severity: rule.severity
    });
  }

  private async storeAlert(alert: Alert): Promise<void> {
    try {
      const { error } = await this.supabase.from('alerts').insert({
        alert_id: alert.id,
        rule_id: alert.rule,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        resolved: alert.resolved,
        metadata: alert.metadata,
        timestamp: alert.timestamp.toISOString(),
        created_at: new Date().toISOString()
      } as unknown);

      if (error) {
        // console.error('Failed to store alert:', error);
      }
    } catch (error) {
      // console.error('Error storing alert:', error);
    }
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  getAlerts(resolved?: boolean): Alert[] {

    if (resolved !== undefined) {
      return alerts.filter(alert => alert.resolved === resolved);
    }
    return alerts;
  }

  async resolveAlert(alertId: string): Promise<void> {

    if (alert) {
      alert.resolved = true;
      this.emit('alertResolved', alert);

      // Update in database - temporarily disabled due to type issues
      // TODO: Fix Supabase alert table type definitions
      // }
  }
}

// Main Observability System
export class ObservabilitySystem extends EventEmitter {
  public readonly metrics: MetricsCollector;
  public readonly tracing: TracingSystem;
  public readonly healthCheck: HealthCheckSystem;
  public readonly alerting: AlertingSystem;

  constructor(private supabase: ReturnType<typeof createClient>) {
    super();

    this.metrics = new MetricsCollector(supabase);
    this.tracing = new TracingSystem(supabase);
    this.healthCheck = new HealthCheckSystem(supabase, this.metrics);
    this.alerting = new AlertingSystem(supabase, this.metrics);

    this.setupDefaultHealthChecks();
    this.startAlertEvaluation();
  }

  private setupDefaultHealthChecks(): void {
    // Database health check
    this.healthCheck.registerHealthCheck('database', async () => {

      try {
        const { error } = await this.supabase.from('health_checks').select('count').limit(1);

        return {
          status: error ? 'unhealthy' : 'healthy',
          details: error ? { error: error.message } : { /* TODO: implement */ },
          latency,
          dependencies: []
        };
      } catch (error) {

        return {
          status: 'unhealthy',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          latency,
          dependencies: []
        };
      }
    });

    // Memory health check
    this.healthCheck.registerHealthCheck('memory', async () => {

      return {
        status: heapUsagePercent > 80 ? 'degraded' : 'healthy',
        details: {
          heapUsedMB: Math.round(heapUsedMB),
          heapTotalMB: Math.round(heapTotalMB),
          heapUsagePercent: Math.round(heapUsagePercent)
        },
        latency,
        dependencies: []
      };
    });
  }

  private startAlertEvaluation(): void {
    // Evaluate alert rules every 30 seconds
    setInterval(async () => {
      try {
        await this.alerting.evaluateRules();
      } catch (error) {
        // console.error('Failed to evaluate alert rules:', error);
      }
    }, 30000);
  }

  // Performance tracking middleware
  createPerformanceMiddleware() {
    return (operation: string) => {
      return async <T>(fn: () => Promise<T>): Promise<T> => {

        try {
          this.metrics.incrementCounter('operations_total', { operation });

          this.tracing.finishSpan(spanId, 'ok');
          timer();
          return result;
        } catch (error) {
          this.metrics.incrementCounter('operations_errors', { operation });
          this.tracing.finishSpan(spanId, 'error', error instanceof Error ? error.message : 'Unknown error');
          timer();
          throw error;
        }
      };
    };
  }

  // Get comprehensive system status
  getSystemStatus() {

    return {
      health: health.status,
      services: health.services,
      activeAlerts: activeAlerts.length,
      criticalAlerts: activeAlerts.filter((a: any) => a.severity === 'critical').length,
      activeTraces: activeSpans.length,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const __observabilitySystem = new ObservabilitySystem(
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
);