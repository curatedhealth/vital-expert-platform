/**
 * VitalToolCardGrid - Grid Container for Tool Cards
 *
 * A responsive grid container for displaying multiple tool cards.
 * Supports loading states with skeleton cards.
 *
 * @example
 * ```tsx
 * <VitalToolCardGrid
 *   tools={tools}
 *   onToolClick={handleClick}
 *   isAdmin
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { VitalToolCard } from './VitalToolCard';
import { VitalToolListItem } from './VitalToolListItem';
import type { VitalToolCardGridProps, VitalToolCardListProps, VitalTool } from './types';

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

const VitalToolCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'rounded-lg border bg-card shadow-sm animate-pulse',
      className
    )}
  >
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-muted" />
          <div className="h-5 w-32 rounded bg-muted" />
        </div>
        <div className="h-5 w-20 rounded-full bg-muted" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
    </div>
    <div className="px-4 pb-4">
      <div className="flex gap-2">
        <div className="h-5 w-24 rounded-full bg-muted" />
        <div className="h-5 w-16 rounded-full bg-muted" />
      </div>
    </div>
  </div>
);

const VitalToolListItemSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'rounded-lg border bg-card shadow-sm animate-pulse',
      className
    )}
  >
    <div className="py-4 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="h-6 w-6 rounded bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 rounded bg-muted" />
            <div className="h-4 w-72 rounded bg-muted" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-24 rounded-full bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// GRID COMPONENT
// ============================================================================

export const VitalToolCardGrid: React.FC<VitalToolCardGridProps> = ({
  tools,
  variant = 'compact',
  loading = false,
  skeletonCount = 6,
  isAdmin,
  columns = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 3,
  },
  className,
  onToolClick,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <VitalToolCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tools found.</p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {tools.map((tool, index) => (
        <VitalToolCard
          key={tool.id}
          tool={tool}
          variant={variant}
          isAdmin={isAdmin}
          animationDelay={index * 50}
          onClick={onToolClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

VitalToolCardGrid.displayName = 'VitalToolCardGrid';

// ============================================================================
// LIST COMPONENT
// ============================================================================

export const VitalToolCardList: React.FC<VitalToolCardListProps> = ({
  tools,
  loading = false,
  skeletonCount = 5,
  isAdmin,
  showDividers = false,
  className,
  onToolClick,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <VitalToolListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tools found.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', showDividers && 'divide-y divide-border', className)}>
      {tools.map((tool, index) => (
        <VitalToolListItem
          key={tool.id}
          tool={tool}
          isAdmin={isAdmin}
          animationDelay={index * 30}
          onClick={onToolClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

VitalToolCardList.displayName = 'VitalToolCardList';

// ============================================================================
// EXPORTS
// ============================================================================

export { VitalToolCardSkeleton, VitalToolListItemSkeleton };
