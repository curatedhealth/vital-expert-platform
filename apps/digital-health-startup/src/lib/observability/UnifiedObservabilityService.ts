/**
 * Unified Observability Service
 * Integrates Sentry, Prometheus, LangFuse, and Analytics for complete visibility
 * 
 * This service provides a single interface for:
 * - Error tracking (Sentry)
 * - Metrics collection (Prometheus)
 * - LLM tracing (LangFuse)
 * - Analytics (TimescaleDB)
 */

import * as Sentry from '@sentry/nextjs';
import { Langfuse } from 'langfuse';
import { getAnalyticsService } from '../analytics/UnifiedAnalyticsService';
import {
  recordHttpRequest,
  recordLLMRequest,
  recordAgentExecution,
  recordUserQuery,
  recordRateLimitHit,
} from '@/app/api/metrics/route';

// ============================================================================
// Configuration
// ============================================================================

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const LANGFUSE_PUBLIC_KEY = process.env.LANGFUSE_PUBLIC_KEY;
const LANGFUSE_SECRET_KEY = process.env.LANGFUSE_SECRET_KEY;
const LANGFUSE_HOST = process.env.LANGFUSE_HOST || 'http://localhost:3002';

// Initialize LangFuse
const langfuse = new Langfuse({
  publicKey: LANGFUSE_PUBLIC_KEY,
  secretKey: LANGFUSE_SECRET_KEY,
  baseUrl: LANGFUSE_HOST,
});

// ============================================================================
// Types
// ============================================================================

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  agentId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

interface HTTPRequestContext {
  method: string;
  route: string;
  status: number;
  duration: number;
  userId?: string;
  requestId?: string;
  error?: Error;
}

interface LLMCallContext {
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  duration: number;
  agentId?: string;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  quality?: number;
  error?: Error;
}

interface AgentExecutionContext {
  agentId: string;
  agentType: string;
  success: boolean;
  duration: number;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  errorType?: string;
  errorMessage?: string;
  qualityScore?: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// Unified Observability Service
// ============================================================================

export class UnifiedObservabilityService {
  private analytics = getAnalyticsService();
  private environment = process.env.NODE_ENV || 'development';

  /**
   * Track HTTP request with all observability tools
   */
  async trackHttpRequest(context: HTTPRequestContext): Promise<void> {
    const { method, route, status, duration, userId, requestId, error } = context;

    try {
      // 1. Prometheus metrics
      recordHttpRequest(method, route, status, duration);

      // 2. Sentry (for errors)
      if (error) {
        Sentry.captureException(error, {
          tags: {
            method,
            route,
            status: status.toString(),
            environment: this.environment,
          },
          contexts: {
            request: {
              method,
              url: route,
              id: requestId,
            },
          },
          user: userId ? { id: userId } : undefined,
          level: status >= 500 ? 'error' : 'warning',
        });
      }

      // 3. Analytics (for all requests)
      if (userId) {
        await this.analytics.trackEvent({
          tenant_id: process.env.NEXT_PUBLIC_TENANT_ID || 'default',
          user_id: userId,
          session_id: requestId,
          event_type: 'http_request',
          event_category: 'system_health', // Changed from 'api' to match enum
          event_data: {
            method,
            route,
            status,
            duration_ms: Math.round(duration * 1000),
            success: status < 400,
          },
          source: 'api',
        });
      }
    } catch (err) {
      console.error('Error tracking HTTP request:', err);
    }
  }

