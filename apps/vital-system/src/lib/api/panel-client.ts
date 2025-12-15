/**
 * Ask Panel API Client
 * 
 * Connects to the FastAPI backend (ai-engine) for panel operations.
 * All requests include tenant and user context for multi-tenant isolation.
 */

import { User } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export type PanelType = 'structured' | 'open' | 'socratic' | 'adversarial' | 'delphi' | 'hybrid';
export type PanelStatus = 'created' | 'running' | 'completed' | 'failed';
export type ResponseType = 'analysis' | 'statement' | 'rebuttal' | 'question';
export type OrchestrationMode = 'parallel' | 'sequential' | 'scripted' | 'debate' | 'funnel' | 'scenario' | 'dynamic';

export interface PanelConfiguration {
  orchestration_mode?: OrchestrationMode;
  consensus_threshold?: number;
  max_rounds?: number;
  archetype?: string;
  fusion_model?: string;
  domain?: string;
  subdomain?: string;
  use_case?: string;
  custom_selection?: boolean;
  [key: string]: any;
}

export interface PanelAgent {
  id: string;
  name: string;
  role: 'lead' | 'expert' | 'advisor';
  weight: number;
}

export interface Panel {
  id: string;
  tenant_id: string;
  user_id: string;
  query: string;
  panel_type: PanelType;
  status: PanelStatus;
  configuration: PanelConfiguration;
  agents: PanelAgent[];
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  metadata?: Record<string, any>;
}

export interface PanelResponse {
  id: string;
  tenant_id: string;
  panel_id: string;
  agent_id: string;
  agent_name: string;
  round_number: number;
  response_type: ResponseType;
  content: string;
  confidence_score: number;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface PanelConsensus {
  id: string;
  tenant_id: string;
  panel_id: string;
  round_number: number;
  consensus_level: number;
  agreement_points: string[];
  disagreement_points: string[];
  recommendation: string;
  dissenting_opinions: Record<string, any>[];
  key_themes: string[];
  created_at: string;
}

export interface CreatePanelRequest {
  query: string;
  panel_type: PanelType;
  configuration: PanelConfiguration;
  agents: PanelAgent[];
}

export interface ExecutePanelRequest {
  query: string;
  stream?: boolean;
}

export interface ExecutePanelResponse {
  panel_id: string;
  status: PanelStatus;
  query: string;
  recommendation: string;
  consensus: PanelConsensus;
  expert_responses: PanelResponse[];
  created_at: string;
  completed_at: string;
  execution_time_ms: number;
}

export interface ListPanelsResponse {
  panels: Panel[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// UNIFIED PANEL TYPES
// ============================================================================

export interface UnifiedPanelAgent {
  id: string;
  name: string;
  model?: string;
  system_prompt?: string;
  role?: 'expert' | 'moderator' | 'advocate';
}

export interface UnifiedConsensusResult {
  consensus_score: number;
  consensus_level: 'high' | 'medium' | 'low';
  semantic_similarity: number;
  claim_overlap: number;
  recommendation_alignment: number;
  evidence_overlap: number;
  agreement_points: string[];
  divergent_points: string[];
  key_themes: string[];
  recommendation: string;
  dissenting_opinions: Record<string, string>;
  confidence: number;
}

export interface UnifiedComparisonMatrix {
  question: string;
  overall_consensus: number;
  consensus_areas: string[];
  divergence_areas: string[];
  synthesis: string;
}

export interface UnifiedExpertResponse {
  agent_id: string;
  agent_name: string;
  content: string;
  confidence: number;
  round_number: number;
  response_type: string;
  position?: string;
  vote?: number;
}

export interface ExecuteUnifiedPanelRequest {
  question: string;
  panel_type: PanelType;
  agents: UnifiedPanelAgent[];
  context?: string;
  tenant_id?: string;
  user_id?: string;
  save_to_db?: boolean;
  generate_matrix?: boolean;
  human_feedback?: string[];  // For hybrid panels
}

export interface ExecuteUnifiedPanelResponse {
  panel_id: string;
  panel_type: string;
  question: string;
  status: PanelStatus;
  consensus?: UnifiedConsensusResult;
  comparison_matrix?: UnifiedComparisonMatrix;
  expert_responses: UnifiedExpertResponse[];
  execution_time_ms: number;
  created_at: string;
  metadata: Record<string, any>;
}

export interface PanelTypeInfo {
  type: PanelType;
  name: string;
  description: string;
  best_for: string;
  duration_estimate: string;
}

export interface StreamPanelEvent {
  type: 'panel_started' | 'experts_loaded' | 'expert_thinking' | 'expert_response' |
        'calculating_consensus' | 'consensus_complete' | 'building_matrix' |
        'matrix_complete' | 'panel_complete' | 'error';
  data: Record<string, any>;
}

export interface UsageAnalytics {
  total_panels: number;
  total_consultations: number;
  total_tokens: number;
  total_cost_usd: number;
  avg_consensus: number;
  avg_execution_time_ms: number;
  panels_by_type: Record<PanelType, number>;
  consultations_over_time: Array<{
    date: string;
    count: number;
  }>;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class PanelAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'PanelAPIError';
  }
}

// ============================================================================
// PANEL API CLIENT
// ============================================================================

export class PanelAPIClient {
  private baseUrl: string;
  private tenantId: string;
  private userId: string;
  private getAccessToken: () => Promise<string | null>;

