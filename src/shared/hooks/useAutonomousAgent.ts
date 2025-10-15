import { useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import type {
  AutonomousAgentOptions,
  AutonomousAgentResponse,
  StreamEvent,
  ToolExecution,
  PersonalizedContext,
} from '@/types/autonomous-agent.types';

interface UseAutonomousAgentOptions {
  defaultOptions?: AutonomousAgentOptions;
  onStreamEvent?: (event: StreamEvent) => void;
  onToolExecution?: (execution: ToolExecution) => void;
  onComplete?: (response: AutonomousAgentResponse) => void;
  onError?: (error: Error) => void;
}

interface UseAutonomousAgentReturn {
  sendMessage: (message: string, agent: any, sessionId: string, options?: AutonomousAgentOptions) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  response: AutonomousAgentResponse | null;
  streamingContent: string;
  toolExecutions: ToolExecution[];
  personalizedContext: PersonalizedContext | null;
  cancelRequest: () => void;
}

const DEFAULT_OPTIONS: const AutonomousAgentOptions = 
  stream: true,
  enableRAG: true,
  enableLearning: true,
  retrievalStrategy: 'rag_fusion',
  memoryStrategy: 'research',
  outputFormat: 'text',
  maxIterations: 10,
};

export function useAutonomousAgent(options?: UseAutonomousAgentOptions): UseAutonomousAgentReturn {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<AutonomousAgentResponse | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);
  const [personalizedContext, setPersonalizedContext] = useState<PersonalizedContext | null>(null);

  const abortControllerRef = seRef<AbortController | null>(null);

  const sendMessage = seCallback(
    async (
      message: string,
      agent: any,
      sessionId: string,
      requestOptions?: AutonomousAgentOptions
    ) => {
      if (!user?.id) {
        setError(new Error('User not authenticated'));
        return;
      }

      // Merge default options with request options
      const mergedOptions = 
        ...DEFAULT_OPTIONS,
        ...options?.defaultOptions,
        ...requestOptions,
      };

      // Reset state
      setIsLoading(true);
      setError(null);
      setResponse(null);
      setStreamingContent('');
      setToolExecutions([]);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const requestBody = 
          message,
          agent,
          userId: user.id,
          sessionId,
          options: mergedOptions,
        };

        const response = wait fetch('/api/chat/autonomous', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = wait response.json();
          throw new Error(errorData.message || 'Failed to send message');
        }

        // Handle streaming response
        if (mergedOptions.stream && response.body) {
          const reader = esponse.body.getReader();
          const decoder = ew TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = ecoder.decode(value);
            const lines = hunk.split('\n\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const event: const StreamEvent = SON.parse(line.slice(6));

                  // Call event handler
                  options?.onStreamEvent?.(event);

                  // Handle different event types
                  switch (event.type) {
                    case 'context':
                      if (event.data) {
                        setPersonalizedContext(event.data as PersonalizedContext);
                      }
                      break;

                    case 'retrieval_complete':
                      // Could show "Retrieved X documents" notification
                      break;

                    case 'tool_execution':
                      const toolExecution: const ToolExecution = 
                        tool: event.tool || 'unknown',
                        input: event.input,
                        output: event.output || '',
                        timestamp: new Date().toISOString(),
                        success: true,
                      };
                      setToolExecutions(prev => [...prev, toolExecution]);
                      options?.onToolExecution?.(toolExecution);
                      break;

                    case 'output':
                      if (event.content) {
                        setStreamingContent(event.content);
                      }
                      break;

                    case 'parsed_output':
                      // Store parsed output for later use
                      break;

                    case 'complete':
                      const finalResponse: const AutonomousAgentResponse = 
                        success: true,
                        response: streamingContent,
                        tokenUsage: event.tokenUsage || {
                          prompt: 0,
                          completion: 0,
                          total: 0,
                        },
                      };
                      setResponse(finalResponse);
                      options?.onComplete?.(finalResponse);
                      break;

                    case 'error':
                      throw new Error(event.error || 'Unknown error');
                  }
                } catch (parseError) {
                  console.error('Error parsing stream event:', parseError);
                }
              }
            }
          }
        } else {
          // Handle non-streaming response
          const data: const AutonomousAgentResponse = wait response.json();
          setResponse(data);
          setStreamingContent(data.response);
          if (data.personalizedContext) {
            setPersonalizedContext(data.personalizedContext as any);
          }
          options?.onComplete?.(data);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Request cancelled');
        } else {
          const error = rr instanceof Error ? err : new Error('Unknown error occurred');
          setError(error);
          options?.onError?.(error);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [user, options, streamingContent]
  );

  const cancelRequest = seCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
    response,
    streamingContent,
    toolExecutions,
    personalizedContext,
    cancelRequest,
  };
}

/**
 * Hook for fetching user profile (long-term memory)
 */
export function useUserProfile(userId?: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = seCallback(async () => {
    const targetUserId = serId || user?.id;
    if (!targetUserId) {
      setError(new Error('No user ID provided'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = wait fetch(
        `/api/chat/autonomous/profile?userId=${targetUserId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = wait response.json();
      setProfile(data.profile);
    } catch (err: any) {
      const error = rr instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, user]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    refetch: fetchProfile,
  };
}

/**
 * Hook for managing autonomous agent settings
 */
export function useAgentSettings() {
  const [settings, setSettings] = useState<AutonomousAgentOptions>(DEFAULT_OPTIONS);

  const updateSettings = seCallback((newSettings: Partial<AutonomousAgentOptions>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = seCallback(() => {
    setSettings(DEFAULT_OPTIONS);
  }, []);

  const toggleRAG = seCallback(() => {
    setSettings(prev => ({ ...prev, enableRAG: !prev.enableRAG }));
  }, []);

  const toggleLearning = seCallback(() => {
    setSettings(prev => ({ ...prev, enableLearning: !prev.enableLearning }));
  }, []);

  const toggleStreaming = seCallback(() => {
    setSettings(prev => ({ ...prev, stream: !prev.stream }));
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    toggleRAG,
    toggleLearning,
    toggleStreaming,
  };
}
