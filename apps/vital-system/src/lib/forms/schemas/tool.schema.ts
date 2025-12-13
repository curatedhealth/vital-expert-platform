/**
 * Tool Entity Schema
 *
 * Zod schema for Tools used by AI agents in the VITAL platform.
 */
import { z } from 'zod';
import {
  nameSchema,
  displayNameSchema,
  descriptionSchema,
  statusSchema,
  tagsSchema,
  organizationContextSchema,
  metadataSchema,
  uuidSchema,
  versionSchema,
} from './common.schema';

// =============================================================================
// Tool Category & Type Enums
// =============================================================================

export const toolCategorySchema = z.enum([
  'data-retrieval',
  'data-processing',
  'analysis',
  'generation',
  'integration',
  'communication',
  'workflow',
  'monitoring',
  'security',
  'utility',
]);

export const toolTypeSchema = z.enum([
  'api',
  'function',
  'external-service',
  'database',
  'file-system',
  'browser',
  'messaging',
  'custom',
]);

export const executionModeSchema = z.enum([
  'sync',
  'async',
  'streaming',
]);

// =============================================================================
// Tool Parameters Schema
// =============================================================================

export const toolParameterSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  description: z.string().optional(),
  required: z.boolean().default(false),
  default: z.unknown().optional(),
  enum: z.array(z.string()).optional(),
});

export const toolParametersSchema = z.array(toolParameterSchema).default([]);

// =============================================================================
// Tool Configuration Schema
// =============================================================================

export const toolConfigSchema = z.object({
  timeout_ms: z.number().min(0).max(300000).default(30000),
  retry_count: z.number().min(0).max(5).default(3),
  rate_limit_per_minute: z.number().min(0).optional(),
  requires_confirmation: z.boolean().default(false),
  is_dangerous: z.boolean().default(false),
});

// =============================================================================
// Full Tool Schema
// =============================================================================

export const toolSchema = z.object({
  // Identity
  id: uuidSchema,
  name: nameSchema,
  slug: z.string().optional(),
  tool_code: z.string().max(50).optional(),
  display_name: displayNameSchema,
  description: descriptionSchema,

  // Classification
  category: toolCategorySchema,
  type: toolTypeSchema.default('function'),
  execution_mode: executionModeSchema.default('sync'),

  // Parameters
  parameters: toolParametersSchema,
  return_type: z.string().optional(),
  return_schema: z.record(z.unknown()).optional(),

  // Configuration
  config: toolConfigSchema.optional(),

  // Implementation
  handler_path: z.string().optional(),
  api_endpoint: z.string().url().optional(),
  openapi_spec: z.string().optional(),

  // Organization context
  ...organizationContextSchema.shape,

  // Access control
  allowed_agents: z.array(z.string()).default([]),
  required_permissions: z.array(z.string()).default([]),

  // Tags
  tags: tagsSchema,

  // Version
  version: versionSchema,

  // Status
  status: statusSchema,
  is_active: z.boolean().default(true),
  is_public: z.boolean().default(false),

  // Usage tracking
  usage_count: z.number().default(0),
  avg_execution_time_ms: z.number().optional(),

  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),

  // Metadata
  metadata: metadataSchema,
});

// =============================================================================
// Form Schemas
// =============================================================================

export const createToolSchema = toolSchema.omit({
  id: true,
  slug: true,
  usage_count: true,
  avg_execution_time_ms: true,
  created_at: true,
  updated_at: true,
});

export const editToolSchema = toolSchema.partial().required({
  id: true,
  name: true,
});

// =============================================================================
// Type Exports
// =============================================================================

export type Tool = z.infer<typeof toolSchema>;
export type CreateToolData = z.infer<typeof createToolSchema>;
export type EditToolData = z.infer<typeof editToolSchema>;
export type ToolCategory = z.infer<typeof toolCategorySchema>;
export type ToolType = z.infer<typeof toolTypeSchema>;
export type ExecutionMode = z.infer<typeof executionModeSchema>;
export type ToolParameter = z.infer<typeof toolParameterSchema>;
export type ToolConfig = z.infer<typeof toolConfigSchema>;

// =============================================================================
// Options Arrays for UI
// =============================================================================

export const TOOL_CATEGORY_OPTIONS = toolCategorySchema.options;
export const TOOL_TYPE_OPTIONS = toolTypeSchema.options;
export const EXECUTION_MODE_OPTIONS = executionModeSchema.options;
export const PARAMETER_TYPE_OPTIONS = ['string', 'number', 'boolean', 'array', 'object'] as const;
