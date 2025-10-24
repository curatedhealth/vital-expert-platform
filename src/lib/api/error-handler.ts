import { NextResponse } from 'next/server';

/**
 * Standard error codes for API responses
 */
export enum ApiErrorCode {
  // Client errors (400-499)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server errors (500-599)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',

  // Custom business logic errors
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  CHAT_SESSION_EXPIRED = 'CHAT_SESSION_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
}

/**
 * Standard error response structure
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
    timestamp: string;
    path?: string;
    requestId?: string;
  };
}

/**
 * Standard success response structure
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  metadata?: {
    timestamp: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: ApiErrorCode,
  message: string,
  statusCode: number,
  details?: unknown,
  path?: string
): NextResponse<ApiErrorResponse> {
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
      timestamp: new Date().toISOString(),
      path,
      requestId: generateRequestId(),
    },
  };

  // Log error for monitoring
  console.error('[API Error]', {
    code,
    message,
    statusCode,
    path,
    details: process.env.NODE_ENV === 'development' ? details : '[hidden]',
  });

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200,
  metadata?: Record<string, unknown>
): NextResponse<ApiSuccessResponse<T>> {
  const successResponse: ApiSuccessResponse<T> = {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      ...metadata,
    },
  };

  return NextResponse.json(successResponse, { status: statusCode });
}

/**
 * Handle unknown errors and convert them to standard format
 */
export function handleApiError(error: unknown, path?: string): NextResponse<ApiErrorResponse> {
  // Handle known error types
  if (error instanceof Error) {
    // Database errors
    if (error.message.includes('database') || error.message.includes('postgres')) {
      return createErrorResponse(
        ApiErrorCode.DATABASE_ERROR,
        'Database operation failed',
        500,
        error.message,
        path
      );
    }

    // Validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        error.message,
        400,
        error,
        path
      );
    }

    // Auth errors
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      return createErrorResponse(
        ApiErrorCode.UNAUTHORIZED,
        'Authentication required',
        401,
        error.message,
        path
      );
    }

    // Default error
    return createErrorResponse(
      ApiErrorCode.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred',
      500,
      error.message,
      path
    );
  }

  // Handle non-Error objects
  return createErrorResponse(
    ApiErrorCode.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred',
    500,
    error,
    path
  );
}

/**
 * Generate a unique request ID for tracing
 */
function generateRequestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `req_${timestamp}_${random}`;
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): { valid: true } | { valid: false; missing: string[] } {
  const missing = requiredFields.filter(field => !body[field]);

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true };
}
