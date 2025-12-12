/**
 * VITAL Platform - useStreamingChat Hook
 * 
 * @deprecated This hook is deprecated. Use mode-specific hooks from ask-expert instead.
 * 
 * Migration guide:
 * - For Mode 1 (Manual Interactive): import { useMode1Chat } from '@/features/ask-expert/hooks'
 * - For Mode 2 (Automatic Interactive): import { useMode2Chat } from '@/features/ask-expert/hooks'
 * - For Mode 3 (Manual Autonomous): import { useMode3Mission } from '@/features/ask-expert/hooks'
 * - For base SSE handling: import { useSSEStream } from '@/features/ask-expert/hooks'
 * 
 * This hook will be removed in a future release.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export type StreamEventType =
  | 'chat_started'
  | 'token'
  | 'thinking'
  | 'citation'
  | 'response_complete'
  | 'error'
  | 'heartbeat';

export interface StreamEvent {
  type: StreamEventType;
  data: Record<string, unknown>;
  timestamp?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  metadata?: {
    agentId?: string;
    mode?: number;
    citations?: Array<{
      source: string;
      content: string;
    }>;
    thinking?: string[];
    tokens?: number;
  };
}

export interface UseStreamingChatOptions {
  agentId: string;
  mode?: 1 | 2 | 3 | 4;
  conversationId?: string;
  onError?: (error: Error) => void;
  onComplete?: (message: ChatMessage) => void;
  baseUrl?: string;
}

export interface UseStreamingChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  isConnected: boolean;
  error: Error | null;
  sendMessage: (content: string) => void;
  cancelStream: () => void;
  clearMessages: () => void;
  currentThinking: string[];
}

/**
 * @deprecated Use useMode1Chat, useMode2Chat, or useMode3Mission instead.
 */
export function useStreamingChat({
  agentId,
  mode = 1,
  conversationId,
  onError,
  onComplete,
  baseUrl = '/api/v1',
}: UseStreamingChatOptions): UseStreamingChatReturn {
  // Emit deprecation warning in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[DEPRECATED] useStreamingChat is deprecated. ' +
        'Use useMode1Chat, useMode2Chat, or useMode3Mission from @/features/ask-expert/hooks instead.'
      );
    }
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentThinking, setCurrentThinking] = useState<string[]>([]);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageRef = useRef<string>('');
  const conversationIdRef = useRef<string | undefined>(conversationId);

  // Update conversation ID ref
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
      abortControllerRef.current?.abort();
    };
  }, []);

  const processStreamEvent = useCallback((event: StreamEvent) => {
    switch (event.type) {
      case 'chat_started':
        setIsConnected(true);
        if (event.data.conversation_id) {
          conversationIdRef.current = event.data.conversation_id as string;
        }
        break;

      case 'token':
        const token = event.data.token as string;
        currentMessageRef.current += token;
        
        // Update the streaming message
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.isStreaming) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: currentMessageRef.current,
              },
            ];
          }
          return prev;
        });
        break;

      case 'thinking':
        const thinkingStep = event.data.step as string;
        setCurrentThinking(prev => [...prev, thinkingStep]);
        break;

      case 'citation':
        // Handle citation events for Mode 3/4
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.isStreaming) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                metadata: {
                  ...lastMessage.metadata,
                  citations: [
                    ...(lastMessage.metadata?.citations || []),
                    event.data as { source: string; content: string },
                  ],
                },
              },
            ];
          }
          return prev;
        });
        break;

      case 'response_complete':
        // Finalize the message
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.isStreaming) {
            const finalMessage: ChatMessage = {
              ...lastMessage,
              content: event.data.full_response as string || currentMessageRef.current,
              isStreaming: false,
              metadata: {
                ...lastMessage.metadata,
                thinking: currentThinking.length > 0 ? currentThinking : undefined,
              },
            };
            onComplete?.(finalMessage);
            return [...prev.slice(0, -1), finalMessage];
          }
          return prev;
        });
        setIsStreaming(false);
        setCurrentThinking([]);
        currentMessageRef.current = '';
        break;

      case 'error':
        const errorMessage = event.data.error as string;
        const err = new Error(errorMessage);
        setError(err);
        onError?.(err);
        setIsStreaming(false);
        break;

      case 'heartbeat':
        // Keep-alive, no action needed
        break;
    }
  }, [currentThinking, onComplete, onError]);

  const sendMessage = useCallback(async (content: string) => {
    if (isStreaming) return;

    // Reset state
    setError(null);
    setIsStreaming(true);
    setCurrentThinking([]);
    currentMessageRef.current = '';

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Add placeholder for assistant response
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      metadata: {
        agentId,
        mode,
      },
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);

    try {
      // Create abort controller
      abortControllerRef.current = new AbortController();

      // Make POST request to streaming endpoint
      const response = await fetch(`${baseUrl}/stream/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          agent_id: agentId,
          message: content,
          mode,
          conversation_id: conversationIdRef.current,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsStreaming(false);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Parse SSE events
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const eventBlock of lines) {
          if (!eventBlock.trim()) continue;

          const eventLines = eventBlock.split('\n');
          let eventType = '';
          let eventData = '';

          for (const line of eventLines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7);
            } else if (line.startsWith('data: ')) {
              eventData += line.slice(6);
            }
          }

          if (eventType && eventData) {
            try {
              const parsed: StreamEvent = {
                type: eventType as StreamEventType,
                data: JSON.parse(eventData),
              };
              processStreamEvent(parsed);
            } catch (parseError) {
              console.warn('Failed to parse SSE event:', parseError);
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        onError?.(err);
      }
      setIsStreaming(false);
    }
  }, [agentId, mode, baseUrl, isStreaming, processStreamEvent, onError]);

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    eventSourceRef.current?.close();
    setIsStreaming(false);
    
    // Mark current streaming message as cancelled
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.isStreaming) {
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            content: currentMessageRef.current + ' [cancelled]',
            isStreaming: false,
          },
        ];
      }
      return prev;
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setCurrentThinking([]);
  }, []);

  return {
    messages,
    isStreaming,
    isConnected,
    error,
    sendMessage,
    cancelStream,
    clearMessages,
    currentThinking,
  };
}
