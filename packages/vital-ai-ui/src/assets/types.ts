/**
 * VITAL AI UI - Asset Types
 *
 * Unified type definitions for all asset-related components.
 * Supports tools, skills, workflows, prompts, and other asset types.
 */

import type { ReactNode } from 'react';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Supported asset types
 */
export type AssetType = 'tool' | 'skill' | 'workflow' | 'prompt' | 'agent' | 'template';

/**
 * Asset lifecycle stages (common across types)
 */
export type AssetLifecycleStage = 'development' | 'testing' | 'staging' | 'production' | 'deprecated';

/**
 * Asset access levels
 */
export type AssetAccessLevel = 'public' | 'premium' | 'restricted' | 'private';

/**
 * Asset health status
 */
export type AssetHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Asset complexity levels (for skills/workflows)
 */
export type AssetComplexityLevel = 'basic' | 'intermediate' | 'advanced' | 'expert';

/**
 * Asset card display variants
 */
export type AssetCardVariant = 'minimal' | 'compact' | 'rich';

/**
 * Asset view modes
 */
export type AssetViewMode = 'grid' | 'list' | 'table';

// ============================================================================
// DATA STRUCTURES
// ============================================================================

/**
 * Base asset interface - common properties shared by all asset types
 */
export interface VitalAssetBase {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  category_parent?: string;
  is_active?: boolean;
  lifecycle_stage?: AssetLifecycleStage;
  access_level?: AssetAccessLevel;
  health_status?: AssetHealthStatus;
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  tenant_id?: string;
}

/**
 * Tool-specific properties
 */
export interface VitalToolAsset extends VitalAssetBase {
  asset_type: 'tool';
  code?: string;
  tool_description?: string;
  llm_description?: string;
  tool_type?: 'function' | 'api' | 'workflow' | 'mcp';
  implementation_type?: string;
  function_name?: string;
  implementation_path?: string;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  documentation_url?: string;
  vendor?: string;
  version?: string;
  capabilities?: string[];
  max_execution_time_seconds?: number;
  langgraph_compatible?: boolean;
  business_impact?: string;
  usage_guide?: string;
  notes?: string;
}

/**
 * Skill-specific properties
 */
export interface VitalSkillAsset extends VitalAssetBase {
  asset_type: 'skill';
  implementation_type?: 'prompt' | 'tool' | 'workflow' | 'agent_graph';
  implementation_ref?: string;
  complexity_score?: number; // 1-10
  complexity_level?: AssetComplexityLevel;
}

/**
 * Workflow-specific properties
 */
export interface VitalWorkflowAsset extends VitalAssetBase {
  asset_type: 'workflow';
  workflow_type?: 'sequential' | 'parallel' | 'branching' | 'loop';
  node_count?: number;
  estimated_duration_minutes?: number;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
}

/**
 * Prompt-specific properties
 */
export interface VitalPromptAsset extends VitalAssetBase {
  asset_type: 'prompt';
  prompt_type?: 'system' | 'user' | 'assistant' | 'function';
  template?: string;
  variables?: string[];
  model_compatibility?: string[];
  token_estimate?: number;
}

/**
 * Generic asset for unknown types
 */
export interface VitalGenericAsset extends VitalAssetBase {
  asset_type: AssetType;
  [key: string]: unknown;
}

/**
 * Union type for all asset types
 */
export type VitalAsset = VitalToolAsset | VitalSkillAsset | VitalWorkflowAsset | VitalPromptAsset | VitalGenericAsset;

/**
 * Asset category configuration
 */
export interface AssetCategoryConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

/**
 * Asset lifecycle badge configuration
 */
export interface AssetLifecycleConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
}

/**
 * Asset complexity badge configuration
 */
export interface AssetComplexityConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Base props shared across all asset card variants
 */
export interface VitalAssetCardBaseProps {
  /** The asset to display */
  asset: VitalAsset;
  /** Card variant */
  variant?: AssetCardVariant;
  /** Whether the card is selected */
  isSelected?: boolean;
  /** Whether user has admin permissions */
  isAdmin?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Animation delay for staggered entrance */
  animationDelay?: number;
}

/**
 * Action callbacks for asset cards
 */
export interface VitalAssetCardActions {
  /** Called when the card is clicked */
  onClick?: (asset: VitalAsset) => void;
  /** Called when edit action is triggered (admin) */
  onEdit?: (asset: VitalAsset) => void;
  /** Called when delete action is triggered (admin) */
  onDelete?: (asset: VitalAsset) => void;
  /** Called when the asset is tested/tried */
  onTest?: (asset: VitalAsset) => void;
  /** Called when viewing full details */
  onViewDetails?: (asset: VitalAsset) => void;
  /** Called when adding to agent/workflow */
  onAddTo?: (asset: VitalAsset) => void;
}

