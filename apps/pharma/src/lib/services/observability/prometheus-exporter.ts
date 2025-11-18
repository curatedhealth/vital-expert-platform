/**
 * Prometheus Metrics Exporter
 * 
 * Exports metrics from structured logger to Prometheus format.
 * Integrates with existing /api/metrics endpoint.
 * 
 * Architecture:
 * - Uses prom-client for metric definitions
 * - Aggregates metrics from structured logger entries
 * - Provides registry for /api/metrics endpoint
 */

import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import type { StructuredLogEntry } from './structured-logger';

// ============================================================================
// METRICS REGISTRY (Singleton)
// ============================================================================

let metricsRegistry: Registry | null = null;

function getOrCreateRegistry(): Registry {
  if (!metricsRegistry) {
    metricsRegistry = new Registry();
  }
  return metricsRegistry;
}

// ============================================================================
// METRIC DEFINITIONS
// ============================================================================

/**
 * Agent Operation Metrics
 */
export const agentMetrics = {
  // Search operations
  searchDuration: new Histogram({
    name: 'agent_search_duration_ms',
    help: 'Duration of agent search operations in milliseconds',
    labelNames: ['operation', 'method'], // method: 'graphrag_hybrid' | 'database' | 'fallback'
    buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
    registers: [getOrCreateRegistry()],
  }),

  searchTotal: new Counter({
    name: 'agent_search_total',
    help: 'Total number of agent search operations',
    labelNames: ['operation', 'method'],
    registers: [getOrCreateRegistry()],
  }),

  searchErrors: new Counter({
    name: 'agent_search_errors_total',
    help: 'Total number of agent search errors',
    labelNames: ['operation', 'error_type'],
    registers: [getOrCreateRegistry()],
  }),

  searchResults: new Gauge({
    name: 'agent_search_results_count',
    help: 'Number of agents returned from search',
    labelNames: ['operation'],
    registers: [getOrCreateRegistry()],
  }),

  // Agent selection
  selectionDuration: new Histogram({
    name: 'agent_selection_duration_ms',
    help: 'Duration of agent selection operations in milliseconds',
    labelNames: ['mode'], // mode: 'mode2' | 'mode3' | 'orchestrator'
    buckets: [10, 50, 100, 200, 500, 1000, 2000],
    registers: [getOrCreateRegistry()],
  }),

  selectionTotal: new Counter({
    name: 'agent_selection_total',
    help: 'Total number of agent selections',
    labelNames: ['mode', 'confidence_level'], // confidence_level: 'high' | 'medium' | 'low'
    registers: [getOrCreateRegistry()],
  }),

  // GraphRAG metrics
  graphragHits: new Counter({
    name: 'graphrag_search_hits_total',
    help: 'Total number of successful GraphRAG searches',
    labelNames: ['operation'],
    registers: [getOrCreateRegistry()],
  }),

  graphragFallbacks: new Counter({
    name: 'graphrag_search_fallback_total',
    help: 'Total number of GraphRAG fallbacks to database',
    labelNames: ['operation'],
    registers: [getOrCreateRegistry()],
  }),

  // Ranking metrics
  rankingDuration: new Histogram({
    name: 'agent_ranking_duration_ms',
    help: 'Duration of agent ranking operations in milliseconds',
    labelNames: ['operation'],
    buckets: [10, 50, 100, 200, 500],
    registers: [getOrCreateRegistry()],
  }),

  rankingQuality: new Histogram({
    name: 'agent_ranking_score',
    help: 'Distribution of agent ranking scores',
    buckets: [0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99, 1.0],
    registers: [getOrCreateRegistry()],
  }),

  // User agent operations
  userAgentOperations: new Counter({
    name: 'user_agent_operations_total',
    help: 'Total user agent CRUD operations',
    labelNames: ['operation'], // 'add' | 'remove' | 'migrate'
    registers: [getOrCreateRegistry()],
  }),

  userAgentErrors: new Counter({
    name: 'user_agent_operations_errors_total',
    help: 'Total user agent operation errors',
    labelNames: ['operation', 'error_type'],
    registers: [getOrCreateRegistry()],
  }),
};

/**
 * Mode Execution Metrics
 */
export const modeMetrics = {
  // Mode 2 metrics
  mode2Duration: new Histogram({
    name: 'mode2_execution_duration_ms',
    help: 'Duration of Mode 2 (Automatic Agent Selection) executions',
    buckets: [100, 500, 1000, 2000, 5000, 10000],
    registers: [getOrCreateRegistry()],
  }),

  mode2Total: new Counter({
    name: 'mode2_executions_total',
    help: 'Total Mode 2 executions',
    labelNames: ['status'], // 'success' | 'error'
    registers: [getOrCreateRegistry()],
  }),

  // Mode 3 metrics
  mode3Duration: new Histogram({
    name: 'mode3_execution_duration_ms',
    help: 'Duration of Mode 3 (Autonomous-Automatic) executions',
    buckets: [1000, 5000, 10000, 30000, 60000],
    registers: [getOrCreateRegistry()],
  }),

  mode3Total: new Counter({
    name: 'mode3_executions_total',
    help: 'Total Mode 3 executions',
    labelNames: ['status'],
    registers: [getOrCreateRegistry()],
  }),

  mode3Iterations: new Histogram({
    name: 'mode3_react_iterations',
    help: 'Number of ReAct iterations in Mode 3',
    buckets: [1, 2, 3, 5, 10, 15, 20],
    registers: [getOrCreateRegistry()],
  }),
};

