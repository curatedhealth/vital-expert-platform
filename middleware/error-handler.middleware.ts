/**
 * Standardized Error Handler Middleware
 * Provides consistent error response format across all API routes
 */

import { NextResponse } from 'next/server';

export interface APIError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

export interface APIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId?: string;
}

export interface APISuccessResponse<T = any> {
  success: true;
  data: T;
  metadata?: {
    timestamp: string;
    requestId?: string;
    [key: string]: any;
  };
}

/**
 * Standard error codes
 */
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  AUTH_NOT_CONFIGURED: 'AUTH_NOT_CONFIGURED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',

  // RLS & Security
  RLS_CONTEXT_MISSING: 'RLS_CONTEXT_MISSING',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  TENANT_MISMATCH: 'TENANT_MISMATCH',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',

  // External Services
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  LLM_ERROR: 'LLM_ERROR',
  RAG_ERROR: 'RAG_ERROR',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
} as const;

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: APIError | Error | string,
  statusCode?: number
): NextResponse<APIErrorResponse> {
  let errorCode: string;
  let errorMessage: string;
  let errorDetails: any;
  let responseStatus: number;

  if (typeof error === 'string') {
    errorCode = ErrorCodes.INTERNAL_ERROR;
    errorMessage = error;
    responseStatus = statusCode || 500;
  } else if (error instanceof Error) {
    errorCode = ErrorCodes.INTERNAL_ERROR;
    errorMessage = error.message;
    errorDetails = process.env.NODE_ENV === 'development' ? error.stack : undefined;
    responseStatus = statusCode || 500;
  } else {
    errorCode = error.code;
    errorMessage = error.message;
    errorDetails = error.details;
    responseStatus = error.statusCode || statusCode || 500;
  }

  const response: APIErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
      ...(errorDetails && { details: errorDetails })
    },
    timestamp: new Date().toISOString()
  };

  // Log error for monitoring
  console.error('[API Error]', {
    code: errorCode,
    message: errorMessage,
    status: responseStatus,
    timestamp: response.timestamp
  });

  return NextResponse.json(response, { status: responseStatus });
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  metadata?: Record<string, any>
): NextResponse<APISuccessResponse<T>> {
  const response: APISuccessResponse<T> = {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata
    }
  };

  return NextResponse.json(response);
}

/**
 * Wrap async API handler with error handling
 */
export function withErrorHandler<T = any>(
  handler: (...args: any[]) => Promise<NextResponse<APISuccessResponse<T>>>
) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Handle known error types
      if (error instanceof APIError) {
        return createErrorResponse(error);
      }

      // Handle Supabase errors
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as any;
        return createErrorResponse({
          code: ErrorCodes.DATABASE_ERROR,
          message: dbError.message || 'Database operation failed',
          details: process.env.NODE_ENV === 'development' ? dbError : undefined
        }, 500);
      }

      // Handle validation errors (from Zod or similar)
      if (error && typeof error === 'object' && 'issues' in error) {
        return createErrorResponse({
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Request validation failed',
          details: error
        }, 400);
      }

      // Generic error fallback
      return createErrorResponse(
        error instanceof Error ? error : 'An unexpected error occurred',
        500
      );
    }
  };
}

/**
 * Custom API Error class
 */
export class APIErrorClass extends Error implements APIError {
  code: string;
  statusCode?: number;
  details?: any;

  constructor(code: string, message: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Common error factory functions
 */
export const APIErrors = {
  unauthorized: (message = 'Authentication required') =>
    new APIErrorClass(ErrorCodes.UNAUTHORIZED, message, 401),

  forbidden: (message = 'Access denied') =>
    new APIErrorClass(ErrorCodes.FORBIDDEN, message, 403),

  notFound: (resource = 'Resource', message?: string) =>
    new APIErrorClass(
      ErrorCodes.NOT_FOUND,
      message || `${resource} not found`,
      404
    ),

  validationError: (message: string, details?: any) =>
    new APIErrorClass(ErrorCodes.VALIDATION_ERROR, message, 400, details),

  rateLimitExceeded: (message = 'Too many requests') =>
    new APIErrorClass(ErrorCodes.RATE_LIMIT_EXCEEDED, message, 429),

  internalError: (message = 'Internal server error') =>
    new APIErrorClass(ErrorCodes.INTERNAL_ERROR, message, 500),

  serviceUnavailable: (message = 'Service temporarily unavailable') =>
    new APIErrorClass(ErrorCodes.SERVICE_UNAVAILABLE, message, 503),
};
