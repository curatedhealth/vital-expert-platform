/**
 * VITAL AI UI - Tools Components
 *
 * Comprehensive tool component library for AI-powered applications.
 *
 * Components:
 * - VitalToolCard: Flexible card for displaying tools
 * - VitalToolListItem: Horizontal list item for tools
 * - VitalToolCardGrid: Responsive grid container
 * - VitalToolCardList: Vertical list container
 *
 * @packageDocumentation
 */

// ============================================================================
// COMPONENTS
// ============================================================================

export { VitalToolCard, default as ToolCard } from './VitalToolCard';
export { VitalToolListItem, default as ToolListItem } from './VitalToolListItem';
export {
  VitalToolCardGrid,
  VitalToolCardList,
  VitalToolCardSkeleton,
  VitalToolListItemSkeleton,
} from './VitalToolCardGrid';

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core types
  ToolType,
  ToolLifecycleStage,
  ToolAccessLevel,
  ToolHealthStatus,
  ToolCardVariant,

  // Data structures
  VitalTool,
  ToolCategoryConfig,
  ToolLifecycleConfig,

  // Component props
  VitalToolCardBaseProps,
  VitalToolCardActions,
  VitalToolCardProps,
  VitalToolCardGridProps,
  VitalToolCardListProps,
} from './types';

// ============================================================================
// CONSTANTS & UTILITIES
// Prefixed to avoid conflicts with ./assets exports
// ============================================================================

export {
  TOOL_CATEGORIES,
  DEFAULT_TOOL_CATEGORY,
  LIFECYCLE_BADGES as TOOL_LIFECYCLE_BADGES,
  HEALTH_STATUS_CONFIG,
  TOOL_TYPE_CONFIG,
  getCategoryConfig as getToolCategoryConfig,
  getLifecycleConfig as getToolLifecycleConfig,
  getHealthConfig as getToolHealthConfig,
  getToolTypeConfig,
} from './constants';
