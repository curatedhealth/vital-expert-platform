import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPromptAuth, type PromptPermissionContext } from '@/middleware/prompt-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { z } from 'zod';

// Validation schemas
const updatePromptSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  display_name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  domain: z.string().min(1).optional(),
  system_prompt: z.string().min(1).optional(),
  user_prompt_template: z.string().min(1).optional(),
  category: z.string().optional(),
  complexity_level: z.enum(['simple', 'moderate', 'complex']).optional(),
  metadata: z.record(z.any()).optional(),
}).passthrough(); // Allow additional fields

export const GET = withPromptAuth(async (
  request: NextRequest,
  context: PromptPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const operationId = `prompt_get_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use user session client
    const supabase = await createClient();
    const { id } = await params;

    logger.info('prompt_get_started', {
      operation: 'GET /api/prompts/[id]',
      operationId,
      promptId: id,
      userId: context.user.id,
    });

    const { data: prompt, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !prompt) {
      const duration = Date.now() - startTime;
      logger.warn('prompt_get_not_found', {
        operation: 'GET /api/prompts/[id]',
        operationId,
        promptId: id,
        duration,
        errorCode: error?.code,
      });

      return NextResponse.json(
        { error: 'Prompt not found', details: error?.message },
        { status: 404 }
      );
    }

    // Enrich with derived fields (backward compatibility)
    const acronym = (prompt as any).acronym || '';
    let suite = '';

    if (acronym) {
      if (['DRAFT', 'RADAR', 'REPLY', 'GUIDE'].includes(acronym)) suite = 'RULES™';
      else if (['DESIGN', 'QUALIFY', 'MONITOR', 'ENROLL'].includes(acronym)) suite = 'TRIALS™';
      else if (['DETECT', 'ASSESS', 'REPORT', 'SIGNAL'].includes(acronym)) suite = 'GUARD™';
      else if (['WORTH', 'PITCH', 'JUSTIFY', 'BUDGET'].includes(acronym)) suite = 'VALUE™';
      else if (['CONNECT', 'RESPOND', 'EDUCATE', 'ALIGN'].includes(acronym)) suite = 'BRIDGE™';
      else if (['STUDY', 'COMPARE', 'ANALYZE', 'PUBLISH'].includes(acronym)) suite = 'PROOF™';
      else if (['WRITE', 'PLAN', 'REVIEW', 'STYLE'].includes(acronym)) suite = 'CRAFT™';
      else if (['WATCH', 'TRACK', 'ASSESS', 'BRIEF'].includes(acronym)) suite = 'SCOUT™';
    }

    const enrichedPrompt = {
      ...prompt,
      acronym,
      suite,
      is_user_created: prompt.created_by !== null,
    };

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('prompt_get_completed', duration, {
      operation: 'GET /api/prompts/[id]',
      operationId,
      promptId: id,
    });

    return NextResponse.json({
      success: true,
      prompt: enrichedPrompt,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'prompt_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/prompts/[id]',
        operationId,
        duration,
      }
    );

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
});

export const PUT = withPromptAuth(async (
  request: NextRequest,
  context: PromptPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const operationId = `prompt_put_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use user session client
    const supabase = await createClient();
    const { id } = await params;

    logger.info('prompt_put_started', {
      operation: 'PUT /api/prompts/[id]',
      operationId,
      promptId: id,
      userId: context.user.id,
    });

    const body = await request.json();

    // Validate input
    const validatedData = updatePromptSchema.parse(body);

    // Check if prompt exists
    const { data: currentPrompt, error: fetchError } = await supabase
      .from('prompts')
      .select('id, created_by, name')
      .eq('id', id)
      .single();

    if (fetchError || !currentPrompt) {
      const duration = Date.now() - startTime;
      logger.warn('prompt_put_not_found', {
        operation: 'PUT /api/prompts/[id]',
        operationId,
        promptId: id,
        duration,
      });

      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // If name is being updated, check for duplicates
    if (validatedData.name && validatedData.name !== currentPrompt.name) {
      const { data: duplicatePrompt } = await supabase
        .from('prompts')
        .select('id')
        .eq('name', validatedData.name)
        .neq('id', id)
        .single();

      if (duplicatePrompt) {
        const duration = Date.now() - startTime;
        logger.warn('prompt_put_duplicate_name', {
          operation: 'PUT /api/prompts/[id]',
          operationId,
          promptId: id,
          duration,
          name: validatedData.name,
        });

        return NextResponse.json(
          { error: 'Prompt with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update payload
    const updatePayload: any = {};

    if (validatedData.name !== undefined) updatePayload.name = validatedData.name;
    if (validatedData.display_name !== undefined) updatePayload.display_name = validatedData.display_name;
    if (validatedData.description !== undefined) updatePayload.description = validatedData.description;
    if (validatedData.domain !== undefined) updatePayload.domain = validatedData.domain;
    if (validatedData.system_prompt !== undefined) updatePayload.system_prompt = validatedData.system_prompt;
    if (validatedData.user_prompt_template !== undefined) updatePayload.user_prompt_template = validatedData.user_prompt_template;
    if (validatedData.category !== undefined) updatePayload.category = validatedData.category;
    if (validatedData.complexity_level !== undefined) updatePayload.complexity_level = validatedData.complexity_level;
    if (validatedData.metadata !== undefined) updatePayload.metadata = validatedData.metadata;

    updatePayload.updated_at = new Date().toISOString();

    const { data: prompt, error } = await supabase
      .from('prompts')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'prompt_put_error',
        new Error(error.message),
        {
          operation: 'PUT /api/prompts/[id]',
          operationId,
          promptId: id,
          duration,
          errorCode: error.code,
        }
      );

      return NextResponse.json(
        { error: 'Failed to update prompt', details: error.message },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('prompt_put_completed', duration, {
      operation: 'PUT /api/prompts/[id]',
      operationId,
      promptId: id,
    });

    return NextResponse.json({
      success: true,
      prompt,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      logger.warn('prompt_put_validation_error', {
        operation: 'PUT /api/prompts/[id]',
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
      'prompt_put_unexpected_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'PUT /api/prompts/[id]',
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

export const DELETE = withPromptAuth(async (
  request: NextRequest,
  context: PromptPermissionContext,
  { params }: { params: Promise<{ id: string }> }
) => {
  const logger = createLogger();
  const operationId = `prompt_delete_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use user session client
    const supabase = await createClient();
    const { id } = await params;

    logger.info('prompt_delete_started', {
      operation: 'DELETE /api/prompts/[id]',
      operationId,
      promptId: id,
      userId: context.user.id,
    });

    // Check if prompt exists
    const { data: prompt, error: fetchError } = await supabase
      .from('prompts')
      .select('id, name, created_by')
      .eq('id', id)
      .single();

    if (fetchError || !prompt) {
      const duration = Date.now() - startTime;
      logger.warn('prompt_delete_not_found', {
        operation: 'DELETE /api/prompts/[id]',
        operationId,
        promptId: id,
        duration,
      });

      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Delete associated agent-prompt mappings first (if they exist)
    const { error: mappingError } = await supabase
      .from('agent_prompts')
      .delete()
      .eq('prompt_id', id);

    if (mappingError) {
      logger.warn('prompt_delete_mapping_error', {
        operation: 'DELETE /api/prompts/[id]',
        operationId,
        promptId: id,
        mappingError: mappingError.message,
      });
      // Continue with prompt deletion even if mappings fail
    }

    // Delete the prompt
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'prompt_delete_error',
        new Error(error.message),
        {
          operation: 'DELETE /api/prompts/[id]',
          operationId,
          promptId: id,
          duration,
          errorCode: error.code,
        }
      );

      return NextResponse.json(
        { error: 'Failed to delete prompt', details: error.message },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('prompt_delete_completed', duration, {
      operation: 'DELETE /api/prompts/[id]',
      operationId,
      promptId: id,
    });

    return NextResponse.json({
      success: true,
      message: `Prompt "${prompt.name}" deleted successfully`,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'prompt_delete_unexpected_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'DELETE /api/prompts/[id]',
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
