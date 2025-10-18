/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VITAL EXPERT - API CLIENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Type-safe API client for VITAL Expert backend
 * Supports all modes: Manual, Automatic, and Autonomous
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  Agent,
  Chat,
  Message,
  SendMessageRequest,
  SendMessageResponse,
  CreateChatRequest,
  CreateChatResponse,
  AutonomousExecuteRequest,
  AutonomousExecuteResponse,
  ReasoningStep,
  StreamHandlers,
  VitalExpertError,
  ErrorCode
} from '@/types/vital-expert.types';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
  enableAutonomous: process.env.NEXT_PUBLIC_ENABLE_AUTONOMOUS === 'true'
};

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════

class VitalExpertAPIError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'VitalExpertAPIError';
  }
}

const handleAPIError = async (response: Response): Promise<never> => {
  let errorData: any;
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: 'Unknown error occurred' };
  }

  const errorCode: ErrorCode = errorData.code || 'API_ERROR';
  throw new VitalExpertAPIError(
    errorCode,
    errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    errorData.details
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// API CLIENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class VitalExpertClient {
  private baseURL: string;
  private timeout: number;

  constructor(config = API_CONFIG) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async getChats(): Promise<Chat[]> {
    const response = await this.fetch('/api/chats');
    const data = await response.json();
    return data.chats || [];
  }

  async createChat(request: CreateChatRequest): Promise<Chat> {
    const response = await this.fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    const data = await response.json();
    return data.chat;
  }

  async deleteChat(chatId: string): Promise<void> {
    await this.fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE HANDLING
  // ═══════════════════════════════════════════════════════════════════════════

  async sendManualMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await this.fetch('/api/chat/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    return await response.json();
  }

  async sendAutomaticMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await this.fetch('/api/chat/automatic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    return await response.json();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTONOMOUS MODE
  // ═══════════════════════════════════════════════════════════════════════════

  async startAutonomousExecution(request: AutonomousExecuteRequest): Promise<AutonomousExecuteResponse> {
    const response = await this.fetch('/api/autonomous/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    return await response.json();
  }

  async pauseAutonomous(sessionId: string): Promise<void> {
    await this.fetch(`/api/autonomous/${sessionId}/pause`, { method: 'POST' });
  }

  async resumeAutonomous(sessionId: string): Promise<void> {
    await this.fetch(`/api/autonomous/${sessionId}/resume`, { method: 'POST' });
  }

  async stopAutonomous(sessionId: string): Promise<void> {
    await this.fetch(`/api/autonomous/${sessionId}/stop`, { method: 'POST' });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STREAMING
  // ═══════════════════════════════════════════════════════════════════════════

  connectAutonomousStream(sessionId: string, handlers: StreamHandlers): EventSource {
    const eventSource = new EventSource(`${this.baseURL}/api/autonomous/stream/${sessionId}`);

    eventSource.addEventListener('reasoning_step', (event) => {
      try {
        const data = JSON.parse(event.data);
        const step: ReasoningStep = {
          id: data.id,
          timestamp: new Date(data.timestamp),
          phase: data.phase,
          step: data.step,
          description: data.description,
          content: data.content || {},
          metadata: data.metadata || {}
        };
        handlers.onReasoningStep(step);
      } catch (error) {
        handlers.onError(new Error('Failed to parse reasoning step'));
      }
    });

    eventSource.addEventListener('phase_change', (event) => {
      try {
        const data = JSON.parse(event.data);
        handlers.onPhaseChange(data.phase, data.metadata);
      } catch (error) {
        handlers.onError(new Error('Failed to parse phase change'));
      }
    });

    eventSource.addEventListener('progress', (event) => {
      try {
        const data = JSON.parse(event.data);
        handlers.onProgress(data.progress);
      } catch (error) {
        handlers.onError(new Error('Failed to parse progress'));
      }
    });

    eventSource.addEventListener('complete', (event) => {
      try {
        const data = JSON.parse(event.data);
        handlers.onComplete(data.result);
        eventSource.close();
      } catch (error) {
        handlers.onError(new Error('Failed to parse completion'));
      }
    });

    eventSource.onerror = () => {
      handlers.onError(new Error('Streaming connection error'));
      eventSource.close();
    };

    return eventSource;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENTS
  // ═══════════════════════════════════════════════════════════════════════════

  async getAgents(): Promise<Agent[]> {
    const response = await this.fetch('/api/agents');
    const data = await response.json();
    return data.agents || [];
  }

  async getAgent(agentId: string): Promise<Agent> {
    const response = await this.fetch(`/api/agents/${agentId}`);
    const data = await response.json();
    return data.agent;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HEALTH CHECK
  // ═══════════════════════════════════════════════════════════════════════════

  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    agents_count: number;
    chats_count: number;
    active_autonomous_sessions: number;
  }> {
    const response = await this.fetch('/health');
    return await response.json();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await handleAPIError(response);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof VitalExpertAPIError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new VitalExpertAPIError('API_ERROR', 'Request timeout');
      }

      throw new VitalExpertAPIError('NETWORK_ERROR', error instanceof Error ? error.message : 'Network error');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

export const vitalExpertClient = new VitalExpertClient();

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const createChat = (title: string, isAutomaticMode = false, isAutonomousMode = false) =>
  vitalExpertClient.createChat({ title, isAutomaticMode, isAutonomousMode });

export const sendMessage = (chatId: string, message: string, agentId?: string) =>
  vitalExpertClient.sendManualMessage({ chatId, message, agentId });

export const sendAutomaticMessage = (chatId: string, message: string) =>
  vitalExpertClient.sendAutomaticMessage({ chatId, message });

export const startAutonomous = (chatId: string, goal: string, maxIterations = 10) =>
  vitalExpertClient.startAutonomousExecution({ chatId, goal, maxIterations });

export const getAgents = () => vitalExpertClient.getAgents();

export const getChats = () => vitalExpertClient.getChats();
