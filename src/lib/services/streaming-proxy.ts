/**
 * Streaming Proxy Service
 * Handles real-time streaming from Python LangGraph backend to frontend
 */

import { backendConnection } from './backend-connection';

export interface ReasoningEvent {
  type: 'reasoning_step' | 'phase_change' | 'execution_complete' | 'error';
  data: any;
  timestamp: string;
}

export interface StreamingOptions {
  onReasoningStep?: (step: any) => void;
  onPhaseChange?: (phase: string, metadata: any) => void;
  onExecutionComplete?: (result: any) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export class StreamingProxyService {
  private activeStreams: Map<string, AbortController> = new Map();

  /**
   * Stream autonomous reasoning from LangGraph backend
   */
  async streamAutonomousReasoning(
    query: string, 
    agent: any, 
    options: StreamingOptions = {}
  ): Promise<ReadableStream<Uint8Array>> {
    try {
      console.log('🚀 [StreamingProxy] Starting autonomous reasoning stream...');
      
      const { sessionId, stream } = await backendConnection.startAutonomousSession(query, agent);
      
      // Store controller for cleanup
      const controller = new AbortController();
      this.activeStreams.set(sessionId, controller);

      // Create a new ReadableStream that processes the backend stream
      return new ReadableStream({
        start(streamController) {
          const encoder = new TextEncoder();
          const reader = stream.getReader();

          const processStream = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                  console.log('📤 [StreamingProxy] Autonomous stream completed');
                  streamController.close();
                  break;
                }

                // Decode the chunk
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const jsonString = line.slice(6).trim();
                      if (!jsonString) continue;

                      const event = JSON.parse(jsonString);
                      console.log('📥 [StreamingProxy] Received event:', event);

                      // Process different event types
                      if (event.type === 'reasoning_step') {
                        options.onReasoningStep?.(event.data);
                      } else if (event.type === 'phase_change') {
                        options.onPhaseChange?.(event.phase, event.metadata);
                      } else if (event.type === 'execution_complete') {
                        options.onExecutionComplete?.(event.data);
                      }

                      // Forward the event to the frontend
                      streamController.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                    } catch (parseError) {
                      console.error('❌ [StreamingProxy] JSON parse error:', parseError, line);
                    }
                  }
                }
              }
            } catch (error) {
              console.error('❌ [StreamingProxy] Stream processing error:', error);
              options.onError?.(error as Error);
              streamController.error(error);
            } finally {
              this.activeStreams.delete(sessionId);
            }
          };

          processStream();
        },
        cancel() {
          console.log('⚠️ [StreamingProxy] Autonomous stream cancelled');
          controller.abort();
          this.activeStreams.delete(sessionId);
        }
      });
    } catch (error) {
      console.error('❌ [StreamingProxy] Failed to start autonomous stream:', error);
      throw error;
    }
  }

  /**
   * Stream interactive consultation from LangGraph backend
   */
  async streamInteractiveConsultation(
    query: string, 
    agent: any, 
    options: StreamingOptions = {}
  ): Promise<ReadableStream<Uint8Array>> {
    try {
      console.log('🚀 [StreamingProxy] Starting interactive consultation stream...');
      
      const { sessionId, stream } = await backendConnection.startInteractiveSession(query, agent);
      
      // Store controller for cleanup
      const controller = new AbortController();
      this.activeStreams.set(sessionId, controller);

      // Create a new ReadableStream that processes the backend stream
      return new ReadableStream({
        start(streamController) {
          const encoder = new TextEncoder();
          const reader = stream.getReader();

          const processStream = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                  console.log('📤 [StreamingProxy] Interactive stream completed');
                  streamController.close();
                  break;
                }

                // Decode the chunk
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const jsonString = line.slice(6).trim();
                      if (!jsonString) continue;

                      const event = JSON.parse(jsonString);
                      console.log('📥 [StreamingProxy] Received event:', event);

                      // Process different event types
                      if (event.type === 'reasoning_step') {
                        options.onReasoningStep?.(event.data);
                      } else if (event.type === 'phase_change') {
                        options.onPhaseChange?.(event.phase, event.metadata);
                      } else if (event.type === 'execution_complete') {
                        options.onExecutionComplete?.(event.data);
                      }

                      // Forward the event to the frontend
                      streamController.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                    } catch (parseError) {
                      console.error('❌ [StreamingProxy] JSON parse error:', parseError, line);
                    }
                  }
                }
              }
            } catch (error) {
              console.error('❌ [StreamingProxy] Stream processing error:', error);
              options.onError?.(error as Error);
              streamController.error(error);
            } finally {
              this.activeStreams.delete(sessionId);
            }
          };

          processStream();
        },
        cancel() {
          console.log('⚠️ [StreamingProxy] Interactive stream cancelled');
          controller.abort();
          this.activeStreams.delete(sessionId);
        }
      });
    } catch (error) {
      console.error('❌ [StreamingProxy] Failed to start interactive stream:', error);
      throw error;
    }
  }

  /**
   * Stop all active streams
   */
  stopAllStreams(): void {
    console.log('🛑 [StreamingProxy] Stopping all active streams...');
    this.activeStreams.forEach((controller, sessionId) => {
      controller.abort();
      console.log(`🛑 [StreamingProxy] Stopped stream for session: ${sessionId}`);
    });
    this.activeStreams.clear();
  }

  /**
   * Stop specific stream
   */
  stopStream(sessionId: string): void {
    const controller = this.activeStreams.get(sessionId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(sessionId);
      console.log(`🛑 [StreamingProxy] Stopped stream for session: ${sessionId}`);
    }
  }

  /**
   * Get active stream count
   */
  getActiveStreamCount(): number {
    return this.activeStreams.size;
  }
}

// Singleton instance
export const streamingProxy = new StreamingProxyService();
