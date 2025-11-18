/**
 * LangExtract Metrics Collector
 *
 * Collects and exports metrics for monitoring extraction performance,
 * costs, and quality. Integrates with Prometheus for time-series metrics.
 */

import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

// ============================================================================
// Types
// ============================================================================

export interface LangExtractMetrics {
  extraction_id: string;
  total_entities: number;
  processing_time_ms: number;
  confidence_avg: number;
  api_cost_usd: number;
  cache_hit_rate: number;
  errors: number;
  entity_types: Record<string, number>;
}

export interface AggregatedMetrics {
  time_range: string;
  total_extractions: number;
  total_entities: number;
  avg_processing_time_ms: number;
  avg_confidence: number;
  total_cost_usd: number;
  avg_cache_hit_rate: number;
  total_errors: number;
  by_entity_type: Record<string, {
    count: number;
    avg_confidence: number;
  }>;
}

export interface PrometheusMetrics {
  extractions_total: number;
  entities_extracted_total: number;
  processing_time_seconds: number[];
  confidence_score: number[];
  api_cost_dollars_total: number;
  cache_hit_rate: number;
  errors_total: number;
}

// ============================================================================
// Metrics Collector Service
// ============================================================================

export class LangExtractMetricsCollector {
  private supabase: ReturnType<typeof createClient>;
  private redis: Redis;
  private registry: Registry;

  // Prometheus metrics
  private extractionsTotal: Counter;
  private entitiesExtractedTotal: Counter;
  private processingTimeHistogram: Histogram;
  private confidenceScoreHistogram: Histogram;
  private apiCostTotal: Counter;
  private cacheHitRateGauge: Gauge;
  private errorsTotal: Counter;

