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
      // Orchestrator callbacks
      onOrchestratorThinking?: (data: { message: string; phase?: string }) => void;
      onOrchestratorMessage?: (data: { message: string; phase?: string; message_type?: string }) => void;
      onOrchestratorDecision?: (data: { message: string; experts?: string[]; rationale?: string[] }) => void;
      onOrchestratorIntervention?: (data: { message: string; reason: string }) => void;
      onTopicAnalysis?: (data: { domain?: string; complexity?: string; focus_areas?: string[]; recommended_approach?: string }) => void;
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
                // Orchestrator events
                case 'orchestrator_thinking':
                  callbacks.onOrchestratorThinking?.(data);
                  break;
                case 'orchestrator_message':
                  callbacks.onOrchestratorMessage?.(data);
                  break;
                case 'orchestrator_decision':
                  callbacks.onOrchestratorDecision?.(data);
                  break;
                case 'orchestrator_intervention':
                  callbacks.onOrchestratorIntervention?.(data);
                  break;
                case 'topic_analysis':
                  callbacks.onTopicAnalysis?.(data);
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

// ============================================================================
// PANEL MISSION TYPES (Mode 4 - Autonomous)
// ============================================================================

export type PanelMissionStatus =
  | 'pending'
  | 'planning'
  | 'selecting'
  | 'executing'
  | 'consensus'
  | 'checkpoint'
  | 'synthesizing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

export interface PanelMissionExpert {
  id: string;
  name: string;
  model?: string;
  system_prompt?: string;
}

export interface PanelMissionConsensus {
  consensus_score: number;
  consensus_level: 'high' | 'medium' | 'low';
  agreement_points: string[];
  divergent_points: string[];
  key_themes: string[];
  recommendation: string;
  evidence_overlap?: number;
}

export interface PanelMissionCheckpoint {
  id: string;
  type: 'approval' | 'review' | 'feedback';
  title: string;
  description: string;
  options: string[];
  consensus_score: number;
  round_count: number;
  expert_count: number;
}

export interface PanelExpertResponse {
  expert_id: string;
  expert_name: string;
  content: string;
  confidence: number;
  round: number;
  timestamp: string;
}

export interface CreatePanelMissionRequest {
  goal: string;
  panel_type: PanelType;
  context?: string;
  experts?: PanelMissionExpert[];
  options?: {
    max_rounds?: number;
    consensus_threshold?: number;
    budget_limit?: number;
    auto_approve_checkpoints?: boolean;
  };
}

export interface PanelMission {
  id: string;
  goal: string;
  panel_type: PanelType;
  status: PanelMissionStatus;
  progress: number;
  current_round: number;
  max_rounds: number;
  expert_count: number;
  consensus_score?: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error?: string;
}

export interface PanelMissionResult {
  mission_id: string;
  panel_type: PanelType;
  status: PanelMissionStatus;
  consensus?: PanelMissionConsensus;
  expert_responses: PanelExpertResponse[];
  final_output?: {
    content: string;
    expert_count: number;
    round_count: number;
  };
  quality_score?: number;
  execution_time_ms: number;
  artifacts?: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
  }>;
}

export interface PanelMissionStreamEvent {
  type:
    | 'panel_started'
    | 'panel_status'
    | 'experts_selected'
    | 'round_started'
    | 'expert_response'
    | 'round_complete'
    | 'consensus_update'
    | 'checkpoint_reached'
    | 'checkpoint_resolved'
    | 'synthesis_complete'
    | 'panel_completed'
    | 'panel_paused'
    | 'panel_resumed'
    | 'panel_cancelled'
    // === Token streaming events ===
    | 'expert_stream_start'
    | 'expert_token'
    | 'expert_stream_end'
    // === Debate-specific events ===
    | 'turn_started'
    | 'argument'
    | 'rebuttal'
    | 'synthesis'
    | 'debate_exchange'
    // === Orchestrator events ===
    | 'orchestrator_thinking'
    | 'orchestrator_message'
    | 'orchestrator_decision'
    | 'orchestrator_intervention'
    | 'topic_analysis'
    | 'error';
  data: Record<string, any>;
  timestamp?: string;
}

