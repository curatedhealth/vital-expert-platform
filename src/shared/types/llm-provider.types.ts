// LLM Provider Types and Interfaces
// Comprehensive type definitions for the LLM management system

// Core enums
export enum ProviderType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  AZURE = 'azure',
  AWS_BEDROCK = 'aws_bedrock',
  COHERE = 'cohere',
  HUGGINGFACE = 'huggingface',
  CUSTOM = 'custom'
}

export enum ProviderStatus {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
  DISABLED = 'disabled'
}

export enum UsageStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  TIMEOUT = 'timeout',
  RATE_LIMITED = 'rate_limited',
  CANCELLED = 'cancelled'
}

export enum QuotaType {
  TOKENS = 'tokens',
  REQUESTS = 'requests',
  COST = 'cost',
  CONCURRENT = 'concurrent'
}

export enum QuotaPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ANNUAL = 'annual'
}

export enum EntityType {
  USER = 'user',
  AGENT = 'agent',
  DEPARTMENT = 'department',
  GLOBAL = 'global',
  API_KEY = 'api_key'
}

export enum MedicalContext {
  DIAGNOSIS = 'diagnosis',
  TREATMENT = 'treatment',
  RESEARCH = 'research',
  ADMINISTRATIVE = 'administrative',
  EDUCATION = 'education',
  CONSULTATION = 'consultation'
}

export enum ValidationStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  NOT_REQUIRED = 'not_required'
}

// Core interfaces
export interface LLMCapabilities {
  medical_knowledge: boolean;
  code_generation: boolean;
  image_understanding: boolean;
  function_calling: boolean;
  streaming: boolean;
  context_window: number;
  supports_phi: boolean;
  supports_batch: boolean;
  supports_embedding: boolean;
  supports_fine_tuning: boolean;
  max_concurrent_requests?: number;
  supported_languages?: string[];
  specialized_domains?: string[];
}

export interface RetryConfig {
  max_retries: number;
  retry_delay_ms: number;
  exponential_backoff: boolean;
  backoff_multiplier: number;
  retry_on_statuses?: number[];
  max_retry_delay_ms?: number;
}

export interface HealthCheck {
  last_check: Date | null;
  is_healthy: boolean;
  response_time_ms: number | null;
  error_count: number;
  last_error: string | null;
  consecutive_failures: number;
  uptime_percentage: number;
}

export interface LLMProvider {
  // Core identity
  id: string;
  provider_name: string;
  provider_type: ProviderType;
  api_endpoint?: string;
  api_key_encrypted?: string; // Encrypted, never exposed to frontend
  model_id: string;
  model_version?: string;

  // Capabilities
  capabilities: LLMCapabilities;

  // Cost configuration
  cost_per_1k_input_tokens: number;
  cost_per_1k_output_tokens: number;

  // Model configuration
  max_tokens: number;
  temperature_default: number;

  // Rate limits
  rate_limit_rpm: number; // Requests per minute
  rate_limit_tpm: number; // Tokens per minute
  rate_limit_concurrent: number; // Concurrent requests

  // Priority and routing
  priority_level: number; // Lower = higher priority
  weight: number; // Load balancing weight

  // Status and health
  status: ProviderStatus;
  is_active: boolean;
  is_hipaa_compliant: boolean;
  is_production_ready: boolean;

  // Performance metrics
  medical_accuracy_score?: number; // 0-100
  average_latency_ms?: number;
  uptime_percentage: number;

  // Health check configuration
  health_check_enabled: boolean;
  health_check_interval_minutes: number;
  health_check_timeout_seconds: number;

  // Custom configuration
  custom_headers: Record<string, string>;
  retry_config: RetryConfig;

  // Metadata
  metadata: Record<string, any>;
  tags: string[];

  // Audit fields
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
}

export interface LLMProviderHealthCheck {
  id: string;
  provider_id: string;
  check_timestamp: Date;
  is_healthy: boolean;
  response_time_ms?: number;
  test_prompt?: string;
  test_response?: string;
  test_tokens_used?: number;
  test_cost?: number;
  error_type?: string;
  error_message?: string;
  error_code?: string;
  http_status_code?: number;
  metadata: Record<string, any>;
}

