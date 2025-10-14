/**
 * Performance Monitoring for LangChain, LangGraph, and RAG Systems
 * Tracks metrics, performance, and health of AI services
 */

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    langchain: 'up' | 'down' | 'degraded';
    langgraph: 'up' | 'down' | 'degraded';
    rag: 'up' | 'down' | 'degraded';
    vectorStore: 'up' | 'down' | 'degraded';
    memory: 'up' | 'down' | 'degraded';
  };
  metrics: {
    avgResponseTime: number;
    successRate: number;
    errorRate: number;
    totalRequests: number;
  };
  lastUpdated: Date;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 1000; // Keep last 1000 metrics
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startHealthMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record a performance metric
   */
  recordMetric(operation: string, duration: number, success: boolean, error?: string, metadata?: Record<string, any>) {
    const metric: PerformanceMetrics = {
      operation,
      duration,
      success,
      error,
      metadata,
      timestamp: new Date()
    };

    this.metrics.push(metric);

    // Keep only the last MAX_METRICS entries
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log significant events
    if (!success || duration > 5000) {
      console.warn(`⚠️ Performance Alert: ${operation} - ${success ? 'Slow' : 'Failed'} (${duration}ms)`, {
        error,
        metadata
      });
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    totalOperations: number;
    successRate: number;
    avgResponseTime: number;
    errorRate: number;
    slowOperations: PerformanceMetrics[];
    recentErrors: PerformanceMetrics[];
  } {
    const total = this.metrics.length;
    const successful = this.metrics.filter(m => m.success).length;
    const failed = this.metrics.filter(m => !m.success);
    const avgTime = this.metrics.reduce((sum, m) => sum + m.duration, 0) / total || 0;
    const slowOps = this.metrics.filter(m => m.duration > 3000);
    const recentErrors = failed.slice(-10);

    return {
      totalOperations: total,
      successRate: total > 0 ? (successful / total) * 100 : 100,
      avgResponseTime: avgTime,
      errorRate: total > 0 ? (failed.length / total) * 100 : 0,
      slowOperations: slowOps,
      recentErrors: recentErrors
    };
  }

  /**
   * Get system health status
   */
  getSystemHealth(): SystemHealth {
    const stats = this.getStats();
    const recentMetrics = this.metrics.slice(-100); // Last 100 operations

    // Determine service status based on recent performance
    const langchainStatus = this.getServiceStatus(recentMetrics.filter(m => m.operation.includes('langchain')));
    const langgraphStatus = this.getServiceStatus(recentMetrics.filter(m => m.operation.includes('langgraph')));
    const ragStatus = this.getServiceStatus(recentMetrics.filter(m => m.operation.includes('rag')));
    const vectorStoreStatus = this.getServiceStatus(recentMetrics.filter(m => m.operation.includes('vector')));
    const memoryStatus = this.getServiceStatus(recentMetrics.filter(m => m.operation.includes('memory')));

    // Overall system status
    const allServices = [langchainStatus, langgraphStatus, ragStatus, vectorStoreStatus, memoryStatus];
    const downServices = allServices.filter(s => s === 'down').length;
    const degradedServices = allServices.filter(s => s === 'degraded').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (downServices > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedServices > 0 || stats.errorRate > 10) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      status: overallStatus,
      services: {
        langchain: langchainStatus,
        langgraph: langgraphStatus,
        rag: ragStatus,
        vectorStore: vectorStoreStatus,
        memory: memoryStatus
      },
      metrics: {
        avgResponseTime: stats.avgResponseTime,
        successRate: stats.successRate,
        errorRate: stats.errorRate,
        totalRequests: stats.totalOperations
      },
      lastUpdated: new Date()
    };
  }

  /**
   * Determine service status based on metrics
   */
  private getServiceStatus(serviceMetrics: PerformanceMetrics[]): 'up' | 'down' | 'degraded' {
    if (serviceMetrics.length === 0) return 'up'; // No data = assume up

    const recent = serviceMetrics.slice(-10); // Last 10 operations
    const successRate = recent.filter(m => m.success).length / recent.length;
    const avgTime = recent.reduce((sum, m) => sum + m.duration, 0) / recent.length;

    if (successRate < 0.5) return 'down';
    if (successRate < 0.8 || avgTime > 5000) return 'degraded';
    return 'up';
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      const health = this.getSystemHealth();
      
      if (health.status === 'unhealthy') {
        console.error('🚨 System Health Alert: UNHEALTHY', health);
      } else if (health.status === 'degraded') {
        console.warn('⚠️ System Health Warning: DEGRADED', health);
      } else {
        console.log('✅ System Health: HEALTHY', {
          status: health.status,
          successRate: health.metrics.successRate.toFixed(1) + '%',
          avgResponseTime: health.metrics.avgResponseTime.toFixed(0) + 'ms'
        });
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
    console.log('🧹 Performance metrics cleared');
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Performance decorator for automatic metric collection
 */
export function trackPerformance(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let success = true;
      let error: string | undefined;

      try {
        const result = await method.apply(this, args);
        return result;
      } catch (err) {
        success = false;
        error = err instanceof Error ? err.message : 'Unknown error';
        throw err;
      } finally {
        const duration = Date.now() - startTime;
        performanceMonitor.recordMetric(operation, duration, success, error, {
          method: propertyName,
          args: args.length
        });
      }
    };
  };
}
