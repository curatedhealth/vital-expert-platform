/**
 * Skills Feature Components
 *
 * Export all skill-related components for use across the application.
 */

// Legacy modals (for backward compatibility)
export {
  SkillEditModal,
  SkillDeleteModal,
  DEFAULT_SKILL,
  generateSlug,
  type Skill as LegacySkill,
  type SkillEditModalProps,
  type SkillDeleteModalProps,
} from './SkillModals';

// V2 modals using Vital Forms Library
export {
  SkillEditModalV2,
  SkillDeleteModalV2,
  SkillBatchDeleteModal,
  DEFAULT_SKILL_VALUES,
} from './SkillModalsV2';

// Re-export types from schema
export type { Skill, SkillCategory, SkillLevel, SkillType } from '@/lib/forms/schemas';
export {
  SKILL_CATEGORY_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  SKILL_TYPE_OPTIONS,
} from '@/lib/forms/schemas';
