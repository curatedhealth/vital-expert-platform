/**
 * Common Schema Definitions
 *
 * Reusable schema fragments for shared fields across entities.
 */
import { z } from 'zod';

// =============================================================================
// Base Fields
// =============================================================================

/** UUID format validation */
export const uuidSchema = z.string().uuid().optional();

/** Slug format - lowercase, hyphens, no special chars */
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be less than 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only');

/** Name field - required, min 2 chars */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(200, 'Name must be less than 200 characters');

/** Display name - optional, more lenient */
export const displayNameSchema = z.string().max(200).optional();

/** Description field */
export const descriptionSchema = z.string().max(2000).optional();

/** Version string - semver-like */
export const versionSchema = z
  .string()
  .regex(/^\d+\.\d+(\.\d+)?$/, 'Version must be in format X.Y or X.Y.Z')
  .default('1.0');

// =============================================================================
// Organizational Context
// =============================================================================

/** Organization context - Function, Department, Role hierarchy */
export const organizationContextSchema = z.object({
  function_id: uuidSchema,
  function_name: z.string().optional(),
  department_id: uuidSchema,
  department_name: z.string().optional(),
  role_id: uuidSchema,
  role_name: z.string().optional(),
});

// =============================================================================
// Status & Flags
// =============================================================================

/** Common status values */
export const statusSchema = z.enum(['active', 'draft', 'archived', 'deprecated']).default('active');

/** Boolean flags with defaults */
export const flagsSchema = z.object({
  is_active: z.boolean().default(true),
  expert_validated: z.boolean().default(false),
  rag_enabled: z.boolean().default(false),
});

// =============================================================================
// Tags & Arrays
// =============================================================================

/** Tags array - comma-separated input transforms to array */
export const tagsSchema = z.array(z.string().min(1).max(50)).default([]);

/** Variables array */
export const variablesSchema = z.array(z.string().min(1).max(100)).default([]);

// =============================================================================
// PRISM Suite Context
// =============================================================================

/** PRISM Suite selection */
export const suiteContextSchema = z.object({
  suite: z.string().optional(),
  suite_id: uuidSchema,
  suite_name: z.string().optional(),
  sub_suite: z.string().optional(),
  sub_suite_id: uuidSchema,
  sub_suite_name: z.string().optional(),
});

// =============================================================================
// Agent Association
// =============================================================================

/** Link to an AI agent */
export const agentAssociationSchema = z.object({
  agent_id: uuidSchema,
  agent_name: z.string().optional(),
});

// =============================================================================
// Validation Context
// =============================================================================

/** Expert validation details */
export const validationContextSchema = z.object({
  expert_validated: z.boolean().default(false),
  validation_date: z.string().datetime().optional(),
  validator_name: z.string().max(200).optional(),
  validator_credentials: z.string().max(500).optional(),
});

// =============================================================================
// Metadata
// =============================================================================

/** Generic metadata object */
export const metadataSchema = z.record(z.unknown()).optional();

// =============================================================================
// Type Exports
// =============================================================================

export type OrganizationContext = z.infer<typeof organizationContextSchema>;
export type SuiteContext = z.infer<typeof suiteContextSchema>;
export type AgentAssociation = z.infer<typeof agentAssociationSchema>;
export type ValidationContext = z.infer<typeof validationContextSchema>;
export type Status = z.infer<typeof statusSchema>;
