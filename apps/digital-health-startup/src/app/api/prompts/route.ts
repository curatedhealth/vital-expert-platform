import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPromptAuth, type PromptPermissionContext } from '@/middleware/prompt-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { z } from 'zod';

// Validation schemas
const queryParamsSchema = z.object({
  domain: z.string().optional(),
  search: z.string().optional(),
  suite: z.string().optional(),
  userOnly: z.enum(['true', 'false']).optional(),
  userId: z.string().uuid().optional(),
});

const createPromptSchema = z.object({
  name: z.string().min(1).max(255),
  display_name: z.string().min(1).max(255),
  description: z.string().min(1),
  domain: z.string().min(1),
  system_prompt: z.string().min(1),
  user_prompt_template: z.string().min(1),
  category: z.string().optional(),
  complexity_level: z.enum(['simple', 'moderate', 'complex']).optional(),
  metadata: z.record(z.any()).optional(),
});

export const GET = withPromptAuth(async (
  request: NextRequest,
  context: PromptPermissionContext
) => {
  const logger = createLogger();
  const operationId = `prompts_get_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use user session client (RLS handles permissions)
    const supabase = await createClient();

    logger.info('prompts_get_started', {
      operation: 'GET /api/prompts',
      operationId,
      userId: context.user.id,
      tenantId: context.profile.tenant_id,
    });

    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryParams = queryParamsSchema.parse({
      domain: searchParams.get('domain') || undefined,
      search: searchParams.get('search') || undefined,
      suite: searchParams.get('suite') || undefined,
      userOnly: searchParams.get('userOnly') || undefined,
      userId: searchParams.get('userId') || undefined,
    });

    const suite = searchParams.get('suite');

    let query = supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (queryParams.domain && queryParams.domain !== 'all') {
      query = query.eq('domain', queryParams.domain);
    }

    if (queryParams.search) {
      query = query.or(
        `name.ilike.%${queryParams.search}%,display_name.ilike.%${queryParams.search}%,description.ilike.%${queryParams.search}%`
      );
    }

    if (queryParams.userOnly === 'true' && queryParams.userId) {
      query = query.eq('created_by', queryParams.userId);
    } else if (queryParams.userOnly === 'true') {
      // If userOnly is true but no userId, use context user ID
      query = query.eq('created_by', context.user.id);
    }

    const { data: prompts, error } = await query;

    if (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'prompts_get_error',
        new Error(error.message),
        {
          operation: 'GET /api/prompts',
          operationId,
          duration,
          errorCode: error.code,
        }
      );

      return NextResponse.json(
        { error: 'Failed to fetch prompts', details: error.message },
        { status: 500 }
      );
    }

    // Post-process to add derived fields
    const enrichedPrompts = (prompts || []).map(prompt => ({
      ...prompt,
      is_user_created: prompt.created_by !== null
    }));

    // Apply suite filter if specified
    const filteredPrompts = suite
      ? enrichedPrompts.filter((p: any) => p.suite === suite)
      : enrichedPrompts;

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('prompts_get_completed', duration, {
      operation: 'GET /api/prompts',
      operationId,
      count: filteredPrompts.length,
    });

    return NextResponse.json({
      success: true,
      prompts: filteredPrompts,
      count: filteredPrompts.length,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      logger.warn('prompts_get_validation_error', {
        operation: 'GET /api/prompts',
        operationId,
        duration,
        errors: error.errors,
      });

      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    logger.error(
      'prompts_get_unexpected_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/prompts',
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

export const POST = withPromptAuth(async (
  request: NextRequest,
  context: PromptPermissionContext
) => {
  const logger = createLogger();
  const operationId = `prompts_post_${Date.now()}`;
  const startTime = Date.now();

  try {
    // Use user session client
    const supabase = await createClient();

    logger.info('prompts_post_started', {
      operation: 'POST /api/prompts',
      operationId,
      userId: context.user.id,
      tenantId: context.profile.tenant_id,
    });

    const body = await request.json();

    // Validate input with Zod
    const validatedData = createPromptSchema.parse(body);

    // Check for duplicate name
    const { data: existingPrompt } = await supabase
      .from('prompts')
      .select('id')
      .eq('name', validatedData.name)
      .single();

    if (existingPrompt) {
      const duration = Date.now() - startTime;
      logger.warn('prompts_post_duplicate_name', {
        operation: 'POST /api/prompts',
        operationId,
        duration,
        name: validatedData.name,
      });

      return NextResponse.json(
        { error: 'Prompt with this name already exists' },
        { status: 409 }
      );
    }

    // Insert prompt with ownership
    const { data: prompt, error } = await supabase
      .from('prompts')
      .insert({
        name: validatedData.name,
        display_name: validatedData.display_name,
        description: validatedData.description,
        domain: validatedData.domain,
        system_prompt: validatedData.system_prompt,
        user_prompt_template: validatedData.user_prompt_template,
        category: validatedData.category,
        complexity_level: validatedData.complexity_level,
        metadata: validatedData.metadata || {},
        created_by: context.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      const duration = Date.now() - startTime;
      logger.error(
        'prompts_post_error',
        new Error(error.message),
        {
          operation: 'POST /api/prompts',
          operationId,
          duration,
          errorCode: error.code,
        }
      );

      return NextResponse.json(
        { error: 'Failed to create prompt', details: error.message },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.infoWithMetrics('prompts_post_completed', duration, {
      operation: 'POST /api/prompts',
      operationId,
      promptId: prompt.id,
    });

    return NextResponse.json(
      {
        success: true,
        prompt,
      },
      { status: 201 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      logger.warn('prompts_post_validation_error', {
        operation: 'POST /api/prompts',
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
      'prompts_post_unexpected_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'POST /api/prompts',
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