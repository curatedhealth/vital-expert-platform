/**
 * Orchestration Job Queue
 *
 * BullMQ-based job queue for LangGraph orchestration.
 * Vercel API routes enqueue jobs → AWS ECS workers process them.
 *
 * Features:
 * - Reliable job processing
 * - Retry with exponential backoff
 * - Job progress tracking
 * - Priority queues
 * - Job completion events
 *
 * @module lib/queue/orchestration-queue
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';
import type { OrchestrationInput, OrchestrationResult } from '@/types/domain';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Redis connection for BullMQ
 */
const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
});

/**
 * Queue names
 */
export const QUEUE_NAMES = {
  ORCHESTRATION: 'orchestration',
  ORCHESTRATION_HIGH_PRIORITY: 'orchestration:high',
} as const;

/**
 * Job options
 */
const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 2000, // Start with 2s, then 4s, then 8s
  },
  removeOnComplete: {
    count: 100, // Keep last 100 completed jobs
    age: 24 * 3600, // Keep for 24 hours
  },
  removeOnFail: {
    count: 1000, // Keep last 1000 failed jobs (for debugging)
    age: 7 * 24 * 3600, // Keep for 7 days
  },
};

// ============================================================================
// TYPES
// ============================================================================

export interface OrchestrationJobData {
  readonly input: OrchestrationInput;
  readonly userId: string;
  readonly tenantId: string;
  readonly requestId: string;
  readonly timestamp: number;
}

export interface OrchestrationJobResult {
  readonly result: OrchestrationResult;
  readonly completedAt: number;
}

export interface JobProgress {
  readonly stage: 'intent' | 'agent_selection' | 'execution' | 'response';
  readonly progress: number; // 0-100
  readonly message: string;
}

// ============================================================================
// QUEUE CREATION
// ============================================================================

/**
 * Create orchestration queue
 *
 * @returns BullMQ Queue instance
 */
export function createOrchestrationQueue(): Queue<OrchestrationJobData, OrchestrationJobResult> {
  return new Queue<OrchestrationJobData, OrchestrationJobResult>(
    QUEUE_NAMES.ORCHESTRATION,
    {
      connection,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    }
  );
}

/**
 * Create high-priority orchestration queue
 *
 * For urgent requests (e.g., emergency medical queries).
 *
 * @returns BullMQ Queue instance
 */
export function createHighPriorityQueue(): Queue<OrchestrationJobData, OrchestrationJobResult> {
  return new Queue<OrchestrationJobData, OrchestrationJobResult>(
    QUEUE_NAMES.ORCHESTRATION_HIGH_PRIORITY,
    {
      connection,
      defaultJobOptions: {
        ...DEFAULT_JOB_OPTIONS,
        priority: 1, // Higher priority
      },
    }
  );
}

/**
 * Create queue events handler
 *
 * For listening to job completion/failure.
 *
 * @param queueName - Name of queue to listen to
 * @returns QueueEvents instance
 */
export function createQueueEvents(queueName: string): QueueEvents {
  return new QueueEvents(queueName, { connection });
}

// ============================================================================
// JOB OPERATIONS
// ============================================================================

/**
 * Enqueue orchestration job
 *
 * @param data - Job data
 * @param options - Optional job options
 * @returns Job instance with ID
 */
export async function enqueueOrchestration(
  data: OrchestrationJobData,
  options?: {
    priority?: number;
    delay?: number;
  }
): Promise<Job<OrchestrationJobData, OrchestrationJobResult>> {
  const queue = createOrchestrationQueue();

  const job = await queue.add('process', data, {
    ...DEFAULT_JOB_OPTIONS,
    jobId: data.requestId, // Use request ID as job ID for idempotency
    ...options,
  });

  console.log('[Queue] Enqueued orchestration job:', {
    jobId: job.id,
    userId: data.userId,
    mode: data.input.mode,
  });

  return job;
}

/**
 * Get job by ID
 *
 * @param jobId - Job ID (request ID)
 * @returns Job instance or null
 */
export async function getJob(
  jobId: string
): Promise<Job<OrchestrationJobData, OrchestrationJobResult> | null> {
  const queue = createOrchestrationQueue();
  const job = await queue.getJob(jobId);
  return job || null;
}

/**
 * Get job state
 *
 * @param jobId - Job ID
 * @returns Job state
 */
export async function getJobState(jobId: string): Promise<string | 'unknown'> {
  const job = await getJob(jobId);
  if (!job) {
    return 'unknown';
  }
  return await job.getState();
}

/**
 * Get job progress
 *
 * @param jobId - Job ID
 * @returns Job progress or null
 */
export async function getJobProgress(jobId: string): Promise<JobProgress | null> {
  const job = await getJob(jobId);
  if (!job) {
    return null;
  }
  return (job.progress as JobProgress) || null;
}

