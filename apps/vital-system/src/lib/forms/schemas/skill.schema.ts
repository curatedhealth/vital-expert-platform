/**
 * Skill Entity Schema
 *
 * Zod schema for Skills in the VITAL platform.
 */
import { z } from 'zod';
import {
  nameSchema,
  displayNameSchema,
  descriptionSchema,
  statusSchema,
  tagsSchema,
  organizationContextSchema,
  agentAssociationSchema,
  metadataSchema,
  uuidSchema,
} from './common.schema';

// =============================================================================
// Skill Category & Type Enums
// =============================================================================

export const skillCategorySchema = z.enum([
  'analysis',
  'generation',
  'research',
  'compliance',
  'clinical',
  'regulatory',
  'documentation',
  'data-processing',
  'communication',
  'workflow',
]);

export const skillLevelSchema = z.enum([
  'foundational',
  'intermediate',
  'advanced',
  'expert',
]);

export const skillTypeSchema = z.enum([
  'core',
  'specialized',
  'domain-specific',
  'cross-functional',
]);

// =============================================================================
// Skill Proficiency Schema
// =============================================================================

export const skillProficiencySchema = z.object({
  level: skillLevelSchema,
  confidence_score: z.number().min(0).max(100).optional(),
  last_validated: z.string().datetime().optional(),
});

// =============================================================================
// Full Skill Schema
// =============================================================================

export const skillSchema = z.object({
  // Identity
  id: uuidSchema,
  name: nameSchema,
  slug: z.string().optional(),
  skill_code: z.string().max(50).optional(),
  display_name: displayNameSchema,
  description: descriptionSchema,

  // Classification
  category: skillCategorySchema,
  type: skillTypeSchema.optional(),
  level: skillLevelSchema.default('foundational'),

  // Proficiency
  proficiency: skillProficiencySchema.optional(),

  // Organization context
  ...organizationContextSchema.shape,

  // Agent association
  ...agentAssociationSchema.shape,

  // Prerequisites
  prerequisites: z.array(z.string()).default([]),
  related_skills: z.array(z.string()).default([]),

  // Tags
  tags: tagsSchema,

  // Configuration
  is_learnable: z.boolean().default(true),
  is_certifiable: z.boolean().default(false),
  estimated_learning_hours: z.number().min(0).optional(),

  // Status
  status: statusSchema,
  is_active: z.boolean().default(true),

  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),

  // Metadata
  metadata: metadataSchema,
});

// =============================================================================
// Form Schemas
// =============================================================================

export const createSkillSchema = skillSchema.omit({
  id: true,
  slug: true,
  created_at: true,
  updated_at: true,
});

export const editSkillSchema = skillSchema.partial().required({
  id: true,
  name: true,
});

// =============================================================================
// Type Exports
// =============================================================================

export type Skill = z.infer<typeof skillSchema>;
export type CreateSkillData = z.infer<typeof createSkillSchema>;
export type EditSkillData = z.infer<typeof editSkillSchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type SkillLevel = z.infer<typeof skillLevelSchema>;
export type SkillType = z.infer<typeof skillTypeSchema>;

// =============================================================================
// Options Arrays for UI
// =============================================================================

export const SKILL_CATEGORY_OPTIONS = skillCategorySchema.options;
export const SKILL_LEVEL_OPTIONS = skillLevelSchema.options;
export const SKILL_TYPE_OPTIONS = skillTypeSchema.options;