// ============================================================================
// METRICS EXPORTER
// ============================================================================

export class PrometheusMetricsExporter {
  private registry: Registry;

  constructor() {
    this.registry = getOrCreateRegistry();
  }

  /**
   * Record a structured log entry as metrics
   */
  recordLogEntry(logEntry: StructuredLogEntry): void {
    if (!logEntry.operation) {
      return; // Skip logs without operation context
    }

    const operation = logEntry.operation;
    const duration = logEntry.duration;
    const isError = logEntry.level === 'ERROR';
    const metadata = logEntry.metadata || {};

    // Record duration if available
    if (duration !== undefined) {
      // Agent search operations
      if (operation.includes('agent_search') || operation.includes('findCandidateAgents')) {
        const method = metadata.method || 'unknown';
        agentMetrics.searchDuration
          .labels(operation, method)
          .observe(duration);
      }

      // Agent selection operations
      if (operation.includes('agent_selection') || operation.includes('selectAgent')) {
        const mode = metadata.mode || 'unknown';
        agentMetrics.selectionDuration
          .labels(mode)
          .observe(duration);
      }

      // Ranking operations
      if (operation.includes('ranking') || operation.includes('rankAgents')) {
        agentMetrics.rankingDuration
          .labels(operation)
          .observe(duration);

        // Record ranking quality if score is available
        if (metadata.topScore !== undefined) {
          agentMetrics.rankingQuality.observe(metadata.topScore);
        }
      }

      // Mode 2 execution
      if (operation.includes('Mode2Execute') || operation.includes('mode2')) {
        modeMetrics.mode2Duration.observe(duration);
        modeMetrics.mode2Total.labels(isError ? 'error' : 'success').inc();
      }

      // Mode 3 execution
      if (operation.includes('Mode3Execute') || operation.includes('mode3')) {
        modeMetrics.mode3Duration.observe(duration);
        modeMetrics.mode3Total.labels(isError ? 'error' : 'success').inc();

        // Record ReAct iterations if available
        if (metadata.iterationCount !== undefined) {
          modeMetrics.mode3Iterations.observe(metadata.iterationCount);
        }
      }
    }

    // Record success/error counts
    if (isError) {
      // Agent search errors
      if (operation.includes('agent_search') || operation.includes('findCandidateAgents')) {
        const errorType = logEntry.error?.name || 'UnknownError';
        agentMetrics.searchErrors
          .labels(operation, errorType)
          .inc();
      }

      // User agent operation errors
      if (operation.includes('user_agent')) {
        const opType = operation.includes('add') ? 'add' :
                      operation.includes('remove') ? 'remove' :
                      operation.includes('migrate') ? 'migrate' : 'unknown';
        const errorType = logEntry.error?.name || 'UnknownError';
        agentMetrics.userAgentErrors
          .labels(opType, errorType)
          .inc();
      }
    } else {
      // Record successful operations
      if (operation.includes('agent_search') || operation.includes('findCandidateAgents')) {
        const method = metadata.method || 'unknown';
        agentMetrics.searchTotal
          .labels(operation, method)
          .inc();

        // Record GraphRAG hits
        if (method === 'graphrag_hybrid') {
          agentMetrics.graphragHits
            .labels(operation)
            .inc();
        }

        // Record result count
        if (metadata.resultCount !== undefined) {
          agentMetrics.searchResults
            .labels(operation)
            .set(metadata.resultCount);
        }
      }

      // GraphRAG fallbacks
      if (operation.includes('graphrag_search_failed') || operation.includes('graphrag_fallback')) {
        agentMetrics.graphragFallbacks
          .labels(operation)
          .inc();
      }

      // Agent selection success
      if (operation.includes('agent_selection') || operation.includes('selectAgent')) {
        const mode = metadata.mode || 'unknown';
        const confidence = metadata.confidence || 0;
        const confidenceLevel = confidence >= 0.8 ? 'high' : confidence >= 0.6 ? 'medium' : 'low';
        
        agentMetrics.selectionTotal
          .labels(mode, confidenceLevel)
          .inc();
      }

      // User agent operations
      if (operation.includes('user_agent')) {
        const opType = operation.includes('add') ? 'add' :
                      operation.includes('remove') ? 'remove' :
                      operation.includes('migrate') ? 'migrate' : 'unknown';
        agentMetrics.userAgentOperations
          .labels(opType)
          .inc();
      }
    }
  }

  /**
   * Get Prometheus registry
   */
  getRegistry(): Registry {
    return this.registry;
  }

  /**
   * Export all metrics in Prometheus format
   */
  async exportMetrics(): Promise<string> {
    const Registry = await import('prom-client');
    return Registry.register.metrics(this.registry);
  }

  /**
   * Get metrics as JSON (for debugging)
   */
  async getMetricsAsJSON(): Promise<any> {
    const Registry = await import('prom-client');
    return Registry.register.getMetricsAsJSON(this.registry);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let exporterInstance: PrometheusMetricsExporter | null = null;

export function getPrometheusExporter(): PrometheusMetricsExporter {
  if (!exporterInstance) {
    exporterInstance = new PrometheusMetricsExporter();
  }
  return exporterInstance;
}

