/**
 * Mode 1 Error Handler
 * 
 * Provides structured error handling with error codes, retry logic,
 * and user-friendly error messages
 */

export enum Mode1ErrorCode {
  // Agent Errors
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  AGENT_INACTIVE = 'AGENT_INACTIVE',
  AGENT_CONFIG_INVALID = 'AGENT_CONFIG_INVALID',
  
  // LLM Errors
  LLM_TIMEOUT = 'LLM_TIMEOUT',
  LLM_RATE_LIMIT = 'LLM_RATE_LIMIT',
  LLM_API_ERROR = 'LLM_API_ERROR',
  LLM_INVALID_RESPONSE = 'LLM_INVALID_RESPONSE',
  
  // RAG Errors
  RAG_TIMEOUT = 'RAG_TIMEOUT',
  RAG_SERVICE_UNAVAILABLE = 'RAG_SERVICE_UNAVAILABLE',
  RAG_NO_RESULTS = 'RAG_NO_RESULTS',
  RAG_INVALID_QUERY = 'RAG_INVALID_QUERY',
  
  // Tool Errors
  TOOL_EXECUTION_FAILED = 'TOOL_EXECUTION_FAILED',
  TOOL_NOT_FOUND = 'TOOL_NOT_FOUND',
  TOOL_TIMEOUT = 'TOOL_TIMEOUT',
  TOOL_INVALID_INPUT = 'TOOL_INVALID_INPUT',
  
  // Database Errors
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',
  
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
  
  // Configuration Errors
  MISSING_ENV_VARIABLE = 'MISSING_ENV_VARIABLE',
  INVALID_CONFIG = 'INVALID_CONFIG',
  
  // Generic Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export interface Mode1Error extends Error {
  code: Mode1ErrorCode;
  statusCode?: number;
  retryable: boolean;
  userMessage: string;
  metadata?: Record<string, any>;
}

export class Mode1ErrorHandler {
  /**
   * Create structured error from any error
   */
  static createError(
    error: unknown,
    context?: { agentId?: string; operation?: string }
  ): Mode1Error {
    // Handle known error types
    if (error instanceof Error) {
      return this.mapErrorToMode1Error(error, context);
    }

    // Handle unknown errors
    const mode1Error = new Error(String(error)) as Mode1Error;
    mode1Error.code = Mode1ErrorCode.UNKNOWN_ERROR;
    mode1Error.statusCode = 500;
    mode1Error.retryable = false;
    mode1Error.userMessage = 'An unexpected error occurred. Please try again or contact support if the issue persists.';
    mode1Error.metadata = { originalError: String(error), ...context };

    return mode1Error;
  }