  constructor() {
    // Initialize Supabase
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Initialize Redis
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!
    });

    // Initialize Prometheus registry
    this.registry = new Registry();

    // Define metrics
    this.extractionsTotal = new Counter({
      name: 'langextract_extractions_total',
      help: 'Total number of extractions performed',
      registers: [this.registry]
    });

    this.entitiesExtractedTotal = new Counter({
      name: 'langextract_entities_extracted_total',
      help: 'Total number of entities extracted',
      labelNames: ['entity_type'],
      registers: [this.registry]
    });

    this.processingTimeHistogram = new Histogram({
      name: 'langextract_processing_time_seconds',
      help: 'Processing time for extractions',
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
      registers: [this.registry]
    });

    this.confidenceScoreHistogram = new Histogram({
      name: 'langextract_confidence_score',
      help: 'Confidence score distribution',
      buckets: [0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99],
      registers: [this.registry]
    });

    this.apiCostTotal = new Counter({
      name: 'langextract_api_cost_dollars_total',
      help: 'Total API cost in USD',
      registers: [this.registry]
    });

    this.cacheHitRateGauge = new Gauge({
      name: 'langextract_cache_hit_rate',
      help: 'Current cache hit rate (0.0 to 1.0)',
      registers: [this.registry]
    });

    this.errorsTotal = new Counter({
      name: 'langextract_errors_total',
      help: 'Total number of extraction errors',
      labelNames: ['error_type'],
      registers: [this.registry]
    });
  }

  // ==========================================================================
  // Record Metrics
  // ==========================================================================

  /**
   * Record extraction metrics
   */
  async recordExtraction(metrics: LangExtractMetrics): Promise<void> {
    try {
      // Update Prometheus metrics
      this.extractionsTotal.inc();
      this.entitiesExtractedTotal.inc(metrics.total_entities);
      this.processingTimeHistogram.observe(metrics.processing_time_ms / 1000);
      this.confidenceScoreHistogram.observe(metrics.confidence_avg);
      this.apiCostTotal.inc(metrics.api_cost_usd);
      this.cacheHitRateGauge.set(metrics.cache_hit_rate);

      if (metrics.errors > 0) {
        this.errorsTotal.inc(metrics.errors);
      }

      // Record entity types
      for (const [type, count] of Object.entries(metrics.entity_types)) {
        this.entitiesExtractedTotal.inc({ entity_type: type }, count);
      }

      // Store in database
      await this.supabase
        .from('extraction_metrics')
        .insert({
          extraction_id: metrics.extraction_id,
          total_entities: metrics.total_entities,
          processing_time_ms: metrics.processing_time_ms,
          confidence_avg: metrics.confidence_avg,
          api_cost_usd: metrics.api_cost_usd,
          cache_hit_rate: metrics.cache_hit_rate,
          errors: metrics.errors
        });

      // Cache recent metrics (last 1 hour)
      const cacheKey = `metrics:recent:${Date.now()}`;
      await this.redis.setex(cacheKey, 3600, JSON.stringify(metrics));

    } catch (error) {
      console.error('Failed to record extraction metrics:', error);
      this.errorsTotal.inc({ error_type: 'metrics_recording_failed' });
    }
  }

  /**
   * Record error
   */
  async recordError(errorType: string): Promise<void> {
    this.errorsTotal.inc({ error_type: errorType });
  }

  // ==========================================================================
  // Get Metrics
  // ==========================================================================

  /**
   * Get aggregated metrics for a time range
   */
  async getMetrics(timeRange: '1h' | '24h' | '7d' | '30d'): Promise<AggregatedMetrics> {
    const intervals: Record<string, string> = {
      '1h': '1 hour',
      '24h': '24 hours',
      '7d': '7 days',
      '30d': '30 days'
    };

    const interval = intervals[timeRange];

    const { data, error } = await this.supabase
      .from('extraction_metrics')
      .select('*')
      .gte('created_at', `now() - interval '${interval}'`);

    if (error) {
      throw new Error(`Failed to get metrics: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        time_range: timeRange,
        total_extractions: 0,
        total_entities: 0,
        avg_processing_time_ms: 0,
        avg_confidence: 0,
        total_cost_usd: 0,
        avg_cache_hit_rate: 0,
        total_errors: 0,
        by_entity_type: {}
      };
    }

    // Aggregate metrics
    const totalExtractions = data.length;
    const totalEntities = data.reduce((sum, m) => sum + m.total_entities, 0);
    const avgProcessingTime = data.reduce((sum, m) => sum + m.processing_time_ms, 0) / totalExtractions;
    const avgConfidence = data.reduce((sum, m) => sum + m.confidence_avg, 0) / totalExtractions;
    const totalCost = data.reduce((sum, m) => sum + m.api_cost_usd, 0);
    const avgCacheHitRate = data.reduce((sum, m) => sum + m.cache_hit_rate, 0) / totalExtractions;
    const totalErrors = data.reduce((sum, m) => sum + m.errors, 0);

    return {
      time_range: timeRange,
      total_extractions: totalExtractions,
      total_entities: totalEntities,
      avg_processing_time_ms: Math.round(avgProcessingTime),
      avg_confidence: parseFloat(avgConfidence.toFixed(4)),
      total_cost_usd: parseFloat(totalCost.toFixed(6)),
      avg_cache_hit_rate: parseFloat(avgCacheHitRate.toFixed(4)),
      total_errors: totalErrors,
      by_entity_type: {} // TODO: Aggregate by entity type
    };
  }

  /**
   * Get Prometheus metrics export
   */
  async exportPrometheusMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Get current metrics snapshot
   */
  async getCurrentMetrics(): Promise<PrometheusMetrics> {
    const metrics = await this.registry.getMetricsAsJSON();

    return {
      extractions_total: this.getMetricValue(metrics, 'langextract_extractions_total'),
      entities_extracted_total: this.getMetricValue(metrics, 'langextract_entities_extracted_total'),
      processing_time_seconds: this.getHistogramValues(metrics, 'langextract_processing_time_seconds'),
      confidence_score: this.getHistogramValues(metrics, 'langextract_confidence_score'),
      api_cost_dollars_total: this.getMetricValue(metrics, 'langextract_api_cost_dollars_total'),
      cache_hit_rate: this.getMetricValue(metrics, 'langextract_cache_hit_rate'),
      errors_total: this.getMetricValue(metrics, 'langextract_errors_total')
    };
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  private getMetricValue(metrics: any[], name: string): number {
    const metric = metrics.find((m: any) => m.name === name);
    if (!metric || !metric.values || metric.values.length === 0) {
      return 0;
    }
    return metric.values[0].value || 0;
  }

  private getHistogramValues(metrics: any[], name: string): number[] {
    const metric = metrics.find((m: any) => m.name === name);
    if (!metric || !metric.values) {
      return [];
    }
    return metric.values.map((v: any) => v.value || 0);
  }

  /**
   * Clear old metrics (cleanup job)
   */
  async clearOldMetrics(olderThanDays: number = 90): Promise<number> {
    const { data, error } = await this.supabase
      .from('extraction_metrics')
      .delete()
      .lt('created_at', `now() - interval '${olderThanDays} days'`);

    if (error) {
      throw new Error(`Failed to clear old metrics: ${error.message}`);
    }

    return data?.length || 0;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let metricsCollectorInstance: LangExtractMetricsCollector | null = null;

export function getMetricsCollector(): LangExtractMetricsCollector {
  if (!metricsCollectorInstance) {
    metricsCollectorInstance = new LangExtractMetricsCollector();
  }
  return metricsCollectorInstance;
}
