/**
 * VITAL RAG System - Error Handler
 * 
 * Centralized error handling utilities for consistent error processing,
 * logging, and user feedback across the RAG system.
 */

import { NextRequest, NextResponse } from 'next/server';
import { RAGError, RAGErrorFactory, ErrorCategory, formatErrorForLogging } from './rag-errors';
import { logger } from '../logging/logger';

// ============================================================================
// ERROR HANDLER CLASS
// ============================================================================

export class RAGErrorHandler {
  private static instance: RAGErrorHandler;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  static getInstance(): RAGErrorHandler {
    if (!RAGErrorHandler.instance) {
      RAGErrorHandler.instance = new RAGErrorHandler();
    }
    return RAGErrorHandler.instance;
  }

  /**
   * Handle errors in API routes
   */
  handleAPIError(error: unknown, request?: NextRequest): NextResponse {
    const ragError = this.normalizeError(error);
    
    // Log the error
    this.logError(ragError, request);

    // Return appropriate response
    return this.createErrorResponse(ragError);
  }

  /**
   * Handle errors in service methods
   */
  handleServiceError(error: unknown, context?: Record<string, unknown>): RAGError {
    const ragError = this.normalizeError(error, context);
    
    // Log the error
    this.logError(ragError);

    return ragError;
  }

  /**
   * Normalize unknown errors to RAGError
   */
  private normalizeError(error: unknown, context?: Record<string, unknown>): RAGError {
    if (error instanceof RAGError) {
      return error;
    }

    // Handle specific error types
    if (error && typeof error === 'object' && 'code' in error) {
      const errorObj = error as any;
      
      // Supabase errors
      if (errorObj.code?.startsWith('PGRST')) {
        return RAGErrorFactory.fromSupabaseError(errorObj, context);
      }
      
      // OpenAI errors
      if (errorObj.status || errorObj.type) {
        return RAGErrorFactory.fromOpenAIError(errorObj, context);
      }
    }

    return RAGErrorFactory.fromUnknown(error, context);
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: RAGError, request?: NextRequest): void {
    const logData = {
      error: error.toJSON(),
      request: request ? {
        method: request.method,
        url: request.url,
        headers: this.sanitizeHeaders(request.headers),
        userAgent: request.headers.get('user-agent')
      } : undefined
    };

    // Determine log level based on error category
    switch (error.category) {
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        logger.warn('Authentication/Authorization error', logData);
        break;
      
      case ErrorCategory.VALIDATION:
        logger.info('Validation error', logData);
        break;
      
      case ErrorCategory.RATE_LIMIT:
      case ErrorCategory.QUOTA_EXCEEDED:
        logger.warn('Rate limit/Quota error', logData);
        break;
      
      case ErrorCategory.DATABASE:
      case ErrorCategory.EXTERNAL_API:
      case ErrorCategory.PROCESSING:
        logger.error('Service error', logData);
        break;
      
      case ErrorCategory.CONFIGURATION:
        logger.error('Configuration error', logData);
        break;
      
      case ErrorCategory.UNKNOWN:
      default:
        logger.error('Unknown error', logData);
        break;
    }
  }

  /**
   * Create HTTP response from RAG error
   */
  private createErrorResponse(error: RAGError): NextResponse {
    const response = {
      error: {
        code: error.code,
        message: error.getUserMessage(),
        ...(this.isDevelopment && {
          details: error.message,
          stack: error.stack,
          context: error.context
        })
      },
      timestamp: error.timestamp.toISOString(),
      retryable: error.retryable
    };

    return NextResponse.json(response, { status: error.statusCode });
  }

  /**
   * Sanitize headers for logging (remove sensitive data)
   */
  private sanitizeHeaders(headers: Headers): Record<string, string> {
    const sanitized: Record<string, string> = {};
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    
    headers.forEach((value, key) => {
      if (!sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = value;
      } else {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get the global error handler instance
 */
export function getErrorHandler(): RAGErrorHandler {
  return RAGErrorHandler.getInstance();
}

/**
 * Handle API errors with automatic response creation
 */
export function handleAPIError(error: unknown, request?: NextRequest): NextResponse {
  return getErrorHandler().handleAPIError(error, request);
}

/**
 * Handle service errors with automatic logging
 */
export function handleServiceError(error: unknown, context?: Record<string, unknown>): RAGError {
  return getErrorHandler().handleServiceError(error, context);
}

/**
 * Wrap async functions with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Record<string, unknown>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleServiceError(error, context);
    }
  };
}

/**
 * Wrap sync functions with error handling
 */
export function withSyncErrorHandling<T extends any[], R>(
  fn: (...args: T) => R,
  context?: Record<string, unknown>
) {
  return (...args: T): R => {
    try {
      return fn(...args);
    } catch (error) {
      throw handleServiceError(error, context);
    }
  };
}

// ============================================================================
// ERROR BOUNDARY UTILITIES
// ============================================================================

/**
 * Error boundary for React components
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: RAGError;
  errorInfo?: any;
}

/**
 * Create error boundary state
 */
export function createErrorBoundaryState(error: unknown, errorInfo?: any): ErrorBoundaryState {
  const ragError = RAGErrorFactory.fromUnknown(error);
  return {
    hasError: true,
    error: ragError,
    errorInfo
  };
}

/**
 * Get user-friendly error message for UI
 */
export function getUIErrorMessage(error: RAGError): string {
  return error.getUserMessage();
}

/**
 * Check if error should be retried
 */
export function shouldRetry(error: RAGError): boolean {
  return error.retryable;
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(error: RAGError, attempt: number): number {
  if (!error.retryable) return 0;
  
  // Exponential backoff with jitter
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  const jitter = Math.random() * 0.1 * delay; // 10% jitter
  
  return Math.floor(delay + jitter);
}

// ============================================================================
// ERROR MONITORING UTILITIES
// ============================================================================

/**
 * Error metrics for monitoring
 */
export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsByCode: Record<string, number>;
  retryableErrors: number;
  lastError?: RAGError;
}

/**
 * Simple in-memory error metrics (replace with proper monitoring in production)
 */
class ErrorMetricsCollector {
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByCategory: {} as Record<ErrorCategory, number>,
    errorsByCode: {},
    retryableErrors: 0
  };

  recordError(error: RAGError): void {
    this.metrics.totalErrors++;
    
    // Count by category
    this.metrics.errorsByCategory[error.category] = 
      (this.metrics.errorsByCategory[error.category] || 0) + 1;
    
    // Count by code
    this.metrics.errorsByCode[error.code] = 
      (this.metrics.errorsByCode[error.code] || 0) + 1;
    
    // Count retryable errors
    if (error.retryable) {
      this.metrics.retryableErrors++;
    }
    
    this.metrics.lastError = error;
  }

  getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalErrors: 0,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsByCode: {},
      retryableErrors: 0
    };
  }
}

export const errorMetrics = new ErrorMetricsCollector();

/**
 * Record error in metrics
 */
export function recordErrorMetrics(error: RAGError): void {
  errorMetrics.recordError(error);
}

/**
 * Get error metrics
 */
export function getErrorMetrics(): ErrorMetrics {
  return errorMetrics.getMetrics();
}
