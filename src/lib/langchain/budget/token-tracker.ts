import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xazinxsiglqokwfmogyk.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.YourServiceRoleKeyHere'
);

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  timestamp: Date;
}

export interface UserBudget {
  userId: string;
  totalTokens: number;
  tokenLimit: number;
  remainingTokens: number;
  costLimit: number;
  totalCost: number;
  remainingCost: number;
  resetDate: Date;
}

export interface TokenPricing {
  model: string;
  promptTokensPerDollar: number;
  completionTokensPerDollar: number;
}

// OpenAI pricing (per 1K tokens)
const PRICING: Record<string, TokenPricing> = {
  'gpt-4': {
    model: 'gpt-4',
    promptTokensPerDollar: 0.03,
    completionTokensPerDollar: 0.06
  },
  'gpt-4-turbo': {
    model: 'gpt-4-turbo',
    promptTokensPerDollar: 0.01,
    completionTokensPerDollar: 0.03
  },
  'gpt-3.5-turbo': {
    model: 'gpt-3.5-turbo',
    promptTokensPerDollar: 0.0015,
    completionTokensPerDollar: 0.002
  },
  'gpt-3.5-turbo-16k': {
    model: 'gpt-3.5-turbo-16k',
    promptTokensPerDollar: 0.003,
    completionTokensPerDollar: 0.004
  }
};

export class TokenBudgetManager {
  private defaultTokenLimit = 100000; // 100K tokens per month
  private defaultCostLimit = 50; // $50 per month
  
  async checkBudget(userId: string, estimatedTokens: number, model: string = 'gpt-4'): Promise<boolean> {
    try {
      console.log(`💰 Checking budget for user ${userId}: ${estimatedTokens} tokens (${model})`);
      
      const budget = await this.getUserBudget(userId);
      const estimatedCost = this.calculateCost(estimatedTokens, 0, model);
      
      // Check token limit
      if (budget.totalTokens + estimatedTokens > budget.tokenLimit) {
        throw new Error(`Token budget exceeded: ${budget.totalTokens + estimatedTokens}/${budget.tokenLimit}`);
      }
      
      // Check cost limit
      if (budget.totalCost + estimatedCost > budget.costLimit) {
        throw new Error(`Cost budget exceeded: $${(budget.totalCost + estimatedCost).toFixed(2)}/${budget.costLimit}`);
      }
      
      console.log(`✅ Budget check passed: ${budget.remainingTokens - estimatedTokens} tokens remaining`);
      return true;
      
    } catch (error) {
      console.error('❌ Budget check failed:', error);
      throw error;
    }
  }
  
  async trackUsage(
    userId: string, 
    tokens: { prompt: number; completion: number }, 
    model: string = 'gpt-4'
  ): Promise<void> {
    try {
      const cost = this.calculateCost(tokens.prompt, tokens.completion, model);
      const totalTokens = tokens.prompt + tokens.completion;
      
      console.log(`📊 Tracking usage for user ${userId}: ${totalTokens} tokens, $${cost.toFixed(4)} cost`);
      
      // Insert usage log
      await supabaseAdmin.from('token_usage_logs').insert({
        user_id: userId,
        model,
        prompt_tokens: tokens.prompt,
        completion_tokens: tokens.completion,
        total_tokens: totalTokens,
        cost,
        timestamp: new Date().toISOString()
      });
      
      // Update user budget
      await this.updateUserBudget(userId, totalTokens, cost);
      
    } catch (error) {
      console.error('❌ Failed to track token usage:', error);
      // Don't throw - tracking failure shouldn't break the workflow
    }
  }
  
