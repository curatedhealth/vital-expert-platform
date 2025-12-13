'use client';

/**
 * AgentDetailSkeleton - Loading State
 *
 * Displays skeleton loading state for agent detail page
 * Uses Brand Guidelines v6.0 styling
 */

import { Skeleton } from '@vital/ui';

export function AgentDetailSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <Skeleton className="h-10 w-full max-w-xl" />

      {/* Content Skeleton */}
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}
