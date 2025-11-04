/**
 * Python Service Proxy for VITAL Path Gateway
 * Handles communication with Python FastAPI backend
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import winston from 'winston';

interface PythonServiceConfig {
  url: string;
  timeout: number;
  retries: number;
  healthCheckInterval: number;
}

interface AgentQueryRequest {
  agent_id?: string;
  agent_type: string;
  query: string;
  user_id?: string;
  organization_id?: string;
  medical_specialty?: string;
  phase?: string;
  max_context_docs?: number;
  similarity_threshold?: number;
  pharma_protocol_required?: boolean;
  verify_protocol_required?: boolean;
}

interface RAGSearchRequest {
  query: string;
  filters?: Record<string, any>;
  max_results?: number;
  similarity_threshold?: number;
  include_metadata?: boolean;
}

export class PythonServiceProxy {
  private client: AxiosInstance;
  private config: PythonServiceConfig;
  private logger: winston.Logger;
  private healthStatus: boolean = false;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(config: PythonServiceConfig) {
    this.config = config;
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'python-service-proxy' }
    });

    this.client = axios.create({
      baseURL: config.url,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VITAL-Path-Gateway/2.0.0'
      }
    });

    this.setupInterceptors();
    this.startHealthCheck();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug('🔀 Python service request', {
          method: config.method,
          url: config.url,
          data: config.data ? JSON.stringify(config.data).substring(0, 200) : undefined
        });
        return config;
      },
      (error) => {
        this.logger.error('❌ Python service request error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug('✅ Python service response', {
          status: response.status,
          url: response.config.url,
          responseTime: response.headers['x-response-time']
        });
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Retry logic
        if (error.response?.status >= 500 && !originalRequest._retry && this.config.retries > 0) {
          originalRequest._retry = true;
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

          if (originalRequest._retryCount <= this.config.retries) {
            this.logger.warn('🔄 Retrying Python service request', {
              attempt: originalRequest._retryCount,
              url: originalRequest.url
            });

            // Exponential backoff
            const delay = Math.pow(2, originalRequest._retryCount - 1) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));

            return this.client(originalRequest);
          }
        }

        this.logger.error('❌ Python service response error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data
        });

        return Promise.reject(error);
      }
    );
  }

  private startHealthCheck(): void {
    this.healthCheck();
    this.healthCheckTimer = setInterval(
      () => this.healthCheck(),
      this.config.healthCheckInterval
    );
  }

  private async healthCheck(): Promise<void> {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      this.healthStatus = response.status === 200;

      if (this.healthStatus) {
        this.logger.debug('💚 Python service health check passed');
      }
    } catch (error) {
      this.healthStatus = false;
      this.logger.warn('💔 Python service health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public isHealthy(): boolean {
    return this.healthStatus;
  }

  // Agent query proxy
  public async queryAgent(request: AgentQueryRequest): Promise<any> {
    try {
      this.logger.info('🧠 Proxying agent query', {
        agent_type: request.agent_type,
        query_length: request.query.length
      });

      const response = await this.client.post('/api/agents/query', request);

      this.logger.info('✅ Agent query completed', {
        agent_id: response.data.agent_id,
        confidence: response.data.confidence
      });

      return response.data;
    } catch (error) {
      this.logger.error('❌ Agent query failed', error);
      throw this.handleError(error);
    }
  }

  // RAG search proxy
  public async searchRAG(request: RAGSearchRequest): Promise<any> {
    try {
      this.logger.info('🔍 Proxying RAG search', {
        query: request.query.substring(0, 100),
        max_results: request.max_results
      });

      const response = await this.client.post('/api/rag/search', request);

      this.logger.info('✅ RAG search completed', {
        results_count: response.data.results?.length || 0,
        total_results: response.data.total_results
      });

      return response.data;
    } catch (error) {
      this.logger.error('❌ RAG search failed', error);
      throw this.handleError(error);
    }
  }

  // Agent creation proxy
  public async createAgent(request: any): Promise<any> {
    try {
      this.logger.info('🤖 Proxying agent creation', {
        name: request.name,
        agent_type: request.agent_type
      });

      const response = await this.client.post('/api/agents/create', request);

      this.logger.info('✅ Agent creation completed', {
        agent_id: response.data.agent_id
      });

      return response.data;
    } catch (error) {
      this.logger.error('❌ Agent creation failed', error);
      throw this.handleError(error);
    }
  }

  // Prompt generation proxy
  public async generatePrompt(request: any): Promise<any> {
    try {
      this.logger.info('📝 Proxying prompt generation', {
        capabilities_count: request.selected_capabilities?.length || 0
      });

      const response = await this.client.post('/api/prompts/generate', request);

      this.logger.info('✅ Prompt generation completed', {
        token_count: response.data.metadata?.token_count
      });

      return response.data;
    } catch (error) {
      this.logger.error('❌ Prompt generation failed', error);
      throw this.handleError(error);
    }
  }

  // Document upload proxy
  public async uploadDocument(request: any): Promise<any> {
    try {
      this.logger.info('📚 Proxying document upload', {
        title: request.title,
        content_length: request.content?.length || 0
      });

      const response = await this.client.post('/api/documents/upload', request);

      this.logger.info('✅ Document upload completed', {
        document_id: response.data.document_id
      });

      return response.data;
    } catch (error) {
      this.logger.error('❌ Document upload failed', error);
      throw this.handleError(error);
    }
  }

  // System metrics proxy
  public async getSystemMetrics(): Promise<any> {
    try {
      const response = await this.client.get('/api/system/metrics');
      return response.data;
    } catch (error) {
      this.logger.error('❌ System metrics request failed', error);
      throw this.handleError(error);
    }
  }

  // WebSocket message proxy
  public async proxyWebSocketMessage(agentId: string, message: any): Promise<any> {
    try {
      this.logger.debug('💬 Proxying WebSocket message', {
        agent_id: agentId,
        message_type: message.type
      });

      // For WebSocket messages, we'll use a direct HTTP call to Python service
      // The Python service will handle the WebSocket-style message processing
      const response = await this.client.post(`/api/agents/${agentId}/message`, message);

      return response.data;
    } catch (error) {
      this.logger.error('❌ WebSocket message proxy failed', error);
      throw this.handleError(error);
    }
  }

  // Generic proxy method for any endpoint
  public async proxy(method: string, endpoint: string, data?: any, headers?: Record<string, string>): Promise<any> {
    try {
      const config: AxiosRequestConfig = {
        method: method.toLowerCase() as any,
        url: endpoint,
        headers: headers
      };

      if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
        config.data = data;
      } else if (data) {
        config.params = data;
      }

      const response = await this.client(config);
      return response.data;
    } catch (error) {
      this.logger.error('❌ Generic proxy request failed', {
        method,
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.error || error.response.data?.message || error.message;
        const proxyError = new Error(`Python service error: ${message}`);
        (proxyError as any).status = error.response.status;
        (proxyError as any).details = error.response.data;
        return proxyError;
      } else if (error.request) {
        // Request was made but no response received
        return new Error('Python service is not responding');
      }
    }

    // Something else happened
    return error instanceof Error ? error : new Error('Unknown proxy error');
  }

  public async shutdown(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    this.logger.info('🔄 Python service proxy shutdown completed');
  }
}