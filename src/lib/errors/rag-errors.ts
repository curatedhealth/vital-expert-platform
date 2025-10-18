/**
 * VITAL RAG System - Comprehensive Error Handling
 * 
 * This module provides structured error classes for the RAG system,
 * enabling proper error categorization, logging, and user feedback.
 */

// ============================================================================
// BASE ERROR CLASSES
// ============================================================================

/**
 * Base error class for all RAG system errors
 */
export abstract class RAGError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  abstract readonly category: ErrorCategory;
  
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;
  public readonly retryable: boolean;

  constructor(
    message: string,
    context?: Record<string, unknown>,
    retryable: boolean = false
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;
    this.retryable = retryable;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Convert error to JSON for logging/serialization
   */
  toJSON(): RAGErrorJSON {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      category: this.category,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      retryable: this.retryable,
      stack: this.stack
    };
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    return this.message;
  }
}

/**
 * Error categories for better classification
 */
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  CONFIGURATION = 'configuration',
  PROCESSING = 'processing',
  RATE_LIMIT = 'rate_limit',
  QUOTA_EXCEEDED = 'quota_exceeded',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * JSON representation of RAG errors
 */
export interface RAGErrorJSON {
  name: string;
  code: string;
  message: string;
  statusCode: number;
  category: ErrorCategory;
  timestamp: string;
  context?: Record<string, unknown>;
  retryable: boolean;
  stack?: string;
}

// ============================================================================
// AUTHENTICATION & AUTHORIZATION ERRORS
// ============================================================================

export class AuthenticationError extends RAGError {
  readonly code = 'AUTH_ERROR';
  readonly statusCode = 401;
  readonly category = ErrorCategory.AUTHENTICATION;

  constructor(message: string = 'Authentication failed', context?: Record<string, unknown>) {
    super(message, context, false);
  }

  getUserMessage(): string {
    return 'Please log in to access this feature.';
  }
}

export class AuthorizationError extends RAGError {
  readonly code = 'AUTHZ_ERROR';
  readonly statusCode = 403;
  readonly category = ErrorCategory.AUTHORIZATION;

  constructor(message: string = 'Access denied', context?: Record<string, unknown>) {
    super(message, context, false);
  }

  getUserMessage(): string {
    return 'You do not have permission to perform this action.';
  }
}

export class TenantAccessError extends RAGError {
  readonly code = 'TENANT_ACCESS_ERROR';
  readonly statusCode = 403;
  readonly category = ErrorCategory.AUTHORIZATION;

  constructor(tenantId: string, context?: Record<string, unknown>) {
    super(`Access denied to tenant: ${tenantId}`, { tenantId, ...context }, false);
  }

  getUserMessage(): string {
    return 'You do not have access to this organization\'s data.';
  }
}

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

export class ValidationError extends RAGError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly category = ErrorCategory.VALIDATION;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context, false);
  }

  getUserMessage(): string {
    return this.message;
  }
}

export class InvalidQueryError extends ValidationError {
  readonly code = 'INVALID_QUERY';

  constructor(query: string, reason: string, context?: Record<string, unknown>) {
    super(`Invalid query: ${reason}`, { query, reason, ...context });
  }

  getUserMessage(): string {
    return 'Please provide a valid search query.';
  }
}

export class InvalidEmbeddingError extends ValidationError {
  readonly code = 'INVALID_EMBEDDING';

  constructor(dimensions: number, expectedDimensions: number, context?: Record<string, unknown>) {
    super(
      `Invalid embedding dimensions: expected ${expectedDimensions}, got ${dimensions}`,
      { dimensions, expectedDimensions, ...context }
    );
  }

  getUserMessage(): string {
    return 'Invalid embedding format. Please try again.';
  }
}

export class InvalidDocumentError extends ValidationError {
  readonly code = 'INVALID_DOCUMENT';

  constructor(reason: string, context?: Record<string, unknown>) {
    super(`Invalid document: ${reason}`, { reason, ...context });
  }

  getUserMessage(): string {
    return 'The document format is not supported. Please check the file and try again.';
  }
}

// ============================================================================
// DATABASE ERRORS
// ============================================================================

export class DatabaseError extends RAGError {
  readonly code = 'DATABASE_ERROR';
  readonly statusCode = 500;
  readonly category = ErrorCategory.DATABASE;

  constructor(message: string, context?: Record<string, unknown>, retryable: boolean = true) {
    super(message, context, retryable);
  }

  getUserMessage(): string {
    return 'A database error occurred. Please try again later.';
  }
}

export class ConnectionError extends DatabaseError {
  readonly code = 'CONNECTION_ERROR';

