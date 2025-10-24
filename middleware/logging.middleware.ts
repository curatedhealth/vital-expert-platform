/**
 * Request/Response Logging Middleware
 *
 * Provides comprehensive logging for API requests and responses:
 * - Request logging (method, URL, headers, body)
 * - Response logging (status, headers, body, duration)
 * - Performance metrics
 * - Error tracking
 * - Structured logging
 * - Sensitive data redaction
 *
 * @module middleware/logging
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

export interface LogEntry {
  timestamp: string;
  requestId: string;
  method: string;
  url: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body?: any;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  statusCode?: number;
  responseSize?: number;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, any>;
}

export interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  logRequests: boolean;
  logResponses: boolean;
  logRequestBody: boolean;
  logResponseBody: boolean;
  logHeaders: boolean;
  redactSensitiveData: boolean;
  sensitiveHeaders: string[];
  sensitiveFields: string[];
  maxBodySize: number; // Max size to log (bytes)
  includeStackTrace: boolean;
  destination: 'console' | 'file' | 'external';
  onLog?: (entry: LogEntry) => void | Promise<void>;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  enabled: true,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  logRequests: true,
  logResponses: true,
  logRequestBody: process.env.NODE_ENV !== 'production',
  logResponseBody: false, // Usually too large
  logHeaders: true,
  redactSensitiveData: true,
  sensitiveHeaders: [
    'authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
    'x-auth-token',
  ],
  sensitiveFields: [
    'password',
    'token',
    'secret',
    'api_key',
    'apiKey',
    'accessToken',
    'refreshToken',
    'credit_card',
    'ssn',
  ],
  maxBodySize: 10000, // 10KB
  includeStackTrace: process.env.NODE_ENV !== 'production',
  destination: 'console',
};

// ============================================================================
// SENSITIVE DATA REDACTION
// ============================================================================

/**
 * Redact sensitive values from object
 */
function redactSensitiveData(
  data: any,
  sensitiveFields: string[]
): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item, sensitiveFields));
  }

  const redacted: any = {};

  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();
    const isSensitive = sensitiveFields.some((field) =>
      keyLower.includes(field.toLowerCase())
    );

    if (isSensitive && value) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value, sensitiveFields);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Redact sensitive headers
 */
function redactHeaders(
  headers: Headers,
  sensitiveHeaders: string[]
): Record<string, string> {
  const redacted: Record<string, string> = {};

  headers.forEach((value, key) => {
    const isSensitive = sensitiveHeaders.some(
      (header) => header.toLowerCase() === key.toLowerCase()
    );

    if (isSensitive) {
      // Show partial value for debugging
      redacted[key] = value.substring(0, 10) + '...[REDACTED]';
    } else {
      redacted[key] = value;
    }
  });

  return redacted;
}

// ============================================================================
// REQUEST LOGGING
// ============================================================================

/**
 * Extract and format request information
 */
async function extractRequestInfo(
  request: NextRequest,
  config: LoggingConfig
): Promise<Partial<LogEntry>> {
  const url = new URL(request.url);

  const info: Partial<LogEntry> = {
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
    method: request.method,
    url: request.url,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    userId: request.headers.get('x-user-id') || undefined,
    userEmail: request.headers.get('x-user-email') || undefined,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  };

  // Log headers if enabled
  if (config.logHeaders) {
    info.headers = config.redactSensitiveData
      ? redactHeaders(request.headers, config.sensitiveHeaders)
      : Object.fromEntries(request.headers);
  }

  // Log request body if enabled
  if (config.logRequestBody && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const clone = request.clone();
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        let body = await clone.json();

        // Truncate if too large
        const bodyStr = JSON.stringify(body);
        if (bodyStr.length > config.maxBodySize) {
          body = { _truncated: true, _size: bodyStr.length };
        } else if (config.redactSensitiveData) {
          body = redactSensitiveData(body, config.sensitiveFields);
        }

        info.body = body;
      }
    } catch (error) {
      // Body parsing failed, skip logging it
      info.body = { _error: 'Failed to parse body' };
    }
  }

  return info;
}

// ============================================================================
// RESPONSE LOGGING
// ============================================================================

/**
 * Extract and format response information
 */
function extractResponseInfo(
  response: NextResponse,
  duration: number,
  config: LoggingConfig
): Partial<LogEntry> {
  const info: Partial<LogEntry> = {
    statusCode: response.status,
    duration,
  };

  // Estimate response size
  const contentLength = response.headers.get('content-length');
  if (contentLength) {
    info.responseSize = parseInt(contentLength);
  }

  return info;
}

