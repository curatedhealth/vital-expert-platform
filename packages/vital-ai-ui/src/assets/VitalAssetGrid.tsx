/**
 * VitalAssetGrid - Grid Layout for Asset Cards
 *
 * Responsive grid component for displaying assets in a card grid layout.
 * Uses shadcn/ui components and CSS Grid for responsive behavior.
 *
 * @example
 * ```tsx
 * <VitalAssetGrid
 *   assets={myTools}
 *   variant="rich"
 *   loading={isLoading}
 *   columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
 *   onAssetClick={handleClick}
 * />
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { VitalAssetCard, VitalAssetCardSkeleton } from './VitalAssetCard';
import type { VitalAssetGridProps, VitalAsset, AssetCardVariant } from './types';

// ============================================================================
// GRID CONFIGURATION
// ============================================================================

const DEFAULT_COLUMNS = {
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
};

/**
 * Generate responsive grid column classes
 */
function getGridClasses(columns: VitalAssetGridProps['columns'] = DEFAULT_COLUMNS): string {
  const { sm = 1, md = 2, lg = 3, xl = 4 } = columns;

  return cn(
    'grid gap-4',
    sm === 1 && 'grid-cols-1',
    sm === 2 && 'grid-cols-2',
    sm === 3 && 'grid-cols-3',
    sm === 4 && 'grid-cols-4',
    md === 1 && 'md:grid-cols-1',
    md === 2 && 'md:grid-cols-2',
    md === 3 && 'md:grid-cols-3',
    md === 4 && 'md:grid-cols-4',
    lg === 1 && 'lg:grid-cols-1',
    lg === 2 && 'lg:grid-cols-2',
    lg === 3 && 'lg:grid-cols-3',
    lg === 4 && 'lg:grid-cols-4',
    lg === 5 && 'lg:grid-cols-5',
    xl === 1 && 'xl:grid-cols-1',
    xl === 2 && 'xl:grid-cols-2',
    xl === 3 && 'xl:grid-cols-3',
    xl === 4 && 'xl:grid-cols-4',
    xl === 5 && 'xl:grid-cols-5',
    xl === 6 && 'xl:grid-cols-6'
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  message?: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No assets found',
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center',
      'bg-muted/30 rounded-lg border border-dashed',
      className
    )}
  >
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
      <svg
        className="w-6 h-6 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    </div>
    <p className="text-muted-foreground text-sm">{message}</p>
  </div>
);

// ============================================================================
// SKELETON GRID
// ============================================================================

interface SkeletonGridProps {
  count: number;
  variant?: AssetCardVariant;
  columns?: VitalAssetGridProps['columns'];
  className?: string;
}

const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  count,
  variant = 'rich',
  columns,
  className,
}) => (
  <div className={cn(getGridClasses(columns), className)}>
    {Array.from({ length: count }).map((_, index) => (
      <VitalAssetCardSkeleton key={index} variant={variant} />
    ))}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * VitalAssetGrid - Responsive grid layout for asset cards
 */
export const VitalAssetGrid: React.FC<VitalAssetGridProps> = ({
  assets,
  variant = 'rich',
  loading = false,
  skeletonCount = 8,
  isAdmin = false,
  columns = DEFAULT_COLUMNS,
  className,
  onAssetClick,
  onEdit,
  onDelete,
}) => {
  // Show skeleton loading state
  if (loading) {
    return (
      <SkeletonGrid
        count={skeletonCount}
        variant={variant}
        columns={columns}
        className={className}
      />
    );
  }

  // Show empty state if no assets
  if (!assets || assets.length === 0) {
    return <EmptyState className={className} />;
  }

  return (
    <div className={cn(getGridClasses(columns), className)}>
      {assets.map((asset, index) => (
        <VitalAssetCard
          key={asset.id}
          asset={asset}
          variant={variant}
          isAdmin={isAdmin}
          animationDelay={index * 50}
          onClick={onAssetClick}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions
        />
      ))}
    </div>
  );
};

VitalAssetGrid.displayName = 'VitalAssetGrid';

export default VitalAssetGrid;
