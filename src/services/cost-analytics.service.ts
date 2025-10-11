import { createClient } from '@supabase/supabase-js';

// Types
export interface CostOverview {
  currentDailyCost: number;
  monthlyProjection: number;
  budgetUsed: number;
  requestsToday: number;
  averageLatency: number;
  cacheHitRate: number;
  errorRate: number;
  activeUsers: number;
  topModels: Array<{
    model: string;
    cost: number;
    requests: number;
    percentage: number;
  }>;
  hourlyData: Array<{
    hour: string;
    cost: number;
    requests: number;
    cacheHits: number;
  }>;
}

export interface CostByTenant {
  tenantId: string;
  tenantName: string;
  dailyCost: number;
  monthlyCost: number;
  requestCount: number;
  averageCostPerRequest: number;
  topModels: Array<{
    model: string;
    cost: number;
    percentage: number;
  }>;
  budgetStatus: 'under' | 'warning' | 'critical';
  budgetUsed: number;
}

export interface BudgetConfiguration {
  id: string;
  tenantId?: string;
  userId?: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly';
  amount: number;
  warningThreshold: number;
  criticalThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CostAnomaly {
  id: string;
  tenantId?: string;
  userId?: string;
  type: 'spike' | 'drop' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
  description: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface UsageForecast {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  predictions: Array<{
    timestamp: string;
    predictedCost: number;
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CostAllocationRule {
  id: string;
  name: string;
  type: 'even_split' | 'usage_based' | 'custom';
  tenantId?: string;
  departmentId?: string;
  rules: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CostByModel {
  model: string;
  provider: string;
  totalCost: number;
  requestCount: number;
  averageCostPerRequest: number;
  averageTokensPerRequest: number;
  cacheHitRate: number;
  errorRate: number;
  lastUsed: string;
}

export class CostAnalyticsService {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Get comprehensive cost overview
  async getCostOverview(tenantId?: string, userId?: string): Promise<CostOverview> {
    const { data: tokenUsage, error } = await this.supabase
      .from('token_usage_logs')
      .select(`
        *,
        user_profiles!inner(email, organization_id),
        organizations!inner(name)
      `)
      .gte('created_at', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Filter by tenant/user if specified
    let filteredData = tokenUsage;
    if (tenantId) {
      filteredData = tokenUsage.filter((log: any) => log.user_profiles.organization_id === tenantId);
    }
    if (userId) {
      filteredData = filteredData.filter((log: any) => log.user_id === userId);
    }

    // Calculate current daily cost
    const currentDailyCost = filteredData.reduce((sum: number, log: any) => sum + (log.cost_usd || 0), 0);

    // Calculate monthly projection (simple linear projection)
    const hoursElapsed = new Date().getHours();
    const monthlyProjection = hoursElapsed > 0 ? (currentDailyCost / hoursElapsed) * 24 * 30 : 0;

    // Get budget configuration
    const budget = await this.getBudgetConfiguration(tenantId, userId);
    const budgetUsed = budget ? (currentDailyCost / budget.amount) * 100 : 0;

    // Calculate metrics
    const requestsToday = filteredData.length;
    const activeUsers = new Set(filteredData.map((log: any) => log.user_id)).size;
    
    // Calculate average latency
    const avgLatency = filteredData.length > 0 
      ? filteredData.reduce((sum: number, log: any) => sum + (log.response_time_ms || 0), 0) / filteredData.length
      : 0;

    // Calculate cache hit rate
    const cacheHits = filteredData.filter((log: any) => log.cache_hit).length;
    const cacheHitRate = requestsToday > 0 ? (cacheHits / requestsToday) * 100 : 0;

    // Calculate error rate
    const errors = filteredData.filter((log: any) => log.error_occurred).length;
    const errorRate = requestsToday > 0 ? (errors / requestsToday) * 100 : 0;

    // Calculate top models
    const modelCosts = filteredData.reduce((acc: any, log: any) => {
      const model = log.model_name || 'unknown';
      if (!acc[model]) {
        acc[model] = { cost: 0, requests: 0 };
      }
      acc[model].cost += log.cost_usd || 0;
      acc[model].requests += 1;
      return acc;
    }, {});

    const topModels = Object.entries(modelCosts)
      .map(([model, data]: [string, any]) => ({
        model,
        cost: data.cost,
        requests: data.requests,
        percentage: currentDailyCost > 0 ? (data.cost / currentDailyCost) * 100 : 0
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    // Generate hourly data
    const hourlyData = this.generateHourlyData(filteredData);

    return {
      currentDailyCost,
      monthlyProjection,
      budgetUsed,
      requestsToday,
      averageLatency: avgLatency,
      cacheHitRate,
      errorRate,
      activeUsers,
      topModels,
      hourlyData
    };
  }

  // Get cost breakdown by tenant
  async getCostByTenant(): Promise<CostByTenant[]> {
    const { data: tokenUsage, error } = await this.supabase
      .from('token_usage_logs')
      .select(`
        *,
        user_profiles!inner(email, organization_id),
        organizations!inner(name)
      `)
      .gte('created_at', new Date().toISOString().split('T')[0]);

    if (error) throw error;

    // Group by tenant
    const tenantCosts = tokenUsage.reduce((acc: any, log: any) => {
      const tenantId = log.user_profiles.organization_id;
      const tenantName = log.organizations.name;
      
      if (!acc[tenantId]) {
        acc[tenantId] = {
          tenantId,
          tenantName,
          dailyCost: 0,
          requestCount: 0,
          models: {}
        };
      }
      
      acc[tenantId].dailyCost += log.cost_usd || 0;
      acc[tenantId].requestCount += 1;
      
      const model = log.model_name || 'unknown';
      if (!acc[tenantId].models[model]) {
        acc[tenantId].models[model] = 0;
      }
      acc[tenantId].models[model] += log.cost_usd || 0;
      
      return acc;
    }, {});

    // Calculate monthly costs and other metrics
    const result = await Promise.all(Object.values(tenantCosts).map(async (tenant: any) => {
      const monthlyCost = tenant.dailyCost * 30; // Simple projection
      const averageCostPerRequest = tenant.requestCount > 0 ? tenant.dailyCost / tenant.requestCount : 0;
      
      // Get budget for tenant
      const budget = await this.getBudgetConfiguration(tenant.tenantId);
      const budgetUsed = budget ? (tenant.dailyCost / budget.amount) * 100 : 0;
      
      let budgetStatus: 'under' | 'warning' | 'critical' = 'under';
      if (budget) {
        if (budgetUsed >= budget.criticalThreshold) budgetStatus = 'critical';
        else if (budgetUsed >= budget.warningThreshold) budgetStatus = 'warning';
      }

      // Calculate top models
      const topModels = Object.entries(tenant.models)
        .map(([model, cost]: [string, any]) => ({
          model,
          cost,
          percentage: tenant.dailyCost > 0 ? (cost / tenant.dailyCost) * 100 : 0
        }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 3);

      return {
        tenantId: tenant.tenantId,
        tenantName: tenant.tenantName,
        dailyCost: tenant.dailyCost,
        monthlyCost,
        requestCount: tenant.requestCount,
        averageCostPerRequest,
        topModels,
        budgetStatus,
        budgetUsed
      };
    }));

    return result.sort((a, b) => b.dailyCost - a.dailyCost);
  }

  // Get cost breakdown by model
  async getCostByModel(tenantId?: string, userId?: string): Promise<CostByModel[]> {
    const { data: tokenUsage, error } = await this.supabase
      .from('token_usage_logs')
      .select(`
        *,
        user_profiles!inner(email, organization_id)
      `)
      .gte('created_at', new Date().toISOString().split('T')[0]);

    if (error) throw error;

    // Filter by tenant/user if specified
    let filteredData = tokenUsage;
    if (tenantId) {
      filteredData = tokenUsage.filter((log: any) => log.user_profiles.organization_id === tenantId);
    }
    if (userId) {
      filteredData = filteredData.filter((log: any) => log.user_id === userId);
    }

    // Group by model
    const modelCosts = filteredData.reduce((acc: any, log: any) => {
      const model = log.model_name || 'unknown';
      const provider = log.provider || 'unknown';
      
      if (!acc[model]) {
        acc[model] = {
          model,
          provider,
          totalCost: 0,
          requestCount: 0,
          totalTokens: 0,
          cacheHits: 0,
          errors: 0,
          lastUsed: log.created_at
        };
      }
      
      acc[model].totalCost += log.cost_usd || 0;
      acc[model].requestCount += 1;
      acc[model].totalTokens += (log.input_tokens || 0) + (log.output_tokens || 0);
      if (log.cache_hit) acc[model].cacheHits += 1;
      if (log.error_occurred) acc[model].errors += 1;
      if (new Date(log.created_at) > new Date(acc[model].lastUsed)) {
        acc[model].lastUsed = log.created_at;
      }
      
      return acc;
    }, {});

    // Calculate metrics for each model
    const result = Object.values(modelCosts).map((model: any) => ({
      model: model.model,
      provider: model.provider,
      totalCost: model.totalCost,
      requestCount: model.requestCount,
      averageCostPerRequest: model.requestCount > 0 ? model.totalCost / model.requestCount : 0,
      averageTokensPerRequest: model.requestCount > 0 ? model.totalTokens / model.requestCount : 0,
      cacheHitRate: model.requestCount > 0 ? (model.cacheHits / model.requestCount) * 100 : 0,
      errorRate: model.requestCount > 0 ? (model.errors / model.requestCount) * 100 : 0,
      lastUsed: model.lastUsed
    }));

    return result.sort((a, b) => b.totalCost - a.totalCost);
  }

  // Budget management
  async getBudgetConfiguration(tenantId?: string, userId?: string): Promise<BudgetConfiguration | null> {
    const { data, error } = await this.supabase
      .from('budget_configurations')
      .select('*')
      .eq('is_active', true)
      .eq(tenantId ? 'tenant_id' : 'tenant_id', tenantId || null)
      .eq(userId ? 'user_id' : 'user_id', userId || null)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createBudgetConfiguration(budget: Omit<BudgetConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<BudgetConfiguration> {
    const { data, error } = await this.supabase
      .from('budget_configurations')
      .insert({
        ...budget,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBudgetConfiguration(id: string, updates: Partial<BudgetConfiguration>): Promise<BudgetConfiguration> {
    const { data, error } = await this.supabase
      .from('budget_configurations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBudgetConfiguration(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('budget_configurations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Anomaly detection using statistical analysis
  async detectAnomalies(tenantId?: string, userId?: string): Promise<CostAnomaly[]> {
    const { data: tokenUsage, error } = await this.supabase
      .from('token_usage_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Filter by tenant/user if specified
    let filteredData = tokenUsage;
    if (tenantId) {
      filteredData = tokenUsage.filter((log: any) => log.organization_id === tenantId);
    }
    if (userId) {
      filteredData = filteredData.filter((log: any) => log.user_id === userId);
    }

    // Group by hour for analysis
    const hourlyCosts = this.groupByHour(filteredData);
    const costs = Object.values(hourlyCosts).map((hour: any) => hour.cost);
    
    if (costs.length < 24) return []; // Need at least 24 hours of data

    // Calculate statistical measures
    const mean = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
    const variance = costs.reduce((sum, cost) => sum + Math.pow(cost - mean, 2), 0) / costs.length;
    const stdDev = Math.sqrt(variance);
    const threshold = 2 * stdDev; // 2 standard deviations

    // Detect anomalies
    const anomalies: CostAnomaly[] = [];
    Object.entries(hourlyCosts).forEach(([hour, data]: [string, any]) => {
      const deviation = Math.abs(data.cost - mean);
      if (deviation > threshold) {
        const severity = deviation > 3 * stdDev ? 'critical' : 
                        deviation > 2.5 * stdDev ? 'high' : 
                        deviation > 2 * stdDev ? 'medium' : 'low';
        
        anomalies.push({
          id: `anomaly_${hour}_${Date.now()}`,
          tenantId,
          userId,
          type: data.cost > mean ? 'spike' : 'drop',
          severity,
          detectedAt: new Date().toISOString(),
          description: `Cost ${data.cost > mean ? 'spike' : 'drop'} detected: $${data.cost.toFixed(2)} vs expected $${mean.toFixed(2)}`,
          currentValue: data.cost,
          expectedValue: mean,
          deviation: ((data.cost - mean) / mean) * 100,
          isResolved: false
        });
      }
    });

    // Save anomalies to database
    if (anomalies.length > 0) {
      await this.supabase
        .from('cost_anomalies')
        .insert(anomalies);
    }

    return anomalies;
  }

  // Usage forecasting using simple linear regression
  async forecastUsage(period: 'hourly' | 'daily' | 'weekly' | 'monthly'): Promise<UsageForecast> {
    const days = period === 'hourly' ? 1 : period === 'daily' ? 7 : period === 'weekly' ? 30 : 90;
    const { data: tokenUsage, error } = await this.supabase
      .from('token_usage_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group data by period
    const groupedData = this.groupDataByPeriod(tokenUsage, period);
    const costs = Object.values(groupedData).map((period: any) => period.cost);
    
    if (costs.length < 3) {
      return {
        period,
        predictions: [],
        recommendations: ['Insufficient data for forecasting'],
        riskLevel: 'medium'
      };
    }

    // Simple linear regression
    const { slope, intercept, r2 } = this.calculateLinearRegression(costs);
    
    // Generate predictions for next 7 periods
    const predictions = [];
    const now = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const futureIndex = costs.length + i - 1;
      const predictedCost = slope * futureIndex + intercept;
      const confidence = Math.max(0, Math.min(1, r2)); // R² as confidence
      
      predictions.push({
        timestamp: this.getNextPeriodTimestamp(now, period, i),
        predictedCost: Math.max(0, predictedCost),
        confidence,
        trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable'
      });
    }

    // Generate recommendations
    const recommendations = this.generateForecastRecommendations(predictions, costs);
    const riskLevel = this.calculateRiskLevel(predictions, costs);

    return {
      period,
      predictions,
      recommendations,
      riskLevel
    };
  }

  // Cost allocation rules
  async getCostAllocationRules(tenantId?: string): Promise<CostAllocationRule[]> {
    const { data, error } = await this.supabase
      .from('cost_allocation_rules')
      .select('*')
      .eq(tenantId ? 'tenant_id' : 'tenant_id', tenantId || null)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createCostAllocationRule(rule: Omit<CostAllocationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<CostAllocationRule> {
    const { data, error } = await this.supabase
      .from('cost_allocation_rules')
      .insert({
        ...rule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Helper methods
  private generateHourlyData(data: any[]): Array<{ hour: string; cost: number; requests: number; cacheHits: number }> {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      cost: 0,
      requests: 0,
      cacheHits: 0
    }));

    data.forEach((log: any) => {
      const hour = new Date(log.created_at).getHours();
      hourlyData[hour].cost += log.cost_usd || 0;
      hourlyData[hour].requests += 1;
      if (log.cache_hit) hourlyData[hour].cacheHits += 1;
    });

    return hourlyData;
  }

  private groupByHour(data: any[]): Record<string, { cost: number; requests: number }> {
    return data.reduce((acc, log) => {
      const hour = new Date(log.created_at).toISOString().slice(0, 13) + ':00:00';
      if (!acc[hour]) {
        acc[hour] = { cost: 0, requests: 0 };
      }
      acc[hour].cost += log.cost_usd || 0;
      acc[hour].requests += 1;
      return acc;
    }, {});
  }

  private groupDataByPeriod(data: any[], period: string): Record<string, { cost: number; requests: number }> {
    return data.reduce((acc, log) => {
      let key: string;
      const date = new Date(log.created_at);
      
      switch (period) {
        case 'hourly':
          key = date.toISOString().slice(0, 13) + ':00:00';
          break;
        case 'daily':
          key = date.toISOString().slice(0, 10);
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'monthly':
          key = date.toISOString().slice(0, 7);
          break;
        default:
          key = date.toISOString().slice(0, 10);
      }
      
      if (!acc[key]) {
        acc[key] = { cost: 0, requests: 0 };
      }
      acc[key].cost += log.cost_usd || 0;
      acc[key].requests += 1;
      return acc;
    }, {});
  }

  private calculateLinearRegression(data: number[]): { slope: number; intercept: number; r2: number } {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R²
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, val, i) => sum + Math.pow(val - (slope * i + intercept), 2), 0);
    const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const r2 = 1 - (ssRes / ssTot);
    
    return { slope, intercept, r2 };
  }

  private getNextPeriodTimestamp(now: Date, period: string, offset: number): string {
    const next = new Date(now);
    
    switch (period) {
      case 'hourly':
        next.setHours(next.getHours() + offset);
        break;
      case 'daily':
        next.setDate(next.getDate() + offset);
        break;
      case 'weekly':
        next.setDate(next.getDate() + offset * 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + offset);
        break;
    }
    
    return next.toISOString();
  }

  private generateForecastRecommendations(predictions: any[], historicalCosts: number[]): string[] {
    const recommendations = [];
    const avgHistorical = historicalCosts.reduce((sum, cost) => sum + cost, 0) / historicalCosts.length;
    const avgPredicted = predictions.reduce((sum, pred) => sum + pred.predictedCost, 0) / predictions.length;
    
    if (avgPredicted > avgHistorical * 1.5) {
      recommendations.push('Consider implementing cost controls or switching to more efficient models');
    }
    
    if (predictions.some(p => p.trend === 'increasing')) {
      recommendations.push('Monitor usage patterns and consider budget alerts');
    }
    
    if (avgPredicted < avgHistorical * 0.5) {
      recommendations.push('Usage is decreasing - good opportunity to test premium models');
    }
    
    return recommendations;
  }

  private calculateRiskLevel(predictions: any[], historicalCosts: number[]): 'low' | 'medium' | 'high' {
    const avgHistorical = historicalCosts.reduce((sum, cost) => sum + cost, 0) / historicalCosts.length;
    const maxPredicted = Math.max(...predictions.map(p => p.predictedCost));
    const increase = (maxPredicted - avgHistorical) / avgHistorical;
    
    if (increase > 1.0) return 'high';
    if (increase > 0.5) return 'medium';
    return 'low';
  }
}

export const costAnalyticsService = new CostAnalyticsService();