export interface LLMUsageLog {
  id: string;
  llm_provider_id: string;
  agent_id?: string;
  user_id?: string;
  request_id: string;
  session_id?: string;
  parent_request_id?: string;

  // Token usage
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;

  // Cost
  cost_input: number;
  cost_output: number;
  total_cost: number;

  // Performance
  latency_ms: number;
  queue_time_ms?: number;
  processing_time_ms?: number;

  // Status
  status: UsageStatus;
  error_message?: string;
  error_type?: string;

  // Medical context
  medical_context?: MedicalContext;
  contains_phi: boolean;
  patient_context_id?: string;
  clinical_validation_status: ValidationStatus;

  // Quality metrics
  confidence_score?: number; // 0.00 to 1.00
  quality_score?: number; // 0.00 to 1.00
  medical_accuracy_score?: number; // 0.00 to 1.00

  // Metadata
  request_metadata: Record<string, any>;
  response_metadata: Record<string, any>;

  // Audit
  created_at: Date;
  ip_address?: string;
  user_agent?: string;
}

export interface UsageQuota {
  id: string;
  entity_type: EntityType;
  entity_id?: string;
  quota_type: QuotaType;
  quota_period: QuotaPeriod;
  quota_limit: number;
  current_usage: number;
  period_start: Date;
  period_end?: Date;
  alert_threshold_percent: number;
  hard_limit: boolean;
  grace_requests: number;
  is_active: boolean;
  last_reset?: Date;
  next_reset?: Date;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export interface LLMProviderMetrics {
  id: string;
  provider_id: string;
  metric_date: Date;
  metric_hour?: number; // 0-23 for hourly metrics

  // Usage metrics
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  cancelled_requests: number;

  // Token metrics
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;

  // Cost metrics
  total_cost: number;
  avg_cost_per_request?: number;

  // Performance metrics
  avg_latency_ms?: number;
  p50_latency_ms?: number;
  p95_latency_ms?: number;
  p99_latency_ms?: number;
  max_latency_ms?: number;

  // Quality metrics
  avg_confidence_score?: number;
  avg_medical_accuracy?: number;

  // Error analysis
  error_rate: number;
  timeout_count: number;
  rate_limit_count: number;
  auth_error_count: number;
  server_error_count: number;

  // Health metrics
  health_check_success_rate?: number;
  uptime_minutes: number;

  // Usage patterns
  unique_users_count: number;
  unique_agents_count: number;
  peak_concurrent_requests: number;

  // Medical/compliance metrics
  phi_requests_count: number;
  clinical_validations_passed: number;
  clinical_validations_failed: number;

  created_at: Date;
}

// Configuration types
export interface LLMProviderConfig {
  provider_name: string;
  provider_type: ProviderType;
  api_endpoint?: string;
  api_key: string; // Unencrypted for configuration
  model_id: string;
  model_version?: string;
  capabilities: Partial<LLMCapabilities>;
  cost_per_1k_input_tokens: number;
  cost_per_1k_output_tokens: number;
  max_tokens?: number;
  temperature_default?: number;
  rate_limit_rpm?: number;
  rate_limit_tpm?: number;
  rate_limit_concurrent?: number;
  priority_level?: number;
  weight?: number;
  is_active?: boolean;
  is_hipaa_compliant?: boolean;
  is_production_ready?: boolean;
  medical_accuracy_score?: number;
  custom_headers?: Record<string, string>;
  retry_config?: Partial<RetryConfig>;
  metadata?: Record<string, any>;
  tags?: string[];
}

// Request/Response types
export interface LLMRequest {
  provider_id: string;
  model_id?: string; // Override default model
  prompt: string;
  system_prompt?: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  functions?: any[]; // Function calling definitions
  function_call?: any;

  // Context
  user_id?: string;
  session_id?: string;
  agent_id?: string;
  medical_context?: MedicalContext;
  contains_phi?: boolean;
  patient_context_id?: string;

  // Metadata
  request_metadata?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  timeout_ms?: number;
  retry_attempts?: number;
}

export interface LLMResponse {
  request_id: string;
  provider_id: string;
  model_id: string;

  // Content
  content: string;
  function_calls?: any[];

  // Usage
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };

  // Costs
  cost: {
    input_cost: number;
    output_cost: number;
    total_cost: number;
  };