  /**
   * Track LLM call with distributed tracing
   */
  async trackLLMCall(context: LLMCallContext): Promise<string | undefined> {
    const {
      model,
      provider,
      promptTokens,
      completionTokens,
      totalTokens,
      costUsd,
      duration,
      agentId,
      userId,
      sessionId,
      traceId,
      quality,
      error,
    } = context;

    try {
      // 1. Create LangFuse trace
      const trace = langfuse.trace({
        id: traceId,
        name: `${provider}-${model}`,
        userId,
        sessionId,
        metadata: {
          agentId,
          model,
          provider,
        },
      });

      // 2. Record generation in LangFuse
      const generation = trace.generation({
        name: model,
        model,
        modelParameters: {
          provider,
        },
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
        },
        metadata: {
          costUsd,
          quality,
          duration,
        },
      });

      if (error) {
        generation.update({
          level: 'ERROR',
          statusMessage: error.message,
        });
      }

      // 3. Prometheus metrics
      recordLLMRequest({
        model,
        provider,
        agentId: agentId || 'unknown',
        promptTokens,
        completionTokens,
        costUsd,
        durationSeconds: duration,
      });

      // 4. Sentry (for errors)
      if (error) {
        Sentry.captureException(error, {
          tags: {
            model,
            provider,
            agentId: agentId || 'unknown',
            environment: this.environment,
          },
          contexts: {
            llm: {
              model,
              provider,
              tokens: totalTokens,
              cost: costUsd,
            },
          },
          user: userId ? { id: userId } : undefined,
          level: 'error',
        });
      }

      // 5. Analytics
      if (userId) {
        await this.analytics.trackLLMUsage({
          tenant_id: process.env.NEXT_PUBLIC_TENANT_ID || 'default',
          user_id: userId,
          session_id: sessionId,
          model,
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          agent_id: agentId,
        });
      }

      // Flush LangFuse
      await langfuse.flushAsync();

      return trace.id;
    } catch (err) {
      console.error('Error tracking LLM call:', err);
      Sentry.captureException(err, {
        tags: { component: 'observability', operation: 'trackLLMCall' },
      });
      return undefined;
    }
  }

  /**
   * Track agent execution with full context
   */
  async trackAgentExecution(context: AgentExecutionContext): Promise<void> {
    const {
      agentId,
      agentType,
      success,
      duration,
      userId,
      sessionId,
      traceId,
      errorType,
      errorMessage,
      qualityScore,
      metadata,
    } = context;

    try {
      // 1. LangFuse span
      if (traceId) {
        const trace = langfuse.trace({ id: traceId });
        trace.span({
          name: `agent-${agentType}`,
          metadata: {
            agentId,
            success,
            duration,
            qualityScore,
            ...metadata,
          },
        });
      }

      // 2. Prometheus metrics
      recordAgentExecution({
        agentId,
        agentType,
        success,
        durationSeconds: duration,
        errorType,
        qualityScore,
      });

      // 3. Sentry (for failures)
      if (!success && errorMessage) {
        Sentry.captureMessage(`Agent execution failed: ${errorMessage}`, {
          level: 'error',
          tags: {
            agentId,
            agentType,
            errorType: errorType || 'unknown',
            environment: this.environment,
          },
          contexts: {
            agent: {
              id: agentId,
              type: agentType,
              duration,
              qualityScore,
            },
          },
          user: userId ? { id: userId } : undefined,
        });
      }

      // 4. Analytics
      if (userId) {
        await this.analytics.trackAgentExecution({
          tenant_id: process.env.NEXT_PUBLIC_TENANT_ID || 'default',
          user_id: userId,
          session_id: sessionId,
          agent_id: agentId,
          agent_type: agentType,
          execution_time_ms: Math.round(duration * 1000),
          success,
          error_type: errorType,
          error_message: errorMessage,
          metadata: {
            qualityScore,
            ...metadata,
          },
        });
      }

      await langfuse.flushAsync();
    } catch (err) {
      console.error('Error tracking agent execution:', err);
      Sentry.captureException(err, {
        tags: { component: 'observability', operation: 'trackAgentExecution' },
      });
    }
  }

  /**
   * Track error with full context and correlation
   */
  trackError(error: Error, context: ErrorContext): void {
    const { userId, sessionId, agentId, requestId, metadata } = context;

    // Enrich error with context
    Sentry.captureException(error, {
      tags: {
        agentId: agentId || 'none',
        environment: this.environment,
        ...metadata?.tags,
      },
      contexts: {
        session: {
          id: sessionId,
          requestId,
        },
        ...metadata?.contexts,
      },
      user: userId ? { id: userId } : undefined,
      level: 'error',
      extra: metadata,
    });
  }

