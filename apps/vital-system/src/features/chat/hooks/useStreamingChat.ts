'use client';

/**
 * Streaming chat hook stub
 * TODO: Implement streaming response handling when chat feature is developed
 */

import { useState, useCallback, useRef } from 'react';
import type { Message } from '../types/conversation.types';

export interface UseStreamingChatOptions {
  agentId?: string;
  sessionId?: string;
  onToken?: (token: string) => void;
  onComplete?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export interface UseStreamingChatReturn {
  streamingMessage: string;
  isStreaming: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  cancelStream: () => void;
}

export const useStreamingChat = (
  options: UseStreamingChatOptions = {}
): UseStreamingChatReturn => {
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!options.agentId) {
      setError(new Error('No agent selected'));
      return;
    }

    setIsStreaming(true);
    setStreamingMessage('');
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      // TODO: Implement actual streaming from backend
      const mockMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Response to: ${content}`,
        timestamp: new Date(),
      };

      setStreamingMessage(mockMessage.content);
      options.onComplete?.(mockMessage);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Stream failed');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [options]);

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    streamingMessage,
    isStreaming,
    error,
    sendMessage,
    cancelStream,
  };
};

export default useStreamingChat;
