/**
 * VITAL Protocol - Common Schemas
 * 
 * Shared schema primitives used across all other schemas.
 */

import { z } from 'zod';

// ============================================================================
// IDENTIFIERS
// ============================================================================

/**
 * UUID identifier
 */
export const UUIDSchema = z.string().uuid();

/**
 * Tenant identifier (always required for multi-tenancy)
 */
export const TenantIdSchema = UUIDSchema.describe('Tenant identifier for multi-tenancy isolation');

/**
 * User identifier
 */
export const UserIdSchema = UUIDSchema.describe('User identifier');

// ============================================================================
// TIMESTAMPS
// ============================================================================

/**
 * ISO 8601 datetime string
 */
export const DateTimeSchema = z.string().datetime().describe('ISO 8601 datetime');

/**
 * Standard timestamp fields
 */
export const TimestampFieldsSchema = z.object({
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

// ============================================================================
// PAGINATION
// ============================================================================

/**
 * Pagination request parameters
 */
export const PaginationRequestSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Pagination response metadata
 */
export const PaginationResponseSchema = z.object({
  page: z.number().int(),
  pageSize: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

// ============================================================================
// API RESPONSES
// ============================================================================

/**
 * Standard success response wrapper
 */
export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.record(z.unknown()).optional(),
  });

/**
 * Standard error response
 */
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
});

/**
 * Paginated response wrapper
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    pagination: PaginationResponseSchema,
  });

// ============================================================================
// POSITION & VIEWPORT (for React Flow)
// ============================================================================

/**
 * 2D position
 */
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

/**
 * Viewport state for React Flow canvas
 */
export const ViewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number().min(0.1).max(4).default(1),
});

// ============================================================================
// METADATA
// ============================================================================

/**
 * Generic metadata object
 */
export const MetadataSchema = z.record(z.unknown());

/**
 * Version string (semver)
 */
export const VersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0');

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type UUID = z.infer<typeof UUIDSchema>;
export type TenantId = z.infer<typeof TenantIdSchema>;
export type UserId = z.infer<typeof UserIdSchema>;
export type DateTime = z.infer<typeof DateTimeSchema>;
export type TimestampFields = z.infer<typeof TimestampFieldsSchema>;
export type PaginationRequest = z.infer<typeof PaginationRequestSchema>;
export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type Viewport = z.infer<typeof ViewportSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type Version = z.infer<typeof VersionSchema>;
