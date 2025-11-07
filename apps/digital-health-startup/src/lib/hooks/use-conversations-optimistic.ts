'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { conversationsService, type Conversation } from '@/lib/services/conversations/conversations-service';

interface UseConversationsOptions {
  userId?: string | null;
  onError?: (error: Error) => void;
}

interface UseConversationsReturn {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  
  // Optimistic operations
  createConversation: (title?: string) => Promise<Conversation | null>;
  deleteConversation: (id: string) => Promise<void>;
  updateConversation: (id: string, updates: Partial<Conversation>) => Promise<void>;
  switchConversation: (id: string) => void;
  
  // Message operations
  addMessageToConversation: (conversationId: string, message: any) => Promise<void>;
  
  // Utility
  refreshConversations: () => Promise<void>;
}

export function useConversationsOptimistic({
  userId,
  onError,
}: UseConversationsOptions = {}): UseConversationsReturn {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const initRef = useRef(false);

  // Query conversations with React Query
  const {
    data: conversations = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await conversationsService.getConversations(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Initialize active conversation
  useEffect(() => {
    if (!initRef.current && conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
      initRef.current = true;
    }
  }, [conversations, activeConversationId]);

  // ============================================================================
  // CREATE CONVERSATION (Optimistic)
  // ============================================================================
  const createMutation = useMutation({
    mutationFn: async (data: { title: string; messages: any[] }) => {
      if (!userId) throw new Error('User not authenticated');
      return await conversationsService.createConversation({
        userId,
        title: data.title,
        messages: data.messages,
      });
    },
    onMutate: async (newConversation) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['conversations', userId] });

      // Snapshot previous value
      const previousConversations = queryClient.getQueryData<Conversation[]>(['conversations', userId]);

      // Create optimistic conversation
      const optimisticConv: Conversation = {
        id: `temp_${Date.now()}`,
        title: newConversation.title,
        messages: newConversation.messages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Optimistically update cache
      queryClient.setQueryData<Conversation[]>(
        ['conversations', userId],
        (old = []) => [optimisticConv, ...old]
      );

      // Set as active
      setActiveConversationId(optimisticConv.id);

      return { previousConversations, optimisticId: optimisticConv.id };
    },
    onSuccess: (created, variables, context) => {
      // Replace optimistic with real data
      queryClient.setQueryData<Conversation[]>(
        ['conversations', userId],
        (old = []) => old.map(conv => 
          conv.id === context.optimisticId ? created : conv
        )
      );

      // Update active ID
      setActiveConversationId(created.id);

      toast.success('Conversation created', {
        description: created.title,
      });
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousConversations) {
        queryClient.setQueryData(['conversations', userId], context.previousConversations);
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';
      toast.error('Creation failed', {
        description: errorMessage,
      });

      onError?.(error instanceof Error ? error : new Error(errorMessage));
    },
  });

  const createConversation = useCallback(async (title = 'New Conversation'): Promise<Conversation | null> => {
    try {
      const result = await createMutation.mutateAsync({
        title,
        messages: [],
      });
      return result;
    } catch (error) {
      return null;
    }
  }, [createMutation]);

  // ============================================================================
  // DELETE CONVERSATION (Optimistic)
  // ============================================================================
  const deleteMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!userId) throw new Error('User not authenticated');
      await conversationsService.deleteConversation(conversationId, userId);
    },
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: ['conversations', userId] });

      const previousConversations = queryClient.getQueryData<Conversation[]>(['conversations', userId]);

      // Optimistically remove from cache
      queryClient.setQueryData<Conversation[]>(
        ['conversations', userId],
        (old = []) => old.filter(conv => conv.id !== conversationId)
      );

      // Switch to another conversation if deleted is active
      if (activeConversationId === conversationId) {
        const remaining = (previousConversations || []).filter(c => c.id !== conversationId);
        setActiveConversationId(remaining[0]?.id || null);
      }

      return { previousConversations };
    },
    onSuccess: () => {
      toast.success('Conversation deleted');
    },
    onError: (error, conversationId, context) => {
      // Rollback
      if (context?.previousConversations) {
        queryClient.setQueryData(['conversations', userId], context.previousConversations);
      }

      toast.error('Deletion failed', {
        description: error instanceof Error ? error.message : 'Could not delete conversation',
      });

      onError?.(error instanceof Error ? error : new Error('Deletion failed'));
    },
  });

  const deleteConversation = useCallback(async (id: string): Promise<void> => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  // ============================================================================
  // UPDATE CONVERSATION (Optimistic)
  // ============================================================================
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Conversation> }) => {
      if (!userId) throw new Error('User not authenticated');
      await conversationsService.updateConversation(id, updates, userId);
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['conversations', userId] });

      const previousConversations = queryClient.getQueryData<Conversation[]>(['conversations', userId]);

      // Optimistically update
      queryClient.setQueryData<Conversation[]>(
        ['conversations', userId],
        (old = []) => old.map(conv =>
          conv.id === id
            ? { ...conv, ...updates, updatedAt: Date.now() }
            : conv
        )
      );

      return { previousConversations };
    },
    onError: (error, variables, context) => {
      // Rollback
      if (context?.previousConversations) {
        queryClient.setQueryData(['conversations', userId], context.previousConversations);
      }

      toast.error('Update failed', {
        description: error instanceof Error ? error.message : 'Could not update conversation',
      });

      onError?.(error instanceof Error ? error : new Error('Update failed'));
    },
  });

  const updateConversation = useCallback(async (
    id: string,
    updates: Partial<Conversation>
  ): Promise<void> => {
    await updateMutation.mutateAsync({ id, updates });
  }, [updateMutation]);

  // ============================================================================
  // SWITCH CONVERSATION (Instant)
  // ============================================================================
  const switchConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    // No API call needed - instant UI update
  }, []);

  // ============================================================================
  // ADD MESSAGE TO CONVERSATION (Optimistic)
  // ============================================================================
  const addMessageToConversation = useCallback(async (
    conversationId: string,
    message: any
  ): Promise<void> => {
    // Optimistically update conversation messages
    queryClient.setQueryData<Conversation[]>(
      ['conversations', userId],
      (old = []) => old.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: Date.now(),
            }
          : conv
      )
    );

    // Persist in background
    try {
      await conversationsService.updateConversation(
        conversationId,
        {
          messages: [...(conversations.find(c => c.id === conversationId)?.messages || []), message],
        },
        userId!
      );
    } catch (error) {
      console.error('Failed to persist message:', error);
      // Don't rollback - message is already visible to user
    }
  }, [userId, conversations, queryClient]);

  // ============================================================================
  // REFRESH (Manual)
  // ============================================================================
  const refreshConversations = useCallback(async (): Promise<void> => {
    await refetch();
  }, [refetch]);

  return {
    conversations,
    activeConversationId,
    isLoading,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
    
    createConversation,
    deleteConversation,
    updateConversation,
    switchConversation,
    addMessageToConversation,
    refreshConversations,
  };
}

