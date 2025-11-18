/**
 * useUserAgents Hook
 * 
 * React Query hook for managing user-agent relationships.
 * Provides cached data fetching and mutations with automatic refetching.
 * 
 * Features:
 * - Cached queries (5-minute TTL)
 * - Optimistic updates
 * - Automatic cache invalidation
 * - Error handling
 * - Migration support from localStorage
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAgentsService, type UserAgent, type MigrationResult } from '@/lib/services/user-agents/user-agents-service';

// ============================================================================
// QUERY KEYS
// ============================================================================

const queryKeys = {
  userAgents: (userId: string | null) => ['user-agents', userId] as const,
};

// ============================================================================
// HOOK
// ============================================================================

export interface UseUserAgentsOptions {
  enabled?: boolean;
}

export function useUserAgents(userId: string | null, options: UseUserAgentsOptions = {}) {
  const queryClient = useQueryClient();
  const { enabled = !!userId } = options;

  // Query: Get user agents
  const query = useQuery({
    queryKey: queryKeys.userAgents(userId),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return userAgentsService.getUserAgents(userId);
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Mutation: Add agent to user's list
  const addMutation = useMutation({
    mutationFn: ({ agentId, options }: { agentId: string; options?: { originalAgentId?: string; isUserCopy?: boolean } }) => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return userAgentsService.addUserAgent(userId, agentId, options);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.userAgents(userId) });
    },
    onError: (error) => {
      console.error('❌ [useUserAgents] Failed to add agent:', error);
    },
  });

  // Mutation: Remove agent from user's list
  const removeMutation = useMutation({
    mutationFn: (agentId: string) => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return userAgentsService.removeUserAgent(userId, agentId);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.userAgents(userId) });
    },
    onError: (error) => {
      console.error('❌ [useUserAgents] Failed to remove agent:', error);
    },
  });

  // Mutation: Migrate from localStorage
  const migrateMutation = useMutation({
    mutationFn: () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return userAgentsService.migrateFromLocalStorage(userId);
    },
    onSuccess: (result: MigrationResult) => {
      if (result.success && result.migratedCount > 0) {
        // Invalidate and refetch after successful migration
        queryClient.invalidateQueries({ queryKey: queryKeys.userAgents(userId) });
        console.log(`✅ [useUserAgents] Migrated ${result.migratedCount} agents from localStorage`);
      }
    },
    onError: (error) => {
      console.error('❌ [useUserAgents] Migration failed:', error);
    },
  });

  return {
    // Query state
    userAgents: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,

    // Mutations
    addAgent: addMutation.mutate,
    addAgentAsync: addMutation.mutateAsync,
    isAdding: addMutation.isPending,

    removeAgent: removeMutation.mutate,
    removeAgentAsync: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,

    migrateFromLocalStorage: migrateMutation.mutate,
    migrateAsync: migrateMutation.mutateAsync,
    isMigrating: migrateMutation.isPending,
    migrationResult: migrateMutation.data,
  };
}

// ============================================================================
// TYPES FOR CONSUMERS
// ============================================================================

export type UseUserAgentsReturn = ReturnType<typeof useUserAgents>;
