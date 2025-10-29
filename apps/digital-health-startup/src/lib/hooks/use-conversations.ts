/**
 * useConversations Hook
 * 
 * React Query hook for managing user conversations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsService, type Conversation } from '../services/conversations/conversations-service';

export function useConversations(userId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => conversationsService.getUserConversations(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 min cache
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 min
  });

  const createMutation = useMutation({
    mutationFn: (conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>) =>
      conversationsService.createConversation(userId!, conversation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ conversationId, updates }: {
      conversationId: string;
      updates: Partial<Pick<Conversation, 'title' | 'messages' | 'isPinned' | 'agentId' | 'mode'>>;
    }) =>
      conversationsService.updateConversation(userId!, conversationId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (conversationId: string) =>
      conversationsService.deleteConversation(userId!, conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
    },
  });

  const migrateMutation = useMutation({
    mutationFn: () => conversationsService.migrateFromLocalStorage(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
    },
  });

  return {
    query,
    createMutation,
    updateMutation,
    deleteMutation,
    migrateMutation,
    conversations: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

