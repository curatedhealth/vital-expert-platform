/**
 * Unified Analytics Service
 * 
 * Centralizes all analytics event collection and processing across VITAL platform.
 * Provides automatic cost tracking, quality metrics, and tenant health scoring.
 * 
 * Features:
 * - Event buffering (5s or 100 items)
 * - Automatic cost calculation for LLM/embedding/search operations
 * - Quality metrics tracking (RAGAS scores, hallucination detection)
 * - Tenant health scoring
 * - Real-time event streaming
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PlatformEvent {
  time?: Date;
  event_id?: string;
  
  // Context
  tenant_id: string;
  user_id?: string;
  session_id?: string;
  
  // Event Classification
  event_type: string;
  event_category: 'user_behavior' | 'agent_performance' | 'system_health' | 'business_metric';
  
  // Event Data
  event_data: Record<string, any>;
  metadata?: Record<string, any>;
  
  // Attribution
  source?: string; // 'ask_expert' | 'ask_panel' | 'workflow' | 'solution_builder'
  ip_address?: string;
  user_agent?: string;
}

export interface CostEvent {
  time?: Date;
  cost_event_id?: string;
  
  // Context
  tenant_id: string;
  user_id?: string;
  session_id?: string;
  
  // Cost Classification
  cost_type: 'llm' | 'embedding' | 'storage' | 'compute' | 'search' | 'other';
  
  // Cost Details
  cost_usd: number;
  quantity?: number; // tokens, documents, queries, etc.
  unit_price?: number;
  
  // Service Attribution
  service: string; // 'openai' | 'pinecone' | 'modal' | 'vercel' | 'supabase'
  service_tier?: string; // 'gpt-4' | 'gpt-4-turbo' | 'ada-002' | etc.
  
  // Request Context
  request_id?: string;
  agent_id?: string;
  query_id?: string;
  
  // Additional Data
  metadata?: Record<string, any>;
}

export interface AgentExecution {
  time?: Date;
  execution_id?: string;
  
  // Context
  tenant_id: string;
  user_id?: string;
  session_id?: string;
  
  // Agent Identity
  agent_id: string;
  agent_type: string; // 'ask_expert' | 'workflow' | 'custom'
  agent_version?: string;
  
  // Execution Metrics
  execution_time_ms: number;
  success: boolean;
  error_type?: string;
  error_message?: string;
  retry_count?: number;
  
  // Quality Metrics
  quality_score?: number; // 0.00 to 1.00 (RAGAS score)
  user_rating?: number; // 1-5
  citation_accuracy?: number;
  hallucination_detected?: boolean;
  compliance_score?: number;
  
  // Cost
  cost_usd?: number;
  total_tokens?: number;
  
  // Request Details
  query_id?: string;
  query_length?: number;
  response_length?: number;
  
  // Additional Data
  metadata?: Record<string, any>;
}

export interface LLMCostCalculation {
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_cost: number;
  breakdown: {
    prompt_cost: number;
    completion_cost: number;
  };
}

// ============================================================================
// PRICING CONSTANTS
// ============================================================================

const LLM_PRICING: Record<string, { prompt: number; completion: number }> = {
  // OpenAI GPT-4 (per 1K tokens)
  'gpt-4': { prompt: 0.03, completion: 0.06 },
  'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
  'gpt-4-turbo-preview': { prompt: 0.01, completion: 0.03 },
  'gpt-4-32k': { prompt: 0.06, completion: 0.12 },
  
  // OpenAI GPT-3.5
  'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
  'gpt-3.5-turbo-16k': { prompt: 0.003, completion: 0.004 },
  
  // OpenAI Embeddings
  'text-embedding-ada-002': { prompt: 0.0001, completion: 0 },
  'text-embedding-3-small': { prompt: 0.00002, completion: 0 },
  'text-embedding-3-large': { prompt: 0.00013, completion: 0 },
};

// ============================================================================
// UNIFIED ANALYTICS SERVICE
// ============================================================================

export class UnifiedAnalyticsService {
  private supabaseUrl: string;
  private supabaseKey: string;
  private supabase: any;
  
  // Event buffers
  private platformEventBuffer: PlatformEvent[] = [];
  private costEventBuffer: CostEvent[] = [];
  private agentExecutionBuffer: AgentExecution[] = [];
  
  // Buffer configuration
  private readonly BUFFER_SIZE = 100;
  private readonly BUFFER_FLUSH_INTERVAL_MS = 5000; // 5 seconds
  
  // Flush timers
  private platformEventTimer?: NodeJS.Timeout;
  private costEventTimer?: NodeJS.Timeout;
  private agentExecutionTimer?: NodeJS.Timeout;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    this.supabaseUrl = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.supabaseKey = supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      console.warn('UnifiedAnalyticsService: Supabase credentials not provided');
    }
    
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    
    // Start flush timers
    this.startFlushTimers();
  }

  // ==========================================================================
  // EVENT COLLECTION METHODS
  // ==========================================================================

  /**
   * Track a platform event (user behavior, system health, business metric)
   */
  async trackEvent(event: PlatformEvent): Promise<void> {
    // Add timestamp if not provided
    if (!event.time) {
      event.time = new Date();
    }
    
    // Add to buffer
    this.platformEventBuffer.push(event);
    
    // Flush if buffer is full
    if (this.platformEventBuffer.length >= this.BUFFER_SIZE) {
      await this.flushPlatformEvents();
    }
  }

  /**
   * Track a cost event (LLM, embedding, storage, compute, search)
   */
  async trackCost(event: CostEvent): Promise<void> {
    // Add timestamp if not provided
    if (!event.time) {
      event.time = new Date();
    }
    
    // Add to buffer
    this.costEventBuffer.push(event);
    
    // Flush if buffer is full
    if (this.costEventBuffer.length >= this.BUFFER_SIZE) {
      await this.flushCostEvents();
    }
  }

  /**
   * Track an agent execution (performance, quality, success/failure)
   */
  async trackAgentExecution(execution: AgentExecution): Promise<void> {
    // Add timestamp if not provided
    if (!execution.time) {
      execution.time = new Date();
    }
    
    // Add to buffer
    this.agentExecutionBuffer.push(execution);
    
    // Flush if buffer is full
    if (this.agentExecutionBuffer.length >= this.BUFFER_SIZE) {
      await this.flushAgentExecutions();
    }
  }

  // ==========================================================================
  // BUFFER FLUSHING
  // ==========================================================================

  private startFlushTimers(): void {
    this.platformEventTimer = setInterval(
      () => this.flushPlatformEvents(),
      this.BUFFER_FLUSH_INTERVAL_MS
    );
    
    this.costEventTimer = setInterval(
      () => this.flushCostEvents(),
      this.BUFFER_FLUSH_INTERVAL_MS
    );
    
    this.agentExecutionTimer = setInterval(
      () => this.flushAgentExecutions(),
      this.BUFFER_FLUSH_INTERVAL_MS
    );
  }

  private async flushPlatformEvents(): Promise<void> {
    if (this.platformEventBuffer.length === 0) return;
    
    const events = [...this.platformEventBuffer];
    this.platformEventBuffer = [];
    
    try {
      const { error } = await this.supabase
        .from('analytics.platform_events')
        .insert(events);
      
      if (error) {
        console.error('Error flushing platform events:', error);
        // Re-add failed events to buffer
        this.platformEventBuffer.push(...events);
      }
    } catch (error) {
      console.error('Error flushing platform events:', error);
      this.platformEventBuffer.push(...events);
    }
  }

  private async flushCostEvents(): Promise<void> {
    if (this.costEventBuffer.length === 0) return;
    
    const events = [...this.costEventBuffer];
    this.costEventBuffer = [];
    
    try {
      const { error } = await this.supabase
        .from('analytics.tenant_cost_events')
        .insert(events);
      
      if (error) {
        console.error('Error flushing cost events:', error);
        this.costEventBuffer.push(...events);
      }
    } catch (error) {
      console.error('Error flushing cost events:', error);
      this.costEventBuffer.push(...events);
    }
  }

  private async flushAgentExecutions(): Promise<void> {
    if (this.agentExecutionBuffer.length === 0) return;
    
    const executions = [...this.agentExecutionBuffer];
    this.agentExecutionBuffer = [];
    
    try {
      const { error } = await this.supabase
        .from('analytics.agent_executions')
        .insert(executions);
      
      if (error) {
        console.error('Error flushing agent executions:', error);
        this.agentExecutionBuffer.push(...executions);
      }
    } catch (error) {
      console.error('Error flushing agent executions:', error);
      this.agentExecutionBuffer.push(...executions);
    }
  }

  /**
   * Force flush all buffers immediately
   */
  async flush(): Promise<void> {
    await Promise.all([
      this.flushPlatformEvents(),
      this.flushCostEvents(),
      this.flushAgentExecutions(),
    ]);
  }

  // ==========================================================================
  // COST CALCULATION UTILITIES
  // ==========================================================================

  /**
   * Calculate LLM cost based on model and token usage
   */
  calculateLLMCost(
    model: string,
    promptTokens: number,
    completionTokens: number
  ): LLMCostCalculation {
    // Normalize model name
    const normalizedModel = model.toLowerCase();
    
    // Find pricing (default to GPT-3.5 if unknown)
    let pricing = LLM_PRICING[normalizedModel];
    
    if (!pricing) {
      // Try to match partial model names
      const modelKey = Object.keys(LLM_PRICING).find(key => 
        normalizedModel.includes(key)
      );
      pricing = modelKey ? LLM_PRICING[modelKey] : LLM_PRICING['gpt-3.5-turbo'];
    }
    
    // Calculate costs (pricing is per 1K tokens)
    const promptCost = (promptTokens / 1000) * pricing.prompt;
    const completionCost = (completionTokens / 1000) * pricing.completion;
    const totalCost = promptCost + completionCost;
    
    return {
      model: normalizedModel,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_cost: totalCost,
      breakdown: {
        prompt_cost: promptCost,
        completion_cost: completionCost,
      },
    };
  }

  /**
   * Track LLM usage and automatically calculate cost
   */
  async trackLLMUsage(params: {
    tenant_id: string;
    user_id?: string;
    session_id?: string;
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    agent_id?: string;
    query_id?: string;
    request_id?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const costCalc = this.calculateLLMCost(
      params.model,
      params.prompt_tokens,
      params.completion_tokens
    );
    
    await this.trackCost({
      tenant_id: params.tenant_id,
      user_id: params.user_id,
      session_id: params.session_id,
      cost_type: 'llm',
      cost_usd: costCalc.total_cost,
      quantity: params.prompt_tokens + params.completion_tokens,
      unit_price: costCalc.total_cost / (params.prompt_tokens + params.completion_tokens),
      service: 'openai',
      service_tier: params.model,
      request_id: params.request_id,
      agent_id: params.agent_id,
      query_id: params.query_id,
      metadata: {
        ...params.metadata,
        cost_breakdown: costCalc.breakdown,
      },
    });
  }

  // ==========================================================================
  // TENANT HEALTH SCORING
  // ==========================================================================

  /**
   * Calculate tenant health score (0-100)
   * Based on:
   * - Engagement (active users, sessions, events)
   * - Agent success rate
   * - Quality metrics
   * - Cost efficiency
   */
  async calculateTenantHealth(
    tenantId: string,
    days: number = 30
  ): Promise<number> {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - days);
    
    try {
      // Get engagement metrics
      const { data: platformEvents } = await this.supabase
        .from('analytics.platform_events')
        .select('user_id, session_id')
        .eq('tenant_id', tenantId)
        .gte('time', startTime.toISOString());
      
      const activeUsers = new Set(platformEvents?.map((e: any) => e.user_id).filter(Boolean)).size;
      const sessions = new Set(platformEvents?.map((e: any) => e.session_id).filter(Boolean)).size;
      
      // Get agent performance
      const { data: executions } = await this.supabase
        .from('analytics.agent_executions')
        .select('success, quality_score')
        .eq('tenant_id', tenantId)
        .gte('time', startTime.toISOString());
      
      const successRate = executions && executions.length > 0
        ? (executions.filter((e: any) => e.success).length / executions.length) * 100
        : 100;
      
      const avgQuality = executions && executions.length > 0
        ? executions.reduce((sum: number, e: any) => sum + (e.quality_score || 0), 0) / executions.length
        : 1;
      
      // Calculate composite health score
      const engagementScore = Math.min(100, (activeUsers * 10) + (sessions * 2));
      const performanceScore = successRate;
      const qualityScore = avgQuality * 100;
      
      // Weighted average
      const healthScore = (
        engagementScore * 0.3 +
        performanceScore * 0.4 +
        qualityScore * 0.3
      );
      
      return Math.round(healthScore);
    } catch (error) {
      console.error('Error calculating tenant health:', error);
      return 0;
    }
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Stop timers and flush remaining events
   */
  async destroy(): Promise<void> {
    if (this.platformEventTimer) clearInterval(this.platformEventTimer);
    if (this.costEventTimer) clearInterval(this.costEventTimer);
    if (this.agentExecutionTimer) clearInterval(this.agentExecutionTimer);
    
    await this.flush();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let analyticsInstance: UnifiedAnalyticsService | null = null;

export function getAnalyticsService(): UnifiedAnalyticsService {
  if (!analyticsInstance) {
    analyticsInstance = new UnifiedAnalyticsService();
  }
  return analyticsInstance;
}

export default UnifiedAnalyticsService;

