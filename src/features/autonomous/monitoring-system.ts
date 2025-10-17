import { EventEmitter } from 'events';
import { Goal, Task, CompletedTask, Evidence } from './autonomous-state';

export interface MonitoringAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  source: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface PerformanceMetrics {
  executionId: string;
  goalId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  totalCost: number;
  tasksCompleted: number;
  tasksFailed: number;
  evidenceCollected: number;
  memoryUsage: number;
  errorRate: number;
  throughput: number;
  confidenceScore: number;
  success: boolean;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  activeExecutions: number;
  averageResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  lastHealthCheck: Date;
  alerts: MonitoringAlert[];
}

export interface MonitoringConfig {
  enableAlerts: boolean;
  enableMetrics: boolean;
  enableHealthChecks: boolean;
  alertThresholds: {
    errorRate: number;
    responseTime: number;
    memoryUsage: number;
    costPerExecution: number;
  };
  healthCheckInterval: number;
  metricsRetentionDays: number;
  alertChannels: string[];
}

export class MonitoringSystem extends EventEmitter {
  private config: MonitoringConfig;
  private alerts: Map<string, MonitoringAlert> = new Map();
  private metrics: PerformanceMetrics[] = [];
  private healthStatus: SystemHealth;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private startTime: Date;

  constructor(config: Partial<MonitoringConfig> = {}) {
    super();
    
    this.config = {
      enableAlerts: true,
      enableMetrics: true,
      enableHealthChecks: true,
      alertThresholds: {
        errorRate: 0.1, // 10%
        responseTime: 30000, // 30 seconds
        memoryUsage: 100 * 1024 * 1024, // 100MB
        costPerExecution: 50
      },
      healthCheckInterval: 30000, // 30 seconds
      metricsRetentionDays: 30,
      alertChannels: ['console', 'api'],
      ...config
    };

    this.startTime = new Date();
    this.healthStatus = {
      status: 'healthy',
      uptime: 0,
      activeExecutions: 0,
      averageResponseTime: 0,
      errorRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      lastHealthCheck: new Date(),
      alerts: []
    };

    if (this.config.enableHealthChecks) {
      this.startHealthChecks();
    }
  }

  /**
   * Track execution start
   */
  trackExecutionStart(executionId: string, goal: Goal): void {
    console.log(`📊 [MonitoringSystem] Tracking execution start: ${executionId}`);
    
    const metrics: PerformanceMetrics = {
      executionId,
      goalId: goal.id,
      startTime: new Date(),
      totalCost: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      evidenceCollected: 0,
      memoryUsage: 0,
      errorRate: 0,
      throughput: 0,
      confidenceScore: 0,
      success: false
    };

    this.metrics.push(metrics);
    this.healthStatus.activeExecutions++;
    
    this.emit('execution:started', { executionId, goal });
  }

  /**
   * Track execution completion
   */
  trackExecutionComplete(
    executionId: string,
    success: boolean,
    completedTasks: CompletedTask[],
    evidence: Evidence[],
    totalCost: number,
    confidenceScore: number
  ): void {
    console.log(`📊 [MonitoringSystem] Tracking execution complete: ${executionId}`);
    
    const metric = this.metrics.find(m => m.executionId === executionId);
    if (!metric) {
      console.warn(`⚠️ [MonitoringSystem] No metrics found for execution: ${executionId}`);
      return;
    }

    const endTime = new Date();
    const duration = endTime.getTime() - metric.startTime.getTime();

    metric.endTime = endTime;
    metric.duration = duration;
    metric.success = success;
    metric.tasksCompleted = completedTasks.length;
    metric.tasksFailed = completedTasks.filter(t => !t.success).length;
    metric.evidenceCollected = evidence.length;
    metric.totalCost = totalCost;
    metric.confidenceScore = confidenceScore;
    metric.throughput = (completedTasks.length / (duration / 60000)); // tasks per minute
    metric.errorRate = metric.tasksFailed / Math.max(completedTasks.length, 1);

    this.healthStatus.activeExecutions--;
    
    // Check for alerts
    this.checkExecutionAlerts(metric);
    
    this.emit('execution:completed', { executionId, metric });
  }