  // Performance
  latency_ms: number;
  queue_time_ms?: number;
  processing_time_ms?: number;

  // Quality
  confidence_score?: number;
  finish_reason: 'stop' | 'length' | 'function_call' | 'content_filter' | 'error';

  // Metadata
  response_metadata: Record<string, any>;
  created_at: Date;
}

// Analytics and reporting types
export interface ProviderAnalytics {
  provider_id: string;
  provider_name: string;
  time_period: {
    start_date: Date;
    end_date: Date;
  };

  // Usage summary
  usage: {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    total_tokens: number;
    total_cost: number;
    unique_users: number;
  };

  // Performance summary
  performance: {
    avg_latency_ms: number;
    p95_latency_ms: number;
    p99_latency_ms: number;
    error_rate: number;
    uptime_percentage: number;
  };

  // Medical metrics
  medical: {
    phi_requests: number;
    avg_medical_accuracy: number;
    clinical_validations_passed: number;
    clinical_validations_failed: number;
  };

  // Trends
  trends: {
    daily_usage: Array<{
      date: Date;
      requests: number;
      cost: number;
      latency_ms: number;
    }>;
    hourly_pattern: Array<{
      hour: number;
      avg_requests: number;
    }>;
  };
}

export interface CostBreakdown {
  time_period: {
    start_date: Date;
    end_date: Date;
  };

  // Total costs
  total_cost: number;
  input_cost: number;
  output_cost: number;

  // Cost by entity
  by_provider: Array<{
    provider_id: string;
    provider_name: string;
    cost: number;
    percentage: number;
  }>;

  by_agent: Array<{
    agent_id: string;
    agent_name: string;
    cost: number;
    percentage: number;
  }>;

  by_user: Array<{
    user_id: string;
    user_email: string;
    cost: number;
    percentage: number;
  }>;

  by_medical_context: Array<{
    context: MedicalContext;
    cost: number;
    percentage: number;
  }>;

  // Projections
  projected_monthly_cost: number;
  projected_annual_cost: number;

  // Recommendations
  optimization_recommendations: string[];
}

export interface QuotaStatus {
  quota_id: string;
  entity_type: EntityType;
  entity_id?: string;
  quota_type: QuotaType;
  quota_period: QuotaPeriod;
  limit: number;
  current_usage: number;
  usage_percentage: number;
  remaining: number;
  is_exceeded: boolean;
  is_near_limit: boolean; // Above alert threshold
  time_until_reset: number; // minutes
  projected_usage_at_reset?: number;
}

// Provider selection and routing types
export interface ProviderSelectionCriteria {
  required_capabilities?: Partial<LLMCapabilities>;
  max_cost_per_1k_tokens?: number;
  max_latency_ms?: number;
  min_medical_accuracy?: number;
  require_hipaa_compliance?: boolean;
  require_phi_support?: boolean;
  medical_context?: MedicalContext;
  priority_level?: 'cost' | 'performance' | 'accuracy' | 'compliance';
  exclude_providers?: string[];
  prefer_providers?: string[];
}

export interface ProviderRecommendation {
  provider: LLMProvider;
  score: number; // 0-100, higher is better match
  reasoning: string[];
  estimated_cost: number;
  estimated_latency_ms: number;
  confidence_in_recommendation: number; // 0-1
}

// Error types
export interface LLMError {
  code: string;
  message: string;
  provider_id?: string;
  request_id?: string;
  details?: Record<string, any>;
  retry_after?: number; // seconds
  is_retryable: boolean;
  timestamp: Date;
}

