/**
 * VitalAgentCardGrid - Responsive Agent Card Grid
 * 
 * Grid layout container for agent cards with:
 * - Responsive column configuration
 * - Optional virtual scrolling for large lists
 * - Empty and loading states
 * - Keyboard navigation support
 * 
 * @packageDocumentation
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { VitalAgentCard } from './VitalAgentCard';
import { VitalAgentCardGridSkeleton } from './VitalAgentCard/VitalAgentCardSkeleton';
import { FolderOpen, Search, AlertCircle } from 'lucide-react';
import { GRID_CONFIG, DEFAULT_RESPONSIVE_VARIANTS } from './constants';
import type { VitalAgentCardGridProps, VitalAgent, AgentCardVariant } from './types';

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

function EmptyState({ 
  message = 'No agents found', 
  icon,
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon || <FolderOpen className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {message}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        Try adjusting your filters or search criteria to find agents.
      </p>
      {action}
    </div>
  );
}

// ============================================================================
// ERROR STATE COMPONENT
// ============================================================================

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

function ErrorState({ 
  message = 'Failed to load agents',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {message}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        Something went wrong while loading the agents. Please try again.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * VitalAgentCardGrid displays agents in a responsive grid layout.
 * 
 * Features:
 * - Responsive columns (1-4 based on screen size)
 * - Expandable card support
 * - Selection state management
 * - Loading and empty states
 * - Keyboard navigation (arrow keys)
 * 
 * @example
 * ```tsx
 * <VitalAgentCardGrid
 *   agents={agents}
 *   onAgentSelect={handleSelect}
 *   onAgentAddToChat={handleAddToChat}
 *   selectedIds={[selectedId]}
 *   expandable
 * />
 * ```
 */
export function VitalAgentCardGrid({
  agents,
  minCardWidth = 280,
  gap = 16,
  responsiveVariants = DEFAULT_RESPONSIVE_VARIANTS,
  expandable = false,
  virtualized = false,
  virtualizedHeight,
  onAgentSelect,
  onAgentAddToChat,
  onAgentBookmark,
  onAgentEdit,
  onAgentDelete,
  onAgentCompare,
  selectedIds = [],
  bookmarkedIds = [],
  comparisonIds = [],
  isLoading = false,
  emptyMessage = 'No agents found',
  className,
}: VitalAgentCardGridProps) {
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
  
  // Calculate grid columns based on container width
  const [columns, setColumns] = React.useState<number>(GRID_CONFIG.columns.lg);
  
  React.useEffect(() => {
    const updateColumns = () => {
      if (!gridRef.current) return;
      const width = gridRef.current.offsetWidth;
      const cols = Math.max(1, Math.floor(width / minCardWidth));
      setColumns(Math.min(cols, GRID_CONFIG.columns.xl) as number);
    };
    
    updateColumns();
    
    const resizeObserver = new ResizeObserver(updateColumns);
    if (gridRef.current) {
      resizeObserver.observe(gridRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [minCardWidth]);
  
  // Keyboard navigation
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (agents.length === 0) return;
    
    let newIndex = focusedIndex;
    
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(focusedIndex + 1, agents.length - 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(focusedIndex - 1, 0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(focusedIndex + columns, agents.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(focusedIndex - columns, 0);
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = agents.length - 1;
        break;
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0 && focusedIndex < agents.length) {
          e.preventDefault();
          onAgentSelect?.(agents[focusedIndex]);
        }
        break;
      default:
        return;
    }
    
    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
      
      // Focus the card element
      const cards = gridRef.current?.querySelectorAll('[data-agent-card]');
      if (cards && cards[newIndex]) {
        (cards[newIndex] as HTMLElement).focus();
      }
    }
  }, [agents, focusedIndex, columns, onAgentSelect]);
  
  // Loading state
  if (isLoading) {
    return (
      <VitalAgentCardGridSkeleton
        count={6}
        variant={responsiveVariants.lg || 'compact'}
        className={className}
      />
    );
  }
  
  // Empty state
  if (agents.length === 0) {
    return (
      <EmptyState
        message={emptyMessage}
        icon={<Search className="w-8 h-8 text-muted-foreground" />}
      />
    );
  }
  
  // Standard grid (non-virtualized)
  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label="Agent grid"
      onKeyDown={handleKeyDown}
      className={cn(
        'grid',
        'grid-cols-1',
        'sm:grid-cols-2',
        'lg:grid-cols-3',
        'xl:grid-cols-4',
        className
      )}
      style={{ gap }}
    >
      {agents.map((agent, index) => (
        <div
          key={agent.id}
          data-agent-card
          role="gridcell"
          tabIndex={index === focusedIndex ? 0 : -1}
          onFocus={() => setFocusedIndex(index)}
        >
          <VitalAgentCard
            agent={agent as any}
            responsiveVariants={responsiveVariants}
            expandable={expandable}
            expandTo="rich"
            isSelected={selectedIds.includes(agent.id)}
            isBookmarked={bookmarkedIds.includes(agent.id)}
            isInComparison={comparisonIds.includes(agent.id)}
            showActions
            showCapabilities
            animationDelay={index * 50}
            onSelect={onAgentSelect as any}
            onAddToChat={onAgentAddToChat}
            onBookmark={onAgentBookmark}
            onEdit={onAgentEdit}
            onDelete={onAgentDelete}
            onCompare={onAgentCompare}
          />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// AGENT CARD LIST
// ============================================================================

export interface VitalAgentCardListProps {
  /** Array of agents to display */
  agents: VitalAgent[];
  
  /** Use minimal variant for list items */
  useMinimalVariant?: boolean;
  
  /** Show dividers between items */
  showDividers?: boolean;
  
  /** Event handlers */
  onAgentSelect?: (agent: VitalAgent) => void;
  onAgentAddToChat?: (agent: VitalAgent) => void;
  onAgentBookmark?: (agent: VitalAgent) => void;
  
  /** Selection state */
  selectedIds?: string[];
  bookmarkedIds?: string[];
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Empty state message */
  emptyMessage?: string;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * VitalAgentCardList displays agents in a vertical list layout.
 * 
 * Best for:
 * - Sidebars
 * - Mobile views
 * - Dropdown selections
 * 
 * @example
 * ```tsx
 * <VitalAgentCardList
 *   agents={agents}
 *   onAgentSelect={handleSelect}
 *   useMinimalVariant
 *   showDividers
 * />
 * ```
 */
export function VitalAgentCardList({
  agents,
  useMinimalVariant = true,
  showDividers = false,
  onAgentSelect,
  onAgentAddToChat,
  onAgentBookmark,
  selectedIds = [],
  bookmarkedIds = [],
  isLoading = false,
  emptyMessage = 'No agents found',
  className,
}: VitalAgentCardListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex flex-col', showDividers && 'divide-y divide-border', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Empty state
  if (agents.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <div
      role="listbox"
      aria-label="Agent list"
      className={cn(
        'flex flex-col',
        showDividers && 'divide-y divide-border',
        className
      )}
    >
      {agents.map((agent, index) => (
        <VitalAgentCard
          key={agent.id}
          agent={agent as any}
          variant={(useMinimalVariant ? 'minimal' : 'compact') as 'default' | 'detailed' | 'compact' | undefined}
          isSelected={selectedIds.includes(agent.id)}
          isBookmarked={bookmarkedIds.includes(agent.id)}
          showActions={!!onAgentAddToChat}
          animationDelay={index * 30}
          onSelect={onAgentSelect as any}
          onAddToChat={onAgentAddToChat}
          onBookmark={onAgentBookmark}
        />
      ))}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default VitalAgentCardGrid;
