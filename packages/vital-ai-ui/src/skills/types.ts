/**
 * VITAL AI UI - Skill Types
 *
 * Type definitions for skill-related components.
 * Aligns with the dh_skill database schema.
 */

import type { ReactNode } from 'react';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Skill implementation types
 */
export type SkillImplementationType = 'prompt' | 'tool' | 'workflow' | 'agent_graph';

/**
 * Skill complexity levels (derived from complexity_score)
 */
export type SkillComplexityLevel = 'basic' | 'intermediate' | 'advanced' | 'expert';

/**
 * Skill card display variants
 */
export type SkillCardVariant = 'minimal' | 'compact' | 'rich';

// ============================================================================
// DATA STRUCTURES
// ============================================================================

/**
 * Core skill data structure
 * Matches the dh_skill database table
 */
export interface VitalSkill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  implementation_type: SkillImplementationType;
  implementation_ref?: string;
  complexity_score: number; // 1-10
  complexity_level?: SkillComplexityLevel; // auto-derived
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  tenant_id?: string;
}

/**
 * Skill category configuration
 */
export interface SkillCategoryConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

/**
 * Skill complexity badge configuration
 */
export interface SkillComplexityConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Base props shared across all skill card variants
 */
export interface VitalSkillCardBaseProps {
  /** The skill to display */
  skill: VitalSkill;
  /** Card variant */
  variant?: SkillCardVariant;
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
 * Action callbacks for skill cards
 */
export interface VitalSkillCardActions {
  /** Called when the card is clicked */
  onClick?: (skill: VitalSkill) => void;
  /** Called when edit action is triggered (admin) */
  onEdit?: (skill: VitalSkill) => void;
  /** Called when delete action is triggered (admin) */
  onDelete?: (skill: VitalSkill) => void;
  /** Called when the skill is added to an agent/workflow */
  onAddToAgent?: (skill: VitalSkill) => void;
  /** Called when viewing full details */
  onViewDetails?: (skill: VitalSkill) => void;
}

/**
 * Full props for VitalSkillCard
 */
export interface VitalSkillCardProps extends VitalSkillCardBaseProps, VitalSkillCardActions {
  /** Show compact mode (fewer details) */
  compact?: boolean;
  /** Show action buttons */
  showActions?: boolean;
}

/**
 * Props for VitalSkillCardGrid
 */
export interface VitalSkillCardGridProps {
  /** Array of skills to display */
  skills: VitalSkill[];
  /** Card variant to use */
  variant?: SkillCardVariant;
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
  onSkillClick?: (skill: VitalSkill) => void;
  onEdit?: (skill: VitalSkill) => void;
  onDelete?: (skill: VitalSkill) => void;
}

/**
 * Props for VitalSkillCardList
 */
export interface VitalSkillCardListProps extends Omit<VitalSkillCardGridProps, 'columns'> {
  /** Show dividers between items */
  showDividers?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert complexity score (1-10) to complexity level
 */
export function getComplexityLevel(score: number): SkillComplexityLevel {
  if (score <= 3) return 'basic';
  if (score <= 5) return 'intermediate';
  if (score <= 7) return 'advanced';
  return 'expert';
}
