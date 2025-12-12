/**
 * VITAL AI UI - Skills Components
 *
 * Comprehensive skill component library for AI-powered applications.
 *
 * Components:
 * - VitalSkillCard: Flexible card for displaying skills
 * - VitalSkillListItem: Horizontal list item for skills
 * - VitalSkillCardGrid: Responsive grid container
 * - VitalSkillCardList: Vertical list container
 *
 * @packageDocumentation
 */

// ============================================================================
// COMPONENTS
// ============================================================================

export { VitalSkillCard, default as SkillCard } from './VitalSkillCard';
export { VitalSkillListItem, default as SkillListItem } from './VitalSkillListItem';
export {
  VitalSkillCardGrid,
  VitalSkillCardList,
  VitalSkillCardSkeleton,
  VitalSkillListItemSkeleton,
} from './VitalSkillCardGrid';

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core types
  SkillImplementationType,
  SkillComplexityLevel,
  SkillCardVariant,

  // Data structures
  VitalSkill,
  SkillCategoryConfig,
  SkillComplexityConfig,

  // Component props
  VitalSkillCardBaseProps,
  VitalSkillCardActions,
  VitalSkillCardProps,
  VitalSkillCardGridProps,
  VitalSkillCardListProps,
} from './types';

export { getComplexityLevel } from './types';

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

export {
  SKILL_CATEGORIES,
  DEFAULT_CATEGORY,
  COMPLEXITY_BADGES,
  IMPLEMENTATION_BADGES,
  getCategoryConfig as getSkillCategoryConfig,
  getComplexityConfig as getSkillComplexityConfig,
  getImplementationConfig as getSkillImplementationConfig,
} from './constants';