/**
 * Full props for VitalAssetCard
 */
export interface VitalAssetCardProps extends VitalAssetCardBaseProps, VitalAssetCardActions {
  /** Show compact mode (fewer details) */
  compact?: boolean;
  /** Show action buttons */
  showActions?: boolean;
  /** Show asset type badge */
  showTypeBadge?: boolean;
}

/**
 * Props for VitalAssetGrid
 */
export interface VitalAssetGridProps {
  /** Array of assets to display */
  assets: VitalAsset[];
  /** Card variant to use */
  variant?: AssetCardVariant;
  /** Loading state */
  loading?: boolean;
  /** Number of skeleton cards to show when loading */
  skeletonCount?: number;
  /** Whether user has admin permissions */
  isAdmin?: boolean;
  /** Grid columns configuration */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Additional CSS classes */
  className?: string;
  /** Action callbacks */
  onAssetClick?: (asset: VitalAsset) => void;
  onEdit?: (asset: VitalAsset) => void;
  onDelete?: (asset: VitalAsset) => void;
}

/**
 * Props for VitalAssetList
 */
export interface VitalAssetListProps extends Omit<VitalAssetGridProps, 'columns'> {
  /** Show dividers between items */
  showDividers?: boolean;
}

/**
 * Column definition for VitalAssetTable
 */
export interface AssetTableColumn {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (asset: VitalAsset) => ReactNode;
}

/**
 * Props for VitalAssetTable
 */
export interface VitalAssetTableProps {
  /** Array of assets to display */
  assets: VitalAsset[];
  /** Column definitions */
  columns?: AssetTableColumn[];
  /** Loading state */
  loading?: boolean;
  /** Number of skeleton rows to show when loading */
  skeletonCount?: number;
  /** Whether user has admin permissions */
  isAdmin?: boolean;
  /** Enable row selection */
  selectable?: boolean;
  /** Currently selected asset IDs */
  selectedIds?: string[];
  /** Called when selection changes */
  onSelectionChange?: (ids: string[]) => void;
  /** Sort state */
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Action callbacks */
  onAssetClick?: (asset: VitalAsset) => void;
  onEdit?: (asset: VitalAsset) => void;
  onDelete?: (asset: VitalAsset) => void;
}

/**
 * Kanban column definition
 */
export interface AssetKanbanColumn {
  id: string;
  title: string;
  filter: (asset: VitalAsset) => boolean;
  color?: string;
  bgColor?: string;
  maxItems?: number;
}

/**
 * Props for VitalAssetKanban
 */
export interface VitalAssetKanbanProps {
  /** Array of assets to display */
  assets: VitalAsset[];
  /** Column definitions - defaults to lifecycle stages */
  columns?: AssetKanbanColumn[];
  /** Card variant to use */
  variant?: AssetCardVariant;
  /** Loading state */
  loading?: boolean;
  /** Whether user has admin permissions */
  isAdmin?: boolean;
  /** Enable drag and drop */
  draggable?: boolean;
  /** Called when an asset is moved between columns */
  onAssetMove?: (assetId: string, fromColumn: string, toColumn: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Action callbacks */
  onAssetClick?: (asset: VitalAsset) => void;
  onEdit?: (asset: VitalAsset) => void;
  onDelete?: (asset: VitalAsset) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert complexity score (1-10) to complexity level
 */
export function getComplexityLevel(score: number): AssetComplexityLevel {
  if (score <= 3) return 'basic';
  if (score <= 5) return 'intermediate';
  if (score <= 7) return 'advanced';
  return 'expert';
}

/**
 * Type guard for tool assets
 */
export function isToolAsset(asset: VitalAsset): asset is VitalToolAsset {
  return asset.asset_type === 'tool';
}

/**
 * Type guard for skill assets
 */
export function isSkillAsset(asset: VitalAsset): asset is VitalSkillAsset {
  return asset.asset_type === 'skill';
}

/**
 * Type guard for workflow assets
 */
export function isWorkflowAsset(asset: VitalAsset): asset is VitalWorkflowAsset {
  return asset.asset_type === 'workflow';
}

/**
 * Type guard for prompt assets
 */
export function isPromptAsset(asset: VitalAsset): asset is VitalPromptAsset {
  return asset.asset_type === 'prompt';
}

/**
 * Get description from asset (handles different field names)
 */
export function getAssetDescription(asset: VitalAsset): string | undefined {
  if (isToolAsset(asset)) {
    return asset.tool_description || asset.description;
  }
  return asset.description;
}
