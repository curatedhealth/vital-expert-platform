/**
 * VITAL AI UI - Assets Module
 *
 * Unified asset components for displaying tools, skills, workflows,
 * prompts, and other asset types in various layouts.
 *
 * @example
 * ```tsx
 * import {
 *   VitalAssetCard,
 *   VitalAssetGrid,
 *   VitalAssetList,
 *   VitalAssetTable,
 *   VitalAssetKanban,
 *   VitalAssetView,
 *   type VitalAsset,
 * } from '@vital/ai-ui/assets';
 * ```
 */

// ============================================================================
// COMPONENTS
// ============================================================================

// Card component
export {
  VitalAssetCard,
  VitalAssetCardSkeleton,
  VitalAssetListItem,
} from './VitalAssetCard';

// Grid layout
export { VitalAssetGrid } from './VitalAssetGrid';

// List layout
export { VitalAssetList } from './VitalAssetList';

// Table layout
export { VitalAssetTable } from './VitalAssetTable';

// Kanban layout
export { VitalAssetKanban } from './VitalAssetKanban';

// Unified view (combines all layouts)
export { VitalAssetView } from './VitalAssetView';
export type { ExtendedViewMode, VitalAssetViewProps } from './VitalAssetView';

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core types
  AssetType,
  AssetLifecycleStage,
  AssetAccessLevel,
  AssetHealthStatus,
  AssetComplexityLevel,
  AssetCardVariant,
  AssetViewMode,
  // Data structures
  VitalAssetBase,
  VitalToolAsset,
  VitalSkillAsset,
  VitalWorkflowAsset,
  VitalPromptAsset,
  VitalGenericAsset,
  VitalAsset,
  AssetCategoryConfig,
  AssetLifecycleConfig,
  AssetComplexityConfig,
  // Component props
  VitalAssetCardBaseProps,
  VitalAssetCardActions,
  VitalAssetCardProps,
  VitalAssetGridProps,
  VitalAssetListProps,
  AssetTableColumn,
  VitalAssetTableProps,
  AssetKanbanColumn,
  VitalAssetKanbanProps,
} from './types';

// Type guards
export {
  getComplexityLevel,
  isToolAsset,
  isSkillAsset,
  isWorkflowAsset,
  isPromptAsset,
  getAssetDescription,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  // Type configurations
  ASSET_TYPE_CONFIG,
  // Category configurations
  ASSET_CATEGORIES,
  DEFAULT_CATEGORY,
  // Lifecycle configurations
  LIFECYCLE_BADGES,
  // Complexity configurations
  COMPLEXITY_BADGES,
  // Implementation configurations
  IMPLEMENTATION_BADGES,
  // Kanban configurations
  DEFAULT_KANBAN_COLUMNS,
  // Helper functions
  getCategoryConfig,
  getLifecycleConfig,
  getComplexityConfig,
  getImplementationConfig,
  getAssetTypeConfig,
} from './constants';
