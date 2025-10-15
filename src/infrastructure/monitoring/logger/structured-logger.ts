/**
 * Structured Logger - Enhanced logging with structured data and metrics
 * 
 * This logger provides structured logging capabilities with automatic
 * metric collection, performance tracking, and integration with monitoring systems.
 */

import { SecureLogger, LogLevel, LogContext } from './secure-logger';

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  version: string;
  environment: string;
  context?: LogContext;
  metrics?: {
    duration?: number;
    memoryUsage?: NodeJS.MemoryUsage;
    cpuUsage?: NodeJS.CpuUsage;
    requestCount?: number;
    errorCount?: number;
  };
  tracing?: {
    traceId?: string;
    spanId?: string;
    parentSpanId?: string;
    operation?: string;
  };
  business?: {
    userId?: string;
    sessionId?: string;
    agentId?: string;
    workflowId?: string;
    action?: string;
    outcome?: 'success' | 'failure' | 'partial';
  };
}

export interface LogMetrics {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  averageResponseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  lastLogTime: Date;
}

export class StructuredLogger extends SecureLogger {
  private metrics: LogMetrics;
  private performanceMarks: Map<string, number>;

  constructor(
    service: string = 'vital-expert',
    version: string = '1.0.0',
    environment: string = process.env.NODE_ENV || 'development'
  ) {
    super(service, version, environment);
    
    this.metrics = {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      averageResponseTime: 0,
      memoryUsage: process.memoryUsage(),
      lastLogTime: new Date()
    };
    
    this.performanceMarks = new Map();
  }

  /**
   * Log with performance timing
   */
  logWithTiming(
    level: LogLevel,
    message: string,
    operation: string,
    context?: LogContext
  ): void {
    const startTime = this.performanceMarks.get(operation) || Date.now();
    const duration = Date.now() - startTime;
    
    this.log(level, message, {
      ...context,
      metrics: {
        duration,
        operation
      }
    });
  }

  /**
   * Start performance timing
   */
  startTiming(operation: string): void {
    this.performanceMarks.set(operation, Date.now());
  }

  /**
   * End performance timing and log
   */
  endTiming(
    operation: string,
    level: LogLevel = 'info',
    message?: string,
    context?: LogContext
  ): void {
    const startTime = this.performanceMarks.get(operation);
    if (!startTime) {
      this.warn(`No start time found for operation: ${operation}`);
      return;
    }
    
    const duration = Date.now() - startTime;
    this.performanceMarks.delete(operation);
    
    this.log(level, message || `Operation ${operation} completed`, {
      ...context,
      metrics: {
        duration,
        operation
      }
    });
  }

  /**
   * Log business event
   */
  logBusinessEvent(
    action: string,
    outcome: 'success' | 'failure' | 'partial',
    context?: LogContext & {
      userId?: string;
      sessionId?: string;
      agentId?: string;
      workflowId?: string;
    }
  ): void {
    this.info(`Business event: ${action}`, {
      ...context,
      business: {
        action,
        outcome,
        userId: context?.userId,
        sessionId: context?.sessionId,
        agentId: context?.agentId,
        workflowId: context?.workflowId
      }
    });
  }

  /**
   * Log API request
   */
  logApiRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
    
    this.log(level, `API ${method} ${path}`, {
      ...context,
      api: {
        method,
        path,
        statusCode,
        duration
      },
      metrics: {
        duration
      }
    });
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
    context?: LogContext
  ): void {
    const level = success ? 'info' : 'error';
    
    this.log(level, `Database ${operation} on ${table}`, {
      ...context,
      database: {
        operation,
        table,
        duration,
        success
      },
      metrics: {
        duration
      }
    });
  }

  /**
   * Log agent operation
   */
  logAgentOperation(
    agentId: string,
    operation: string,
    duration: number,
    success: boolean,
    context?: LogContext
  ): void {
    const level = success ? 'info' : 'error';
    
    this.log(level, `Agent ${agentId} ${operation}`, {
      ...context,
      agent: {
        agentId,
        operation,
        duration,
        success
      },
      metrics: {
        duration
      }
    });
  }

  /**
   * Log workflow operation
   */
  logWorkflowOperation(
    workflowId: string,
    step: string,
    duration: number,
    success: boolean,
    context?: LogContext
  ): void {
    const level = success ? 'info' : 'error';
    
    this.log(level, `Workflow ${workflowId} step: ${step}`, {
      ...context,
      workflow: {
        workflowId,
        step,
        duration,
        success
      },
      metrics: {
        duration
      }
    });
  }

  /**
   * Log security event
   */
  logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: LogContext
  ): void {
    const level = severity === 'critical' ? 'fatal' : 
                  severity === 'high' ? 'error' : 
                  severity === 'medium' ? 'warn' : 'info';
    
    this.log(level, `Security event: ${event}`, {
      ...context,
      security: {
        event,
        severity,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log performance metrics
   */
  logPerformanceMetrics(context?: LogContext): void {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.info('Performance metrics', {
      ...context,
      metrics: {
        memoryUsage,
        cpuUsage,
        uptime: process.uptime()
      }
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): LogMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      averageResponseTime: 0,
      memoryUsage: process.memoryUsage(),
      lastLogTime: new Date()
    };
  }

  /**
   * Override parent log method to update metrics
   */
  protected log(level: LogLevel, message: string, context?: LogContext): void {
    // Update metrics
    this.metrics.totalLogs++;
    this.metrics.lastLogTime = new Date();
    this.metrics.memoryUsage = process.memoryUsage();
    
    if (level === 'error' || level === 'fatal') {
      this.metrics.errorCount++;
    } else if (level === 'warn') {
      this.metrics.warningCount++;
    }
    
    // Update average response time if duration is provided
    if (context?.metrics?.duration) {
      const currentAvg = this.metrics.averageResponseTime;
      const totalLogs = this.metrics.totalLogs;
      this.metrics.averageResponseTime = 
        (currentAvg * (totalLogs - 1) + context.metrics.duration) / totalLogs;
    }
    
    // Call parent log method
    super.log(level, message, context);
  }

  /**
   * Create a child logger with tracing context
   */
  createTracingLogger(
    traceId: string,
    spanId: string,
    parentSpanId?: string
  ): StructuredLogger {
    const childLogger = new StructuredLogger(this.service, this.version, this.environment);
    
    // Override the log method to include tracing context
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level: LogLevel, message: string, context?: LogContext) => {
      const tracingContext = {
        ...context,
        tracing: {
          traceId,
          spanId,
          parentSpanId
        }
      };
      originalLog(level, message, tracingContext);
    };
    
    return childLogger;
  }
}

// Export singleton instance
export const structuredLogger = new StructuredLogger();

// Export utility functions
export function createStructuredLogger(
  service: string,
  version: string = '1.0.0',
  environment: string = process.env.NODE_ENV || 'development'
): StructuredLogger {
  return new StructuredLogger(service, version, environment);
}

export function createTracingLogger(
  traceId: string,
  spanId: string,
  parentSpanId?: string
): StructuredLogger {
  return structuredLogger.createTracingLogger(traceId, spanId, parentSpanId);
}