  /**
   * Track task execution
   */
  trackTaskExecution(
    executionId: string,
    task: Task,
    success: boolean,
    duration: number,
    cost: number,
    error?: string
  ): void {
    const metric = this.metrics.find(m => m.executionId === executionId);
    if (!metric) return;

    if (success) {
      metric.tasksCompleted++;
    } else {
      metric.tasksFailed++;
      
      // Create error alert
      if (this.config.enableAlerts) {
        this.createAlert({
          type: 'error',
          severity: 'medium',
          title: 'Task Execution Failed',
          message: `Task "${task.description}" failed: ${error || 'Unknown error'}`,
          source: 'task-executor',
          metadata: { executionId, taskId: task.id, error }
        });
      }
    }

    metric.totalCost += cost;
    metric.memoryUsage = this.getCurrentMemoryUsage();
    
    this.emit('task:executed', { executionId, task, success, duration, cost });
  }

  /**
   * Create monitoring alert
   */
  createAlert(alertData: Omit<MonitoringAlert, 'id' | 'timestamp' | 'resolved'>): string {
    const alert: MonitoringAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...alertData
    };

    this.alerts.set(alert.id, alert);
    this.healthStatus.alerts.push(alert);

    console.log(`🚨 [MonitoringSystem] Alert created: ${alert.title} (${alert.severity})`);
    
    this.emit('alert:created', alert);
    
    // Send to configured channels
    this.sendAlert(alert);
    
    return alert.id;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.resolved = true;
    alert.resolvedAt = new Date();
    
    console.log(`✅ [MonitoringSystem] Alert resolved: ${alert.title}`);
    
