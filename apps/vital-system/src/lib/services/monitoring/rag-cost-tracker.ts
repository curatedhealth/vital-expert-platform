/**
 * RAG Cost Tracker
 * Tracks and analyzes costs for RAG operations
 *
 * Tracks:
 * - OpenAI API costs (embeddings, chat completions)
 * - Pinecone costs (vector operations, storage)
 * - Cohere costs (re-ranking)
 * - Cost per query, per user, per agent
 *
 * Industry Standard: Cost tracking with <5% overhead
 */

export interface CostEntry {
  queryId: string;
  timestamp: string;
  userId?: string;
  agentId?: string;
  sessionId?: string;
  operation: 'embedding' | 'chat_completion' | 'vector_search' | 'reranking' | 'entity_extraction';
  provider: 'openai' | 'pinecone' | 'cohere' | 'google';
  model: string;
  tokenCount?: number;
  vectorCount?: number;
  costUsd: number;
  metadata?: Record<string, any>;
}

export interface CostStats {
  totalCostUsd: number;
  avgCostPerQuery: number;
  queryCount: number;
  breakdown: {
    embedding: number;
    chatCompletion: number;
    vectorSearch: number;
    reranking: number;
    entityExtraction: number;
  };
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
}

export interface CostBudget {
  dailyLimitUsd: number;
  monthlyLimitUsd: number;
  perQueryLimitUsd: number;
  alertThresholdPercent: number; // Alert when X% of budget consumed
}

/**
 * OpenAI Pricing (as of Jan 2025)
 */
const OPENAI_PRICING = {
  'text-embedding-3-large': {
    input: 0.00013 / 1000, // $0.13 per 1M tokens
  },
  'text-embedding-3-small': {
    input: 0.00002 / 1000, // $0.02 per 1M tokens
  },
  'text-embedding-ada-002': {
    input: 0.0001 / 1000, // $0.10 per 1M tokens
  },
  'gpt-4-turbo-preview': {
    input: 0.01 / 1000, // $10 per 1M tokens
    output: 0.03 / 1000, // $30 per 1M tokens
  },
  'gpt-4': {
    input: 0.03 / 1000, // $30 per 1M tokens
    output: 0.06 / 1000, // $60 per 1M tokens
  },
  'gpt-3.5-turbo': {
    input: 0.0005 / 1000, // $0.50 per 1M tokens
    output: 0.0015 / 1000, // $1.50 per 1M tokens
  },
};

/**
 * Pinecone Pricing (Serverless - as of Jan 2025)
 */
const PINECONE_PRICING = {
  readUnits: 0.0004, // $0.40 per 1M read units
  writeUnits: 0.002, // $2.00 per 1M write units
  storage: 0.00025, // $0.25 per GB-hour
};

/**
 * Cohere Pricing (as of Jan 2025)
 */
const COHERE_PRICING = {
  rerank: 0.002 / 1000, // $2 per 1M search units
};

export class RAGCostTracker {
  private entries: CostEntry[] = [];
  private readonly maxEntriesSize: number;
  private budget?: CostBudget;

  constructor(
    maxEntriesSize: number = 100000,
    budget?: CostBudget
  ) {
    this.maxEntriesSize = maxEntriesSize;
    this.budget = budget;
  }

  /**
   * Track an OpenAI embedding cost
   */
  trackEmbedding(
    queryId: string,
    model: string,
    tokenCount: number,
    metadata?: {
      userId?: string;
      agentId?: string;
      sessionId?: string;
    }
  ): number {
    const pricing = OPENAI_PRICING[model as keyof typeof OPENAI_PRICING] || OPENAI_PRICING['text-embedding-3-large'];
    const costUsd = tokenCount * pricing.input;

    const entry: CostEntry = {
      queryId,
      timestamp: new Date().toISOString(),
      userId: metadata?.userId,
      agentId: metadata?.agentId,
      sessionId: metadata?.sessionId,
      operation: 'embedding',
      provider: 'openai',
      model,
      tokenCount,
      costUsd,
      metadata,
    };

    this.addEntry(entry);
    return costUsd;
  }

