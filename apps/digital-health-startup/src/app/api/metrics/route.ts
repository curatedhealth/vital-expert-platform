/**
 * Prometheus Metrics Service
 * Exports application metrics in Prometheus format
 * 
 * Metrics Categories:
 * - HTTP requests (method, route, status)
 * - LLM usage (model, tokens, cost)
 * - Agent performance (success, latency)
 * - Database queries
 * - User sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import client from 'prom-client';

// Initialize the Prometheus client
const register = new client.Registry();

// Add default metrics (memory, CPU, etc.)
client.collectDefaultMetrics({ register });

// ============================================================================
// HTTP Metrics
// ============================================================================

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// ============================================================================
// LLM Metrics
// ============================================================================

export const llmRequestsTotal = new client.Counter({
  name: 'llm_requests_total',
  help: 'Total number of LLM requests',
  labelNames: ['model', 'provider', 'agent_id'],
  registers: [register],
});

export const llmTokensUsed = new client.Counter({
  name: 'llm_tokens_used_total',
  help: 'Total number of LLM tokens used',
  labelNames: ['model', 'provider', 'token_type'], // token_type: prompt, completion
  registers: [register],
});

export const llmCostUsd = new client.Counter({
  name: 'llm_cost_usd_total',
  help: 'Total cost of LLM usage in USD',
  labelNames: ['model', 'provider', 'agent_id'],
  registers: [register],
});

export const llmRequestDuration = new client.Histogram({
  name: 'llm_request_duration_seconds',
  help: 'Duration of LLM requests in seconds',
  labelNames: ['model', 'provider'],
  buckets: [0.5, 1, 2, 5, 10, 20, 30],
  registers: [register],
});

// ============================================================================
// Agent Metrics
// ============================================================================

export const agentExecutionsTotal = new client.Counter({
  name: 'agent_executions_total',
  help: 'Total number of agent executions',
  labelNames: ['agent_id', 'agent_type'],
  registers: [register],
});

export const agentExecutionsSuccess = new client.Counter({
  name: 'agent_executions_success_total',
  help: 'Total number of successful agent executions',
  labelNames: ['agent_id', 'agent_type'],
  registers: [register],
});

export const agentExecutionsFailed = new client.Counter({
  name: 'agent_executions_failed_total',
  help: 'Total number of failed agent executions',
  labelNames: ['agent_id', 'agent_type', 'error_type'],
  registers: [register],
});

export const agentExecutionDuration = new client.Histogram({
  name: 'agent_execution_duration_seconds',
  help: 'Duration of agent executions in seconds',
  labelNames: ['agent_id', 'agent_type'],
  buckets: [1, 2, 5, 10, 20, 30, 60],
  registers: [register],
});

export const agentQualityScore = new client.Gauge({
  name: 'agent_quality_score',
  help: 'Agent response quality score (0-100)',
  labelNames: ['agent_id', 'agent_type'],
  registers: [register],
});

// ============================================================================
// User Metrics
// ============================================================================

export const userSessionsActive = new client.Gauge({
  name: 'user_sessions_active',
  help: 'Number of active user sessions',
  registers: [register],
});

export const userSessionsTotal = new client.Counter({
  name: 'user_sessions_total',
  help: 'Total number of user sessions started',
  registers: [register],
});

export const userQueriesTotal = new client.Counter({
  name: 'user_queries_total',
  help: 'Total number of user queries',
  labelNames: ['user_id', 'query_type'],
  registers: [register],
});

export const userErrorsTotal = new client.Counter({
  name: 'user_errors_total',
  help: 'Total number of user-facing errors',
  labelNames: ['error_type'],
  registers: [register],
});

// ============================================================================
// Rate Limiting Metrics
// ============================================================================

export const rateLimitHits = new client.Counter({
  name: 'rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['entity_type', 'quota_type'],
  registers: [register],
});

export const quotaViolations = new client.Counter({
  name: 'quota_violations_total',
  help: 'Total number of quota violations',
  labelNames: ['entity_type', 'quota_type'],
  registers: [register],
});

// ============================================================================
// Authentication Metrics
// ============================================================================

export const authAttempts = new client.Counter({
  name: 'auth_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['method', 'result'], // result: success, failure
  registers: [register],
});

export const authFailures = new client.Counter({
  name: 'auth_failures_total',
  help: 'Total number of authentication failures',
  labelNames: ['method', 'reason'],
  registers: [register],
});

// ============================================================================
// Database Metrics
// ============================================================================

export const dbQueriesTotal = new client.Counter({
  name: 'db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table'],
  registers: [register],
});

export const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// ============================================================================
// API Route Handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Set content type for Prometheus
    const metrics = await register.metrics();
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return new NextResponse('Error generating metrics', { status: 500 });
  }
}

// ============================================================================
// Helper Functions for Recording Metrics
// ============================================================================

/**
 * Record HTTP request metrics
 */