  constructor(
    tenantId: string,
    userId: string,
    getAccessToken: () => Promise<string | null>
  ) {
    this.baseUrl = process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000';
    this.tenantId = tenantId;
    this.userId = userId;
    this.getAccessToken = getAccessToken;
  }

  /**
   * Make an authenticated request to the panel API
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const accessToken = await this.getAccessToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.tenantId,
      'X-User-ID': this.userId,
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    };

    const config: RequestInit = {
      method,
      headers,
      ...options,
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, config);

      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
        } catch {
          errorDetails = { message: response.statusText };
        }

        throw new PanelAPIError(
          errorDetails.detail || errorDetails.message || 'API request failed',
          response.status,
          errorDetails
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      if (error instanceof PanelAPIError) {
        throw error;
      }

      // Network or parsing error
      throw new PanelAPIError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        undefined,
        error
      );
    }
  }

  // ============================================================================
  // PANEL OPERATIONS
  // ============================================================================

  /**
   * Create a new panel
   */
  async createPanel(request: CreatePanelRequest): Promise<Panel> {
    return this.request<Panel>('POST', '/api/v1/panels/', request);
  }

  /**
   * Execute a panel with a query (synchronous)
   */
  async executePanel(
    panelId: string,
    request: ExecutePanelRequest
  ): Promise<ExecutePanelResponse> {
    return this.request<ExecutePanelResponse>(
      'POST',
      `/api/v1/panels/${panelId}/execute`,
      request
    );
  }

  /**
   * Get a specific panel by ID
   */
  async getPanel(panelId: string): Promise<Panel> {
    return this.request<Panel>('GET', `/api/v1/panels/${panelId}`);
  }

