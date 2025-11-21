/**
 * Cost Tracker Service
 *
 * Tracks API costs across all services (Gemini, Pinecone, Redis, Cohere)
 * Provides cost analytics, projections, and budget alerts.
 */

import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';

// ============================================================================
// Types
// ============================================================================

export interface CostEntry {
  id?: string;
  service: 'gemini_api' | 'pinecone' | 'redis' | 'cohere' | 'other';
  cost_usd: number;
  operation_count?: number;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface CostBreakdown {
  gemini_api: number;
  pinecone_queries: number;
  redis_operations: number;
  cohere_reranking: number;
  other: number;
  total_usd: number;
  savings_from_cache: number;
}

export interface CostProjection {
  current_daily_avg: number;
  projected_monthly: number;
  projected_yearly: number;
  breakdown: CostBreakdown;
}

export interface BudgetAlert {
  id: string;
  threshold_usd: number;
  period: 'daily' | 'weekly' | 'monthly';
  current_spend: number;
  triggered: boolean;
  message: string;
}

// ============================================================================
// Cost Tracker
// ============================================================================

export class CostTracker {
  private supabase: ReturnType<typeof createClient>;
  private redis: Redis;

  // Pricing constants (update as needed)
  private readonly PRICING = {
    gemini_1_5_pro_input: 0.00125 / 1000,    // per token
    gemini_1_5_pro_output: 0.005 / 1000,     // per token
    gemini_1_5_flash_input: 0.000125 / 1000, // per token
    gemini_1_5_flash_output: 0.0005 / 1000,  // per token
    pinecone_query: 0.0001,                  // per query
    redis_operation: 0.00001,                // per operation
    cohere_rerank: 0.002                     // per request
  };

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!
    });
  }

  // ==========================================================================
  // Record Costs
  // ==========================================================================

  /**
   * Record a cost entry
   */
  async recordCost(entry: CostEntry): Promise<void> {
    try {
      // Store in database
      await this.supabase
        .from('cost_tracking')
        .insert({
          service: entry.service,
          cost_usd: entry.cost_usd,
          operation_count: entry.operation_count,
          metadata: entry.metadata
        });

      // Update cached totals
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `cost:daily:${today}:${entry.service}`;

      const currentTotal = await this.redis.get(cacheKey) as number || 0;
      await this.redis.setex(
        cacheKey,
        86400, // 24 hours
        currentTotal + entry.cost_usd
      );

    } catch (error) {
      console.error('Failed to record cost:', error);
      throw error;
    }
  }

  /**
   * Record Gemini API cost
   */
  async recordGeminiCost(
    inputTokens: number,
    outputTokens: number,
    model: 'gemini-1.5-pro' | 'gemini-1.5-flash'
  ): Promise<number> {
    const inputCost = model === 'gemini-1.5-pro'
      ? inputTokens * this.PRICING.gemini_1_5_pro_input
      : inputTokens * this.PRICING.gemini_1_5_flash_input;

    const outputCost = model === 'gemini-1.5-pro'
      ? outputTokens * this.PRICING.gemini_1_5_pro_output
      : outputTokens * this.PRICING.gemini_1_5_flash_output;

    const totalCost = inputCost + outputCost;

    await this.recordCost({
      service: 'gemini_api',
      cost_usd: totalCost,
      operation_count: 1,
      metadata: { model, inputTokens, outputTokens }
    });

    return totalCost;
  }

  /**
   * Record Pinecone query cost
   */
  async recordPineconeCost(queryCount: number = 1): Promise<number> {
    const cost = queryCount * this.PRICING.pinecone_query;

    await this.recordCost({
      service: 'pinecone',
      cost_usd: cost,
      operation_count: queryCount
    });

    return cost;
  }

  /**
   * Record Redis operation cost
   */
  async recordRedisCost(operationCount: number = 1): Promise<number> {
    const cost = operationCount * this.PRICING.redis_operation;

    await this.recordCost({
      service: 'redis',
      cost_usd: cost,
      operation_count: operationCount
    });

    return cost;
  }

  /**
   * Record Cohere reranking cost
   */
  async recordCohereCost(requestCount: number = 1): Promise<number> {
    const cost = requestCount * this.PRICING.cohere_rerank;

    await this.recordCost({
      service: 'cohere',
      cost_usd: cost,
      operation_count: requestCount
    });

    return cost;
  }

  // ==========================================================================
  // Get Costs
  // ==========================================================================

  /**
   * Get daily cost breakdown
   */
  async getDailyCost(date?: string): Promise<CostBreakdown> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('cost_tracking')
      .select('service, cost_usd')
      .gte('created_at', `${targetDate} 00:00:00`)
      .lt('created_at', `${targetDate} 23:59:59`);

    if (error) {
      throw new Error(`Failed to get daily cost: ${error.message}`);
    }

    const breakdown: CostBreakdown = {
      gemini_api: 0,
      pinecone_queries: 0,
      redis_operations: 0,
      cohere_reranking: 0,
      other: 0,
      total_usd: 0,
      savings_from_cache: 0
    };

    if (!data) return breakdown;

    for (const entry of data) {
      const cost = parseFloat(entry.cost_usd);

      switch (entry.service) {
        case 'gemini_api':
          breakdown.gemini_api += cost;
          break;
        case 'pinecone':
          breakdown.pinecone_queries += cost;
          break;
        case 'redis':
          breakdown.redis_operations += cost;
          break;
        case 'cohere':
          breakdown.cohere_reranking += cost;
          break;
        default:
          breakdown.other += cost;
      }
    }

    breakdown.total_usd =
      breakdown.gemini_api +
      breakdown.pinecone_queries +
      breakdown.redis_operations +
      breakdown.cohere_reranking +
      breakdown.other;

    // Estimate savings from cache (assuming 75% hit rate)
    // Without cache, we'd make 4x more Gemini API calls
    breakdown.savings_from_cache = breakdown.gemini_api * 3;

    return breakdown;
  }

  /**
   * Get projected monthly cost
   */
  async getProjectedMonthlyCost(): Promise<CostProjection> {
    // Get last 7 days of costs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await this.supabase
      .from('cost_tracking')
      .select('service, cost_usd')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error) {
      throw new Error(`Failed to get projected cost: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        current_daily_avg: 0,
        projected_monthly: 0,
        projected_yearly: 0,
        breakdown: {
          gemini_api: 0,
          pinecone_queries: 0,
          redis_operations: 0,
          cohere_reranking: 0,
          other: 0,
          total_usd: 0,
          savings_from_cache: 0
        }
      };
    }

    // Calculate daily average
    const totalCost = data.reduce((sum, entry) => sum + parseFloat(entry.cost_usd), 0);
    const dailyAvg = totalCost / 7;

    // Project monthly and yearly
    const monthlyProjected = dailyAvg * 30;
    const yearlyProjected = dailyAvg * 365;

    // Breakdown by service
    const breakdown: CostBreakdown = {
      gemini_api: 0,
      pinecone_queries: 0,
      redis_operations: 0,
      cohere_reranking: 0,
      other: 0,
      total_usd: monthlyProjected,
      savings_from_cache: 0
    };

    for (const entry of data) {
      const cost = parseFloat(entry.cost_usd);

      switch (entry.service) {
        case 'gemini_api':
          breakdown.gemini_api += cost;
          break;
        case 'pinecone':
          breakdown.pinecone_queries += cost;
          break;
        case 'redis':
          breakdown.redis_operations += cost;
          break;
        case 'cohere':
          breakdown.cohere_reranking += cost;
          break;
        default:
          breakdown.other += cost;
      }
    }

    // Scale to monthly
    breakdown.gemini_api = (breakdown.gemini_api / 7) * 30;
    breakdown.pinecone_queries = (breakdown.pinecone_queries / 7) * 30;
    breakdown.redis_operations = (breakdown.redis_operations / 7) * 30;
    breakdown.cohere_reranking = (breakdown.cohere_reranking / 7) * 30;
    breakdown.other = (breakdown.other / 7) * 30;
    breakdown.savings_from_cache = breakdown.gemini_api * 3;

    return {
      current_daily_avg: parseFloat(dailyAvg.toFixed(2)),
      projected_monthly: parseFloat(monthlyProjected.toFixed(2)),
      projected_yearly: parseFloat(yearlyProjected.toFixed(2)),
      breakdown
    };
  }

  // ==========================================================================
  // Budget Alerts
  // ==========================================================================

  /**
   * Check budget alerts
   */
  async checkBudgetAlerts(thresholds: {
    daily?: number;
    weekly?: number;
    monthly?: number;
  }): Promise<BudgetAlert[]> {
    const alerts: BudgetAlert[] = [];

    // Check daily threshold
    if (thresholds.daily) {
      const dailyCost = await this.getDailyCost();
      const triggered = dailyCost.total_usd > thresholds.daily;

      alerts.push({
        id: 'daily-budget-alert',
        threshold_usd: thresholds.daily,
        period: 'daily',
        current_spend: dailyCost.total_usd,
        triggered,
        message: triggered
          ? `Daily spend ($${dailyCost.total_usd.toFixed(2)}) exceeded threshold ($${thresholds.daily})`
          : 'Daily budget OK'
      });
    }

    // Check monthly projection
    if (thresholds.monthly) {
      const projection = await this.getProjectedMonthlyCost();
      const triggered = projection.projected_monthly > thresholds.monthly;

      alerts.push({
        id: 'monthly-budget-alert',
        threshold_usd: thresholds.monthly,
        period: 'monthly',
        current_spend: projection.projected_monthly,
        triggered,
        message: triggered
          ? `Projected monthly spend ($${projection.projected_monthly.toFixed(2)}) exceeds budget ($${thresholds.monthly})`
          : 'Monthly projection OK'
      });
    }

    return alerts;
  }

  // ==========================================================================
  // Reporting
  // ==========================================================================

  /**
   * Generate weekly cost report
   */
  async generateWeeklyReport(): Promise<string> {
    const projection = await this.getProjectedMonthlyCost();

    return `
📊 VITAL Platform - Weekly Cost Report

Current Daily Average: $${projection.current_daily_avg.toFixed(2)}
Projected Monthly: $${projection.projected_monthly.toFixed(2)}
Projected Yearly: $${projection.projected_yearly.toFixed(2)}

Breakdown (Monthly):
- Gemini API: $${projection.breakdown.gemini_api.toFixed(2)}
- Pinecone: $${projection.breakdown.pinecone_queries.toFixed(2)}
- Redis: $${projection.breakdown.redis_operations.toFixed(2)}
- Cohere: $${projection.breakdown.cohere_reranking.toFixed(2)}
- Other: $${projection.breakdown.other.toFixed(2)}

💰 Savings from Cache: $${projection.breakdown.savings_from_cache.toFixed(2)}/month
    `.trim();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let costTrackerInstance: CostTracker | null = null;

export function getCostTracker(): CostTracker {
  if (!costTrackerInstance) {
    costTrackerInstance = new CostTracker();
  }
  return costTrackerInstance;
}
