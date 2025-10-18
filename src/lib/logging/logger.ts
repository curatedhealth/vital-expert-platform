/**
 * VITAL RAG System - Structured Logging
 * 
 * Centralized logging system using Winston with structured JSON output,
 * proper log levels, and context-aware logging for the RAG system.
 */

import winston from 'winston';
import path from 'path';

// ============================================================================
// LOG LEVELS
// ============================================================================

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}

// ============================================================================
// LOG CONTEXT INTERFACES
// ============================================================================

export interface LogContext {
  // Request context
  requestId?: string;
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  
  // Service context
  service?: string;
  operation?: string;
  component?: string;
  
  // Performance context
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  
  // Error context
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
    statusCode?: number;
  };
  
  // Business context
  documentId?: string;
  sourceId?: string;
  queryId?: string;
  embeddingId?: string;
  
  // Custom context
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  meta?: Record<string, any>;
}

// ============================================================================
// WINSTON CONFIGURATION
// ============================================================================

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, context, meta, stack, ...rest }) => {
    const logEntry: LogEntry = {
      timestamp,
      level: level as LogLevel,
      message,
      context,
      meta: { ...meta, ...rest }
    };

    // Add stack trace for errors
    if (stack) {
      logEntry.meta = { ...logEntry.meta, stack };
    }

    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss.SSS'
  }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    let output = `${timestamp} [${level}]: ${message}`;
    
    if (context) {
      output += `\n  Context: ${JSON.stringify(context, null, 2)}`;
    }
    
    if (Object.keys(meta).length > 0) {
      output += `\n  Meta: ${JSON.stringify(meta, null, 2)}`;
    }
    
    return output;
  })
);

// Create Winston logger
const logger = winston.createLogger({
  level: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
  format: logFormat,
  defaultMeta: {
    service: 'vital-rag-system',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: isDevelopment ? consoleFormat : logFormat,
      silent: process.env.NODE_ENV === 'test'
    })
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.Console({
      format: consoleFormat
    })
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

// Add file transports in production
if (isProduction) {
  const logsDir = path.join(process.cwd(), 'logs');
  
  // Error logs
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: LogLevel.ERROR,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true
  }));
  
  // Combined logs
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    tailable: true
  }));
  
  // HTTP logs
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'http.log'),
    level: LogLevel.HTTP,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true
  }));
}

// ============================================================================
// LOGGER CLASS
// ============================================================================

export class RAGLogger {
  private static instance: RAGLogger;
  private context: LogContext = {};

  private constructor() {}

  static getInstance(): RAGLogger {
    if (!RAGLogger.instance) {
      RAGLogger.instance = new RAGLogger();
    }
    return RAGLogger.instance;
  }

  /**
   * Set persistent context for all subsequent logs
   */
  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear persistent context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Get current context
   */
  getContext(): LogContext {
    return { ...this.context };
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext, meta?: Record<string, any>): void {
    logger.error(message, { context: { ...this.context, ...context }, meta });
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext, meta?: Record<string, any>): void {
    logger.warn(message, { context: { ...this.context, ...context }, meta });
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext, meta?: Record<string, any>): void {
    logger.info(message, { context: { ...this.context, ...context }, meta });
  }

  /**
   * Log HTTP request/response
   */
  http(message: string, context?: LogContext, meta?: Record<string, any>): void {
    logger.http(message, { context: { ...this.context, ...context }, meta });
  }

  /**
   * Log verbose message
   */
  verbose(message: string, context?: LogContext, meta?: Record<string, any>): void {
    logger.verbose(message, { context: { ...this.context, ...context }, meta });
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext, meta?: Record<string, any>): void {
    logger.debug(message, { context: { ...this.context, ...context }, meta });
  }

  /**
   * Log silly message
   */
  silly(message: string, context?: LogContext, meta?: Record<string, any>): void {
    logger.silly(message, { context: { ...this.context, ...context }, meta });
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, duration: number, context?: LogContext, meta?: Record<string, any>): void {
    this.info(`Performance: ${operation}`, {
      ...this.context,
      ...context,
      operation,
      duration,
      memoryUsage: process.memoryUsage()
    }, meta);
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, context?: LogContext, meta?: Record<string, any>): void {
    this.http(`API Request: ${method} ${url}`, {
      ...this.context,
      ...context,
      method,
      url,
      type: 'api_request'
    }, meta);
  }

