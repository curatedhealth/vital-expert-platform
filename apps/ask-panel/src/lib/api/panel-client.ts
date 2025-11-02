/**
 * API Client for Ask Panel Backend
 * 
 * Connects to the FastAPI ai-engine backend for panel operations.
 * Provides type-safe methods for all panel API endpoints.
 */

import type { Panel, PanelStatus, PanelType, PanelConfiguration } from '@/types/database.types';

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000';
const API_VERSION = 'v1';

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreatePanelRequest {
  query: string;
  panel_type: PanelType;
  agents: string[];
  configuration?: Partial<PanelConfiguration>;
  metadata?: Record<string, any>;
}

export interface ExecutePanelRequest {
  panel_id: string;
}

export interface ExecutePanelResponse {
  status: string;
  panel_id: string;
  consensus_level: number;
  response_count: number;
  execution_time_ms: number;
  recommendation: string;
}

export interface ListPanelsParams {
  page?: number;
  page_size?: number;
  status?: PanelStatus;
}

export interface ListPanelsResponse {
  panels: Panel[];
  total: number;
  page: number;
  page_size: number;
}

// ============================================================================
// API ERROR HANDLING
// ============================================================================

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetails;
    try {
      errorDetails = await response.json();
    } catch {
      errorDetails = { detail: response.statusText };
    }

    throw new APIError(
      errorDetails.detail || `HTTP ${response.status}`,
      response.status,
      errorDetails
    );
  }

  return response.json();
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class PanelAPIClient {
  private baseURL: string;
  private tenantId: string;
  private userId: string | null = null;

  constructor(tenantId: string, userId?: string | null) {
    this.baseURL = `${API_BASE_URL}/api/${API_VERSION}`;
    this.tenantId = tenantId;
    this.userId = userId || null;
  }

  /**
   * Set user ID for authenticated requests
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Get common headers for all requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.tenantId,
    };

    if (this.userId) {
      headers['X-User-ID'] = this.userId;
    }

    return headers;
  }

  // ==========================================================================
  // PANEL CRUD OPERATIONS
  // ==========================================================================

  /**
   * Create a new panel
   */
  async createPanel(request: CreatePanelRequest): Promise<Panel> {
    const response = await fetch(`${this.baseURL}/panels/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    return handleResponse<Panel>(response);
  }

  /**
   * Execute a panel (start the workflow)
   */
  async executePanel(panelId: string): Promise<ExecutePanelResponse> {
    const response = await fetch(`${this.baseURL}/panels/execute`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ panel_id: panelId }),
    });

    return handleResponse<ExecutePanelResponse>(response);
  }

  /**
   * Get a single panel by ID
   */
  async getPanel(panelId: string): Promise<Panel> {
    const response = await fetch(`${this.baseURL}/panels/${panelId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return handleResponse<Panel>(response);
  }

  /**
   * List panels with pagination and filtering
   */
  async listPanels(params?: ListPanelsParams): Promise<ListPanelsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString());
    if (params?.status) searchParams.set('status', params.status);

    const url = `${this.baseURL}/panels/?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return handleResponse<ListPanelsResponse>(response);
  }

  /**
   * Get panel responses
   */
  async getPanelResponses(panelId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/panels/${panelId}/responses`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return handleResponse(response);
  }

  /**
   * Get panel consensus
   */
  async getPanelConsensus(panelId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/panels/${panelId}/consensus`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return handleResponse(response);
  }

  // ==========================================================================
  // SSE STREAMING
  // ==========================================================================

  /**
   * Get SSE stream URL for panel execution
   * (Used with EventSource for real-time updates)
   */
  getStreamURL(panelId: string): string {
    // Add headers as query params (EventSource doesn't support custom headers)
    const params = new URLSearchParams({
      'tenant_id': this.tenantId,
    });

    return `${this.baseURL}/panels/${panelId}/stream?${params.toString()}`;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a panel API client instance
 */
export function createPanelAPIClient(tenantId: string, userId?: string | null): PanelAPIClient {
  return new PanelAPIClient(tenantId, userId);
}

/**
 * Quick panel creation helper
 */
export async function quickCreatePanel(
  tenantId: string,
  userId: string,
  query: string,
  panelType: PanelType = 'structured',
  agents: string[] = ['regulatory_expert', 'clinical_expert', 'quality_expert']
): Promise<Panel> {
  const client = createPanelAPIClient(tenantId, userId);
  
  return client.createPanel({
    query,
    panel_type: panelType,
    agents,
    metadata: {
      created_from: 'web_ui_quick',
      timestamp: new Date().toISOString(),
    },
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default PanelAPIClient;

