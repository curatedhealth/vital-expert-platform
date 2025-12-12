/**
 * VITAL Platform - StreamingService
 * 
 * @deprecated This class-based service is deprecated. Use hooks instead.
 * 
 * Migration guide:
 * - For Mode 1: import { useMode1Chat } from '@/features/ask-expert/hooks'
 * - For Mode 2: import { useMode2Chat } from '@/features/ask-expert/hooks'
 * - For Mode 3: import { useMode3Mission } from '@/features/ask-expert/hooks'
 * - For base SSE: import { useSSEStream } from '@/features/ask-expert/hooks'
 * 
 * This service will be removed in a future release.
 * 
 * @see useSSEStream - Modern hook-based SSE handling
 */

export interface StreamingCallbacks {
  onWorkflowUpdate?: (step: WorkflowStep) => void;
  onReasoningUpdate?: (step: ReasoningStep) => void;
  onContent?: (content: string) => void;
  onMetrics?: (metrics: StreamingMetrics) => void;
  onSources?: (sources: Source[]) => void;
  onMetadata?: (metadata: MessageMetadata) => void;
  onError?: (error: string) => void;
  onDone?: () => void;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
}

export interface ReasoningStep {
  id: string;
  type: 'thought' | 'action' | 'observation';
  content: string;
  confidence?: number;
}

export interface StreamingMetrics {
  tokensGenerated: number;
  tokensPerSecond: number;
  elapsedTime?: number;
}

export interface Source {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  similarity: number;
}

export interface MessageMetadata {
  confidence?: number;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  agentName?: string;
  mode?: string;
}

/**
 * @deprecated Use useSSEStream or mode-specific hooks instead.
 */
export class StreamingService {
  private eventSource: EventSource | null = null;
  private callbacks: StreamingCallbacks = {};

  constructor() {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn(
        '[DEPRECATED] StreamingService is deprecated. ' +
        'Use useSSEStream, useMode1Chat, useMode2Chat, or useMode3Mission hooks instead.'
      );
    }
  }

  /**
   * Start streaming chat session
   */
  async startStream(
    message: string,
    mode: string,
    userId: string,
    agentId?: string,
    conversationId?: string,
    callbacks?: StreamingCallbacks
  ): Promise<void> {
    this.callbacks = callbacks || {};

    try {
      // Create POST request with streaming
      const response = await fetch('/api/ask-expert/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          mode,
          userId,
          agentId,
          conversationId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        this.callbacks.onError?.(error.error || 'Request failed');
        return;
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        this.callbacks.onError?.('No response body');
        return;
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('event:')) {
            const eventType = line.substring(6).trim();
            continue; // Event type is on separate line
          }

          if (line.startsWith('data:')) {
            const data = line.substring(5).trim();

            try {
              const parsed = JSON.parse(data);
              this.handleEvent(parsed);
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('Streaming error:', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Handle different event types
   */
  private handleEvent(data: any) {
    // Workflow update
    if (data.step && data.step.name) {
      this.callbacks.onWorkflowUpdate?.(data.step as WorkflowStep);
      return;
    }

    // Reasoning step
    if (data.step && data.step.type) {
      this.callbacks.onReasoningUpdate?.(data.step as ReasoningStep);
      return;
    }

    // Content chunk
    if (data.content !== undefined) {
      this.callbacks.onContent?.(data.content);
      return;
    }

    // Metrics update
    if (data.tokensGenerated !== undefined) {
      this.callbacks.onMetrics?.(data as StreamingMetrics);
      return;
    }

    // Sources
    if (data.sources) {
      this.callbacks.onSources?.(data.sources);
      return;
    }

    // Metadata
    if (data.confidence !== undefined || data.tokenUsage) {
      this.callbacks.onMetadata?.(data as MessageMetadata);
      return;
    }

    // Error
    if (data.error) {
      this.callbacks.onError?.(data.error);
      return;
    }

    // Done
    if (data.success) {
      this.callbacks.onDone?.();
      return;
    }
  }

  /**
   * Stop streaming
   */
  stopStream() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

// Export singleton instance
export const streamingService = new StreamingService();
