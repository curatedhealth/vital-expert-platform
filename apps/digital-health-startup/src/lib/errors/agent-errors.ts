/**
 * Custom Error Classes for Agent Operations
 * 
 * Provides typed, structured errors for better error handling and observability
 */

export interface ErrorContext {
  [key: string]: any;
}

/**
 * Base class for all agent-related errors
 */
export abstract class AgentError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  readonly context?: ErrorContext;
  readonly timestamp: string;

  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: ErrorContext;
    }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    this.context = options?.context;

    // Maintain proper stack trace
    if (options?.cause) {
      this.cause = options.cause;
    }

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
      cause: this.cause instanceof Error
        ? {
            name: this.cause.name,
            message: this.cause.message,
            stack: this.cause.stack,
          }
        : this.cause,
    };
  }
}

/**
 * Agent not found error
 */
export class AgentNotFoundError extends AgentError {
  readonly code = 'AGENT_NOT_FOUND';
  readonly statusCode = 404;

  constructor(agentId: string, context?: ErrorContext) {
    super(`Agent not found: ${agentId}`, { context: { agentId, ...context } });
  }
}

/**
 * Agent selection error (search/ranking failed)
 */
export class AgentSelectionError extends AgentError {
  readonly code = 'AGENT_SELECTION_FAILED';
  readonly statusCode = 500;

  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: ErrorContext;
    }
  ) {
    super(`Agent selection failed: ${message}`, options);
  }
}

/**
 * Pinecone connection/query error
 */
export class PineconeConnectionError extends AgentError {
  readonly code = 'PINECONE_CONNECTION_FAILED';
  readonly statusCode = 503;

  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: ErrorContext;
    }
  ) {
    super(`Pinecone connection failed: ${message}`, options);
  }
}

/**
 * GraphRAG search error
 */
export class GraphRAGSearchError extends AgentError {
  readonly code = 'GRAPHRAG_SEARCH_FAILED';
  readonly statusCode = 500;

  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: ErrorContext;
    }
  ) {
    super(`GraphRAG search failed: ${message}`, options);
  }
}

/**
 * User agent migration error
 */
export class UserAgentMigrationError extends AgentError {
  readonly code = 'MIGRATION_FAILED';
  readonly statusCode = 500;

  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: ErrorContext;
    }
  ) {
    super(`User agent migration failed: ${message}`, options);
  }
}

/**
 * Agent validation error
 */
export class AgentValidationError extends AgentError {
  readonly code = 'AGENT_VALIDATION_FAILED';
  readonly statusCode = 400;

  constructor(
    message: string,
    validationErrors?: Record<string, string[]>,
    context?: ErrorContext
  ) {
    super(`Agent validation failed: ${message}`, {
      context: {
        validationErrors,
        ...context,
      },
    });
  }
}

/**
 * User agent operation error (add/remove failed)
 */
export class UserAgentOperationError extends AgentError {
  readonly code = 'USER_AGENT_OPERATION_FAILED';
  readonly statusCode = 500;

  constructor(
    operation: string,
    message: string,
    options?: {
      cause?: Error;
      context?: ErrorContext;
    }
  ) {
    super(`User agent ${operation} failed: ${message}`, {
      ...options,
      context: {
        operation,
        ...options?.context,
      },
    });
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AgentError {
  readonly code = 'RATE_LIMIT_EXCEEDED';
  readonly statusCode = 429;

  constructor(
    message: string = 'Rate limit exceeded',
    context?: ErrorContext
  ) {
    super(message, { context });
  }
}

/**
 * Database connection error
 */
export class DatabaseConnectionError extends AgentError {
  readonly code = 'DATABASE_CONNECTION_FAILED';
  readonly statusCode = 503;

  constructor(
    message: string,
    options?: {
      cause?: Error;
      context?: ErrorContext;
    }
  ) {
    super(`Database connection failed: ${message}`, options);
  }
}

/**
 * Helper to determine if error is an AgentError
 */
export function isAgentError(error: unknown): error is AgentError {
  return error instanceof AgentError;
}

/**
 * Helper to get status code from error
 */
export function getErrorStatusCode(error: unknown): number {
  if (isAgentError(error)) {
    return error.statusCode;
  }
  if (error instanceof Error && 'statusCode' in error) {
    return (error as any).statusCode;
  }
  return 500;
}

/**
 * Helper to serialize error for API response
 */
export function serializeError(error: unknown): {
  error: string;
  code?: string;
  message: string;
  details?: any;
} {
  if (isAgentError(error)) {
    return {
      error: error.name,
      code: error.code,
      message: error.message,
      details: error.context,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.name,
      message: error.message,
    };
  }

  return {
    error: 'UnknownError',
    message: String(error),
  };
}
