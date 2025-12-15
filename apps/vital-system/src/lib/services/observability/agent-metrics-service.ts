/**
 * Agent Metrics Service
 * 
 * Collects, stores, and retrieves agent operation metrics.
 * Integrates with Prometheus for real-time metrics and database for historical tracking.
 * 
 * Features:
 * - Record detailed per-operation metrics
 * - Store in database for historical analysis
 * - Support aggregation queries
 * - Fire-and-forget async recording (non-blocking)
 * - Automatic error handling and logging
 * 
 * Architecture Principles:
 * - SOLID: Single responsibility, dependency injection
 * - Type Safety: Full TypeScript with Zod validation
 * - Observability: Structured logging, distributed tracing
 * - Resilience: Graceful degradation, retries
 * - Performance: Async non-blocking writes
 * 
 * @module lib/services/observability/agent-metrics-service
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import { createLogger } from './structured-logger';
import { getTracingService } from './tracing';
import { env } from '@/lib/config/environment';
import { withRetry } from '../resilience/retry';
import { z } from 'zod';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Agent operation metrics input (what we record)
 */
export const agentOperationMetricsSchema = z.object({
  // Required
  agentId: z.string().uuid(),
  tenantId: z.string().uuid(),
  operationType: z.enum([
    'search',
    'selection',
    'execution',
    'mode2',
    'mode3',
    'orchestrator',
  ]),
  responseTimeMs: z.number().int().min(0),
  success: z.boolean(),

  // Optional context
  conversationId: z.string().uuid().optional(),
  userId: z.string().uuid().nullable().optional(),
  sessionId: z.string().optional(),

  // Optional operation details
  queryText: z.string().max(1000).optional(), // Truncate for privacy
  searchMethod: z
    .enum(['graphrag_hybrid', 'database', 'fallback', 'graph_traversal'])
    .optional(),
  selectedAgentId: z.string().uuid().optional(),

  // Optional performance metrics
  tokensInput: z.number().int().min(0).default(0),
  tokensOutput: z.number().int().min(0).default(0),
  costUsd: z.number().min(0).default(0),

  // Optional quality metrics
  satisfactionScore: z.number().int().min(1).max(5).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  relevanceScore: z.number().min(0).max(1).optional(),

  // Optional GraphRAG metrics
  graphragHit: z.boolean().default(false),
  graphragFallback: z.boolean().default(false),
  graphTraversalDepth: z.number().int().min(0).default(0),

  // Optional error details
  errorOccurred: z.boolean().default(false),
  errorType: z.string().optional(),
  errorMessage: z.string().max(500).optional(), // Truncate error messages

  // Flexible metadata
  metadata: z.record(z.any()).optional(),
});

export type AgentOperationMetrics = z.infer<
  typeof agentOperationMetricsSchema
>;

/**
 * Aggregated metrics result
 */
export interface AggregatedAgentMetrics {
  agentId: string;
  period: string; // '1h' | '6h' | '24h' | '7d' | '30d'
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  totalCostUsd: number;
  averageSatisfactionScore: number;
  averageConfidenceScore: number;
  graphragHitRate: number;
  errorRate: number;
  operationsByType: Record<string, number>;
  operationsBySearchMethod: Record<string, number>;
}

/**
 * Metrics query filters
 */
export interface MetricsQueryFilters {
  agentId?: string;
  tenantId?: string;
  userId?: string;
  operationType?: AgentOperationMetrics['operationType'];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

// ============================================================================
// AGENT METRICS SERVICE
// ============================================================================

/**
 * Agent Metrics Service
 * 
 * Handles collection, storage, and retrieval of agent operation metrics.
 */
export class AgentMetricsService {
  private supabase: ReturnType<typeof createClient>;
  private logger;
  private tracing;
  private readonly supabaseUrl: string;
  private readonly supabaseServiceKey: string;

