/**
 * Orchestration API Route (Simplified - No BullMQ)
 *
 * Executes LangGraph orchestration directly within Vercel Node.js runtime.
 * Limited to 10s execution time.
 *
 * Flow:
 * 1. Validate input
 * 2. Execute orchestration directly
 * 3. Return result immediately
 *
 * @module app/api/orchestrate/route
 * @since Phase 3 (Simplified implementation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createSimplifiedOrchestrator,
  OrchestrationTimeoutError,
  type OrchestrationInput
} from '@/lib/orchestration/simplified-orchestrator';
import { supabase } from '@/lib/db/supabase/client';
import { CONTENT_TYPE_HEADERS, CACHE_HEADERS } from '@/lib/security/headers';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Runtime configuration for Vercel Node.js (not Edge - need full Node APIs)
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 10; // 10 seconds max (Vercel limit)

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const OrchestrationInputSchema = z.object({
  query: z.string().min(1).max(10000),
  mode: z.enum(['query_automatic', 'query_manual', 'rag_query', 'multi_agent', 'autonomous']),
  sessionId: z.string().uuid().optional(),
  context: z.record(z.unknown()).optional()
});

// ============================================================================
// POST /api/orchestrate
// ============================================================================

/**
 * Execute orchestration request
 *
 * @param request - Next.js request
 * @returns Orchestration result
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // ========================================================================
    // 1. AUTHENTICATION
    // ========================================================================

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        {
          status: 401,
          headers: {
            ...CONTENT_TYPE_HEADERS.json,
            ...CACHE_HEADERS.noCache,
          },
        }
      );
    }

    // ========================================================================
    // 2. GET TENANT ID
    // ========================================================================

    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Tenant ID required',
        },
        {
          status: 400,
          headers: CONTENT_TYPE_HEADERS.json,
        }
      );
    }

    // ========================================================================
    // 3. INPUT VALIDATION
    // ========================================================================

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
        },
        {
          status: 400,
          headers: CONTENT_TYPE_HEADERS.json,
        }
      );
    }

    // Validate with Zod schema
    const validation = OrchestrationInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid request body',
          details: validation.error.errors,
        },
        {
          status: 400,
          headers: CONTENT_TYPE_HEADERS.json,
        }
      );
    }

    const input: OrchestrationInput = validation.data;

    // ========================================================================
    // 4. EXECUTE ORCHESTRATION
    // ========================================================================

    const orchestrator = createSimplifiedOrchestrator();

    // Validate input
    try {
      orchestrator.validateInput(input);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: error instanceof Error ? error.message : 'Invalid input',
        },
        {
          status: 400,
          headers: CONTENT_TYPE_HEADERS.json,
        }
      );
    }

    // Execute orchestration
    let result;
    try {
      result = await orchestrator.execute(input, userId, tenantId);
    } catch (error) {
      // Handle timeout error
      if (error instanceof OrchestrationTimeoutError) {
        return NextResponse.json(
          {
            error: 'Request timeout',
            message: error.message,
            suggestion: 'Please try simplifying your query or break it into smaller parts.',
          },
          {
            status: 504,
            headers: CONTENT_TYPE_HEADERS.json,
          }
        );
      }

      // Handle other errors
      console.error('[API] Orchestration execution error:', error);
      return NextResponse.json(
        {
          error: 'Orchestration failed',
          message: 'An error occurred during orchestration',
          ...(process.env.NODE_ENV === 'development' && {
            details: error instanceof Error ? error.message : String(error),
          }),
        },
        {
          status: 500,
          headers: CONTENT_TYPE_HEADERS.json,
        }
      );
    }

    // ========================================================================
    // 5. RETURN RESULT
    // ========================================================================

    const totalDuration = Date.now() - startTime;

    console.log('[API] Orchestration completed:', {
      userId,
      tenantId,
      mode: input.mode,
      duration: totalDuration,
      conversationId: result.conversationId,
    });

    return NextResponse.json(
      {
        ...result,
        metadata: {
          ...result.metadata,
          totalDuration,
        },
      },
      {
        status: 200,
        headers: {
          ...CONTENT_TYPE_HEADERS.json,
          ...CACHE_HEADERS.noCache,
        },
      }
    );
  } catch (error) {
    console.error('[API] Unexpected error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error),
        }),
      },
      {
        status: 500,
        headers: CONTENT_TYPE_HEADERS.json,
      }
    );
  }
}

// ============================================================================
// OTHER METHODS (Not Allowed)
// ============================================================================

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'Use POST to execute orchestration',
    },
    {
      status: 405,
      headers: {
        ...CONTENT_TYPE_HEADERS.json,
        Allow: 'POST',
      },
    }
  );
}

export async function PUT(): Promise<NextResponse> {
  return GET();
}

export async function PATCH(): Promise<NextResponse> {
  return GET();
}

export async function DELETE(): Promise<NextResponse> {
  return GET();
}
