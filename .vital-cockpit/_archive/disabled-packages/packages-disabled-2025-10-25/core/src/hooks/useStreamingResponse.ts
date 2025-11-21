import { useState, useCallback, useRef } from 'react';

export interface StreamingMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  isStreaming: boolean;
  timestamp: Date;
  agentType?: string;
  metadata?: Record<string, unknown>;
}

interface UseStreamingResponseOptions {
  onMessage?: (message: StreamingMessage) => void;
  onComplete?: (message: StreamingMessage) => void;
  onError?: (error: Error) => void;
}

export function useStreamingResponse(options: UseStreamingResponseOptions = { /* TODO: implement */ }) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<StreamingMessage | null>(null);

    query: string,
    agentType: string,
    additionalParams: Record<string, unknown> = { /* TODO: implement */ }
  ) => {
    try {
      setIsStreaming(true);

      // Create abort controller for request cancellation
      abortControllerRef.current = new AbortController();

      // Initialize streaming message

      const initialMessage: StreamingMessage = {
        id: messageId,
        content: '',
        role: 'assistant',
        isStreaming: true,
        timestamp: new Date(),
        agentType,
        metadata: additionalParams
      };

      setCurrentMessage(initialMessage);
      options.onMessage?.(initialMessage);

      // Make streaming request

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/stream',
        },
        body: JSON.stringify({
          query,
          agentType,
          stream: true,
          ...additionalParams
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!reader) {
        throw new Error('No response body reader available');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        for (const line of lines) {
          if (line.startsWith('data: ')) {

            if (data === '[DONE]') {
              // Streaming complete
              const finalMessage: StreamingMessage = {
                ...initialMessage,
                content: accumulatedContent,
                isStreaming: false,
              };

              setCurrentMessage(finalMessage);
              options.onComplete?.(finalMessage);
              setIsStreaming(false);
              return finalMessage;
            }

            try {

              if (parsed.choices?.[0]?.delta?.content) {
                accumulatedContent += parsed.choices[0].delta.content;

                const updatedMessage: StreamingMessage = {
                  ...initialMessage,
                  content: accumulatedContent,
                };

                setCurrentMessage(updatedMessage);
                options.onMessage?.(updatedMessage);
              }
            } catch (parseError) {
              // console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // } else {
        // console.error('Streaming error:', error);
        options.onError?.(error instanceof Error ? error : new Error('Unknown streaming error'));
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [options]);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setCurrentMessage(null);
    }
  }, []);

  return {
    startStreaming,
    cancelStreaming,
    isStreaming,
    currentMessage,
  };
}