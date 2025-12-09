/**
 * VitalAgentCardSkeleton - Skeleton Loading States
 * 
 * Provides skeleton loading placeholders for all card variants.
 * Use these while fetching agent data to prevent layout shifts.
 * 
 * @packageDocumentation
 */

'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { VitalAgentCardMinimalSkeleton } from './VitalAgentCardMinimal';
import { VitalAgentCardCompactSkeleton } from './VitalAgentCardCompact';
import { VitalAgentCardRichSkeleton } from './VitalAgentCardRich';
import type { VitalAgentCardSkeletonProps, AgentCardVariant } from '../types';

// ============================================================================
// UNIFIED SKELETON COMPONENT
// ============================================================================

/**
 * VitalAgentCardSkeleton renders loading placeholders for agent cards.
 * 
 * Features:
 * - Supports all three variants (minimal, compact, rich)
 * - Can render multiple skeletons at once
 * - Matches exact dimensions of real cards
 * - Animated shimmer effect
 * 
 * @example
 * ```tsx
 * // Single skeleton
 * <VitalAgentCardSkeleton variant="compact" />
 * 
 * // Multiple skeletons for a grid
 * <VitalAgentCardSkeleton variant="compact" count={6} />
 * 
 * // Minimal skeletons for a list
 * <VitalAgentCardSkeleton variant="minimal" count={10} />
 * ```
 */
export function VitalAgentCardSkeleton({
  variant = 'compact',
  count = 1,
  className,
}: VitalAgentCardSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);
  
  const renderSkeleton = (key: number) => {
    switch (variant) {
      case 'minimal':
        return <VitalAgentCardMinimalSkeleton key={key} className={className} />;
      case 'compact':
        return <VitalAgentCardCompactSkeleton key={key} className={className} />;
      case 'rich':
        return <VitalAgentCardRichSkeleton key={key} className={className} />;
      default:
        return <VitalAgentCardCompactSkeleton key={key} className={className} />;
    }
  };
  
  if (count === 1) {
    return renderSkeleton(0);
  }
  
  return (
    <>
      {skeletons.map((_, index) => renderSkeleton(index))}
    </>
  );
}

// ============================================================================
// GRID SKELETON
// ============================================================================

export interface VitalAgentCardGridSkeletonProps {
  /** Number of skeleton cards */
  count?: number;
  
  /** Card variant */
  variant?: AgentCardVariant;
  
  /** Additional CSS classes for the grid container */
  className?: string;
}

/**
 * Skeleton for the agent card grid layout
 */
export function VitalAgentCardGridSkeleton({
  count = 6,
  variant = 'compact',
  className,
}: VitalAgentCardGridSkeletonProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      <VitalAgentCardSkeleton variant={variant} count={count} />
    </div>
  );
}

// ============================================================================
// LIST SKELETON
// ============================================================================

export interface VitalAgentCardListSkeletonProps {
  /** Number of skeleton items */
  count?: number;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton for the agent card list layout
 */
export function VitalAgentCardListSkeleton({
  count = 5,
  className,
}: VitalAgentCardListSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <VitalAgentCardSkeleton variant="minimal" count={count} />
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default VitalAgentCardSkeleton;

// Re-export individual skeletons
export { VitalAgentCardMinimalSkeleton } from './VitalAgentCardMinimal';
export { VitalAgentCardCompactSkeleton } from './VitalAgentCardCompact';
export { VitalAgentCardRichSkeleton } from './VitalAgentCardRich';
