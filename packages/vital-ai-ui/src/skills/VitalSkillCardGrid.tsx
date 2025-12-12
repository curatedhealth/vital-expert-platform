/**
 * VitalSkillCardGrid - Grid Container for Skill Cards
 *
 * A responsive grid container for displaying multiple skill cards.
 * Supports loading states with skeleton cards.
 *
 * @example
 * ```tsx
 * <VitalSkillCardGrid
 *   skills={skills}
 *   onSkillClick={handleClick}
 *   isAdmin
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { VitalSkillCard } from './VitalSkillCard';
import { VitalSkillListItem } from './VitalSkillListItem';
import type { VitalSkillCardGridProps, VitalSkillCardListProps, VitalSkill } from './types';

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

const VitalSkillCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
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
        <div className="h-5 w-14 rounded-full bg-muted" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
    </div>
    <div className="px-4 pb-4">
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-full bg-muted" />
        <div className="h-5 w-24 rounded-full bg-muted" />
      </div>
    </div>
  </div>
);

const VitalSkillListItemSkeleton: React.FC<{ className?: string }> = ({ className }) => (
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
          <div className="h-5 w-20 rounded-full bg-muted" />
          <div className="h-5 w-24 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// GRID COMPONENT
// ============================================================================

export const VitalSkillCardGrid: React.FC<VitalSkillCardGridProps> = ({
  skills,
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
  onSkillClick,
  onEdit,
  onDelete,
}) => {
  const gridClasses = cn(
    'grid gap-4',
    columns.sm && `grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    className
  );

  // Use inline style for dynamic grid columns
  const gridStyle = {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: `repeat(${columns.sm || 1}, minmax(0, 1fr))`,
  };

  if (loading) {
    return (
      <div style={gridStyle} className={cn('md:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <VitalSkillCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No skills found.</p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {skills.map((skill, index) => (
        <VitalSkillCard
          key={skill.id}
          skill={skill}
          variant={variant}
          isAdmin={isAdmin}
          animationDelay={index * 50}
          onClick={onSkillClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

VitalSkillCardGrid.displayName = 'VitalSkillCardGrid';

// ============================================================================
// LIST COMPONENT
// ============================================================================

export const VitalSkillCardList: React.FC<VitalSkillCardListProps> = ({
  skills,
  loading = false,
  skeletonCount = 5,
  isAdmin,
  showDividers = false,
  className,
  onSkillClick,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <VitalSkillListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No skills found.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', showDividers && 'divide-y divide-border', className)}>
      {skills.map((skill, index) => (
        <VitalSkillListItem
          key={skill.id}
          skill={skill}
          isAdmin={isAdmin}
          animationDelay={index * 30}
          onClick={onSkillClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

VitalSkillCardList.displayName = 'VitalSkillCardList';

// ============================================================================
// EXPORTS
// ============================================================================

export { VitalSkillCardSkeleton, VitalSkillListItemSkeleton };
