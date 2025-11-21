/**
 * Job Status API Route
 *
 * Checks status of orchestration job.
 * Clients poll this endpoint to get results.
 *
 * @module app/api/orchestrate/[jobId]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getJob, getJobState, getJobProgress, getJobResult } from '@/lib/queue/orchestration-queue';
import { CONTENT_TYPE_HEADERS, CACHE_HEADERS } from '@/lib/security/headers';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// ============================================================================
// GET /api/orchestrate/[jobId]
// ============================================================================

/**
 * Get job status and result
 *
 * @param request - Next.js request
 * @param context - Route context with jobId param
 * @returns Job status and result
 */
export async function GET(
  request: NextRequest,
  context: { params: { jobId: string } }
): Promise<NextResponse> {
  try {
    const { jobId } = context.params;

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
          headers: CONTENT_TYPE_HEADERS.json,
        }
      );
    }

    // ========================================================================
    // 2. GET JOB
    // ========================================================================

    const job = await getJob(jobId);
    if (!job) {
      return NextResponse.json(
        {
          error: 'Job not found',
          message: `Job ${jobId} does not exist`,
        },
        {
          status: 404,
          headers: CONTENT_TYPE_HEADERS.json,
        }
      );
    }

    // ========================================================================
    // 3. AUTHORIZATION
    // ========================================================================

    // Verify user owns this job
    if (job.data.userId !== userId) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Cannot access jobs from another user',
        },
        {
          status: 403,
          headers: CONTENT_TYPE_HEADERS.json,
        }
      );
    }

    // ========================================================================
    // 4. GET JOB STATUS
    // ========================================================================

    const state = await getJobState(jobId);
    const progress = await getJobProgress(jobId);

    // Build response based on state
    const baseResponse = {
      jobId,
      status: state,
      enqueuedAt: new Date(job.timestamp).toISOString(),
    };

    // Job is still processing
    if (state === 'waiting' || state === 'active' || state === 'delayed') {
      return NextResponse.json(
        {
          ...baseResponse,
          progress,
          ...(job.attemptsMade > 0 && {
            attempts: job.attemptsMade,
            maxAttempts: job.opts.attempts || 3,
          }),
        },
        {
          status: 200,
          headers: {
            ...CONTENT_TYPE_HEADERS.json,
            ...CACHE_HEADERS.noCache,
            'Retry-After': '2', // Poll again in 2 seconds
          },
        }
      );
    }

    // Job completed successfully
    if (state === 'completed') {
      const result = await getJobResult(jobId);

      if (!result) {
        return NextResponse.json(
          {
            error: 'Result not found',
            message: 'Job completed but result is not available',
          },
          {
            status: 500,
            headers: CONTENT_TYPE_HEADERS.json,
          }
        );
      }

      return NextResponse.json(
        {
          ...baseResponse,
          result: result.result,
          completedAt: new Date(result.completedAt).toISOString(),
          duration: result.completedAt - job.timestamp,
        },
        {
          status: 200,
          headers: {
            ...CONTENT_TYPE_HEADERS.json,
            ...CACHE_HEADERS.shortCache, // Cache completed results for 1 minute
          },
        }
      );
    }

    // Job failed
    if (state === 'failed') {
      return NextResponse.json(
        {
          ...baseResponse,
          error: job.failedReason || 'Job failed',
          attempts: job.attemptsMade,
          maxAttempts: job.opts.attempts || 3,
          failedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : undefined,
        },
        {
          status: 200, // Return 200 even for failed jobs (job system worked, job itself failed)
          headers: {
            ...CONTENT_TYPE_HEADERS.json,
            ...CACHE_HEADERS.noCache,
          },
        }
      );
    }

    // Unknown state
    return NextResponse.json(
      {
        ...baseResponse,
        error: 'Unknown state',
        message: `Job is in unknown state: ${state}`,
      },
      {
        status: 500,
        headers: CONTENT_TYPE_HEADERS.json,
      }
    );
  } catch (error) {
    console.error('[API] Job status error:', error);

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
// DELETE /api/orchestrate/[jobId]
// ============================================================================

/**
 * Cancel job
 *
 * @param request - Next.js request
 * @param context - Route context with jobId param
 * @returns Success response
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { jobId: string } }
): Promise<NextResponse> {
  try {
    const { jobId } = context.params;

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
          headers: CONTENT_TYPE_HEADERS.json,
        }
      );
    }

    // ========================================================================
    // 2. GET JOB
    // ========================================================================

    const job = await getJob(jobId);
    if (!job) {
      return NextResponse.json(
        {
          error: 'Job not found',
          message: `Job ${jobId} does not exist`,
        },
        {
          status: 404,
          headers: CONTENT_TYPE_HEADERS.json,
        }
      );
    }

    // ========================================================================
    // 3. AUTHORIZATION
    // ========================================================================

    // Verify user owns this job
    if (job.data.userId !== userId) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Cannot cancel jobs from another user',
        },
        {
          status: 403,
          headers: CONTENT_TYPE_HEADERS.json,
        }
      );
    }

    // ========================================================================
    // 4. CANCEL JOB
    // ========================================================================

    await job.remove();

    console.log('[API] Job cancelled:', {
      jobId,
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Job cancelled successfully',
        jobId,
      },
      {
        status: 200,
        headers: CONTENT_TYPE_HEADERS.json,
      }
    );
  } catch (error) {
    console.error('[API] Job cancellation error:', error);

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

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'Use GET to check job status or DELETE to cancel',
    },
    {
      status: 405,
      headers: {
        ...CONTENT_TYPE_HEADERS.json,
        Allow: 'GET, DELETE',
      },
    }
  );
}

export async function PUT(): Promise<NextResponse> {
  return POST();
}

export async function PATCH(): Promise<NextResponse> {
  return POST();
}