    this.emit('alert:resolved', alert);
    return true;
  }

  /**
   * Get system health status
   */
  getSystemHealth(): SystemHealth {
    this.updateHealthStatus();
    return { ...this.healthStatus };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(executionId?: string): PerformanceMetrics[] {
    if (executionId) {
      return this.metrics.filter(m => m.executionId === executionId);
    }
    return [...this.metrics];
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 50): MonitoringAlert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(): {
    total: number;
    resolved: number;
    unresolved: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  } {
    const alerts = Array.from(this.alerts.values());
    
    return {
      total: alerts.length,
      resolved: alerts.filter(a => a.resolved).length,
      unresolved: alerts.filter(a => !a.resolved).length,
      bySeverity: alerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byType: alerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Clean up old metrics and alerts
   */
  cleanup(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.metricsRetentionDays);

    // Remove old metrics
    this.metrics = this.metrics.filter(m => m.startTime > cutoffDate);

    // Remove old resolved alerts
    const oldAlerts = Array.from(this.alerts.values())
      .filter(a => a.resolved && a.resolvedAt && a.resolvedAt < cutoffDate);
    
    oldAlerts.forEach(alert => this.alerts.delete(alert.id));

    console.log(`🧹 [MonitoringSystem] Cleanup completed: removed ${oldAlerts.length} old alerts`);
  }

  /**
   * Start health checks
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Perform health check
   */
  private performHealthCheck(): void {
    this.updateHealthStatus();
    
    // Check for system issues
    if (this.healthStatus.errorRate > this.config.alertThresholds.errorRate) {
      this.createAlert({
        type: 'warning',
        severity: 'high',
        title: 'High Error Rate',
        message: `Error rate is ${(this.healthStatus.errorRate * 100).toFixed(1)}%, above threshold of ${(this.config.alertThresholds.errorRate * 100).toFixed(1)}%`,
        source: 'health-check'
      });
    }

    if (this.healthStatus.memoryUsage > this.config.alertThresholds.memoryUsage) {
      this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'High Memory Usage',
        message: `Memory usage is ${(this.healthStatus.memoryUsage / 1024 / 1024).toFixed(1)}MB, above threshold of ${(this.config.alertThresholds.memoryUsage / 1024 / 1024).toFixed(1)}MB`,
        source: 'health-check'
      });
    }

    this.emit('health:checked', this.healthStatus);
  }

  /**
   * Update health status
   */
  private updateHealthStatus(): void {
    const now = new Date();
    this.healthStatus.uptime = now.getTime() - this.startTime.getTime();
    this.healthStatus.lastHealthCheck = now;

    // Calculate average response time
    const recentMetrics = this.metrics.filter(m => m.duration && m.startTime > new Date(now.getTime() - 300000)); // Last 5 minutes
    this.healthStatus.averageResponseTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / recentMetrics.length 
      : 0;

    // Calculate error rate
    const totalTasks = recentMetrics.reduce((sum, m) => sum + m.tasksCompleted + m.tasksFailed, 0);
    const failedTasks = recentMetrics.reduce((sum, m) => sum + m.tasksFailed, 0);
    this.healthStatus.errorRate = totalTasks > 0 ? failedTasks / totalTasks : 0;

    // Get current memory usage
    this.healthStatus.memoryUsage = this.getCurrentMemoryUsage();

    // Determine overall status
    if (this.healthStatus.errorRate > 0.2 || this.healthStatus.memoryUsage > 200 * 1024 * 1024) {
      this.healthStatus.status = 'unhealthy';
    } else if (this.healthStatus.errorRate > 0.1 || this.healthStatus.memoryUsage > 100 * 1024 * 1024) {
      this.healthStatus.status = 'degraded';
    } else {
      this.healthStatus.status = 'healthy';
    }
  }

  /**
   * Check execution alerts
   */
  private checkExecutionAlerts(metric: PerformanceMetrics): void {
    if (!this.config.enableAlerts) return;

    // Check cost threshold
    if (metric.totalCost > this.config.alertThresholds.costPerExecution) {
      this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'High Execution Cost',
        message: `Execution ${metric.executionId} cost $${metric.totalCost.toFixed(2)}, above threshold of $${this.config.alertThresholds.costPerExecution}`,
        source: 'execution-monitor',
        metadata: { executionId: metric.executionId, cost: metric.totalCost }
      });
    }

    // Check response time threshold
    if (metric.duration && metric.duration > this.config.alertThresholds.responseTime) {
      this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'Slow Execution',
        message: `Execution ${metric.executionId} took ${(metric.duration / 1000).toFixed(1)}s, above threshold of ${this.config.alertThresholds.responseTime / 1000}s`,
        source: 'execution-monitor',
        metadata: { executionId: metric.executionId, duration: metric.duration }
      });
    }

    // Check error rate
    if (metric.errorRate > this.config.alertThresholds.errorRate) {
      this.createAlert({
        type: 'error',
        severity: 'high',
        title: 'High Execution Error Rate',
        message: `Execution ${metric.executionId} had ${(metric.errorRate * 100).toFixed(1)}% error rate`,
        source: 'execution-monitor',
        metadata: { executionId: metric.executionId, errorRate: metric.errorRate }
      });
    }
  }

  /**
   * Send alert to configured channels
   */
  private sendAlert(alert: MonitoringAlert): void {
    this.config.alertChannels.forEach(channel => {
      switch (channel) {
        case 'console':
          console.log(`🚨 [${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`);
          break;
        case 'api':
          // In a real implementation, this would send to an external API
          this.emit('alert:api', alert);
          break;
      }
    });
  }

  /**
   * Get current memory usage (simplified)
   */
  private getCurrentMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  /**
   * Destroy monitoring system
   */
  destroy(): void {
    this.stopHealthChecks();
    this.removeAllListeners();
    this.alerts.clear();
    this.metrics = [];
  }
}

// Export singleton instance
export const monitoringSystem = new MonitoringSystem();
