import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { env } from '@/config/environment';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { z } from 'zod';

// Validation schema for agent updates
const updateAgentSchema = z.object({
  display_name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  system_prompt: z.string().min(1).optional(),
  capabilities: z.array(z.string()).optional(),
  knowledge_domains: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  avatar: z.string().optional(),
  function_id: z.string().uuid().optional(),
  function_name: z.string().optional(),
  department_id: z.string().uuid().optional(),
  department_name: z.string().optional(),
  role_id: z.string().uuid().optional(),
  role_name: z.string().optional(),
}).passthrough(); // Allow additional fields

export const PUT = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const operationId = `agent_put_${Date.now()}`;
  const startTime = Date.now();
  
  try {
    // Use user session client (RLS will enforce permissions)
    const supabase = await createClient();
    const { id } = await params;
    
    logger.info('agent_put_started', {
      operation: 'PUT /api/agents/[id]',
      operationId,
      agentId: id,
      userId: context.user.id,
    });

    const updates = await request.json();
    
    // Validate input
    const validatedData = updateAgentSchema.parse(updates);
    
    // Get current agent to merge metadata properly
    const { data: currentAgent, error: fetchError } = await supabase
      .from('agents')
      .select('metadata, created_by, tenant_id, is_custom, is_library_agent')
      .eq('id', id)
      .single();

    if (fetchError || !currentAgent) {
      const duration = Date.now() - startTime;
      logger.warn('agent_put_not_found', {
        operation: 'PUT /api/agents/[id]',
        operationId,
        agentId: id,
        duration,
      });

      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Prepare update payload
    const updatePayload: any = {};
    
    // Handle display_name - store ONLY in metadata (not as direct column)
    if (validatedData.display_name !== undefined) {
      if (!updatePayload.metadata) {
        updatePayload.metadata = currentAgent.metadata || {};
      }
      updatePayload.metadata = {
        ...updatePayload.metadata,
        display_name: validatedData.display_name,
      };
    }

    // Handle avatar - store in metadata.avatar
    if (validatedData.avatar !== undefined) {
      if (!updatePayload.metadata) {
        updatePayload.metadata = currentAgent.metadata || {};
      }
      updatePayload.metadata = {
        ...updatePayload.metadata,
        avatar: validatedData.avatar,
      };
    }

    // Handle organizational structure fields - update both ID and name columns
    if (validatedData.function_id !== undefined) {
      updatePayload.function_id = validatedData.function_id;
    }
    if (validatedData.function_name !== undefined) {
      updatePayload.function_name = validatedData.function_name;
    }
    if (validatedData.department_id !== undefined) {
      updatePayload.department_id = validatedData.department_id;
    }
    if (validatedData.department_name !== undefined) {
      updatePayload.department_name = validatedData.department_name;
    }
    if (validatedData.role_id !== undefined) {
      updatePayload.role_id = validatedData.role_id;
    }
    if (validatedData.role_name !== undefined) {
      updatePayload.role_name = validatedData.role_name;
    }

    // Handle other direct column updates
    const metadataOnlyFields = ['display_name', 'avatar'];
    const orgFields = ['function_id', 'function_name', 'department_id', 'department_name', 'role_id', 'role_name'];
    Object.keys(validatedData).forEach((key) => {
      if (!metadataOnlyFields.includes(key) && !orgFields.includes(key) && key !== 'metadata') {
        updatePayload[key] = validatedData[key];
      }
    });

    // Handle metadata updates (merge)
    if (validatedData.metadata) {
      updatePayload.metadata = {
        ...(currentAgent.metadata || {}),
        ...validatedData.metadata,
      };
    }

    // Ensure updated_at is set
    updatePayload.updated_at = new Date().toISOString();
    
    logger.debug('agent_put_updating', {
      operation: 'PUT /api/agents/[id]',
      operationId,
      agentId: id,
      fields: Object.keys(updatePayload),
    });
    
    // Update using user session (RLS enforces permissions)
    const { data, error } = await supabase
      .from('agents')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'agent_put_failed',
        new Error(error.message),
        {
          operation: 'PUT /api/agents/[id]',
          operationId,
          agentId: id,
          duration,
          errorCode: error.code,
        }
      );

      let errorMessage = 'Failed to update agent';
      if (error.code === 'PGRST116') {
        errorMessage = 'Agent not found';
      } else if (error.code === '23505') {
        errorMessage = 'Agent name or display name already exists';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          code: error.code,
          details: error.details,
        },
        { status: 500 }
      );
    }

    // Normalize the returned agent data
    const metadata = data.metadata || {};
    const normalizedAgent = {
      ...data,
      display_name: metadata.display_name || data.display_name || data.name,
      avatar: metadata.avatar || data.avatar || data.avatar_url || '🤖',
    };

    // Sync updated agent to Pinecone for GraphRAG (fire and forget)
    try {
      const { agentEmbeddingService } = await import(
        '@/lib/services/agents/agent-embedding-service'
      );
      const { pineconeVectorService } = await import(
        '@/lib/services/vectorstore/pinecone-vector-service'
      );

      const embeddingData = await agentEmbeddingService.generateAgentEmbedding(normalizedAgent);
      await pineconeVectorService.syncAgentToPinecone({
        agentId: embeddingData.agentId,
        embedding: embeddingData.embedding,
        metadata: embeddingData.metadata,
      });

      await agentEmbeddingService.storeAgentEmbeddingInSupabase(
        embeddingData.agentId,
        embeddingData.embedding,
        embeddingData.embeddingType,
        embeddingData.text
      );

      logger.debug('agent_put_pinecone_synced', {
        operation: 'PUT /api/agents/[id]',
        operationId,
        agentId: id,
      });
    } catch (error) {
      logger.warn('agent_put_pinecone_failed', {
        operation: 'PUT /api/agents/[id]',
        operationId,
        agentId: id,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('agent_put_completed', duration, {
      operation: 'PUT /api/agents/[id]',
      operationId,
      agentId: id,
    });

    return NextResponse.json({
      success: true,
      agent: normalizedAgent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const duration = Date.now() - startTime;
      logger.warn('agent_put_validation_failed', {
        operation: 'PUT /api/agents/[id]',
        operationId,
        duration,
        errors: error.errors,
      });

      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    const duration = Date.now() - startTime;
    logger.error(
      'agent_put_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'PUT /api/agents/[id]',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
});

export const DELETE = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const operationId = `agent_delete_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use user session client (RLS will enforce permissions)
    const supabase = await createClient();
    const { id } = await params;

    logger.info('agent_delete_started', {
      operation: 'DELETE /api/agents/[id]',
      operationId,
      agentId: id,
      userId: context.user.id,
    });

    // Check if agent exists (RLS will filter if user doesn't have access)
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('id, name, metadata, tenant_id')
      .eq('id', id)
      .single();

    if (fetchError || !agent) {
      const duration = Date.now() - startTime;
      logger.warn('agent_delete_not_found', {
        operation: 'DELETE /api/agents/[id]',
        operationId,
        agentId: id,
        duration,
      });

      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Soft delete by default (set is_active = false)
    // For hard delete, we'd need service role, but permissions already checked by middleware
    const { error: deleteError } = await supabase
      .from('agents')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (deleteError) {
      const duration = Date.now() - startTime;
      logger.error(
        'agent_delete_failed',
        new Error(deleteError.message),
        {
          operation: 'DELETE /api/agents/[id]',
          operationId,
          agentId: id,
          duration,
          errorCode: deleteError.code,
        }
      );

      let errorMessage = 'Failed to delete agent';
      if (deleteError.code === '23503') {
        errorMessage =
          'Cannot delete agent: it is referenced by other records. Please remove these references first.';
      } else if (deleteError.message) {
        errorMessage = `Failed to delete agent: ${deleteError.message}`;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          code: deleteError.code,
          details: deleteError.details,
        },
        { status: 500 }
      );
    }

    // Delete agent from Pinecone (fire and forget)
    try {
      const { pineconeVectorService } = await import(
        '@/lib/services/vectorstore/pinecone-vector-service'
      );
      await pineconeVectorService.deleteAgentFromPinecone(id);

      logger.debug('agent_delete_pinecone_deleted', {
        operation: 'DELETE /api/agents/[id]',
        operationId,
        agentId: id,
      });
    } catch (error) {
      logger.warn('agent_delete_pinecone_failed', {
        operation: 'DELETE /api/agents/[id]',
        operationId,
        agentId: id,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('agent_delete_completed', duration, {
      operation: 'DELETE /api/agents/[id]',
      operationId,
      agentId: id,
    });

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'agent_delete_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'DELETE /api/agents/[id]',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      {
        error: 'Failed to process delete request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});

export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const operationId = `agent_get_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use user session client (RLS will enforce tenant filtering)
    const supabase = await createClient();
    const { id } = await params;

    logger.info('agent_get_started', {
      operation: 'GET /api/agents/[id]',
      operationId,
      agentId: id,
      userId: context.user.id,
    });

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      const duration = Date.now() - startTime;
      logger.warn('agent_get_not_found', {
        operation: 'GET /api/agents/[id]',
        operationId,
        agentId: id,
        duration,
        errorCode: error.code,
      });

      return NextResponse.json(
        { error: 'Agent not found', details: error.message },
        { status: 404 }
      );
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('agent_get_completed', duration, {
      operation: 'GET /api/agents/[id]',
      operationId,
      agentId: id,
    });

    return NextResponse.json({
      success: true,
      agent: data,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'agent_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/agents/[id]',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
});