  async getUserBudget(userId: string): Promise<UserBudget> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_token_usage')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        // Create default budget for new user
        return await this.createDefaultBudget(userId);
      }
      
      return {
        userId: data.user_id,
        totalTokens: data.total_tokens || 0,
        tokenLimit: data.token_limit || this.defaultTokenLimit,
        remainingTokens: (data.token_limit || this.defaultTokenLimit) - (data.total_tokens || 0),
        costLimit: data.cost_limit || this.defaultCostLimit,
        totalCost: data.total_cost || 0,
        remainingCost: (data.cost_limit || this.defaultCostLimit) - (data.total_cost || 0),
        resetDate: new Date(data.reset_date || new Date())
      };
      
    } catch (error) {
      console.error('❌ Failed to get user budget:', error);
      return await this.createDefaultBudget(userId);
    }
  }
  
  private async createDefaultBudget(userId: string): Promise<UserBudget> {
    const budget = {
      userId,
      totalTokens: 0,
      tokenLimit: this.defaultTokenLimit,
      remainingTokens: this.defaultTokenLimit,
      costLimit: this.defaultCostLimit,
      totalCost: 0,
      remainingCost: this.defaultCostLimit,
      resetDate: new Date()
    };
    
    try {
      await supabaseAdmin.from('user_token_usage').insert({
        user_id: userId,
        total_tokens: 0,
        token_limit: this.defaultTokenLimit,
        total_cost: 0,
        cost_limit: this.defaultCostLimit,
        reset_date: budget.resetDate.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to create default budget:', error);
    }
    
    return budget;
  }
  
  private async updateUserBudget(userId: string, tokens: number, cost: number): Promise<void> {
    try {
      await supabaseAdmin
        .from('user_token_usage')
        .update({
          total_tokens: supabaseAdmin.raw('total_tokens + ?', [tokens]),
          total_cost: supabaseAdmin.raw('total_cost + ?', [cost]),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('❌ Failed to update user budget:', error);
    }
  }
  
  private calculateCost(promptTokens: number, completionTokens: number, model: string): number {
    const pricing = PRICING[model] || PRICING['gpt-4'];
    
    const promptCost = (promptTokens / 1000) * pricing.promptTokensPerDollar;
    const completionCost = (completionTokens / 1000) * pricing.completionTokensPerDollar;
    
    return promptCost + completionCost;
  }
  
  async getUsageStats(userId: string, days: number = 30): Promise<{
    totalTokens: number;
    totalCost: number;
    dailyUsage: Array<{ date: string; tokens: number; cost: number }>;
    modelUsage: Record<string, { tokens: number; cost: number }>;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabaseAdmin
        .from('token_usage_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: true });
      
      if (error) throw error;
      
      const logs = data || [];
      
      // Calculate totals
      const totalTokens = logs.reduce((sum, log) => sum + log.total_tokens, 0);
      const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
      
      // Group by date
      const dailyUsage = logs.reduce((acc, log) => {
        const date = new Date(log.timestamp).toISOString().split('T')[0];
        const existing = acc.find(d => d.date === date);
        
        if (existing) {
          existing.tokens += log.total_tokens;
          existing.cost += log.cost;
        } else {
          acc.push({ date, tokens: log.total_tokens, cost: log.cost });
        }
        
        return acc;
      }, [] as Array<{ date: string; tokens: number; cost: number }>);
      
      // Group by model
      const modelUsage = logs.reduce((acc, log) => {
        const model = log.model || 'unknown';
        
        if (!acc[model]) {
          acc[model] = { tokens: 0, cost: 0 };
        }
        
        acc[model].tokens += log.total_tokens;
        acc[model].cost += log.cost;
        
        return acc;
      }, {} as Record<string, { tokens: number; cost: number }>);
      
      return {
        totalTokens,
        totalCost,
        dailyUsage,
        modelUsage
      };
      
    } catch (error) {
      console.error('❌ Failed to get usage stats:', error);
      return {
        totalTokens: 0,
        totalCost: 0,
        dailyUsage: [],
        modelUsage: {}
      };
    }
  }
  
  async resetUserBudget(userId: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('user_token_usage')
        .update({
          total_tokens: 0,
          total_cost: 0,
          reset_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      console.log(`✅ Budget reset for user ${userId}`);
    } catch (error) {
      console.error('❌ Failed to reset user budget:', error);
      throw error;
    }
  }
  
  async setBudgetLimits(userId: string, tokenLimit: number, costLimit: number): Promise<void> {
    try {
      await supabaseAdmin
        .from('user_token_usage')
        .update({
          token_limit: tokenLimit,
          cost_limit: costLimit,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      console.log(`✅ Budget limits updated for user ${userId}: ${tokenLimit} tokens, $${costLimit} cost`);
    } catch (error) {
      console.error('❌ Failed to set budget limits:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const tokenBudgetManager = new TokenBudgetManager();

export default tokenBudgetManager;
