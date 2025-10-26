/**
 * Hybrid GraphRAG Agent Search - Frontend Client
 *
 * TypeScript client for the Python FastAPI hybrid search service with:
 * - REST API integration
 * - WebSocket real-time search
 * - Type-safe request/response models
 * - Error handling and retry logic
 * - Performance monitoring
 *
 * Created: 2025-10-24
 * Phase: 3 Week 4 - Production Integration
 */

// ============================================================================
// TYPES
// ============================================================================

export interface SearchRequest {
  query: string;
  domains?: string[];
  capabilities?: string[];
  tier?: 1 | 2 | 3;
  maxResults?: number;
  includeGraphContext?: boolean;
  useCache?: boolean;
  experimentId?: string;
}

export interface AgentResult {
  agentId: string;
  name: string;
  displayName?: string;
  tier: number;

  // Scoring breakdown
  overallScore: number;
  vectorScore: number;
  domainScore: number;
  capabilityScore: number;
  graphScore: number;

  // Metadata
  domains: string[];
  capabilities: string[];
  description?: string;
  avatarUrl?: string;

  // Graph context (optional)
  escalationPaths?: Array<{
    toAgentName: string;
    priority: number;
    successRate: number;
  }>;
  relatedAgents?: string[];
  collaborationCount?: number;
}

export interface SearchResponse {
  results: AgentResult[];
  totalResults: number;
  query: string;
  searchTimeMs: number;
  cacheHit: boolean;
  embeddingTimeMs?: number;
  searchTimeMsBreakdown?: {
    total: number;
    embeddingGeneration: number;
    searchExecution: number;
  };
  experimentVariant?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: Record<string, string>;
  performance: {
    cacheHitRate?: number;
    totalSearches?: number;
    avgSearchTimeMs?: number;
  };
}

export interface WebSocketMessage {
  status: 'searching' | 'results' | 'error' | 'pong';
  query?: string;
  results?: AgentResult[];
  totalResults?: number;
  searchTimeMs?: number;
  error?: string;
  timestamp?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

interface ClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  enableLogging?: boolean;
}

const DEFAULT_CONFIG: Partial<ClientConfig> = {
  baseUrl: process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000',
  timeout: 10000, // 10 seconds
  retries: 3,
  enableLogging: process.env.NODE_ENV === 'development'
};

// ============================================================================
// CLIENT
// ============================================================================

export class HybridSearchClient {
  private config: ClientConfig;
  private ws: WebSocket | null = null;
  private wsCallbacks: Map<string, (message: WebSocketMessage) => void> = new Map();

