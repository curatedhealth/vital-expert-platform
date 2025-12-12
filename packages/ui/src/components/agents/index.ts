/**
 * Agent Components - @vital/ui
 *
 * Consolidated agent-related UI components for the VITAL platform.
 * All components follow Brand Guidelines V6.
 */

// Action Buttons
export {
  CreateButton,
  EditButton,
  DeleteButton,
  DuplicateButton,
  ViewButton,
  AddButton,
  SettingsButton,
  RefreshButton,
  ActivateButton,
  DeactivateButton,
  ImportButton,
  ExportButton,
  ActionMenu,
  ActionButtonGroup,
  type ActionButtonVariant,
  type ActionButtonSize,
  type ActionButtonProps,
  type CreateButtonProps,
  type DeleteButtonProps,
  type AddButtonProps,
  type ActionMenuItem,
  type ActionMenuProps,
  type ActionButtonGroupProps,
} from './action-buttons';

// Agent Status Icon
export {
  AgentStatusIcon,
  getStatusBadgeVariant,
  type AgentStatusType,
  type AgentStatusIconProps,
} from './agent-status-icon';

// Agent Cards
export {
  LevelBadge,
  TierBadge,
  AgentAvatarWithStatus,
  AgentCardMinimal,
  AgentCardCompact,
  AgentCardDetailed,
  AgentCardSelectable,
  type AgentCardData,
  type AgentAvatarWithStatusProps,
  type AgentCardMinimalProps,
  type AgentCardCompactProps,
  type AgentCardDetailedProps,
  type AgentCardSelectableProps,
} from './agent-cards';

// Org Filters
export {
  MultiSelectFilter,
  FunctionFilter,
  DepartmentFilter,
  RoleFilter,
  AgentLevelFilter,
  OrgFilterBar,
  type FilterOption,
  type MultiSelectFilterProps,
  type FunctionFilterProps,
  type DepartmentFilterProps,
  type RoleFilterProps,
  type AgentLevelNumber,
  type AgentLevelFilterProps,
  type OrgFilterBarProps,
} from './org-filters';

// Business Filters
export {
  IndustryFilter,
  TenantFilter,
  StatusFilter,
  TierFilter,
  BusinessFilterBar,
  INDUSTRY_OPTIONS,
  STATUS_OPTIONS,
  TIER_OPTIONS,
  type SelectOption,
  type IndustryFilterProps,
  type TenantOption,
  type TenantFilterProps,
  type AgentStatus,
  type StatusFilterProps,
  type AgentTier,
  type TierFilterProps,
  type BusinessFilterBarProps,
} from './business-filters';

// Agent Stats Card
export {
  AgentStatsCard,
  type AgentStats,
  type AgentStatsCardProps,
} from './agent-stats-card';

// Agent Quick Filters
export {
  AgentQuickFilters,
  type QuickStatusFilter,
  type QuickLevelFilter,
  /** @deprecated Use QuickLevelFilter */
  type QuickTierFilter,
  type ViewMode,
  type AgentQuickFiltersProps,
} from './agent-quick-filters';

// Agent Lifecycle Card
export {
  AgentLifecycleCard,
  type AgentLifecycleData,
  type AgentLifecycleCardProps,
} from './agent-lifecycle-card';