  /**
   * Map common errors to Mode1Error with appropriate codes and messages
   */
  private static mapErrorToMode1Error(
    error: Error,
    context?: { agentId?: string; operation?: string }
  ): Mode1Error {
    const mode1Error = error as Mode1Error;

    // Check for timeout errors
    if (error.name === 'TimeoutError' || error.message.includes('timeout') || error.message.includes('timed out')) {
      mode1Error.code = this.determineTimeoutErrorCode(context?.operation);
      mode1Error.statusCode = 408;
      mode1Error.retryable = true;
      mode1Error.userMessage = this.getTimeoutUserMessage(context?.operation);
      mode1Error.metadata = { ...context, errorType: 'timeout' };
      return mode1Error;
    }

    // Check for rate limit errors
    if (error.message.includes('rate limit') || error.message.includes('429') || error.message.includes('too many requests')) {
      mode1Error.code = Mode1ErrorCode.LLM_RATE_LIMIT;
      mode1Error.statusCode = 429;
      mode1Error.retryable = true;
      mode1Error.userMessage = 'The service is currently experiencing high demand. Please wait a moment and try again.';
      mode1Error.metadata = { ...context, errorType: 'rate_limit' };
      return mode1Error;
    }

    // Check for network errors
    if (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND')
    ) {
      mode1Error.code = Mode1ErrorCode.NETWORK_ERROR;
      mode1Error.statusCode = 503;
      mode1Error.retryable = true;
      mode1Error.userMessage = 'Network connection issue. Please check your internet connection and try again.';
      mode1Error.metadata = { ...context, errorType: 'network' };
      return mode1Error;
    }

    // Check for database errors
    if (error.message.includes('database') || error.message.includes('Supabase') || error.message.includes('PostgreSQL')) {
      mode1Error.code = Mode1ErrorCode.DATABASE_CONNECTION_ERROR;
      mode1Error.statusCode = 503;
      mode1Error.retryable = true;
      mode1Error.userMessage = 'Database service is temporarily unavailable. Please try again in a moment.';
      mode1Error.metadata = { ...context, errorType: 'database' };
      return mode1Error;
    }

    // Check for agent not found
    if (error.message.includes('not found') && context?.agentId) {
      mode1Error.code = Mode1ErrorCode.AGENT_NOT_FOUND;
      mode1Error.statusCode = 404;
      mode1Error.retryable = false;
      mode1Error.userMessage = `The requested expert agent could not be found. Please verify the agent ID or select a different agent.`;
      mode1Error.metadata = { ...context, errorType: 'agent_not_found' };
      return mode1Error;
    }

    // Default error handling
    mode1Error.code = Mode1ErrorCode.UNKNOWN_ERROR;
    mode1Error.statusCode = 500;
    mode1Error.retryable = false;
    mode1Error.userMessage = 'An unexpected error occurred. Please try again or contact support if the issue persists.';
    mode1Error.metadata = { ...context, errorType: 'unknown', originalMessage: error.message };

    return mode1Error;
  }

  /**
   * Determine timeout error code based on operation
   */
  private static determineTimeoutErrorCode(operation?: string): Mode1ErrorCode {
    if (operation?.includes('rag') || operation?.includes('RAG')) {
      return Mode1ErrorCode.RAG_TIMEOUT;
    }
    if (operation?.includes('tool') || operation?.includes('Tool')) {
      return Mode1ErrorCode.TOOL_TIMEOUT;
    }
    if (operation?.includes('llm') || operation?.includes('LLM')) {
      return Mode1ErrorCode.LLM_TIMEOUT;
    }
    return Mode1ErrorCode.REQUEST_TIMEOUT;
  }

  /**
   * Get user-friendly timeout message
   */
  private static getTimeoutUserMessage(operation?: string): string {
    if (operation?.includes('rag') || operation?.includes('RAG')) {
      return 'The knowledge base search is taking longer than expected. Please try again with a more specific query.';
    }
    if (operation?.includes('tool') || operation?.includes('Tool')) {
      return 'Tool execution is taking longer than expected. Please try again with a simpler request.';
    }
    return 'The request is taking longer than expected. Please try again or contact support if the issue persists.';
  }

  /**
   * Format error for user display
   */
  static formatUserMessage(error: Mode1Error): string {
    return error.userMessage || 'An error occurred. Please try again.';
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: Mode1Error): boolean {
    return error.retryable !== false;
  }

  /**
   * Log error with context
   */
  static logError(error: Mode1Error, context?: Record<string, any>): void {
    console.error('❌ [Mode 1 Error]', {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      statusCode: error.statusCode,
      retryable: error.retryable,
      metadata: { ...error.metadata, ...context },
      stack: error.stack,
    });
  }
}

/**
 * Retry utility with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    retryableErrors?: Mode1ErrorCode[];
    onRetry?: (attempt: number, error: Mode1Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    retryableErrors = [],
    onRetry,
  } = options;

  let lastError: Mode1Error;
  let delay = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const mode1Error = Mode1ErrorHandler.createError(error);

      // Don't retry if error is not retryable
      if (!Mode1ErrorHandler.isRetryable(mode1Error)) {
        throw mode1Error;
      }

      // Check if error code is in retryable list (if specified)
      if (retryableErrors.length > 0 && !retryableErrors.includes(mode1Error.code)) {
        throw mode1Error;
      }

      lastError = mode1Error;

      // Don't retry on last attempt
      if (attempt < maxRetries) {
        onRetry?.(attempt + 1, mode1Error);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, maxDelayMs); // Exponential backoff
      }
    }
  }

  throw lastError!;
}

