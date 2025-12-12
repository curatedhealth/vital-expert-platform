/**
 * VITAL AI UI - Tool Types
 *
 * Type definitions for tool-related components.
 * Aligns with the dh_tool database schema.
 */

import type { ReactNode } from 'react';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Tool implementation types
 */
export type ToolType = 'function' | 'api' | 'workflow' | 'mcp';

/**
 * Tool lifecycle stages
 */
export type ToolLifecycleStage = 'development' | 'testing' | 'staging' | 'production';

/**
 * Tool access levels
 */
export type ToolAccessLevel = 'public' | 'premium' | 'restricted';

/**
 * Tool health status
 */
export type ToolHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Tool card display variants
 */
export type ToolCardVariant = 'minimal' | 'compact' | 'rich';

// ============================================================================
// DATA STRUCTURES
// ============================================================================

/**
 * Core tool data structure
 * Matches the dh_tool database table
 */
export interface VitalTool {
  id: string;
  name: string;
  code?: string;
  description?: string;
  tool_description?: string;
  llm_description?: string;
  category?: string;
  category_parent?: string;
  tool_type?: ToolType;
  implementation_type?: string;
  function_name?: string;
  implementation_path?: string;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  documentation_url?: string;
  vendor?: string;
  version?: string;
  tags?: string[];
  capabilities?: string[];
  max_execution_time_seconds?: number;
  access_level?: ToolAccessLevel;
  is_active?: boolean;
  langgraph_compatible?: boolean;
  lifecycle_stage?: ToolLifecycleStage;
  health_status?: ToolHealthStatus;
  business_impact?: string;
  usage_guide?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  tenant_id?: string;
}

/**
 * Tool category configuration
 */
export interface ToolCategoryConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

/**
 * Tool lifecycle badge configuration
 */
export interface ToolLifecycleConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Base props shared across all tool card variants
 */
export interface VitalToolCardBaseProps {
  /** The tool to display */
  tool: VitalTool;
  /** Card variant */
  variant?: ToolCardVariant;
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
 * Action callbacks for tool cards
 */
export interface VitalToolCardActions {
  /** Called when the card is clicked */
  onClick?: (tool: VitalTool) => void;
  /** Called when edit action is triggered (admin) */
  onEdit?: (tool: VitalTool) => void;
  /** Called when delete action is triggered (admin) */
  onDelete?: (tool: VitalTool) => void;
  /** Called when the tool is tested/tried */
  onTest?: (tool: VitalTool) => void;
  /** Called when viewing full details */
  onViewDetails?: (tool: VitalTool) => void;
}

/**
 * Full props for VitalToolCard
 */
export interface VitalToolCardProps extends VitalToolCardBaseProps, VitalToolCardActions {
  /** Show compact mode (fewer details) */
  compact?: boolean;
  /** Show action buttons */
  showActions?: boolean;
}

/**
 * Props for VitalToolCardGrid
 */
export interface VitalToolCardGridProps {
  /** Array of tools to display */
  tools: VitalTool[];
  /** Card variant to use */
  variant?: ToolCardVariant;
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
  onToolClick?: (tool: VitalTool) => void;
  onEdit?: (tool: VitalTool) => void;
  onDelete?: (tool: VitalTool) => void;
}

/**
 * Props for VitalToolCardList
 */
export interface VitalToolCardListProps extends Omit<VitalToolCardGridProps, 'columns'> {
  /** Show dividers between items */
  showDividers?: boolean;
}
