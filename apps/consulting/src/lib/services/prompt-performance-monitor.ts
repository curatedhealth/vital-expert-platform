import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PromptMetrics {
  prompt_id: string;
  usage_count: number;
  success_rate: number;
  average_rating: number;
  average_response_time: number;
  last_used: string | null;
  total_tokens_used: number;
  cost_per_query: number;
  user_satisfaction: number;
  error_rate: number;
  most_common_errors: string[];
  usage_by_agent: Record<string, number>;
  usage_by_domain: Record<string, number>;
  peak_usage_hours: number[];
  seasonal_trends: Record<string, number>;
}

export interface PromptUsage {
  id: string;
  prompt_id: string;
  agent_id?: string;
  user_id?: string;
  user_prompt: string;
  enhanced_prompt: string;
  response_time_ms: number;
  success: boolean;
  rating?: number;
  feedback?: string;
  error_message?: string;
  tokens_used: number;
  cost: number;
  created_at: string;
}

export class PromptPerformanceMonitor {
  /**
   * Track prompt usage
   */
  static async trackUsage(usageData: Omit<PromptUsage, 'id' | 'created_at'>): Promise<void> {
    try {
      await supabase
        .from('prompt_usage')
        .insert([{
          ...usageData,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error tracking prompt usage:', error);
    }
  }

  /**
   * Get prompt performance metrics
   */
  static async getPromptMetrics(promptId: string, timeRange: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<PromptMetrics | null> {
    try {
      const timeRangeMap = {
        day: 1,
        week: 7,
        month: 30,
        year: 365
      };

      const days = timeRangeMap[timeRange];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get usage data
      const { data: usageData, error: usageError } = await supabase
        .from('prompt_usage')
        .select('*')
        .eq('prompt_id', promptId)
        .gte('created_at', startDate.toISOString());

      if (usageError) throw usageError;

      if (!usageData || usageData.length === 0) {
        return {
          prompt_id: promptId,
          usage_count: 0,
          success_rate: 0,
          average_rating: 0,
          average_response_time: 0,
          last_used: null,
          total_tokens_used: 0,
          cost_per_query: 0,
          user_satisfaction: 0,
          error_rate: 0,
          most_common_errors: [],
          usage_by_agent: {},
          usage_by_domain: {},
          peak_usage_hours: [],
          seasonal_trends: {}
        };
      }

      // Calculate metrics
      const totalUsage = usageData.length;
      const successfulUsage = usageData.filter(u => u.success).length;
      const ratedUsage = usageData.filter(u => u.rating !== null);
      const errorUsage = usageData.filter(u => !u.success);

      const successRate = totalUsage > 0 ? (successfulUsage / totalUsage) * 100 : 0;
      const averageRating = ratedUsage.length > 0 
        ? ratedUsage.reduce((sum, u) => sum + (u.rating || 0), 0) / ratedUsage.length 
        : 0;
      const averageResponseTime = usageData.reduce((sum, u) => sum + u.response_time_ms, 0) / totalUsage;
      const totalTokensUsed = usageData.reduce((sum, u) => sum + u.tokens_used, 0);
      const totalCost = usageData.reduce((sum, u) => sum + u.cost, 0);
      const costPerQuery = totalUsage > 0 ? totalCost / totalUsage : 0;
      const errorRate = totalUsage > 0 ? (errorUsage.length / totalUsage) * 100 : 0;

      // Get most common errors
      const errorMessages = errorUsage
        .map(u => u.error_message)
        .filter(Boolean)
        .reduce((acc, error) => {
          acc[error] = (acc[error] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const mostCommonErrors = Object.entries(errorMessages)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([error]) => error);

      // Get usage by agent
      const usageByAgent = usageData
        .filter(u => u.agent_id)
        .reduce((acc, u) => {
          acc[u.agent_id!] = (acc[u.agent_id!] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      // Get usage by domain (would need to join with prompts table)
      const { data: promptData } = await supabase
        .from('prompts')
        .select('domain')
        .eq('id', promptId)
        .single();

      const usageByDomain = promptData ? { [promptData.domain]: totalUsage } : {};

      // Get peak usage hours
      const usageByHour = usageData.reduce((acc, u) => {
        const hour = new Date(u.created_at).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const peakUsageHours = Object.entries(usageByHour)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));

      // Get seasonal trends
      const seasonalTrends = usageData.reduce((acc, u) => {
        const month = new Date(u.created_at).getMonth();
        const monthName = new Date(0, month).toLocaleString('default', { month: 'short' });
        acc[monthName] = (acc[monthName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        prompt_id: promptId,
        usage_count: totalUsage,
        success_rate: successRate,
        average_rating: averageRating,
        average_response_time: averageResponseTime,
        last_used: usageData[usageData.length - 1]?.created_at || null,
        total_tokens_used: totalTokensUsed,
        cost_per_query: costPerQuery,
        user_satisfaction: averageRating, // Assuming rating represents satisfaction
        error_rate: errorRate,
        most_common_errors: mostCommonErrors,
        usage_by_agent: usageByAgent,
        usage_by_domain: usageByDomain,
        peak_usage_hours: peakUsageHours,
        seasonal_trends: seasonalTrends
      };
    } catch (error) {
      console.error('Error getting prompt metrics:', error);
      return null;
    }
  }

  /**
   * Get all prompts performance overview
   */
  static async getAllPromptsPerformance(timeRange: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<PromptMetrics[]> {
    try {
      // Get all prompts with usage data
      const { data: prompts, error: promptsError } = await supabase
        .from('prompts')
        .select('id, name, display_name, domain')
        .not('prompt_starter', 'is', null);

      if (promptsError) throw promptsError;

      const performanceData: PromptMetrics[] = [];

      for (const prompt of prompts || []) {
        const metrics = await this.getPromptMetrics(prompt.id, timeRange);
        if (metrics) {
          performanceData.push(metrics);
        }
      }

      // Sort by usage count descending
      performanceData.sort((a, b) => b.usage_count - a.usage_count);

      return performanceData;
    } catch (error) {
      console.error('Error getting all prompts performance:', error);
      return [];
    }
  }

  /**
   * Get performance trends
   */
  static async getPerformanceTrends(
    promptId: string,
    metric: 'usage_count' | 'success_rate' | 'average_rating' | 'response_time',
    timeRange: 'day' | 'week' | 'month' = 'week'
  ): Promise<{ date: string; value: number }[]> {
    try {
      const timeRangeMap = {
        day: 1,
        week: 7,
        month: 30
      };

      const days = timeRangeMap[timeRange];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: usageData, error } = await supabase
        .from('prompt_usage')
        .select('*')
        .eq('prompt_id', promptId)
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      if (error) throw error;

      if (!usageData || usageData.length === 0) return [];

      // Group by date and calculate metric
      const groupedData = usageData.reduce((acc, usage) => {
        const date = new Date(usage.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(usage);
        return acc;
      }, {} as Record<string, typeof usageData>);

      const trends = Object.entries(groupedData).map(([date, usages]) => {
        let value = 0;

        switch (metric) {
          case 'usage_count':
            value = usages.length;
            break;
          case 'success_rate':
            const successful = usages.filter(u => u.success).length;
            value = usages.length > 0 ? (successful / usages.length) * 100 : 0;
            break;
          case 'average_rating':
            const rated = usages.filter(u => u.rating !== null);
            value = rated.length > 0 
              ? rated.reduce((sum, u) => sum + (u.rating || 0), 0) / rated.length 
              : 0;
            break;
          case 'response_time':
            value = usages.reduce((sum, u) => sum + u.response_time_ms, 0) / usages.length;
            break;
        }

        return { date, value };
      });

      return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error('Error getting performance trends:', error);
      return [];
    }
  }

  /**
   * Get top performing prompts
   */
  static async getTopPerformingPrompts(
    metric: 'usage_count' | 'success_rate' | 'average_rating' = 'usage_count',
    limit: number = 10
  ): Promise<{ prompt: any; metrics: PromptMetrics }[]> {
    try {
      const allPerformance = await this.getAllPromptsPerformance();
      
      // Sort by the specified metric
      const sorted = allPerformance.sort((a, b) => {
        switch (metric) {
          case 'usage_count':
            return b.usage_count - a.usage_count;
          case 'success_rate':
            return b.success_rate - a.success_rate;
          case 'average_rating':
            return b.average_rating - a.average_rating;
          default:
            return 0;
        }
      });

      const topPrompts = sorted.slice(0, limit);

      // Get prompt details
      const promptIds = topPrompts.map(p => p.prompt_id);
      const { data: prompts } = await supabase
        .from('prompts')
        .select('id, name, display_name, domain, description')
        .in('id', promptIds);

      return topPrompts.map(metrics => ({
        prompt: prompts?.find(p => p.id === metrics.prompt_id),
        metrics
      }));
    } catch (error) {
      console.error('Error getting top performing prompts:', error);
      return [];
    }
  }

  /**
   * Get performance alerts
   */
  static async getPerformanceAlerts(): Promise<{
    type: 'error_rate_high' | 'low_usage' | 'poor_rating' | 'slow_response';
    prompt_id: string;
    prompt_name: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }[]> {
    try {
      const allPerformance = await this.getAllPromptsPerformance();
      const alerts: any[] = [];

      for (const metrics of allPerformance) {
        // High error rate alert
        if (metrics.error_rate > 20) {
          alerts.push({
            type: 'error_rate_high',
            prompt_id: metrics.prompt_id,
            prompt_name: 'Unknown', // Would need to fetch prompt name
            message: `Error rate is ${metrics.error_rate.toFixed(1)}%`,
            severity: metrics.error_rate > 50 ? 'high' : 'medium'
          });
        }

        // Low usage alert
        if (metrics.usage_count < 5) {
          alerts.push({
            type: 'low_usage',
            prompt_id: metrics.prompt_id,
            prompt_name: 'Unknown',
            message: `Only ${metrics.usage_count} uses in the last month`,
            severity: 'low'
          });
        }

        // Poor rating alert
        if (metrics.average_rating > 0 && metrics.average_rating < 3) {
          alerts.push({
            type: 'poor_rating',
            prompt_id: metrics.prompt_id,
            prompt_name: 'Unknown',
            message: `Average rating is ${metrics.average_rating.toFixed(1)}/5`,
            severity: 'medium'
          });
        }

        // Slow response alert
        if (metrics.average_response_time > 5000) {
          alerts.push({
            type: 'slow_response',
            prompt_id: metrics.prompt_id,
            prompt_name: 'Unknown',
            message: `Average response time is ${(metrics.average_response_time / 1000).toFixed(1)}s`,
            severity: 'medium'
          });
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error getting performance alerts:', error);
      return [];
    }
  }

  /**
   * Create performance dashboard data
   */
  static async getDashboardData(): Promise<{
    totalPrompts: number;
    totalUsage: number;
    averageSuccessRate: number;
    averageRating: number;
    topPrompts: any[];
    recentAlerts: any[];
    usageTrends: any[];
  }> {
    try {
      const allPerformance = await this.getAllPromptsPerformance();
      
      const totalPrompts = allPerformance.length;
      const totalUsage = allPerformance.reduce((sum, p) => sum + p.usage_count, 0);
      const averageSuccessRate = allPerformance.length > 0 
        ? allPerformance.reduce((sum, p) => sum + p.success_rate, 0) / allPerformance.length 
        : 0;
      const averageRating = allPerformance.length > 0 
        ? allPerformance.reduce((sum, p) => sum + p.average_rating, 0) / allPerformance.length 
        : 0;

      const topPrompts = await this.getTopPerformingPrompts('usage_count', 5);
      const recentAlerts = await this.getPerformanceAlerts();

      // Mock usage trends (would need actual time series data)
      const usageTrends = allPerformance.slice(0, 7).map((p, index) => ({
        date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usage: p.usage_count
      }));

      return {
        totalPrompts,
        totalUsage,
        averageSuccessRate,
        averageRating,
        topPrompts,
        recentAlerts,
        usageTrends
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return {
        totalPrompts: 0,
        totalUsage: 0,
        averageSuccessRate: 0,
        averageRating: 0,
        topPrompts: [],
        recentAlerts: [],
        usageTrends: []
      };
    }
  }
}

export default PromptPerformanceMonitor;
