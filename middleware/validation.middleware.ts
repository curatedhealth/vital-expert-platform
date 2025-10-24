/**
 * Request Validation Middleware using Zod
 * Validates and sanitizes API request data
 */

import { NextRequest, NextResponse } from 'next/server';
import { z, ZodSchema, ZodError } from 'zod';
import { createErrorResponse, ErrorCodes } from './error-handler.middleware';

/**
 * Validate request body against Zod schema
 */
export function withValidation<T extends ZodSchema>(
  handler: (request: NextRequest, validatedData: z.infer<T>) => Promise<NextResponse>,
  schema: T,
  options?: {
    validateQuery?: boolean;
    validateParams?: boolean;
  }
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      let dataToValidate: any;

      // Validate request body for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          dataToValidate = await request.json();
        } catch (error) {
          return createErrorResponse({
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Invalid JSON in request body',
            details: error instanceof Error ? error.message : undefined
          }, 400);
        }
      }

      // Validate query parameters
      if (options?.validateQuery) {
        const url = new URL(request.url);
        const queryParams: any = {};
        url.searchParams.forEach((value, key) => {
          // Try to parse numbers and booleans
          if (value === 'true') queryParams[key] = true;
          else if (value === 'false') queryParams[key] = false;
          else if (!isNaN(Number(value)) && value !== '') queryParams[key] = Number(value);
          else queryParams[key] = value;
        });
        dataToValidate = { ...dataToValidate, ...queryParams };
      }

      // Validate URL parameters
      if (options?.validateParams && context?.params) {
        dataToValidate = { ...dataToValidate, ...context.params };
      }

      // Validate against schema
      const validatedData = schema.parse(dataToValidate);

      // Call handler with validated data
      return handler(request, validatedData);

    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return createErrorResponse({
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Request validation failed',
          details: formatZodError(error)
        }, 400);
      }

      // Re-throw other errors to be caught by error boundary
      throw error;
    }
  };
}

/**
 * Format Zod errors for user-friendly response
 */
function formatZodError(error: ZodError): any {
  return {
    errors: error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
      ...(err.code === 'invalid_type' && {
        expected: (err as any).expected,
        received: (err as any).received
      })
    })),
    count: error.errors.length
  };
}

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

/**
 * Common field validators
 */
export const CommonFields = {
  // ID fields
  id: z.string().uuid('Invalid UUID format'),
  optionalId: z.string().uuid().optional(),

  // Strings
  nonEmptyString: z.string().min(1, 'This field is required'),
  email: z.string().email('Invalid email address'),
  url: z.string().url('Invalid URL format').optional(),

  // Numbers
  positiveInt: z.number().int().positive('Must be a positive integer'),
  nonNegativeInt: z.number().int().nonnegative('Must be non-negative'),
  percentage: z.number().min(0).max(100, 'Must be between 0 and 100'),

  // Dates
  isoDate: z.string().datetime('Invalid ISO date format'),
  futureDate: z.string().datetime().refine(
    (date) => new Date(date) > new Date(),
    'Date must be in the future'
  ),

  // Arrays
  nonEmptyArray: <T extends z.ZodTypeAny>(schema: T) =>
    z.array(schema).min(1, 'Array must contain at least one item'),

  // Pagination
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  limit: z.number().int().positive().max(1000).default(50),
  offset: z.number().int().nonnegative().default(0),
};

// ============================================================================
// AGENT-SPECIFIC SCHEMAS
// ============================================================================

/**
 * Agent creation request schema
 */
