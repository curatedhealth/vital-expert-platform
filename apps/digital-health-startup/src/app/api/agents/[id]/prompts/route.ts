import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { z } from 'zod';

// Validation schemas
const assignPromptsSchema = z.object({
  prompt_ids: z.array(z.string().uuid()).min(1),
  replace: z.boolean().default(false), // Replace existing or append
});

const removePromptsSchema = z.object({
  prompt_ids: z.array(z.string().uuid()).optional(), // If not provided, remove all
});

/**
 * GET /api/agents/[id]/prompts
 * Get prompts assigned to an agent
 */
export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const operationId = `agent_prompts_get_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use user session client
    const supabase = await createClient();
    const { id: agentId } = await params;

    logger.info('agent_prompts_get_started', {
      operation: 'GET /api/agents/[id]/prompts',
      operationId,
      agentId,
      userId: context.user.id,
    });

    // Verify agent exists
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name, display_name')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      const duration = Date.now() - startTime;
      logger.warn('agent_prompts_get_agent_not_found', {
        operation: 'GET /api/agents/[id]/prompts',
        operationId,
        agentId,
        duration,
      });

      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Get assigned prompts
    const { data: agentPrompts, error } = await supabase
      .from('agent_prompts')
      .select(`
        id,
        prompt_id,
        assigned_at,
        prompts (
          id,
          name,
          display_name,
          description,
          domain,
          category,
          system_prompt,
          user_prompt_template,
          complexity_level,
          metadata
        )
      `)
      .eq('agent_id', agentId)
      .order('assigned_at', { ascending: true });

    if (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'agent_prompts_get_error',
        new Error(error.message),
        {
          operation: 'GET /api/agents/[id]/prompts',
          operationId,
          agentId,
          duration,
          errorCode: error.code,
        }
      );

      return NextResponse.json(
        { error: 'Failed to fetch agent prompts', details: error.message },
        { status: 500 }
      );
    }

    // Format response
    const prompts = (agentPrompts || [])
      .map((ap: any) => ({
        assignment_id: ap.id,
        assigned_at: ap.assigned_at,
        prompt: ap.prompts,
      }))
      .filter((item) => item.prompt !== null); // Filter out deleted prompts

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('agent_prompts_get_completed', duration, {
      operation: 'GET /api/agents/[id]/prompts',
      operationId,
      agentId,
      count: prompts.length,
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        display_name: agent.display_name,
      },
      prompts,
      count: prompts.length,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'agent_prompts_get_unexpected_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/agents/[id]/prompts',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/agents/[id]/prompts
 * Assign prompts to an agent
 */
export const POST = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const operationId = `agent_prompts_post_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use user session client
    const supabase = await createClient();
    const { id: agentId } = await params;

    logger.info('agent_prompts_post_started', {
      operation: 'POST /api/agents/[id]/prompts',
      operationId,
      agentId,
      userId: context.user.id,
    });

    const body = await request.json();

    // Validate input
    const validatedData = assignPromptsSchema.parse(body);

    // Verify agent exists
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      const duration = Date.now() - startTime;
      logger.warn('agent_prompts_post_agent_not_found', {
        operation: 'POST /api/agents/[id]/prompts',
        operationId,
        agentId,
        duration,
      });

      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Verify all prompts exist
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('id, name')
      .in('id', validatedData.prompt_ids);

    if (promptsError) {
      const duration = Date.now() - startTime;
      logger.error(
        'agent_prompts_post_prompts_error',
        new Error(promptsError.message),
        {
          operation: 'POST /api/agents/[id]/prompts',
          operationId,
          agentId,
          duration,
        }
      );

      return NextResponse.json(
        { error: 'Failed to verify prompts', details: promptsError.message },
        { status: 500 }
      );
    }

    if (!prompts || prompts.length !== validatedData.prompt_ids.length) {
      const duration = Date.now() - startTime;
      const foundIds = prompts?.map((p) => p.id) || [];
      const missingIds = validatedData.prompt_ids.filter(
        (id) => !foundIds.includes(id)
      );

      logger.warn('agent_prompts_post_prompts_not_found', {
        operation: 'POST /api/agents/[id]/prompts',
        operationId,
        agentId,
        missingIds,
        duration,
      });

      return NextResponse.json(
        {
          error: 'One or more prompts not found',
          missing_prompt_ids: missingIds,
        },
        { status: 404 }
      );
    }

    // If replace, delete existing prompts first
    if (validatedData.replace) {
      const { error: deleteError } = await supabase
        .from('agent_prompts')
        .delete()
        .eq('agent_id', agentId);

      if (deleteError) {
        const duration = Date.now() - startTime;
        logger.error(
          'agent_prompts_post_delete_error',
          new Error(deleteError.message),
          {
            operation: 'POST /api/agents/[id]/prompts',
            operationId,
            agentId,
            duration,
          }
        );

        return NextResponse.json(
          { error: 'Failed to remove existing prompts', details: deleteError.message },
          { status: 500 }
        );
      }

      logger.debug('agent_prompts_post_replaced_existing', {
        operation: 'POST /api/agents/[id]/prompts',
        operationId,
        agentId,
      });
    } else {
      // Check for existing assignments to avoid duplicates
      const { data: existingAssignments } = await supabase
        .from('agent_prompts')
        .select('prompt_id')
        .eq('agent_id', agentId)
        .in('prompt_id', validatedData.prompt_ids);

      if (existingAssignments && existingAssignments.length > 0) {
        const existingIds = existingAssignments.map((a) => a.prompt_id);
        const newIds = validatedData.prompt_ids.filter(
          (id) => !existingIds.includes(id)
        );

        if (newIds.length === 0) {
          const duration = Date.now() - startTime;
          logger.warn('agent_prompts_post_all_duplicates', {
            operation: 'POST /api/agents/[id]/prompts',
            operationId,
            agentId,
            duration,
          });

          return NextResponse.json(
            { error: 'All prompts are already assigned to this agent' },
            { status: 409 }
          );
        }

        // Only assign new prompts
        validatedData.prompt_ids = newIds;
      }
    }

    // Create new mappings
    const mappings = validatedData.prompt_ids.map((promptId) => ({
      agent_id: agentId,
      prompt_id: promptId,
      assigned_by: context.user.id,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('agent_prompts')
      .insert(mappings)
      .select(`
        id,
        prompt_id,
        assigned_at,
        prompts (
          id,
          name,
          display_name,
          description,
          domain
        )
      `);

    if (insertError) {
      const duration = Date.now() - startTime;
      logger.error(
        'agent_prompts_post_insert_error',
        new Error(insertError.message),
        {
          operation: 'POST /api/agents/[id]/prompts',
          operationId,
          agentId,
          duration,
          errorCode: insertError.code,
        }
      );

      return NextResponse.json(
        { error: 'Failed to assign prompts', details: insertError.message },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('agent_prompts_post_completed', duration, {
      operation: 'POST /api/agents/[id]/prompts',
      operationId,
      agentId,
      assignedCount: inserted?.length || 0,
      replaced: validatedData.replace,
    });

    return NextResponse.json({
      success: true,
      message: `Assigned ${inserted?.length || 0} prompt(s) to agent`,
      agent: {
        id: agent.id,
        name: agent.name,
      },
      assignments: inserted || [],
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      logger.warn('agent_prompts_post_validation_error', {
        operation: 'POST /api/agents/[id]/prompts',
        operationId,
        duration,
        errors: error.errors,
      });

      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    logger.error(
      'agent_prompts_post_unexpected_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'POST /api/agents/[id]/prompts',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/agents/[id]/prompts
 * Remove prompts from an agent
 */
export const DELETE = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const operationId = `agent_prompts_delete_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use user session client
    const supabase = await createClient();
    const { id: agentId } = await params;

    logger.info('agent_prompts_delete_started', {
      operation: 'DELETE /api/agents/[id]/prompts',
      operationId,
      agentId,
      userId: context.user.id,
    });

    // Verify agent exists
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      const duration = Date.now() - startTime;
      logger.warn('agent_prompts_delete_agent_not_found', {
        operation: 'DELETE /api/agents/[id]/prompts',
        operationId,
        agentId,
        duration,
      });

      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Parse request body (optional prompt_ids)
    let promptIds: string[] | undefined;
    try {
      const body = await request.json().catch(() => ({}));
      const validatedData = removePromptsSchema.parse(body);
      promptIds = validatedData.prompt_ids;
    } catch {
      // No body or invalid - will delete all
    }

    // Build delete query
    let deleteQuery = supabase
      .from('agent_prompts')
      .delete()
      .eq('agent_id', agentId);

    if (promptIds && promptIds.length > 0) {
      deleteQuery = deleteQuery.in('prompt_id', promptIds);
    }

    const { error } = await deleteQuery;

    if (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'agent_prompts_delete_error',
        new Error(error.message),
        {
          operation: 'DELETE /api/agents/[id]/prompts',
          operationId,
          agentId,
          duration,
          errorCode: error.code,
        }
      );

      return NextResponse.json(
        { error: 'Failed to remove prompts', details: error.message },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('agent_prompts_delete_completed', duration, {
      operation: 'DELETE /api/agents/[id]/prompts',
      operationId,
      agentId,
      removedSpecific: promptIds ? promptIds.length : 0,
      removedAll: !promptIds,
    });

    return NextResponse.json({
      success: true,
      message: promptIds
        ? `Removed ${promptIds.length} prompt(s) from agent`
        : 'Removed all prompts from agent',
      agent: {
        id: agent.id,
        name: agent.name,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      logger.warn('agent_prompts_delete_validation_error', {
        operation: 'DELETE /api/agents/[id]/prompts',
        operationId,
        duration,
        errors: error.errors,
      });

      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    logger.error(
      'agent_prompts_delete_unexpected_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'DELETE /api/agents/[id]/prompts',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