  /**
   * List all panels for the current tenant
   */
  async listPanels(params?: {
    status?: PanelStatus;
    panel_type?: PanelType;
    limit?: number;
    offset?: number;
  }): Promise<ListPanelsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.status) queryParams.set('status', params.status);
      if (params.panel_type) queryParams.set('panel_type', params.panel_type);
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.offset) queryParams.set('offset', params.offset.toString());
    }

    const query = queryParams.toString();
    const path = query ? `/api/v1/panels/?${query}` : '/api/v1/panels/';
    
    return this.request<ListPanelsResponse>('GET', path);
  }

  /**
   * Get all responses for a panel
   */
  async getPanelResponses(panelId: string): Promise<PanelResponse[]> {
    const result = await this.request<{ responses: PanelResponse[] }>(
      'GET',
      `/api/v1/panels/${panelId}/responses`
    );
    return result.responses;
  }

  /**
   * Get consensus analysis for a panel
   */
  async getPanelConsensus(panelId: string): Promise<PanelConsensus> {
    const result = await this.request<{ consensus: PanelConsensus }>(
      'GET',
      `/api/v1/panels/${panelId}/consensus`
    );
    return result.consensus;
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get usage analytics for the current tenant
   */
  async getUsageAnalytics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<UsageAnalytics> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.start_date) queryParams.set('start_date', params.start_date);
      if (params.end_date) queryParams.set('end_date', params.end_date);
    }

    const query = queryParams.toString();
    const path = query 
      ? `/api/v1/analytics/usage?${query}`
      : '/api/v1/analytics/usage';
    
    return this.request<UsageAnalytics>('GET', path);
  }

  // ============================================================================
  // STREAMING (SSE)
  // ============================================================================

  /**
   * Create an EventSource for streaming panel execution
   *
   * Note: EventSource doesn't support custom headers, so we pass auth via query params
   */
  createStreamingConnection(
    panelId: string,
    query: string
  ): EventSource {
    const params = new URLSearchParams({
      query,
      tenant_id: this.tenantId,
      user_id: this.userId,
    });

    const url = `${this.baseUrl}/api/v1/panels/${panelId}/stream?${params.toString()}`;
    return new EventSource(url);
  }

  // ============================================================================
  // UNIFIED PANEL OPERATIONS (All 6 Panel Types)
  // ============================================================================

  /**
   * Get all supported panel types with descriptions
   */
  async getUnifiedPanelTypes(): Promise<PanelTypeInfo[]> {
    return this.request<PanelTypeInfo[]>('GET', '/api/v1/unified-panel/types');
  }

  /**
   * Execute a unified panel discussion (synchronous)
   *
   * Supports all 6 panel types:
   * - structured: Sequential moderated discussion
   * - open: Free-form brainstorming (parallel)
   * - socratic: Dialectical questioning
   * - adversarial: Pro/con debate format
   * - delphi: Iterative consensus with voting
   * - hybrid: Human-AI collaborative panels
   */
  async executeUnifiedPanel(
    request: ExecuteUnifiedPanelRequest
  ): Promise<ExecuteUnifiedPanelResponse> {
    return this.request<ExecuteUnifiedPanelResponse>(
      'POST',
      '/api/v1/unified-panel/execute',
      {
        ...request,
        tenant_id: request.tenant_id || this.tenantId,
        user_id: request.user_id || this.userId,
      }
    );
  }

  /**
   * Execute a unified panel with streaming via fetch + ReadableStream
   *
   * This method handles the SSE stream and calls the provided callbacks
   * for each event type.
   */
  async executeUnifiedPanelStreaming(
    request: Omit<ExecuteUnifiedPanelRequest, 'save_to_db' | 'generate_matrix'>,
    callbacks: {
      onPanelStarted?: (data: any) => void;
      onExpertsLoaded?: (data: any) => void;
      onExpertThinking?: (data: any) => void;
      onExpertResponse?: (data: any) => void;
      onCalculatingConsensus?: (data: any) => void;
      onConsensusComplete?: (data: any) => void;
      onBuildingMatrix?: (data: any) => void;
      onMatrixComplete?: (data: any) => void;
      onPanelComplete?: (data: any) => void;
      onError?: (error: any) => void;
    }
  ): Promise<void> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/api/v1/unified-panel/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.tenantId,
        'X-User-ID': this.userId,
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({
        ...request,
        tenant_id: request.tenant_id || this.tenantId,
        user_id: request.user_id || this.userId,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new PanelAPIError(error.detail || error.message || 'Stream request failed', response.status);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new PanelAPIError('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let currentEventType = ''; // Track the current SSE event type

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            // Capture the event type for the next data line
            currentEventType = line.replace('event:', '').trim();
            continue;
          }

          if (line.startsWith('data:')) {
            try {
              const jsonStr = line.replace('data:', '').trim();
              if (!jsonStr) continue;

              const data = JSON.parse(jsonStr);
              // Use the captured SSE event type, or fall back to type in data
              const eventType = currentEventType || data.type || 'unknown';
              // Reset for next event
              currentEventType = '';

              // Debug logging
              console.debug('[PanelStreaming] Event:', eventType, 'Data:', data);

              // Route to appropriate callback
              switch (eventType) {
                case 'panel_started':
                  callbacks.onPanelStarted?.(data);
                  break;
                case 'experts_loaded':
                  callbacks.onExpertsLoaded?.(data);
                  break;
                case 'expert_thinking':
                  callbacks.onExpertThinking?.(data);
                  break;
                case 'expert_response':
                  callbacks.onExpertResponse?.(data);
                  break;
                case 'calculating_consensus':
                  callbacks.onCalculatingConsensus?.(data);
                  break;
                case 'consensus_complete':
                  callbacks.onConsensusComplete?.(data);
                  break;
                case 'building_matrix':
                  callbacks.onBuildingMatrix?.(data);
                  break;
                case 'matrix_complete':
                  callbacks.onMatrixComplete?.(data);
                  break;
                case 'panel_complete':
                  callbacks.onPanelComplete?.(data);
                  break;
                case 'error':
                  callbacks.onError?.(data);
                  break;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE event:', line, parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Check unified panel service health
   */
  async checkUnifiedPanelHealth(): Promise<{
    status: string;
    service: string;
    panel_types: string[];
    streaming_enabled: boolean;
  }> {
    return this.request<{
      status: string;
      service: string;
      panel_types: string[];
      streaming_enabled: boolean;
    }>('GET', '/api/v1/unified-panel/health');
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a Panel API client with current auth context
 */
export function createPanelAPIClient(
  tenantId: string,
  userId: string,
  getAccessToken: () => Promise<string | null>
): PanelAPIClient {
  return new PanelAPIClient(tenantId, userId, getAccessToken);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format panel status for display
 */
export function formatPanelStatus(status: PanelStatus): string {
  const statusMap: Record<PanelStatus, string> = {
    created: 'Created',
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed',
  };
  return statusMap[status] || status;
}

/**
 * Get status color class for Tailwind
 */
export function getPanelStatusColor(status: PanelStatus): string {
  const colorMap: Record<PanelStatus, string> = {
    created: 'text-stone-600 bg-stone-100',
    running: 'text-blue-600 bg-blue-100',
    completed: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
  };
  return colorMap[status] || 'text-stone-600 bg-stone-100';
}

/**
 * Calculate time elapsed since panel creation
 */
export function getTimeSince(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
}

