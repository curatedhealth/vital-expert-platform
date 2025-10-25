import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  agent_id?: string;
}

export interface Chat {
  id: string;
  title?: string;
  messages: ChatMessage[];
  agent_id?: string;
  created_at: number;
  updated_at: number;
}

interface ChatsResponse {
  success: boolean;
  chats: Chat[];
  count: number;
}

interface ChatResponse {
  success: boolean;
  chat: Chat;
}

/**
 * Fetch chat history with React Query caching
 * Cached for 30 minutes
 */
export function useChatsQuery(userId?: string) {
  return useQuery({
    queryKey: ['chats', userId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);

      const response = await fetch(`/api/chats?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      return response.json() as Promise<ChatsResponse>;
    },
    enabled: !!userId,
    // Cache for 30 minutes (chat history doesn't change as frequently)
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Fetch single chat by ID with React Query caching
 */
export function useChatQuery(chatId: string | null) {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      if (!chatId) return null;
      const response = await fetch(`/api/chats/${chatId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat');
      }
      return response.json() as Promise<ChatResponse>;
    },
    enabled: !!chatId,
    // Cache for 5 minutes (active chat may update frequently)
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create new chat mutation
 */
export function useCreateChatMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chat: Partial<Chat>) => {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chat),
      });
      if (!response.ok) {
        throw new Error('Failed to create chat');
      }
      return response.json() as Promise<ChatResponse>;
    },
    onSuccess: () => {
      // Invalidate chats list
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

/**
 * Add message to chat mutation with optimistic update
 */
export function useAddMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      message,
    }: {
      chatId: string;
      message: Partial<ChatMessage>;
    }) => {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      if (!response.ok) {
        throw new Error('Failed to add message');
      }
      return response.json();
    },
    onMutate: async ({ chatId, message }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chat', chatId] });

      // Snapshot previous value
      const previousChat = queryClient.getQueryData<ChatResponse>(['chat', chatId]);

      // Optimistically update chat
      if (previousChat) {
        queryClient.setQueryData<ChatResponse>(['chat', chatId], {
          ...previousChat,
          chat: {
            ...previousChat.chat,
            messages: [
              ...previousChat.chat.messages,
              {
                ...message,
                id: `temp-${Date.now()}`,
                timestamp: Date.now(),
              } as ChatMessage,
            ],
          },
        });
      }

      return { previousChat };
    },
    onError: (_error, { chatId }, context) => {
      // Rollback on error
      if (context?.previousChat) {
        queryClient.setQueryData(['chat', chatId], context.previousChat);
      }
    },
    onSuccess: (_data, { chatId }) => {
      // Refetch to get server state
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
    },
  });
}

/**
 * Delete chat mutation
 */
export function useDeleteChatMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string) => {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate chats list
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}
