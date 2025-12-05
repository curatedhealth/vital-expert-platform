/**
 * Supabase Connection Helper
 * Provides retry logic and better error handling for database connections
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
}

export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

/**
 * Execute a Supabase query with automatic retry logic
 * Handles transient SSL/connection errors gracefully
 */
export async function executeWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: RetryOptions = {}
): Promise<QueryResult<T>> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
  } = options;

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const result = await queryFn();

      if (result.error) {
        // Check if error is retryable
        if (isRetryableError(result.error) && attempt < maxRetries) {
          lastError = normalizeError(result.error);
          attempt++;

          const delay = exponentialBackoff
            ? retryDelay * Math.pow(2, attempt - 1)
            : retryDelay;

          console.warn(
            `[Supabase] Retryable error on attempt ${attempt}/${maxRetries}. Retrying in ${delay}ms...`,
            { error: result.error.message }
          );

          await sleep(delay);
          continue;
        }

        // Non-retryable error or max retries reached
        return {
          data: null,
          error: normalizeError(result.error),
          success: false,
        };
      }

      // Success
      return {
        data: result.data,
        error: null,
        success: true,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (isRetryableError(error) && attempt < maxRetries) {
        attempt++;

        const delay = exponentialBackoff
          ? retryDelay * Math.pow(2, attempt - 1)
          : retryDelay;

        console.warn(
          `[Supabase] Connection error on attempt ${attempt}/${maxRetries}. Retrying in ${delay}ms...`,
          { error: lastError.message }
        );

        await sleep(delay);
        continue;
      }

      // Non-retryable error or max retries reached
      return {
        data: null,
        error: lastError,
        success: false,
      };
    }
  }

  return {
    data: null,
    error: lastError || new Error('Max retries exceeded'),
    success: false,
  };
}

/**
 * Check if an error is retryable (transient connection/SSL issues)
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';

  // SSL/TLS errors
  if (
    errorMessage.includes('ssl') ||
    errorMessage.includes('tls') ||
    errorMessage.includes('certificate') ||
    errorMessage.includes('econnreset') ||
    errorMessage.includes('econnrefused') ||
    errorMessage.includes('etimedout') ||
    errorMessage.includes('socket hang up') ||
    errorMessage.includes('network error')
  ) {
    return true;
  }

  // Connection errors
  if (
    errorCode === 'econnreset' ||
    errorCode === 'econnrefused' ||
    errorCode === 'etimedout' ||
    errorCode === 'epipe'
  ) {
    return true;
  }

  // Supabase-specific transient errors
  if (
    errorCode === '57p03' || // database is starting up
    errorCode === '53300' || // too many connections
    errorMessage.includes('connection timeout') ||
    errorMessage.includes('connection closed')
  ) {
    return true;
  }

  return false;
}

/**
 * Normalize various error formats to a standard Error object
 */
function normalizeError(error: any): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const message = error.message || error.error || JSON.stringify(error);
    const err = new Error(message);
    if (error.code) {
      (err as any).code = error.code;
    }
    if (error.details) {
      (err as any).details = error.details;
    }
    return err;
  }

  return new Error(String(error));
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Test database connectivity
 * Useful for health checks and debugging
 */
export async function testConnection(
  supabase: SupabaseClient
): Promise<{ connected: boolean; error?: string; latency?: number }> {
  const startTime = Date.now();

  try {
    const result = await executeWithRetry(
      () => supabase.from('agents').select('id').limit(1),
      { maxRetries: 1, retryDelay: 500 }
    );

    const latency = Date.now() - startTime;

    if (result.success) {
      return { connected: true, latency };
    }

    return {
      connected: false,
      error: result.error?.message || 'Unknown error',
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
      latency: Date.now() - startTime,
    };
  }
}

/**
 * Wrapper for common Supabase query patterns with automatic retry
 */
export class SupabaseQueryHelper {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Select query with retry
   */
  async select<T>(
    table: string,
    options: {
      columns?: string;
      filters?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
      single?: boolean;
    } = {}
  ): Promise<QueryResult<T>> {
    return executeWithRetry(async () => {
      let query = this.supabase
        .from(table)
        .select(options.columns || '*');

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (options.order) {
        query = query.order(options.order.column, {
          ascending: options.order.ascending ?? true,
        });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Execute query
      if (options.single) {
        return await query.single();
      }

      return await query;
    });
  }

  /**
   * Insert query with retry
   */
  async insert<T>(
    table: string,
    data: any | any[]
  ): Promise<QueryResult<T>> {
    return executeWithRetry(() =>
      this.supabase.from(table).insert(data).select()
    );
  }

  /**
   * Update query with retry
   */
  async update<T>(
    table: string,
    data: any,
    filters: Record<string, any>
  ): Promise<QueryResult<T>> {
    return executeWithRetry(async () => {
      let query = this.supabase.from(table).update(data);

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      return await query.select();
    });
  }

  /**
   * Delete query with retry
   */
  async delete(
    table: string,
    filters: Record<string, any>
  ): Promise<QueryResult<null>> {
    return executeWithRetry(async () => {
      let query = this.supabase.from(table).delete();

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      return await query;
    });
  }
}
