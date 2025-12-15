/**
 * Enhanced Multi-Model LLM Orchestrator v2.0
 * Intelligent routing with fallback strategies and cost optimization
 */

import { EventEmitter } from 'events';

// Provider configurations
interface LLMProvider {
  id: string;
  name: string;
  endpoint?: string;
  apiKey: string;
  models: ModelConfig[];
  priority: number;
  maxConcurrent: number;
  costPerToken: number;
  averageLatency: number;
  reliability: number; // 0-1 score
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
}

interface ModelConfig {
  name: string;
  contextWindow: number;
  capabilities: string[];
  costPerInputToken: number;
  costPerOutputToken: number;
  maxTokensPerMinute: number;
  specializations: string[];
}

interface QueryContext {
  urgency: 'low' | 'normal' | 'high' | 'critical';
  domain: string;
  complexity: 'simple' | 'moderate' | 'complex';
  maxCost?: number;
  maxLatency?: number;
  requiresHighAccuracy?: boolean;
  complianceLevel?: 'standard' | 'hipaa' | 'fda';
}

interface RoutingDecision {
  primaryProvider: string;
  primaryModel: string;
  fallbackProviders: string[];
  reasoning: string;
  estimatedCost: number;
  estimatedLatency: number;
}

interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  tokens: {
    input: number;
    output: number;
  };
  latency: number;
  cost: number;
  confidence: number;
  metadata: Record<string, unknown>;
}

export class MultiModelOrchestrator extends EventEmitter {
  private providers: Map<string, LLMProvider> = new Map();
  private activeRequests: Map<string, AbortController> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private metrics: OrchestrationMetrics = new OrchestrationMetrics();

  constructor(private config: OrchestrationConfig) {
    super();
    this.initializeProviders();
    this.startHealthMonitoring();
    this.startMetricsCollection();
  }

  private initializeProviders(): void {
    // OpenAI GPT-4 and GPT-3.5
    this.providers.set('openai', {
      id: 'openai',
      name: 'OpenAI',
      apiKey: this.config.openaiApiKey,
      models: [
        {
          name: 'gpt-4-turbo-preview',
          contextWindow: 128000,
          capabilities: ['reasoning', 'analysis', 'medical'],
          costPerInputToken: 0.01 / 1000,
          costPerOutputToken: 0.03 / 1000,
          maxTokensPerMinute: 40000,
          specializations: ['clinical-reasoning', 'complex-analysis']
        },
        {
          name: 'gpt-3.5-turbo',
          contextWindow: 16385,
          capabilities: ['general', 'fast'],
          costPerInputToken: 0.001 / 1000,
          costPerOutputToken: 0.002 / 1000,
          maxTokensPerMinute: 90000,
          specializations: ['general-queries', 'quick-responses']
        }
      ],
      priority: 1,
      maxConcurrent: 50,
      costPerToken: 0.01,
      averageLatency: 2000,
      reliability: 0.95,
      healthStatus: 'healthy'
    });

    // Anthropic Claude
    this.providers.set('anthropic', {
      id: 'anthropic',
      name: 'Anthropic Claude',
      apiKey: this.config.anthropicApiKey,
      models: [
        {
          name: 'claude-3-opus-20240229',
          contextWindow: 200000,
          capabilities: ['reasoning', 'analysis', 'safety'],
          costPerInputToken: 0.015 / 1000,
          costPerOutputToken: 0.075 / 1000,
          maxTokensPerMinute: 20000,
          specializations: ['safety-critical', 'regulatory-analysis']
        },
        {
          name: 'claude-3-sonnet-20240229',
          contextWindow: 200000,
          capabilities: ['balanced', 'efficient'],
          costPerInputToken: 0.003 / 1000,
          costPerOutputToken: 0.015 / 1000,
          maxTokensPerMinute: 40000,
          specializations: ['balanced-performance']
        }
      ],
      priority: 2,
      maxConcurrent: 30,
      costPerToken: 0.015,
      averageLatency: 3000,
      reliability: 0.97,
      healthStatus: 'healthy'
    });

    // Initialize circuit breakers and rate limiters
    for (const provider of this.providers.values()) {
      this.circuitBreakers.set(provider.id, new CircuitBreaker({
        failureThreshold: 5,
        recoveryTimeout: 60000,
        monitorTimeout: 10000
      }));

      this.rateLimiters.set(provider.id, new RateLimiter({
        maxRequests: provider.maxConcurrent,
        windowMs: 60000
      }));
    }
  }

