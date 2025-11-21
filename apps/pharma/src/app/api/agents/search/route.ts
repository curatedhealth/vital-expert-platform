/**
 * Agent Search API Endpoint
 * 
 * POST /api/agents/search
 * 
 * Uses GraphRAG service for hybrid search (Pinecone vectors + Supabase metadata)
 * with proper authentication and validation.
 * 
 * @module app/api/agents/search
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { agentGraphRAGService } from '@/lib/services/agents/agent-graphrag-service';
import { z } from 'zod';
import { createLogger } from '@/lib/services/observability/structured-logger';

/**
 * Request validation schema
 */
const searchRequestSchema = z.object({
  query: z.string().min(1).max(500, {
    message: 'Query must be between 1 and 500 characters',
  }),
  topK: z.number().int().min(1).max(50).default(10),
  minSimilarity: z.number().min(0).max(1).default(0.7),
  filters: z
    .object({
      tier: z.number().int().min(1).max(3).optional(),
      status: z.enum(['active', 'inactive']).optional(),
      business_function: z.string().optional(),
      department: z.string().optional(),
      knowledge_domain: z.string().optional(),
      capabilities: z.array(z.string()).optional(),
    })
    .optional(),
});

/**
 * POST /api/agents/search
 * 
 * Search for agents using GraphRAG hybrid search
 * 
 * Request Body:
 * {
 *   "query": "clinical trial design",
 *   "topK": 5,
 *   "minSimilarity": 0.7,
 *   "filters": {
 *     "tier": 2,
 *     "status": "active"
 *   }
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "agents": [
 *     {
 *       "agent": { ... },
 *       "similarity": 0.92,
 *       "matchReason": ["High semantic similarity", "Knowledge domain match"]
 *     }
 *   ],
 *   "count": 5,
 *   "query": "clinical trial design"
 * }
 */
export const POST = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext
) => {
  const logger = createLogger();
  const operationId = `agent_search_${Date.now()}`;
  const startTime = Date.now();

  try {
    logger.info('agent_search_started', {
      operation: 'POST /api/agents/search',
      operationId,
      userId: context.user.id,
      tenantId: context.profile.tenant_id,
    });

    const body = await request.json();

    // Validate request
    const validatedData = searchRequestSchema.parse(body);

    logger.debug('agent_search_validated', {
      operation: 'POST /api/agents/search',
      operationId,
      queryPreview: validatedData.query.substring(0, 50),
      topK: validatedData.topK,
    });

    // Perform GraphRAG search
    const results = await agentGraphRAGService.searchAgents({
      query: validatedData.query,
      topK: validatedData.topK,
      minSimilarity: validatedData.minSimilarity,
      filters: validatedData.filters || {},
    });

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('agent_search_completed', duration, {
      operation: 'POST /api/agents/search',
      operationId,
      resultCount: results.length,
      topSimilarity: results[0]?.similarity,
    });

    return NextResponse.json({
      success: true,
      agents: results,
      count: results.length,
      query: validatedData.query,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      logger.warn('agent_search_validation_failed', {
        operation: 'POST /api/agents/search',
        operationId,
        duration,
        errors: error.errors,
      });

      return NextResponse.json(
        {
          error: 'Invalid request',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    logger.error(
      'agent_search_failed',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'POST /api/agents/search',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