export interface PanelMissionListResponse {
  missions: PanelMission[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// PANEL MISSION CLIENT (Mode 4 - Autonomous)
// ============================================================================

export class PanelMissionClient {
  private bffBaseUrl: string;

  constructor() {
    // BFF routes are relative paths when called from the browser
    this.bffBaseUrl = '';
  }

  /**
   * Create and start a new panel mission
   * Returns a ReadableStream for SSE events
   */
  async createMissionStream(
    request: CreatePanelMissionRequest
  ): Promise<Response> {
    const response = await fetch('/api/panel/mode4/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goal: request.goal,
        panel_type: request.panel_type,
        context: request.context,
        experts: request.experts,
        options: request.options,
      }),
    });

    if (!response.ok && !response.headers.get('content-type')?.includes('text/event-stream')) {
      const errorText = await response.text();
      throw new PanelAPIError(errorText || 'Failed to create panel mission', response.status);
    }

    return response;
  }

  /**
   * Get panel mission status
   */
  async getMissionStatus(missionId: string): Promise<PanelMission> {
    const response = await fetch(`/api/panel/mode4/status/${missionId}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new PanelAPIError(error.error || 'Failed to get mission status', response.status);
    }

    return response.json();
  }

  /**
   * Resolve a HITL checkpoint
   */
  async resolveCheckpoint(
    missionId: string,
    checkpointId: string,
    action: 'approve' | 'reject' | 'modify',
    feedback?: string,
    modifications?: Record<string, any>
  ): Promise<{ status: string; message: string }> {
    const response = await fetch(`/api/panel/mode4/checkpoint/${checkpointId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mission_id: missionId,
        action,
        feedback,
        modifications,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new PanelAPIError(error.error || 'Failed to resolve checkpoint', response.status);
    }

    return response.json();
  }

  /**
   * Pause a running mission
   */
  async pauseMission(missionId: string): Promise<{ status: string; message: string }> {
    const response = await fetch('/api/panel/mode4/pause', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mission_id: missionId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new PanelAPIError(error.error || 'Failed to pause mission', response.status);
    }

    return response.json();
  }

  /**
   * Resume a paused mission
   */
  async resumeMission(missionId: string): Promise<{ status: string; message: string }> {
    const response = await fetch('/api/panel/mode4/resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mission_id: missionId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new PanelAPIError(error.error || 'Failed to resume mission', response.status);
    }

    return response.json();
  }

  /**
   * Cancel a mission
   */
  async cancelMission(missionId: string): Promise<{ status: string; message: string }> {
    const response = await fetch('/api/panel/mode4/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mission_id: missionId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new PanelAPIError(error.error || 'Failed to cancel mission', response.status);
    }

    return response.json();
  }

  /**
   * Get mission history
   */
  async getMissionHistory(params?: {
    status?: PanelMissionStatus;
    panel_type?: PanelType;
    limit?: number;
    offset?: number;
  }): Promise<PanelMissionListResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.status) queryParams.set('status', params.status);
      if (params.panel_type) queryParams.set('panel_type', params.panel_type);
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.offset) queryParams.set('offset', params.offset.toString());
    }

    const query = queryParams.toString();
    const url = query ? `/api/panel/mode4/history?${query}` : '/api/panel/mode4/history';

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new PanelAPIError(error.error || 'Failed to get mission history', response.status);
    }

    return response.json();
  }

  /**
   * Stream mission with callbacks
   */
  async streamMission(
    request: CreatePanelMissionRequest,
    callbacks: {
      onPanelStarted?: (data: any) => void;
      onExpertsSelected?: (data: any) => void;
      onRoundStarted?: (data: any) => void;
      onExpertResponse?: (data: any) => void;
      onRoundComplete?: (data: any) => void;
      onConsensusUpdate?: (data: any) => void;
      onCheckpointReached?: (data: any) => void;
      onSynthesisComplete?: (data: any) => void;
      onPanelCompleted?: (data: any) => void;
      onPanelPaused?: (data: any) => void;
      onPanelCancelled?: (data: any) => void;
      onError?: (error: any) => void;
      // === Token streaming callbacks ===
      onExpertStreamStart?: (data: any) => void;
      onExpertToken?: (data: any) => void;
      onExpertStreamEnd?: (data: any) => void;
      // === Debate-specific callbacks ===
      onTurnStarted?: (data: any) => void;
      onArgument?: (data: any) => void;
      onRebuttal?: (data: any) => void;
      onDebateSynthesis?: (data: any) => void;
      // === Orchestrator callbacks ===
      onOrchestratorThinking?: (data: any) => void;
      onOrchestratorMessage?: (data: any) => void;
      onOrchestratorDecision?: (data: any) => void;
      onOrchestratorIntervention?: (data: any) => void;
      onTopicAnalysis?: (data: any) => void;
    }
  ): Promise<string | null> {
    const response = await this.createMissionStream(request);

    // Get mission ID from header
    const missionId = response.headers.get('X-Mission-ID');

    const reader = response.body?.getReader();
    if (!reader) {
      throw new PanelAPIError('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let currentEventType = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEventType = line.replace('event:', '').trim();
            continue;
          }

          if (line.startsWith('data:')) {
            try {
              const jsonStr = line.replace('data:', '').trim();
              if (!jsonStr) continue;

              const data = JSON.parse(jsonStr);
              const eventType = currentEventType || data.type || 'unknown';
              currentEventType = '';

              switch (eventType) {
                case 'panel_started':
                  callbacks.onPanelStarted?.(data);
                  break;
                case 'experts_selected':
                  callbacks.onExpertsSelected?.(data);
                  break;
                case 'round_started':
                  callbacks.onRoundStarted?.(data);
                  break;
                case 'expert_response':
                  callbacks.onExpertResponse?.(data);
                  break;
                case 'round_complete':
                  callbacks.onRoundComplete?.(data);
                  break;
                case 'consensus_update':
                  callbacks.onConsensusUpdate?.(data);
                  break;
                case 'checkpoint_reached':
                  callbacks.onCheckpointReached?.(data);
                  break;
                case 'synthesis_complete':
                  callbacks.onSynthesisComplete?.(data);
                  break;
                case 'panel_completed':
                case 'mission_completed':
                  callbacks.onPanelCompleted?.(data);
                  break;
                case 'panel_paused':
                case 'mission_paused':
                  callbacks.onPanelPaused?.(data);
                  break;
                case 'panel_cancelled':
                case 'mission_cancelled':
                  callbacks.onPanelCancelled?.(data);
                  break;
                // === Token streaming events ===
                case 'expert_stream_start':
                  callbacks.onExpertStreamStart?.(data);
                  break;
                case 'expert_token':
                  callbacks.onExpertToken?.(data);
                  break;
                case 'expert_stream_end':
                  callbacks.onExpertStreamEnd?.(data);
                  break;
                // === Debate-specific events ===
                case 'turn_started':
                  callbacks.onTurnStarted?.(data);
                  break;
                case 'argument':
                  callbacks.onArgument?.(data);
                  break;
                case 'rebuttal':
                  callbacks.onRebuttal?.(data);
                  break;
                case 'synthesis':
                  callbacks.onDebateSynthesis?.(data);
                  break;
                // === Orchestrator events ===
                case 'orchestrator_thinking':
                  callbacks.onOrchestratorThinking?.(data);
                  break;
                case 'orchestrator_message':
                  callbacks.onOrchestratorMessage?.(data);
                  break;
                case 'orchestrator_decision':
                  callbacks.onOrchestratorDecision?.(data);
                  break;
                case 'orchestrator_intervention':
                  callbacks.onOrchestratorIntervention?.(data);
                  break;
                case 'topic_analysis':
                  callbacks.onTopicAnalysis?.(data);
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

    return missionId;
  }

  /**
   * Connect to an existing mission's stream by URL
   * Used when resuming from wizard-created missions
   */
  async connectToMissionStream(
    streamUrl: string,
    callbacks: {
      onPanelStarted?: (data: any) => void;
      onExpertsSelected?: (data: any) => void;
      onRoundStarted?: (data: any) => void;
      onExpertResponse?: (data: any) => void;
      onRoundComplete?: (data: any) => void;
      onConsensusUpdate?: (data: any) => void;
      onCheckpointReached?: (data: any) => void;
      onSynthesisComplete?: (data: any) => void;
      onPanelCompleted?: (data: any) => void;
      onPanelPaused?: (data: any) => void;
      onPanelCancelled?: (data: any) => void;
      onError?: (error: any) => void;
      // === Token streaming callbacks ===
      onExpertStreamStart?: (data: any) => void;
      onExpertToken?: (data: any) => void;
      onExpertStreamEnd?: (data: any) => void;
      // === Debate-specific callbacks ===
      onTurnStarted?: (data: any) => void;
      onArgument?: (data: any) => void;
      onRebuttal?: (data: any) => void;
      onDebateSynthesis?: (data: any) => void;
      // === Orchestrator callbacks ===
      onOrchestratorThinking?: (data: any) => void;
      onOrchestratorMessage?: (data: any) => void;
      onOrchestratorDecision?: (data: any) => void;
      onOrchestratorIntervention?: (data: any) => void;
      onTopicAnalysis?: (data: any) => void;
    }
  ): Promise<void> {
    const response = await fetch(streamUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
      },
    });

    if (!response.ok) {
      throw new PanelAPIError(`Failed to connect to mission stream: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new PanelAPIError('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let currentEventType = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEventType = line.replace('event:', '').trim();
            continue;
          }

          if (line.startsWith('data:')) {
            try {
              const jsonStr = line.replace('data:', '').trim();
              if (!jsonStr) continue;

              const data = JSON.parse(jsonStr);
              const eventType = currentEventType || data.type || 'unknown';
              currentEventType = '';

              switch (eventType) {
                case 'panel_started':
                  callbacks.onPanelStarted?.(data);
                  break;
                case 'experts_selected':
                  callbacks.onExpertsSelected?.(data);
                  break;
                case 'round_started':
                  callbacks.onRoundStarted?.(data);
                  break;
                case 'expert_response':
                  callbacks.onExpertResponse?.(data);
                  break;
                case 'round_complete':
                  callbacks.onRoundComplete?.(data);
                  break;
                case 'consensus_update':
                  callbacks.onConsensusUpdate?.(data);
                  break;
                case 'checkpoint_reached':
                  callbacks.onCheckpointReached?.(data);
                  break;
                case 'synthesis_complete':
                  callbacks.onSynthesisComplete?.(data);
                  break;
                case 'panel_completed':
                case 'mission_completed':
                  callbacks.onPanelCompleted?.(data);
                  break;
                case 'panel_paused':
                case 'mission_paused':
                  callbacks.onPanelPaused?.(data);
                  break;
                case 'panel_cancelled':
                case 'mission_cancelled':
                  callbacks.onPanelCancelled?.(data);
                  break;
                // === Token streaming events ===
                case 'expert_stream_start':
                  callbacks.onExpertStreamStart?.(data);
                  break;
                case 'expert_token':
                  callbacks.onExpertToken?.(data);
                  break;
                case 'expert_stream_end':
                  callbacks.onExpertStreamEnd?.(data);
                  break;
                // === Debate-specific events ===
                case 'turn_started':
                  callbacks.onTurnStarted?.(data);
                  break;
                case 'argument':
                  callbacks.onArgument?.(data);
                  break;
                case 'rebuttal':
                  callbacks.onRebuttal?.(data);
                  break;
                case 'synthesis':
                  callbacks.onDebateSynthesis?.(data);
                  break;
                // === Orchestrator events ===
                case 'orchestrator_thinking':
                  callbacks.onOrchestratorThinking?.(data);
                  break;
                case 'orchestrator_message':
                  callbacks.onOrchestratorMessage?.(data);
                  break;
                case 'orchestrator_decision':
                  callbacks.onOrchestratorDecision?.(data);
                  break;
                case 'orchestrator_intervention':
                  callbacks.onOrchestratorIntervention?.(data);
                  break;
                case 'topic_analysis':
                  callbacks.onTopicAnalysis?.(data);
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
}

/**
 * Singleton instance of PanelMissionClient
 */
let panelMissionClientInstance: PanelMissionClient | null = null;

export function getPanelMissionClient(): PanelMissionClient {
  if (!panelMissionClientInstance) {
    panelMissionClientInstance = new PanelMissionClient();
  }
  return panelMissionClientInstance;
}

// ============================================================================
// PANEL WIZARD TYPES (AI-Guided Panel Creation)
// ============================================================================

export type WizardStep =
  | 'intent_input'
  | 'parse_intent'
  | 'confirm_goals'
  | 'generate_questions'
  | 'confirm_questions'
  | 'suggest_panel_type'
  | 'confirm_panel_type'
  | 'search_agents'
  | 'confirm_agents'
  | 'generate_proposal'
  | 'completed';

export type WizardStatus = 'in_progress' | 'completed' | 'draft' | 'launched' | 'abandoned';

export interface WizardObjective {
  id: string;
  text: string;
  is_user_added: boolean;
}

export interface WizardQuestion {
  id: string;
  question: string;
  rationale?: string;
  assigned_to: string;
  priority: 'high' | 'medium' | 'low';
  expected_output?: string;
  is_user_added: boolean;
  order: number;
}

export interface WizardAgent {
  agent_id: string;
  name: string;
  relevance_score: number;
  match_reasons: string[];
  role_in_panel: string;
  is_user_added: boolean;
}

export interface WizardAlternativeType {
  type: string;
  fit_score: number;
  rationale: string;
}

export interface WizardProposal {
  id: string;
  name: string;
  description: string;
  panel_type: PanelType;
  domain: string;
  therapeutic_area?: string;
  goals: {
    primary_intent: string;
    objectives: WizardObjective[];
    constraints: string[];
    success_criteria: string[];
  };
  questions: WizardQuestion[];
  agents: WizardAgent[];
  settings: {
    mode: string;
    max_rounds: number;
    require_consensus: boolean;
    allow_debate: boolean;
  };
  estimated_duration: string;
  created_at: string;
  status: string;
}

export interface WizardState {
  session_id: string;
  tenant_id: string;
  user_id?: string;
  status: WizardStatus;
  current_step: WizardStep;
  awaiting_confirmation?: 'goals' | 'questions' | 'panel_type' | 'agents' | null;

  // Goals
  raw_prompt?: string;
  primary_intent?: string;
  domain?: string;
  therapeutic_area?: string;
  objectives: WizardObjective[];
  constraints: string[];
  success_criteria: string[];
  intent_confidence?: number;
  goals_confirmed: boolean;

  // Questions
  questions: WizardQuestion[];
  suggested_question_count?: number;
  estimated_discussion_time?: string;
  questions_confirmed: boolean;

  // Panel type
  recommended_panel_type?: PanelType;
  panel_type_rationale?: string;
  panel_type_confidence?: number;
  alternative_types: WizardAlternativeType[];
  selected_panel_type?: PanelType;
  panel_settings: {
    mode?: string;
    max_rounds?: number;
    require_consensus?: boolean;
    allow_debate?: boolean;
  };
  panel_type_confirmed: boolean;

  // Agents
  recommended_agents: WizardAgent[];
  selected_agents: WizardAgent[];
  composition_rationale?: string;
  diversity_score?: number;
  agents_confirmed: boolean;

  // Proposal
  proposal?: WizardProposal;
  saved_as?: 'draft' | 'template';
  launched_at?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  error?: string;
}

export interface StartWizardResponse {
  session_id: string;
  status: string;
  current_step: string;
  created_at: string;
}

// ============================================================================
// PANEL WIZARD CLIENT
// ============================================================================

export class PanelWizardClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000';
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    data?: any
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new PanelAPIError(error.detail || 'Wizard API request failed', response.status);
    }

    return response.json();
  }

  /**
   * Start a new wizard session
   */
  async startSession(initialPrompt?: string): Promise<StartWizardResponse> {
    return this.request<StartWizardResponse>('POST', '/ask-panel/wizard/start', {
      initial_prompt: initialPrompt,
    });
  }

  /**
   * Get wizard session state
   */
  async getSession(sessionId: string): Promise<WizardState> {
    return this.request<WizardState>('GET', `/ask-panel/wizard/${sessionId}`);
  }

  /**
   * Parse user intent (Step 1)
   */
  async parseIntent(sessionId: string, prompt: string): Promise<WizardState> {
    return this.request<WizardState>('POST', `/ask-panel/wizard/${sessionId}/parse-intent`, {
      prompt,
    });
  }

  /**
   * Confirm goals (HITL Step 2)
   */
  async confirmGoals(
    sessionId: string,
    confirmed: boolean,
    modifications?: {
      objectives?: WizardObjective[];
      primary_intent?: string;
      domain?: string;
      therapeutic_area?: string;
      constraints?: string[];
      success_criteria?: string[];
    }
  ): Promise<WizardState> {
    return this.request<WizardState>('POST', `/ask-panel/wizard/${sessionId}/confirm-goals`, {
      confirmed,
      ...modifications,
    });
  }

  /**
   * Generate questions (Step 3)
   */
  async generateQuestions(sessionId: string): Promise<WizardState> {
    return this.request<WizardState>('POST', `/ask-panel/wizard/${sessionId}/generate-questions`);
  }

  /**
   * Confirm questions (HITL Step 4)
   */
  async confirmQuestions(
    sessionId: string,
    confirmed: boolean,
    questions?: WizardQuestion[]
  ): Promise<WizardState> {
    return this.request<WizardState>('POST', `/ask-panel/wizard/${sessionId}/confirm-questions`, {
      confirmed,
      questions,
    });
  }

  /**
   * Suggest panel type (Step 5)
   */
  async suggestPanelType(sessionId: string): Promise<WizardState> {
    return this.request<WizardState>('POST', `/ask-panel/wizard/${sessionId}/suggest-panel-type`);
  }

  /**
   * Confirm panel type (HITL Step 6)
   */
  async confirmPanelType(
    sessionId: string,
    confirmed: boolean,
    selectedType?: PanelType,
    panelSettings?: Record<string, any>
  ): Promise<WizardState> {
    return this.request<WizardState>('POST', `/ask-panel/wizard/${sessionId}/confirm-panel-type`, {
      confirmed,
      selected_panel_type: selectedType,
      panel_settings: panelSettings,
    });
  }

  /**
   * Recommend agents (Step 7)
   */
  async recommendAgents(sessionId: string): Promise<WizardState> {
    return this.request<WizardState>('POST', `/ask-panel/wizard/${sessionId}/recommend-agents`);
  }

  /**
   * Confirm agents (HITL Step 8)
   */
  async confirmAgents(
    sessionId: string,
    confirmed: boolean,
    selectedAgents?: WizardAgent[]
  ): Promise<WizardState> {
    return this.request<WizardState>('POST', `/ask-panel/wizard/${sessionId}/confirm-agents`, {
      confirmed,
      selected_agents: selectedAgents,
    });
  }

  /**
   * Finalize wizard and generate proposal (Step 9)
   */
  async finalize(sessionId: string): Promise<WizardState> {
    return this.request<WizardState>('POST', `/ask-panel/wizard/${sessionId}/finalize`);
  }

  /**
   * Save as draft
   */
  async saveDraft(
    sessionId: string,
    name: string,
    description?: string
  ): Promise<{ status: string; saved_as: string; session_id: string; name: string }> {
    return this.request('POST', `/ask-panel/wizard/${sessionId}/save-draft`, {
      name,
      description,
    });
  }

  /**
   * Save as template
   */
  async saveTemplate(
    sessionId: string,
    name: string,
    description?: string,
    isPublic?: boolean
  ): Promise<{
    status: string;
    saved_as: string;
    template_id: string;
    name: string;
    is_public: boolean;
  }> {
    return this.request('POST', `/ask-panel/wizard/${sessionId}/save-template`, {
      name,
      description,
      is_public: isPublic || false,
    });
  }

  /**
   * Launch panel mission from wizard
   */
  async launch(sessionId: string): Promise<{
    status: string;
    mission_id: string;
    panel_type: string;
    stream_url: string;
  }> {
    return this.request('POST', `/ask-panel/wizard/${sessionId}/launch`);
  }

  /**
   * List wizard sessions
   */
  async listSessions(params?: {
    status?: WizardStatus;
    limit?: number;
  }): Promise<{ sessions: Array<{ session_id: string; status: string; primary_intent: string; created_at: string; updated_at: string }>; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    const path = query ? `/ask-panel/wizard/sessions?${query}` : '/ask-panel/wizard/sessions';

    return this.request('GET', path);
  }

  /**
   * Delete wizard session
   */
  async deleteSession(sessionId: string): Promise<{ status: string; session_id: string }> {
    return this.request('DELETE', `/ask-panel/wizard/${sessionId}`);
  }
}

/**
 * Singleton instance of PanelWizardClient
 */
let panelWizardClientInstance: PanelWizardClient | null = null;

export function getPanelWizardClient(): PanelWizardClient {
  if (!panelWizardClientInstance) {
    panelWizardClientInstance = new PanelWizardClient();
  }
  return panelWizardClientInstance;
}

/**
 * Format panel mission status for display
 */
export function formatPanelMissionStatus(status: PanelMissionStatus): string {
  const statusMap: Record<PanelMissionStatus, string> = {
    pending: 'Pending',
    planning: 'Planning',
    selecting: 'Selecting Experts',
    executing: 'In Discussion',
    consensus: 'Building Consensus',
    checkpoint: 'Awaiting Review',
    synthesizing: 'Synthesizing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    paused: 'Paused',
  };
  return statusMap[status] || status;
}

/**
 * Get mission status color class for Tailwind
 */
export function getPanelMissionStatusColor(status: PanelMissionStatus): string {
  const colorMap: Record<PanelMissionStatus, string> = {
    pending: 'text-stone-600 bg-stone-100',
    planning: 'text-blue-600 bg-blue-100',
    selecting: 'text-indigo-600 bg-indigo-100',
    executing: 'text-purple-600 bg-purple-100',
    consensus: 'text-violet-600 bg-violet-100',
    checkpoint: 'text-amber-600 bg-amber-100',
    synthesizing: 'text-cyan-600 bg-cyan-100',
    completed: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
    cancelled: 'text-stone-500 bg-stone-100',
    paused: 'text-yellow-600 bg-yellow-100',
  };
  return colorMap[status] || 'text-stone-600 bg-stone-100';
}