export const AgentCreationSchema = z.object({
  name: z.string()
    .min(1, 'Agent name is required')
    .max(100, 'Agent name too long')
    .regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens'),

  display_name: z.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name too long'),

  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description too long'),

  system_prompt: z.string()
    .min(50, 'System prompt too short')
    .max(5000, 'System prompt too long'),

  model: z.string()
    .regex(/^(gpt-|claude-|gemini-)/, 'Invalid model format')
    .default('gpt-4-turbo-preview'),

  temperature: z.number()
    .min(0, 'Temperature must be >= 0')
    .max(2, 'Temperature must be <= 2')
    .default(0.7),

  max_tokens: z.number()
    .int()
    .min(100)
    .max(16000)
    .default(2000),

  capabilities: z.array(z.string()).optional(),
  knowledge_domains: z.array(z.string()).optional(),
  business_function: z.string().optional(),
  role: z.string().optional(),

  rag_enabled: z.boolean().default(false),
  status: z.enum(['development', 'testing', 'active', 'deprecated', 'archived']).default('development'),
  tier: z.enum(['1', '2', '3']).optional(),
});

/**
 * Agent update request schema
 */
export const AgentUpdateSchema = AgentCreationSchema.partial().extend({
  id: CommonFields.id,
});

/**
 * Agent query request schema
 */
export const AgentQuerySchema = z.object({
  status: z.enum(['development', 'testing', 'active', 'deprecated', 'archived']).optional(),
  tier: z.enum(['1', '2', '3']).optional(),
  business_function: z.string().optional(),
  search: z.string().optional(),
  page: CommonFields.page,
  pageSize: CommonFields.pageSize,
});

// ============================================================================
// CHAT-SPECIFIC SCHEMAS
// ============================================================================

/**
 * Chat message request schema
 */
export const ChatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(4000, 'Message too long'),

  agent: z.object({
    id: CommonFields.id,
    name: z.string(),
    model: z.string().optional(),
  }).or(z.null()),

  model: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),

  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).default([]),

  ragEnabled: z.boolean().default(false),
  sessionId: z.string().optional(),
  automaticRouting: z.boolean().default(false),
  useIntelligentRouting: z.boolean().default(false),
});

/**
 * Panel orchestration request schema
 */
export const PanelOrchestrationSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(4000, 'Message too long'),

  panel: z.object({
    members: z.array(z.object({
      agent: z.object({
        id: CommonFields.id,
        name: z.string(),
        role: z.string().optional(),
      })
    })).min(1, 'Panel must have at least one member'),
  }),

  context: z.any().optional(),
  mode: z.enum(['parallel', 'sequential', 'consensus']).default('parallel'),
});

// ============================================================================
// KNOWLEDGE MANAGEMENT SCHEMAS
// ============================================================================

/**
 * Document upload schema
 */
export const DocumentUploadSchema = z.object({
  file: z.any(), // File validation handled separately
  agent_id: CommonFields.optionalId,
  source_type: z.enum(['pdf', 'url', 'text', 'document']),
  metadata: z.record(z.any()).optional(),
});

/**
 * RAG search schema
 */
export const RAGSearchSchema = z.object({
  query: z.string()
    .min(1, 'Query is required')
    .max(500, 'Query too long'),

  agent_id: CommonFields.optionalId,
  limit: z.number().int().positive().max(50).default(10),
  threshold: z.number().min(0).max(1).default(0.7),
  filters: z.record(z.any()).optional(),
});

// ============================================================================
// PROMPT MANAGEMENT SCHEMAS
// ============================================================================

/**
 * Prompt generation schema
 */
export const PromptGenerationSchema = z.object({
  selected_capabilities: z.array(CommonFields.id)
    .min(1, 'At least one capability required'),

  agent_type: z.string().optional(),
  business_function: z.string().optional(),
  domain_expertise: z.array(z.string()).optional(),
  compliance_requirements: z.array(z.string()).optional(),

  include_pharma_protocol: z.boolean().default(false),
  include_verify_protocol: z.boolean().default(false),
});

// ============================================================================
// PAGINATION SCHEMA
// ============================================================================

export const PaginationSchema = z.object({
  page: CommonFields.page,
  pageSize: CommonFields.pageSize,
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ============================================================================
// FILE UPLOAD VALIDATION
// ============================================================================

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 10, allowedTypes = ['application/pdf', 'text/plain'] } = options;

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
}

// ============================================================================
// SANITIZATION HELPERS
// ============================================================================

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize HTML content
 */
export function sanitizeHTML(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
}

/**
 * Validate and sanitize URL
 */
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}
