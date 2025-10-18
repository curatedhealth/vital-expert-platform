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
      console.log('🔗 [BackendConnection] Starting autonomous session with URL:', apiEndpoints.autonomous.start);
      
      // For development, we need to create a chat first or use an existing one
      let chatId = sessionId;
      
      // Check if we're in development mode and need to create a chat
      if (this.config.pythonBackendUrl.includes('localhost')) {
        // Try to get existing chats first
        const chatsResponse = await fetch(`${this.config.pythonBackendUrl}/api/chats`);
        if (chatsResponse.ok) {
          const chats = await chatsResponse.json();
          if (chats.chats && chats.chats.length > 0) {
            chatId = chats.chats[0].id;
          } else {
            // Create a new chat
            const createChatResponse = await fetch(`${this.config.pythonBackendUrl}/api/chats`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: 'Autonomous Chat',
                agentName: agent?.name || 'Autonomous Agent'
              })
            });
            if (createChatResponse.ok) {
              const newChat = await createChatResponse.json();
              chatId = newChat.id;
            }
          }
        }
      }
      
      const response = await fetch(apiEndpoints.autonomous.start, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          goal: query,
          maxIterations: 10,
          autoApprove: true
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start autonomous session: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const streamResponse = await this.connectToAutonomousBackend(chatId);
      
      return {
        sessionId: result.sessionId || chatId,
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
  async checkHealth(request?: Request): Promise<boolean> {
    try {
      console.log('🔍 [BackendConnection] Health check called with config:', {
        pythonBackendUrl: this.config.pythonBackendUrl,
        startsWithHttp: this.config.pythonBackendUrl.startsWith('http'),
        isProduction: process.env.NODE_ENV === 'production',
        isVercel: process.env.VERCEL === '1'
      });
      
      // In production with mock endpoints, always return true since we know they work
      if (!this.config.pythonBackendUrl.startsWith('http')) {
        console.log('🔍 [BackendConnection] Using mock backend in production - health check passed');
        return true;
      }
      
      let healthUrl = healthEndpoints.python;
      
      console.log('🔍 [BackendConnection] Health check URL:', healthUrl);
      console.log('🔍 [BackendConnection] Backend config:', {
        pythonBackendUrl: this.config.pythonBackendUrl,
        isRelative: !this.config.pythonBackendUrl.startsWith('http'),
        VERCEL_URL: process.env.VERCEL_URL,
        NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
        hasRequest: !!request
      });
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(this.config.timeout)
      });
      
      console.log('🔍 [BackendConnection] Health check response:', response.status, response.ok);
      return response.ok;
    } catch (error) {
      console.error('❌ [BackendConnection] Health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const backendConnection = new BackendConnectionService();
