/**
 * VITAL AI UI - Agent & Collaboration Components
 * 
 * Comprehensive agent component library for AI-powered healthcare applications.
 * 
 * Components:
 * - VitalAgentCard: Unified card with minimal/compact/rich variants
 * - VitalAgentAvatar: Agent avatar with level styling
 * - VitalLevelBadge: Level indicator (L1-L5)
 * - VitalAgentStatus: Status badges and indicators
 * - VitalAgentActions: Action button groups
 * - VitalAgentMetrics: Performance metrics display
 * - VitalTeamView: Multi-agent team display
 * - VitalExpertAgentCard: Detailed expert agent card
 * - VitalToolExecutionCard: Tool execution status
 * 
 * @packageDocumentation
 */

// ============================================================================
// UNIFIED AGENT CARD SYSTEM
// ============================================================================

// Main card component and variants
export {
  VitalAgentCard,
  VitalAgentCardMinimal,
  VitalAgentCardCompact,
  VitalAgentCardRich,
  VitalAgentCardSkeleton,
  VitalAgentCardGridSkeleton,
  VitalAgentCardListSkeleton,
  VitalAgentCardMinimalSkeleton,
  VitalAgentCardCompactSkeleton,
  VitalAgentCardRichSkeleton,
} from './VitalAgentCard';

// ============================================================================
// ATOMIC COMPONENTS
// ============================================================================

// Avatar
export {
  VitalAgentAvatar,
  VitalAgentAvatarGroup,
} from './VitalAgentAvatar';

// Level Badge
export {
  VitalLevelBadge,
  VitalLevelBadgeGroup,
  VitalLevelIndicator,
} from './VitalLevelBadge';

// Status
export {
  VitalAgentStatus,
  VitalAgentStatusBadge,
  VitalAgentAvailabilityDot,
} from './VitalAgentStatus';

// Actions
export {
  VitalAgentActions,
  VitalQuickActions,
  ActionButton,
} from './VitalAgentActions';

// Metrics
export {
  VitalAgentMetrics,
  VitalAgentRating,
  MetricItem,
} from './VitalAgentMetrics';

// ============================================================================
// LAYOUT CONTAINERS
// ============================================================================

// Grid and List containers
export {
  VitalAgentCardGrid,
  VitalAgentCardList,
} from './VitalAgentCardGrid';

// ============================================================================
// LEGACY COMPONENTS (maintained for compatibility)
// ============================================================================

// Original implementations - will be deprecated
export { VitalTeamView, default as TeamView } from './VitalTeamView';
export { default as VitalExpertAgentCard } from './VitalExpertAgentCard';
export { default as VitalToolExecutionCard } from './VitalToolExecutionCard';

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core types
  AgentLevelNumber,
  AgentLevelCode,
  AgentLevelName,
  AgentStatus,
  AgentAvailability,
  DomainExpertise,
  ProficiencyLevel,
  
  // Card variants
  AgentCardVariant,
  ExpansionDirection,
  ResponsiveVariants,
  
  // Data structures
  AgentLevelInfo,
  AgentCapability,
  AgentKnowledgeDomain,
  AgentTool,
  AgentMetrics,
  AgentPromptStarter,
  VitalAgent,
  
  // Component props
  VitalAgentCardProps,
  VitalAgentCardBaseProps,
  VitalAgentCardActions,
  VitalAgentCardPermissions,
  VitalAgentCardExpansionProps,
  VitalAgentCardMinimalProps,
  VitalAgentCardCompactProps,
  VitalAgentCardRichProps,
  VitalAgentCardSkeletonProps,
  VitalAgentCardGridProps,
  VitalAgentCardListProps,
} from './types';

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

export {
  // Level configuration
  AGENT_LEVEL_COLORS,
  LEVEL_ICONS,
  
  // Status configuration
  STATUS_COLORS,
  AVAILABILITY_COLORS,
  
  // Card configuration
  CARD_VARIANT_CONFIG,
  DEFAULT_RESPONSIVE_VARIANTS,
  GRID_CONFIG,
  
  // Animation presets
  CARD_ANIMATIONS,
  EXPANSION_ANIMATIONS,
  
  // Avatar configuration
  AVATAR_PATHS,
  BUSINESS_FUNCTION_AVATAR_MAP,
  
  // Helper functions
  getAgentLevelColor,
  getAgentLevelIcon,
  getStatusColor,
  getAvailabilityColor,
  getCardVariantConfig,
  canLevelSpawn,
  matchBusinessFunctionCategory,
  getAvatarHash,
  getVitalAvatarPath,
  getSuperAgentAvatarPath,
} from './constants';

// Type helper functions
export {
  getAgentLevelNumber,
  canAgentSpawn,
  getAgentCapabilities,
  getAgentKnowledgeDomains,
} from './types';
