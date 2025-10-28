/**
 * Simplified Orchestrator (No BullMQ)
 *
 * This implementation runs LangGraph orchestration directly within Vercel's
 * Node.js runtime (10s limit). For production use with longer-running tasks,
 * implement Phase 2 (AWS ECS Workers) or migrate to a platform with longer
 * execution limits.
 *
 * @module SimplifiedOrchestrator
 * @since Phase 3
 */

import { unifiedOrchestrator } from '@/features/chat/services/unified-langgraph-orchestrator';

/**
 * Orchestration input from user
 */
export interface OrchestrationInput {
  query: string;
  mode: 'query_automatic' | 'query_manual' | 'rag_query' | 'multi_agent' | 'autonomous';
  sessionId?: string;
  context?: Record<string, unknown>;
}

/**
 * Progress update during orchestration
 */
export interface OrchestrationProgress {
  stage: 'initializing' | 'intent' | 'agent_selection' | 'execution' | 'synthesis';
  progress: number; // 0-100
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Final orchestration result
 */
export interface OrchestrationResult {
  conversationId: string;
  response: string;
  selectedAgents: Array<{
    id: string;
    name: string;
    confidence: number;
  }>;
  sources?: Array<{
    title: string;
    url: string;
    excerpt: string;
  }>;
  metadata: {
    duration: number;
    mode: string;
    tokensUsed?: number;
  };
}

/**
 * Error thrown when orchestration exceeds time limit
 */
export class OrchestrationTimeoutError extends Error {
  constructor(message = 'Orchestration execution timeout') {
    super(message);
    this.name = 'OrchestrationTimeoutError';
  }
}

/**
 * Simplified orchestrator that executes LangGraph directly
 * without job queue infrastructure.
 *
 * WARNING: Limited to 10s execution on Vercel Node.js runtime
 */
export class SimplifiedOrchestrator {
  private readonly timeoutMs: number;

  constructor(timeoutMs = 9000) {
    // Default to 9s to leave 1s buffer for Vercel's 10s limit
    this.timeoutMs = timeoutMs;
  }

  /**
   * Execute orchestration directly (synchronous)
   *
   * @param input - User query and configuration
   * @param userId - Authenticated user ID
   * @param tenantId - Tenant ID for multi-tenant isolation
   * @returns Orchestration result
   * @throws {OrchestrationTimeoutError} If execution exceeds timeout
   */
  async execute(
    input: OrchestrationInput,
    userId: string,
    tenantId: string
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new OrchestrationTimeoutError(
          `Execution exceeded ${this.timeoutMs}ms timeout. ` +
          'Query may be too complex. Please simplify or contact support.'
        ));
      }, this.timeoutMs);
    });

    // Use singleton orchestrator instance
    const orchestrator = unifiedOrchestrator;

    // Execute with timeout protection
    const executionPromise = orchestrator.invoke({
      query: input.query,
      mode: input.mode,
      userId,
      tenantId,
      sessionId: input.sessionId,
      context: input.context
    });

    try {
      // Race between execution and timeout
      const result = await Promise.race([
        executionPromise,
        timeoutPromise
      ]) as OrchestrationResult;

      // Add duration metadata
      const duration = Date.now() - startTime;
      result.metadata = {
        ...result.metadata,
        duration,
        mode: input.mode
      };

      return result;
    } catch (error) {
      if (error instanceof OrchestrationTimeoutError) {
        throw error;
      }

      // Re-throw other errors with context
      throw new Error(`Orchestration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute orchestration with streaming progress updates (SSE)
   *
   * @param input - User query and configuration
   * @param userId - Authenticated user ID
   * @param tenantId - Tenant ID for multi-tenant isolation
   * @yields Progress updates during execution
   * @returns Final result
   */
  async *executeStream(
    input: OrchestrationInput,
    userId: string,
    tenantId: string
  ): AsyncGenerator<OrchestrationProgress | OrchestrationResult> {
    const startTime = Date.now();

    // Yield initial progress
    yield {
      stage: 'initializing',
      progress: 0,
      message: 'Initializing orchestration...'
    } as OrchestrationProgress;

    // Use singleton orchestrator instance
    const orchestrator = unifiedOrchestrator;

    // Create timeout handler
    const timeoutMs = this.timeoutMs;
    let timedOut = false;
    const timeoutHandle = setTimeout(() => {
      timedOut = true;
    }, timeoutMs);

    try {
      // Stream orchestration events
      const stream = orchestrator.stream({
        query: input.query,
        mode: input.mode,
        userId,
        tenantId,
        sessionId: input.sessionId,
        context: input.context
      });

      for await (const event of stream) {
        // Check timeout
        if (timedOut) {
          clearTimeout(timeoutHandle);
          throw new OrchestrationTimeoutError(
            `Execution exceeded ${timeoutMs}ms timeout during streaming`
          );
        }

        // Map event to progress update
        if (event.type === 'progress') {
          yield event as OrchestrationProgress;
        } else if (event.type === 'result') {
          // Final result
          const duration = Date.now() - startTime;
          const result = event as OrchestrationResult;
          result.metadata = {
            ...result.metadata,
            duration,
            mode: input.mode
          };

          clearTimeout(timeoutHandle);
          return result;
        }
      }

      clearTimeout(timeoutHandle);
      throw new Error('Stream ended without result');
    } catch (error) {
      clearTimeout(timeoutHandle);

      if (error instanceof OrchestrationTimeoutError) {
        throw error;
      }

      throw new Error(`Orchestration streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate orchestration input
   *
   * @param input - Input to validate
   * @throws {Error} If input is invalid
   */
  validateInput(input: OrchestrationInput): void {
    if (!input.query || typeof input.query !== 'string') {
      throw new Error('Query is required and must be a string');
    }

    if (input.query.length === 0) {
      throw new Error('Query cannot be empty');
    }

    if (input.query.length > 10000) {
      throw new Error('Query exceeds maximum length of 10000 characters');
    }

    const validModes = ['query_automatic', 'query_manual', 'rag_query', 'multi_agent', 'autonomous'];
    if (!validModes.includes(input.mode)) {
      throw new Error(`Invalid mode. Must be one of: ${validModes.join(', ')}`);
    }

    if (input.sessionId && typeof input.sessionId !== 'string') {
      throw new Error('Session ID must be a string');
    }
  }
}

/**
 * Factory function to create orchestrator instance
 *
 * @param timeoutMs - Optional timeout in milliseconds (default: 9000)
 * @returns Orchestrator instance
 */
export function createSimplifiedOrchestrator(timeoutMs?: number): SimplifiedOrchestrator {
  return new SimplifiedOrchestrator(timeoutMs);
}
