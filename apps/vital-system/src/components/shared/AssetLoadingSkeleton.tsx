/**
 * AssetLoadingSkeleton - Shared loading skeleton for asset pages
 *
 * Used by: Agents, Tools, Skills, Prompts, Knowledge pages
 */
'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export type SkeletonVariant = 'grid' | 'list' | 'table';

export interface AssetLoadingSkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
  columns?: number;
}

function GridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex gap-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-96 max-w-full" />
          </div>
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="rounded-lg border">
      {/* Header */}
      <div className="border-b bg-muted/50 p-4 flex gap-4">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48 flex-1" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      {/* Rows */}
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b last:border-0 p-4 flex items-center gap-4">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
}

export function AssetLoadingSkeleton({
  variant = 'grid',
  count,
}: AssetLoadingSkeletonProps) {
  const defaultCounts = { grid: 9, list: 12, table: 10 };
  const itemCount = count ?? defaultCounts[variant];

  switch (variant) {
    case 'grid':
      return <GridSkeleton count={itemCount} />;
    case 'list':
      return <ListSkeleton count={itemCount} />;
    case 'table':
      return <TableSkeleton count={itemCount} />;
    default:
      return <GridSkeleton count={itemCount} />;
  }
}

export default AssetLoadingSkeleton;
