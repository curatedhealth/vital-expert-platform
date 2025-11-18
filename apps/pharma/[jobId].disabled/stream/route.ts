/**
 * Job Streaming API Route
 *
 * Server-Sent Events (SSE) stream for real-time job updates.
 * Clients connect once and receive updates as they happen.
 *
 * @module app/api/orchestrate/[jobId]/stream/route
 */

import { NextRequest } from 'next/server';
import { getJob, createQueueEvents, QUEUE_NAMES } from '@/lib/queue/orchestration-queue';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// ============================================================================
// GET /api/orchestrate/[jobId]/stream
// ============================================================================

/**
 * Stream job updates via Server-Sent Events
 *
 * @param request - Next.js request
 * @param context - Route context with jobId param
 * @returns SSE stream
 */
export async function GET(
  request: NextRequest,
  context: { params: { jobId: string } }
): Promise<Response> {
  const { jobId } = context.params;

  // ========================================================================
  // 1. AUTHENTICATION
  // ========================================================================

  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Authentication required',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // ========================================================================
  // 2. VERIFY JOB EXISTS
  // ========================================================================

  const job = await getJob(jobId);
  if (!job) {
    return new Response(
      JSON.stringify({
        error: 'Job not found',
        message: `Job ${jobId} does not exist`,
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // ========================================================================
  // 3. AUTHORIZATION
  // ========================================================================

  if (job.data.userId !== userId) {
    return new Response(
      JSON.stringify({
        error: 'Forbidden',
        message: 'Cannot access jobs from another user',
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // ========================================================================
  // 4. CREATE SSE STREAM
  // ========================================================================

  const encoder = new TextEncoder();
  const queueEvents = createQueueEvents(QUEUE_NAMES.ORCHESTRATION);

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: 'connected',
            jobId,
            timestamp: Date.now(),
          })}\n\n`
        )
      );

      // Listen for job events
      const progressHandler = (args: { jobId: string; data: unknown }): void => {
        if (args.jobId === jobId) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'progress',
                progress: args.data,
                timestamp: Date.now(),
              })}\n\n`
            )
          );
        }
      };

      const completedHandler = (args: { jobId: string; returnvalue: unknown }): void => {
        if (args.jobId === jobId) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'completed',
                result: args.returnvalue,
                timestamp: Date.now(),
              })}\n\n`
            )
          );
          // Close stream after completion
          cleanup();
        }
      };

      const failedHandler = (args: { jobId: string; failedReason: string }): void => {
        if (args.jobId === jobId) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'failed',
                error: args.failedReason,
                timestamp: Date.now(),
              })}\n\n`
            )
          );
          // Close stream after failure
          cleanup();
        }
      };

      const cleanup = (): void => {
        queueEvents.off('progress', progressHandler);
        queueEvents.off('completed', completedHandler);
        queueEvents.off('failed', failedHandler);
        controller.close();
      };

      // Register event handlers
      queueEvents.on('progress', progressHandler);
      queueEvents.on('completed', completedHandler);
      queueEvents.on('failed', failedHandler);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log('[API] Client disconnected from stream:', jobId);
        cleanup();
      });

      // Check if job is already completed
      const state = await job.getState();
      if (state === 'completed') {
        const result = job.returnvalue;
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'completed',
              result,
              timestamp: Date.now(),
            })}\n\n`
          )
        );
        cleanup();
      } else if (state === 'failed') {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'failed',
              error: job.failedReason || 'Job failed',
              timestamp: Date.now(),
            })}\n\n`
          )
        );
        cleanup();
      }
    },

    cancel() {
      console.log('[API] Stream cancelled:', jobId);
      queueEvents.close();
    },
  });

  // ========================================================================
  // 5. RETURN SSE RESPONSE
  // ========================================================================

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

// ============================================================================
// OTHER METHODS (Not Allowed)
// ============================================================================

export async function POST(): Promise<Response> {
  return new Response(
    JSON.stringify({
      error: 'Method not allowed',
      message: 'Use GET to stream job updates',
    }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        Allow: 'GET',
      },
    }
  );
}

export async function PUT(): Promise<Response> {
  return POST();
}

export async function PATCH(): Promise<Response> {
  return POST();
}

export async function DELETE(): Promise<Response> {
  return POST();
}