  /**
   * Intelligent query routing with fallback strategies
   */
  async processQuery(
    query: string,
    context: QueryContext = { urgency: 'normal', domain: 'general', complexity: 'moderate' }
  ): Promise<LLMResponse> {

    try {
      // 1. Analyze query and determine routing strategy

      this.emit('routingDecision', { requestId, routingDecision });

      // 2. Execute with primary provider

        requestId,
        query,
        context,
        routingDecision
      );

      // 3. Record metrics
      this.metrics.recordSuccess(
        routingDecision.primaryProvider,
        Date.now() - startTime,
        primaryResult.cost
      );

      return primaryResult;

    } catch (error) {
      this.metrics.recordError(requestId, error instanceof Error ? error : new Error(String(error)));
      this.emit('error', { requestId, error });
      throw error;
    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Determine optimal routing based on query analysis
   */
  private async determineRouting(
    query: string,
    context: QueryContext
  ): Promise<RoutingDecision> {
    // Analyze query characteristics

    // Score providers based on context and capabilities

    for (const provider of this.providers.values()) {
      if (provider.healthStatus === 'unhealthy') continue;

      // Base reliability score
      score += provider.reliability * 30;

      // Priority weighting
      score += (10 - provider.priority) * 5;

      // Cost optimization
      if (context.maxCost) {

        if (estimatedCost <= context.maxCost) {
          score += 20;
        } else {
          score -= 30;
        }
      }

      // Latency requirements
      if (context.maxLatency) {
        if (provider.averageLatency <= context.maxLatency) {
          score += 15;
        } else {
          score -= 25;
        }
      }

      // Specialization matching

      if (bestModel) {

          bestModel,
          context.domain,
          queryAnalysis.intent
        );
        score += specializationMatch * 20;
      }

      // Circuit breaker penalty

      if (circuitBreaker?.isOpen()) {
        score -= 50;
      } else if (circuitBreaker?.isHalfOpen()) {
        score -= 20;
      }

      providerScores.set(provider.id, Math.max(0, score));
    }

    // Select primary and fallback providers

      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    if (!primaryProvider) {
      throw new Error('No available providers for query processing');
    }

    return {
      primaryProvider,
      primaryModel: model.name,
      fallbackProviders,
      reasoning: `Selected ${provider.name}/${model.name} based on ${providerScores.get(primaryProvider)}% match score`,
      estimatedCost: this.estimateCost(provider, queryAnalysis.tokenEstimate),
      estimatedLatency: provider.averageLatency
    };
  }

  /**
   * Execute query with automatic fallback
   */
  private async executeWithFallback(
    requestId: string,
    query: string,
    context: QueryContext,
    routing: RoutingDecision
  ): Promise<LLMResponse> {

    let lastError: Error | null = null;

    for (const providerId of providers) {

      if (!provider) continue;

      // Check circuit breaker
      if (circuitBreaker?.isOpen()) {
        this.emit('providerSkipped', { requestId, providerId, reason: 'circuit_breaker_open' });
        continue;
      }

      // Check rate limits
      if (!rateLimiter?.tryAcquire()) {
        this.emit('providerSkipped', { requestId, providerId, reason: 'rate_limited' });
        continue;
      }

      try {

          requestId,
          provider,
          routing.primaryModel,
          query,
          context
        );

        // Success - record in circuit breaker
        circuitBreaker?.recordSuccess();

        this.emit('providerSuccess', { requestId, providerId, latency: result.latency });

        return result;

      } catch (error) {
        lastError = error as Error;

        // Record failure in circuit breaker
        circuitBreaker?.recordFailure();

        this.emit('providerFailed', {
          requestId,
          providerId,
          error: error instanceof Error ? error.message : String(error),
          willRetry: providers.indexOf(providerId) < providers.length - 1
        });

        // Continue to next provider
        continue;
      }
    }

