/**
 * AgentGrid Component
 * Displays agents in a responsive grid with virtual scrolling
 *
 * Uses @tanstack/react-virtual for performance with large lists
 * @see https://tanstack.com/virtual/latest
 */

'use client';

import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import { AgentCard, AgentCardSkeleton } from './agent-card';
import type { Agent } from '../types/agent.types';
import { GRID_COLUMNS, PERFORMANCE, CARD_SIZES } from '../constants/design-tokens';
import { Inbox, Loader2 } from 'lucide-react';

// ============================================================================
// AGENT GRID PROPS
// ============================================================================

export interface AgentGridProps {
  agents: Agent[];
  loading?: boolean;
  loadingMore?: boolean;
  error?: Error | null;
  cardSize?: 'compact' | 'comfortable' | 'detailed';
  onSelectAgent?: (agent: Agent) => void;
  onDuplicateAgent?: (agent: Agent, e: React.MouseEvent) => void;
  onBookmarkAgent?: (agent: Agent, e: React.MouseEvent) => void;
  onAddToChat?: (agent: Agent, e: React.MouseEvent) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  showMetadata?: boolean;
  showSpawning?: boolean;
  featuredAgentIds?: string[];
  className?: string;
  emptyState?: React.ReactNode;
}

// ============================================================================
// RESPONSIVE COLUMN HOOK
// ============================================================================

/**
 * Hook to get current grid columns based on window width
 * Uses GRID_COLUMNS from design tokens
 */
const useResponsiveColumns = (): number => {
  const [columns, setColumns] = React.useState<number>(GRID_COLUMNS.lg);

  React.useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(GRID_COLUMNS.xs); // Mobile
      else if (width < 768) setColumns(GRID_COLUMNS.sm); // Large mobile
      else if (width < 1024) setColumns(GRID_COLUMNS.md); // Tablet
      else if (width < 1280) setColumns(GRID_COLUMNS.lg); // Desktop
      else if (width < 1536) setColumns(GRID_COLUMNS.xl); // Large desktop
      else setColumns(GRID_COLUMNS['2xl']); // XL desktop
    };

    // Set initial columns
    updateColumns();

    // Listen for window resize
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columns;
};

// ============================================================================
// AGENT GRID COMPONENT
// ============================================================================

/**
 * AgentGrid - Responsive grid with virtual scrolling for agent cards
 *
 * @example
 * // Basic usage
 * <AgentGrid agents={agents} />
 *
 * // With selection handler
 * <AgentGrid
 *   agents={agents}
 *   onSelectAgent={(agent) => openDetailModal(agent)}
 * />
 *
 * // With infinite scroll
 * <AgentGrid
 *   agents={agents}
 *   hasMore={hasMore}
 *   onLoadMore={loadMore}
 * />
 *
 * // Compact cards
 * <AgentGrid agents={agents} cardSize="compact" />
 */
export const AgentGrid: React.FC<AgentGridProps> = ({
  agents,
  loading = false,
  loadingMore = false,
  error = null,
  cardSize = 'comfortable',
  onSelectAgent,
  onDuplicateAgent,
  onBookmarkAgent,
  onAddToChat,
  onLoadMore,
  hasMore = false,
  showMetadata = true,
  showSpawning = true,
  featuredAgentIds = [],
  className,
  emptyState,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const columns = useResponsiveColumns();

  // Get card height for virtual scrolling estimation
  const cardHeight = CARD_SIZES[cardSize].height;
  const gap = 12; // tighten vertical spacing
  const rowHeight = cardHeight + gap;

  // Calculate total rows (agents divided by columns, rounded up)
  const totalRows = Math.ceil(agents.length / columns);

  // Setup virtual scrolling for rows (not individual items)
  const rowVirtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: PERFORMANCE.virtualScrollOverscan,
  });

  // Intersection observer for infinite scroll
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!onLoadMore || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: PERFORMANCE.infiniteScrollThreshold }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onLoadMore, hasMore, loadingMore]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading && agents.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: columns * 3 }).map((_, i) => (
            <AgentCardSkeleton key={i} size={cardSize} />
          ))}
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
            <Inbox className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Error loading agents</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  if (agents.length === 0) {
    if (emptyState) {
      return <div className={cn('w-full', className)}>{emptyState}</div>;
    }

    return (
      <div className={cn('w-full', className)}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No agents found</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Try adjusting your filters or search terms to find agents.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // GRID VIEW (with Virtual Scrolling)
  // ============================================================================

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={cn('w-full h-full overflow-auto', className)}
      style={{
        contain: 'strict',
      }}
    >
      {/* Virtual scroll container */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Render visible rows */}
        {virtualItems.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowAgents = agents.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="grid gap-4 h-full"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {rowAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    size={cardSize}
                    onSelect={onSelectAgent}
                    onDuplicate={onDuplicateAgent}
                    onBookmark={onBookmarkAgent}
                    onAddToChat={onAddToChat}
                    showMetadata={showMetadata}
                    showSpawning={showSpawning}
                    featured={featuredAgentIds.includes(agent.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {loadingMore ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading more agents...</span>
            </div>
          ) : (
            <div className="h-4" /> // Invisible trigger element
          )}
        </div>
      )}
    </div>
  );
};

AgentGrid.displayName = 'AgentGrid';

// ============================================================================
// AGENT GRID EMPTY STATE (Reusable Component)
// ============================================================================

export const AgentGridEmptyState: React.FC<{
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({
  title = 'No agents found',
  description = 'Try adjusting your filters or search terms.',
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3">
        {icon || <Inbox className="h-6 w-6 text-muted-foreground" />}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

AgentGridEmptyState.displayName = 'AgentGridEmptyState';

// ============================================================================
// EXPORTS
// ============================================================================

export default AgentGrid;
