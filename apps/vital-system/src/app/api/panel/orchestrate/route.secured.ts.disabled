/**
 * SECURED Panel Orchestration API Route
 * This is the secured version with all security middleware applied
 *
 * To activate: Rename this file to route.ts and backup the old route.ts
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

// Security middleware
import { withErrorBoundary } from '@/lib/api/error-boundary';
import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';
import { withPooledClient } from '@vital/sdk/lib/supabase/connection-pool';
import { createSuccessResponse, APIErrors } from '@/middleware/error-handler.middleware';
import { withRateLimit } from '@/middleware/rate-limit.middleware';
import { withRLSValidation } from '@/middleware/rls-validation.middleware';
import { withValidation } from '@/middleware/validation.middleware';

// Services

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const PanelOrchestrationSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(4000, 'Message too long'),

  panel: z.object({
    members: z.array(z.object({
      agent: z.object({
        id: z.string().uuid('Invalid agent ID'),
        name: z.string().min(1),
        display_name: z.string().optional(),
        role: z.string().optional(),
        description: z.string().optional(),
      })
    })).min(1, 'Panel must have at least one member')
      .max(10, 'Panel cannot have more than 10 members'), // Prevent resource exhaustion
  }),

  context: z.any().optional(),

  mode: z.enum(['parallel', 'sequential', 'consensus'])
    .default('parallel')
    .describe('Panel orchestration mode'),
});

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for panel consultation

// ============================================================================
// POST ENDPOINT - Orchestrate Panel
// ============================================================================

export const POST = withErrorBoundary(
  withRateLimit(
    withRLSValidation(
      withValidation(
        async (request: NextRequest, validatedData: z.infer<typeof PanelOrchestrationSchema>, context) => {
          const { message, panel, context: panelContext, mode } = validatedData;

          console.log(`\n🎭 LangGraph Panel Orchestration API Request`);
          console.log(`📋 Message: ${message.substring(0, 100)}...`);
          console.log(`👥 Panel Members: ${panel.members.length}`);
          console.log(`🎯 Mode: ${mode}`);
          console.log(`👤 User: ${context.userId}`);

          // Validate that all agents exist and user has access
          await withPooledClient(async (supabase) => {
            const agentIds = panel.members.map(m => m.agent.id);

            const { data: agents, error } = await supabase
              .from('agents')
              .select('id, name, status')
              .in('id', agentIds);

            if (error) {
              throw error;
            }

            if (!agents || agents.length !== agentIds.length) {
              throw APIErrors.notFound('Agent', 'One or more agents not found');
            }

            // Check that all agents are active or testing
            const inactiveAgents = agents.filter(
              a => a.status !== 'active' && a.status !== 'testing'
            );

            if (inactiveAgents.length > 0) {
              throw APIErrors.validationError(
                'One or more agents are not available',
                { inactiveAgents: inactiveAgents.map(a => a.name) }
              );
            }
          });

          // Extract persona names from panel members
          const personas = panel.members.map(m => m.agent.name);

          // Orchestrate using LangGraph engine
          const result = await langGraphOrchestrator.orchestrate({
            mode,
            question: message,
            personas,
            evidenceSources: [], // TODO: Integrate evidence pack builder
          });

          console.log(`✅ LangGraph panel orchestration completed`);
          console.log(`📊 Expert responses: ${result.replies.length}`);
          console.log(`🎯 Consensus: ${result.synthesis?.consensus?.length || 0} points`);
          console.log(`📝 Execution logs: ${result.metadata?.logs?.length || 0} entries\n`);

          // Format response for client
          return createSuccessResponse({
            response: result.synthesis?.summaryMd || 'No synthesis available',
            metadata: {
              mode: result.mode,
              sessionId: result.sessionId,
              consensus: result.synthesis?.consensus || [],
              dissent: result.synthesis?.dissent || [],
              expertResponses: result.replies.map(r => ({
                expertId: r.persona,
                expertName: r.persona,
                content: r.text,
                confidence: r.confidence,
                citations: r.citations,
                timestamp: r.timestamp,
              })),
              humanGateRequired: result.synthesis?.humanGateRequired || false,
              timestamp: new Date().toISOString(),
              processingMetadata: {
                panelSize: panel.members.length,
                mode,
                userId: context.userId,
              }
            },
          }, {
            message: 'Panel orchestration completed successfully'
          });
        },
        PanelOrchestrationSchema
      ),
      { requireRole: 'user' } // Only authenticated users can orchestrate panels
    ),
    {
      requests: 30, // 30 requests per minute (panel is resource-intensive)
      window: 60,
      identifier: (req) => {
        const userId = req.headers.get('X-User-Id');
        return userId ? `user:${userId}:panel` : `ip:${req.headers.get('x-forwarded-for') || 'unknown'}:panel`;
      }
    }
  ),
  {
    timeout: 60000, // 60 second timeout for panel orchestration
    includeStackTrace: process.env.NODE_ENV === 'development',
    logger: async (error, context) => {
      // Log panel orchestration errors with additional context
      console.error('[Panel Orchestration Error]', {
        error: error.message,
        endpoint: context.endpoint,
        userId: context.userId,
        timestamp: context.timestamp,
        stack: error.stack
      });

      // TODO: Send to Sentry with additional context
      // Sentry.captureException(error, {
      //   tags: {
      //     endpoint: 'panel-orchestrate',
      //     userId: context.userId,
      //   },
      //   extra: context
      // });
    }
  }
);

// ============================================================================
// HELPER: Get Panel Statistics
// ============================================================================

/**
 * Get panel orchestration statistics
 * Can be called from monitoring dashboard
 */
export async function GET(request: NextRequest) {
  // This endpoint is for monitoring only
  const userId = request.headers.get('X-User-Id');

  if (!userId) {
    return createSuccessResponse({
      error: 'Authentication required',
    }, { status: 401 });
  }

  const stats = await withPooledClient(async (supabase) => {
    // Get user's panel orchestration history
    const { data, error } = await supabase
      .from('panel_sessions')
      .select('id, mode, panel_size, created_at, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error && error.code !== 'PGRST116') {
      console.warn('Panel sessions table not found:', error);
      return { sessions: [], totalSessions: 0 };
    }

    return {
      sessions: data || [],
      totalSessions: data?.length || 0,
    };
  });

  return createSuccessResponse(stats, {
    message: 'Panel orchestration statistics retrieved successfully',
  });
}
