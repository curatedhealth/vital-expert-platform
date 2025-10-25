/**
 * Example API Route with All Security Middleware
 *
 * This is an example showing how to use all the security middleware together:
 * - API Versioning
 * - Request/Response Logging
 * - Error Boundaries
 * - Rate Limiting
 * - RLS Validation
 * - Request Validation
 *
 * @example GET /api/v1/example?name=test
 * @example POST /api/v1/example with JSON body
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { withErrorBoundary } from '@/lib/api/error-boundary';
import { withVersioning, routeByVersion, type VersionedRequest } from '@/middleware/api-versioning.middleware';
import { createSuccessResponse } from '@/middleware/error-handler.middleware';
import { withLogging } from '@/middleware/logging.middleware';
import { withRateLimit } from '@/middleware/rate-limit.middleware';
import { withRLSValidation, type RLSContext } from '@/middleware/rls-validation.middleware';
import { withValidation } from '@/middleware/validation.middleware';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const QuerySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  limit: z.number().int().positive().max(100).default(10),
});

const BodySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

// ============================================================================
// VERSION-SPECIFIC HANDLERS
// ============================================================================

/**
 * Version 1 Handler
 */
async function handleV1GET(
  request: VersionedRequest & NextRequest,
  query: z.infer<typeof QuerySchema>,
  context: RLSContext
): Promise<NextResponse> {
  const { name, limit } = query;

  // Your business logic here
  const data = {
    message: 'Hello from API v1',
    version: request.apiVersion,
    user: {
      id: context.userId,
      email: context.userEmail,
    },
    query: { name, limit },
  };

  return createSuccessResponse(data);
}

/**
 * Version 1 POST Handler
 */
async function handleV1POST(
  request: VersionedRequest & NextRequest,
  body: z.infer<typeof BodySchema>,
  context: RLSContext
): Promise<NextResponse> {
  // Your business logic here
  const data = {
    message: 'Created successfully',
    version: request.apiVersion,
    user: {
      id: context.userId,
      email: context.userEmail,
    },
    created: {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
    },
  };

  return createSuccessResponse(data, { status: 201 });
}

// ============================================================================
// MIDDLEWARE COMPOSITION
// ============================================================================

/**
 * GET /api/v1/example
 *
 * Middleware chain (innermost to outermost):
 * 1. withValidation - Validates query parameters
 * 2. withRLSValidation - Validates user context
 * 3. withRateLimit - Rate limiting (100 req/min)
 * 4. withVersioning - API versioning
 * 5. withLogging - Request/response logging
 * 6. withErrorBoundary - Error handling
 */
export const GET = withErrorBoundary(
  withLogging(
    withVersioning(
      withRateLimit(
        withRLSValidation(
          withValidation(
            handleV1GET,
            QuerySchema,
            { validateQuery: true }
          )
        ),
        { requests: 100, window: 60 }
      )
    ),
    {
      config: {
        logRequestBody: false,
        logResponseBody: false,
      },
      metadata: {
        endpoint: 'example',
        method: 'GET',
      },
    }
  ),
  { timeout: 10000 }
);

/**
 * POST /api/v1/example
 *
 * Same middleware chain but with request body validation
 */
export const POST = withErrorBoundary(
  withLogging(
    withVersioning(
      withRateLimit(
        withRLSValidation(
          withValidation(
            handleV1POST,
            BodySchema
          )
        ),
        { requests: 60, window: 60 }
      )
    ),
    {
      config: {
        logRequestBody: true,
        logResponseBody: false,
      },
      metadata: {
        endpoint: 'example',
        method: 'POST',
      },
    }
  ),
  { timeout: 10000 }
);

/**
 * Alternative: Using version routing
 *
 * If you need different logic for different API versions,
 * you can use routeByVersion:
 */
export const GET_WITH_ROUTING = withErrorBoundary(
  withLogging(
    withVersioning(
      routeByVersion({
        1: async (request: VersionedRequest) => {
          // V1 logic
          return NextResponse.json({ version: 1, message: 'V1 response' });
        },
        2: async (request: VersionedRequest) => {
          // V2 logic with breaking changes
          return NextResponse.json({
            v: 2,
            msg: 'V2 response',
            new_field: 'new feature',
          });
        },
      })
    )
  ),
  { timeout: 10000 }
);