/**
 * Get job result
 *
 * @param jobId - Job ID
 * @returns Job result or null
 */
export async function getJobResult(
  jobId: string
): Promise<OrchestrationJobResult | null> {
  const job = await getJob(jobId);
  if (!job) {
    return null;
  }
  return job.returnvalue || null;
}

/**
 * Wait for job completion
 *
 * @param jobId - Job ID
 * @param timeout - Timeout in milliseconds (default: 5 minutes)
 * @returns Job result
 * @throws Error if job fails or times out
 */
export async function waitForJobCompletion(
  jobId: string,
  timeout: number = 300000 // 5 minutes
): Promise<OrchestrationJobResult> {
  const job = await getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  // Wait for job to complete
  const result = await job.waitUntilFinished(
    createQueueEvents(QUEUE_NAMES.ORCHESTRATION),
    timeout
  );

  return result;
}

/**
 * Cancel job
 *
 * @param jobId - Job ID
 * @returns True if cancelled
 */
export async function cancelJob(jobId: string): Promise<boolean> {
  const job = await getJob(jobId);
  if (!job) {
    return false;
  }

  try {
    await job.remove();
    console.log('[Queue] Cancelled job:', jobId);
    return true;
  } catch (error) {
    console.error('[Queue] Error cancelling job:', jobId, error);
    return false;
  }
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

/**
 * Get queue stats
 *
 * @returns Queue statistics
 */
export async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const queue = createOrchestrationQueue();

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return { waiting, active, completed, failed, delayed };
}

/**
 * Pause queue
 *
 * Stops processing new jobs.
 */
export async function pauseQueue(): Promise<void> {
  const queue = createOrchestrationQueue();
  await queue.pause();
  console.log('[Queue] Queue paused');
}

/**
 * Resume queue
 *
 * Resumes processing jobs.
 */
export async function resumeQueue(): Promise<void> {
  const queue = createOrchestrationQueue();
  await queue.resume();
  console.log('[Queue] Queue resumed');
}

/**
 * Drain queue
 *
 * Removes all jobs from queue.
 */
export async function drainQueue(): Promise<void> {
  const queue = createOrchestrationQueue();
  await queue.drain();
  console.log('[Queue] Queue drained');
}

/**
 * Clean queue
 *
 * Removes old completed/failed jobs.
 *
 * @param grace - Grace period in milliseconds
 * @param limit - Maximum number of jobs to clean
 */
export async function cleanQueue(
  grace: number = 24 * 3600 * 1000, // 24 hours
  limit: number = 1000
): Promise<void> {
  const queue = createOrchestrationQueue();

  await Promise.all([
    queue.clean(grace, limit, 'completed'),
    queue.clean(grace, limit, 'failed'),
  ]);

  console.log('[Queue] Queue cleaned');
}

// ============================================================================
// WORKER (for AWS ECS)
// ============================================================================

/**
 * Create worker for processing orchestration jobs
 *
 * This runs on AWS ECS workers, NOT on Vercel.
 *
 * @param processor - Job processor function
 * @returns Worker instance
 */
export function createOrchestrationWorker(
  processor: (job: Job<OrchestrationJobData>) => Promise<OrchestrationJobResult>
): Worker<OrchestrationJobData, OrchestrationJobResult> {
  const worker = new Worker<OrchestrationJobData, OrchestrationJobResult>(
    QUEUE_NAMES.ORCHESTRATION,
    processor,
    {
      connection,
      concurrency: parseInt(process.env.WORKER_CONCURRENCY ?? '5', 10),
      limiter: {
        max: parseInt(process.env.WORKER_MAX_JOBS ?? '10', 10),
        duration: 1000, // Per second
      },
    }
  );

  // Error handling
  worker.on('failed', (job, error) => {
    console.error('[Worker] Job failed:', {
      jobId: job?.id,
      error: error.message,
      stack: error.stack,
    });
  });

  worker.on('completed', (job) => {
    console.log('[Worker] Job completed:', {
      jobId: job.id,
      duration: Date.now() - job.timestamp,
    });
  });

  console.log('[Worker] Orchestration worker started');

  return worker;
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

/**
 * Close queue connections
 *
 * Call this on shutdown to gracefully close connections.
 */
export async function closeQueue(): Promise<void> {
  await connection.quit();
  console.log('[Queue] Connections closed');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  enqueueOrchestration,
  getJob,
  getJobState,
  getJobProgress,
  getJobResult,
  waitForJobCompletion,
  cancelJob,
  getQueueStats,
  pauseQueue,
  resumeQueue,
  drainQueue,
  cleanQueue,
  createOrchestrationWorker,
  closeQueue,
};