    throw lastError || new Error('All providers failed');
  }

  /**
   * Execute query on specific provider
   */
  private async executeOnProvider(
    requestId: string,
    provider: LLMProvider,
    modelName: string,
    query: string,
    context: QueryContext
  ): Promise<LLMResponse> {

    this.activeRequests.set(requestId, abortController);

    try {
      let response: unknown;

      if (provider.id === 'openai') {
        response = await this.callOpenAI(provider, modelName, query, context, abortController.signal);
      } else if (provider.id === 'anthropic') {
        response = await this.callAnthropic(provider, modelName, query, context, abortController.signal);
      } else {
        throw new Error(`Unsupported provider: ${provider.id}`);
      }

      return {
        content: response.content,
        provider: provider.id,
        model: modelName,
        tokens: response.usage,
        latency,
        cost,
        confidence: this.calculateConfidence(response, context),
        metadata: {
          requestId,
          finishReason: response.finish_reason,
          ...response.metadata
        }
      };

    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * OpenAI API integration
   */
  private async callOpenAI(
    provider: LLMProvider,
    modelName: string,
    query: string,
    context: QueryContext,
    signal: AbortSignal
  ): Promise<unknown> {

      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      signal,
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: this.generateSystemPrompt(context)
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: context.requiresHighAccuracy ? 0.1 : 0.7,
        max_tokens: this.calculateMaxTokens(context),
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    return {
      content: data.choices[0].message.content,
      usage: {
        input: data.usage.prompt_tokens,
        output: data.usage.completion_tokens
      },
      finish_reason: data.choices[0].finish_reason,
      metadata: {
        model: data.model,
        created: data.created
      }
    };
  }

  /**
   * Anthropic Claude API integration
   */
  private async callAnthropic(
    provider: LLMProvider,
    modelName: string,
    query: string,
    context: QueryContext,
    signal: AbortSignal
  ): Promise<unknown> {

      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      signal,
      body: JSON.stringify({
        model: modelName,
        max_tokens: this.calculateMaxTokens(context),
        messages: [
          {
            role: 'user',
            content: query
          }
        ],
        system: this.generateSystemPrompt(context),
        temperature: context.requiresHighAccuracy ? 0.1 : 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    return {
      content: data.content[0].text,
      usage: {
        input: data.usage.input_tokens,
        output: data.usage.output_tokens
      },
      finish_reason: data.stop_reason,
      metadata: {
        model: data.model,
        id: data.id
      }
    };
  }

  /**
   * Health monitoring for all providers
   */
  private startHealthMonitoring(): void {
    setInterval(async () => {
      for (const provider of this.providers.values()) {
        try {
          await this.checkProviderHealth(provider);
          provider.healthStatus = 'healthy';
        } catch (error) {
          provider.healthStatus = 'unhealthy';
          this.emit('providerUnhealthy', { providerId: provider.id, error });
        }
      }
    }, 30000); // Check every 30 seconds
  }

  private async checkProviderHealth(provider: LLMProvider): Promise<void> {
    // Simple health check - attempt a minimal request

    setTimeout(() => abortController.abort(), 5000); // 5 second timeout

    if (provider.id === 'openai') {
      await this.callOpenAI(
        provider,
        'gpt-3.5-turbo',
        testQuery,
        { urgency: 'low', domain: 'general', complexity: 'simple' },
        abortController.signal
      );
    } else if (provider.id === 'anthropic') {
      await this.callAnthropic(
        provider,
        'claude-3-sonnet-20240229',
        testQuery,
        { urgency: 'low', domain: 'general', complexity: 'simple' },
        abortController.signal
      );
    }
  }

  // Helper methods
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private generateSystemPrompt(context: QueryContext): string {

    if (context.domain === 'clinical') {
      prompt += " Focus on evidence-based clinical information and always include appropriate disclaimers about professional medical advice.";
    } else if (context.domain === 'regulatory') {
      prompt += " Focus on regulatory compliance, FDA guidelines, and healthcare regulations.";
    }

    if (context.complianceLevel === 'hipaa') {
      prompt += " Ensure all responses comply with HIPAA privacy requirements.";
    }

    if (context.requiresHighAccuracy) {
      prompt += " Prioritize accuracy over creativity. Include confidence levels and cite sources when possible.";
    }

    return prompt;
  }

  private async analyzeQuery(query: string): Promise<{
    intent: string;
    domain: string;
    complexity: 'simple' | 'moderate' | 'complex';
    tokenEstimate: number;
  }> {
    // Simplified query analysis - in production, use more sophisticated NLP

    return {
      intent: 'information_seeking', // Simplified
      domain: this.detectDomain(query),
      complexity: wordCount > 100 ? 'complex' : wordCount > 30 ? 'moderate' : 'simple',
      tokenEstimate: Math.ceil(wordCount * 1.3) // Rough estimate
    };
  }

  private detectDomain(query: string): string {

    if (clinicalKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'clinical';
    } else if (regulatoryKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'regulatory';
    }

    return 'general';
  }

  private findBestModel(
    provider: LLMProvider,
    queryAnalysis: unknown,
    context: QueryContext
  ): ModelConfig | null {
    // Score models based on requirements
    let bestModel: ModelConfig | null = null;

    for (const model of provider.models) {

      // Context window requirement
      if (queryAnalysis.tokenEstimate <= model.contextWindow) {
        score += 20;
      } else {
        continue; // Skip if doesn't fit
      }

      // Capability matching
      if (context.domain === 'clinical' && model.specializations.includes('clinical-reasoning')) {
        score += 30;
      } else if (context.domain === 'regulatory' && model.specializations.includes('regulatory-analysis')) {
        score += 30;
      }

      // Cost consideration
      if (context.maxCost) {

        if (estimatedCost <= context.maxCost) {
          score += 10;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestModel = model;
      }
    }

    return bestModel;
  }

  private calculateSpecializationMatch(
    model: ModelConfig,
    domain: string,
    intent: string
  ): number {
    // Calculate how well the model specializations match the query

    if (domain === 'clinical' && model.specializations.includes('clinical-reasoning')) {
      score += 0.8;
    } else if (domain === 'regulatory' && model.specializations.includes('regulatory-analysis')) {
      score += 0.8;
    }

    return Math.min(score, 1.0);
  }

  private estimateCost(provider: LLMProvider, tokenEstimate: number): number {
    // Simplified cost estimation

    return (tokenEstimate * avgModel.costPerInputToken) +
           (tokenEstimate * 0.5 * avgModel.costPerOutputToken);
  }

  private calculateCost(provider: LLMProvider, modelName: string, usage: unknown): number {

    if (!model) return 0;

    return (usage.input * model.costPerInputToken) +
           (usage.output * model.costPerOutputToken);
  }

  private calculateConfidence(response: unknown, context: QueryContext): number {
    // Simplified confidence calculation

    if (context.requiresHighAccuracy) {
      confidence -= 0.1; // Lower confidence for high accuracy requirements
    }

    if (response.finish_reason === 'stop') {
      confidence += 0.1; // Higher confidence for complete responses
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private calculateMaxTokens(context: QueryContext): number {
    switch (context.complexity) {
      case 'simple': return 500;
      case 'moderate': return 1500;
      case 'complex': return 4000;
      default: return 1500;
    }
  }

  private startMetricsCollection(): void {
    // Emit metrics periodically
    setInterval(() => {
      this.emit('metrics', this.metrics.getSnapshot());
    }, 60000); // Every minute
  }
}

// Supporting classes
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(private options: {
    failureThreshold: number;
    recoveryTimeout: number;
    monitorTimeout: number;
  }) { /* TODO: implement */ }

  isOpen(): boolean {
    return this.state === 'open';
  }

  isHalfOpen(): boolean {
    return this.state === 'half-open';
  }

  recordSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.options.failureThreshold) {
      this.state = 'open';

      // Set up recovery timer
      setTimeout(() => {
        this.state = 'half-open';
      }, this.options.recoveryTimeout);
    }
  }
}

class RateLimiter {
  private requests: number[] = [];

  constructor(private options: {
    maxRequests: number;
    windowMs: number;
  }) { /* TODO: implement */ }

  tryAcquire(): boolean {

    // Remove old requests
    this.requests = this.requests.filter(time => time > windowStart);

    if (this.requests.length < this.options.maxRequests) {
      this.requests.push(now);
      return true;
    }

    return false;
  }
}

class OrchestrationMetrics {
  private readonly metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalLatency: 0,
    totalCost: 0,
    providerMetrics: new Map<string, {
      requests: number;
      successes: number;
      failures: number;
      totalLatency: number;
      totalCost: number;
    }>()
  };

  recordSuccess(provider: string, latency: number, cost: number): void {
    this.metrics.totalRequests++;
    this.metrics.successfulRequests++;
    this.metrics.totalLatency += latency;
    this.metrics.totalCost += cost;

    this.updateProviderMetrics(provider, true, latency, cost);
  }

  recordError(requestId: string, error: Error): void {
    this.metrics.totalRequests++;
    this.metrics.failedRequests++;
  }

  private updateProviderMetrics(provider: string, success: boolean, latency: number, cost: number): void {
    if (!this.metrics.providerMetrics.has(provider)) {
      this.metrics.providerMetrics.set(provider, {
        requests: 0,
        successes: 0,
        failures: 0,
        totalLatency: 0,
        totalCost: 0
      });
    }

    metrics.requests++;
    if (success) {
      metrics.successes++;
    } else {
      metrics.failures++;
    }
    metrics.totalLatency += latency;
    metrics.totalCost += cost;
  }

  getSnapshot(): unknown {
    return {
      ...this.metrics,
      averageLatency: this.metrics.totalRequests > 0
        ? this.metrics.totalLatency / this.metrics.totalRequests
        : 0,
      successRate: this.metrics.totalRequests > 0
        ? this.metrics.successfulRequests / this.metrics.totalRequests
        : 0,
      providerMetrics: Array.from(this.metrics.providerMetrics.entries()).map(([id, metrics]) => ({
        providerId: id,
        ...metrics,
        averageLatency: metrics.requests > 0 ? metrics.totalLatency / metrics.requests : 0,
        successRate: metrics.requests > 0 ? metrics.successes / metrics.requests : 0
      }))
    };
  }
}

interface OrchestrationConfig {
  openaiApiKey: string;
  anthropicApiKey: string;
  defaultModel?: string;
  enableCaching?: boolean;
  maxConcurrentRequests?: number;
  requestTimeoutMs?: number;
  fallbackStrategy?: 'sequential' | 'parallel';
  maxRetries?: number;
  defaultTimeout?: number;
}

export default MultiModelOrchestrator;