  /**
   * Track an OpenAI chat completion cost
   */
  trackChatCompletion(
    queryId: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    metadata?: {
      userId?: string;
      agentId?: string;
      sessionId?: string;
    }
  ): number {
    const pricing = OPENAI_PRICING[model as keyof typeof OPENAI_PRICING] || OPENAI_PRICING['gpt-4-turbo-preview'];
    const costUsd = (inputTokens * pricing.input) + (outputTokens * (pricing.output || pricing.input));

    const entry: CostEntry = {
      queryId,
      timestamp: new Date().toISOString(),
      userId: metadata?.userId,
      agentId: metadata?.agentId,
      sessionId: metadata?.sessionId,
      operation: 'chat_completion',
      provider: 'openai',
      model,
      tokenCount: inputTokens + outputTokens,
      costUsd,
      metadata: {
        ...metadata,
        inputTokens,
        outputTokens,
      },
    };

    this.addEntry(entry);
    return costUsd;
  }

  /**
   * Track a Pinecone vector search cost
   */
  trackVectorSearch(
    queryId: string,
    vectorCount: number,
    isWrite: boolean = false,
    metadata?: {
      userId?: string;
      agentId?: string;
      sessionId?: string;
    }
  ): number {
    const costPerUnit = isWrite ? PINECONE_PRICING.writeUnits : PINECONE_PRICING.readUnits;
    const costUsd = (vectorCount / 1000000) * costPerUnit;

    const entry: CostEntry = {
      queryId,
      timestamp: new Date().toISOString(),
      userId: metadata?.userId,
      agentId: metadata?.agentId,
      sessionId: metadata?.sessionId,
      operation: 'vector_search',
      provider: 'pinecone',
      model: 'serverless',
      vectorCount,
      costUsd,
      metadata: {
        ...metadata,
        isWrite,
      },
    };

    this.addEntry(entry);
    return costUsd;
  }

  /**
   * Track a Cohere re-ranking cost
   */
  trackReranking(
    queryId: string,
    documentCount: number,
    metadata?: {
      userId?: string;
      agentId?: string;
      sessionId?: string;
    }
  ): number {
    const costUsd = documentCount * COHERE_PRICING.rerank;

    const entry: CostEntry = {
      queryId,
      timestamp: new Date().toISOString(),
      userId: metadata?.userId,
      agentId: metadata?.agentId,
      sessionId: metadata?.sessionId,
      operation: 'reranking',
      provider: 'cohere',
      model: 'rerank-english-v2.0',
      costUsd,
      metadata: {
        ...metadata,
        documentCount,
      },
    };

    this.addEntry(entry);
    return costUsd;
  }

  /**
   * Track Google AI entity extraction cost
   */
  trackEntityExtraction(
    queryId: string,
    tokenCount: number,
    metadata?: {
      userId?: string;
      agentId?: string;
      sessionId?: string;
    }
  ): number {
    // Google AI pricing (approximate)
    const costPerToken = 0.00001; // $0.01 per 1K tokens
    const costUsd = tokenCount * costPerToken;

    const entry: CostEntry = {
      queryId,
      timestamp: new Date().toISOString(),
      userId: metadata?.userId,
      agentId: metadata?.agentId,
      sessionId: metadata?.sessionId,
      operation: 'entity_extraction',
      provider: 'google',
      model: 'gemini-pro',
      tokenCount,
      costUsd,
      metadata,
    };

    this.addEntry(entry);
    return costUsd;
  }

