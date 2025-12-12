/**
 * VITAL Platform - useAskExpertChat Hook
 * 
 * @deprecated This hook is deprecated. Use mode-specific hooks instead.
 * 
 * Migration guide:
 * - For Mode 1 (Manual Interactive): import { useMode1Chat } from '@/features/ask-expert/hooks'
 * - For Mode 2 (Automatic Interactive): import { useMode2Chat } from '@/features/ask-expert/hooks'
 * - For Mode 3 (Manual Autonomous): import { useMode3Mission } from '@/features/ask-expert/hooks'
 * 
 * This hook will be removed in a future release.
 * 
 * @see useMode1Chat - For manual expert selection with multi-turn chat
 * @see useMode2Chat - For automatic expert selection with Fusion Intelligence
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { streamingService, type WorkflowStep, type ReasoningStep, type Source, type MessageMetadata } from '../services/streaming-service';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata & {
    reasoning?: Array<{ step: string; content: string }>;
    sources?: Source[];
  };
  agentName?: string;
  agentAvatar?: string;
  isStreaming?: boolean;
}

export interface UseAskExpertChatOptions {
  conversationId?: string;
  userId: string;
  mode: string;
  agentId?: string;
}

export interface StreamingState {
  isStreaming: boolean;
  workflowSteps: WorkflowStep[];
  reasoningSteps: ReasoningStep[];
  metrics: {
    tokensGenerated: number;
    tokensPerSecond: number;
    elapsedTime: number;
  };
}

/**
 * @deprecated Use useMode1Chat or useMode2Chat instead.
 */
export function useAskExpertChat(options: UseAskExpertChatOptions) {
  const { conversationId, userId, mode, agentId } = options;

  // Emit deprecation warning in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[DEPRECATED] useAskExpertChat is deprecated. ' +
        'Use useMode1Chat (Mode 1) or useMode2Chat (Mode 2) instead.'
      );
    }
  }, []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    workflowSteps: [],
    reasoningSteps: [],
    metrics: {
      tokensGenerated: 0,
      tokensPerSecond: 0,
      elapsedTime: 0,
    },
  });

  const currentMessageRef = useRef<Message | null>(null);
  const startTimeRef = useRef<number>(0);

  /**
   * Send a message and start streaming response
   */
  const sendMessage = useCallback(async (messageContent: string) => {
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Create placeholder for assistant message
    const assistantMessage: Message = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      metadata: {
        reasoning: [],
        sources: [],
      },
    };

    currentMessageRef.current = assistantMessage;
    setMessages(prev => [...prev, assistantMessage]);

    // Reset streaming state
    setStreamingState({
      isStreaming: true,
      workflowSteps: [],
      reasoningSteps: [],
      metrics: {
        tokensGenerated: 0,
        tokensPerSecond: 0,
        elapsedTime: 0,
      },
    });

    startTimeRef.current = Date.now();

    // Start streaming
    await streamingService.startStream(
      messageContent,
      mode,
      userId,
      agentId,
      conversationId,
      {
        onWorkflowUpdate: (step) => {
          setStreamingState(prev => {
            const existing = prev.workflowSteps.find((s: any) => s.id === step.id);
            const updatedSteps = existing
              ? prev.workflowSteps.map((s: any) => s.id === step.id ? step : s)
              : [...prev.workflowSteps, step];

            return {
              ...prev,
              workflowSteps: updatedSteps,
            };
          });
        },

        onReasoningUpdate: (step) => {
          setStreamingState(prev => ({
            ...prev,
            reasoningSteps: [...prev.reasoningSteps, step],
          }));

          // Add to message metadata
          if (currentMessageRef.current) {
            const reasoning = currentMessageRef.current.metadata?.reasoning || [];
            currentMessageRef.current.metadata = {
              ...currentMessageRef.current.metadata,
              reasoning: [...reasoning, {
                step: step.type,
                content: step.content,
              }],
            };
          }
        },

        onContent: (content) => {
          if (currentMessageRef.current) {
            currentMessageRef.current.content += content;

            // Update message in state
            setMessages(prev =>
              prev.map(msg =>
                msg.id === currentMessageRef.current?.id
                  ? { ...currentMessageRef.current }
                  : msg
              )
            );
          }
        },

        onMetrics: (metrics) => {
          const elapsedTime = Date.now() - startTimeRef.current;
          setStreamingState(prev => ({
            ...prev,
            metrics: {
              ...metrics,
              elapsedTime,
            },
          }));
        },

        onSources: ({ sources }) => {
          if (currentMessageRef.current) {
            currentMessageRef.current.metadata = {
              ...currentMessageRef.current.metadata,
              sources,
            };

            setMessages(prev =>
              prev.map(msg =>
                msg.id === currentMessageRef.current?.id
                  ? { ...currentMessageRef.current }
                  : msg
              )
            );
          }
        },

        onMetadata: (metadata) => {
          if (currentMessageRef.current) {
            currentMessageRef.current.metadata = {
              ...currentMessageRef.current.metadata,
              ...metadata,
            };
            currentMessageRef.current.agentName = metadata.agentName;

            setMessages(prev =>
              prev.map(msg =>
                msg.id === currentMessageRef.current?.id
                  ? { ...currentMessageRef.current }
                  : msg
              )
            );
          }
        },

        onError: (error) => {
          console.error('Streaming error:', error);
          setStreamingState(prev => ({ ...prev, isStreaming: false }));

          // Mark message as error
          if (currentMessageRef.current) {
            currentMessageRef.current.content = `Error: ${error}`;
            currentMessageRef.current.isStreaming = false;

            setMessages(prev =>
              prev.map(msg =>
                msg.id === currentMessageRef.current?.id
                  ? { ...currentMessageRef.current }
                  : msg
              )
            );
          }
        },

        onDone: () => {
          setStreamingState(prev => ({ ...prev, isStreaming: false }));

          // Mark message as complete
          if (currentMessageRef.current) {
            currentMessageRef.current.isStreaming = false;

            setMessages(prev =>
              prev.map(msg =>
                msg.id === currentMessageRef.current?.id
                  ? { ...currentMessageRef.current }
                  : msg
              )
            );
          }

          currentMessageRef.current = null;
        },
      }
    );
  }, [mode, userId, agentId, conversationId]);

  /**
   * Stop streaming
   */
  const stopStreaming = useCallback(() => {
    streamingService.stopStream();
    setStreamingState(prev => ({ ...prev, isStreaming: false }));

    if (currentMessageRef.current) {
      currentMessageRef.current.isStreaming = false;
      setMessages(prev =>
        prev.map(msg =>
          msg.id === currentMessageRef.current?.id
            ? { ...currentMessageRef.current }
            : msg
        )
      );
    }
  }, []);

  /**
   * Clear messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    currentMessageRef.current = null;
  }, []);

  return {
    messages,
    streamingState,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}
