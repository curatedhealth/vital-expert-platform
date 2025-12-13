/**
 * Prompt Entity Schema
 *
 * Comprehensive Zod schema for PRISM Prompt Library entities.
 */
import { z } from 'zod';
import {
  nameSchema,
  displayNameSchema,
  descriptionSchema,
  versionSchema,
  statusSchema,
  tagsSchema,
  variablesSchema,
  organizationContextSchema,
  suiteContextSchema,
  agentAssociationSchema,
  validationContextSchema,
  metadataSchema,
  uuidSchema,
} from './common.schema';

// =============================================================================
// Complexity & Classification Enums
// =============================================================================

export const complexityLevelSchema = z
  .enum(['basic', 'intermediary', 'advanced', 'expert'])
  .default('basic');

export const domainSchema = z.enum([
  'regulatory',
  'clinical',
  'safety',
  'market-access',
  'medical-affairs',
  'evidence',
  'medical-writing',
  'competitive-intelligence',
  'project-management',
  'digital-health',
]);

export const taskTypeSchema = z.enum([
  'analysis',
  'generation',
  'summarization',
  'extraction',
  'classification',
  'translation',
  'review',
  'planning',
  'research',
  'compliance',
  'documentation',
  'strategy',
]);

export const patternTypeSchema = z.enum([
  'chain-of-thought',
  'few-shot',
  'zero-shot',
  'react',
  'tree-of-thought',
  'self-consistency',
  'role-playing',
  'structured-output',
  'iterative-refinement',
  'multi-step',
]);

// =============================================================================
// Prompt Content Schema
// =============================================================================

export const promptContentSchema = z.object({
  prompt_starter: z.string().max(5000).optional(),
  detailed_prompt: z.string().max(20000).optional(),
  system_prompt: z.string().max(10000).optional(),
  user_template: z.string().max(10000).optional(),
  user_prompt_template: z.string().max(10000).optional(),
  content: z.string().max(20000).optional(),
});

// =============================================================================
// RAG Configuration Schema
// =============================================================================

export const ragConfigSchema = z.object({
  rag_enabled: z.boolean().default(false),
  rag_context_sources: z.array(z.string()).default([]),
});

// =============================================================================
// Full Prompt Schema
// =============================================================================

export const promptSchema = z.object({
  // Identity
  id: uuidSchema,
  name: nameSchema,
  slug: z.string().optional(),
  prompt_code: z.string().max(50).optional(),
  display_name: displayNameSchema,
  title: z.string().max(300).optional(),
  description: descriptionSchema,

  // Content
  ...promptContentSchema.shape,

  // Classification
  category: z.string().max(100).optional(),
  domain: domainSchema.optional(),
  task_type: taskTypeSchema.optional(),
  pattern_type: patternTypeSchema.optional(),
  complexity: complexityLevelSchema,
  complexity_level: complexityLevelSchema.optional(),

  // Organization context
  ...organizationContextSchema.shape,

  // Suite context
  ...suiteContextSchema.shape,

  // Agent association
  ...agentAssociationSchema.shape,

  // Tags & Variables
  tags: tagsSchema,
  variables: variablesSchema,

  // Validation
  ...validationContextSchema.shape,

  // RAG
  ...ragConfigSchema.shape,

  // Status
  status: statusSchema,
  is_active: z.boolean().default(true),
  is_user_created: z.boolean().optional(),

  // Version
  version: versionSchema,

  // Timestamps (read-only)
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().optional(),

  // Metadata
  metadata: metadataSchema,
});

// =============================================================================
// Form Schemas (for create/edit operations)
// =============================================================================

/** Schema for creating a new prompt */
export const createPromptSchema = promptSchema.omit({
  id: true,
  slug: true,
  created_at: true,
  updated_at: true,
  created_by: true,
});

/** Schema for editing an existing prompt */
export const editPromptSchema = promptSchema.partial().required({
  id: true,
  name: true,
});

// =============================================================================
// Type Exports
// =============================================================================

export type Prompt = z.infer<typeof promptSchema>;
export type CreatePromptData = z.infer<typeof createPromptSchema>;
export type EditPromptData = z.infer<typeof editPromptSchema>;
export type ComplexityLevel = z.infer<typeof complexityLevelSchema>;
export type Domain = z.infer<typeof domainSchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type PatternType = z.infer<typeof patternTypeSchema>;

// =============================================================================
// Options Arrays for UI
// =============================================================================

export const COMPLEXITY_OPTIONS = [
  { value: 'basic', label: 'Basic', description: 'Simple, straightforward prompts' },
  { value: 'intermediary', label: 'Intermediary', description: 'Moderate complexity with some structure' },
  { value: 'advanced', label: 'Advanced', description: 'Complex prompts with detailed instructions' },
  { value: 'expert', label: 'Expert', description: 'Highly specialized expert-level prompts' },
] as const;

export const DOMAIN_OPTIONS = domainSchema.options;
export const TASK_TYPE_OPTIONS = taskTypeSchema.options;
export const PATTERN_TYPE_OPTIONS = patternTypeSchema.options;

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
  { value: 'deprecated', label: 'Deprecated' },
] as const;