  /**
   * Get cost statistics for a time window
   */
  getCostStats(windowMinutes?: number): CostStats {
    const entries = this.getEntriesInWindow(windowMinutes);

    if (entries.length === 0) {
      return this.getEmptyStats();
    }

    const totalCostUsd = entries.reduce((sum, e) => sum + e.costUsd, 0);

    // Count unique queries
    const uniqueQueries = new Set(entries.map(e => e.queryId));
    const queryCount = uniqueQueries.size;
    const avgCostPerQuery = queryCount > 0 ? totalCostUsd / queryCount : 0;

    // Breakdown by operation
    const breakdown = {
      embedding: entries.filter(e => e.operation === 'embedding').reduce((sum, e) => sum + e.costUsd, 0),
      chatCompletion: entries.filter(e => e.operation === 'chat_completion').reduce((sum, e) => sum + e.costUsd, 0),
      vectorSearch: entries.filter(e => e.operation === 'vector_search').reduce((sum, e) => sum + e.costUsd, 0),
      reranking: entries.filter(e => e.operation === 'reranking').reduce((sum, e) => sum + e.costUsd, 0),
      entityExtraction: entries.filter(e => e.operation === 'entity_extraction').reduce((sum, e) => sum + e.costUsd, 0),
    };

    // Breakdown by provider
    const byProvider: Record<string, number> = {};
    for (const entry of entries) {
      byProvider[entry.provider] = (byProvider[entry.provider] || 0) + entry.costUsd;
    }

    // Breakdown by model
    const byModel: Record<string, number> = {};
    for (const entry of entries) {
      byModel[entry.model] = (byModel[entry.model] || 0) + entry.costUsd;
    }

    return {
      totalCostUsd,
      avgCostPerQuery,
      queryCount,
      breakdown,
      byProvider,
      byModel,
    };
  }

  /**
   * Get costs by user
   */
  getCostsByUser(windowMinutes?: number): Record<string, number> {
    const entries = this.getEntriesInWindow(windowMinutes);
    const byUser: Record<string, number> = {};

    for (const entry of entries) {
      if (entry.userId) {
        byUser[entry.userId] = (byUser[entry.userId] || 0) + entry.costUsd;
      }
    }

    return byUser;
  }

  /**
   * Get costs by agent
   */
  getCostsByAgent(windowMinutes?: number): Record<string, number> {
    const entries = this.getEntriesInWindow(windowMinutes);
    const byAgent: Record<string, number> = {};

    for (const entry of entries) {
      if (entry.agentId) {
        byAgent[entry.agentId] = (byAgent[entry.agentId] || 0) + entry.costUsd;
      }
    }

    return byAgent;
  }

