import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { env } from '@/config/environment';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { z } from 'zod';

// Helper to validate optional UUID (allows empty string, null, undefined, or valid UUID)
const optionalUuid = z.string()
  .transform(val => val === '' ? null : val) // Transform empty string to null
  .nullable()
  .optional()
  .refine(val => val === null || val === undefined || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), {
    message: 'Invalid uuid'
  });

// Map TypeScript expertise_level values to database enum values
// DB enum values: 'beginner', 'intermediate', 'advanced', 'expert'
// TypeScript values: 'entry', 'mid', 'senior', 'expert', 'thought_leader'
const EXPERTISE_LEVEL_MAPPING: Record<string, string> = {
  'entry': 'beginner',
  'mid': 'intermediate',
  'senior': 'advanced',
  'expert': 'expert',
  'thought_leader': 'expert',
  // Pass through valid DB values
  'beginner': 'beginner',
  'intermediate': 'intermediate',
  'advanced': 'advanced',
};

// Validation schema for agent updates - permissive to allow form flexibility
const updateAgentSchema = z.object({
  display_name: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(), // Removed max limit - some agents have long descriptions
  system_prompt: z.string().optional().nullable(), // Allow empty system prompt
  capabilities: z.array(z.string()).optional().nullable(),
  knowledge_domains: z.array(z.string()).optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
  avatar: z.string().optional().nullable(),
  function_id: optionalUuid,
  function_name: z.string().optional().nullable(),
  department_id: optionalUuid,
  department_name: z.string().optional().nullable(),
  role_id: optionalUuid,
  role_name: z.string().optional().nullable(),
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
    // Use service client for initial fetch (auth already verified by middleware)
    // This bypasses RLS for the SELECT, but we still use user session for UPDATE
    const serviceSupabase = getServiceSupabaseClient();
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

    // Get current agent to merge metadata properly (use service client to bypass RLS)
    // Note: is_custom and is_library_agent columns don't exist in the schema
    const { data: currentAgent, error: fetchError } = await serviceSupabase
      .from('agents')
      .select('metadata, created_by, tenant_id')
      .eq('id', id)
      .single();

    if (fetchError || !currentAgent) {
      const duration = Date.now() - startTime;
      logger.warn('agent_put_not_found', {
        operation: 'PUT /api/agents/[id]',
        operationId,
        agentId: id,
        duration,
        error: fetchError?.message,
      });

      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Prepare update payload
    const updatePayload: Record<string, unknown> = {};
    let metadataUpdate: Record<string, unknown> = {};

    // Handle display_name - store ONLY in metadata (not as direct column)
    if (validatedData.display_name !== undefined) {
      metadataUpdate = {
        ...(currentAgent.metadata as Record<string, unknown> || {}),
        ...metadataUpdate,
        display_name: validatedData.display_name,
      };
    }

    // Handle avatar - store in metadata.avatar
    if (validatedData.avatar !== undefined) {
      metadataUpdate = {
        ...(currentAgent.metadata as Record<string, unknown> || {}),
        ...metadataUpdate,
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

    // Define valid database columns (based on actual agents table schema)
    const validDbColumns = new Set([
      'name', 'slug', 'tagline', 'description', 'title',
      'role_id', 'function_id', 'department_id',
      'function_name', 'department_name', 'role_name',
      'expertise_level', 'years_of_experience',
      'avatar_url', 'avatar_description',
      'system_prompt', 'base_model', 'temperature', 'max_tokens',
      'communication_style', 'status', 'validation_status',
      'metadata', 'persona_id', 'agent_level_id',
      'documentation_path', 'documentation_url',
      'system_prompt_template_id', 'system_prompt_override', 'prompt_variables',
      'is_private_to_user', 'is_public', 'is_shared',
      'context_window', 'cost_per_query',
      'token_budget_min', 'token_budget_max', 'token_budget_recommended',
      'hipaa_compliant', 'audit_trail_enabled',
      'personality_type_id',
    ]);

    // Fields to store in metadata (not direct DB columns)
    const metadataOnlyFields = new Set([
      'display_name', 'avatar', 'id',
      'capabilities', 'knowledge_domains', 'tier', 'priority',
      'rag_enabled', 'implementation_phase', 'is_custom', 'is_library_agent',
      'color', 'model', // model gets mapped to base_model
      // Personality & communication sliders (store in metadata)
      'personality_type', 'personality_formality', 'personality_empathy',
      'personality_directness', 'personality_detail_orientation',
      'personality_proactivity', 'personality_risk_tolerance',
      'comm_verbosity', 'comm_technical_level', 'comm_warmth',
      // Other form fields
      'prompt_starters', 'tools', 'skills', 'model_justification', 'model_citation',
      'success_criteria', 'escalation_protocol', 'integration_endpoints',
      'example_interactions', 'data_sources', 'compliance_requirements',
    ]);

    // Field mappings (form field name -> DB column name)
    const fieldMappings: Record<string, string> = {
      'model': 'base_model',
      'avatar': 'avatar_url', // Also store in metadata for backwards compat
    };

    // Process all validated fields
    const extraMetadata: Record<string, unknown> = {};

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value === undefined) return;
      if (key === 'metadata') return; // Handle separately

      // Check if it's a metadata-only field
      if (metadataOnlyFields.has(key)) {
        extraMetadata[key] = value;
        return;
      }

      // Check if it needs to be mapped to a different column name
      const mappedKey = fieldMappings[key] || key;

      // Only include if it's a valid DB column
      if (validDbColumns.has(mappedKey)) {
        updatePayload[mappedKey] = value;
      } else {
        // Unknown field - store in metadata
        extraMetadata[key] = value;
      }
    });

    // Handle model -> base_model mapping explicitly (since 'model' is common)
    if ('model' in validatedData && validatedData.model) {
      updatePayload.base_model = validatedData.model;
    }

    // Handle metadata updates (merge all: current, user-provided, metadataUpdate, and extra fields)
    updatePayload.metadata = {
      ...(currentAgent.metadata as Record<string, unknown> || {}),
      ...(validatedData.metadata || {}),
      ...metadataUpdate,
      ...extraMetadata,
    };

    // Ensure updated_at is set
    updatePayload.updated_at = new Date().toISOString();

    // Sanitize UUID fields - convert empty strings to null
    const uuidFields = [
      'function_id', 'department_id', 'role_id', 'persona_id',
      'agent_level_id', 'system_prompt_template_id', 'personality_type_id',
      'persona_archetype_id', 'communication_style_id', 'reports_to_agent_id'
    ];
    for (const field of uuidFields) {
      if (field in updatePayload && updatePayload[field] === '') {
        updatePayload[field] = null;
      }
    }

    // Map expertise_level to valid database enum values
    // TypeScript uses: 'entry', 'mid', 'senior', 'expert', 'thought_leader'
    // Database enum has: 'beginner', 'intermediate', 'advanced', 'expert'
    if ('expertise_level' in updatePayload && updatePayload.expertise_level) {
      const expertiseLevel = updatePayload.expertise_level as string;
      const mappedLevel = EXPERTISE_LEVEL_MAPPING[expertiseLevel];
      if (mappedLevel) {
        updatePayload.expertise_level = mappedLevel;
      } else {
        // If not in mapping, store original value in metadata and set to null in DB
        logger.warn('agent_put_unknown_expertise_level', {
          operation: 'PUT /api/agents/[id]',
          operationId,
          originalValue: updatePayload.expertise_level,
        });
        updatePayload.metadata = {
          ...(updatePayload.metadata as Record<string, unknown> || {}),
          original_expertise_level: updatePayload.expertise_level,
        };
        updatePayload.expertise_level = null;
      }
    }

    // Log the final payload for debugging
    logger.debug('agent_put_payload_prepared', {
      operation: 'PUT /api/agents/[id]',
      operationId,
      agentId: id,
      payloadFields: Object.keys(updatePayload),
      metadataFields: Object.keys(updatePayload.metadata || {}),
      extraMetadataFields: Object.keys(extraMetadata),
    });
    
    logger.debug('agent_put_updating', {
      operation: 'PUT /api/agents/[id]',
      operationId,
      agentId: id,
      fields: Object.keys(updatePayload),
    });
    
    // Update using service client (auth already verified by middleware)
    const { data, error } = await serviceSupabase
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
      if (pineconeVectorService) {
        await pineconeVectorService.syncAgentToPinecone({
          agentId: embeddingData.agentId,
          embedding: embeddingData.embedding,
          metadata: embeddingData.metadata,
        });
      }

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
    // Use service client (auth already verified by middleware)
    const serviceSupabase = getServiceSupabaseClient();
    const { id } = await params;

    logger.info('agent_delete_started', {
      operation: 'DELETE /api/agents/[id]',
      operationId,
      agentId: id,
      userId: context.user.id,
    });

    // Check if agent exists (use service client to bypass RLS)
    const { data: agent, error: fetchError } = await serviceSupabase
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
    const { error: deleteError } = await serviceSupabase
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
      if (pineconeVectorService) {
        await pineconeVectorService.deleteAgentFromPinecone(id);
        logger.debug('agent_delete_pinecone_deleted', {
          operation: 'DELETE /api/agents/[id]',
          operationId,
          agentId: id,
        });
      }
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
    // Use service client (auth already verified by middleware)
    const serviceSupabase = getServiceSupabaseClient();
    const { id } = await params;

    logger.info('agent_get_started', {
      operation: 'GET /api/agents/[id]',
      operationId,
      agentId: id,
      userId: context.user.id,
    });

    const { data, error } = await serviceSupabase
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