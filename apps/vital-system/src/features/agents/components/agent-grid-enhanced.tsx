/**
 * Enhanced AgentGrid Component v2.0
 * Premium grid layout with animations, virtual scrolling, and responsive design
 */

'use client';

import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AgentCardEnhanced, AgentCardSkeleton, type CardVariant } from './agent-card-enhanced';
import type { Agent } from '../types/agent.types';
import { GRID } from '../constants/design-tokens-enhanced';
import { Inbox, Loader2, Sparkles, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES
// ============================================================================

export interface AgentGridEnhancedProps {
  agents: Agent[];
  loading?: boolean;
  loadingMore?: boolean;
  error?: Error | null;
  cardVariant?: CardVariant;
  onSelectAgent?: (agent: Agent) => void;
  onDuplicateAgent?: (agent: Agent) => void;
  onBookmarkAgent?: (agent: Agent) => void;
  onAddToChat?: (agent: Agent) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  bookmarkedIds?: Set<string>;
  featuredIds?: Set<string>;
  className?: string;
  emptyState?: React.ReactNode;
  onClearFilters?: () => void;
}

// ============================================================================
// RESPONSIVE COLUMNS HOOK
// ============================================================================

const useResponsiveColumns = (): number => {
  const [columns, setColumns] = React.useState<number>(GRID.columns.lg);

  React.useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(GRID.columns.xs);
      else if (width < 768) setColumns(GRID.columns.sm);
      else if (width < 1024) setColumns(GRID.columns.md);
      else if (width < 1280) setColumns(GRID.columns.lg);
      else if (width < 1536) setColumns(GRID.columns.xl);
      else setColumns(GRID.columns['2xl']);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columns;
};

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

const EmptyState: React.FC<{
  hasFilters?: boolean;
  onClearFilters?: () => void;
}> = ({ hasFilters, onClearFilters }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      {/* Animated illustration */}
      <div className="relative mb-8">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 flex items-center justify-center"
        >
          {hasFilters ? (
            <Filter className="w-12 h-12 text-muted-foreground" />
          ) : (
            <Search className="w-12 h-12 text-muted-foreground" />
          )}
        </motion.div>
        
        {/* Floating particles */}
        <motion.div
          animate={{ y: [-5, 5, -5], x: [-3, 3, -3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-500/30"
        />
        <motion.div
          animate={{ y: [5, -5, 5], x: [3, -3, 3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute -bottom-1 -left-3 w-4 h-4 rounded-full bg-blue-500/30"
        />
      </div>

      <h3 className="text-xl font-semibold mb-2">
        {hasFilters ? 'No matching agents' : 'No agents found'}
      </h3>
      
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {hasFilters
          ? 'Try adjusting your filters or search terms to find the agents you\'re looking for.'
          : 'There are no agents available yet. Check back later or create a new agent.'}
      </p>

      {hasFilters && onClearFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="gap-2 rounded-xl"
        >
          <Filter className="w-4 h-4" />
          Clear all filters
        </Button>
      )}
    </motion.div>
  );
};

// ============================================================================
// ERROR STATE COMPONENT
// ============================================================================

const ErrorState: React.FC<{
  error: Error;
  onRetry?: () => void;
}> = ({ error, onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
        <Inbox className="w-10 h-10 text-red-500" />
      </div>

      <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
      
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {error.message || 'An unexpected error occurred while loading agents.'}
      </p>

      {onRetry && (
        <Button onClick={onRetry} className="gap-2 rounded-xl">
          Try again
        </Button>
      )}
    </motion.div>
  );
};

// ============================================================================
// LOADING SKELETON GRID
// ============================================================================

const LoadingSkeleton: React.FC<{
  columns: number;
  variant?: CardVariant;
}> = ({ columns, variant = 'default' }) => {
  return (
    <div
      className="grid gap-5"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: columns * 3 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <AgentCardSkeleton variant={variant} />
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN GRID COMPONENT
// ============================================================================

export const AgentGridEnhanced: React.FC<AgentGridEnhancedProps> = ({
  agents,
  loading = false,
  loadingMore = false,
  error = null,
  cardVariant = 'default',
  onSelectAgent,
  onDuplicateAgent,
  onBookmarkAgent,
  onAddToChat,
  onLoadMore,
  hasMore = false,
  bookmarkedIds = new Set(),
  featuredIds = new Set(),
  className,
  emptyState,
  onClearFilters,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const columns = useResponsiveColumns();

  // Calculate row height based on card variant
  const rowHeights: Record<CardVariant, number> = {
    compact: 220,
    default: 300,
    detailed: 360,
    featured: 420,
  };
  const rowHeight = rowHeights[cardVariant] + 20; // Add gap

  // Calculate total rows
  const totalRows = Math.ceil(agents.length / columns);

  // Setup virtual scrolling
  const rowVirtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 3,
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
      { threshold: 0.5 }
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

  // Loading state
  if (loading && agents.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        <LoadingSkeleton columns={columns} variant={cardVariant} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('w-full', className)}>
        <ErrorState error={error} />
      </div>
    );
  }

  // Empty state
  if (agents.length === 0) {
    if (emptyState) {
      return <div className={cn('w-full', className)}>{emptyState}</div>;
    }
    return (
      <div className={cn('w-full', className)}>
        <EmptyState hasFilters={true} onClearFilters={onClearFilters} />
      </div>
    );
  }

  // Virtual items
  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={cn('w-full h-full overflow-auto', className)}
      style={{ contain: 'strict' }}
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
        <AnimatePresence mode="popLayout">
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
                  className="grid gap-5 h-full px-1"
                  style={{
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  }}
                >
                  {rowAgents.map((agent, index) => (
                    <AgentCardEnhanced
                      key={agent.id}
                      agent={agent}
                      variant={cardVariant}
                      onSelect={onSelectAgent}
                      onDuplicate={onDuplicateAgent}
                      onBookmark={onBookmarkAgent}
                      onAddToChat={onAddToChat}
                      isBookmarked={bookmarkedIds.has(agent.id)}
                      featured={featuredIds.has(agent.id)}
                      animationDelay={(startIndex + index) * 0.02}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {loadingMore ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-sm text-muted-foreground"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more agents...</span>
            </motion.div>
          ) : (
            <div className="h-8" />
          )}
        </div>
      )}
    </div>
  );
};

AgentGridEnhanced.displayName = 'AgentGridEnhanced';

// ============================================================================
// EXPORTS
// ============================================================================

export default AgentGridEnhanced;






