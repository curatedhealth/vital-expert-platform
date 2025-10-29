/**
 * Structured Logging Service
 * 
 * Provides enterprise-grade structured logging with:
 * - JSON-structured output
 * - Correlation IDs for request tracing
 * - Log levels with environment filtering
 * - Performance metrics capture
 * - PII sanitization
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  [key: string]: any;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name?: string;
    code?: string;
  };
  requestId?: string;
  userId?: string;
  operation?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Structured Logger for enterprise observability
 */
export class StructuredLogger {
  private requestId?: string;
  private userId?: string;
  private minLevel: LogLevel;
  private isDevelopment: boolean;

  constructor(options?: {
    requestId?: string;
    userId?: string;
    minLevel?: LogLevel;
    isDevelopment?: boolean;
  }) {
    this.requestId = options?.requestId;
    this.userId = options?.userId;
    this.minLevel = options?.minLevel ?? (process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG);
    this.isDevelopment = options?.isDevelopment ?? process.env.NODE_ENV !== 'production';
  }

  /**
   * Set request context for tracing
   */
  setContext(context: { requestId?: string; userId?: string }): void {
    if (context.requestId) {
      this.requestId = context.requestId;
    }
    if (context.userId) {
      this.userId = context.userId;
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    if (level < this.minLevel) {
      return;
    }

    const logEntry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message: this.sanitizeMessage(message),
      context: this.sanitizeContext(context),
    };

    // Add request tracing
    if (this.requestId) {
      logEntry.requestId = this.requestId;
    }
    if (this.userId) {
      logEntry.userId = this.userId;
    }

    // Add error details
    if (error) {
      logEntry.error = {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        name: error.name,
        code: (error as any).code,
      };
    }

    // Add metadata from context
    if (context) {
      logEntry.operation = context.operation;
      logEntry.duration = context.duration;
      logEntry.metadata = context.metadata;
    }

    // Output based on environment
    const output = JSON.stringify(logEntry);
    if (this.isDevelopment) {
      // Pretty print in development
      console.log(JSON.stringify(logEntry, null, 2));
    } else {
      // Structured JSON in production
      console.log(output);
    }

    // Export to Prometheus metrics
    try {
      const { getPrometheusExporter } = await import('./prometheus-exporter');
      const exporter = getPrometheusExporter();
      exporter.recordLogEntry(logEntry);
    } catch (promError) {
      // Don't fail on Prometheus export errors
      // Just log a warning in development
      if (this.isDevelopment) {
        console.warn('Prometheus export failed:', promError);
      }
    }

    // Integration with error tracking (Sentry, etc.)
    if (level === LogLevel.ERROR && error) {
      this.sendToErrorTracking(logEntry, error);
    }
  }

  /**
   * Log debug messages
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info messages
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log error messages
   */
  error(message: string, error: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log with performance metrics
   */
  infoWithMetrics(
    message: string,
    duration: number,
    context?: LogContext
  ): void {
    this.info(message, {
      ...context,
      duration,
      metadata: {
        ...context?.metadata,
        performance: {
          duration_ms: duration,
          duration_s: (duration / 1000).toFixed(2),
        },
      },
    });
  }

  /**
   * Sanitize message to remove PII
   */
  private sanitizeMessage(message: string): string {
    // Remove email patterns
    let sanitized = message.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      '[email]'
    );

    // Remove potential credit card patterns
    sanitized = sanitized.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[card]');

    // Remove potential SSN patterns
    sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[ssn]');

    return sanitized;
  }

  /**
   * Sanitize context to remove PII
   */
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) {
      return undefined;
    }

    const sanitized: LogContext = { ...context };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard', 'ssn'];
    sensitiveFields.forEach((field) => {
      if (sanitized[field] !== undefined) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Sanitize nested objects
    Object.keys(sanitized).forEach((key) => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeContext(sanitized[key] as LogContext);
      }
    });

    return sanitized;
  }

  /**
   * Send errors to external error tracking (Sentry, Datadog, etc.)
   */
  private sendToErrorTracking(entry: StructuredLogEntry, error: Error): void {
    // Integration placeholder
    // In production, integrate with Sentry, Datadog, etc.
    if (process.env.SENTRY_DSN && typeof window !== 'undefined') {
      // Example Sentry integration
      // Sentry.captureException(error, { extra: entry.context });
    }
  }
}

/**
 * Default logger instance
 */
export const logger = new StructuredLogger();

/**
 * Create a logger with context
 */
export function createLogger(context?: { requestId?: string; userId?: string }): StructuredLogger {
  return new StructuredLogger(context);
}

/**
 * Create a child logger with additional context
 */
export function createChildLogger(
  parent: StructuredLogger,
  additionalContext: LogContext
): StructuredLogger {
  const child = new StructuredLogger({
    requestId: parent['requestId'],
    userId: parent['userId'],
  });
  return child;
}