  constructor(service: string, context?: Record<string, unknown>) {
    super(`Failed to connect to ${service}`, { service, ...context }, true);
  }

  getUserMessage(): string {
    return 'Unable to connect to the database. Please try again later.';
  }
}

export class QueryError extends DatabaseError {
  readonly code = 'QUERY_ERROR';

  constructor(query: string, error: string, context?: Record<string, unknown>) {
    super(`Query failed: ${error}`, { query, error, ...context }, false);
  }

  getUserMessage(): string {
    return 'A query error occurred. Please check your request and try again.';
  }
}

export class MigrationError extends DatabaseError {
  readonly code = 'MIGRATION_ERROR';

  constructor(migration: string, error: string, context?: Record<string, unknown>) {
    super(`Migration failed: ${error}`, { migration, error, ...context }, false);
  }

  getUserMessage(): string {
    return 'Database migration failed. Please contact support.';
  }
}

// ============================================================================
// EXTERNAL API ERRORS
// ============================================================================

export class ExternalAPIError extends RAGError {
  readonly code = 'EXTERNAL_API_ERROR';
  readonly statusCode = 502;
  readonly category = ErrorCategory.EXTERNAL_API;

  constructor(
    service: string,
    message: string,
    context?: Record<string, unknown>,
    retryable: boolean = true
  ) {
    super(`${service} API error: ${message}`, { service, ...context }, retryable);
  }

  getUserMessage(): string {
    return 'An external service error occurred. Please try again later.';
  }
}

export class OpenAIError extends ExternalAPIError {
  readonly code = 'OPENAI_ERROR';

  constructor(message: string, context?: Record<string, unknown>, retryable: boolean = true) {
    super('OpenAI', message, context, retryable);
  }

  getUserMessage(): string {
    if (this.message.includes('quota') || this.message.includes('billing')) {
      return 'API quota exceeded. Please check your billing settings.';
    }
    if (this.message.includes('rate limit')) {
      return 'Rate limit exceeded. Please wait a moment and try again.';
    }
    return 'AI service temporarily unavailable. Please try again later.';
  }
}

export class SupabaseError extends ExternalAPIError {
  readonly code = 'SUPABASE_ERROR';

  constructor(message: string, context?: Record<string, unknown>, retryable: boolean = true) {
    super('Supabase', message, context, retryable);
  }

  getUserMessage(): string {
    return 'Database service temporarily unavailable. Please try again later.';
  }
}

// ============================================================================
// CONFIGURATION ERRORS
// ============================================================================

export class ConfigurationError extends RAGError {
  readonly code = 'CONFIG_ERROR';
  readonly statusCode = 500;
  readonly category = ErrorCategory.CONFIGURATION;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context, false);
  }

  getUserMessage(): string {
    return 'System configuration error. Please contact support.';
  }
}

export class MissingEnvironmentVariableError extends ConfigurationError {
  readonly code = 'MISSING_ENV_VAR';

  constructor(variable: string, context?: Record<string, unknown>) {
    super(`Missing required environment variable: ${variable}`, { variable, ...context });
  }

  getUserMessage(): string {
    return 'System configuration incomplete. Please contact support.';
  }
}

// ============================================================================
// PROCESSING ERRORS
// ============================================================================

export class ProcessingError extends RAGError {
  readonly code = 'PROCESSING_ERROR';
  readonly statusCode = 500;
  readonly category = ErrorCategory.PROCESSING;

  constructor(message: string, context?: Record<string, unknown>, retryable: boolean = true) {
    super(message, context, retryable);
  }

  getUserMessage(): string {
    return 'Processing error occurred. Please try again.';
  }
}

export class EmbeddingGenerationError extends ProcessingError {
  readonly code = 'EMBEDDING_GENERATION_ERROR';

  constructor(text: string, error: string, context?: Record<string, unknown>) {
    super(`Failed to generate embedding: ${error}`, { text: text.substring(0, 100), error, ...context }, true);
  }

  getUserMessage(): string {
    return 'Failed to process your request. Please try again.';
  }
}

export class DocumentProcessingError extends ProcessingError {
  readonly code = 'DOCUMENT_PROCESSING_ERROR';

  constructor(documentId: string, error: string, context?: Record<string, unknown>) {
    super(`Failed to process document: ${error}`, { documentId, error, ...context }, true);
  }

  getUserMessage(): string {
    return 'Failed to process the document. Please check the format and try again.';
  }
}

export class VectorSearchError extends ProcessingError {
  readonly code = 'VECTOR_SEARCH_ERROR';

  constructor(query: string, error: string, context?: Record<string, unknown>) {
    super(`Vector search failed: ${error}`, { query: query.substring(0, 100), error, ...context }, true);
  }

