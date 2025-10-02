// LLM Provider Registry and Management Service
import { createClient } from '@/lib/supabase/client';
import {
  LLMProvider,
  LLMProviderConfig,
  ProviderType,
  ProviderStatus,
  LLMProviderHealthCheck,
  LLMRequest,
  LLMResponse,
  ProviderSelectionCriteria,
  ProviderRecommendation,
  LLMError,
  ProviderFilters,
  ProviderSort,
  ProviderListResponse,
  LLMCapabilities,
  RetryConfig,
  UsageStatus,
  ValidationStatus,
  UsageLogCreateInput
} from '@/types/llm-provider.types';

export class LLMProviderService {
  private supabase = createClient();
  private providers: Map<string, LLMProvider> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private initialized = false;

  constructor() {
    this.initializeService();
  }

  async initializeService(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadProvidersFromDB();
      this.startHealthCheckScheduler();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize LLM Provider Service:', error);
      throw error;
    }
  }

  // Provider Management
  async createProvider(config: LLMProviderConfig): Promise<string> {
    // Validate configuration
    this.validateProviderConfig(config);

    // Encrypt API key (in production, use proper encryption)
    const encryptedKey = await this.encryptApiKey(config.api_key);

    // Create provider record
    const providerData = {
      provider_name: config.provider_name,
      provider_type: config.provider_type,
      api_endpoint: config.api_endpoint,
      api_key_encrypted: encryptedKey,
      model_id: config.model_id,
      model_version: config.model_version,
      capabilities: {
        medical_knowledge: config.capabilities.medical_knowledge || false,
        code_generation: config.capabilities.code_generation || false,
        image_understanding: config.capabilities.image_understanding || false,
        function_calling: config.capabilities.function_calling || false,
        streaming: config.capabilities.streaming || false,
        context_window: config.capabilities.context_window || 4096,
        supports_phi: config.capabilities.supports_phi || false,
        ...config.capabilities
      },
      cost_per_1k_input_tokens: config.cost_per_1k_input_tokens,
      cost_per_1k_output_tokens: config.cost_per_1k_output_tokens,
      max_tokens: config.max_tokens || 4096,
      temperature_default: config.temperature_default || 0.7,
      rate_limit_rpm: config.rate_limit_rpm || 60,
      rate_limit_tpm: config.rate_limit_tpm || 10000,
      rate_limit_concurrent: config.rate_limit_concurrent || 10,
      priority_level: config.priority_level || 1,
      weight: config.weight || 1.0,
      is_hipaa_compliant: config.is_hipaa_compliant || false,
      is_production_ready: config.is_production_ready || false,
      medical_accuracy_score: config.medical_accuracy_score,
      custom_headers: config.custom_headers || { /* TODO: implement */ },
      retry_config: {
        max_retries: 3,
        retry_delay_ms: 1000,
        exponential_backoff: true,
        backoff_multiplier: 2,
        ...config.retry_config
      },
      metadata: config.metadata || { /* TODO: implement */ },
      tags: config.tags || [],
      status: ProviderStatus.INITIALIZING
    };

    const { data, error } = await this.supabase
      .from('llm_providers')
      .insert([providerData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create provider: ${error.message}`);
    }

    const provider = this.transformDBProvider(data);

    // Test provider health
    const isHealthy = await this.testProviderHealth(provider);

    // Update status based on health check
    await this.updateProviderStatus(provider.id, isHealthy ? ProviderStatus.ACTIVE : ProviderStatus.ERROR);

    // Add to memory cache
    this.providers.set(provider.id, provider);
    return provider.id;
  }

  async updateProvider(providerId: string, updates: Partial<LLMProviderConfig>): Promise<void> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const updateData: unknown = { ...updates };

    // Handle API key encryption
    if (updates.api_key) {
      updateData.api_key_encrypted = await this.encryptApiKey(updates.api_key);
      delete updateData.api_key;
    }

    // Update timestamp
    updateData.updated_at = new Date().toISOString();

    const { error } = await this.supabase
      .from('llm_providers')
      .update(updateData)
      .eq('id', providerId);

    if (error) {
      throw new Error(`Failed to update provider: ${error.message}`);
    }

    // Update memory cache
    Object.assign(provider, updateData);

    // Re-test health if critical settings changed
    if (updates.api_key || updates.api_endpoint || updates.model_id) {
      const isHealthy = await this.testProviderHealth(provider);
      await this.updateProviderStatus(providerId, isHealthy ? ProviderStatus.ACTIVE : ProviderStatus.ERROR);
    }
  }

  async deleteProvider(providerId: string): Promise<void> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    // Check if provider is being used by any agents
    const { data: agents, error: agentsError } = await this.supabase
      .from('agents')
      .select('id, name')
      .or(`primary_llm_id.eq.${providerId},fallback_llm_ids.cs.{${providerId}}`);

    if (agentsError) {
      throw new Error(`Failed to check agent dependencies: ${agentsError.message}`);
    }

    if (agents && agents.length > 0) {
      throw new Error(`Cannot delete provider: ${agents.length} agents are still using this provider`);
    }

    // Soft delete by deactivating
    await this.updateProvider(providerId, { is_active: false });
    await this.updateProviderStatus(providerId, ProviderStatus.DISABLED);
  }

  async getProvider(providerId: string): Promise<LLMProvider | null> {
    let provider = this.providers.get(providerId);

    if (!provider) {
      // Load from database
      const { data, error } = await this.supabase
        .from('llm_providers')
        .select('*')
        .eq('id', providerId)
        .single();

      if (error || !data) {
        return null;
      }

      provider = this.transformDBProvider(data);
      this.providers.set(providerId, provider);
    }

    return provider;
  }

  async listProviders(
    filters?: ProviderFilters,
    sort?: ProviderSort,
    page: number = 1,
    limit: number = 20
  ): Promise<ProviderListResponse> {
    let query = this.supabase
      .from('llm_providers')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters) {
      if (filters.status) {
        query = query.in('status', filters.status);
      }
      if (filters.provider_type) {
        query = query.in('provider_type', filters.provider_type);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.is_hipaa_compliant !== undefined) {
        query = query.eq('is_hipaa_compliant', filters.is_hipaa_compliant);
      }
      if (filters.is_production_ready !== undefined) {
        query = query.eq('is_production_ready', filters.is_production_ready);
      }
      if (filters.min_medical_accuracy) {
        query = query.gte('medical_accuracy_score', filters.min_medical_accuracy);
      }
      if (filters.search_term) {
        query = query.or(`provider_name.ilike.%${filters.search_term}%,model_id.ilike.%${filters.search_term}%`);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }
      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after.toISOString());
      }
      if (filters.created_before) {
        query = query.lte('created_at', filters.created_before.toISOString());
      }
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('priority_level', { ascending: true })
                  .order('provider_name', { ascending: true });
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list providers: ${error.message}`);
    }

    const providers = (data || []).map(this.transformDBProvider);

    // Update memory cache
    providers.forEach(provider => {
      this.providers.set(provider.id, provider);
    });

    return {
      providers,
      total_count: count || 0,
      filtered_count: data?.length || 0,
      page,
      limit,
      has_next_page: (data?.length || 0) === limit,
      filters_applied: filters || { /* TODO: implement */ }
    };
  }

  // Provider Selection and Routing
  async selectOptimalProvider(criteria: ProviderSelectionCriteria): Promise<ProviderRecommendation | null> {
    const activeProviders = Array.from(this.providers.values())
      .filter(p => p.is_active && p.status === ProviderStatus.ACTIVE);

    if (activeProviders.length === 0) {
      return null;
    }

    // Score each provider
    const scored = activeProviders.map(provider => {
      const recommendation = this.scoreProvider(provider, criteria);
      return recommendation;
    }).filter(rec => rec.score > 0);

    // Sort by score (highest first)
    scored.sort((a, b) => b.score - a.score);

    return scored[0] || null;
  }

  private scoreProvider(provider: LLMProvider, criteria: ProviderSelectionCriteria): ProviderRecommendation {
    let score = 0;
    const reasoning: string[] = [];
    let estimatedCost = 0;
    const estimatedLatency = provider.average_latency_ms || 1000;

    // Base score from priority and weight
    score += (10 - provider.priority_level) * 10; // Higher priority = higher score
    score += provider.weight * 5;

    // Required capabilities check
    if (criteria.required_capabilities) {
      const caps = criteria.required_capabilities;
      let capabilityScore = 0;

      if (caps.medical_knowledge && provider.capabilities.medical_knowledge) {
        capabilityScore += 20;
        reasoning.push('Has medical knowledge capability');
      }
      if (caps.supports_phi && provider.capabilities.supports_phi) {
        capabilityScore += 15;
        reasoning.push('Supports PHI processing');
      }
      if (caps.function_calling && provider.capabilities.function_calling) {
        capabilityScore += 10;
        reasoning.push('Supports function calling');
      }
      if (caps.streaming && provider.capabilities.streaming) {
        capabilityScore += 5;
        reasoning.push('Supports streaming');
      }

      score += capabilityScore;
    }

    // Cost criteria
    if (criteria.max_cost_per_1k_tokens) {
      const avgCost = (provider.cost_per_1k_input_tokens + provider.cost_per_1k_output_tokens) / 2;
      if (avgCost <= criteria.max_cost_per_1k_tokens) {
        score += 20;
        reasoning.push('Meets cost requirements');
      } else {
        score -= 30; // Penalty for exceeding cost limit
        reasoning.push('Exceeds cost limit');
      }
      estimatedCost = avgCost;
    }

    // Performance criteria
    if (criteria.max_latency_ms && provider.average_latency_ms) {
      if (provider.average_latency_ms <= criteria.max_latency_ms) {
        score += 15;
        reasoning.push('Meets latency requirements');
      } else {
        score -= 20;
        reasoning.push('Exceeds latency limit');
      }
    }

    // Medical accuracy
    if (criteria.min_medical_accuracy && provider.medical_accuracy_score) {
      if (provider.medical_accuracy_score >= criteria.min_medical_accuracy) {
        score += 25;
        reasoning.push(`High medical accuracy (${provider.medical_accuracy_score}%)`);
      } else {
        score -= 25;
        reasoning.push('Insufficient medical accuracy');
      }
    }

    // HIPAA compliance
    if (criteria.require_hipaa_compliance && !provider.is_hipaa_compliant) {
      score = 0; // Disqualify non-compliant providers
      reasoning.push('Does not meet HIPAA compliance requirement');
    } else if (provider.is_hipaa_compliant) {
      score += 10;
      reasoning.push('HIPAA compliant');
    }

    // Provider preferences
    if (criteria.exclude_providers?.includes(provider.id)) {
      score = 0;
      reasoning.push('Explicitly excluded');
    }

    if (criteria.prefer_providers?.includes(provider.id)) {
      score += 30;
      reasoning.push('Explicitly preferred');
    }

    // Health status
    if (provider.uptime_percentage < 95) {
      score -= 15;
      reasoning.push('Low uptime percentage');
    }

    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, score));

    return {
      provider,
      score,
      reasoning,
      estimated_cost: estimatedCost,
      estimated_latency_ms: estimatedLatency,
      confidence_in_recommendation: score / 100
    };
  }

  // LLM Request Execution
  async executeRequest(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // Get provider
      const provider = await this.getProvider(request.provider_id);
      if (!provider) {
        throw new LLMError(
          `Provider ${request.provider_id} not found`,
          request.provider_id,
          undefined,
          'PROVIDER_NOT_FOUND',
          false
        );
      }

      if (!provider.is_active || provider.status !== ProviderStatus.ACTIVE) {
        throw new LLMError(
          `Provider ${provider.provider_name} is not available`,
          provider.id,
          undefined,
          'PROVIDER_UNAVAILABLE',
          true
        );
      }

      // Check rate limits
      await this.checkRateLimits(provider, request.user_id);

      // Execute request with retries
      const response = await this.executeWithRetries(provider, request, requestId);

      // Log usage
      await this.logUsage({
        llm_provider_id: provider.id,
        agent_id: request.agent_id,
        user_id: request.user_id,
        request_id: requestId,
        session_id: request.session_id,
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cost_input: response.cost.input_cost,
        cost_output: response.cost.output_cost,
        latency_ms: response.latency_ms,
        status: UsageStatus.SUCCESS,
        medical_context: request.medical_context,
        contains_phi: request.contains_phi || false,
        clinical_validation_status: ValidationStatus.PENDING,
        confidence_score: response.confidence_score,
        request_metadata: request.request_metadata || { /* TODO: implement */ },
        response_metadata: response.response_metadata
      });

      return response;

    } catch (error) {
      const latency = Date.now() - startTime;

      // Log failed usage
      if (request.user_id) {
        await this.logUsage({
          llm_provider_id: request.provider_id,
          agent_id: request.agent_id,
          user_id: request.user_id,
          request_id: requestId,
          session_id: request.session_id,
          input_tokens: 0,
          output_tokens: 0,
          cost_input: 0,
          cost_output: 0,
          latency_ms: latency,
          status: UsageStatus.ERROR,
          error_message: error instanceof Error ? error.message : String(error),
          error_type: (error as unknown)?.code || 'UNKNOWN_ERROR',
          medical_context: request.medical_context,
          contains_phi: request.contains_phi || false,
          clinical_validation_status: ValidationStatus.NOT_REQUIRED,
          request_metadata: request.request_metadata || { /* TODO: implement */ },
          response_metadata: { /* TODO: implement */ }
        });
      }

      throw error;
    }
  }

  private async executeWithRetries(
    provider: LLMProvider,
    request: LLMRequest,
    requestId: string
  ): Promise<LLMResponse> {
    const maxRetries = request.retry_attempts || provider.retry_config.max_retries;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.callProviderAPI(provider, request, requestId);
        return response;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (!this.isRetryableError(error as Error) || attempt === maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = provider.retry_config.exponential_backoff
          ? provider.retry_config.retry_delay_ms * Math.pow(provider.retry_config.backoff_multiplier, attempt)
          : provider.retry_config.retry_delay_ms;

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private async callProviderAPI(
    provider: LLMProvider,
    request: LLMRequest,
    requestId: string
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    // Provider-specific API calls
    let response: unknown;

    switch (provider.provider_type) {
      case ProviderType.OPENAI:
        response = await this.callOpenAI(provider, request);
        break;
      case ProviderType.ANTHROPIC:
        response = await this.callAnthropic(provider, request);
        break;
      case ProviderType.GOOGLE:
        response = await this.callGoogle(provider, request);
        break;
      case ProviderType.AZURE:
        response = await this.callAzure(provider, request);
        break;
      default:
        throw new Error(`Provider type ${provider.provider_type} not implemented`);
    }

    const latency = Date.now() - startTime;

    // Calculate costs
    const inputCost = (response.usage.input_tokens / 1000) * provider.cost_per_1k_input_tokens;
    const outputCost = (response.usage.output_tokens / 1000) * provider.cost_per_1k_output_tokens;

    return {
      request_id: requestId,
      provider_id: provider.id,
      model_id: request.model_id || provider.model_id,
      content: response.content,
      function_calls: response.function_calls,
      usage: response.usage,
      cost: {
        input_cost: inputCost,
        output_cost: outputCost,
        total_cost: inputCost + outputCost
      },
      latency_ms: latency,
      confidence_score: response.confidence_score,
      finish_reason: response.finish_reason,
      response_metadata: response.metadata || { /* TODO: implement */ },
      created_at: new Date()
    };
  }

  // Provider-specific API implementations
  private async callOpenAI(provider: LLMProvider, request: LLMRequest): Promise<unknown> {
    const apiKey = await this.decryptApiKey(provider.api_key_encrypted!);

    const response = await fetch(`${provider.api_endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...provider.custom_headers
      },
      body: JSON.stringify({
        model: request.model_id || provider.model_id,
        messages: [
          { role: 'system', content: request.system_prompt || '' },
          { role: 'user', content: request.prompt }
        ],
        max_tokens: request.max_tokens || provider.max_tokens,
        temperature: request.temperature || provider.temperature_default,
        stream: request.stream || false,
        functions: request.functions,
        function_call: request.function_call
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new LLMError(
        error.error?.message || 'OpenAI API error',
        provider.id,
        error,
        `OPENAI_${response.status}`,
        response.status >= 500
      );
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      function_calls: data.choices[0]?.message?.function_call ? [data.choices[0].message.function_call] : [],
      usage: {
        input_tokens: data.usage.prompt_tokens,
        output_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens
      },
      finish_reason: data.choices[0]?.finish_reason || 'stop',
      metadata: {
        model: data.model,
        created: data.created,
        id: data.id
      }
    };
  }

  private async callAnthropic(provider: LLMProvider, request: LLMRequest): Promise<unknown> {
    const apiKey = await this.decryptApiKey(provider.api_key_encrypted!);

    const response = await fetch(`${provider.api_endpoint}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        ...provider.custom_headers
      },
      body: JSON.stringify({
        model: request.model_id || provider.model_id,
        messages: [
          { role: 'user', content: request.prompt }
        ],
        system: request.system_prompt,
        max_tokens: request.max_tokens || provider.max_tokens,
        temperature: request.temperature || provider.temperature_default,
        stream: request.stream || false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new LLMError(
        error.error?.message || 'Anthropic API error',
        provider.id,
        error,
        `ANTHROPIC_${response.status}`,
        response.status >= 500
      );
    }

    const data = await response.json();

    return {
      content: data.content[0]?.text || '',
      usage: {
        input_tokens: data.usage.input_tokens,
        output_tokens: data.usage.output_tokens,
        total_tokens: data.usage.input_tokens + data.usage.output_tokens
      },
      finish_reason: data.stop_reason || 'stop',
      metadata: {
        model: data.model,
        id: data.id
      }
    };
  }

  private async callGoogle(provider: LLMProvider, request: LLMRequest): Promise<unknown> {
    // Implement Google/Vertex AI API call
    throw new Error('Google provider not yet implemented');
  }

  private async callAzure(provider: LLMProvider, request: LLMRequest): Promise<unknown> {
    // Implement Azure OpenAI API call
    throw new Error('Azure provider not yet implemented');
  }

  // Health Monitoring
  async testProviderHealth(provider: LLMProvider): Promise<boolean> {
    try {
      const testRequest: LLMRequest = {
        provider_id: provider.id,
        prompt: 'Health check test',
        max_tokens: 10,
        temperature: 0.1
      };

      const response = await this.callProviderAPI(provider, testRequest, `health-${Date.now()}`);

      // Record successful health check
      await this.recordHealthCheck(provider.id, {
        is_healthy: true,
        response_time_ms: 0, // Will be set in recordHealthCheck
        test_prompt: testRequest.prompt,
        test_response: response.content,
        test_tokens_used: response.usage.total_tokens,
        test_cost: response.cost.total_cost
      });

      return true;
    } catch (error) {
      // Record failed health check
      await this.recordHealthCheck(provider.id, {
        is_healthy: false,
        error_type: (error as unknown)?.code || 'UNKNOWN_ERROR',
        error_message: error instanceof Error ? error.message : String(error),
        http_status_code: (error as unknown)?.details?.status
      });

      return false;
    }
  }

  private async recordHealthCheck(
    providerId: string,
    healthData: Partial<LLMProviderHealthCheck>
  ): Promise<void> {
    const healthCheck = {
      provider_id: providerId,
      check_timestamp: new Date().toISOString(),
      is_healthy: healthData.is_healthy || false,
      response_time_ms: healthData.response_time_ms,
      test_prompt: healthData.test_prompt,
      test_response: healthData.test_response,
      test_tokens_used: healthData.test_tokens_used,
      test_cost: healthData.test_cost,
      error_type: healthData.error_type,
      error_message: healthData.error_message,
      error_code: healthData.error_code,
      http_status_code: healthData.http_status_code,
      metadata: healthData.metadata || { /* TODO: implement */ }
    };

    const { error } = await this.supabase
      .from('llm_provider_health_checks')
      .insert([healthCheck]);

    if (error) {
      console.error('Failed to record health check:', error);
    }
  }

  private startHealthCheckScheduler(): void {
    // Run health checks every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      const activeProviders = Array.from(this.providers.values())
        .filter(p => p.is_active && p.health_check_enabled);

      for (const provider of activeProviders) {
        try {
          const isHealthy = await this.testProviderHealth(provider);

          if (!isHealthy && provider.status === ProviderStatus.ACTIVE) {
            await this.updateProviderStatus(provider.id, ProviderStatus.ERROR);
          } else if (isHealthy && provider.status === ProviderStatus.ERROR) {
            await this.updateProviderStatus(provider.id, ProviderStatus.ACTIVE);
          }
        } catch (error) {
          console.error(`Health check failed for provider ${provider.id}:`, error);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Helper methods
  private async loadProvidersFromDB(): Promise<void> {
    const { data, error } = await this.supabase
      .from('llm_providers')
      .select('*')
      .eq('is_active', true);

    if (error) {
      // Handle the case where LLM tables don't exist yet (e.g., in remote database)
      if (error.message.includes('relation "public.llm_providers" does not exist')) {
        console.warn('LLM providers table not found - skipping provider loading. Run migrations to enable LLM management.');
        return;
      }
      throw new Error(`Failed to load providers: ${error.message}`);
    }

    if (data) {
      data.forEach(dbProvider => {
        const provider = this.transformDBProvider(dbProvider);
        this.providers.set(provider.id, provider);
      });
    }
  }

  private transformDBProvider(dbProvider: unknown): LLMProvider {
    return {
      id: dbProvider.id,
      provider_name: dbProvider.provider_name,
      provider_type: dbProvider.provider_type as ProviderType,
      api_endpoint: dbProvider.api_endpoint,
      api_key_encrypted: dbProvider.api_key_encrypted,
      model_id: dbProvider.model_id,
      model_version: dbProvider.model_version,
      capabilities: dbProvider.capabilities as LLMCapabilities,
      cost_per_1k_input_tokens: parseFloat(dbProvider.cost_per_1k_input_tokens),
      cost_per_1k_output_tokens: parseFloat(dbProvider.cost_per_1k_output_tokens),
      max_tokens: dbProvider.max_tokens,
      temperature_default: parseFloat(dbProvider.temperature_default),
      rate_limit_rpm: dbProvider.rate_limit_rpm,
      rate_limit_tpm: dbProvider.rate_limit_tpm,
      rate_limit_concurrent: dbProvider.rate_limit_concurrent,
      priority_level: dbProvider.priority_level,
      weight: parseFloat(dbProvider.weight),
      status: dbProvider.status as ProviderStatus,
      is_active: dbProvider.is_active,
      is_hipaa_compliant: dbProvider.is_hipaa_compliant,
      is_production_ready: dbProvider.is_production_ready,
      medical_accuracy_score: dbProvider.medical_accuracy_score ? parseFloat(dbProvider.medical_accuracy_score) : undefined,
      average_latency_ms: dbProvider.average_latency_ms,
      uptime_percentage: parseFloat(dbProvider.uptime_percentage),
      health_check_enabled: dbProvider.health_check_enabled,
      health_check_interval_minutes: dbProvider.health_check_interval_minutes,
      health_check_timeout_seconds: dbProvider.health_check_timeout_seconds,
      custom_headers: dbProvider.custom_headers || { /* TODO: implement */ },
      retry_config: dbProvider.retry_config as RetryConfig,
      metadata: dbProvider.metadata || { /* TODO: implement */ },
      tags: dbProvider.tags || [],
      created_at: new Date(dbProvider.created_at),
      updated_at: new Date(dbProvider.updated_at),
      created_by: dbProvider.created_by,
      updated_by: dbProvider.updated_by
    };
  }

  private validateProviderConfig(config: LLMProviderConfig): void {
    if (!config.provider_name?.trim()) {
      throw new Error('Provider name is required');
    }
    if (!config.model_id?.trim()) {
      throw new Error('Model ID is required');
    }
    if (!config.api_key?.trim()) {
      throw new Error('API key is required');
    }
    if (config.cost_per_1k_input_tokens < 0 || config.cost_per_1k_output_tokens < 0) {
      throw new Error('Costs cannot be negative');
    }
  }

  private async updateProviderStatus(providerId: string, status: ProviderStatus): Promise<void> {
    const { error } = await this.supabase
      .from('llm_providers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', providerId);

    if (error) {
      console.error('Failed to update provider status:', error);
    } else {
      const provider = this.providers.get(providerId);
      if (provider) {
        provider.status = status;
      }
    }
  }

  private async logUsage(usage: UsageLogCreateInput): Promise<void> {
    const { error } = await this.supabase
      .from('llm_usage_logs')
      .insert([usage]);

    if (error) {
      console.error('Failed to log usage:', error);
    }
  }

  private async checkRateLimits(provider: LLMProvider, userId?: string): Promise<void> {
    // Implementation of rate limiting logic
    // This would check current usage against provider limits
    // For now, just a placeholder
  }

  private async encryptApiKey(apiKey: string): Promise<string> {
    // In production, use proper encryption (e.g., AWS KMS, Azure Key Vault)
    // For now, just base64 encode (NOT SECURE)
    return Buffer.from(apiKey).toString('base64');
  }

  private async decryptApiKey(encryptedKey: string): Promise<string> {
    // In production, use proper decryption
    // For now, just base64 decode (NOT SECURE)
    return Buffer.from(encryptedKey, 'base64').toString('utf-8');
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isRetryableError(error: unknown): boolean {
    // Define which errors are retryable
    const retryableCodes = ['TIMEOUT', 'RATE_LIMITED', 'SERVER_ERROR'];
    return retryableCodes.includes(error.code) || (error.status >= 500 && error.status < 600);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cleanup
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Singleton instance
export const _llmProviderService = new LLMProviderService();