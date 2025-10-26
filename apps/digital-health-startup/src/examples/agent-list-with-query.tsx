'use client';

import { useState } from 'react';

import { Button } from '@vital/ui';
import { Input } from '@vital/ui';
import { useAgentsQuery, useDeleteAgentMutation } from '@/lib/hooks/use-agents-query';
import { AgentAvatarOptimized } from '@/shared/components/agent-avatar-optimized';

/**
 * Example component demonstrating React Query usage
 *
 * Features demonstrated:
 * - Data fetching with caching
 * - Loading states
 * - Error handling
 * - Filtering
 * - Mutations with optimistic updates
 * - Automatic cache invalidation
 */
export function AgentListWithQuery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<number | undefined>();

  // Fetch agents with React Query
  // Data is cached for 1 hour, automatically refetched on reconnect
  const {
    data: agentsResponse,
    error,
    isLoading,
    refetch
  } = useAgentsQuery({
    search: searchTerm,
    tier: tierFilter,
    status: 'active'
  });

  // Delete mutation with automatic cache invalidation
  const deleteMutation = useDeleteAgentMutation();

  const handleDelete = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      await deleteMutation.mutateAsync(agentId);
      // Cache is automatically invalidated - UI updates instantly
    } catch (error) {
      console.error('Failed to delete agent:', error);
      alert('Failed to delete agent');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading agents...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-600">Error loading agents: {error.message}</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  const agents = agentsResponse?.agents || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search agents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={tierFilter || ''}
          onChange={(e) => setTierFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Tiers</option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
        </select>
        <Button variant="outline" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {/* Agent Count */}
      <div className="text-sm text-muted-foreground">
        Found {agents.length} agent{agents.length !== 1 ? 's' : ''}
        {searchTerm && ` matching "${searchTerm}"`}
      </div>

      {/* Agent Grid */}
      {agents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No agents found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
            >
              {/* Agent Header */}
              <div className="flex items-start gap-3">
                <AgentAvatarOptimized
                  agent={agent}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {agent.display_name || agent.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tier {agent.tier || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {agent.description}
              </p>

              {/* Capabilities */}
              {agent.capabilities && agent.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.slice(0, 3).map((cap, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                    >
                      {cap}
                    </span>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <span className="text-xs px-2 py-1 text-muted-foreground">
                      +{agent.capabilities.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {/* Navigate to agent detail */}}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {/* Navigate to edit */}}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(agent.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Usage in a page:
 *
 * ```tsx
 * import { AgentListWithQuery } from '@/examples/agent-list-with-query';
 *
 * export default function AgentsPage() {
 *   return (
 *     <div className="container mx-auto py-8">
 *       <h1 className="text-3xl font-bold mb-6">Agents</h1>
 *       <AgentListWithQuery />
 *     </div>
 *   );
 * }
 * ```
 *
 * Benefits of using React Query:
 *
 * 1. **Automatic Caching**: Data is cached for 1 hour, reducing API calls
 * 2. **Background Refetching**: Data is refetched on reconnect, window focus (if enabled)
 * 3. **Loading States**: Built-in isLoading, isFetching states
 * 4. **Error Handling**: Automatic retry with exponential backoff
 * 5. **Optimistic Updates**: UI updates instantly, rolls back on error
 * 6. **Cache Invalidation**: Mutations automatically invalidate related queries
 * 7. **Deduplication**: Multiple components requesting same data share one request
 * 8. **TypeScript Support**: Full type safety with inferred types
 */
