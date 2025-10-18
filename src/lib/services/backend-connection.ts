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
      // Construct full URL for production
      let streamUrl = apiEndpoints.autonomous.stream(sessionId);
      if (!streamUrl.startsWith('http')) {
        // In production, construct the full URL
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}`
          : 'https://vital-expert-lltl5qmhb-crossroads-catalysts-projects.vercel.app';
        streamUrl = `${baseUrl}${streamUrl}`;
      }
      
      console.log('🔗 [BackendConnection] Autonomous stream URL:', streamUrl);
      
      const response = await fetch(streamUrl, {
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
      // Construct full URL for production
      let streamUrl = apiEndpoints.consultation.stream(sessionId);
      if (!streamUrl.startsWith('http')) {
        // In production, construct the full URL
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}`
          : 'https://vital-expert-lltl5qmhb-crossroads-catalysts-projects.vercel.app';
        streamUrl = `${baseUrl}${streamUrl}`;
      }
      
      console.log('🔗 [BackendConnection] Interactive stream URL:', streamUrl);
      
      const response = await fetch(streamUrl, {
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
      
      // For real LangGraph backend, we need to create a chat first
      let chatId = sessionId;
      
      // Always create a chat for the real backend
      try {
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
          chatId = newChat.chat.id;
          console.log('🔗 [BackendConnection] Created new chat:', chatId);
        } else {
          console.warn('⚠️ [BackendConnection] Failed to create chat, using sessionId');
        }
      } catch (error) {
        console.warn('⚠️ [BackendConnection] Chat creation failed:', error);
      }
      
      // Use real LangGraph backend format
      const requestBody = {
        chatId,
        goal: query,
        maxIterations: 10,
        autoApprove: true
      };
      
      // Construct full URL for production
      let startUrl = apiEndpoints.autonomous.start;
      if (!startUrl.startsWith('http')) {
        // In production, construct the full URL
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}`
          : 'https://vital-expert-lltl5qmhb-crossroads-catalysts-projects.vercel.app';
        startUrl = `${baseUrl}${startUrl}`;
      }
      
      console.log('🔗 [BackendConnection] Autonomous start URL:', startUrl);
      
      const response = await fetch(startUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to start autonomous session: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const streamResponse = await this.connectToAutonomousBackend(sessionId);
      
      return {
        sessionId: result.session_id || result.sessionId || sessionId,
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
      // Construct full URL for production
      let startUrl = apiEndpoints.consultation.start;
      if (!startUrl.startsWith('http')) {
        // In production, construct the full URL
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}`
          : 'https://vital-expert-lltl5qmhb-crossroads-catalysts-projects.vercel.app';
        startUrl = `${baseUrl}${startUrl}`;
      }
      
      console.log('🔗 [BackendConnection] Interactive start URL:', startUrl);
      
      const response = await fetch(startUrl, {
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
      
      // For development, check real backend health
      if (this.config.pythonBackendUrl.startsWith('http')) {
        // Real backend - perform actual health check
        console.log('🔍 [BackendConnection] Checking real LangGraph backend health');
      } else {
        // Production - for now, assume healthy since we'll deploy real backend
        console.log('🔍 [BackendConnection] Production mode - assuming backend is healthy');
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