  /**
   * Create distributed trace context
   */
  createTraceContext(
    name: string,
    userId?: string,
    sessionId?: string
  ): { traceId: string; spanId: string } {
    const trace = langfuse.trace({
      name,
      userId,
      sessionId,
    });

    return {
      traceId: trace.id,
      spanId: trace.id, // For simplicity, using same ID
    };
  }

  /**
   * Track user query with correlation
   */
  async trackUserQuery(
    query: string,
    userId: string,
    sessionId: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      // Create trace
      const { traceId } = this.createTraceContext('user_query', userId, sessionId);

      // Track in analytics
      await this.analytics.trackEvent({
        tenant_id: process.env.NEXT_PUBLIC_TENANT_ID || 'default',
        user_id: userId,
        session_id: sessionId,
        event_type: 'query_submitted',
        event_category: 'user_behavior',
        event_data: {
          query,
          query_length: query.length,
          ...metadata,
        },
        source: 'app',
      });

      // Track in Prometheus
      recordUserQuery(userId, 'ask_expert');

      return traceId;
    } catch (err) {
      console.error('Error tracking user query:', err);
      Sentry.captureException(err, {
        tags: { component: 'observability', operation: 'trackUserQuery' },
      });
      throw err;
    }
  }

  /**
   * Set user context across all tools
   */
  setUser(userId: string, email?: string, username?: string): void {
    // Sentry
    Sentry.setUser({ id: userId, email, username });

    // LangFuse (per-trace, handled in trackLLMCall)
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    Sentry.setUser(null);
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
    Sentry.addBreadcrumb({
      message,
      category,
      level: 'info',
      data,
    });
  }

  /**
   * Track performance with transaction
   */
  startTransaction(name: string, operation: string) {
    // Note: Sentry.startTransaction is deprecated in newer versions
    // Use Sentry.startSpan instead or set up performance monitoring
    // For now, returning a mock for compatibility
    return {
      finish: () => {},
      setStatus: (status: string) => {},
      setTag: (key: string, value: any) => {},
    };
  }

  /**
   * Flush all observability data
   */
  async flush(): Promise<void> {
    try {
      await Promise.all([
        Sentry.flush(2000),
        langfuse.flushAsync(),
        this.analytics.flush(),
      ]);
    } catch (err) {
      console.error('Error flushing observability data:', err);
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let observabilityInstance: UnifiedObservabilityService | null = null;

export function getObservabilityService(): UnifiedObservabilityService {
  if (!observabilityInstance) {
    observabilityInstance = new UnifiedObservabilityService();
  }
  return observabilityInstance;
}

// ============================================================================
// Middleware Helper
// ============================================================================

export interface ObservabilityMiddlewareOptions {
  userId?: string;
  sessionId?: string;
  agentId?: string;
  includeBreadcrumbs?: boolean;
}

/**
 * Express/Next.js middleware for automatic observability
 */
export function withObservability<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  options: ObservabilityMiddlewareOptions = {}
): T {
  return (async (...args: any[]) => {
    const observability = getObservabilityService();
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Set user context if provided
    if (options.userId) {
      observability.setUser(options.userId);
    }

    // Add breadcrumb
    if (options.includeBreadcrumbs) {
      observability.addBreadcrumb('Request started', 'http', {
        requestId,
        ...options,
      });
    }

    try {
      const result = await handler(...args);
      const duration = (Date.now() - startTime) / 1000;

      // Track successful request
      await observability.trackHttpRequest({
        method: args[0]?.method || 'UNKNOWN',
        route: args[0]?.url || 'UNKNOWN',
        status: 200,
        duration,
        userId: options.userId,
        requestId,
      });

      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;

      // Track failed request
      await observability.trackHttpRequest({
        method: args[0]?.method || 'UNKNOWN',
        route: args[0]?.url || 'UNKNOWN',
        status: 500,
        duration,
        userId: options.userId,
        requestId,
        error: error as Error,
      });

      // Track error with context
      observability.trackError(error as Error, {
        userId: options.userId,
        sessionId: options.sessionId,
        agentId: options.agentId,
        requestId,
      });

      throw error;
    }
  }) as T;
}