  constructor() {
    const config = env.get();
    this.supabaseUrl = config.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseServiceKey = config.SUPABASE_SERVICE_ROLE_KEY;

    // Initialize Supabase admin client (for metrics recording)
    this.supabase = createClient(this.supabaseUrl, this.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger = createLogger();
    this.tracing = getTracingService();
  }

  /**
   * Record an agent operation metric
   * 
   * Fire-and-forget async operation. Does not block the caller.
   * 
   * @param metrics - Operation metrics to record
   * @returns Promise that resolves when recording completes (or fails silently)
   */
  async recordOperation(
    metrics: AgentOperationMetrics
  ): Promise<void> {
    const spanId = this.tracing.startSpan(
      'AgentMetricsService.recordOperation',
      undefined,
      {
        agentId: metrics.agentId,
        operationType: metrics.operationType,
      }
    );

    try {
      // Validate input
      const validatedMetrics = agentOperationMetricsSchema.parse(metrics);

      // Truncate query_text if too long
      const queryText =
        validatedMetrics.queryText &&
        validatedMetrics.queryText.length > 1000
          ? validatedMetrics.queryText.substring(0, 997) + '...'
          : validatedMetrics.queryText;

      // Truncate error_message if too long
      const errorMessage =
        validatedMetrics.errorMessage &&
        validatedMetrics.errorMessage.length > 500
          ? validatedMetrics.errorMessage.substring(0, 497) + '...'
          : validatedMetrics.errorMessage;

      // Prepare database payload
      const payload = {
        agent_id: validatedMetrics.agentId,
        tenant_id: validatedMetrics.tenantId,
        conversation_id: validatedMetrics.conversationId || null,
        user_id: validatedMetrics.userId || null,
        session_id: validatedMetrics.sessionId || null,
        operation_type: validatedMetrics.operationType,
        query_text: queryText || null,
        search_method: validatedMetrics.searchMethod || null,
        selected_agent_id: validatedMetrics.selectedAgentId || null,
        response_time_ms: validatedMetrics.responseTimeMs,
        tokens_input: validatedMetrics.tokensInput,
        tokens_output: validatedMetrics.tokensOutput,
        cost_usd: validatedMetrics.costUsd,
        satisfaction_score: validatedMetrics.satisfactionScore || null,
        confidence_score: validatedMetrics.confidenceScore || null,
        relevance_score: validatedMetrics.relevanceScore || null,
        graphrag_hit: validatedMetrics.graphragHit,
        graphrag_fallback: validatedMetrics.graphragFallback,
        graph_traversal_depth: validatedMetrics.graphTraversalDepth,
        success: validatedMetrics.success,
        error_occurred: validatedMetrics.errorOccurred,
        error_type: validatedMetrics.errorType || null,
        error_message: errorMessage || null,
        metadata: validatedMetrics.metadata || {},
      };

      // Insert into database (with retry)
      await withRetry(
        async () => {
          const { error } = await this.supabase
            .from('agent_metrics')
            .insert(payload);

          if (error) {
            throw error;
          }
        },
        {
          maxRetries: 2,
          initialDelayMs: 100,
          onRetry: (attempt, error) => {
            this.logger.warn('agent_metrics_record_retry', {
              attempt,
              agentId: validatedMetrics.agentId,
              operationType: validatedMetrics.operationType,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      this.logger.debug('agent_metrics_recorded', {
        agentId: validatedMetrics.agentId,
        operationType: validatedMetrics.operationType,
        responseTimeMs: validatedMetrics.responseTimeMs,
        success: validatedMetrics.success,
      });

      this.tracing.endSpan(spanId, true);
    } catch (error) {
      // Graceful degradation: log error but don't fail
      this.logger.error(
        'agent_metrics_record_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          agentId: metrics.agentId,
          operationType: metrics.operationType,
        }
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Don't throw - metrics recording should never break the main flow
    }
  }

  /**
   * Get metrics for specific filters
   * 
   * @param filters - Query filters
   * @returns Array of metrics matching filters
   */
  async getMetrics(
    filters: MetricsQueryFilters = {}
  ): Promise<any[]> {
    const spanId = this.tracing.startSpan(
      'AgentMetricsService.getMetrics',
      undefined,
      {
        agentId: filters.agentId,
        operationType: filters.operationType,
      }
    );

    try {
      let query = this.supabase
        .from('agent_metrics')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.agentId) {
        query = query.eq('agent_id', filters.agentId);
      }

      if (filters.tenantId) {
        query = query.eq('tenant_id', filters.tenantId);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.operationType) {
        query = query.eq('operation_type', filters.operationType);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      } else {
        // Default limit to prevent huge queries
        query = query.limit(1000);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      this.tracing.endSpan(spanId, true);

      return data || [];
    } catch (error) {
      this.logger.error(
        'agent_metrics_get_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          filters,
        }
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      throw error;
    }
  }

  /**
   * Get aggregated metrics for a time period
   * 
   * @param agentId - Optional agent ID (if not provided, aggregates all)
   * @param tenantId - Optional tenant ID
   * @param period - Time period: '1h' | '6h' | '24h' | '7d' | '30d'
   * @returns Aggregated metrics
   */
  async getAggregatedMetrics(
    agentId?: string,
    tenantId?: string,
    period: '1h' | '6h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<AggregatedAgentMetrics | null> {
    const spanId = this.tracing.startSpan(
      'AgentMetricsService.getAggregatedMetrics',
      undefined,
      {
        agentId,
        tenantId,
        period,
      }
    );

    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case '1h':
          startDate.setHours(startDate.getHours() - 1);
          break;
        case '6h':
          startDate.setHours(startDate.getHours() - 6);
          break;
        case '24h':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      // Build query
      let query = this.supabase
        .from('agent_metrics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data: metrics, error } = await query;

      if (error) {
        throw error;
      }

      if (!metrics || metrics.length === 0) {
        this.tracing.endSpan(spanId, true);
        return null;
      }

      // Calculate aggregates
      const totalOperations = metrics.length;
      const successfulOperations = metrics.filter((m) => m.success).length;
      const failedOperations = totalOperations - successfulOperations;

      const latencies = metrics
        .map((m) => m.response_time_ms)
        .filter((l) => l !== null && l > 0)
        .sort((a, b) => a - b);

      const averageLatencyMs =
        latencies.length > 0
          ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length
          : 0;

      const p95Index = Math.floor(latencies.length * 0.95);
      const p95LatencyMs = latencies[p95Index] || 0;

      const p99Index = Math.floor(latencies.length * 0.99);
      const p99LatencyMs = latencies[p99Index] || 0;

      const totalTokensInput = metrics.reduce(
        (sum, m) => sum + (m.tokens_input || 0),
        0
      );
      const totalTokensOutput = metrics.reduce(
        (sum, m) => sum + (m.tokens_output || 0),
        0
      );
      const totalCostUsd = metrics.reduce(
        (sum, m) => sum + parseFloat(m.cost_usd || '0'),
        0
      );

      const satisfactionScores = metrics
        .map((m) => m.satisfaction_score)
        .filter((s) => s !== null && s > 0);
      const averageSatisfactionScore =
        satisfactionScores.length > 0
          ? satisfactionScores.reduce((sum, s) => sum + s, 0) /
            satisfactionScores.length
          : 0;

      const confidenceScores = metrics
        .map((m) => m.confidence_score)
        .filter((c) => c !== null && c > 0);
      const averageConfidenceScore =
        confidenceScores.length > 0
          ? confidenceScores.reduce((sum, c) => sum + c, 0) /
            confidenceScores.length
          : 0;

      const graphragHits = metrics.filter((m) => m.graphrag_hit === true)
        .length;
      const graphragFallbacks = metrics.filter(
        (m) => m.graphrag_fallback === true
      ).length;
      const graphragTotal = graphragHits + graphragFallbacks;
      const graphragHitRate =
        graphragTotal > 0 ? graphragHits / graphragTotal : 0;

      const errorRate =
        totalOperations > 0 ? failedOperations / totalOperations : 0;

      // Group by operation type
      const operationsByType: Record<string, number> = {};
      for (const m of metrics) {
        operationsByType[m.operation_type] =
          (operationsByType[m.operation_type] || 0) + 1;
      }

      // Group by search method
      const operationsBySearchMethod: Record<string, number> = {};
      for (const m of metrics) {
        if (m.search_method) {
          operationsBySearchMethod[m.search_method] =
            (operationsBySearchMethod[m.search_method] || 0) + 1;
        }
      }

      const result: AggregatedAgentMetrics = {
        agentId: agentId || 'all',
        period,
        totalOperations,
        successfulOperations,
        failedOperations,
        averageLatencyMs: Math.round(averageLatencyMs),
        p95LatencyMs: Math.round(p95LatencyMs),
        p99LatencyMs: Math.round(p99LatencyMs),
        totalTokensInput,
        totalTokensOutput,
        totalCostUsd: parseFloat(totalCostUsd.toFixed(6)),
        averageSatisfactionScore: parseFloat(averageSatisfactionScore.toFixed(2)),
        averageConfidenceScore: parseFloat(averageConfidenceScore.toFixed(2)),
        graphragHitRate: parseFloat((graphragHitRate * 100).toFixed(2)),
        errorRate: parseFloat((errorRate * 100).toFixed(2)),
        operationsByType,
        operationsBySearchMethod,
      };

      this.tracing.endSpan(spanId, true);

      return result;
    } catch (error) {
      this.logger.error(
        'agent_metrics_aggregate_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          agentId,
          tenantId,
          period,
        }
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      throw error;
    }
  }

  /**
   * Get daily aggregated metrics (uses view if available)
   * 
   * @param agentId - Optional agent ID
   * @param days - Number of days to aggregate (default: 7)
   * @returns Array of daily aggregated metrics
   */
  async getDailyAggregatedMetrics(
    agentId?: string,
    days: number = 7
  ): Promise<any[]> {
    const spanId = this.tracing.startSpan(
      'AgentMetricsService.getDailyAggregatedMetrics',
      undefined,
      {
        agentId,
        days,
      }
    );

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = this.supabase
        .from('agent_metrics_daily')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query;

      if (error) {
        // View might not exist, fallback to manual aggregation
        this.logger.warn('agent_metrics_daily_view_not_found', {
          error: error.message,
        });

        // Return empty array for now
        this.tracing.endSpan(spanId, true);
        return [];
      }

      this.tracing.endSpan(spanId, true);

      return data || [];
    } catch (error) {
      this.logger.error(
        'agent_metrics_daily_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          agentId,
          days,
        }
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      return [];
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let metricsServiceInstance: AgentMetricsService | null = null;

export function getAgentMetricsService(): AgentMetricsService {
  if (!metricsServiceInstance) {
    metricsServiceInstance = new AgentMetricsService();
  }
  return metricsServiceInstance;
}

// Convenience export
export const agentMetricsService = getAgentMetricsService();

