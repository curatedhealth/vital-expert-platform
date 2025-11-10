/**
 * SourceSkeleton Component
 *
 * Skeleton loading state for knowledge sources
 * Prevents layout shift and improves perceived performance
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@vital/ui';

export interface SourceSkeletonProps {
  /** Number of skeleton items to show */
  count?: number;
  /** Custom className */
  className?: string;
}

/**
 * Single source skeleton item
 */
const SourceSkeletonItem: React.FC = () => {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 dark:border-gray-800 animate-pulse">
      {/* Number badge skeleton */}
      <div className="shrink-0 h-5 w-6 bg-gray-200 dark:bg-gray-700 rounded-full mt-0.5" />

      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Title line */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />

        {/* Citation line */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />

        {/* Badges skeleton */}
        <div className="flex gap-1.5">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};

/**
 * Source section skeleton
 */
export const SourceSkeleton: React.FC<SourceSkeletonProps> = ({
  count = 3,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`mt-4 space-y-3 ${className}`}
    >
      {/* Header skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Source items skeleton */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, idx) => (
          <SourceSkeletonItem key={idx} />
        ))}
      </div>
    </motion.div>
  );
};

/**
 * Compact skeleton for inline sources during streaming
 */
export const CompactSourceSkeleton: React.FC = () => {
  return (
    <div className="mt-4 space-y-2 border-t pt-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40" />
      </div>
    </div>
  );
};

export default SourceSkeleton;