  /**
   * Log API response
   */
  apiResponse(method: string, url: string, statusCode: number, duration: number, context?: LogContext, meta?: Record<string, any>): void {
    this.http(`API Response: ${method} ${url} ${statusCode}`, {
      ...this.context,
      ...context,
      method,
      url,
      statusCode,
      duration,
      type: 'api_response'
    }, meta);
  }

  /**
   * Log database operation
   */
  database(operation: string, table: string, duration?: number, context?: LogContext, meta?: Record<string, any>): void {
    this.info(`Database: ${operation} on ${table}`, {
      ...this.context,
      ...context,
      operation,
      table,
      duration,
      type: 'database'
    }, meta);
  }

  /**
   * Log embedding operation
   */
  embedding(operation: string, textLength: number, dimensions: number, duration?: number, context?: LogContext, meta?: Record<string, any>): void {
    this.info(`Embedding: ${operation}`, {
      ...this.context,
      ...context,
      operation,
      textLength,
      dimensions,
      duration,
      type: 'embedding'
    }, meta);
  }

  /**
   * Log vector search
   */
  vectorSearch(query: string, resultsCount: number, duration: number, context?: LogContext, meta?: Record<string, any>): void {
    this.info(`Vector Search: ${query.substring(0, 100)}...`, {
      ...this.context,
      ...context,
      query: query.substring(0, 100),
      resultsCount,
      duration,
      type: 'vector_search'
    }, meta);
  }

  /**
   * Log document processing
   */
  documentProcessing(documentId: string, operation: string, status: string, context?: LogContext, meta?: Record<string, any>): void {
    this.info(`Document Processing: ${operation}`, {
      ...this.context,
      ...context,
      documentId,
      operation,
      status,
      type: 'document_processing'
    }, meta);
  }

  /**
   * Log tenant operation
   */
  tenant(operation: string, tenantId: string, context?: LogContext, meta?: Record<string, any>): void {
    this.info(`Tenant: ${operation}`, {
      ...this.context,
      ...context,
      operation,
      tenantId,
      type: 'tenant'
    }, meta);
  }

  /**
   * Log security event
   */
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext, meta?: Record<string, any>): void {
    const level = severity === 'critical' || severity === 'high' ? LogLevel.ERROR : LogLevel.WARN;
    logger.log(level, `Security: ${event}`, {
      context: { ...this.context, ...context, severity },
      meta
    });
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get the global logger instance
 */
export function getLogger(): RAGLogger {
  return RAGLogger.getInstance();
}

/**
 * Create a scoped logger with persistent context
 */
export function createScopedLogger(context: LogContext): RAGLogger {
  const logger = RAGLogger.getInstance();
  logger.setContext(context);
  return logger;
}

/**
 * Log with automatic context
 */
export function logWithContext(
  level: LogLevel,
  message: string,
  context?: LogContext,
  meta?: Record<string, any>
): void {
  const logger = getLogger();
  logger[level](message, context, meta);
}

// ============================================================================
// MIDDLEWARE FOR NEXT.JS
// ============================================================================

/**
 * Request logging middleware
 */
export function requestLoggingMiddleware(req: any, res: any, next: any) {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Set request ID in context
  const logger = getLogger();
  logger.setContext({ requestId });

  // Log request
  logger.apiRequest(req.method, req.url, {
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress,
    tenantId: req.headers['x-tenant-id']
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk: any, encoding: any) {
    const duration = Date.now() - startTime;
    logger.apiResponse(req.method, req.url, res.statusCode, duration, {
      contentLength: res.get('content-length'),
      tenantId: req.headers['x-tenant-id']
    });
    
    originalEnd.call(this, chunk, encoding);
  };

  next();
}

// Export the Winston logger instance for direct use
export { logger };