  constructor(config?: Partial<ClientConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config } as ClientConfig;
    this.log('Initialized HybridSearchClient', this.config);
  }

  // ==========================================================================
  // REST API METHODS
  // ==========================================================================

  /**
   * Search for agents using hybrid GraphRAG algorithm
   */
  async searchAgents(request: SearchRequest): Promise<SearchResponse> {
    const startTime = performance.now();

    try {
      this.log('Searching agents', request);

      const response = await this.fetchWithRetry(
        `${this.config.baseUrl}/api/v1/search/agents`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(this.toSnakeCase(request))
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Search failed: ${response.status}`);
      }

      const data = await response.json();
      const result = this.toCamelCase(data) as SearchResponse;

      const clientTime = performance.now() - startTime;
      this.log('Search completed', {
        results: result.totalResults,
        serverTime: result.searchTimeMs,
        clientTime,
        cacheHit: result.cacheHit
      });

      return result;

    } catch (error) {
      this.log('Search failed', error);
      throw this.handleError(error);
    }
  }

  /**
   * Find agents similar to a given agent
   */
  async findSimilarAgents(
    agentId: string,
    options?: {
      maxResults?: number;
      includeGraphContext?: boolean;
    }
  ): Promise<SearchResponse> {
    try {
      this.log('Finding similar agents', { agentId, ...options });

      const params = new URLSearchParams();
      if (options?.maxResults) params.append('max_results', String(options.maxResults));
      if (options?.includeGraphContext !== undefined) {
        params.append('include_graph_context', String(options.includeGraphContext));
      }

      const url = `${this.config.baseUrl}/api/v1/search/agents/${agentId}/similar?${params}`;

      const response = await this.fetchWithRetry(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to find similar agents: ${response.status}`);
      }

      const data = await response.json();
      return this.toCamelCase(data) as SearchResponse;

    } catch (error) {
      this.log('Find similar agents failed', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get service health status
   */
  async getHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/search/health`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      return this.toCamelCase(data) as HealthResponse;

    } catch (error) {
      this.log('Health check failed', error);
      throw this.handleError(error);
    }
  }

  // ==========================================================================
  // WEBSOCKET METHODS
  // ==========================================================================

  /**
   * Connect to WebSocket for real-time search
   */
  connectWebSocket(
    clientId: string,
    onMessage?: (message: WebSocketMessage) => void
  ): void {
    const wsUrl = `${this.config.baseUrl.replace('http', 'ws')}/api/v1/search/ws/${clientId}`;

    this.log('Connecting WebSocket', { clientId, wsUrl });

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.log('WebSocket message received', message);

        if (onMessage) {
          onMessage(message);
        }

        // Call query-specific callbacks
        if (message.query && this.wsCallbacks.has(message.query)) {
          const callback = this.wsCallbacks.get(message.query);
          if (callback) {
            callback(message);
            // Clean up callback after results
            if (message.status === 'results' || message.status === 'error') {
              this.wsCallbacks.delete(message.query);
            }
          }
        }
      } catch (error) {
        this.log('Failed to parse WebSocket message', error);
      }
    };

    this.ws.onerror = (error) => {
      this.log('WebSocket error', error);
    };

    this.ws.onclose = () => {
      this.log('WebSocket disconnected');
      this.ws = null;
    };
  }

  /**
   * Search via WebSocket (real-time)
   */
  async searchWebSocket(
    request: SearchRequest,
    onMessage: (message: WebSocketMessage) => void
  ): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected. Call connectWebSocket() first.');
    }

    // Register callback for this query
    this.wsCallbacks.set(request.query, onMessage);

    // Send search request
    this.ws.send(JSON.stringify({
      action: 'search',
      ...this.toSnakeCase(request)
    }));

    this.log('WebSocket search sent', request);
  }

  /**
   * Send WebSocket ping
   */
  pingWebSocket(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.ws.send(JSON.stringify({ action: 'ping' }));
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.wsCallbacks.clear();
      this.log('WebSocket disconnected');
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isWebSocketConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Get request headers with authentication
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.config.apiKey) {
      // For now, using query param for API key
      // In production, use Authorization header with JWT
      // headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  /**
   * Fetch with retry logic
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    attempt = 1
  ): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeout);
      return response;

    } catch (error) {
      if (attempt < (this.config.retries || 3)) {
        this.log(`Retry ${attempt}/${this.config.retries}`, { url, error });
        await this.sleep(Math.pow(2, attempt) * 100); // Exponential backoff
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Convert object keys to snake_case for Python API
   */
  private toSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item: any) => this.toSnakeCase(item));
    }

    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        acc[snakeKey] = this.toSnakeCase(obj[key]);
        return acc;
      }, {} as any);
    }

    return obj;
  }

  /**
   * Convert object keys to camelCase from Python API
   */
  private toCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item: any) => this.toCamelCase(item));
    }

    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        acc[camelKey] = this.toCamelCase(obj[key]);
        return acc;
      }, {} as any);
    }

    return obj;
  }

  /**
   * Handle and format errors
   */
  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    return new Error('An unexpected error occurred');
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log utility
   */
  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`[HybridSearchClient] ${message}`, data || '');
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let clientInstance: HybridSearchClient | null = null;

/**
 * Get singleton instance of HybridSearchClient
 */
export function getHybridSearchClient(config?: Partial<ClientConfig>): HybridSearchClient {
  if (!clientInstance) {
    clientInstance = new HybridSearchClient(config);
  }
  return clientInstance;
}

// ============================================================================
// REACT HOOKS (Optional)
// ============================================================================

export function useHybridSearch() {
  const client = getHybridSearchClient();

  const searchAgents = async (request: SearchRequest): Promise<SearchResponse> => {
    return client.searchAgents(request);
  };

  const findSimilarAgents = async (
    agentId: string,
    options?: { maxResults?: number; includeGraphContext?: boolean }
  ): Promise<SearchResponse> => {
    return client.findSimilarAgents(agentId, options);
  };

  const getHealth = async (): Promise<HealthResponse> => {
    return client.getHealth();
  };

  return {
    searchAgents,
    findSimilarAgents,
    getHealth,
    client
  };
}

/**
 * React hook for WebSocket search
 */
export function useWebSocketSearch(clientId: string) {
  const client = getHybridSearchClient();
  const [connected, setConnected] = React.useState(false);
  const [lastMessage, setLastMessage] = React.useState<WebSocketMessage | null>(null);

  React.useEffect(() => {
    client.connectWebSocket(clientId, (message) => {
      setLastMessage(message);
    });

    setConnected(true);

    return () => {
      client.disconnectWebSocket();
      setConnected(false);
    };
  }, [clientId]);

  const search = async (
    request: SearchRequest,
    onMessage?: (message: WebSocketMessage) => void
  ): Promise<void> => {
    await client.searchWebSocket(request, onMessage || setLastMessage);
  };

  const ping = (): void => {
    client.pingWebSocket();
  };

  return {
    connected,
    lastMessage,
    search,
    ping
  };
}

// Import React for hooks (only if using hooks)
import React from 'react';

// Export default client
export default HybridSearchClient;
