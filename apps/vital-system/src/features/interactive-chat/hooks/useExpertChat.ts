'use client';

import { useAIStream } from '@/features/ask-expert/hooks/useAIStream';

import { handleStreamEvent } from '../utils/stream-mapper';
import { useInteractiveStore } from '../stores/interactive-store';
import { StreamEvent } from '../types/events';

export function useExpertChat(mode: 'mode_1' | 'mode_2') {
  const { messages } = useInteractiveStore();

  const { sendMessage, isLoading } = useAIStream({
    api: '/api/v1/expert/stream',
    body: { mode },
    onEvent: (event: StreamEvent) => {
      handleStreamEvent(event);
    },
    onError: (error: any) => {
      console.error('Stream Error:', error);
    },
  });

  return {
    messages,
    sendMessage,
    isLoading,
  };
}
