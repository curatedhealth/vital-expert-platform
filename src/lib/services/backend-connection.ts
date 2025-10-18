/**
 * Backend Connection Service
 * Handles real-time communication with Python LangGraph backend
 */

import { backendConfig, apiEndpoints, healthEndpoints } from '@/lib/config/backend';

export interface BackendConfig {
  pythonBackendUrl: string;
  nodeGatewayUrl: string;
  timeout: number;
  retryAttempts: number;
}

export interface StreamingResponse {
  stream: ReadableStream<Uint8Array>;
  controller: AbortController;
}

export class BackendConnectionService {
  private config: BackendConfig;

  constructor(config: BackendConfig = backendConfig) {
    this.config = config;
  }

  /**
   * Connect to Python backend for autonomous reasoning
   */
  async connectToAutonomousBackend(sessionId: string): Promise<StreamingResponse> {
    const controller = new AbortController();
    
    try {
      const response = await fetch(apiEndpoints.autonomous.stream(sessionId), {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Backend connection failed: ${response.status} ${response.statusText}`);
      }

      return {
        stream: response.body!,
        controller
      };
    } catch (error) {
      console.error('❌ [BackendConnection] Autonomous connection failed:', error);
      throw error;
    }
  }

  /**
   * Connect to Python backend for interactive consultation
   */
  async connectToInteractiveBackend(sessionId: string, query: string, agent?: any): Promise<StreamingResponse> {
    const controller = new AbortController();
    
    try {
      const response = await fetch(apiEndpoints.consultation.stream(sessionId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          query,
          agent,
          session_id: sessionId
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Backend connection failed: ${response.status} ${response.statusText}`);
      }

      return {
        stream: response.body!,
        controller
      };
    } catch (error) {
      console.error('❌ [BackendConnection] Interactive connection failed:', error);
      throw error;
    }
  }

  /**
   * Start autonomous session with LangGraph
   */
  async startAutonomousSession(query: string, agent: any, businessContext?: any): Promise<{ sessionId: string; stream: ReadableStream<Uint8Array> }> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const response = await fetch(apiEndpoints.autonomous.start, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          agent,
          business_context: businessContext,
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start autonomous session: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const streamResponse = await this.connectToAutonomousBackend(sessionId);
      
      return {
        sessionId: result.session_id || sessionId,
        stream: streamResponse.stream
      };
    } catch (error) {
      console.error('❌ [BackendConnection] Failed to start autonomous session:', error);
      throw error;
    }
  }

  /**
   * Start interactive session with LangGraph
   */
  async startInteractiveSession(query: string, agent: any, businessContext?: any): Promise<{ sessionId: string; stream: ReadableStream<Uint8Array> }> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const response = await fetch(apiEndpoints.consultation.start, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          agent,
          business_context: businessContext,
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start interactive session: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const streamResponse = await this.connectToInteractiveBackend(sessionId, query, agent);
      
      return {
        sessionId: result.session_id || sessionId,
        stream: streamResponse.stream
      };
    } catch (error) {
      console.error('❌ [BackendConnection] Failed to start interactive session:', error);
      throw error;
    }
  }

  /**
   * Check backend health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(healthEndpoints.python, {
        method: 'GET',
        signal: AbortSignal.timeout(this.config.timeout)
      });
      return response.ok;
    } catch (error) {
      console.error('❌ [BackendConnection] Health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const backendConnection = new BackendConnectionService();
