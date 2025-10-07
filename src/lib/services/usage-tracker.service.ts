/**
 * Usage Tracking and Cost Monitoring Service
 * Tracks token usage, costs, and performance metrics for all LLM providers
 */

import { createClient } from '@supabase/supabase-js';

export interface UsageRecord {
  id?: string;
  provider_id: string;
  user_id?: string;
  agent_id?: string;
  workflow_id?: string;
  session_id?: string;

  // Request details
  model_used: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;

  // Cost calculation
  input_cost: number;
  output_cost: number;
  total_cost: number;

  // Performance metrics
  latency_ms: number;
  success: boolean;
  error_message?: string;

  // Request metadata
  request_type: 'completion' | 'chat' | 'embedding' | 'image' | 'function_call';
  temperature?: number;
  max_tokens?: number;

  // Timestamps
  started_at: Date;
  completed_at: Date;
  created_at?: Date;
}

export interface ProviderUsageSummary {
  provider_id: string;
  provider_name: string;
  model_used: string;

  // Usage metrics
  total_requests: number;
  successful_requests: number;
  failed_requests: number;

  // Token metrics
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;

  // Cost metrics
  total_input_cost: number;
  total_output_cost: number;
  total_cost: number;

  // Performance metrics
  average_latency_ms: number;
  success_rate: number;

  // Time period
  period_start: Date;
  period_end: Date;
}

export interface CostBreakdown {
  daily: Array<{
    date: string;
    cost: number;
    tokens: number;
    requests: number;
  }>;
  by_provider: Array<{
    provider_name: string;
    cost: number;
    percentage: number;
  }>;
  by_model: Array<{
    model: string;
    cost: number;
    percentage: number;
  }>;
  by_user: Array<{
    user_id: string;
    cost: number;
    percentage: number;
  }>;
  total_cost: number;
  total_tokens: number;
  total_requests: number;
}

export class UsageTracker {
  private static instance: UsageTracker;
  private supabase: ReturnType<typeof createClient>;

  private constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  /**
   * Record usage data for an LLM request
   */
  async recordUsage(usage: UsageRecord): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('llm_usage_logs' as unknown)
        .insert({
          provider_id: usage.provider_id,
          user_id: usage.user_id,
          agent_id: usage.agent_id,
          workflow_id: usage.workflow_id,
          session_id: usage.session_id,
          model_used: usage.model_used,
          input_tokens: usage.input_tokens,
          output_tokens: usage.output_tokens,
          total_tokens: usage.total_tokens,
          input_cost: usage.input_cost,
          output_cost: usage.output_cost,
          total_cost: usage.total_cost,
          latency_ms: usage.latency_ms,
          success: usage.success,
          error_message: usage.error_message,
          request_type: usage.request_type,
          temperature: usage.temperature,
          max_tokens: usage.max_tokens,
          started_at: usage.started_at.toISOString(),
          completed_at: usage.completed_at.toISOString(),
          created_at: new Date().toISOString()
        } as unknown)
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      // Update provider metrics asynchronously
      this.updateProviderMetrics(usage.provider_id, usage);

