/**
 * Comprehensive Error Boundary for API Routes
 * Catches and handles all types of errors with proper logging and monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, ErrorCodes } from '@/middleware/error-handler.middleware';

export interface ErrorBoundaryOptions {
  /**
   * Custom error logger (e.g., Sentry, Datadog)
   */
  logger?: (error: Error, context: ErrorContext) => void | Promise<void>;

  /**
   * Fallback response when error handling fails
   */
  fallbackResponse?: any;

  /**
   * Enable detailed error information in development
   */
  includeStackTrace?: boolean;

  /**
   * Timeout for async operations (ms)
   */
  timeout?: number;
}

export interface ErrorContext {
  endpoint: string;
  method: string;
  userId?: string;
  timestamp: string;
  requestId?: string;
  duration?: number;
}

/**
 * Wrap API route handler with comprehensive error boundary
 */
export function withErrorBoundary<T = any>(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options: ErrorBoundaryOptions = {}
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    const endpoint = new URL(request.url).pathname;
    const method = request.method;

    // Add request ID to headers for tracing
    const userId = request.headers.get('X-User-Id') || undefined;

    const context: ErrorContext = {
      endpoint,
      method,
      userId,
      timestamp: new Date().toISOString(),
      requestId
    };

    try {
      // Apply timeout if configured
      if (options.timeout) {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Request timeout after ${options.timeout}ms`));
          }, options.timeout);
        });

        const response = await Promise.race([
          handler(request, ...args),
          timeoutPromise
        ]);

        // Add request metadata to response
        response.headers.set('X-Request-Id', requestId);
        response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

        return response;
      }

      // No timeout - execute normally
      const response = await handler(request, ...args);

      // Add request metadata to response
      response.headers.set('X-Request-Id', requestId);
      response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

      context.duration = Date.now() - startTime;

      // Log successful request (optional)
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Success]', {
          ...context,
          duration: context.duration
        });
      }

      return response;

    } catch (error) {
      context.duration = Date.now() - startTime;

      // Log error with full context
      await logError(error, context, options.logger);

      // Return appropriate error response
      return handleError(error, context, options);
    }
  };
}

/**
 * Log error with context and send to monitoring service
 */
async function logError(
  error: unknown,
  context: ErrorContext,
  customLogger?: (error: Error, context: ErrorContext) => void | Promise<void>
): Promise<void> {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  // Console log with context
  console.error('[API Error]', {
    error: {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack
    },
    context
  });

  // Send to custom logger (e.g., Sentry)
  if (customLogger) {
    try {
      await customLogger(errorObj, context);
    } catch (logError) {
      console.error('[Error Logger Failed]', logError);
    }
  }

  // TODO: Integrate with monitoring service (Sentry, Datadog, etc.)
  // Example:
  // Sentry.captureException(errorObj, {
  //   tags: {
  //     endpoint: context.endpoint,
  //     method: context.method,
  //     userId: context.userId
  //   },
  //   extra: context
  // });
}

/**
 * Handle error and return appropriate response
 */
function handleError(
  error: unknown,
  context: ErrorContext,
  options: ErrorBoundaryOptions
): NextResponse {
  // Timeout error
  if (error instanceof Error && error.message.includes('timeout')) {
    return createErrorResponse({
      code: ErrorCodes.TIMEOUT,
      message: 'Request timed out. Please try again.',
      details: options.includeStackTrace && process.env.NODE_ENV === 'development'
        ? error.stack
        : undefined
    }, 504);
  }

  // Database errors (Supabase)
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as any;

    // Handle specific database error codes
    if (dbError.code === '23505') {
      return createErrorResponse({
        code: ErrorCodes.ALREADY_EXISTS,
        message: 'Resource already exists',
        details: process.env.NODE_ENV === 'development' ? dbError.details : undefined
      }, 409);
    }

    if (dbError.code === '23503') {
      return createErrorResponse({
        code: ErrorCodes.NOT_FOUND,
        message: 'Referenced resource not found',
        details: process.env.NODE_ENV === 'development' ? dbError.details : undefined
      }, 404);
    }

    // Generic database error
    return createErrorResponse({
      code: ErrorCodes.DATABASE_ERROR,
      message: 'Database operation failed',
      details: process.env.NODE_ENV === 'development' ? dbError : undefined
    }, 500);
  }

  // OpenAI/LLM errors
  if (error instanceof Error) {
    if (error.message.includes('rate limit') || error.message.includes('quota')) {
      return createErrorResponse({
        code: ErrorCodes.QUOTA_EXCEEDED,
        message: 'LLM service quota exceeded. Please try again later.',
      }, 429);
    }

    if (error.message.includes('model') || error.message.includes('openai')) {
      return createErrorResponse({
        code: ErrorCodes.LLM_ERROR,
        message: 'AI service error. Please try again.',
        details: options.includeStackTrace && process.env.NODE_ENV === 'development'
          ? error.stack
          : undefined
      }, 503);
    }
  }

  // Network/fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createErrorResponse({
      code: ErrorCodes.EXTERNAL_SERVICE_ERROR,
      message: 'External service unavailable',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, 503);
  }

  // Validation errors (from Zod or similar)
  if (error && typeof error === 'object' && 'issues' in error) {
    return createErrorResponse({
      code: ErrorCodes.VALIDATION_ERROR,
      message: 'Request validation failed',
      details: error
    }, 400);
  }

  // Generic error fallback
  const errorMessage = error instanceof Error
    ? error.message
    : 'An unexpected error occurred';

  const errorStack = error instanceof Error && options.includeStackTrace && process.env.NODE_ENV === 'development'
    ? error.stack
    : undefined;

  return createErrorResponse({
    code: ErrorCodes.INTERNAL_ERROR,
    message: errorMessage,
    details: errorStack
  }, 500);
}

/**
 * Create retry-able error boundary for transient failures
 */
export function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    shouldRetry = (error: Error) => {
      // Retry on network errors or 5xx responses
      return error.message.includes('fetch') ||
             error.message.includes('network') ||
             error.message.includes('ECONNRESET');
    }
  } = options;

  return attemptWithRetry(fn, maxRetries, delayMs, shouldRetry);
}

async function attemptWithRetry<T>(
  fn: () => Promise<T>,
  retriesLeft: number,
  delayMs: number,
  shouldRetry: (error: Error) => boolean
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retriesLeft <= 0 || !(error instanceof Error) || !shouldRetry(error)) {
      throw error;
    }

    console.warn(`Retrying after error (${retriesLeft} retries left):`, error.message);

    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, delayMs));

    return attemptWithRetry(fn, retriesLeft - 1, delayMs * 2, shouldRetry);
  }
}

/**
 * Graceful degradation wrapper
 * Returns fallback value if operation fails
 */
export async function withFallback<T>(
  fn: () => Promise<T>,
  fallbackValue: T,
  options?: {
    onError?: (error: Error) => void;
  }
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (options?.onError && error instanceof Error) {
      options.onError(error);
    }

    console.warn('Operation failed, using fallback value:', error);
    return fallbackValue;
  }
}
