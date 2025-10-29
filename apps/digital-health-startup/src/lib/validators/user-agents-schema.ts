/**
 * Zod Validation Schemas for User Agents
 * 
 * Provides runtime validation for user agent operations
 */

import { z } from 'zod';

/**
 * UUID validation helper
 */
const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * User Agent Create Schema
 */
export const UserAgentCreateSchema = z.object({
  userId: uuidSchema,
  agentId: uuidSchema,
  originalAgentId: uuidSchema.optional(),
  isUserCopy: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

export type UserAgentCreate = z.infer<typeof UserAgentCreateSchema>;

/**
 * User Agent Bulk Create Schema
 */
export const UserAgentBulkCreateSchema = z.object({
  userId: uuidSchema,
  agents: z.array(
    z.object({
      agentId: uuidSchema,
      originalAgentId: uuidSchema.optional(),
      isUserCopy: z.boolean().default(false),
      metadata: z.record(z.any()).optional(),
    })
  ).min(1).max(100), // Limit batch size
});

export type UserAgentBulkCreate = z.infer<typeof UserAgentBulkCreateSchema>;

/**
 * Agent Search Query Schema
 */
export const AgentSearchQuerySchema = z.object({
  query: z.string().min(1).max(4000).optional(),
  embedding: z.array(z.number()).length(3072).optional(),
  topK: z.number().int().min(1).max(50).default(10),
  minSimilarity: z.number().min(0).max(1).default(0.7),
  filters: z
    .object({
      tier: z.number().int().min(1).max(3).optional(),
      status: z.enum(['active', 'testing', 'development', 'inactive']).optional(),
      business_function: z.string().optional(),
      knowledge_domain: z.string().optional(),
      capabilities: z.array(z.string()).optional(),
    })
    .optional(),
});

export type AgentSearchQuery = z.infer<typeof AgentSearchQuerySchema>;

/**
 * Migration Schema
 */
export const MigrationSchema = z.object({
  userId: uuidSchema,
  source: z.enum(['localStorage', 'legacy_db']).default('localStorage'),
  agentIds: z.array(uuidSchema).optional(), // If provided, only migrate these
  dryRun: z.boolean().default(false),
});

export type MigrationRequest = z.infer<typeof MigrationSchema>;

/**
 * Runtime validation functions
 */

/**
 * Validate user agent create request
 */
export function validateUserAgentCreate(
  data: unknown
): UserAgentCreate {
  return UserAgentCreateSchema.parse(data);
}

/**
 * Validate bulk user agent create request
 */
export function validateUserAgentBulkCreate(
  data: unknown
): UserAgentBulkCreate {
  return UserAgentBulkCreateSchema.parse(data);
}

/**
 * Validate agent search query
 */
export function validateAgentSearchQuery(
  data: unknown
): AgentSearchQuery {
  return AgentSearchQuerySchema.parse(data);
}

/**
 * Validate migration request
 */
export function validateMigrationRequest(
  data: unknown
): MigrationRequest {
  return MigrationSchema.parse(data);
}

/**
 * Safe validation with error handling
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Get validation error messages
 */
export function getValidationErrors(
  error: z.ZodError
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return errors;
}