      return (data as unknown)?.id || 'unknown';
    } catch (error) {
      console.error('Failed to record usage:', error);
      throw error;
    }
  }

  /**
   * Get usage summary for a specific provider
   */
  async getProviderUsage(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProviderUsageSummary> {
    try {
      const { data, error } = await this.supabase
        .from('llm_usage_logs')
        .select(`
          *,
          llm_providers(provider_name)
        `)
        .eq('provider_id', providerId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return this.createEmptyUsageSummary(providerId, startDate, endDate);
      }

      const summary = this.calculateUsageSummary(data, startDate, endDate);
      return summary;
    } catch (error) {
      console.error('Failed to get provider usage:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive cost breakdown
   */
  async getCostBreakdown(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<CostBreakdown> {
    try {
      let query = this.supabase
        .from('llm_usage_logs')
        .select(`
          *,
          llm_providers(provider_name)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return this.createEmptyCostBreakdown();
      }

      return this.calculateCostBreakdown(data, startDate, endDate);
    } catch (error) {
      console.error('Failed to get cost breakdown:', error);
      throw error;
    }
  }

  /**
   * Get real-time usage metrics
   */
  async getRealTimeMetrics(): Promise<{
    activeProviders: number;
    totalRequestsToday: number;
    totalCostToday: number;
    averageLatency: number;
    successRate: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await this.supabase
        .from('llm_usage_logs')
        .select('*')
        .gte('created_at', today.toISOString());

      if (error) {
        throw error;
      }

      const activeProviders = new Set((data as unknown)?.map((d: unknown) => d.provider_id) || []).size;
      const totalRequests = (data as unknown)?.length || 0;
      const totalCost = (data as unknown)?.reduce((sum: number, d: unknown) => sum + (d.total_cost || 0), 0) || 0;
      const successfulRequests = (data as unknown)?.filter((d: unknown) => d.success).length || 0;
      const averageLatency = (data as unknown)?.length ?
        (data as unknown).reduce((sum: number, d: unknown) => sum + (d.latency_ms || 0), 0) / (data as unknown).length : 0;

      return {
        activeProviders,
        totalRequestsToday: totalRequests,
        totalCostToday: totalCost,
        averageLatency: Math.round(averageLatency),
        successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0
      };
    } catch (error) {
      console.error('Failed to get real-time metrics:', error);
      return {
        activeProviders: 0,
        totalRequestsToday: 0,
        totalCostToday: 0,
        averageLatency: 0,
        successRate: 0
      };
    }
  }

  /**
   * Update provider performance metrics
   */
  private async updateProviderMetrics(providerId: string, usage: UsageRecord): Promise<void> {
    try {
      // Get last 100 requests for this provider to calculate rolling averages
      const { data: recentUsage } = await this.supabase
        .from('llm_usage_logs')
        .select('latency_ms, success')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (recentUsage && recentUsage.length > 0) {
        const avgLatency = recentUsage.reduce((sum: number, u: unknown) => sum + u.latency_ms, 0) / recentUsage.length;
        const successRate = (recentUsage.filter((u: unknown) => u.success).length / recentUsage.length) * 100;

        await (this.supabase as unknown)
          .from('llm_providers')
          .update({
            average_latency_ms: Math.round(avgLatency),
            uptime_percentage: Math.round(successRate * 100) / 100
          })
          .eq('id', providerId);
      }
    } catch (error) {
      console.error('Failed to update provider metrics:', error);
    }
  }

  /**
   * Calculate usage summary from raw data
   */
  private calculateUsageSummary(
    data: unknown[],
    startDate: Date,
    endDate: Date
  ): ProviderUsageSummary {
    const totalRequests = data.length;
    const successfulRequests = data.filter(d => d.success).length;
    const failedRequests = totalRequests - successfulRequests;

    const totalInputTokens = data.reduce((sum, d) => sum + (d.input_tokens || 0), 0);
    const totalOutputTokens = data.reduce((sum, d) => sum + (d.output_tokens || 0), 0);
    const totalTokens = totalInputTokens + totalOutputTokens;

    const totalInputCost = data.reduce((sum, d) => sum + (d.input_cost || 0), 0);
    const totalOutputCost = data.reduce((sum, d) => sum + (d.output_cost || 0), 0);
    const totalCost = totalInputCost + totalOutputCost;

    const averageLatency = totalRequests > 0 ?
      data.reduce((sum, d) => sum + (d.latency_ms || 0), 0) / totalRequests : 0;

    return {
      provider_id: data[0]?.provider_id || '',
      provider_name: data[0]?.llm_providers?.provider_name || 'Unknown',
      model_used: data[0]?.model_used || 'Unknown',
      total_requests: totalRequests,
      successful_requests: successfulRequests,
      failed_requests: failedRequests,
      total_input_tokens: totalInputTokens,
      total_output_tokens: totalOutputTokens,
      total_tokens: totalTokens,
      total_input_cost: totalInputCost,
      total_output_cost: totalOutputCost,
      total_cost: totalCost,
      average_latency_ms: Math.round(averageLatency),
      success_rate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      period_start: startDate,
      period_end: endDate
    };
  }

  /**
   * Calculate cost breakdown from raw data
   */
  private calculateCostBreakdown(data: unknown[], startDate: Date, endDate: Date): CostBreakdown {
    // Daily breakdown
    const dailyMap = new Map<string, { cost: number; tokens: number; requests: number }>();

    // Provider breakdown
    const providerMap = new Map<string, number>();

    // Model breakdown
    const modelMap = new Map<string, number>();

    // User breakdown
    const userMap = new Map<string, number>();

    let totalCost = 0;
    let totalTokens = 0;
    const totalRequests = data.length;

    data.forEach(record => {
      const cost = record.total_cost || 0;
      const tokens = record.total_tokens || 0;
      totalCost += cost;
      totalTokens += tokens;

      // Daily
      const date = new Date(record.created_at).toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { cost: 0, tokens: 0, requests: 0 };
      dailyMap.set(date, {
        cost: existing.cost + cost,
        tokens: existing.tokens + tokens,
        requests: existing.requests + 1
      });

      // Provider
      const providerName = record.llm_providers?.provider_name || 'Unknown';
      providerMap.set(providerName, (providerMap.get(providerName) || 0) + cost);

      // Model
      const model = record.model_used || 'Unknown';
      modelMap.set(model, (modelMap.get(model) || 0) + cost);

      // User
      if (record.user_id) {
        userMap.set(record.user_id, (userMap.get(record.user_id) || 0) + cost);
      }
    });

    return {
      daily: Array.from(dailyMap.entries()).map(([date, data]) => ({
        date,
        cost: Math.round(data.cost * 100) / 100,
        tokens: data.tokens,
        requests: data.requests
      })).sort((a, b) => a.date.localeCompare(b.date)),

      by_provider: Array.from(providerMap.entries()).map(([name, cost]) => ({
        provider_name: name,
        cost: Math.round(cost * 100) / 100,
        percentage: totalCost > 0 ? Math.round((cost / totalCost) * 10000) / 100 : 0
      })).sort((a, b) => b.cost - a.cost),

      by_model: Array.from(modelMap.entries()).map(([model, cost]) => ({
        model,
        cost: Math.round(cost * 100) / 100,
        percentage: totalCost > 0 ? Math.round((cost / totalCost) * 10000) / 100 : 0
      })).sort((a, b) => b.cost - a.cost),

      by_user: Array.from(userMap.entries()).map(([user_id, cost]) => ({
        user_id,
        cost: Math.round(cost * 100) / 100,
        percentage: totalCost > 0 ? Math.round((cost / totalCost) * 10000) / 100 : 0
      })).sort((a, b) => b.cost - a.cost),

      total_cost: Math.round(totalCost * 100) / 100,
      total_tokens: totalTokens,
      total_requests: totalRequests
    };
  }

  private createEmptyUsageSummary(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): ProviderUsageSummary {
    return {
      provider_id: providerId,
      provider_name: 'Unknown',
      model_used: 'Unknown',
      total_requests: 0,
      successful_requests: 0,
      failed_requests: 0,
      total_input_tokens: 0,
      total_output_tokens: 0,
      total_tokens: 0,
      total_input_cost: 0,
      total_output_cost: 0,
      total_cost: 0,
      average_latency_ms: 0,
      success_rate: 0,
      period_start: startDate,
      period_end: endDate
    };
  }

  private createEmptyCostBreakdown(): CostBreakdown {
    return {
      daily: [],
      by_provider: [],
      by_model: [],
      by_user: [],
      total_cost: 0,
      total_tokens: 0,
      total_requests: 0
    };
  }
}

// Export singleton instance
export const _usageTracker = UsageTracker.getInstance();

// Export the service instance with the expected name
export const usageTracker = _usageTracker;

export default UsageTracker;