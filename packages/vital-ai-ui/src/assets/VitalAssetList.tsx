/**
 * VitalAssetList - Vertical List Layout for Assets
 *
 * List view component for displaying assets in a vertical stack layout.
 * Uses shadcn/ui components for consistent styling.
 *
 * @example
 * ```tsx
 * <VitalAssetList
 *   assets={myTools}
 *   loading={isLoading}
 *   showDividers
 *   onAssetClick={handleClick}
 * />
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Separator, Skeleton } from '../ui';
import { VitalAssetListItem } from './VitalAssetCard';
import type { VitalAssetListProps, VitalAsset } from './types';
import { getCategoryConfig } from './constants';

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
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
        />
      </svg>
    </div>
    <p className="text-muted-foreground text-sm">{message}</p>
  </div>
);

// ============================================================================
// SKELETON LIST ITEM
// ============================================================================

const ListItemSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'flex items-center gap-4 p-4 rounded-lg border bg-card',
      className
    )}
  >
    <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-18 rounded-full" />
      </div>
      <Skeleton className="h-3 w-3/4" />
    </div>
    <Skeleton className="h-2 w-2 rounded-full shrink-0" />
    <div className="flex gap-1 shrink-0">
      <Skeleton className="h-8 w-8 rounded-md" />
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  </div>
);

// ============================================================================
// SKELETON LIST
// ============================================================================

interface SkeletonListProps {
  count: number;
  showDividers?: boolean;
  className?: string;
}

const SkeletonList: React.FC<SkeletonListProps> = ({
  count,
  showDividers = false,
  className,
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: count }).map((_, index) => (
      <React.Fragment key={index}>
        <ListItemSkeleton />
        {showDividers && index < count - 1 && <Separator className="my-2" />}
      </React.Fragment>
    ))}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * VitalAssetList - Vertical list layout for assets
 */
export const VitalAssetList: React.FC<VitalAssetListProps> = ({
  assets,
  variant = 'rich',
  loading = false,
  skeletonCount = 5,
  isAdmin = false,
  showDividers = false,
  className,
  onAssetClick,
  onEdit,
  onDelete,
}) => {
  // Show skeleton loading state
  if (loading) {
    return (
      <SkeletonList
        count={skeletonCount}
        showDividers={showDividers}
        className={className}
      />
    );
  }

  // Show empty state if no assets
  if (!assets || assets.length === 0) {
    return <EmptyState className={className} />;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {assets.map((asset, index) => (
        <React.Fragment key={asset.id}>
          <VitalAssetListItem
            asset={asset}
            isAdmin={isAdmin}
            showActions
            onClick={onAssetClick}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          {showDividers && index < assets.length - 1 && (
            <Separator className="my-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

VitalAssetList.displayName = 'VitalAssetList';

export default VitalAssetList;
