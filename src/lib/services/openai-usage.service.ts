/**
 * OpenAI Usage Tracking Service
 * Fetches real usage and billing data from OpenAI API
 */

export interface OpenAIUsageData {
  object: string;
  data: Array<{
    timestamp: number;
    n_requests: number;
    operation: string;
    snapshot_id: string;
    n_context_tokens_total: number;
    n_generated_tokens_total: number;
    n_context_tokens_cache_hit: number;
  }>;
}

export interface OpenAIBillingData {
  object: string;
  has_payment_method: boolean;
  soft_limit_usd: number;
  hard_limit_usd: number;
  system_hard_limit_usd: number;
  access_until: number;
}

export interface OpenAIUsageRecord {
  date: string;
  model: string;
  requests: number;
  context_tokens: number;
  generated_tokens: number;
  total_tokens: number;
  estimated_cost: number;
}

class OpenAIUsageService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not found in environment variables');
    }
  }

  /**
   * Fetch usage data from OpenAI API
   */
  async fetchUsageData(startDate: Date, endDate: Date): Promise<OpenAIUsageRecord[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const startDateStr = startDate.toISOString().split('T')[0];

      const response = await fetch(
        `${this.baseURL}/usage?date=${startDateStr}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ /* TODO: implement */ }));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data: OpenAIUsageData = await response.json();
      return this.processUsageData(data);
    } catch (error) {
      console.error('Error fetching OpenAI usage data:', error);
      throw error;
    }
  }

  /**
   * Fetch billing information
   * Note: This endpoint requires session-based auth and is not available via API key
   */
  async fetchBillingData(): Promise<OpenAIBillingData | null> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(`${this.baseURL}/dashboard/billing/subscription`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Billing endpoint requires session auth, not API key
        console.warn('Billing data not available via API key authentication');
        return null;
      }

      return await response.json();
    } catch (error) {
      console.warn('Billing data not accessible:', error);
      return null;
    }
  }

  /**
   * Test OpenAI API connectivity
   */
  async testConnectivity(): Promise<{ success: boolean; message: string; latency?: number }> {
    if (!this.apiKey) {
      return { success: false, message: 'OpenAI API key not configured' };
    }

    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const latency = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ /* TODO: implement */ }));
        return {
          success: false,
          message: `API Error: ${response.status} - ${errorData.error?.message || response.statusText}`,
          latency
        };
      }

      return {
        success: true,
        message: 'OpenAI API connection successful',
        latency
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        latency
      };
    }
  }

  /**
   * Get current month usage summary
   */
  async getCurrentMonthUsage(): Promise<{
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    byModel: Record<string, { tokens: number; cost: number; requests: number }>;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Collect usage data for each day of the current month up to today
    const allRecords: OpenAIUsageRecord[] = [];
    const currentDate = new Date(startOfMonth);

    while (currentDate <= now && currentDate.getMonth() === now.getMonth()) {
      try {
        const dayRecords = await this.fetchUsageData(currentDate, currentDate);
        allRecords.push(...dayRecords);
      } catch (error) {
        // Log error but continue with other days
        console.warn(`Failed to fetch usage for ${currentDate.toISOString().split('T')[0]}:`, error);
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    let totalCost = 0;
    let totalTokens = 0;
    let totalRequests = 0;
    const byModel: Record<string, { tokens: number; cost: number; requests: number }> = { /* TODO: implement */ };

    allRecords.forEach(record => {
      totalCost += record.estimated_cost;
      totalTokens += record.total_tokens;
      totalRequests += record.requests;

      if (!byModel[record.model]) {
        byModel[record.model] = { tokens: 0, cost: 0, requests: 0 };
      }

      byModel[record.model].tokens += record.total_tokens;
      byModel[record.model].cost += record.estimated_cost;
      byModel[record.model].requests += record.requests;
    });

    return {
      totalCost,
      totalTokens,
      totalRequests,
      byModel
    };
  }

  /**
   * Process raw usage data into structured records
   */
  private processUsageData(data: OpenAIUsageData): OpenAIUsageRecord[] {
    const records: OpenAIUsageRecord[] = [];
    const dailyData = new Map<string, Map<string, {
      requests: number;
      context_tokens: number;
      generated_tokens: number;
    }>>();

    // Group data by date and operation (model)
    data.data.forEach(item => {
      const date = new Date(item.timestamp * 1000).toISOString().split('T')[0];
      const model = this.extractModelFromOperation(item.operation);

      if (!dailyData.has(date)) {
        dailyData.set(date, new Map());
      }

      const dayData = dailyData.get(date)!;
      if (!dayData.has(model)) {
        dayData.set(model, {
          requests: 0,
          context_tokens: 0,
          generated_tokens: 0
        });
      }

      const modelData = dayData.get(model)!;
      modelData.requests += item.n_requests;
      modelData.context_tokens += item.n_context_tokens_total;
      modelData.generated_tokens += item.n_generated_tokens_total;
    });

    // Convert to records with cost estimation
    dailyData.forEach((dayData, date) => {
      dayData.forEach((modelData, model) => {
        const totalTokens = modelData.context_tokens + modelData.generated_tokens;
        const estimatedCost = this.estimateCost(model, modelData.context_tokens, modelData.generated_tokens);

        records.push({
          date,
          model,
          requests: modelData.requests,
          context_tokens: modelData.context_tokens,
          generated_tokens: modelData.generated_tokens,
          total_tokens: totalTokens,
          estimated_cost: estimatedCost
        });
      });
    });

    return records.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Extract model name from operation string
   */
  private extractModelFromOperation(operation: string): string {
    // Operation format: "completion:gpt-4-0613" or "chat-completion:gpt-3.5-turbo"
    const parts = operation.split(':');
    return parts.length > 1 ? parts[1] : operation;
  }

  /**
   * Estimate cost based on model and token usage
   */
  private estimateCost(model: string, contextTokens: number, generatedTokens: number): number {
    // Current OpenAI pricing (as of 2024)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4-1106-preview': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-0613': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      'gpt-3.5-turbo-1106': { input: 0.001, output: 0.002 },
      'gpt-3.5-turbo-0125': { input: 0.0005, output: 0.0015 },
    };

    // Default pricing if model not found
    const defaultPricing = { input: 0.001, output: 0.002 };
    // eslint-disable-next-line security/detect-object-injection
    const modelPricing = pricing[model] || defaultPricing;

    const inputCost = (contextTokens / 1000) * modelPricing.input;
    const outputCost = (generatedTokens / 1000) * modelPricing.output;

    return inputCost + outputCost;
  }
}

export const _openAIUsageService = new OpenAIUsageService();
export default OpenAIUsageService;