  getUserMessage(): string {
    return 'Search temporarily unavailable. Please try again later.';
  }
}

// ============================================================================
// RATE LIMITING & QUOTA ERRORS
// ============================================================================

export class RateLimitError extends RAGError {
  readonly code = 'RATE_LIMIT_ERROR';
  readonly statusCode = 429;
  readonly category = ErrorCategory.RATE_LIMIT;

  constructor(limit: number, window: string, context?: Record<string, unknown>) {
    super(`Rate limit exceeded: ${limit} requests per ${window}`, { limit, window, ...context }, true);
  }

  getUserMessage(): string {
    return 'Too many requests. Please wait a moment and try again.';
  }
}

export class QuotaExceededError extends RAGError {
  readonly code = 'QUOTA_EXCEEDED_ERROR';
  readonly statusCode = 429;
  readonly category = ErrorCategory.QUOTA_EXCEEDED;

  constructor(resource: string, limit: number, context?: Record<string, unknown>) {
    super(`Quota exceeded for ${resource}: ${limit}`, { resource, limit, ...context }, false);
  }

  getUserMessage(): string {
    return 'Usage quota exceeded. Please upgrade your plan or contact support.';
  }
}

// ============================================================================
// NETWORK & TIMEOUT ERRORS
// ============================================================================

export class NetworkError extends RAGError {
  readonly code = 'NETWORK_ERROR';
  readonly statusCode = 503;
  readonly category = ErrorCategory.NETWORK;

  constructor(service: string, context?: Record<string, unknown>) {
    super(`Network error connecting to ${service}`, { service, ...context }, true);
  }

  getUserMessage(): string {
    return 'Network error. Please check your connection and try again.';
  }
}

export class TimeoutError extends RAGError {
  readonly code = 'TIMEOUT_ERROR';
  readonly statusCode = 504;
  readonly category = ErrorCategory.TIMEOUT;

  constructor(operation: string, timeout: number, context?: Record<string, unknown>) {
    super(`Operation timed out: ${operation} (${timeout}ms)`, { operation, timeout, ...context }, true);
  }

  getUserMessage(): string {
    return 'Request timed out. Please try again.';
  }
}

// ============================================================================
// UNKNOWN ERRORS
// ============================================================================

export class UnknownError extends RAGError {
  readonly code = 'UNKNOWN_ERROR';
  readonly statusCode = 500;
  readonly category = ErrorCategory.UNKNOWN;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context, false);
  }

  getUserMessage(): string {
    return 'An unexpected error occurred. Please try again or contact support.';
  }
}

// ============================================================================
// ERROR FACTORY & UTILITIES
// ============================================================================

/**
 * Error factory for creating typed errors
 */
export class RAGErrorFactory {
  /**
   * Create error from unknown error
   */
  static fromUnknown(error: unknown, context?: Record<string, unknown>): RAGError {
    if (error instanceof RAGError) {
      return error;
    }

    if (error instanceof Error) {
      return new UnknownError(error.message, { originalError: error.name, ...context });
    }

    return new UnknownError('Unknown error occurred', { originalError: String(error), ...context });
  }

  /**
   * Create error from Supabase error
   */
  static fromSupabaseError(error: any, context?: Record<string, unknown>): RAGError {
    if (error?.code === 'PGRST301') {
      return new AuthenticationError('Invalid authentication token', context);
    }
    
    if (error?.code === 'PGRST301') {
      return new AuthorizationError('Insufficient permissions', context);
    }

    if (error?.code?.startsWith('PGRST')) {
      return new SupabaseError(error.message, { supabaseCode: error.code, ...context });
    }

    return new DatabaseError(error?.message || 'Database error', context);
  }

  /**
   * Create error from OpenAI error
   */
  static fromOpenAIError(error: any, context?: Record<string, unknown>): RAGError {
    if (error?.status === 401) {
      return new AuthenticationError('Invalid OpenAI API key', context);
    }

    if (error?.status === 429) {
      if (error?.type === 'insufficient_quota') {
        return new QuotaExceededError('OpenAI API', 0, context);
      }
      return new RateLimitError(0, 'minute', context);
    }

    if (error?.status === 500) {
      return new OpenAIError('Internal server error', context, true);
    }

    return new OpenAIError(error?.message || 'OpenAI API error', context);
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: RAGError): boolean {
  return error.retryable;
}

/**
 * Get error category
 */
export function getErrorCategory(error: RAGError): ErrorCategory {
  return error.category;
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: RAGError): string {
  return JSON.stringify(error.toJSON(), null, 2);
}
