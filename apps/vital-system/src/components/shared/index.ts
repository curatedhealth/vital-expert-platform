/**
 * Shared Components Index
 *
 * Export all shared components for easy importing across asset pages.
 * These components follow the standard asset page pattern established by Tools/Skills.
 */

// Breadcrumb
export { VitalBreadcrumb } from './VitalBreadcrumb';
export type { VitalBreadcrumbProps, BreadcrumbItemConfig } from './VitalBreadcrumb';

// Asset Overview Stats
export { AssetOverviewStats } from './AssetOverviewStats';
export type { AssetOverviewStatsProps, StatCardConfig } from './AssetOverviewStats';

// Recent Assets Card
export { RecentAssetsCard } from './RecentAssetsCard';
export type { RecentAssetsCardProps, RecentAssetItem } from './RecentAssetsCard';

// Active Filters Bar
export { ActiveFiltersBar } from './ActiveFiltersBar';
export type { ActiveFiltersBarProps, ActiveFilter } from './ActiveFiltersBar';

// Asset Loading Skeleton
export { AssetLoadingSkeleton } from './AssetLoadingSkeleton';
export type { AssetLoadingSkeletonProps, SkeletonVariant } from './AssetLoadingSkeleton';

// Asset Empty State
export { AssetEmptyState } from './AssetEmptyState';
export type { AssetEmptyStateProps } from './AssetEmptyState';

// Asset Results Count
export { AssetResultsCount } from './AssetResultsCount';
export type { AssetResultsCountProps } from './AssetResultsCount';