// Event types for real-time updates
export interface LLMProviderEvent {
  type: 'status_change' | 'health_check' | 'quota_exceeded' | 'high_latency' | 'error_spike';
  provider_id: string;
  timestamp: Date;
  data: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

// Bulk operations
export interface BulkProviderOperation {
  operation: 'activate' | 'deactivate' | 'update_config' | 'reset_health' | 'update_costs';
  provider_ids: string[];
  parameters?: Record<string, any>;
}

export interface BulkOperationResult {
  total_requested: number;
  successful: number;
  failed: number;
  errors: Array<{
    provider_id: string;
    error: string;
  }>;
  results: Array<{
    provider_id: string;
    success: boolean;
    data?: any;
  }>;
}

// API response types
export interface ProviderListResponse {
  providers: LLMProvider[];
  total_count: number;
  filtered_count: number;
  page: number;
  limit: number;
  has_next_page: boolean;
  filters_applied: Record<string, any>;
}

export interface ProviderResponse {
  provider: LLMProvider;
  health_status: LLMProviderHealthCheck;
  recent_metrics: LLMProviderMetrics;
  active_quotas: UsageQuota[];
}

// Filter and search types
export interface ProviderFilters {
  status?: ProviderStatus[];
  provider_type?: ProviderType[];
  is_active?: boolean;
  is_hipaa_compliant?: boolean;
  is_production_ready?: boolean;
  min_medical_accuracy?: number;
  max_cost_per_1k?: number;
  search_term?: string;
  tags?: string[];
  created_after?: Date;
  created_before?: Date;
}

export interface ProviderSort {
  field: keyof LLMProvider;
  direction: 'asc' | 'desc';
}

// Constants
export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  [ProviderType.OPENAI]: 'OpenAI',
  [ProviderType.ANTHROPIC]: 'Anthropic',
  [ProviderType.GOOGLE]: 'Google',
  [ProviderType.AZURE]: 'Azure OpenAI',
  [ProviderType.AWS_BEDROCK]: 'AWS Bedrock',
  [ProviderType.COHERE]: 'Cohere',
  [ProviderType.HUGGINGFACE]: 'Hugging Face',
  [ProviderType.CUSTOM]: 'Custom Provider'
};

export const MEDICAL_CONTEXT_LABELS: Record<MedicalContext, string> = {
  [MedicalContext.DIAGNOSIS]: 'Clinical Diagnosis',
  [MedicalContext.TREATMENT]: 'Treatment Planning',
  [MedicalContext.RESEARCH]: 'Medical Research',
  [MedicalContext.ADMINISTRATIVE]: 'Administrative',
  [MedicalContext.EDUCATION]: 'Medical Education',
  [MedicalContext.CONSULTATION]: 'Clinical Consultation'
};

export const QUOTA_TYPE_LABELS: Record<QuotaType, string> = {
  [QuotaType.TOKENS]: 'Token Limit',
  [QuotaType.REQUESTS]: 'Request Limit',
  [QuotaType.COST]: 'Cost Limit',
  [QuotaType.CONCURRENT]: 'Concurrent Request Limit'
};

// Utility types
export type ProviderCreateInput = Omit<LLMProvider, 'id' | 'created_at' | 'updated_at' | 'status' | 'api_key_encrypted'> & {
  api_key: string;
};

export type ProviderUpdateInput = Partial<Omit<LLMProvider, 'id' | 'created_at' | 'updated_at' | 'api_key_encrypted'>> & {
  api_key?: string;
};

export type UsageLogCreateInput = Omit<LLMUsageLog, 'id' | 'total_tokens' | 'total_cost' | 'created_at'>;

export type QuotaCreateInput = Omit<UsageQuota, 'id' | 'current_usage' | 'created_at' | 'updated_at'>;

// Error classes
export class LLMError extends Error {
  public readonly provider: string;
  public readonly originalError?: any;
  public readonly errorCode?: string;
  public readonly retryable: boolean;

  constructor(
    message: string,
    provider: string,
    originalError?: any,
    errorCode?: string,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'LLMError';
    this.provider = provider;
    this.originalError = originalError;
    this.errorCode = errorCode;
    this.retryable = retryable;
  }
}

export class LLMRateLimitError extends LLMError {
  public readonly retryAfter?: number;

  constructor(
    message: string,
    provider: string,
    retryAfter?: number,
    originalError?: any
  ) {
    super(message, provider, originalError, 'RATE_LIMIT', true);
    this.name = 'LLMRateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class LLMAuthenticationError extends LLMError {
  constructor(
    message: string,
    provider: string,
    originalError?: any
  ) {
    super(message, provider, originalError, 'AUTH_ERROR', false);
    this.name = 'LLMAuthenticationError';
  }
}

export class LLMValidationError extends LLMError {
  constructor(
    message: string,
    provider: string,
    originalError?: any
  ) {
    super(message, provider, originalError, 'VALIDATION_ERROR', false);
    this.name = 'LLMValidationError';
  }
}