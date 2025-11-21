/**
 * API Analytics Middleware
 * 
 * Automatically tracks all API requests and responses for monitoring and debugging.
 * 
 * Features:
 * - Automatic request/response tracking
 * - Error tracking with stack traces
 * - Response time monitoring
 * - Rate limit detection
 * - IP and user agent tracking
 * 
 * Usage: Import and wrap your API handlers with this middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsService } from '@/lib/analytics/UnifiedAnalyticsService';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

/**
 * Wrap an API route handler with analytics tracking
 * 
 * @example
 * export const POST = withAnalytics(async (request: NextRequest) => {
 *   // Your API logic here
 *   return NextResponse.json({ success: true });
 * });
 */
export function withAnalytics(
  handler: (request: NextRequest) => Promise<Response>,
  options: {
    routeName?: string;
    trackBody?: boolean;
  } = {}
) {
  return async (request: NextRequest): Promise<Response> => {
    const analytics = getAnalyticsService();
    const startTime = Date.now();
    
    // Extract request metadata
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;
    const userId = request.headers.get('x-user-id') || request.headers.get('authorization') || 'anonymous';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Track API request
    await analytics.trackEvent({
      tenant_id: STARTUP_TENANT_ID,
      user_id: userId,
      event_type: 'api_request',
      event_category: 'system_health',
      event_data: {
        endpoint: options.routeName || pathname,
        method,
        query_params: Object.fromEntries(url.searchParams),
      },
      ip_address: ip,
      user_agent: userAgent,
    });

    try {
      // Execute the actual API handler
      const response = await handler(request);
      
      const responseTime = Date.now() - startTime;
      
      // Track API response
      await analytics.trackEvent({
        tenant_id: STARTUP_TENANT_ID,
        user_id: userId,
        event_type: 'api_response',
        event_category: 'system_health',
        event_data: {
          endpoint: options.routeName || pathname,
          method,
          status: response.status,
          response_time_ms: responseTime,
          success: response.status < 400,
        },
        ip_address: ip,
        user_agent: userAgent,
      });

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Track API error
      await analytics.trackEvent({
        tenant_id: STARTUP_TENANT_ID,
        user_id: userId,
        event_type: 'api_error',
        event_category: 'system_health',
        event_data: {
          endpoint: options.routeName || pathname,
          method,
          error: error instanceof Error ? error.message : 'Unknown error',
          error_type: error instanceof Error ? error.name : 'UnknownError',
          response_time_ms: responseTime,
        },
        ip_address: ip,
        user_agent: userAgent,
      });

      throw error;
    }
  };
}

/**
 * Track authentication events
 */
export async function trackAuthEvent(
  eventType: 'login' | 'logout' | 'signup' | 'auth_failure',
  userId: string,
  metadata?: Record<string, any>
) {
  const analytics = getAnalyticsService();
  
  await analytics.trackEvent({
    tenant_id: STARTUP_TENANT_ID,
    user_id: userId,
    event_type: eventType,
    event_category: 'user_behavior',
    event_data: metadata || {},
  });
}

/**
 * Track workflow events
 */
export async function trackWorkflowEvent(
  workflowId: string,
  userId: string,
  eventType: 'workflow_started' | 'workflow_completed' | 'workflow_failed',
  metadata?: Record<string, any>
) {
  const analytics = getAnalyticsService();
  
  await analytics.trackEvent({
    tenant_id: STARTUP_TENANT_ID,
    user_id: userId,
    event_type: eventType,
    event_category: 'business_metric',
    event_data: {
      workflow_id: workflowId,
      ...metadata,
    },
  });
}

/**
 * Track agent execution (for workflow steps)
 */
export async function trackWorkflowExecution(params: {
  workflowId: string;
  userId: string;
  executionTimeMs: number;
  success: boolean;
  stepsCompleted?: number;
  error?: string;
  metadata?: Record<string, any>;
}) {
  const analytics = getAnalyticsService();
  
  await analytics.trackAgentExecution({
    tenant_id: STARTUP_TENANT_ID,
    user_id: params.userId,
    agent_id: params.workflowId,
    agent_type: 'workflow',
    execution_time_ms: params.executionTimeMs,
    success: params.success,
    error_message: params.error,
    metadata: {
      steps_completed: params.stepsCompleted,
      ...params.metadata,
    },
  });
}

/**
 * Batch track multiple events (for workflows with multiple steps)
 */
export async function trackBatchEvents(events: Array<{
  type: string;
  category: 'user_behavior' | 'agent_performance' | 'system_health' | 'business_metric';
  data: Record<string, any>;
  userId?: string;
}>) {
  const analytics = getAnalyticsService();
  
  for (const event of events) {
    await analytics.trackEvent({
      tenant_id: STARTUP_TENANT_ID,
      user_id: event.userId || 'system',
      event_type: event.type,
      event_category: event.category,
      event_data: event.data,
    });
  }
}