// ============================================================================
// LOGGING FUNCTIONS
// ============================================================================

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry, config: LoggingConfig): string {
  const {
    timestamp,
    requestId,
    method,
    path,
    statusCode,
    duration,
    userId,
    error,
  } = entry;

  const statusEmoji = statusCode
    ? statusCode < 300
      ? '✅'
      : statusCode < 400
      ? '➡️'
      : statusCode < 500
      ? '⚠️'
      : '❌'
    : '🔄';

  const userInfo = userId ? ` [User: ${userId}]` : '';
  const durationStr = duration ? ` ${duration}ms` : '';
  const errorStr = error ? ` ERROR: ${error.message}` : '';

  return `${statusEmoji} ${timestamp} [${requestId}]${userInfo} ${method} ${path} → ${statusCode || 'pending'}${durationStr}${errorStr}`;
}

/**
 * Write log entry to destination
 */
function writeLog(entry: LogEntry, config: LoggingConfig): void {
  if (!config.enabled) return;

  // Console logging
  if (config.destination === 'console') {
    const formatted = formatLogEntry(entry, config);

    if (entry.statusCode && entry.statusCode >= 500) {
      console.error(formatted);
      if (config.includeStackTrace && entry.error?.stack) {
        console.error(entry.error.stack);
      }
    } else if (entry.statusCode && entry.statusCode >= 400) {
      console.warn(formatted);
    } else if (config.level === 'debug') {
      console.debug(formatted);
      console.debug('  Request:', {
        method: entry.method,
        url: entry.url,
        headers: entry.headers,
        body: entry.body,
      });
    } else {
      console.log(formatted);
    }
  }

  // Call custom log handler
  if (config.onLog) {
    Promise.resolve(config.onLog(entry)).catch((error) => {
      console.error('Failed to execute custom log handler:', error);
    });
  }
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export interface LoggingOptions {
  config?: Partial<LoggingConfig>;
  metadata?: Record<string, any>;
}

/**
 * Request/Response Logging Middleware
 *
 * Logs all API requests and responses with performance metrics
 *
 * @example
 * ```typescript
 * export const POST = withLogging(
 *   async (request: NextRequest) => {
 *     // Your handler logic
 *     return NextResponse.json({ data: result });
 *   },
 *   {
 *     config: {
 *       logRequestBody: true,
 *       logResponseBody: false,
 *     },
 *     metadata: {
 *       endpoint: 'chat',
 *       version: 'v1',
 *     },
 *   }
 * );
 * ```
 */
export function withLogging<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  options: LoggingOptions = {}
): (request: NextRequest, ...args: T) => Promise<NextResponse> {
  const config: LoggingConfig = {
    ...DEFAULT_LOGGING_CONFIG,
    ...options.config,
  };

  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    if (!config.enabled) {
      return handler(request, ...args);
    }

    const startTime = Date.now();
    let logEntry: LogEntry | null = null;

    try {
      // Extract request info
      if (config.logRequests) {
        const requestInfo = await extractRequestInfo(request, config);
        logEntry = {
          ...requestInfo,
          metadata: options.metadata,
        } as LogEntry;

        // Write request log
        writeLog(logEntry, config);
      }

      // Execute handler
      const response = await handler(request, ...args);

      // Extract response info
      const duration = Date.now() - startTime;
      const responseInfo = extractResponseInfo(response, duration, config);

      // Update log entry
      if (logEntry) {
        logEntry.duration = duration;
        logEntry.statusCode = responseInfo.statusCode;
        logEntry.responseSize = responseInfo.responseSize;

        // Write response log
        if (config.logResponses) {
          writeLog(logEntry, config);
        }
      }

      // Add request ID to response headers
      if (logEntry) {
        response.headers.set('X-Request-Id', logEntry.requestId);
      }

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Log error
      if (logEntry) {
        logEntry.duration = duration;
        logEntry.statusCode = 500;
        logEntry.error = {
          message: error.message || 'Unknown error',
          stack: config.includeStackTrace ? error.stack : undefined,
          code: error.code,
        };

        writeLog(logEntry, config);
      }

      // Re-throw error
      throw error;
    }
  };
}

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

/**
 * Log slow requests (requests exceeding threshold)
 */
export function withSlowRequestLogging<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  thresholdMs: number = 1000
): (request: NextRequest, ...args: T) => Promise<NextResponse> {
  return withLogging(handler, {
    config: {
      onLog: (entry) => {
        if (entry.duration && entry.duration > thresholdMs) {
          console.warn(`⚠️  SLOW REQUEST: ${entry.method} ${entry.path} took ${entry.duration}ms`);
        }
      },
    },
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default withLogging;