  /**
   * Get most expensive queries
   */
  getMostExpensiveQueries(
    windowMinutes?: number,
    limit: number = 10
  ): Array<{ queryId: string; totalCost: number; operations: number }> {
    const entries = this.getEntriesInWindow(windowMinutes);
    const queryMap = new Map<string, { totalCost: number; operations: number }>();

    for (const entry of entries) {
      const existing = queryMap.get(entry.queryId) || { totalCost: 0, operations: 0 };
      queryMap.set(entry.queryId, {
        totalCost: existing.totalCost + entry.costUsd,
        operations: existing.operations + 1,
      });
    }

    return Array.from(queryMap.entries())
      .map(([queryId, data]) => ({ queryId, ...data }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit);
  }

  /**
   * Check budget status and alerts
   */
  checkBudget(): {
    hasAlerts: boolean;
    alerts: string[];
    dailyStatus: { used: number; limit: number; percent: number };
    monthlyStatus: { used: number; limit: number; percent: number };
  } {
    const alerts: string[] = [];

    if (!this.budget) {
      return {
        hasAlerts: false,
        alerts: ['No budget configured'],
        dailyStatus: { used: 0, limit: 0, percent: 0 },
        monthlyStatus: { used: 0, limit: 0, percent: 0 },
      };
    }

    // Daily budget
    const dailyCost = this.getCostStats(24 * 60).totalCostUsd;
    const dailyPercent = (dailyCost / this.budget.dailyLimitUsd) * 100;

    if (dailyPercent >= this.budget.alertThresholdPercent) {
      alerts.push(
        `Daily budget at ${dailyPercent.toFixed(1)}% ($${dailyCost.toFixed(4)} of $${this.budget.dailyLimitUsd})`
      );
    }

    if (dailyCost >= this.budget.dailyLimitUsd) {
      alerts.push(
        `🚨 DAILY BUDGET EXCEEDED: $${dailyCost.toFixed(4)} / $${this.budget.dailyLimitUsd}`
      );
    }

    // Monthly budget
    const monthlyCost = this.getCostStats(30 * 24 * 60).totalCostUsd;
    const monthlyPercent = (monthlyCost / this.budget.monthlyLimitUsd) * 100;

    if (monthlyPercent >= this.budget.alertThresholdPercent) {
      alerts.push(
        `Monthly budget at ${monthlyPercent.toFixed(1)}% ($${monthlyCost.toFixed(2)} of $${this.budget.monthlyLimitUsd})`
      );
    }

    if (monthlyCost >= this.budget.monthlyLimitUsd) {
      alerts.push(
        `🚨 MONTHLY BUDGET EXCEEDED: $${monthlyCost.toFixed(2)} / $${this.budget.monthlyLimitUsd}`
      );
    }

    return {
      hasAlerts: alerts.length > 0,
      alerts,
      dailyStatus: {
        used: dailyCost,
        limit: this.budget.dailyLimitUsd,
        percent: dailyPercent,
      },
      monthlyStatus: {
        used: monthlyCost,
        limit: this.budget.monthlyLimitUsd,
        percent: monthlyPercent,
      },
    };
  }

  /**
   * Export cost entries for analysis
   */
  exportEntries(windowMinutes?: number): CostEntry[] {
    return this.getEntriesInWindow(windowMinutes);
  }

  /**
   * Clear all entries
   */
  clearEntries(): void {
    this.entries = [];
  }

  /**
   * Update budget configuration
   */
  updateBudget(budget: CostBudget): void {
    this.budget = budget;
  }

  /**
   * Add entry and trim if needed
   */
  private addEntry(entry: CostEntry): void {
    this.entries.push(entry);

    // Trim if exceeding max size
    if (this.entries.length > this.maxEntriesSize) {
      this.entries = this.entries.slice(-this.maxEntriesSize);
    }

    // Check budget alerts
    if (this.budget) {
      const budgetStatus = this.checkBudget();
      if (budgetStatus.hasAlerts) {
        console.warn('💰 RAG Cost Alert:', budgetStatus.alerts.join(', '));
      }
    }
  }

  /**
   * Get entries within time window
   */
  private getEntriesInWindow(windowMinutes?: number): CostEntry[] {
    if (!windowMinutes) {
      return [...this.entries];
    }

    const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000);
    return this.entries.filter((e) => new Date(e.timestamp) >= cutoffTime);
  }

  /**
   * Get empty stats structure
   */
  private getEmptyStats(): CostStats {
    return {
      totalCostUsd: 0,
      avgCostPerQuery: 0,
      queryCount: 0,
      breakdown: {
        embedding: 0,
        chatCompletion: 0,
        vectorSearch: 0,
        reranking: 0,
        entityExtraction: 0,
      },
      byProvider: {},
      byModel: {},
    };
  }
}

// Singleton instance with budget from environment
export const ragCostTracker = new RAGCostTracker(
  100000,
  {
    dailyLimitUsd: parseFloat(process.env.RAG_DAILY_BUDGET_USD || '10'),
    monthlyLimitUsd: parseFloat(process.env.RAG_MONTHLY_BUDGET_USD || '300'),
    perQueryLimitUsd: parseFloat(process.env.RAG_PER_QUERY_BUDGET_USD || '0.10'),
    alertThresholdPercent: parseFloat(process.env.RAG_BUDGET_ALERT_THRESHOLD || '80'),
  }
);