export function recordHttpRequest(
  method: string,
  route: string,
  status: number,
  durationSeconds: number
) {
  httpRequestsTotal.inc({ method, route, status: status.toString() });
  httpRequestDuration.observe({ method, route, status: status.toString() }, durationSeconds);
}

/**
 * Record LLM request metrics
 */
export function recordLLMRequest(params: {
  model: string;
  provider: string;
  agentId?: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  durationSeconds: number;
}) {
  const { model, provider, agentId, promptTokens, completionTokens, costUsd, durationSeconds } = params;
  
  llmRequestsTotal.inc({ model, provider, agent_id: agentId || 'unknown' });
  llmTokensUsed.inc({ model, provider, token_type: 'prompt' }, promptTokens);
  llmTokensUsed.inc({ model, provider, token_type: 'completion' }, completionTokens);
  llmCostUsd.inc({ model, provider, agent_id: agentId || 'unknown' }, costUsd);
  llmRequestDuration.observe({ model, provider }, durationSeconds);
}

/**
 * Record agent execution metrics
 */
export function recordAgentExecution(params: {
  agentId: string;
  agentType: string;
  success: boolean;
  durationSeconds: number;
  errorType?: string;
  qualityScore?: number;
}) {
  const { agentId, agentType, success, durationSeconds, errorType, qualityScore } = params;
  
  agentExecutionsTotal.inc({ agent_id: agentId, agent_type: agentType });
  
  if (success) {
    agentExecutionsSuccess.inc({ agent_id: agentId, agent_type: agentType });
  } else {
    agentExecutionsFailed.inc({
      agent_id: agentId,
      agent_type: agentType,
      error_type: errorType || 'unknown',
    });
  }
  
  agentExecutionDuration.observe({ agent_id: agentId, agent_type: agentType }, durationSeconds);
  
  if (qualityScore !== undefined) {
    agentQualityScore.set({ agent_id: agentId, agent_type: agentType }, qualityScore);
  }
}

/**
 * Record database query metrics
 */
export function recordDbQuery(operation: string, table: string, durationSeconds: number) {
  dbQueriesTotal.inc({ operation, table });
  dbQueryDuration.observe({ operation, table }, durationSeconds);
}

/**
 * Update active user sessions count
 */
export function updateActiveUserSessions(count: number) {
  userSessionsActive.set(count);
}

/**
 * Record user query
 */
export function recordUserQuery(userId: string, queryType: string) {
  userQueriesTotal.inc({ user_id: userId, query_type: queryType });
}

/**
 * Record rate limit hit
 */
export function recordRateLimitHit(entityType: string, quotaType: string) {
  rateLimitHits.inc({ entity_type: entityType, quota_type: quotaType });
}

/**
 * Record quota violation
 */
export function recordQuotaViolation(entityType: string, quotaType: string) {
  quotaViolations.inc({ entity_type: entityType, quota_type: quotaType });
}

/**
 * Record authentication attempt
 */
export function recordAuthAttempt(method: string, success: boolean, failureReason?: string) {
  authAttempts.inc({ method, result: success ? 'success' : 'failure' });
  
  if (!success && failureReason) {
    authFailures.inc({ method, reason: failureReason });
  }
}
